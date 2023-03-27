import { ChildProcess, spawn } from "child_process";
import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  dialog,
  Menu,
  MenuItem,
  MessageChannelMain,
  MessagePortMain,
  nativeTheme,
  powerMonitor,
  shell
} from "electron";
import fs from "fs";
import jsonfile from "jsonfile";
import net from "net";
import os from "os";
import path from "path";
import { Client } from "ssh2";
import ExportOptions from "../shared/ExportOptions";
import { FRCData } from "../shared/FRCData";
import { HubState } from "../shared/HubState";
import NamedMessage from "../shared/NamedMessage";
import Preferences from "../shared/Preferences";
import TabType, { getAllTabTypes, getDefaultTabTitle, getTabIcon } from "../shared/TabType";
import { UnitConversionPreset } from "../shared/units";
import { createUUID, jsonCopy } from "../shared/util";
import {
  DEFAULT_PREFS,
  DOWNLOAD_CONNECT_TIMEOUT_MS,
  DOWNLOAD_PASSWORD,
  DOWNLOAD_REFRESH_INTERVAL_MS,
  DOWNLOAD_RETRY_DELAY_MS,
  DOWNLOAD_USERNAME,
  EXTRA_FRC_DATA,
  LAST_OPEN_FILE,
  PREFS_FILENAME,
  REPOSITORY,
  RLOG_CONNECT_TIMEOUT_MS,
  RLOG_DATA_TIMEOUT_MS,
  RLOG_HEARTBEAT_DATA,
  RLOG_HEARTBEAT_DELAY_MS,
  VIDEO_CACHE,
  WINDOW_ICON
} from "./Constants";
import { createExtraFRCDataFolder, loadFRCData } from "./frcDataUtil";
import StateTracker from "./StateTracker";
import UpdateChecker from "./UpdateChecker";
import videoExtensions from "./videoExtensions";

// Global variables
let hubWindows: BrowserWindow[] = []; // Ordered by last focus time (recent first)
let downloadWindow: BrowserWindow | null = null;
let prefsWindow: BrowserWindow | null = null;
let satelliteWindows: { [id: string]: BrowserWindow[] } = {};
let windowPorts: { [id: number]: MessagePortMain } = {};

let hubStateTracker = new StateTracker();
let updateChecker = new UpdateChecker();
let usingUsb = false; // Menu bar setting, bundled with other prefs for renderers
let firstOpenPath: string | null = null; // Cache path to open immediately
let videoProcesses: { [id: string]: ChildProcess } = {}; // Key is tab UUID
let videoFolderUUIDs: string[] = [];
let frcData: FRCData = {
  field2ds: [],
  field3ds: [],
  robots: [],
  joysticks: []
};

// Live RLOG variables
let rlogSockets: { [id: number]: net.Socket } = {};
let rlogSocketTimeouts: { [id: number]: NodeJS.Timeout } = {};
let rlogDataArrays: { [id: number]: Uint8Array } = {};

// Download variables
let downloadClient: Client | null = null;
let downloadRetryTimeout: NodeJS.Timeout | null = null;
let downloadRefreshInterval: NodeJS.Timer | null = null;
let downloadAddress: string = "";
let downloadPath: string = "";
let downloadFileSizeCache: { [id: string]: number } = {};

// WINDOW MESSAGE HANDLING

/**
 * Sends a message to a single window.
 * @param window The window target
 * @param name The name of the message
 * @param data Arbitrary data to include
 * @returns Whether the operation was successful
 */
function sendMessage(window: BrowserWindow, name: string, data?: any): boolean {
  try {
    windowPorts[window.id].postMessage({ name: name, data: data });
  } catch (e) {
    return false;
  }
  return true;
}

/** Sends the current preferences to all windows (including USB menu bar setting) */
function sendAllPreferences() {
  let data: Preferences = jsonfile.readFileSync(PREFS_FILENAME);
  data.usb = usingUsb;
  nativeTheme.themeSource = data.theme;
  hubWindows.forEach((window) => {
    if (!window.isDestroyed()) {
      sendMessage(window, "set-preferences", data);
    }
  });
  Object.values(satelliteWindows).forEach((satelliteArray) => {
    satelliteArray.forEach((satellite) => {
      if (!satellite.isDestroyed()) {
        sendMessage(satellite, "set-preferences", data);
      }
    });
  });
  if (downloadWindow != null && !downloadWindow.isDestroyed()) sendMessage(downloadWindow, "set-preferences", data);
}

/**
 * Process a message from a hub window.
 * @param window The source hub window
 * @param message The received message
 */
