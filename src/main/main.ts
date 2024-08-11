import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  FileFilter,
  Menu,
  MenuItem,
  MessageChannelMain,
  MessagePortMain,
  TouchBar,
  TouchBarSlider,
  app,
  clipboard,
  dialog,
  nativeImage,
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
import { AdvantageScopeAssets } from "../shared/AdvantageScopeAssets";
import ExportOptions from "../shared/ExportOptions";
import NamedMessage from "../shared/NamedMessage";
import Preferences from "../shared/Preferences";
import { SourceListConfig, SourceListItemState } from "../shared/SourceListConfig";
import TabType, { getAllTabTypes, getDefaultTabTitle, getTabIcon } from "../shared/TabType";
import { BUILD_DATE, COPYRIGHT, DISTRIBUTOR, Distributor } from "../shared/buildConstants";
import { MERGE_MAX_FILES } from "../shared/log/LogUtil";
import { UnitConversionPreset } from "../shared/units";
import {
  DEFAULT_PREFS,
  DOWNLOAD_CONNECT_TIMEOUT_MS,
  DOWNLOAD_PASSWORD,
  DOWNLOAD_REFRESH_INTERVAL_MS,
  DOWNLOAD_RETRY_DELAY_MS,
  DOWNLOAD_USERNAME,
  FRC_LOG_FOLDER,
  HUB_DEFAULT_HEIGHT,
  HUB_DEFAULT_WIDTH,
  LAST_OPEN_FILE,
  PATHPLANNER_CONNECT_TIMEOUT_MS,
  PATHPLANNER_DATA_TIMEOUT_MS,
  PATHPLANNER_PING_DELAY_MS,
  PATHPLANNER_PING_TEXT,
  PATHPLANNER_PORT,
  PREFS_FILENAME,
  REPOSITORY,
  RLOG_CONNECT_TIMEOUT_MS,
  RLOG_DATA_TIMEOUT_MS,
  RLOG_HEARTBEAT_DATA,
  RLOG_HEARTBEAT_DELAY_MS,
  SATELLITE_DEFAULT_HEIGHT,
  SATELLITE_DEFAULT_WIDTH,
  WINDOW_ICON
} from "./Constants";
import StateTracker, { ApplicationState, SatelliteWindowState, WindowState } from "./StateTracker";
import UpdateChecker from "./UpdateChecker";
import { VideoProcessor } from "./VideoProcessor";
import { getAssetDownloadStatus, startAssetDownload } from "./assetsDownload";
import { convertLegacyAssets, createAssetFolders, getUserAssetsPath, loadAssets } from "./assetsUtil";
import { checkHootIsPro, convertHoot, copyOwlet } from "./hootUtil";

// Global variables
let hubWindows: BrowserWindow[] = []; // Ordered by last focus time (recent first)
let downloadWindow: BrowserWindow | null = null;
let prefsWindow: BrowserWindow | null = null;
let licensesWindow: BrowserWindow | null = null;
let satelliteWindows: { [id: string]: BrowserWindow[] } = {};
let windowPorts: { [id: number]: MessagePortMain } = {};
let hubTouchBarSliders: { [id: number]: TouchBarSlider } = {};
let hubExportingIds: Set<number> = new Set();

let stateTracker = new StateTracker();
let updateChecker = new UpdateChecker();
let usingUsb = false; // Menu bar setting, bundled with other prefs for renderers
let firstOpenPath: string | null = null; // Cache path to open immediately
let advantageScopeAssets: AdvantageScopeAssets = {
  field2ds: [],
  field3ds: [],
  robots: [],
  joysticks: [],
  loadFailures: []
};

// Live RLOG variables
let rlogSockets: { [id: number]: net.Socket } = {};
let rlogSocketTimeouts: { [id: number]: NodeJS.Timeout } = {};
let rlogDataArrays: { [id: number]: Uint8Array } = {};

// PathPlanner variables
let pathPlannerSockets: { [id: number]: net.Socket } = {};
let pathPlannerSocketTimeouts: { [id: number]: NodeJS.Timeout } = {};
let pathPlannerDataStrings: { [id: number]: string } = {};

// Download variables
let downloadClient: Client | null = null;
let downloadRetryTimeout: NodeJS.Timeout | null = null;
let downloadRefreshInterval: NodeJS.Timeout | null = null;
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
  if (downloadWindow !== null && !downloadWindow.isDestroyed()) sendMessage(downloadWindow, "set-preferences", data);
}

