// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { hex } from "color-convert";
import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  clipboard,
  dialog,
  FileFilter,
  Menu,
  MenuItem,
  MessageChannelMain,
  MessagePortMain,
  nativeImage,
  nativeTheme,
  powerMonitor,
  shell,
  TitleBarOverlay,
  TouchBar,
  TouchBarSlider
} from "electron";
import fs from "fs";
import jsonfile from "jsonfile";
import os from "os";
import path from "path";
import { Readable } from "stream";
import { AdvantageScopeAssets } from "../../shared/AdvantageScopeAssets";
import ButtonRect from "../../shared/ButtonRect";
import { ensureThemeContrast } from "../../shared/Colors";
import ExportOptions from "../../shared/ExportOptions";
import { Field2dCameraMode } from "../../shared/Field2dCameraMode";
import LineGraphFilter from "../../shared/LineGraphFilter";
import { LiveSourceInfo } from "../../shared/LiveSourceInfo";
import NamedMessage from "../../shared/NamedMessage";
import Preferences, { DEFAULT_PREFS, mergePreferences } from "../../shared/Preferences";
import { SourceListConfig, SourceListItemState, SourceListTypeMemory } from "../../shared/SourceListConfig";
import TabType, {
  getAllTabTypes,
  getDefaultTabTitle,
  getTabAccelerator,
  getTabIcon,
  NEW_TAB_TYPES
} from "../../shared/TabType";
import { BUILD_DATE, COPYRIGHT } from "../../shared/buildConstants";
import { Units } from "../../shared/units";
import { createUUID, formatDate } from "../../shared/util";
import { GITHUB_REPOSITORY } from "../github";
import {
  AKIT_PATH_INPUT,
  AKIT_PATH_INPUT_PERIOD,
  AKIT_PATH_OUTPUT,
  APP_VERSION,
  HUB_DEFAULT_HEIGHT,
  HUB_DEFAULT_WIDTH,
  PREFS_FILENAME,
  RECENT_UNITS_FILENAME,
  SATELLITE_DEFAULT_HEIGHT,
  SATELLITE_DEFAULT_WIDTH,
  TYPE_MEMORY_FILENAME,
  WINDOW_ICON
} from "./ElectronConstants";
import StateTracker, { ApplicationState, SatelliteWindowState, WindowState } from "./StateTracker";
import { VideoProcessor } from "./VideoProcessor";
import { createAssetFolders, getUserAssetsPath, loadAssets } from "./assetLoader";
import { readCandumpExtras } from "./importerFiles";

// Dynamically load lzma-native to handle platforms without prebuilt binaries
let lzma: typeof import("lzma-native") | null = null;
try {
  lzma = require("lzma-native");
} catch (e) {}

const csvFiles = new WeakMap<
  BrowserWindow,
  Map<string, { path: string; size: number; mtime: number; remove: boolean }>
>();

// Global variables
let hubWindows: BrowserWindow[] = []; // Ordered by last focus time (recent first)
let prefsWindow: BrowserWindow | null = null;
let licensesWindow: BrowserWindow | null = null;
let satelliteWindows: { [id: string]: BrowserWindow[] } = {};
let windowPorts: { [id: number]: MessagePortMain } = {};
let hubTouchBarSliders: { [id: number]: TouchBarSlider } = {};
let hubExportingIds: Set<number> = new Set();
let menuTemplate: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] | null = null;

let stateTracker = new StateTracker();
let firstOpenPath: string | null = null; // Cache path to open immediately

let advantageScopeAssets: AdvantageScopeAssets = {
  field2ds: [],
  loadFailures: []
};

// Live sources (from LiveSourceRegistry, reported by the hub)
let liveSources: LiveSourceInfo[] = [];

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
  if (menuTemplate !== null) {
    const selectedLiveSource = getSelectedLiveSourceId(data);
    liveSources.forEach((source) => {
      const item = findMenuTemplateItem(menuTemplate!, "live-source-" + source.id);
      if (item !== undefined) item.checked = source.id === selectedLiveSource;
    });
    findMenuTemplateItem(menuTemplate, "custom-assets-folder")!.checked = data.userAssetsFolder !== null;
    let menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
    BrowserWindow.getAllWindows().forEach((w) => {
      if (!hubWindows.includes(w)) w.setMenu(null);
    });
  }
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

/** Sends the list of active satellites to all hub windows. */
function sendActiveSatellites() {
  let activeSatellites: string[] = [];
  Object.entries(satelliteWindows).forEach(([uuid, windows]) => {
    if (windows.length > 0) {
      activeSatellites.push(uuid);
    }
  });
  hubWindows.forEach((window) => {
    sendMessage(window, "set-active-satellites", activeSatellites);
  });
}

// One recovery prompt per incident. Recovery is explicit and never automatically replays
// a log or the failed selected tab, avoiding a renderer crash/reload loop.
function installRendererRecovery(window: BrowserWindow, isHub: boolean) {
  let prompting = false;
  const recover = async (reason: string) => {
    if (prompting || window.isDestroyed()) return;
    prompting = true;
    try {
      const result = await dialog.showMessageBox(window, {
        type: "error",
        title: "Telemetry view stopped",
        message: "The telemetry view stopped responding.",
        detail: `${reason}. Reload to recover. Your layout will be kept; reopen the log when ready.`,
        buttons: ["Reload", "Keep window"],
        defaultId: 0,
        cancelId: 1
      });
      if (result.response === 0 && !window.isDestroyed()) {
        if (isHub) {
          const cached = stateTracker.getRendererState(window);
          if (cached) {
            const safe = structuredClone(cached);
            safe.tabs.selected = 0;
            safe.tabs.tabs.forEach((tab: { type: TabType; controller: unknown }) => {
              if (tab.type === TabType.LineGraph && tab.controller && typeof tab.controller === "object")
                Object.assign(tab.controller, { lapMode: "time" });
            });
            stateTracker.saveRendererState(window, safe);
          }
        }
        window.webContents.reload();
      }
    } finally {
      prompting = false;
    }
  };
  window.webContents.on("render-process-gone", (_event, details) => {
    if (details.reason !== "clean-exit") void recover(`Renderer exited (${details.reason})`);
  });
  window.on("unresponsive", () => void recover("Renderer is unresponsive"));
}

/**
 * Process a message from a hub window.
 * @param window The source hub window
 * @param message The received message
 */