function handleHubMessage(window: BrowserWindow, message: NamedMessage) {
  if (window.isDestroyed()) return;
  let windowId = window.id;
  switch (message.name) {
    case "alert":
      dialog.showMessageBox(window, {
        type: "info",
        title: "Alert",
        message: message.data.title,
        detail: message.data.content,
        icon: WINDOW_ICON
      });
      break;

    case "error":
      dialog.showMessageBox(window, {
        type: "error",
        title: "Error",
        message: message.data.title,
        detail: message.data.content,
        icon: WINDOW_ICON
      });
      break;

    case "save-state":
      hubStateTracker.saveRendererState(window, message.data);
      break;

    case "prompt-update":
      updateChecker.showPrompt();
      break;

    case "historical-start":
      // Record opened files
      let paths: string[] = message.data;
      paths.forEach((path) => app.addRecentDocument(path));
      fs.writeFile(LAST_OPEN_FILE, paths[0], () => {});

      // Read data from file
      let completedCount = 0;
      let results: (Buffer | null)[] = paths.map(() => null);
      paths.forEach((path, index) => {
        fs.open(path, "r", (error, file) => {
          if (error) {
            completedCount++;
            if (completedCount == paths.length) {
              sendMessage(window, "historical-data", results);
            }
            return;
          }
          fs.readFile(file, (error, buffer) => {
            completedCount++;
            if (!error) {
              results[index] = buffer;
            }
            if (completedCount == paths.length) {
              sendMessage(window, "historical-data", results);
            }
          });
        });
      });
      break;

    case "live-rlog-start":
      rlogSockets[windowId]?.destroy();
      rlogSockets[windowId] = net.createConnection({
        host: message.data.address,
        port: message.data.port
      });

      rlogSockets[windowId].setTimeout(RLOG_CONNECT_TIMEOUT_MS, () => {
        sendMessage(window, "live-rlog-data", { uuid: message.data.uuid, status: false });
      });

      let appendArray = (newArray: Uint8Array) => {
        let fullArray = new Uint8Array(rlogDataArrays[windowId].length + newArray.length);
        fullArray.set(rlogDataArrays[windowId]);
        fullArray.set(newArray, rlogDataArrays[windowId].length);
        rlogDataArrays[windowId] = fullArray;
      };

      rlogDataArrays[windowId] = new Uint8Array();
      rlogSockets[windowId].on("data", (data) => {
        appendArray(data);
        if (rlogSocketTimeouts[windowId] != null) clearTimeout(rlogSocketTimeouts[windowId]);
        rlogSocketTimeouts[windowId] = setTimeout(() => {
          rlogSockets[windowId]?.destroy();
        }, RLOG_DATA_TIMEOUT_MS);

        while (true) {
          let expectedLength;
          if (rlogDataArrays[windowId].length < 4) {
            break;
          } else {
            expectedLength = new DataView(rlogDataArrays[windowId].buffer).getInt32(0) + 4;
            if (rlogDataArrays[windowId].length < expectedLength) {
              break;
            }
          }

          let singleArray = rlogDataArrays[windowId].slice(4, expectedLength);
          rlogDataArrays[windowId] = rlogDataArrays[windowId].slice(expectedLength);

          let success = sendMessage(window, "live-rlog-data", {
            uuid: message.data.uuid,
            success: true,
            raw: new Uint8Array(singleArray)
          });
          if (!success) {
            rlogSockets[windowId]?.destroy();
          }
        }
      });

      rlogSockets[windowId].on("error", () => {
        sendMessage(window, "live-rlog-data", { uuid: message.data.uuid, success: false });
      });

      rlogSockets[windowId].on("close", () => {
        sendMessage(window, "live-rlog-data", { uuid: message.data.uuid, success: false });
      });
      break;

    case "live-rlog-stop":
      rlogSockets[windowId]?.destroy();
      break;

    case "open-link":
      shell.openExternal(message.data);
      break;

    case "ask-playback-speed":
      const playbackSpeedMenu = new Menu();
      Array(0.25, 0.5, 1, 1.5, 2, 4, 8).forEach((value) => {
        playbackSpeedMenu.append(
          new MenuItem({
            label: (value * 100).toString() + "%",
            type: "checkbox",
            checked: value == message.data.speed,
            click() {
              sendMessage(window, "set-playback-speed", value);
            }
          })
        );
      });
      playbackSpeedMenu.popup({
        window: window,
        x: message.data.x,
        y: message.data.y
      });
      break;

    case "ask-new-tab":
      newTabPopup(window);
      break;

    case "ask-edit-axis":
      let legend: string = message.data.legend;
      const editAxisMenu = new Menu();

      // Left and right controls
      if (legend != "discrete") {
        let lockedRange: [number, number] | null = message.data.lockedRange;
        let unitConversion: UnitConversionPreset = message.data.unitConversion;

        editAxisMenu.append(
          new MenuItem({
            label: "Lock Axis",
            type: "checkbox",
            checked: lockedRange != null,
            click() {
              sendMessage(window, "edit-axis", {
                legend: legend,
                lockedRange: lockedRange == null ? [null, null] : null,
                unitConversion: unitConversion
              });
            }
          })
        );
        editAxisMenu.append(
          new MenuItem({
            label: "Edit Range...",
            enabled: lockedRange != null,
            click() {
              createEditRangeWindow(window, lockedRange as [number, number], (newLockedRange) => {
                sendMessage(window, "edit-axis", {
                  legend: legend,
                  lockedRange: newLockedRange,
                  unitConversion: unitConversion
                });
              });
            }
          })
        );
        editAxisMenu.append(
          new MenuItem({
            type: "separator"
          })
        );
        editAxisMenu.append(
          new MenuItem({
            label: "Unit Conversion...",
            click() {
              createUnitConversionWindow(window, unitConversion, (newUnitConversion) => {
                sendMessage(window, "edit-axis", {
                  legend: legend,
                  lockedRange: lockedRange,
                  unitConversion: newUnitConversion
                });
              });
            }
          })
        );
      }

      // Always include clear button
      editAxisMenu.append(
        new MenuItem({
          label: "Clear All",
          click() {
            sendMessage(window, "clear-axis", legend);
          }
        })
      );
      editAxisMenu.popup({
        window: window,
        x: message.data.x,
        y: message.data.y
      });
      break;

    case "ask-rename-tab":
      const renameTabMenu = new Menu();
      renameTabMenu.append(
        new MenuItem({
          label: "Rename...",
          click() {
            createRenameTabWindow(window, message.data.name, (newName) => {
              sendMessage(window, "rename-tab", {
                index: message.data.index,
                name: newName
              });
            });
          }
        })
      );
      renameTabMenu.popup({
        window: window
      });
      break;

    case "create-satellite":
      createSatellite(window, message.data.uuid, message.data.type);
      break;

    case "update-satellite":
      let uuid = message.data.uuid;
      let command = message.data.command;
      let title = message.data.title;
      if (uuid in satelliteWindows) {
        satelliteWindows[uuid].forEach((satellite) => {
          if (satellite.isVisible()) {
            sendMessage(satellite, "render", { command: command, title: title });
          }
        });
      }
      break;

    case "ask-3d-camera":
      select3DCameraPopup(window, message.data.options, message.data.selectedIndex);
      break;

    case "prompt-export":
      if (message.data.incompleteWarning) {
        dialog
          .showMessageBox(window, {
            type: "info",
            title: "Warning",
            message: "Incomplete data for export",
            detail:
              'Some fields will not be available in the exported data. To save all fields from the server, the "Logging" live mode must be selected. Check the AdvantageScope documentation for details.',
            buttons: ["Continue", "Cancel"],
            icon: WINDOW_ICON
          })
          .then((value) => {
            if (value.response == 0) {
              createExportWindow(window, message.data.path);
            }
          });
      } else {
        createExportWindow(window, message.data.path);
      }
      break;

    case "write-export":
      fs.writeFile(message.data.path, message.data.content, (err) => {
        if (err) throw err;
        else {
          sendMessage(window, "finish-export");
        }
      });
      break;

    case "select-video":
      dialog
        .showOpenDialog(window, {
          title: "Select a video to open",
          properties: ["openFile"],
          filters: [{ name: "Videos", extensions: videoExtensions }]
        })
        .then((result) => {
          if (result.filePaths.length > 0) {
            let videoPath = result.filePaths[0];
            let uuid = message.data;

            // Send name
            sendMessage(window, "video-data", {
              uuid: uuid,
              path: videoPath
            });

            // Create cache folder
            let folderUUID = createUUID();
            videoFolderUUIDs.push(folderUUID);
            let cachePath = path.join(VIDEO_CACHE, folderUUID) + path.sep;
            if (fs.existsSync(cachePath)) {
              fs.rmSync(cachePath, { recursive: true });
            }
            fs.mkdirSync(cachePath, { recursive: true });

            // Find ffmpeg path
            let platformString = "";
            switch (process.platform) {
              case "darwin":
                platformString = "mac";
                break;
              case "linux":
                platformString = "linux";
                break;
              case "win32":
                platformString = "win";
                break;
            }
            let ffmpegPath: string;
            if (app.isPackaged) {
              ffmpegPath = path.join(__dirname, "..", "..", "ffmpeg-" + platformString + "-" + process.arch);
            } else {
              ffmpegPath = path.join(__dirname, "..", "ffmpeg", "ffmpeg-" + platformString + "-" + process.arch);
            }

            // Start ffmpeg
            if (uuid in videoProcesses) videoProcesses[uuid].kill();
            let ffmpeg = spawn(ffmpegPath, ["-i", videoPath, "-q:v", "2", path.join(cachePath, "%08d.jpg")]);
            videoProcesses[uuid] = ffmpeg;
            let running = true;
            let fullOutput = "";
            let fps = 0;
            let durationSecs = 0;
            let completedFrames = 0;

            // Send error message and exit
            let sendError = () => {
              running = false;
              ffmpeg.kill();
              dialog.showMessageBox(window, {
                type: "error",
                title: "Error",
                message: "Failed to open video",
                detail: "There was a problem while reading the video file. Please try again.",
                icon: WINDOW_ICON
              });
              console.log("*** START FFMPEG OUTPUT ***");
              console.log(fullOutput);
              console.log("*** END FFMPEG OUTPUT ***");
            };

            // New data, get status
            ffmpeg.stderr.on("data", (data: Buffer) => {
              if (!running) return;
              let text = data.toString();
              fullOutput += text;
              if (text.includes(" fps, ")) {
                // Get FPS
                let fpsIndex = text.lastIndexOf(" fps, ");
                let fpsStartIndex = text.lastIndexOf(" ", fpsIndex - 1);
                fps = Number(text.slice(fpsStartIndex + 1, fpsIndex));
                if (isNaN(fps)) {
                  sendError();
                  return;
                }
              }
              if (text.includes("Duration: ")) {
                // Get duration
                let durationIndex = text.lastIndexOf("Duration: ");
                let durationText = text.slice(durationIndex + 10, durationIndex + 21);
                durationSecs =
                  Number(durationText.slice(0, 2)) * 3600 +
                  Number(durationText.slice(3, 5)) * 60 +
                  Number(durationText.slice(6, 8)) +
                  Number(durationText.slice(9, 11)) * 0.01;
                if (isNaN(durationSecs)) {
                  sendError();
                  return;
                }
              }
              if (text.startsWith("frame=")) {
                // Exit if initial information not collected
                if (fps == 0 || durationSecs == 0) {
                  sendError();
                  return;
                }

                // Updated frame count
                let fpsIndex = text.indexOf(" fps=");
                completedFrames = Number(text.slice(6, fpsIndex));
                if (isNaN(completedFrames)) {
                  sendError();
                  return;
                }

                // Send status
                sendMessage(window, "video-data", {
                  uuid: uuid,
                  imgFolder: cachePath,
                  fps: fps,
                  totalFrames: Math.round(durationSecs * fps),
                  completedFrames: completedFrames
                });
              }
            });

            // Finished, check status code
            ffmpeg.on("close", (code) => {
              if (!running) return;
              if (code == 0) {
                sendMessage(window, "video-data", {
                  uuid: uuid,
                  imgFolder: cachePath,
                  fps: fps,
                  totalFrames: completedFrames, // In case original value was inaccurate
                  completedFrames: completedFrames
                });
              } else if (code == 1) {
                sendError();
              }
            });
          }
        });
      break;

    default:
      console.warn("Unknown message from hub renderer process", message);
      break;
  }
}