/** Sends the current set of assets to all windows. */
function sendAssets() {
  Object.values(satelliteWindows).forEach((windowCollection) => {
    windowCollection.forEach((window) => {
      if (!window.isDestroyed()) {
        sendMessage(window, "set-assets", advantageScopeAssets);
      }
    });
  });
  hubWindows.forEach((window) => {
    if (!window.isDestroyed()) {
      sendMessage(window, "set-assets", advantageScopeAssets);
    }
  });
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
      stateTracker.saveRendererState(window, message.data);
      break;

    case "prompt-update":
      updateChecker.showPrompt();
      break;

    case "historical-start":
      // Record opened files
      let paths: string[] = message.data;
      paths.forEach((path) => app.addRecentDocument(path));
      fs.writeFile(LAST_OPEN_FILE, paths[0], () => {});

      // Send data if all file reads finished
      let completedCount = 0;
      let targetCount = 0;
      let errorMessage: null | string = null;
      let hasHootNonPro = false;
      let sendIfReady = () => {
        if (completedCount === targetCount) {
          sendMessage(window, "historical-data", {
            files: results,
            error: errorMessage,
            hasHootNonPro: hasHootNonPro
          });
        }
      };

      // Read data from file
      let results: (Buffer | null)[][] = paths.map(() => [null]);
      paths.forEach((path, index) => {
        let openPath = (path: string, callback: (buffer: Buffer) => void) => {
          fs.open(path, "r", (error, file) => {
            if (error) {
              completedCount++;
              sendIfReady();
              return;
            }
            fs.readFile(file, (error, buffer) => {
              let limitLength = false;
              if (buffer.length > 75 * 1024 * 1024) {
                let response = dialog.showMessageBoxSync(window, {
                  type: "warning",
                  title: "Warning",
                  message: "Very large log file",
                  detail: "This log file is very large. Would you like to read the full log or only the first 75MB?",
                  buttons: ["Read First 75MB", "Read Full Log"],
                  defaultId: 0,
                  icon: WINDOW_ICON
                });
                limitLength = response === 0;
              }
              completedCount++;
              if (!error) {
                if (limitLength) {
                  buffer = buffer.subarray(0, Math.min(buffer.length, 75 * 1024 * 1024));
                }
                callback(buffer);
              }
              sendIfReady();
            });
          });
        };
        if (path.endsWith(".dslog")) {
          // DSLog, open DSEvents too
          results[index] = [null, null];
          targetCount += 2;
          openPath(path, (buffer) => (results[index][0] = buffer));
          openPath(path.slice(0, path.length - 5) + "dsevents", (buffer) => (results[index][1] = buffer));
        } else if (path.endsWith(".hoot")) {
          // Hoot, convert to WPILOG
          targetCount += 1;
          checkHootIsPro(path)
            .then((isPro) => {
              hasHootNonPro = hasHootNonPro || !isPro;
            })
            .finally(() => {
              convertHoot(path)
                .then((wpilogPath) => {
                  openPath(wpilogPath, (buffer) => {
                    results[index][0] = buffer;
                    fs.rmSync(wpilogPath);
                  });
                })
                .catch((reason) => {
                  errorMessage = reason;
                  completedCount++;
                  sendIfReady();
                });
            });
        } else {
          // Not DSLog, open normally
          targetCount += 1;
          openPath(path, (buffer) => (results[index][0] = buffer));
        }
      });
      break;

    case "hoot-non-pro-warning":
      dialog
        .showMessageBox(window, {
          type: "info",
          title: "Alert",
          message: "About Non-Pro Signals",
          detail:
            "This log includes CTRE devices that are not Phoenix Pro licensed. Not all signals are available for these devices (check the Phoenix 6 documentation for details).",
          checkboxLabel: "Don't Show Again",
          icon: WINDOW_ICON
        })
        .then((response) => {
          if (response.checkboxChecked) {
            let prefs: Preferences = jsonfile.readFileSync(PREFS_FILENAME);
            prefs.skipHootNonProWarning = true;
            jsonfile.writeFileSync(PREFS_FILENAME, prefs);
            sendAllPreferences();
          }
        });
      break;

    case "live-rlog-start":
      rlogSockets[windowId]?.destroy();
      rlogSockets[windowId] = net.createConnection({
        host: message.data.address,
        port: message.data.port
      });

      rlogSockets[windowId].setTimeout(RLOG_CONNECT_TIMEOUT_MS, () => {
        sendMessage(window, "live-data", { uuid: message.data.uuid, status: false });
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
        if (rlogSocketTimeouts[windowId] !== null) clearTimeout(rlogSocketTimeouts[windowId]);
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

          if (singleArray.length > 0) {
            let success = sendMessage(window, "live-data", {
              uuid: message.data.uuid,
              success: true,
              raw: new Uint8Array(singleArray)
            });
            if (!success) {
              rlogSockets[windowId]?.destroy();
            }
          }
        }
      });

      rlogSockets[windowId].on("error", () => {
        sendMessage(window, "live-data", { uuid: message.data.uuid, success: false });
      });

      rlogSockets[windowId].on("close", () => {
        sendMessage(window, "live-data", { uuid: message.data.uuid, success: false });
      });
      break;

    case "live-rlog-stop":
      rlogSockets[windowId]?.destroy();
      break;

    case "live-pathplanner-start":
      pathPlannerSockets[windowId]?.destroy();
      pathPlannerSockets[windowId] = net.createConnection({
        host: message.data.address,
        port: PATHPLANNER_PORT
      });

      pathPlannerSockets[windowId].setTimeout(PATHPLANNER_CONNECT_TIMEOUT_MS, () => {
        sendMessage(window, "live-data", { uuid: message.data.uuid, status: false });
      });

      const textDecoder = new TextDecoder();
      pathPlannerDataStrings[windowId] = "";
      pathPlannerSockets[windowId].on("data", (data) => {
        pathPlannerDataStrings[windowId] += textDecoder.decode(data);
        if (pathPlannerSocketTimeouts[windowId] !== null) clearTimeout(pathPlannerSocketTimeouts[windowId]);
        pathPlannerSocketTimeouts[windowId] = setTimeout(() => {
          pathPlannerSockets[windowId]?.destroy();
        }, PATHPLANNER_DATA_TIMEOUT_MS);

        while (pathPlannerDataStrings[windowId].includes("\n")) {
          let newLineIndex = pathPlannerDataStrings[windowId].indexOf("\n");
          let line = pathPlannerDataStrings[windowId].slice(0, newLineIndex);
          pathPlannerDataStrings[windowId] = pathPlannerDataStrings[windowId].slice(newLineIndex + 1);

          let success = sendMessage(window, "live-data", {
            uuid: message.data.uuid,
            success: true,
            string: line
          });
          if (!success) {
            pathPlannerSockets[windowId]?.destroy();
          }
        }
      });

      pathPlannerSockets[windowId].on("error", () => {
        sendMessage(window, "live-data", { uuid: message.data.uuid, success: false });
      });

      pathPlannerSockets[windowId].on("close", () => {
        sendMessage(window, "live-data", { uuid: message.data.uuid, success: false });
      });
      break;

    case "live-pathplanner-stop":
      pathPlannerSockets[windowId]?.destroy();
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
            checked: value === message.data.speed,
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

    case "source-list-type-prompt":
      let uuid: string = message.data.uuid;
      let config: SourceListConfig = message.data.config;
      let state: SourceListItemState = message.data.state;
      let coordinates: [number, number] = message.data.coordinates;
      const menu = new Menu();

      let respond = () => {
        sendMessage(window, "source-list-type-response", {
          uuid: uuid,
          state: state
        });
      };

      // Add options
      let currentTypeConfig = config.types.find((typeConfig) => typeConfig.key === state.type)!;
      if (currentTypeConfig.options.length === 1) {
        let optionConfig = currentTypeConfig.options[0];
        optionConfig.values.forEach((optionValue) => {
          menu.append(
            new MenuItem({
              label: optionValue.display,
              type: "radio",
              checked: optionValue.key === state.options[optionConfig.key],
              click() {
                state.options[optionConfig.key] = optionValue.key;
                respond();
              }
            })
          );
        });
      } else {
        currentTypeConfig.options.forEach((optionConfig) => {
          menu.append(
            new MenuItem({
              label: optionConfig.display,
              submenu: optionConfig.values.map((optionValue) => {
                return {
                  label: optionValue.display,
                  type: "radio",
                  checked: optionValue.key === state.options[optionConfig.key],
                  click() {
                    state.options[optionConfig.key] = optionValue.key;
                    respond();
                  }
                };
              })
            })
          );
        });
      }

      // Add type options
      if (menu.items.length > 0) {
        menu.append(
          new MenuItem({
            type: "separator"
          })
        );
      }
      config.types.forEach((typeConfig) => {
        if (typeConfig.sourceTypes.includes(state.logType) && typeConfig.childOf === currentTypeConfig.childOf) {
          let current = state.type === typeConfig.key;
          let optionConfig = current
            ? undefined
            : typeConfig.options.find((optionConfig) => optionConfig.key === typeConfig.initialSelectionOption);
          menu.append(
            new MenuItem({
              label: typeConfig.display,
              type: current ? "checkbox" : optionConfig !== undefined ? "submenu" : "normal",
              checked: current,
              submenu:
                optionConfig === undefined
                  ? undefined
                  : optionConfig.values.map((optionValue) => {
                      return {
                        label: optionValue.display,
                        click() {
                          state.type = typeConfig.key;
                          let newOptions: { [key: string]: string } = {};
                          typeConfig.options.forEach((optionConfig) => {
                            if (
                              optionConfig.key in state.options &&
                              optionConfig.values
                                .map((valueConfig) => valueConfig.key)
                                .includes(state.options[optionConfig.key])
                            ) {
                              newOptions[optionConfig.key] = state.options[optionConfig.key];
                            } else {
                              newOptions[optionConfig.key] = optionConfig.values[0].key;
                            }
                          });
                          state.options = newOptions;
                          state.options[typeConfig.initialSelectionOption!] = optionValue.key;
                          respond();
                        }
                      };
                    }),
              click:
                optionConfig !== undefined
                  ? undefined
                  : () => {
                      state.type = typeConfig.key;
                      let newOptions: { [key: string]: string } = {};
                      typeConfig.options.forEach((optionConfig) => {
                        if (
                          optionConfig.key in state.options &&
                          optionConfig.values
                            .map((valueConfig) => valueConfig.key)
                            .includes(state.options[optionConfig.key])
                        ) {
                          newOptions[optionConfig.key] = state.options[optionConfig.key];
                        } else {
                          newOptions[optionConfig.key] = optionConfig.values[0].key;
                        }
                      });
                      state.options = newOptions;
                      respond();
                    }
            })
          );
        }
      });

      menu.popup({
        window: window,
        x: coordinates[0],
        y: coordinates[1]
      });
      break;

    case "ask-edit-axis":
      let legend: string = message.data.legend;
      const editAxisMenu = new Menu();

      if (legend === "discrete") {
        // Discrete controls
        editAxisMenu.append(
          new MenuItem({
            label: "Add Enabled State",
            click() {
              sendMessage(window, "add-discrete-enabled");
            }
          })
        );
      } else {
        // Left and right controls
        let lockedRange: [number, number] | null = message.data.lockedRange;
        let unitConversion: UnitConversionPreset = message.data.unitConversion;

        editAxisMenu.append(
          new MenuItem({
            label: "Lock Axis",
            type: "checkbox",
            checked: lockedRange !== null,
            click() {
              sendMessage(window, "edit-axis", {
                legend: legend,
                lockedRange: lockedRange === null ? [null, null] : null,
                unitConversion: unitConversion
              });
            }
          })
        );
        editAxisMenu.append(
          new MenuItem({
            label: "Edit Range...",
            enabled: lockedRange !== null,
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
      createSatellite({ parentWindow: window, uuid: message.data.uuid, type: message.data.type });
      break;

    case "update-satellite":
      let satelliteUUID = message.data.uuid;
      let command = message.data.command;
      let title = message.data.title;
      if (satelliteUUID in satelliteWindows) {
        satelliteWindows[satelliteUUID].forEach((satellite) => {
          if (satellite.isVisible()) {
            sendMessage(satellite, "render", { command: command, title: title });
          }
        });
      }
      break;

    case "ask-3d-camera":
      select3DCameraPopup(window, message.data.options, message.data.selectedIndex, message.data.fov);
      break;

    case "prompt-export":
      if (message.data.incompleteWarning) {
        dialog
          .showMessageBox(window, {
            type: "info",
            title: "Warning",
            message: "Incomplete data for export",
            detail:
              'Some fields will not be available in the exported data. To save all fields from the server, the "Logging" live mode must be selected with NetworkTables, PathPlanner, or RLOG as the live source. Check the AdvantageScope documentation for details.',
            buttons: ["Continue", "Cancel"],
            icon: WINDOW_ICON
          })
          .then((value) => {
            if (value.response === 0) {
              createExportWindow(window, message.data.supportsAkit, message.data.path);
            } else {
              sendMessage(window, "cancel-export");
            }
          });
      } else {
        createExportWindow(window, message.data.supportsAkit, message.data.path);
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

    case "set-exporting":
      if (message.data) {
        hubExportingIds.add(window.id);
      } else {
        hubExportingIds.delete(window.id);
      }
      break;

    case "select-video":
      VideoProcessor.prepare(
        window,
        message.data.uuid,
        message.data.source,
        message.data.matchInfo,
        message.data.menuCoordinates,
        (data) => sendMessage(window, "video-data", data)
      );
      break;

    case "update-touch-bar-slider":
      if (window.id in hubTouchBarSliders) {
        let slider = hubTouchBarSliders[window.id];
        slider.value = Math.round(message.data * slider.maxValue);
      }
      break;

    default:
      console.warn("Unknown message from hub renderer process", message);
      break;
  }
}

// Send live RLOG heartbeats & PathPlanner pings
setInterval(() => {
  Object.values(rlogSockets).forEach((socket) => {
    socket.write(RLOG_HEARTBEAT_DATA);
  });
}, RLOG_HEARTBEAT_DELAY_MS);
setInterval(() => {
  Object.values(pathPlannerSockets).forEach((socket) => {
    socket.write(PATHPLANNER_PING_TEXT + "\n");
  });
}, PATHPLANNER_PING_DELAY_MS);

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

function select3DCameraPopup(window: BrowserWindow, options: string[], selectedIndex: number, fov: number) {
  const cameraMenu = new Menu();
  cameraMenu.append(
    new MenuItem({
      label: "Orbit Field",
      type: "checkbox",
      checked: selectedIndex === -1,
      click() {
        sendMessage(window, "set-3d-camera", -1);
      }
    })
  );
  cameraMenu.append(
    new MenuItem({
      label: "Orbit Robot",
      type: "checkbox",
      checked: selectedIndex === -2,
      click() {
        sendMessage(window, "set-3d-camera", -2);
      }
    })
  );
  cameraMenu.append(
    new MenuItem({
      label: "Driver Station",
      submenu: [
        {
          label: "Auto",
          type: "checkbox",
          checked: selectedIndex === -3,
          click() {
            sendMessage(window, "set-3d-camera", -3);
          }
        },
        {
          label: "Blue 1",
          type: "checkbox",
          checked: selectedIndex === -4,
          click() {
            sendMessage(window, "set-3d-camera", -4);
          }
        },
        {
          label: "Blue 2",
          type: "checkbox",
          checked: selectedIndex === -5,
          click() {
            sendMessage(window, "set-3d-camera", -5);
          }
        },
        {
          label: "Blue 3",
          type: "checkbox",
          checked: selectedIndex === -6,
          click() {
            sendMessage(window, "set-3d-camera", -6);
          }
        },
        {
          label: "Red 1",
          type: "checkbox",
          checked: selectedIndex === -7,
          click() {
            sendMessage(window, "set-3d-camera", -7);
          }
        },
        {
          label: "Red 2",
          type: "checkbox",
          checked: selectedIndex === -8,
          click() {
            sendMessage(window, "set-3d-camera", -8);
          }
        },
        {
          label: "Red 3",
          type: "checkbox",
          checked: selectedIndex === -9,
          click() {
            sendMessage(window, "set-3d-camera", -9);
          }
        }
      ]
    })
  );
  cameraMenu.append(
    new MenuItem({
      label: "Set FOV...",
      click() {
        createEditFovWindow(window, fov, (newFov) => {
          sendMessage(window, "edit-fov", newFov);
        });
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
        checked: index === selectedIndex,
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
                          !file.name.startsWith(".") &&
                          (file.name.endsWith(".rlog") || file.name.endsWith(".wpilog") || file.name.endsWith(".hoot"))
                      )
                      .map((file) => {
                        return {
                          name: file.name,
                          size: file.size,
                          randomized:
                            file.name.includes("TBD") || // WPILib DataLogManager
                            (file.name.startsWith("Log_") && !file.name.includes("-")) // AdvantageKit
                        };
                      })
                      .sort((a, b) => {
                        if (a.randomized && !b.randomized) {
                          return 1;
                        } else if (!a.randomized && b.randomized) {
                          return -1;
                        } else {
                          return -a.name.localeCompare(b.name);
                        }
                      })
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
      properties: ["openDirectory", "createDirectory", "dontAddToRecent"],
      defaultPath: getDefaultLogPath()
    });
  } else {
    let extension = path.extname(files[0]).slice(1);
    let name = "";
    switch (extension) {
      case "wpilog":
        name = "WPILib robot log";
        break;
      case "rlog":
        name = "Robot log";
        break;
      case "hoot":
        name = "Hoot robot log";
        break;
    }
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
    if (savePath !== "") {
      // Start saving
      downloadClient?.sftp((error, sftp) => {
        if (error) {
          downloadError(error.message);
        } else {
          if (downloadWindow) sendMessage(downloadWindow, "set-progress", 0);
          if (files.length === 1) {
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
                      if (result.response === 0) {
                        downloadWindow?.destroy();
                        downloadStop();
                        hubWindows[0].focus();
                        sendMessage(hubWindows[0], "open-files", [savePath]);
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
                if (statErr === null) {
                  // File exists already, skip downloading
                  completeCount++;
                  skipCount++;
                  allSizesTotal -= fileSize; // Remove from total size of files
                  if (skipCount === files.length) {
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
                              (newCount === 1 ? "" : "s") +
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
                              (completeCount === 1 ? "" : "s") +
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
  const prefs: Preferences = jsonfile.readFileSync(PREFS_FILENAME);

  const template: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = [
    {
      label: "File",
      submenu: [
        {
          label: "Open...",
          accelerator: "CmdOrCtrl+O",
          click(_, window) {
            if (window === undefined || !hubWindows.includes(window)) return;
            dialog
              .showOpenDialog(window, {
                title: "Select a robot log file to open",
                properties: ["openFile"],
                filters: [{ name: "Robot logs", extensions: ["rlog", "wpilog", "dslog", "dsevents", "hoot"] }],
                defaultPath: getDefaultLogPath()
              })
              .then((files) => {
                if (files.filePaths.length > 0) {
                  sendMessage(window, "open-files", [files.filePaths[0]]);
                }
              });
          }
        },
        {
          label: "Open Multiple...",
          accelerator: "CmdOrCtrl+Shift+O",
          async click(_, window) {
            if (window === undefined || !hubWindows.includes(window)) return;
            let filesResponse = await dialog.showOpenDialog(window, {
              title: "Select up to " + MERGE_MAX_FILES.toString() + " robot log files to open",
              message: "Up to " + MERGE_MAX_FILES.toString() + " files can be opened together",
              properties: ["openFile", "multiSelections"],
              filters: [{ name: "Robot logs", extensions: ["rlog", "wpilog", "dslog", "dsevents", "hoot"] }],
              defaultPath: getDefaultLogPath()
            });
            let files = filesResponse.filePaths;
            if (files.length === 0) {
              return;
            }
            sendMessage(window, "open-files", files.slice(0, MERGE_MAX_FILES));
          }
        },
        {
          label: "Connect to Robot",
          accelerator: "CmdOrCtrl+K",
          click(_, window) {
            if (window === undefined || !hubWindows.includes(window)) return;
            sendMessage(window, "start-live", false);
          }
        },
        {
          label: "Connect to Simulator",
          accelerator: "CmdOrCtrl+Shift+K",
          click(_, window) {
            if (window === undefined || !hubWindows.includes(window)) return;
            sendMessage(window, "start-live", true);
          }
        },
        {
          label: "Download Logs...",
          accelerator: "CmdOrCtrl+D",
          click(_, window) {
            if (window === undefined) return;
            openDownload(window);
          }
        },
        {
          label: "Load Zebra MotionWorks™",
          accelerator: "Option+Z",
          click(_, window) {
            if (window === undefined) return;
            sendMessage(window, "load-zebra");
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
          label: "Export Data...",
          accelerator: "CmdOrCtrl+E",
          click(_, window) {
            if (window === undefined || !hubWindows.includes(window)) return;
            sendMessage(window, "start-export");
          }
        },
        {
          label: "Publish NT Data",
          submenu: [
            {
              label: "Connect to Robot",
              accelerator: "CmdOrCtrl+P",
              click(_, window) {
                if (window === undefined || !hubWindows.includes(window)) return;
                sendMessage(window, "start-publish", false);
              }
            },
            {
              label: "Connect to Simulator",
              accelerator: "CmdOrCtrl+Shift+P",
              click(_, window) {
                if (window === undefined || !hubWindows.includes(window)) return;
                sendMessage(window, "start-publish", true);
              }
            },
            {
              label: "Stop Publishing",
              accelerator: "Option+P",
              click(_, window) {
                if (window === undefined || !hubWindows.includes(window)) return;
                sendMessage(window, "stop-publish");
              }
            }
          ]
        },
        { type: "separator" },
        {
          label: "Export Layout...",
          click() {
            dialog
              .showSaveDialog({
                title: "Select export location for layout file",
                defaultPath: "AdvantageScope " + new Date().toLocaleDateString().replaceAll("/", "-") + ".json",
                properties: ["createDirectory", "showOverwriteConfirmation", "dontAddToRecent"],
                filters: [{ name: "JSON files", extensions: ["json"] }]
              })
              .then((response) => {
                if (!response.canceled) {
                  let state = stateTracker.getCurrentApplicationState() as ApplicationState & { version: string };
                  state.version = app.isPackaged ? app.getVersion() : "dev";
                  jsonfile.writeFile(response.filePath!, state, { spaces: 2 });
                }
              });
          }
        },
        {
          label: "Import Layout...",
          click() {
            dialog
              .showOpenDialog({
                title: "Select one or more layout files to import",
                properties: ["openFile", "multiSelections"],
                filters: [{ name: "JSON files", extensions: ["json"] }]
              })
              .then((files) => {
                if (files.filePaths.length > 0) {
                  let data = jsonfile.readFileSync(files.filePaths[0]);

                  // Check for required fields
                  if (
                    !(
                      "version" in data &&
                      "hubs" in data &&
                      Array.isArray(data.hubs) &&
                      "satellites" in data &&
                      Array.isArray(data.satellites)
                    )
                  ) {
                    const oldLayout = "layout" in data && Array.isArray(data.layout);
                    dialog.showMessageBox({
                      type: "error",
                      title: "Error",
                      message: "Failed to import layout",
                      detail: oldLayout
                        ? "The selected layout file uses an older format which is not compatible with the current version of AdvantageScope."
                        : "The selected layout file was not a recognized format.",
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
                        "hubs" in additionalLayout &&
                        Array.isArray(additionalLayout.hubs) &&
                        "satellites" in additionalLayout &&
                        Array.isArray(additionalLayout.satellites) &&
                        additionalLayout.version === data.version
                      ) {
                        data.hubs = data.hubs.concat(additionalLayout.hubs);
                        data.satellites = data.satellites.concat(additionalLayout.satellites);
                      }
                    }
                  }

                  // Check version compatability
                  if (app.isPackaged && data.version !== app.getVersion()) {
                    let result = dialog.showMessageBoxSync({
                      type: "warning",
                      title: "Warning",
                      message: "Version mismatch",
                      detail:
                        "The layout file was generated by a different version of AdvantageScope. Compatability is not guaranteed.",
                      buttons: ["Continue", "Cancel"],
                      icon: WINDOW_ICON
                    });
                    if (result !== 0) return;
                  }

                  // Close all current hub and satellite windows
                  hubWindows.forEach((window) => {
                    if (!window.isDestroyed()) {
                      window.close();
                    }
                  });
                  Object.values(satelliteWindows).forEach((windows) =>
                    windows.forEach((window) => {
                      if (!window.isDestroyed()) {
                        window.close();
                      }
                    })
                  );

                  // Create new windows based on layout
                  let applicationState = data as ApplicationState;
                  applicationState.hubs.forEach((hubState) => {
                    createHubWindow(hubState);
                  });
                  applicationState.satellites.forEach((satelliteState) => {
                    createSatellite({ state: satelliteState });
                  });
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
                  if (window === undefined || !hubWindows.includes(window)) return;
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
            if (window === undefined || !hubWindows.includes(window)) return;
            sendMessage(window, "move-tab", -1);
          }
        },
        {
          label: "Next Tab",
          accelerator: "CmdOrCtrl+Right",
          click(_, window) {
            if (window === undefined || !hubWindows.includes(window)) return;
            sendMessage(window, "move-tab", 1);
          }
        },
        { type: "separator" },
        {
          label: "Shift Left",
          accelerator: "CmdOrCtrl+[",
          click(_, window) {
            if (window === undefined || !hubWindows.includes(window)) return;
            sendMessage(window, "shift-tab", -1);
          }
        },
        {
          label: "Shift Right",
          accelerator: "CmdOrCtrl+]",
          click(_, window) {
            if (window === undefined || !hubWindows.includes(window)) return;
            sendMessage(window, "shift-tab", 1);
          }
        },
        { type: "separator" },
        {
          label: "Close Tab",
          accelerator: "CmdOrCtrl+W",
          click(_, window) {
            if (window === undefined) return;
            if (hubWindows.includes(window)) {
              sendMessage(window, "close-tab");
            } else {
              window.destroy();
            }
          }
        }
      ]
    },
    isMac
      ? { role: "windowMenu" }
      : {
          label: "Window",
          submenu: [
            { role: "minimize" },
            {
              label: "Bring All to Front",
              accelerator: "Ctrl+B",
              click(_, window) {
                hubWindows.forEach((window) => {
                  if (!window.isDestroyed()) {
                    window.moveTop();
                  }
                });
                if (downloadWindow && !downloadWindow.isDestroyed()) downloadWindow.moveTop();
                if (prefsWindow && !prefsWindow.isDestroyed()) prefsWindow?.moveTop();
                if (licensesWindow && !licensesWindow.isDestroyed()) licensesWindow?.moveTop();
                Object.values(satelliteWindows).forEach((windows) =>
                  windows.forEach((window) => {
                    if (!window.isDestroyed()) {
                      window.moveTop();
                    }
                  })
                );
                window?.moveTop();
              }
            },
            { type: "separator" }
          ]
        },
    {
      role: "help",
      submenu: [
        {
          label: "Show Assets Folder",
          click() {
            shell.openPath(getUserAssetsPath());
          }
        },
        {
          label: "Use Custom Assets Folder",
          type: "checkbox",
          checked: prefs.userAssetsFolder !== null,
          async click(item) {
            const isCustom = item.checked;
            let prefs: Preferences = jsonfile.readFileSync(PREFS_FILENAME);
            if (isCustom) {
              let result = await dialog.showOpenDialog({
                title: "Select folder containing custom AdvantageScope assets",
                buttonLabel: "Open",
                properties: ["openDirectory", "createDirectory", "dontAddToRecent"]
              });
              if (result.filePaths.length >= 1) {
                prefs.userAssetsFolder = result.filePaths[0];
              }
            } else {
              prefs.userAssetsFolder = null;
            }
            item.checked = prefs.userAssetsFolder !== null;
            jsonfile.writeFileSync(PREFS_FILENAME, prefs);
            advantageScopeAssets = loadAssets();
            sendAllPreferences();
            sendAssets();
          }
        },
        {
          label: "Asset Download Status...",
          click() {
            dialog.showMessageBox({
              type: "info",
              title: "About",
              message: "Asset Download Status",
              detail: getAssetDownloadStatus(),
              buttons: ["Close"],
              icon: WINDOW_ICON
            });
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
          label: "Contact Us",
          click() {
            shell.openExternal("mailto:software@team6328.org");
          }
        },
        {
          label: "GitHub Repository",
          click() {
            shell.openExternal("https://github.com/" + REPOSITORY);
          }
        },
        {
          label: "WPILib Documentation",
          click() {
            shell.openExternal("https://docs.wpilib.org");
          }
        },
        {
          label: "Littleton Robotics",
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
        {
          label: "About AdvantageScope",
          click() {
            createAboutWindow();
          }
        },
        { type: "separator" },
        {
          label: "Settings...",
          accelerator: "Cmd+,",
          click(_, window) {
            if (window === undefined) return;
            openPreferences(window);
          }
        },
        ...(DISTRIBUTOR === Distributor.FRC6328
          ? [
              {
                label: "Check for Updates...",
                click() {
                  checkForUpdate(true);
                }
              }
            ]
          : []),
        {
          label: "Show Licenses...",
          click(_, window) {
            if (window === undefined) return;
            openLicenses(window);
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
          createAboutWindow();
        }
      },
      {
        label: "Show Preferences...",
        accelerator: "Ctrl+,",
        click(_, window) {
          if (window === undefined) return;
          openPreferences(window);
        }
      },
      ...(DISTRIBUTOR === Distributor.FRC6328
        ? [
            {
              label: "Check for Updates...",
              click() {
                checkForUpdate(true);
              }
            }
          ]
        : []),
      {
        label: "Show Licenses...",
        click(_, window) {
          if (window === undefined) return;
          openLicenses(window);
        }
      },
      { type: "separator" }
    );
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/** Creates the "About AdvantageScope" window. */
function createAboutWindow() {
  let detailLines: string[] = [];
  detailLines.push("Version: " + (app.isPackaged ? app.getVersion() : "Development"));
  detailLines.push("Distributor: " + (DISTRIBUTOR === Distributor.WPILib ? "WPILib" : "FRC 6328"));
  detailLines.push("Platform: " + process.platform + "-" + process.arch);
  detailLines.push("Build Date: " + BUILD_DATE);
  detailLines.push("Electron: " + process.versions.electron);
  detailLines.push("Chromium: " + process.versions.chrome);
  detailLines.push("Node: " + process.versions.node);
  let detail = detailLines.join("\n");
  dialog
    .showMessageBox({
      type: "info",
      title: "About",
      message: "AdvantageScope",
      detail: COPYRIGHT + "\n\n" + detail,
      buttons: ["Close", "Copy & Close"],
      defaultId: 0,
      icon: WINDOW_ICON
    })
    .then((response) => {
      if (response.response === 1) {
        clipboard.writeText(detail);
      }
    });
}

/** Creates a new hub window. */
function createHubWindow(state?: WindowState) {
  let prefs: BrowserWindowConstructorOptions = {
    minWidth: 800,
    minHeight: 400,
    icon: WINDOW_ICON,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      backgroundThrottling: false
    }
  };

  // Manage window state
  let focusedWindow = BrowserWindow.getFocusedWindow();
  if (state !== undefined) {
    prefs.x = state.x;
    prefs.y = state.y;
    prefs.width = state.width;
    prefs.height = state.height;
  } else if (focusedWindow !== null) {
    let bounds = focusedWindow.getBounds();
    prefs.x = bounds.x + 30;
    prefs.y = bounds.y + 30;
    prefs.width = bounds.width;
    prefs.height = bounds.height;
  } else {
    prefs.width = HUB_DEFAULT_WIDTH;
    prefs.height = HUB_DEFAULT_HEIGHT;
  }

  // Set fancy window effects
  if (process.platform === "darwin") {
    prefs.vibrancy = "sidebar";
    if (Number(os.release().split(".")[0]) >= 20) prefs.titleBarStyle = "hiddenInset";
  }

  // Create window
  let window = new BrowserWindow(prefs);
  hubWindows.push(window);

  // Add touch bar menu
  let resetTouchBar = () => {
    let newCreated = false;
    let slider = new TouchBar.TouchBarSlider({
      value: window.id in hubTouchBarSliders ? hubTouchBarSliders[window.id].value : 0,
      minValue: 0,
      maxValue: 10000,
      change(newValue) {
        sendMessage(window, "update-touch-bar-slider", newValue / slider.maxValue);
      }
    });
    hubTouchBarSliders[window.id] = slider;
    window.setTouchBar(
      new TouchBar({
        items: [
          new TouchBar.TouchBarOtherItemsProxy(),
          new TouchBar.TouchBarPopover({
            icon: nativeImage.createFromPath(path.join(__dirname, "../icons/touch-bar-plus.png")),
            showCloseButton: true,
            items: new TouchBar({
              items: [
                new TouchBar.TouchBarScrubber({
                  selectedStyle: "background",
                  continuous: false,
                  items: getAllTabTypes()
                    .slice(1)
                    .map((type) => {
                      return {
                        label: getTabIcon(type) + " " + getDefaultTabTitle(type)
                      };
                    }),
                  select(index) {
                    if (newCreated) return;
                    newCreated = true;
                    sendMessage(window, "new-tab", index + 1);
                    setTimeout(resetTouchBar, 350);
                  }
                })
              ]
            })
          }),
          slider
        ]
      })
    );
  };
  resetTouchBar();

  // Show window when loaded
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

    // Launch dev tools
    if (firstLoad && !app.isPackaged) {
      window.webContents.openDevTools();
    }

    // Init messages
    sendMessage(window, "set-assets", advantageScopeAssets);
    sendMessage(window, "set-fullscreen", window.isFullScreen());
    sendMessage(window, "set-battery", powerMonitor.isOnBatteryPower());
    sendMessage(window, "set-version", {
      platform: process.platform,
      platformRelease: os.release(),
      appVersion: app.isPackaged ? app.getVersion() : "dev"
    });
    sendMessage(window, "show-update-button", updateChecker.getShouldPrompt());
    sendAllPreferences();
    if (firstLoad && state !== undefined) {
      sendMessage(window, "restore-state", state.state);
    } else {
      let cachedState = stateTracker.getRendererState(window);
      if (cachedState !== undefined) {
        sendMessage(window, "restore-state", stateTracker.getRendererState(window));
      }
    }
    firstLoad = false;
  });
  window.on("close", (event) => {
    if (hubExportingIds.has(window.id)) {
      const choice = dialog.showMessageBoxSync(window, {
        type: "info",
        title: "Warning",
        message: "Export in progress",
        detail: "Are you sure you want to close the window while an export is in progress? Data will NOT be saved.",
        buttons: ["Don't Close", "Close"],
        defaultId: 0
      });
      if (choice === 0) event.preventDefault();
    }
  });
  window.on("enter-full-screen", () => sendMessage(window, "set-fullscreen", true));
  window.on("leave-full-screen", () => sendMessage(window, "set-fullscreen", false));
  window.on("blur", () => sendMessage(window, "set-focused", false));
  window.on("focus", () => {
    sendMessage(window, "set-focused", true);
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
    height: process.platform === "win32" ? 125 : 108, // "useContentSize" is broken on Windows when not resizable
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
    height: process.platform === "win32" ? 179 : 162, // "useContentSize" is broken on Windows when not resizable
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
 * @param callback Window callback.
 */
function createRenameTabWindow(
  parentWindow: Electron.BrowserWindow,
  name: string,
  callback: (newName: string) => void
) {
  const renameTabWindow = new BrowserWindow({
    width: 300,
    height: process.platform === "win32" ? 98 : 81, // "useContentSize" is broken on Windows when not resizable
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
 * Creates a new window to edit the 3D field FOV.
 * @param parentWindow The parent window to use for alignment
 * @param fov Current FOV.
 * @param callback Window callback.
 */
function createEditFovWindow(parentWindow: Electron.BrowserWindow, fov: number, callback: (newFov: number) => void) {
  const editFovWindow = new BrowserWindow({
    width: 300,
    height: process.platform === "win32" ? 98 : 81, // "useContentSize" is broken on Windows when not resizable
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
  editFovWindow.setMenu(null);
  editFovWindow.once("ready-to-show", parentWindow.show);
  editFovWindow.webContents.on("dom-ready", () => {
    // Create ports on reload
    const { port1, port2 } = new MessageChannelMain();
    editFovWindow.webContents.postMessage("port", null, [port1]);
    port2.postMessage(fov);
    port2.on("message", (event) => {
      editFovWindow.destroy();
      callback(event.data);
    });
    editFovWindow.on("blur", () => port2.postMessage({ isFocused: false }));
    editFovWindow.on("focus", () => port2.postMessage({ isFocused: true }));
    port2.start();
  });
  editFovWindow.loadFile(path.join(__dirname, "../www/editFov.html"));
}

/**
 * Creates a new window for export options.
 * @param parentWindow The parent window to use for alignment
 * @param supportsAkit Whether AdvantageKit timestamps are supported
 * @param currentLogPath The current log path
 */
function createExportWindow(
  parentWindow: Electron.BrowserWindow,
  supportsAkit: boolean,
  currentLogPath: string | null
) {
  const exportWindow = new BrowserWindow({
    width: 300,
    height: process.platform === "win32" ? 206 : 189, // "useContentSize" is broken on Windows when not resizable
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
        sendMessage(parentWindow, "cancel-export");
      } else if (typeof event.data === "string") {
        // Help button
        shell.openExternal(event.data);
      } else if (typeof event.data === "object") {
        // Confirm
        let exportOptions: ExportOptions = event.data;
        let extension = exportOptions.format.startsWith("csv") ? "csv" : exportOptions.format;
        let defaultPath = undefined;
        if (currentLogPath !== null) {
          let pathComponents = currentLogPath.split(".");
          pathComponents.pop();
          defaultPath = pathComponents.join(".") + "." + extension;
        }
        let fileFilters: FileFilter[] = [];
        switch (extension) {
          case "csv":
            fileFilters = [{ name: "Comma-separated values", extensions: ["csv"] }];
            break;
          case "wpilog":
            fileFilters = [{ name: "WPILib robot log", extensions: ["wpilog"] }];
            break;
          case "mcap":
            fileFilters = [{ name: "MCAP log", extensions: ["mcap"] }];
            break;
        }
        dialog
          .showSaveDialog(exportWindow, {
            title: "Select export location for robot log",
            defaultPath: defaultPath,
            properties: ["createDirectory", "showOverwriteConfirmation", "dontAddToRecent"],
            filters: fileFilters
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
    port2.postMessage({ supportsAkit: supportsAkit });
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
function createSatellite(
  config:
    | {
        parentWindow: Electron.BrowserWindow;
        uuid: string;
        type: TabType;
      }
    | {
        state: SatelliteWindowState;
      }
) {
  const configData = !("state" in config)
    ? (config as {
        parentWindow: Electron.BrowserWindow;
        uuid: string;
        type: TabType;
      })
    : undefined;
  const state = "state" in config ? config.state : undefined;

  const width = state === undefined ? SATELLITE_DEFAULT_WIDTH : state.width;
  const height = state === undefined ? SATELLITE_DEFAULT_HEIGHT : state.height;
  const x =
    configData === undefined
      ? state?.x
      : Math.floor(configData.parentWindow.getBounds().x + configData.parentWindow.getBounds().width / 2 - width / 2);
  const y =
    configData === undefined
      ? state?.y
      : Math.floor(configData.parentWindow.getBounds().y + configData.parentWindow.getBounds().height / 2 - height / 2);
  const satellite = new BrowserWindow({
    width: width,
    height: height,
    x: x,
    y: y,
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
  let firstLoad = true;
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
          select3DCameraPopup(satellite, message.data.options, message.data.selectedIndex, message.data.fov);
          break;

        case "save-state":
          stateTracker.saveRendererState(satellite, message.data);
          break;
      }
    });
    port2.start();
    sendMessage(satellite, "set-assets", advantageScopeAssets);
    sendMessage(satellite, "set-battery", powerMonitor.isOnBatteryPower());
    if (firstLoad) {
      if (configData !== undefined) {
        sendMessage(satellite, "set-type", configData.type);
      } else if (state !== undefined) {
        sendMessage(satellite, "restore-state", state.state);
      }
    } else {
      let cachedState = stateTracker.getRendererState(satellite);
      if (cachedState !== undefined) {
        sendMessage(satellite, "restore-state", stateTracker.getRendererState(satellite));
      }
    }
    sendAllPreferences();
    firstLoad = false;
  });
  powerMonitor.on("on-ac", () => sendMessage(satellite, "set-battery", false));
  powerMonitor.on("on-battery", () => sendMessage(satellite, "set-battery", true));

  const uuid = configData !== undefined ? configData.uuid : state!.uuid;
  if (!(uuid in satelliteWindows)) {
    satelliteWindows[uuid] = [];
  }
  satelliteWindows[uuid].push(satellite);
  stateTracker.saveSatelliteIds(satelliteWindows);
  satellite.once("closed", () => {
    satelliteWindows[uuid!].splice(satelliteWindows[uuid!].indexOf(satellite), 1);
    stateTracker.saveSatelliteIds(satelliteWindows);
  });
}

/**
 * Creates a new preferences window if it doesn't already exist.
 * @param parentWindow The parent window to use for alignment
 */
function openPreferences(parentWindow: Electron.BrowserWindow) {
  if (prefsWindow !== null && !prefsWindow.isDestroyed()) {
    prefsWindow.focus();
    return;
  }

  const width = 400;
  const rows = 10;
  const height = process.platform === "win32" ? rows * 27 + 114 : rows * 27 + 54; // "useContentSize" is broken on Windows when not resizable
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
  prefsWindow.setFullScreenable(false); // Call separately b/c the normal behavior is broken: https://github.com/electron/electron/pull/39086
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
  if (downloadWindow !== null && !downloadWindow.isDestroyed()) {
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
  downloadWindow.setFullScreenable(false); // Call separately b/c the normal behavior is broken: https://github.com/electron/electron/pull/39086
  downloadWindow.once("ready-to-show", downloadWindow.show);
  downloadWindow.once("close", downloadStop);
  downloadWindow.webContents.on("dom-ready", () => {
    // Create ports on reload
    if (downloadWindow === null) return;
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

/**
 * Creates a new licenses window if it doesn't already exist.
 * @param parentWindow The parent window to use for alignment
 */
function openLicenses(parentWindow: Electron.BrowserWindow) {
  if (licensesWindow !== null && !licensesWindow.isDestroyed()) {
    licensesWindow.focus();
    return;
  }

  const width = 600;
  const height = 625;
  licensesWindow = new BrowserWindow({
    width: width,
    height: height,
    minWidth: width,
    minHeight: height,
    x: Math.floor(parentWindow.getBounds().x + parentWindow.getBounds().width / 2 - width / 2),
    y: Math.floor(parentWindow.getBounds().y + parentWindow.getBounds().height / 2 - height / 2),
    resizable: true,
    icon: WINDOW_ICON,
    show: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  // Finish setup
  licensesWindow.setMenu(null);
  licensesWindow.setFullScreenable(false); // Call separately b/c the normal behavior is broken: https://github.com/electron/electron/pull/39086
  licensesWindow.once("ready-to-show", licensesWindow.show);
  licensesWindow.once("close", downloadStop);
  licensesWindow.loadFile(path.join(__dirname, "../www/licenses.html"));
}

// APPLICATION EVENTS

// Workaround to set menu bar color on some Linux environments
if (process.platform === "linux" && fs.existsSync(PREFS_FILENAME)) {
  let prefs: Preferences = jsonfile.readFileSync(PREFS_FILENAME);
  if (prefs.theme === "dark") {
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

/** Returns the default path to use for storing log files. */
function getDefaultLogPath(): string | undefined {
  if (process.platform !== "win32") return undefined;
  let prefs: Preferences = jsonfile.readFileSync(PREFS_FILENAME);
  if (prefs.skipFrcLogFolderDefault) return undefined;
  prefs.skipFrcLogFolderDefault = true;
  jsonfile.writeFileSync(PREFS_FILENAME, prefs);
  sendAllPreferences();
  return FRC_LOG_FOLDER;
}

// "unsafe-eval" is required in the hub for protobufjs
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

app.whenReady().then(() => {
  // Check preferences and set theme
  if (!fs.existsSync(PREFS_FILENAME)) {
    jsonfile.writeFileSync(PREFS_FILENAME, DEFAULT_PREFS);
    nativeTheme.themeSource = DEFAULT_PREFS.theme;
  } else {
    let oldPrefs = jsonfile.readFileSync(PREFS_FILENAME);
    let prefs = DEFAULT_PREFS;
    if (
      "theme" in oldPrefs &&
      (oldPrefs.theme === "light" || oldPrefs.theme === "dark" || oldPrefs.theme === "system")
    ) {
      prefs.theme = oldPrefs.theme;
    }
    if ("rioAddress" in oldPrefs && typeof oldPrefs.rioAddress === "string") {
      prefs.rioAddress = oldPrefs.rioAddress;
    }
    if ("address" in oldPrefs && typeof oldPrefs.address === "string") {
      // Migrate from v1
      prefs.rioAddress = oldPrefs.address;
    }
    if ("rioPath" in oldPrefs && typeof oldPrefs.rioPath === "string") {
      prefs.rioPath = oldPrefs.rioPath;
    }
    if (
      "liveMode" in oldPrefs &&
      (oldPrefs.liveMode === "nt4" ||
        oldPrefs.liveMode === "nt4-akit" ||
        oldPrefs.liveMode === "phoenix" ||
        oldPrefs.liveMode === "pathplanner" ||
        oldPrefs.liveMode === "rlog")
    ) {
      prefs.liveMode = oldPrefs.liveMode;
    }
    if (
      "liveSubscribeMode" in oldPrefs &&
      (oldPrefs.liveSubscribeMode === "low-bandwidth" || oldPrefs.liveSubscribeMode === "logging")
    ) {
      prefs.liveSubscribeMode = oldPrefs.liveSubscribeMode;
    }
    if ("liveDiscard" in oldPrefs && typeof oldPrefs.liveDiscard === "number") {
      prefs.liveDiscard = oldPrefs.liveDiscard;
    }
    if ("publishFilter" in oldPrefs && typeof oldPrefs.publishFilter === "string") {
      prefs.publishFilter = oldPrefs.publishFilter;
    }
    if ("rlogPort" in oldPrefs && typeof oldPrefs.rlogPort === "number") {
      prefs.rlogPort = oldPrefs.rlogPort;
    }
    if ("threeDimensionMode" in oldPrefs) {
      // Migrate from v2
      switch (oldPrefs.threeDimensionMode) {
        case "quality":
          prefs.threeDimensionModeAc = "standard";
          prefs.threeDimensionModeBattery = "";
          break;
        case "efficiency":
          prefs.threeDimensionModeAc = "low-power";
          prefs.threeDimensionModeBattery = "";
          break;
        case "auto":
          prefs.threeDimensionModeAc = "standard";
          prefs.threeDimensionModeBattery = "low-power";
          break;
        default:
          break;
      }
    }
    if (
      "threeDimensionModeAc" in oldPrefs &&
      (oldPrefs.threeDimensionModeAc === "cinematic" ||
        oldPrefs.threeDimensionModeAc === "standard" ||
        oldPrefs.threeDimensionModeAc === "low-power")
    ) {
      prefs.threeDimensionModeAc = oldPrefs.threeDimensionModeAc;
    }
    if (
      "threeDimensionModeBattery" in oldPrefs &&
      (oldPrefs.threeDimensionModeBattery === "" ||
        oldPrefs.threeDimensionModeBattery === "cinematic" ||
        oldPrefs.threeDimensionModeBattery === "standard" ||
        oldPrefs.threeDimensionModeBattery === "low-power")
    ) {
      prefs.threeDimensionModeBattery = oldPrefs.threeDimensionModeBattery;
    }
    if ("tbaApiKey" in oldPrefs && typeof oldPrefs.tbaApiKey === "string") {
      prefs.tbaApiKey = oldPrefs.tbaApiKey;
    }
    if (
      "userAssetsFolder" in oldPrefs &&
      typeof oldPrefs.userAssetsFolder === "string" &&
      fs.existsSync(oldPrefs.userAssetsFolder)
    ) {
      prefs.userAssetsFolder = oldPrefs.userAssetsFolder;
    }
    if ("skipHootNonProWarning" in oldPrefs && typeof oldPrefs.skipHootNonProWarning === "boolean") {
      prefs.skipHootNonProWarning = oldPrefs.skipHootNonProWarning;
    }
    if ("skipFrcLogFolderDefault" in oldPrefs && typeof oldPrefs.skipFrcLogFolderDefault === "boolean") {
      prefs.skipFrcLogFolderDefault = oldPrefs.skipFrcLogFolderDefault;
    }
    jsonfile.writeFileSync(PREFS_FILENAME, prefs);
    nativeTheme.themeSource = prefs.theme;
  }

  // Load assets
  createAssetFolders();
  convertLegacyAssets();
  startAssetDownload(() => {
    advantageScopeAssets = loadAssets();
    sendAssets();
  });
  setInterval(() => {
    // Periodically load assets in case they are updated
    advantageScopeAssets = loadAssets();
    sendAssets();
  }, 5000);
  advantageScopeAssets = loadAssets();

  // Create menu and windows
  setupMenu();
  let applicationState = stateTracker.getSavedApplicationState();
  let targetWindow: BrowserWindow | null = null;
  if (applicationState === null || applicationState.hubs.length === 0) {
    targetWindow = createHubWindow();
  } else {
    applicationState.hubs.forEach((hubState, index) => {
      let hubWindow = createHubWindow(hubState);
      if (index === 0) targetWindow = hubWindow;
    });
    applicationState.satellites.forEach((satelliteState) => {
      createSatellite({ state: satelliteState });
    });
  }

  // Check for file path given as argument
  let argv = [...process.argv];
  argv.shift(); // Remove executable path
  if (!app.isPackaged) {
    argv.shift(); // Remove bundle path in dev mode
  }
  argv = argv.filter((arg) => !arg.startsWith("--"));
  if (argv.length > 0) {
    firstOpenPath = argv[0];
  }

  // Open file if exists
  if (firstOpenPath !== null && targetWindow !== null) {
    targetWindow.webContents.once("dom-ready", () => {
      sendMessage(targetWindow!, "open-files", [firstOpenPath]);
    });
  }

  // Create new window if activated while none exist
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createHubWindow();
  });

  // Check for update and show button on hub windows (but don't prompt)
  if (DISTRIBUTOR === Distributor.FRC6328) {
    checkForUpdate(false);
  }

  // Copy current owlet version to cache
  copyOwlet();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// macOS only, Linux & Windows start a new process and pass the file as an argument
app.on("open-file", (_, path) => {
  if (app.isReady()) {
    // Already running, create a new window
    let window = createHubWindow();
    window.webContents.once("dom-ready", () => {
      sendMessage(window, "open-files", [path]);
    });
  } else {
    // Not running yet, open in first window
    firstOpenPath = path;
  }
});

// Clean up files on quit
app.on("quit", () => {
  fs.unlink(LAST_OPEN_FILE, () => {});
  VideoProcessor.cleanup();
});