async function handleHubMessage(window: BrowserWindow, message: NamedMessage) {
  if (window.isDestroyed()) return;
  let windowId = window.id;
  switch (message.name) {
    case "show":
      window.show();
      break;

    case "alert":
      dialog.showMessageBox(window, {
        type: "info",
        title: "Alert",
        message: message.data.title,
        detail: message.data.content,
        icon: WINDOW_ICON
      });
      break;

    case "show-open-log": {
      const item = Menu.getApplicationMenu()?.getMenuItemById("open-log");
      item?.click(undefined, window, undefined);
      break;
    }

    case "open-files-request":
      openFilesSmart(message.data.files, window);
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

    case "save-type-memory":
      let typeMemory: SourceListTypeMemory = fs.existsSync(TYPE_MEMORY_FILENAME)
        ? jsonfile.readFileSync(TYPE_MEMORY_FILENAME)
        : {};
      let originalTypeMemoryStr = JSON.stringify(typeMemory);
      Object.entries(message.data as SourceListTypeMemory).forEach(([memoryId, fields]) => {
        if (memoryId in typeMemory) {
          typeMemory[memoryId] = { ...typeMemory[memoryId], ...fields };
        } else {
          typeMemory[memoryId] = fields;
        }
      });
      let newTypeMemoryStr = JSON.stringify(typeMemory);
      if (originalTypeMemoryStr !== newTypeMemoryStr) {
        await jsonfile.writeFile(TYPE_MEMORY_FILENAME, typeMemory);
      }
      break;

    case "update-preferences":
      {
        let prefs: Preferences = jsonfile.readFileSync(PREFS_FILENAME);
        mergePreferences(prefs, message.data);
        jsonfile.writeFileSync(PREFS_FILENAME, prefs);
        sendAllPreferences();
      }
      break;

    case "set-live-sources":
      if (JSON.stringify(liveSources) !== JSON.stringify(message.data)) {
        liveSources = message.data;
        setupMenu();
      }
      break;

    case "historical-start-raw":
      {
        const uuid: string = message.data.uuid;
        const data: Uint8Array = message.data.data;
        const extension: string = message.data.extension;

        // Prevent path traversal
        if (extension.includes("/") || extension.includes("\\") || extension.includes("..")) {
          sendMessage(window, "historical-data", {
            files: [null],
            error: "Invalid log extension",
            uuid: uuid
          });
          break;
        }

        let tempPath = path.join(app.getPath("temp"), "child_" + createUUID() + "." + extension);
        fs.writeFile(tempPath, data, (err) => {
          if (!err) {
            handleHubMessage(window, {
              name: "historical-start",
              data: {
                uuid: uuid,
                path: tempPath,
                deleteAfterRead: true
              }
            });
          } else {
            sendMessage(window, "historical-data", {
              files: [null],
              error: err.message,
              uuid: uuid
            });
          }
        });
      }
      break;

    case "historical-csv-read": {
      const { uuid, id, offset, length } = message.data;
      const source = csvFiles.get(window)?.get(uuid);
      (async () => {
        let file: fs.promises.FileHandle | undefined;
        try {
          if (!source) throw new Error("CSV source is closed");
          if (
            !Number.isSafeInteger(offset) ||
            offset < 0 ||
            !Number.isSafeInteger(length) ||
            length < 0 ||
            length > 4 * 1024 * 1024
          )
            throw new Error("Invalid CSV read range");
          file = await fs.promises.open(source.path, "r");
          const stat = await file.stat();
          if (stat.size !== source.size || stat.mtimeMs !== source.mtime)
            throw new Error("CSV file changed while open; reopen it to continue");
          const data = Buffer.alloc(Math.min(length, Math.max(0, source.size - offset)));
          const { bytesRead } = await file.read(data, 0, data.length, offset);
          if (bytesRead !== data.length) throw new Error("Unexpected end of CSV file");
          sendMessage(window, "historical-data", { uuid, csvRead: { id, data } });
        } catch (error) {
          sendMessage(window, "historical-data", {
            uuid,
            csvRead: { id, error: "Could not read CSV: " + String(error) }
          });
        } finally {
          await file?.close();
        }
      })();
      break;
    }
    case "historical-csv-close": {
      const source = csvFiles.get(window)?.get(message.data.uuid);
      csvFiles.get(window)?.delete(message.data.uuid);
      if (source?.remove) fs.rm(source.path, { force: true }, () => {});
      break;
    }
    case "historical-start":
      {
        // Record opened files
        const uuid: string = message.data.uuid;
        const logPath: string = message.data.path;
        if (!message.data.deleteAfterRead) {
          app.addRecentDocument(logPath);
          // Writing this file is a supplemental task, so we don't need to block/ensure success
          fs.writeFile(AKIT_PATH_OUTPUT, logPath, () => {});
        }

        if (logPath.endsWith(".csv")) {
          try {
            const stat = fs.statSync(logPath);
            fs.accessSync(logPath, fs.constants.R_OK);
            if (!stat.isFile()) throw new Error("CSV source is not a regular file");
            if (!Number.isSafeInteger(stat.size)) throw new Error("CSV file exceeds the supported byte offset limit");
            let sources = csvFiles.get(window);
            if (!sources) {
              sources = new Map();
              csvFiles.set(window, sources);
              window.once("closed", () => {
                sources!.forEach((source) => {
                  if (source.remove) fs.rm(source.path, { force: true }, () => {});
                });
                sources!.clear();
              });
            }
            sources.set(uuid, {
              path: logPath,
              size: stat.size,
              mtime: stat.mtimeMs,
              remove: !!message.data.deleteAfterRead
            });
            const enumPath = logPath + ".enums.json";
            const sidecar = fs.existsSync(enumPath) ? fs.readFileSync(enumPath) : null;
            sendMessage(window, "historical-data", {
              uuid,
              files: [new Uint8Array(0), sidecar],
              csvSize: stat.size,
              error: null
            });
          } catch (error) {
            sendMessage(window, "historical-data", {
              uuid,
              files: [null],
              error: "Could not open CSV: " + String(error)
            });
          }
          break;
        }

        // Send data if all file reads finished
        let completedCount = 0;
        let targetCount = 0;
        let errorMessage: null | string = null;
        let paths: string[] = typeof logPath === "string" ? [logPath] : logPath;
        let pathsToRemove: string[] = [];
        if (message.data.deleteAfterRead) {
          pathsToRemove.push(...paths);
        }

        let sendIfReady = () => {
          if (completedCount === targetCount) {
            pathsToRemove.forEach((p) => {
              if (fs.existsSync(p)) fs.rmSync(p, { force: true });
            });

            sendMessage(window, "historical-data", {
              files: results,
              error: errorMessage,
              uuid: uuid
            });
          }
        };

        // Read data from file
        let results: (Buffer | null)[] = [null];
        let openPath = (path: string, callback: (buffer: Buffer) => void) => {
          fs.open(path, "r", (error, file) => {
            if (error) {
              completedCount++;
              sendIfReady();
              return;
            }
            fs.readFile(file, (error, buffer) => {
              completedCount++;
              if (!error) {
                callback(buffer);
              }
              sendIfReady();
            });
          });
        };
        if (logPath.endsWith(".wpilogxz")) {
          // Externally compressed WPILOG, decompress
          targetCount += 1;
          if (lzma === null) {
            errorMessage = "Compressed WPILOG files (.wpilogxz) are not supported on this platform.";
            completedCount++;
            sendIfReady();
          } else {
            fs.open(logPath, "r", (error, file) => {
              if (error) {
                completedCount++;
                sendIfReady();
                return;
              }
              fs.readFile(file, (error, compressedBuffer) => {
                if (error) {
                  completedCount++;
                  sendIfReady();
                }
                const inputStream = Readable.from(compressedBuffer);
                const decompressor = lzma.createDecompressor();
                const chunks: any[] = [];
                let totalLength = 0;
                inputStream.pipe(decompressor);
                decompressor.on("data", (chunk) => {
                  chunks.push(chunk);
                  totalLength += chunk.length;
                });
                decompressor.on("error", () => {
                  results[0] = Buffer.concat(chunks, totalLength);
                  completedCount++;
                  sendIfReady();
                });
                decompressor.on("end", () => {
                  results[0] = Buffer.concat(chunks, totalLength);
                  completedCount++;
                  sendIfReady();
                });
              });
            });
          }
        } else {
          // Normal log, open normally
          targetCount += 1;
          openPath(logPath, (buffer) => (results[0] = buffer));
          if (logPath.endsWith(".csv")) {
            const enumPath = logPath + ".enums.json";
            results.push(fs.existsSync(enumPath) ? fs.readFileSync(enumPath) : null);
          }
          if (logPath.endsWith(".log") || /\.(mf4|mdf)$/i.test(logPath)) {
            // candump sidecars and DBC folder (see importerFiles.ts)
            let prefs: Preferences = jsonfile.readFileSync(PREFS_FILENAME);
            results.push(...readCandumpExtras(logPath, prefs.dbcFolder ?? ""));
          }
        }
      }
      break;

    case "open-link":
      shell.openExternal(message.data);
      break;

    case "ask-open-sidebar-context-menu":
      const fieldCopyMenu = new Menu();
      fieldCopyMenu.append(
        new MenuItem({
          label: `Copy "${message.data.title}" to clipboard`,
          click() {
            clipboard.writeText(message.data.title);
          }
        })
      );
      fieldCopyMenu.append(
        new MenuItem({
          label: `Copy "${message.data.fullTitle}" to clipboard`,
          click() {
            clipboard.writeText(message.data.fullTitle);
          }
        })
      );
      fieldCopyMenu.popup({
        window: window,
        x: Math.round(message.data.position[0]),
        y: Math.round(message.data.position[1])
      });
      break;

    case "ask-open-tuning-context-menu":
      const tuningMenu = new Menu();
      tuningMenu.append(
        new MenuItem({
          label: "Copy Tuned Values",
          enabled: message.data.isTuningMode,
          click() {
            clipboard.writeText(message.data.values);
          }
        })
      );
      tuningMenu.popup({
        window: window,
        x: Math.round(message.data.position[0]),
        y: Math.round(message.data.position[1])
      });
      break;

    case "open-app-menu":
    case "close-app-menu":
      {
        let index: number = message.data.index;
        if (index >= 2) index++; // Account for edit menu
        let appMenu = Menu.getApplicationMenu();
        if (appMenu === null || index >= appMenu.items.length) return;
        let submenu = appMenu.items[index].submenu;
        if (submenu === undefined) return;
        if (message.name === "open-app-menu") {
          const rect: ButtonRect = message.data.rect;
          submenu.popup({
            window: window,
            x: Math.round(rect.x),
            y: Math.ceil(rect.y + rect.height)
          });
        } else {
          submenu.closePopup(window);
        }
      }
      break;

    case "ask-playback-options":
      const playbackOptionsMenu = new Menu();
      Array(0.25, 0.5, 1, 1.5, 2, 4, 8).forEach((value) => {
        playbackOptionsMenu.append(
          new MenuItem({
            label: (value * 100).toString() + "%",
            type: "checkbox",
            checked: value === message.data.speed,
            click() {
              sendMessage(window, "set-playback-options", { speed: value, looping: message.data.looping });
            }
          })
        );
      });
      playbackOptionsMenu.append(
        new MenuItem({
          type: "separator"
        })
      );
      playbackOptionsMenu.append(
        new MenuItem({
          label: "Loop Visible Range",
          type: "checkbox",
          checked: message.data.looping,
          click() {
            sendMessage(window, "set-playback-options", { speed: message.data.speed, looping: !message.data.looping });
          }
        })
      );
      const rect: ButtonRect = message.data.rect;
      playbackOptionsMenu.popup({
        window: window,
        x: Math.round(rect.x + rect.width),
        y: Math.round(rect.y)
      });
      break;

    case "ask-new-tab":
      newTabPopup(window, message.data);
      break;

    case "source-list-type-prompt":
      {
        let uuid: string = message.data.uuid;
        let config: SourceListConfig = message.data.config;
        let state: SourceListItemState = message.data.state;
        let rect: ButtonRect = message.data.rect;
        const menu = new Menu();

        let respond = () => {
          sendMessage(window, "source-list-type-response", {
            uuid: uuid,
            state: state
          });
        };

        const critical = message.data.criticalLimits;
        if (critical) {
          for (const side of ["low", "high"] as const) {
            menu.append(
              new MenuItem({
                label: side === "low" ? "Set critical minimum" : "Set critical maximum",
                click() {
                  handleHubMessage(window, {
                    name: "ask-edit-critical-limit",
                    data: { ...critical, key: state.logKey, side }
                  });
                }
              })
            );
          }
          menu.popup({ window, x: Math.round(rect.x + rect.width), y: Math.round(rect.y) });
          break;
        }

        // Make color icon
        let getIcon = (value: string): Electron.NativeImage | undefined => {
          if (!value.startsWith("#")) {
            return undefined;
          }

          // Make icon with color
          const size = 15;
          const color = hex.rgb(ensureThemeContrast(value, nativeTheme.shouldUseDarkColors));
          const buf = Buffer.alloc(size * size * 4);
          for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
              const idx = (y * size + x) * 4;
              // Bitmaps are in BGR format, so reverse the directions
              buf[idx + 0] = color[2];
              buf[idx + 1] = color[1];
              buf[idx + 2] = color[0];
              buf[idx + 3] = 255;
            }
          }
          return nativeImage.createFromBitmap(buf, { height: size, width: size });
        };

        // Add options
        let currentTypeConfig = config.types.find((typeConfig) => typeConfig.key === state.type)!;
        if (currentTypeConfig.options.length === 1) {
          let optionConfig = currentTypeConfig.options[0];
          optionConfig.values.forEach((optionValue) => {
            menu.append(
              new MenuItem({
                label: optionValue.display,
                type: "checkbox",
                checked: optionValue.key === state.options[optionConfig.key],
                icon: getIcon(optionValue.key),
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
                    type: "checkbox",
                    checked: optionValue.key === state.options[optionConfig.key],
                    icon: getIcon(optionValue.key),
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
        let validTypes = config.types.filter(
          (typeConfig) =>
            typeConfig.sourceTypes.includes(state.logType) && typeConfig.childOf === currentTypeConfig.childOf
        );
        if (validTypes.length > 1) {
          if (menu.items.length > 0) {
            menu.append(
              new MenuItem({
                type: "separator"
              })
            );
          }
          validTypes.forEach((typeConfig) => {
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
                          icon: getIcon(optionValue.key),
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
          });
        }

        if (menu.items.length === 0) {
          menu.append(
            new MenuItem({
              label: "No Options",
              enabled: false
            })
          );
        }

        menu.append(
          new MenuItem({
            type: "separator"
          })
        );
        menu.append(
          new MenuItem({
            label: "Help",
            click() {
              openSourceListHelp(window, config);
            }
          })
        );
        menu.popup({
          window: window,
          x: Math.round(rect.x + rect.width),
          y: Math.round(rect.y)
        });
      }
      break;

    case "source-list-clear-prompt":
      {
        const clearMenu = new Menu();
        clearMenu.append(
          new MenuItem({
            label: "Clear All",
            click() {
              sendMessage(window, "source-list-clear-response", {
                uuid: message.data.uuid
              });
            }
          })
        );
        const rect: ButtonRect = message.data.rect;
        clearMenu.popup({
          window: window,
          x: Math.round(rect.x + rect.width),
          y: Math.round(rect.y)
        });
      }
      break;

    case "source-list-help":
      openSourceListHelp(window, message.data);
      break;

    case "ask-edit-critical-limit": {
      const { uuid, key, unit, limits, side } = message.data;
      if (side !== "low" && side !== "high") break;
      createEditRangeWindow<number | null>(
        window,
        [limits.low ?? null, limits.high ?? null],
        (range) =>
          sendMessage(window, "edit-trackside-limits", {
            uuid,
            key,
            limits: { low: range[0] ?? undefined, high: range[1] ?? undefined }
          }),
        { field: key, unit, side }
      );
      break;
    }

    case "ask-edit-axis":
      {
        let legend: string = message.data.legend;
        const editAxisMenu = new Menu();

        if (legend === "discrete") {
          let showRobotMode: boolean = message.data.showRobotMode;
          // Discrete controls
          editAxisMenu.append(
            new MenuItem({
              label: "Show Robot Mode",
              type: "checkbox",
              checked: showRobotMode,
              click() {
                sendMessage(window, "set-robot-mode-visible", { showRobotMode: !showRobotMode });
              }
            })
          );
        } else {
          // Left and right controls
          let lockedRange: [number, number] | null = message.data.lockedRange;
          let autoUnitGroup: string | "none" | "inconsistent" = message.data.autoUnitGroup;
          let autoUnitSelected: string | null = message.data.autoUnitSelected;
          let autoUnitDefault: string | null = message.data.autoUnitDefault;
          let unitConversion: Units.UIUnitOptions = message.data.unitConversion;
          let filter: LineGraphFilter = message.data.filter;

          editAxisMenu.append(
            new MenuItem({
              label: "Lock Axis",
              type: "checkbox",
              checked: lockedRange !== null,
              click() {
                sendMessage(window, "edit-axis", {
                  legend: legend,
                  lockedRange: lockedRange === null ? [null, null] : null,
                  unitConversion: unitConversion,
                  filter: filter
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
                    unitConversion: unitConversion,
                    filter: filter
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
          switch (autoUnitGroup) {
            case "none":
              editAxisMenu.append(
                new MenuItem({
                  label: "(No Unit Metadata)",
                  enabled: false
                })
              );
              break;

            case "inconsistent":
              editAxisMenu.append(
                new MenuItem({
                  label: "(Inconsistent Units)",
                  enabled: false
                })
              );
              break;

            default:
              Object.keys(Units.UNIT_GROUPS[autoUnitGroup]).forEach((unit) => {
                editAxisMenu.append(
                  new MenuItem({
                    label:
                      unit.charAt(0).toUpperCase() + unit.slice(1) + (unit === autoUnitDefault ? " [Default]" : ""),
                    type: "checkbox",
                    checked: autoUnitSelected === unit,
                    click() {
                      unitConversion.autoTarget = unit;
                      unitConversion.preset = null;
                      sendMessage(window, "edit-axis", {
                        legend: legend,
                        lockedRange: lockedRange,
                        unitConversion: unitConversion,
                        filter: filter
                      });
                    }
                  })
                );
              });
              break;
          }
          let updateRecents = (newUnitConversion: Units.UnitConversionPreset) => {
            let newUnitConversionStr = JSON.stringify(newUnitConversion);
            if (newUnitConversionStr !== JSON.stringify(Units.NoopUnitConversion)) {
              let recentUnits: Units.UnitConversionPreset[] = fs.existsSync(RECENT_UNITS_FILENAME)
                ? jsonfile.readFileSync(RECENT_UNITS_FILENAME)
                : [];
              recentUnits = recentUnits.filter((x) => JSON.stringify(x) !== newUnitConversionStr);
              recentUnits.splice(0, 0, newUnitConversion);
              while (recentUnits.length > Units.MAX_RECENT_UNITS) {
                recentUnits.pop();
              }
              jsonfile.writeFileSync(RECENT_UNITS_FILENAME, recentUnits);
            }
          };
          let recentUnits: Units.UnitConversionPreset[] = fs.existsSync(RECENT_UNITS_FILENAME)
            ? jsonfile.readFileSync(RECENT_UNITS_FILENAME)
            : [];
          editAxisMenu.append(
            new MenuItem({
              label: "Manual Units",
              type: "submenu",
              submenu: [
                {
                  label: "Edit Conversion...",
                  click() {
                    createUnitConversionWindow(
                      window,
                      unitConversion.preset ?? Units.NoopUnitConversion,
                      (newPreset) => {
                        if (newPreset === null) return;
                        unitConversion.autoTarget = null;
                        unitConversion.preset = newPreset;
                        sendMessage(window, "edit-axis", {
                          legend: legend,
                          lockedRange: lockedRange,
                          unitConversion: unitConversion,
                          filter: filter
                        });
                        updateRecents(newPreset);
                      }
                    );
                  }
                },
                {
                  label: "Recent Presets",
                  type: "submenu",
                  enabled: recentUnits.length > 0,
                  submenu: recentUnits.map((preset) => {
                    let fromToText =
                      preset.from === undefined || preset.to === undefined
                        ? ""
                        : preset.from?.replace(/(^\w|\s\w|\/\w)/g, (m) => m.toUpperCase()) +
                          " \u2192 " +
                          preset.to?.replace(/(^\w|\s\w|\/\w)/g, (m) => m.toUpperCase());
                    let factorText = preset.factor === 1 ? "" : "x" + preset.factor.toString();
                    let bothPresent = fromToText.length > 0 && factorText.length > 0;
                    return {
                      label: fromToText + (bothPresent ? ", " : "") + factorText,
                      click() {
                        unitConversion.autoTarget = null;
                        unitConversion.preset = preset;
                        sendMessage(window, "edit-axis", {
                          legend: legend,
                          lockedRange: lockedRange,
                          unitConversion: unitConversion,
                          filter: filter
                        });
                        updateRecents(preset);
                      }
                    };
                  })
                },
                {
                  type: "separator"
                },
                {
                  label: "Disable Automatic Units",
                  type: "checkbox",
                  checked: unitConversion.preset !== null,
                  click() {
                    unitConversion.autoTarget = null;
                    if (unitConversion.preset === null) {
                      unitConversion.preset = Units.NoopUnitConversion;
                    } else {
                      unitConversion.preset = null;
                    }
                    sendMessage(window, "edit-axis", {
                      legend: legend,
                      lockedRange: lockedRange,
                      unitConversion: unitConversion,
                      filter: filter
                    });
                  }
                },
                {
                  label: "Reset Conversion",
                  enabled:
                    unitConversion.preset !== null &&
                    JSON.stringify(unitConversion.preset) !== JSON.stringify(Units.NoopUnitConversion),
                  click() {
                    unitConversion.autoTarget = null;
                    unitConversion.preset = Units.NoopUnitConversion;
                    sendMessage(window, "edit-axis", {
                      legend: legend,
                      lockedRange: lockedRange,
                      unitConversion: unitConversion,
                      filter: filter
                    });
                  }
                }
              ]
            })
          );
          editAxisMenu.append(
            new MenuItem({
              type: "separator"
            })
          );
          editAxisMenu.append(
            new MenuItem({
              label: "Differentiate",
              type: "checkbox",
              checked: filter === LineGraphFilter.Differentiate,
              click() {
                sendMessage(window, "edit-axis", {
                  legend: legend,
                  lockedRange: lockedRange,
                  unitConversion: unitConversion,
                  filter:
                    filter === LineGraphFilter.Differentiate ? LineGraphFilter.None : LineGraphFilter.Differentiate
                });
              }
            })
          );
          editAxisMenu.append(
            new MenuItem({
              label: "Integrate",
              type: "checkbox",
              checked: filter === LineGraphFilter.Integrate,
              click() {
                sendMessage(window, "edit-axis", {
                  legend: legend,
                  lockedRange: lockedRange,
                  unitConversion: unitConversion,
                  filter: filter === LineGraphFilter.Integrate ? LineGraphFilter.None : LineGraphFilter.Integrate
                });
              }
            })
          );
          editAxisMenu.append(
            new MenuItem({
              type: "separator"
            })
          );
        }

        // Always include help and clear buttons
        editAxisMenu.append(
          new MenuItem({
            label: "Help",
            click() {
              openSourceListHelp(window, message.data.config);
            }
          })
        );
        editAxisMenu.append(
          new MenuItem({
            label: "Clear All",
            click() {
              sendMessage(window, "clear-axis", legend);
            }
          })
        );
        const rect: ButtonRect = message.data.rect;
        editAxisMenu.popup({
          window: window,
          x: Math.round(rect.x + rect.width),
          y: Math.round(rect.y)
        });
      }
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

    case "ask-2d-camera":
      select2DCameraPopup(window, message.data.position, message.data.selectedIndex);
      break;

    case "export-console":
      dialog
        .showSaveDialog(window, {
          title: "Select export location for console log",
          defaultPath: "Console " + formatDate() + ".txt",
          properties: ["createDirectory", "showOverwriteConfirmation", "dontAddToRecent"],
          filters: [{ name: "Text files", extensions: ["txt"] }]
        })
        .then((response) => {
          if (!response.canceled) {
            fs.writeFile(response.filePath!, message.data, (err) => {
              if (err) throw err;
            });
          }
        });
      break;

    case "prompt-export":
      if (message.data.incompleteWarning) {
        dialog
          .showMessageBox(window, {
            type: "info",
            title: "Warning",
            message: "Incomplete data for export",
            detail:
              'Some fields will not be available in the exported data. To save all fields from the server, the "Logging" live mode must be selected. Check the mur-voir documentation for details.',
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
      VideoProcessor.prepare(window, message.data.uuid, (data) => sendMessage(window, "video-data", data));
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

/** Shows a popup to create a new tab on a hub window. */
function newTabPopup(window: BrowserWindow, rect: ButtonRect) {
  if (!hubWindows.includes(window)) return;
  const newTabMenu = new Menu();
  NEW_TAB_TYPES.forEach((tabType) => {
    newTabMenu.append(
      new MenuItem({
        label: getTabIcon(tabType) + " " + getDefaultTabTitle(tabType),
        accelerator: getTabAccelerator(tabType),
        click() {
          sendMessage(window, "new-tab", tabType);
        }
      })
    );
  });
  newTabMenu.popup({
    window: window,
    x: Math.round(rect.x + rect.width),
    y: Math.round(rect.y)
  });
}

function select2DCameraPopup(window: BrowserWindow, position: [number, number], selectedIndex: Field2dCameraMode) {
  const cameraMenu = new Menu();
  cameraMenu.append(
    new MenuItem({
      label: "Unlocked",
      type: "checkbox",
      checked: selectedIndex === Field2dCameraMode.Unlocked,
      click() {
        sendMessage(window, "set-2d-camera", Field2dCameraMode.Unlocked);
      }
    })
  );
  cameraMenu.append(
    new MenuItem({
      label: "Locked to Robot",
      type: "checkbox",
      checked: selectedIndex === Field2dCameraMode.Robot,
      click() {
        sendMessage(window, "set-2d-camera", Field2dCameraMode.Robot);
      }
    })
  );
  cameraMenu.append(
    new MenuItem({
      label: "Locked to Robot && Rotation",
      type: "checkbox",
      checked: selectedIndex === Field2dCameraMode.RobotAndRotation,
      click() {
        sendMessage(window, "set-2d-camera", Field2dCameraMode.RobotAndRotation);
      }
    })
  );
  cameraMenu.popup({
    window: window,
    x: Math.round(position[0]),
    y: Math.round(position[1])
  });
}

// CREATE WINDOWS

/** Returns the ID of the selected live source, falling back to the first registered source. */
function getSelectedLiveSourceId(prefs: Preferences): string | undefined {
  return (
    liveSources.find((source) => source.id === prefs.liveMode)?.id ??
    liveSources.find((source) => source.id === "mur")?.id
  );
}

/** Finds a menu template item by ID (searching submenus recursively). */
function findMenuTemplateItem(
  items: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[],
  id: string
): Electron.MenuItemConstructorOptions | undefined {
  for (const item of items) {
    if (item.id === id) return item as Electron.MenuItemConstructorOptions;
    if (Array.isArray(item.submenu)) {
      const result = findMenuTemplateItem(item.submenu, id);
      if (result !== undefined) return result;
    }
  }
  return undefined;
}

/** Create the app menu. */
function setupMenu() {
  const isMac = process.platform === "darwin";
  const prefs: Preferences = jsonfile.readFileSync(PREFS_FILENAME);

  menuTemplate = [
    {
      role: isMac ? "appMenu" : undefined,
      label: isMac ? "" : "App",
      submenu: [
        {
          label: "About mur-voir",
          click() {
            createAboutWindow();
          }
        },
        ...(isMac ? [{ type: "separator" as const }] : []),
        {
          label: isMac ? "Settings..." : "Show Preferences...",
          accelerator: "CmdOrCtrl+,",
          click(_, baseWindow) {
            const window = baseWindow as BrowserWindow | undefined;
            if (window === undefined) return;
            openPreferences(window);
          }
        },
        {
          label: "Show Licenses...",
          click(_, baseWindow) {
            const window = baseWindow as BrowserWindow | undefined;
            if (window === undefined) return;
            openLicenses(window);
          }
        },
        { type: "separator" },
        {
          label: "Show Assets Folder",
          click() {
            shell.openPath(getUserAssetsPath());
          }
        },
        {
          id: "custom-assets-folder",
          label: "Use Custom Assets Folder",
          type: "checkbox",
          async click(item) {
            const isCustom = item.checked;
            let prefs: Preferences = await jsonfile.readFile(PREFS_FILENAME);
            if (isCustom) {
              let result = await dialog.showOpenDialog({
                title: "Select folder containing custom mur-voir assets",
                buttonLabel: "Open",
                properties: ["openDirectory", "createDirectory", "dontAddToRecent"]
              });
              if (result.filePaths.length >= 1) {
                prefs.userAssetsFolder = result.filePaths[0];
              }
            } else {
              prefs.userAssetsFolder = null;
            }
            await jsonfile.writeFile(PREFS_FILENAME, prefs);
            advantageScopeAssets = await loadAssets();
            sendAllPreferences();
            sendAssets();
          }
        },
        ...(isMac
          ? ([
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" }
            ] as const)
          : [])
      ]
    },
    {
      label: "File",
      submenu: [
        {
          id: "open-log",
          label: "Open Log(s)...",
          accelerator: "CmdOrCtrl+O",
          click(_, baseWindow) {
            const window = baseWindow as BrowserWindow | undefined;
            if (window === undefined || !hubWindows.includes(window)) return;
            dialog
              .showOpenDialog(window, {
                title: "Select the robot log file(s) to open",
                message: "If multiple files are selected, timestamps will be aligned automatically",
                properties: ["openFile", "multiSelections"],
                filters: [
                  {
                    name: "Logs",
                    extensions: ["rlog", "wpilog", "wpilogxz", "log", "csv", "jsonl", "mf4", "mdf"]
                  }
                ]
              })
              .then((files) => {
                if (files.filePaths.length > 0) {
                  openFilesSmart(files.filePaths, window!);
                }
              });
          }
        },
        {
          label: "Add New Log(s)...",
          accelerator: "CmdOrCtrl+Shift+O",
          async click(_, baseWindow) {
            const window = baseWindow as BrowserWindow | undefined;
            if (window === undefined || !hubWindows.includes(window)) return;
            dialog
              .showOpenDialog(window, {
                title: "Select the robot log file(s) to add to the current log",
                properties: ["openFile", "multiSelections"],
                filters: [
                  {
                    name: "Logs",
                    extensions: ["rlog", "wpilog", "wpilogxz", "log", "csv", "jsonl", "mf4", "mdf"]
                  }
                ]
              })
              .then((files) => {
                if (files.filePaths.length > 0) {
                  sendMessage(window!, "open-files", { files: files.filePaths, merge: true });
                }
              });
          }
        },
        {
          label: "Connect\u2026",
          accelerator: "CmdOrCtrl+K",
          click(_, baseWindow) {
            const window = baseWindow as BrowserWindow | undefined;
            if (window === undefined || !hubWindows.includes(window)) return;
            sendMessage(window, "show-connect-dialog");
          }
        },
        {
          label: "Reconnect to Live Source",
          accelerator: "CmdOrCtrl+Alt+K",
          click(_, baseWindow) {
            const window = baseWindow as BrowserWindow | undefined;
            if (window === undefined || !hubWindows.includes(window)) return;
            sendMessage(window, "start-live", "robot");
          }
        },
        {
          label: "Connect to Localhost",
          accelerator: "CmdOrCtrl+Shift+K",
          click(_, baseWindow) {
            const window = baseWindow as BrowserWindow | undefined;
            if (window === undefined || !hubWindows.includes(window)) return;
            sendMessage(window, "start-live", "sim");
          }
        },
        {
          label: "Live Source",
          type: "submenu",
          submenu: liveSources.map((source) => {
            let item: Electron.MenuItemConstructorOptions = {
              id: "live-source-" + source.id,
              label: source.name,
              type: "radio",
              checked: source.id === getSelectedLiveSourceId(prefs),
              click() {
                let prefs: Preferences = jsonfile.readFileSync(PREFS_FILENAME);
                prefs.liveMode = source.id;
                jsonfile.writeFileSync(PREFS_FILENAME, prefs);
                sendAllPreferences();
              }
            };
            return item;
          })
        },
        {
          label: "Export Data...",
          accelerator: "CmdOrCtrl+E",
          click(_, baseWindow) {
            const window = baseWindow as BrowserWindow | undefined;
            if (window === undefined || !hubWindows.includes(window)) return;
            sendMessage(window, "start-export");
          }
        },
        { type: "separator" },
        {
          label: "Export Layout...",
          click() {
            dialog
              .showSaveDialog({
                title: "Select export location for layout file",
                defaultPath: "mur-voir " + formatDate() + ".json",
                properties: ["createDirectory", "showOverwriteConfirmation", "dontAddToRecent"],
                filters: [{ name: "JSON files", extensions: ["json"] }]
              })
              .then((response) => {
                if (!response.canceled) {
                  let state = stateTracker.getCurrentApplicationState() as ApplicationState & { version: string };
                  state.version = APP_VERSION;
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
                        ? "The selected layout file uses an older format which is not compatible with the current version of mur-voir."
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

                  // Check version compatibility
                  if (app.isPackaged && data.version !== APP_VERSION) {
                    let result = dialog.showMessageBoxSync({
                      type: "warning",
                      title: "Warning",
                      message: "Version mismatch",
                      detail:
                        "The layout file was generated by a different version of mur-voir. Compatibility is not guaranteed.",
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
        {
          label: "Close Window",
          accelerator: "Shift+CmdOrCtrl+W",
          click(_, window) {
            window?.close();
          }
        }
      ]
    },
    { role: "editMenu" },

    {
      role: "viewMenu",
      submenu: [
        { role: "reload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        {
          label: "Zoom to Enabled Range",
          accelerator: "CmdOrCtrl+\\",
          click(_, baseWindow) {
            const window = baseWindow as BrowserWindow | undefined;
            if (window === undefined || !hubWindows.includes(window)) return;
            sendMessage(window, "zoom-enabled");
          }
        },
        { type: "separator" },
        {
          label: "Toggle Sidebar",
          accelerator: "CmdOrCtrl+.",
          click(_, baseWindow) {
            const window = baseWindow as BrowserWindow | undefined;
            if (window === undefined || !hubWindows.includes(window)) return;
            sendMessage(window, "toggle-sidebar");
          }
        },
        {
          label: "Toggle Controls",
          accelerator: "CmdOrCtrl+/",
          click(_, baseWindow) {
            const window = baseWindow as BrowserWindow | undefined;
            if (window === undefined || !hubWindows.includes(window)) return;
            sendMessage(window, "toggle-controls");
          }
        },
        { role: "togglefullscreen" }
      ]
    },
    {
      label: "Tabs",
      submenu: [
        {
          label: "New Tab",
          submenu: NEW_TAB_TYPES.map((tabType) => {
            return {
              label: getTabIcon(tabType) + " " + getDefaultTabTitle(tabType),
              accelerator: getTabAccelerator(tabType),
              click(_, baseWindow) {
                const window = baseWindow as BrowserWindow | undefined;
                if (window === undefined || !hubWindows.includes(window)) return;
                sendMessage(window, "new-tab", tabType);
              }
            };
          })
        },
        {
          label: "New Tab (Shortcut)", // Hidden item to add keyboard shortcut
          visible: false,
          accelerator: "CmdOrCtrl+T",
          click(_, baseWindow) {
            const window = baseWindow as BrowserWindow | undefined;
            if (window)
              newTabPopup(window, {
                x: window.getBounds().width - 12,
                y: process.platform === "win32" ? 48 : 10,
                width: 0,
                height: 0
              });
          }
        },
        {
          label: "New Pop-Out",
          accelerator: "CmdOrCtrl+Shift+T",
          click(_, baseWindow) {
            const window = baseWindow as BrowserWindow | undefined;
            if (window === undefined || !hubWindows.includes(window)) return;
            sendMessage(window, "new-satellite");
          }
        },
        { type: "separator" },
        {
          label: "Previous Tab",
          accelerator: "CmdOrCtrl+Left",
          click(_, baseWindow) {
            const window = baseWindow as BrowserWindow | undefined;
            if (window === undefined || !hubWindows.includes(window)) return;
            sendMessage(window, "move-tab", -1);
          }
        },
        {
          label: "Next Tab",
          accelerator: "CmdOrCtrl+Right",
          click(_, baseWindow) {
            const window = baseWindow as BrowserWindow | undefined;
            if (window === undefined || !hubWindows.includes(window)) return;
            sendMessage(window, "move-tab", 1);
          }
        },
        { type: "separator" },
        {
          label: "Shift Left",
          accelerator: "CmdOrCtrl+[",
          click(_, baseWindow) {
            const window = baseWindow as BrowserWindow | undefined;
            if (window === undefined || !hubWindows.includes(window)) return;
            sendMessage(window, "shift-tab", -1);
          }
        },
        {
          label: "Shift Right",
          accelerator: "CmdOrCtrl+]",
          click(_, baseWindow) {
            const window = baseWindow as BrowserWindow | undefined;
            if (window === undefined || !hubWindows.includes(window)) return;
            sendMessage(window, "shift-tab", 1);
          }
        },
        { type: "separator" },
        {
          label: "Close Tab",
          accelerator: "CmdOrCtrl+W",
          click(_, baseWindow) {
            const window = baseWindow as BrowserWindow | undefined;
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
          label: "Report a Problem",
          click() {
            shell.openExternal("https://github.com/" + GITHUB_REPOSITORY + "/issues");
          }
        },
        {
          label: "GitHub Repository",
          click() {
            shell.openExternal("https://github.com/" + GITHUB_REPOSITORY);
          }
        },
        {
          label: "Based on AdvantageScope",
          click() {
            shell.openExternal("https://github.com/Mechanical-Advantage/AdvantageScope");
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  BrowserWindow.getAllWindows().forEach((w) => {
    if (!hubWindows.includes(w)) w.setMenu(null);
  });
}

/** Creates the "About mur-voir" window. */
function createAboutWindow() {
  let detailLines: string[] = [];
  detailLines.push("Version: " + (app.isPackaged ? app.getVersion() : "Development"));
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
      message: "mur-voir",
      detail: COPYRIGHT + "\n\n" + detail,
      buttons: ["Close", process.platform === "win32" ? "Copy and Close" : "Copy & Close"],
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
function createHubWindow(state?: WindowState, layoutOverride?: any) {
  let prefs: BrowserWindowConstructorOptions = {
    minWidth: 800,
    minHeight: 400,
    icon: WINDOW_ICON,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      backgroundThrottling: false,
      webviewTag: true
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
  switch (process.platform) {
    case "darwin":
      prefs.vibrancy = "sidebar";
      prefs.titleBarStyle = "hiddenInset";
      break;
    case "win32":
      let releaseSplit = os.release().split(".");
      if (Number(releaseSplit[releaseSplit.length - 1]) >= 22621) {
        // Windows 11 22H2
        prefs.backgroundMaterial = "acrylic";
      }

      prefs.titleBarStyle = "hidden";
      let overlayOptions: TitleBarOverlay = {
        color: "#00000000",
        symbolColor: nativeTheme.shouldUseDarkColors ? "#ffffff" : "#000000",
        height: 38
      };
      prefs.titleBarOverlay = overlayOptions;
      nativeTheme.addListener("updated", () => {
        if (window) {
          overlayOptions.symbolColor = nativeTheme.shouldUseDarkColors ? "#ffffff" : "#000000";
          window.setTitleBarOverlay(overlayOptions);
        }
      });
      break;
  }

  // Create window
  let window = new BrowserWindow(prefs);
  installRendererRecovery(window, true);
  hubWindows.push(window);
  if (process.platform === "linux") {
    window.setMenuBarVisibility(false);
  }

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
                  items: NEW_TAB_TYPES.map((type) => {
                    return {
                      label: getTabIcon(type) + " " + getDefaultTabTitle(type)
                    };
                  }),
                  select(index) {
                    if (newCreated) return;
                    newCreated = true;
                    sendMessage(window, "new-tab", NEW_TAB_TYPES[index]);
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

  // Open docs URLs in browser
  window.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // Show window when loaded
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
      platformArch: app.runningUnderARM64Translation ? "arm64" : process.arch, // Arch of OS, not this binary
      appVersion: APP_VERSION
    });
    sendMessage(window, "show-when-ready");
    sendAllPreferences();
    sendActiveSatellites();
    if (fs.existsSync(TYPE_MEMORY_FILENAME)) {
      sendMessage(window, "restore-type-memory", jsonfile.readFileSync(TYPE_MEMORY_FILENAME));
    }
    if (firstLoad && layoutOverride !== undefined) {
      sendMessage(window, "restore-state", layoutOverride);
    } else if (firstLoad && state !== undefined) {
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
  window.once("closed", () => {
    const index = hubWindows.indexOf(window);
    if (index !== -1) hubWindows.splice(index, 1);
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
function createEditRangeWindow<T extends number | null = number>(
  parentWindow: Electron.BrowserWindow,
  range: [T, T],
  callback: (range: [T, T]) => void,
  limits?: { field: string; unit: string; side: "low" | "high" }
) {
  const editWindow = new BrowserWindow({
    width: limits ? 360 : 300,
    height: limits ? 160 : 108,
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
  editWindow.setMenuBarVisibility(false);
  editWindow.once("ready-to-show", editWindow.show);
  editWindow.webContents.on("dom-ready", () => {
    // Create ports on reload
    const { port1, port2 } = new MessageChannelMain();
    editWindow.webContents.postMessage("port", null, [port1]);
    port2.postMessage(limits ? { limits: true, range, ...limits } : range);
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
  unitConversion: Units.UnitConversionPreset,
  callback: (unitConversion: Units.UnitConversionPreset | null) => void
) {
  const unitConversionWindow = new BrowserWindow({
    width: 300,
    height: 162,
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
  unitConversionWindow.setMenuBarVisibility(false);
  unitConversionWindow.once("ready-to-show", unitConversionWindow.show);
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
    height: 81,
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
  renameTabWindow.setMenuBarVisibility(false);
  renameTabWindow.once("ready-to-show", renameTabWindow.show);
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
    height: 189,
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
  exportWindow.setMenuBarVisibility(false);
  exportWindow.once("ready-to-show", exportWindow.show);
  let isPreparingExport = false;
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
              isPreparingExport = true;
              exportWindow.destroy();
              sendMessage(parentWindow, "prepare-export", { path: response.filePath, options: exportOptions });
            }
          });
      }
    });
    exportWindow.on("closed", () => {
      if (!isPreparingExport) {
        sendMessage(parentWindow, "cancel-export");
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
  if (!getAllTabTypes().includes(configData?.type ?? state!.state.type)) return;
  const uuid = configData !== undefined ? configData.uuid : state!.uuid;

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
  installRendererRecovery(satellite, false);
  satellite.setMenu(null);
  satellite.setMenuBarVisibility(false);
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
          let aspectRatio = message.data.aspectRatio;
          let lock = message.data.lock;
          if (aspectRatio === null) {
            satellite.setAspectRatio(0);
          } else {
            let originalSize = satellite.getContentSize();
            let originalArea = originalSize[0] * originalSize[1];
            let newY = Math.sqrt(originalArea / aspectRatio);
            let newX = aspectRatio * newY;
            if (lock) {
              satellite.setAspectRatio(aspectRatio);
            } else {
              satellite.setAspectRatio(0);
            }
            satellite.setContentSize(Math.round(newX), Math.round(newY));
          }
          break;

        case "ask-2d-camera":
          select2DCameraPopup(satellite, message.data.position, message.data.selectedIndex);
          break;

        case "add-table-range":
          hubWindows.forEach((window) => {
            sendMessage(window, "add-table-range", {
              controllerUUID: uuid,
              rendererUUID: message.data.uuid,
              range: message.data.range
            });
          });
          break;

        case "save-state":
          stateTracker.saveRendererState(satellite, message.data);
          break;

        case "update-preferences":
          {
            let prefs: Preferences = jsonfile.readFileSync(PREFS_FILENAME);
            mergePreferences(prefs, message.data);
            jsonfile.writeFileSync(PREFS_FILENAME, prefs);
            sendAllPreferences();
          }
          break;

        case "sector-zoom":
          hubWindows.forEach((window) => {
            sendMessage(window, "sector-zoom", { uuid, focus: message.data });
          });
          break;

        case "call-selection-setter":
          message.data.uuid = configData !== undefined ? configData.uuid : state!.uuid;
          hubWindows.forEach((window) => {
            sendMessage(window, "call-selection-setter", message.data);
          });
          break;

        case "open-link":
          shell.openExternal(message.data);
          break;

        default:
          console.warn("Unknown message from satellite renderer process", message);
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
  satellite.webContents.setWindowOpenHandler((details) => {
    // Open docs URLs in browser
    shell.openExternal(details.url);
    return { action: "deny" };
  });
  powerMonitor.on("on-ac", () => sendMessage(satellite, "set-battery", false));
  powerMonitor.on("on-battery", () => sendMessage(satellite, "set-battery", true));

  if (!(uuid in satelliteWindows)) {
    satelliteWindows[uuid] = [];
  }
  satelliteWindows[uuid].push(satellite);
  stateTracker.saveSatelliteIds(satelliteWindows);
  sendActiveSatellites();
  satellite.once("closed", () => {
    satelliteWindows[uuid!].splice(satelliteWindows[uuid!].indexOf(satellite), 1);
    stateTracker.saveSatelliteIds(satelliteWindows);
    sendActiveSatellites();
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
  const optionRows = 13;
  const titleRows = 2;
  const height = optionRows * 27 + titleRows * 34 + 54;
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
  prefsWindow.setMenuBarVisibility(false);
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
  licensesWindow.setMenuBarVisibility(false);
  licensesWindow.once("ready-to-show", licensesWindow.show);
  licensesWindow.loadFile(path.join(__dirname, "../www/licenses.html"));
}

/**
 * Creates a new source list help window.
 * @param parentWindow The parent window to use for alignment
 */
function openSourceListHelp(parentWindow: Electron.BrowserWindow, config: SourceListConfig) {
  const width = 350;
  const height = 500;
  let helpWindow = new BrowserWindow({
    width: width,
    height: height,
    minWidth: width - 75,
    maxWidth: width + 250,
    minHeight: 200,
    x: Math.floor(parentWindow.getBounds().x + 30),
    y: Math.floor(parentWindow.getBounds().y + parentWindow.getBounds().height / 2 - height / 2),
    resizable: true,
    icon: WINDOW_ICON,
    show: false,
    fullscreenable: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  // Finish setup
  helpWindow.setMenu(null);
  helpWindow.setMenuBarVisibility(false);
  helpWindow.once("ready-to-show", helpWindow.show);
  helpWindow.webContents.on("dom-ready", () => {
    // Create ports on reload
    if (helpWindow === null) return;
    const { port1, port2 } = new MessageChannelMain();
    helpWindow.webContents.postMessage("port", null, [port1]);
    windowPorts[helpWindow.id] = port2;
    port2.start();

    // Init messages
    sendMessage(helpWindow, "set-config", config);
    sendAllPreferences();
  });
  helpWindow.loadFile(path.join(__dirname, "../www/sourceListHelp.html"));
}

/** Opens files without merging, using the source window if available. */
function openFilesSmart(files: string[], sourceWindow: BrowserWindow | null) {
  if (sourceWindow !== null && !sourceWindow.isDestroyed() && hubWindows.includes(sourceWindow)) {
    sendMessage(sourceWindow, "open-files", { files: files, merge: false });
  } else {
    const window = createHubWindow();
    window.webContents.once("dom-ready", () => sendMessage(window, "open-files", { files: files, merge: false }));
  }
}

// APPLICATION EVENTS

// "unsafe-eval" is required in the hub for protobufjs
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

// Silence unhandled promise rejections
process.on("unhandledRejection", () => {});

// Set WM_CLASS for Linux
if (process.platform === "linux") {
  app.setName("mur-voir");
}

app.whenReady().then(async () => {
  // Check preferences and set theme
  let prefs = DEFAULT_PREFS;
  if (process.platform === "linux") {
    prefs.theme = "light";
  }
  if (!fs.existsSync(PREFS_FILENAME)) {
    jsonfile.writeFileSync(PREFS_FILENAME, prefs);
    nativeTheme.themeSource = prefs.theme;
  } else {
    mergePreferences(prefs, jsonfile.readFileSync(PREFS_FILENAME));
    if (prefs.userAssetsFolder !== null && !fs.existsSync(prefs.userAssetsFolder)) {
      prefs.userAssetsFolder = null;
    }
    jsonfile.writeFileSync(PREFS_FILENAME, prefs);
    nativeTheme.themeSource = prefs.theme;
  }

  // Use the placeholder icon in the dock during development
  if (process.platform === "darwin" && !app.isPackaged) {
    app.dock?.setIcon(path.join(__dirname, "../icons/window-icon.png"));
  }

  // Load assets
  createAssetFolders();
  setInterval(async () => {
    // Periodically load assets in case they are updated
    advantageScopeAssets = await loadAssets();
    sendAssets();
  }, 5000);
  advantageScopeAssets = await loadAssets();

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
  let fileArgs = process.argv.filter(
    (x) =>
      x.endsWith(".wpilog") ||
      x.endsWith(".wpilogxz") ||
      x.endsWith(".rlog") ||
      x.endsWith(".log") ||
      x.endsWith(".csv") ||
      x.endsWith(".mf4") ||
      x.endsWith(".mdf") ||
      x.endsWith(".jsonl")
  );
  if (fileArgs.length > 0) {
    firstOpenPath = fileArgs[0];
  }

  // Open file if exists
  if (firstOpenPath !== null && targetWindow !== null) {
    targetWindow.webContents.once("dom-ready", () => {
      openFilesSmart([firstOpenPath!], targetWindow!);
    });
  }

  // Create new window if activated while none exist
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createHubWindow();
  });
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
      sendMessage(window, "open-files", { files: [path], merge: false });
    });
  } else {
    // Not running yet, open in first window
    firstOpenPath = path;
  }
});

// Monitor for AdvantageKit path input
if (fs.existsSync(AKIT_PATH_INPUT)) {
  fs.unlinkSync(AKIT_PATH_INPUT);
}
setInterval(() => {
  if (fs.existsSync(AKIT_PATH_INPUT)) {
    fs.readFile(AKIT_PATH_INPUT, "utf8", (error, path) => {
      if (error !== null) return;
      fs.unlinkSync(AKIT_PATH_INPUT);
      if (hubWindows.length > 0) {
        hubWindows[0].focus();
        openFilesSmart([path.trim()], hubWindows[0]);
      }
    });
  }
}, AKIT_PATH_INPUT_PERIOD);

// Clean up files on quit
app.on("quit", () => {
  fs.unlink(AKIT_PATH_OUTPUT, () => {});
  VideoProcessor.cleanup();
});