// Send live RLOG heartbeats
setInterval(() => {
  Object.values(rlogSockets).forEach((socket) => {
    socket.write(RLOG_HEARTBEAT_DATA);
  });
}, RLOG_HEARTBEAT_DELAY_MS);

/** Shows a popup to create a new tab on a hub window. */
function newTabPopup(window: BrowserWindow) {
  if (!hubWindows.includes(window)) return;
  const newTabMenu = new Menu();
  getAllTabTypes()
    .slice(1)
    .forEach((tabType, index) => {
      newTabMenu.append(
        new MenuItem({
          label: getTabIcon(tabType) + " " + getDefaultTabTitle(tabType),
          accelerator: index < 9 ? "CmdOrCtrl+" + (index + 1).toString() : "",
          click() {
            sendMessage(window, "new-tab", tabType);
          }
        })
      );
    });
  newTabMenu.popup({
    window: window,
    x: window.getBounds().width - 12,
    y: 10
  });
}

function select3DCameraPopup(window: BrowserWindow, options: string[], selectedIndex: number) {
  const cameraMenu = new Menu();
  cameraMenu.append(
    new MenuItem({
      label: "Orbit Field",
      type: "checkbox",
      checked: selectedIndex == -1,
      click() {
        sendMessage(window, "set-3d-camera", -1);
      }
    })
  );
  cameraMenu.append(
    new MenuItem({
      label: "Orbit Robot",
      type: "checkbox",
      checked: selectedIndex == -2,
      click() {
        sendMessage(window, "set-3d-camera", -2);
      }
    })
  );
  if (options.length > 0) {
    cameraMenu.append(
      new MenuItem({
        type: "separator"
      })
    );
  }
  options.forEach((option, index) => {
    cameraMenu.append(
      new MenuItem({
        label: option,
        type: "checkbox",
        checked: index == selectedIndex,
        click() {
          sendMessage(window, "set-3d-camera", index);
        }
      })
    );
  });
  cameraMenu.popup({
    window: window
  });
}

/**
 * Process a message from a download window.
 * @param message The received message
 */
function handleDownloadMessage(message: NamedMessage) {
  if (!downloadWindow) return;
  if (downloadWindow.isDestroyed()) return;

  switch (message.name) {
    case "start":
      downloadAddress = message.data.address;
      downloadPath = message.data.path;
      if (!downloadPath.endsWith("/")) downloadPath += "/";
      downloadStart();
      break;

    case "close":
      downloadWindow.destroy();
      downloadStop();
      break;

    case "save":
      downloadSave(message.data);
      break;
  }
}

/** Starts a new SSH connection. */
function downloadStart() {
  if (downloadRetryTimeout) clearTimeout(downloadRetryTimeout);
  if (downloadRefreshInterval) clearInterval(downloadRefreshInterval);
  downloadClient?.end();
  downloadFileSizeCache = {};
  downloadClient = new Client()
    .once("ready", () => {
      // Successful SSH connection
      downloadClient?.sftp((error, sftp) => {
        if (error) {
          // Failed to start SFTP
          downloadError(error.message);
        } else {
          // Successful SFTP connection
          let readFiles = () => {
            sftp.readdir(downloadPath, (error, list) => {
              if (error) {
                // Failed to read directory (not found?)
                downloadError(error.message);
              } else {
                // Return list of files
                if (downloadWindow) {
                  sendMessage(
                    downloadWindow,
                    "set-list",
                    list
                      .map((file) => {
                        return { name: file.filename, size: file.attrs.size };
                      })
                      .filter(
                        (file) =>
                          !file.name.startsWith(".") && (file.name.endsWith(".rlog") || file.name.endsWith(".wpilog"))
                      )
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .reverse()
                  );
                }

                // Save cache of file sizes
                list.forEach((file) => {
                  downloadFileSizeCache[file.filename] = file.attrs.size;
                });
              }
            });
          };

          // Start periodic read
          downloadRefreshInterval = setInterval(readFiles, DOWNLOAD_REFRESH_INTERVAL_MS);
          readFiles();
        }
      });
    })
    .on("error", (error) => {
      // Failed SSH connection
      downloadError(error.message);
    })
    .connect({
      // Start connection
      host: downloadAddress,
      port: 22,
      readyTimeout: DOWNLOAD_CONNECT_TIMEOUT_MS,
      username: DOWNLOAD_USERNAME,
      password: DOWNLOAD_PASSWORD
    });
}

/** Closes the SSH connection. */
function downloadStop() {
  downloadClient?.end();
  if (downloadRetryTimeout) clearTimeout(downloadRetryTimeout);
  if (downloadRefreshInterval) clearInterval(downloadRefreshInterval);
}

/** Problem connecting or reading data, restart after a delay. */
function downloadError(errorMessage: string) {
  if (!downloadWindow) return;
  sendMessage(downloadWindow, "show-error", errorMessage);
  if (downloadRefreshInterval) clearInterval(downloadRefreshInterval);
  downloadRetryTimeout = setTimeout(downloadStart, DOWNLOAD_RETRY_DELAY_MS);
}

/** Guides the user through saving a set of files. */
function downloadSave(files: string[]) {
  if (!downloadWindow) return;
  let selectPromise;
  if (files.length > 1) {
    selectPromise = dialog.showOpenDialog(downloadWindow, {
      title: "Select save location for robot logs",
      buttonLabel: "Save",
      properties: ["openDirectory", "createDirectory", "dontAddToRecent"]
    });
  } else {
    let extension = path.extname(files[0]).slice(1);
    let name = extension == "wpilog" ? "WPILib robot logs" : "Robot logs";
    selectPromise = dialog.showSaveDialog(downloadWindow, {
      title: "Select save location for robot log",
      defaultPath: files[0],
      properties: ["createDirectory", "showOverwriteConfirmation", "dontAddToRecent"],
      filters: [{ name: name, extensions: [extension] }]
    });
  }

  // Handle selected save location
  selectPromise.then((response) => {
    if (response.canceled) return;
    let savePath: string = "";
    if (files.length > 1) {
      savePath = (response as Electron.OpenDialogReturnValue).filePaths[0];
    } else {
      savePath = (response as Electron.SaveDialogReturnValue).filePath as string;
    }
    if (savePath != "") {
      // Start saving
      downloadClient?.sftp((error, sftp) => {
        if (error) {
          downloadError(error.message);
        } else {
          if (downloadWindow) sendMessage(downloadWindow, "set-progress", 0);
          if (files.length == 1) {
            // Single file
            sftp.fastGet(
              downloadPath + files[0],
              savePath,
              {
                step: (sizeTransferred, _, sizeTotal) => {
                  if (!downloadWindow) return;
                  sendMessage(downloadWindow, "set-progress", { current: sizeTransferred, total: sizeTotal });
                }
              },
              (error) => {
                if (error) {
                  downloadError(error.message);
                } else {
                  if (!downloadWindow) return;
                  sendMessage(downloadWindow, "set-progress", 1);

                  // Ask if the log should be opened
                  dialog
                    .showMessageBox(downloadWindow, {
                      type: "question",
                      message: "Open log?",
                      detail: 'Would you like to open the log file "' + path.basename(savePath) + '"?',
                      icon: WINDOW_ICON,
                      buttons: ["Open", "Skip"],
                      defaultId: 0
                    })
                    .then((result) => {
                      if (result.response == 0) {
                        downloadWindow?.destroy();
                        downloadStop();
                        hubWindows[0].focus();
                        sendMessage(hubWindows[0], "open-file", savePath);
                      }
                    });
                }
              }
            );
          } else {
            // Multiple files
            let completeCount = 0;
            let skipCount = 0;
            let allSizesTransferred: number[] = new Array(files.length).fill(0);
            let allSizesTotal = 0;
            files.forEach((file, index) => {
              let fileSize = file in downloadFileSizeCache ? downloadFileSizeCache[file] : 0;
              allSizesTotal += fileSize;
              fs.stat(savePath + "/" + file, (statErr) => {
                if (statErr == null) {
                  // File exists already, skip downloading
                  completeCount++;
                  skipCount++;
                  allSizesTotal -= fileSize; // Remove from total size of files
                  if (skipCount == files.length) {
                    // All files skipped
                    if (downloadWindow) sendMessage(downloadWindow, "show-alert", "No new logs found.");
                  }
                } else {
                  // File not found, download
                  sftp.fastGet(
                    downloadPath + file,
                    savePath + "/" + file,
                    {
                      step: (sizeTransferred) => {
                        allSizesTransferred[index] = sizeTransferred;
                        if (!downloadWindow) return;
                        let sumSizeTransferred = allSizesTransferred.reduce((a, b) => a + b, 0);
                        sendMessage(downloadWindow, "set-progress", {
                          current: sumSizeTransferred,
                          total: allSizesTotal
                        });
                      }
                    },
                    (error) => {
                      if (error) {
                        downloadError(error.message);
                      } else {
                        completeCount++;

                        if (completeCount >= files.length) {
                          let message: string;
                          if (skipCount > 0) {
                            let newCount = completeCount - skipCount;
                            message =
                              "Saved " +
                              newCount.toString() +
                              " new log" +
                              (newCount == 1 ? "" : "s") +
                              " (" +
                              skipCount.toString() +
                              " skipped) to <u>" +
                              savePath +
                              "</u>";
                          } else {
                            message =
                              "Saved " +
                              completeCount.toString() +
                              " log" +
                              (completeCount == 1 ? "" : "s") +
                              " to <u>" +
                              savePath +
                              "</u>";
                          }
                          if (!downloadWindow) return;
                          sendMessage(downloadWindow, "set-progress", 1);
                          sendMessage(downloadWindow, "show-alert", message);
                        }
                      }
                    }
                  );
                }
              });
            });
          }
        }
      });
    }
  });
}

// CREATE WINDOWS

/** Create the app menu. */
function setupMenu() {
  const isMac = process.platform === "darwin";

  const template: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = [
    {
      label: "File",
      submenu: [
        {
          label: "Open Log...",
          accelerator: "CmdOrCtrl+O",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            dialog
              .showOpenDialog(window, {
                title: "Select a robot log file to open",
                properties: ["openFile"],
                filters: [{ name: "Robot logs", extensions: ["rlog", "wpilog", "dslog", "dsevents"] }]
              })
              .then((files) => {
                if (files.filePaths.length > 0) {
                  sendMessage(window, "open-file", files.filePaths[0]);
                }
              });
          }
        },
        {
          label: "Merge Log...",
          accelerator: "CmdOrCtrl+Shift+O",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            dialog
              .showOpenDialog(window, {
                title: "Select a robot log file to merge with the current data",
                properties: ["openFile"],
                filters: [{ name: "Robot logs", extensions: ["rlog", "wpilog", "dslog", "dsevents"] }]
              })
              .then((files) => {
                if (files.filePaths.length > 0) {
                  sendMessage(window, "open-file-merge", files.filePaths[0]);
                }
              });
          }
        },
        {
          label: "Connect to Robot",
          accelerator: "CmdOrCtrl+K",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            sendMessage(window, "start-live", false);
          }
        },
        {
          label: "Connect to Simulator",
          accelerator: "CmdOrCtrl+Shift+K",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            sendMessage(window, "start-live", true);
          }
        },
        {
          label: "Download Logs...",
          accelerator: "CmdOrCtrl+D",
          click(_, window) {
            if (window == null) return;
            openDownload(window);
          }
        },
        {
          label: "Export Data...",
          accelerator: "CmdOrCtrl+E",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            sendMessage(window, "start-export");
          }
        },
        { type: "separator" },
        {
          label: "Use USB roboRIO Address",
          type: "checkbox",
          checked: false,
          click(item) {
            usingUsb = item.checked;
            sendAllPreferences();
          }
        },
        { type: "separator" },
        {
          label: "Export Layout...",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            dialog
              .showSaveDialog(window, {
                title: "Select export location for layout file",
                defaultPath: "AdvantageScope " + new Date().toLocaleDateString().replaceAll("/", "-") + ".json",
                properties: ["createDirectory", "showOverwriteConfirmation", "dontAddToRecent"],
                filters: [{ name: "JSON files", extensions: ["json"] }]
              })
              .then((response) => {
                if (!response.canceled) {
                  let hubState: HubState = hubStateTracker.getRendererState(window);
                  jsonfile.writeFile(
                    response.filePath!,
                    {
                      version: app.isPackaged ? app.getVersion() : "dev",
                      layout: hubState.tabs.tabs
                    },
                    { spaces: 2 }
                  );
                }
              });
          }
        },
        {
          label: "Import Layout...",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            dialog
              .showOpenDialog(window, {
                title: "Select one or more layout files to import",
                properties: ["openFile", "multiSelections"],
                filters: [{ name: "JSON files", extensions: ["json"] }]
              })
              .then((files) => {
                if (files.filePaths.length > 0) {
                  let data = jsonfile.readFileSync(files.filePaths[0]);

                  // Check for required fields
                  if (!("version" in data && "layout" in data && Array.isArray(data.layout))) {
                    dialog.showMessageBox(window, {
                      type: "error",
                      title: "Error",
                      message: "Failed to import layout",
                      detail: "The selected layout file was not a recognized format.",
                      icon: WINDOW_ICON
                    });
                    return;
                  }

                  // Merge additional layout files
                  if (files.filePaths.length > 1) {
                    for (const file of files.filePaths.slice(1)) {
                      let additionalLayout = jsonfile.readFileSync(file);
                      if (
                        "version" in additionalLayout &&
                        "layout" in additionalLayout &&
                        Array.isArray(additionalLayout.layout) &&
                        additionalLayout.version == data.version
                      ) {
                        data.layout = data.layout.concat(additionalLayout.layout);
                      }
                    }
                  }

                  // Check version compatability
                  let currentVersion = app.isPackaged ? app.getVersion() : "dev";
                  if (data.version !== currentVersion) {
                    let result = dialog.showMessageBoxSync(window, {
                      type: "warning",
                      title: "Warning",
                      message: "Version mismatch",
                      detail:
                        "The layout file was generated by a different version of AdvantageScope. Compatability is not guaranteed.",
                      buttons: ["Continue", "Cancel"],
                      icon: WINDOW_ICON
                    });
                    if (result != 0) return;
                  }

                  // Send to hub
                  let hubState: HubState = jsonCopy(hubStateTracker.getRendererState(window));
                  hubState.tabs.tabs = data.layout;
                  sendMessage(window, "restore-state", hubState);
                }
              });
          }
        },
        { type: "separator" },
        {
          label: "New Window",
          accelerator: "CommandOrControl+N",
          click() {
            createHubWindow();
          }
        },
        { role: "close", accelerator: "Shift+CmdOrCtrl+W" }
      ]
    },
    { role: "editMenu" },
    { role: "viewMenu" },
    {
      label: "Tabs",
      submenu: [
        {
          label: "New Tab",
          submenu: getAllTabTypes()
            .slice(1)
            .map((tabType, index) => {
              return {
                label: getTabIcon(tabType) + " " + getDefaultTabTitle(tabType),
                accelerator: index < 9 ? "CmdOrCtrl+" + (index + 1).toString() : "",
                click(_, window) {
                  if (window == null || !hubWindows.includes(window)) return;
                  sendMessage(window, "new-tab", tabType);
                }
              };
            })
        },
        {
          label: "New Tab (Popup)", // Hidden item to add keyboard shortcut
          visible: false,
          accelerator: "CmdOrCtrl+T",
          click(_, window) {
            if (window) newTabPopup(window);
          }
        },
        { type: "separator" },
        {
          label: "Previous Tab",
          accelerator: "CmdOrCtrl+Left",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            sendMessage(window, "move-tab", -1);
          }
        },
        {
          label: "Next Tab",
          accelerator: "CmdOrCtrl+Right",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            sendMessage(window, "move-tab", 1);
          }
        },
        { type: "separator" },
        {
          label: "Shift Left",
          accelerator: "CmdOrCtrl+[",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            sendMessage(window, "shift-tab", -1);
          }
        },
        {
          label: "Shift Right",
          accelerator: "CmdOrCtrl+]",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            sendMessage(window, "shift-tab", 1);
          }
        },
        { type: "separator" },
        {
          label: "Close Tab",
          accelerator: "CmdOrCtrl+W",
          click(_, window) {
            if (window == null) return;
            if (hubWindows.includes(window)) {
              sendMessage(window, "close-tab");
            } else {
              window.destroy();
            }
          }
        }
      ]
    },
    { role: "windowMenu" },
    {
      role: "help",
      submenu: [
        {
          label: "Show FRC Data Folder",
          click() {
            shell.openPath(EXTRA_FRC_DATA);
          }
        },
        { type: "separator" },
        {
          label: "Report a Problem",
          click() {
            shell.openExternal("https://github.com/" + REPOSITORY + "/issues");
          }
        },
        {
          label: "View Repository",
          click() {
            shell.openExternal("https://github.com/" + REPOSITORY);
          }
        },
        {
          label: "Team Website",
          click() {
            shell.openExternal("https://littletonrobotics.org");
          }
        }
      ]
    }
  ];

  if (isMac) {
    template.splice(0, 0, {
      role: "appMenu",
      submenu: [
        { role: "about" },
        { type: "separator" },
        {
          label: "Preferences...",
          accelerator: "Cmd+,",
          click(_, window) {
            if (window == null) return;
            openPreferences(window);
          }
        },
        {
          label: "Check for Updates...",
          click() {
            checkForUpdate(true);
          }
        },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" }
      ]
    });
  } else {
    (template[template.length - 1].submenu as Electron.MenuItemConstructorOptions[]).splice(
      0,
      0,
      {
        label: "About AdvantageScope",
        click() {
          dialog.showMessageBox({
            type: "info",
            title: "About",
            message: "AdvantageScope",
            detail: "Version: " + app.getVersion() + "\nPlatform: " + process.platform + "-" + process.arch,
            buttons: ["Close"],
            icon: WINDOW_ICON
          });
        }
      },
      {
        label: "Show Preferences...",
        accelerator: "Ctrl+,",
        click(_, window) {
          if (window == null) return;
          openPreferences(window);
        }
      },
      {
        label: "Check for Updates...",
        click() {
          checkForUpdate(true);
        }
      },
      { type: "separator" }
    );
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/** Creates a new hub window. */
function createHubWindow() {
  let prefs: BrowserWindowConstructorOptions = {
    minWidth: 800,
    minHeight: 400,
    icon: WINDOW_ICON,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  };

  // Manage window state
  let focusedWindow = BrowserWindow.getFocusedWindow();
  let rendererState: any = null;
  const defaultWidth = 1100;
  const defaultHeight = 650;
  if (hubWindows.length == 0) {
    let state = hubStateTracker.getState(defaultWidth, defaultHeight);
    prefs.x = state.x;
    prefs.y = state.y;
    prefs.width = state.width;
    prefs.height = state.height;
    if (state.rendererState) rendererState = state.rendererState;
  } else if (focusedWindow != null) {
    let bounds = focusedWindow.getBounds();
    prefs.x = bounds.x + 30;
    prefs.y = bounds.y + 30;
    prefs.width = bounds.width;
    prefs.height = bounds.height;
  } else {
    prefs.width = defaultWidth;
    prefs.height = defaultHeight;
  }

  // Set fancy window effects
  if (process.platform == "darwin") {
    prefs.vibrancy = "sidebar";
    if (Number(os.release().split(".")[0]) >= 20) prefs.titleBarStyle = "hiddenInset";
  }

  // Create window
  let window = new BrowserWindow(prefs);
  hubWindows.push(window);

  // Finish setup
  if (!app.isPackaged) window.webContents.openDevTools();
  window.once("ready-to-show", window.show);

  let firstLoad = true;
  let createPorts = () => {
    const { port1, port2 } = new MessageChannelMain();
    window.webContents.postMessage("port", null, [port1]);
    windowPorts[window.id] = port2;
    port2.on("message", (event) => {
      handleHubMessage(window, event.data);
    });
    port2.start();
  };
  createPorts(); // Create ports immediately so messages can be queued
  window.webContents.on("dom-ready", () => {
    if (!firstLoad) {
      createPorts(); // Create ports on reload
      rlogSockets[window.id]?.destroy(); // Destroy any existing RLOG sockets
    }

    // Init messages
    sendMessage(window, "set-frc-data", frcData);
    sendMessage(window, "set-fullscreen", window.isFullScreen());
    sendMessage(window, "set-battery", powerMonitor.isOnBatteryPower());
    sendMessage(window, "set-version", {
      platform: process.platform,
      platformRelease: os.release(),
      appVersion: app.isPackaged ? app.getVersion() : "dev"
    });
    sendMessage(window, "show-update-button", updateChecker.getShouldPrompt());
    sendAllPreferences();
    if (firstLoad) {
      if (rendererState) sendMessage(window, "restore-state", rendererState); // Use state from file
    } else {
      sendMessage(window, "restore-state", hubStateTracker.getRendererState(window)); // Use last cached state
    }
    firstLoad = false;
  });
  window.on("enter-full-screen", () => sendMessage(window, "set-fullscreen", true));
  window.on("leave-full-screen", () => sendMessage(window, "set-fullscreen", false));
  window.on("blur", () => sendMessage(window, "set-focused", false));
  window.on("focus", () => {
    sendMessage(window, "set-focused", true);
    hubStateTracker.setFocusedWindow(window);
    hubWindows.splice(hubWindows.indexOf(window), 1);
    hubWindows.splice(0, 0, window);
  });
  powerMonitor.on("on-ac", () => sendMessage(window, "set-battery", false));
  powerMonitor.on("on-battery", () => sendMessage(window, "set-battery", true));

  window.loadFile(path.join(__dirname, "../www/hub.html"));
  return window;
}

/**
 * Creates a new window to edit axis range.
 * @param parentWindow The parent window to use for alignment
 * @param range The window range
 * @param callback Window callback
 */
function createEditRangeWindow(
  parentWindow: Electron.BrowserWindow,
  range: [number, number],
  callback: (range: [number, number]) => void
) {
  const editWindow = new BrowserWindow({
    width: 300,
    height: process.platform == "win32" ? 125 : 108, // "useContentSize" is broken on Windows when not resizable
    useContentSize: true,
    resizable: false,
    icon: WINDOW_ICON,
    show: false,
    parent: parentWindow,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  // Finish setup
  editWindow.setMenu(null);
  editWindow.once("ready-to-show", parentWindow.show);
  editWindow.webContents.on("dom-ready", () => {
    // Create ports on reload
    const { port1, port2 } = new MessageChannelMain();
    editWindow.webContents.postMessage("port", null, [port1]);
    port2.postMessage(range);
    port2.on("message", (event) => {
      editWindow.destroy();
      callback(event.data);
    });
    editWindow.on("blur", () => port2.postMessage({ isFocused: false }));
    editWindow.on("focus", () => port2.postMessage({ isFocused: true }));
    port2.start();
  });
  editWindow.loadFile(path.join(__dirname, "../www/editRange.html"));
}

/**
 * Creates a new window to edit unit conversion for axis.
 * @param parentWindow The parent window to use for alignment
 * @param unitConversion Unit conversion preset to use.
 * @param callback Window callback
 */
function createUnitConversionWindow(
  parentWindow: Electron.BrowserWindow,
  unitConversion: UnitConversionPreset,
  callback: (unitConversion: UnitConversionPreset) => void
) {
  const unitConversionWindow = new BrowserWindow({
    width: 300,
    height: process.platform == "win32" ? 179 : 162, // "useContentSize" is broken on Windows when not resizable
    useContentSize: true,
    resizable: false,
    icon: WINDOW_ICON,
    show: false,
    parent: parentWindow,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  // Finish setup
  unitConversionWindow.setMenu(null);
  unitConversionWindow.once("ready-to-show", parentWindow.show);
  unitConversionWindow.webContents.on("dom-ready", () => {
    // Create ports on reload
    const { port1, port2 } = new MessageChannelMain();
    unitConversionWindow.webContents.postMessage("port", null, [port1]);
    port2.postMessage(unitConversion);
    port2.on("message", (event) => {
      unitConversionWindow.destroy();
      callback(event.data);
    });
    unitConversionWindow.on("blur", () => port2.postMessage({ isFocused: false }));
    unitConversionWindow.on("focus", () => port2.postMessage({ isFocused: true }));
    port2.start();
  });
  unitConversionWindow.loadFile(path.join(__dirname, "../www/unitConversion.html"));
}

/**
 * Creates a new window to edit a tab name.
 * @param parentWindow The parent window to use for alignment
 * @param name Name to use.
 * @param callback Window Callback.
 */
function createRenameTabWindow(
  parentWindow: Electron.BrowserWindow,
  name: string,
  callback: (newName: string) => void
) {
  const renameTabWindow = new BrowserWindow({
    width: 300,
    height: process.platform == "win32" ? 98 : 81, // "useContentSize" is broken on Windows when not resizable
    useContentSize: true,
    resizable: false,
    icon: WINDOW_ICON,
    show: false,
    parent: parentWindow,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  // Finish setup
  renameTabWindow.setMenu(null);
  renameTabWindow.once("ready-to-show", parentWindow.show);
  renameTabWindow.webContents.on("dom-ready", () => {
    // Create ports on reload
    const { port1, port2 } = new MessageChannelMain();
    renameTabWindow.webContents.postMessage("port", null, [port1]);
    port2.postMessage(name);
    port2.on("message", (event) => {
      renameTabWindow.destroy();
      callback(event.data);
    });
    renameTabWindow.on("blur", () => port2.postMessage({ isFocused: false }));
    renameTabWindow.on("focus", () => port2.postMessage({ isFocused: true }));
    port2.start();
  });
  renameTabWindow.loadFile(path.join(__dirname, "../www/renameTab.html"));
}

/**
 * Creates a new window for export options.
 * @param parentWindow The parent window to use for alignment
 * @param currentLogPath The current log path
 */
function createExportWindow(parentWindow: Electron.BrowserWindow, currentLogPath: string | null) {
  const exportWindow = new BrowserWindow({
    width: 300,
    height: process.platform == "win32" ? 179 : 162, // "useContentSize" is broken on Windows when not resizable
    useContentSize: true,
    resizable: false,
    icon: WINDOW_ICON,
    show: false,
    parent: parentWindow,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  // Finish setup
  exportWindow.setMenu(null);
  exportWindow.once("ready-to-show", parentWindow.show);
  exportWindow.webContents.on("dom-ready", () => {
    // Create ports on reload
    const { port1, port2 } = new MessageChannelMain();
    exportWindow.webContents.postMessage("port", null, [port1]);
    port2.on("message", (event) => {
      if (event.data === null) {
        // Exit button
        exportWindow.destroy();
      } else if (typeof event.data === "string") {
        // Help button
        shell.openExternal(event.data);
      } else if (typeof event.data === "object") {
        // Confirm
        let exportOptions: ExportOptions = event.data;
        let extension = exportOptions.format == "wpilog" ? "wpilog" : "csv";
        let defaultPath = undefined;
        if (currentLogPath !== null) {
          let pathComponents = currentLogPath.split(".");
          pathComponents.pop();
          defaultPath = pathComponents.join(".") + "." + extension;
        }
        dialog
          .showSaveDialog(exportWindow, {
            title: "Select export location for robot log",
            defaultPath: defaultPath,
            properties: ["createDirectory", "showOverwriteConfirmation", "dontAddToRecent"],
            filters: [
              extension == "csv"
                ? { name: "Comma-separated values", extensions: ["csv"] }
                : { name: "WPILib robot logs", extensions: ["wpilog"] }
            ]
          })
          .then((response) => {
            if (!response.canceled) {
              exportWindow.destroy();
              sendMessage(parentWindow, "prepare-export", { path: response.filePath, options: exportOptions });
            }
          });
      }
    });
    exportWindow.on("blur", () => port2.postMessage({ isFocused: false }));
    exportWindow.on("focus", () => port2.postMessage({ isFocused: true }));
    port2.start();
  });
  exportWindow.loadFile(path.join(__dirname, "../www/export.html"));
}

/**
 * Creates a new satellite window.
 * @param parentWindow The parent (source) window
 * @param uuid UUID to use.
 * @param type TabType to use.
 */
function createSatellite(parentWindow: Electron.BrowserWindow, uuid: string, type: TabType) {
  const width = 900;
  const height = 500;
  const satellite = new BrowserWindow({
    width: width,
    height: height,
    x: Math.floor(parentWindow.getBounds().x + parentWindow.getBounds().width / 2 - width / 2),
    y: Math.floor(parentWindow.getBounds().y + parentWindow.getBounds().height / 2 - height / 2),
    minWidth: 200,
    minHeight: 100,
    resizable: true,
    icon: WINDOW_ICON,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });
  satellite.setMenu(null);
  satellite.once("ready-to-show", satellite.show);
  satellite.loadFile(path.join(__dirname, "../www/satellite.html"));
  satellite.webContents.on("dom-ready", () => {
    // Create ports on reload
    const { port1, port2 } = new MessageChannelMain();
    satellite.webContents.postMessage("port", null, [port1]);
    windowPorts[satellite.id] = port2;
    port2.on("message", (event) => {
      let message: NamedMessage = event.data;
      switch (message.name) {
        case "set-aspect-ratio":
          let aspectRatio = message.data;
          if (aspectRatio === null) {
            satellite.setAspectRatio(0);
          } else {
            let originalSize = satellite.getContentSize();
            let originalArea = originalSize[0] * originalSize[1];
            let newY = Math.sqrt(originalArea / aspectRatio);
            let newX = aspectRatio * newY;
            satellite.setAspectRatio(aspectRatio);
            satellite.setContentSize(Math.round(newX), Math.round(newY));
          }
          break;

        case "ask-3d-camera":
          select3DCameraPopup(satellite, message.data.options, message.data.selectedIndex);
          break;
      }
    });
    port2.start();
    sendMessage(satellite, "set-frc-data", frcData);
    sendMessage(satellite, "set-type", type);
    sendAllPreferences();
  });

  if (!(uuid in satelliteWindows)) {
    satelliteWindows[uuid] = [];
  }
  satelliteWindows[uuid].push(satellite);

  let closed = false;
  parentWindow.once("close", () => {
    if (!closed) satellite.close();
  });
  satellite.once("closed", () => {
    closed = true;
    satelliteWindows[uuid].splice(satelliteWindows[uuid].indexOf(satellite), 1);
  });
}

/**
 * Creates a new preferences window if it doesn't already exist.
 * @param parentWindow The parent window to use for alignment
 */
function openPreferences(parentWindow: Electron.BrowserWindow) {
  if (prefsWindow != null && !prefsWindow.isDestroyed()) {
    prefsWindow.focus();
    return;
  }

  const width = 400;
  const height = process.platform == "win32" ? 303 : 243; // "useContentSize" is broken on Windows when not resizable
  prefsWindow = new BrowserWindow({
    width: width,
    height: height,
    x: Math.floor(parentWindow.getBounds().x + parentWindow.getBounds().width / 2 - width / 2),
    y: Math.floor(parentWindow.getBounds().y + parentWindow.getBounds().height / 2 - height / 2),
    useContentSize: true,
    resizable: false,
    alwaysOnTop: true,
    icon: WINDOW_ICON,
    show: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  // Finish setup
  prefsWindow.setMenu(null);
  prefsWindow.once("ready-to-show", prefsWindow.show);
  prefsWindow.webContents.on("dom-ready", () => {
    // Create ports on reload
    const { port1, port2 } = new MessageChannelMain();
    prefsWindow?.webContents.postMessage("port", null, [port1]);
    port2.postMessage({ platform: process.platform, prefs: jsonfile.readFileSync(PREFS_FILENAME) });
    port2.on("message", (event) => {
      prefsWindow?.destroy();
      jsonfile.writeFileSync(PREFS_FILENAME, event.data);
      sendAllPreferences();
    });
    prefsWindow?.on("blur", () => port2.postMessage({ isFocused: false }));
    prefsWindow?.on("focus", () => port2.postMessage({ isFocused: true }));
    port2.start();
  });
  prefsWindow.loadFile(path.join(__dirname, "../www/preferences.html"));
}

/**
 * Creates a new download window if it doesn't already exist.
 * @param parentWindow The parent window to use for alignment
 */
function openDownload(parentWindow: Electron.BrowserWindow) {
  if (downloadWindow != null && !downloadWindow.isDestroyed()) {
    downloadWindow.focus();
    return;
  }

  const width = 500;
  const height = 500;
  downloadWindow = new BrowserWindow({
    width: width,
    height: height,
    minWidth: width,
    minHeight: height,
    x: Math.floor(parentWindow.getBounds().x + parentWindow.getBounds().width / 2 - width / 2),
    y: Math.floor(parentWindow.getBounds().y + parentWindow.getBounds().height / 2 - height / 2),
    resizable: true,
    alwaysOnTop: true,
    icon: WINDOW_ICON,
    show: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  // Finish setup
  downloadWindow.setMenu(null);
  downloadWindow.once("ready-to-show", downloadWindow.show);
  downloadWindow.once("close", downloadStop);
  downloadWindow.webContents.on("dom-ready", () => {
    // Create ports on reload
    if (downloadWindow == null) return;
    const { port1, port2 } = new MessageChannelMain();
    downloadWindow.webContents.postMessage("port", null, [port1]);
    windowPorts[downloadWindow.id] = port2;
    port2.on("message", (event) => {
      if (downloadWindow) handleDownloadMessage(event.data);
    });
    port2.start();

    // Init messages
    sendMessage(downloadWindow, "set-platform", process.platform);
    sendAllPreferences();
  });
  downloadWindow.on("blur", () => sendMessage(downloadWindow!, "set-focused", false));
  downloadWindow.on("focus", () => sendMessage(downloadWindow!, "set-focused", true));
  downloadWindow.loadFile(path.join(__dirname, "../www/download.html"));
}

// APPLICATION EVENTS

// Workaround to set menu bar color on some Linux environments
if (process.platform == "linux" && fs.existsSync(PREFS_FILENAME)) {
  let prefs: Preferences = jsonfile.readFileSync(PREFS_FILENAME);
  if (prefs.theme == "dark") {
    process.env["GTK_THEME"] = "Adwaita:dark";
  }
}

function checkForUpdate(alwaysPrompt: boolean) {
  updateChecker.check().then(() => {
    hubWindows.forEach((window) => {
      sendMessage(window, "show-update-button", updateChecker.getShouldPrompt());
    });
    if (alwaysPrompt) {
      updateChecker.showPrompt();
    }
  });
}

app.whenReady().then(() => {
  // Check preferences and set theme
  if (!fs.existsSync(PREFS_FILENAME)) {
    jsonfile.writeFileSync(PREFS_FILENAME, DEFAULT_PREFS);
    nativeTheme.themeSource = DEFAULT_PREFS.theme;
  } else {
    let oldPrefs = jsonfile.readFileSync(PREFS_FILENAME);
    let prefs = DEFAULT_PREFS;
    if ("theme" in oldPrefs && (oldPrefs.theme == "light" || oldPrefs.theme == "dark" || oldPrefs.theme == "system")) {
      prefs.theme = oldPrefs.theme;
    }
    if ("rioAddress" in oldPrefs && typeof oldPrefs.rioAddress == "string") {
      prefs.rioAddress = oldPrefs.rioAddress;
    }
    if ("address" in oldPrefs && typeof oldPrefs.address == "string") {
      // Migrate from v1
      prefs.rioAddress = oldPrefs.address;
    }
    if ("rioPath" in oldPrefs && typeof oldPrefs.rioPath == "string") {
      prefs.rioPath = oldPrefs.rioPath;
    }
    if (
      "liveMode" in oldPrefs &&
      (oldPrefs.liveMode == "nt4" || oldPrefs.liveMode == "nt4-akit" || oldPrefs.liveMode == "rlog")
    ) {
      prefs.liveMode = oldPrefs.liveMode;
    }
    if ("rlogPort" in oldPrefs && typeof oldPrefs.rlogPort == "number") {
      prefs.rlogPort = oldPrefs.rlogPort;
    }

    jsonfile.writeFileSync(PREFS_FILENAME, prefs);
    nativeTheme.themeSource = prefs.theme;
  }

  // Load FRC data
  createExtraFRCDataFolder();
  frcData = loadFRCData();

  // Create menu and window
  setupMenu();
  let window = createHubWindow();

  // Check for file path given as argument
  if (app.isPackaged) {
    if (process.argv.length > 1) {
      firstOpenPath = process.argv[1];
    }
  } else {
    if (process.argv.length > 2) {
      firstOpenPath = process.argv[2];
    }
  }

  // Open file if exists
  if (firstOpenPath != null) {
    sendMessage(window, "open-file", firstOpenPath);
  }

  // Create new window if activated while none exist
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length == 0) createHubWindow();
  });

  // Check for update and show button on hub windows (but don't prompt)
  checkForUpdate(false);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// macOS only, Linux & Windows start a new process and pass the file as an argument
app.on("open-file", (_, path) => {
  if (app.isReady()) {
    // Already running, create a new window
    let window = createHubWindow();
    sendMessage(window, "open-file", path);
  } else {
    // Not running yet, open in first window
    firstOpenPath = path;
  }
});

// Clean up files on quit
app.on("quit", () => {
  fs.unlink(LAST_OPEN_FILE, () => {});
  Object.values(videoProcesses).forEach((process) => {
    process.kill();
  });
  videoFolderUUIDs.forEach((uuid) => {
    fs.rmSync(path.join(VIDEO_CACHE, uuid), { recursive: true });
  });
});
