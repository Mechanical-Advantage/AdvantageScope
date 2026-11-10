// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import TinyPopupMenu, { MenuItem, Submenu } from "tiny-popup-menu";
import WorkerManager from "../../hub/WorkerManager";
import { AdvantageScopeAssets } from "../../shared/AdvantageScopeAssets";
import { BUILD_DATE, COPYRIGHT, LITE_VERSION } from "../../shared/buildConstants";
import ButtonRect from "../../shared/ButtonRect";
import { ensureThemeContrast } from "../../shared/Colors";
import { Field2dCameraMode } from "../../shared/Field2dCameraMode";
import { HubState } from "../../shared/HubState";
import LineGraphFilter from "../../shared/LineGraphFilter";
import { LiveSourceInfo } from "../../shared/LiveSourceInfo";
import NamedMessage from "../../shared/NamedMessage";
import { DEFAULT_PREFS, mergePreferences } from "../../shared/Preferences";
import { SourceListConfig, SourceListItemState, SourceListTypeMemory } from "../../shared/SourceListConfig";
import {
  getDefaultTabTitle,
  getTabAccelerator,
  getTabIcon,
  LITE_COMPATIBLE_TABS,
  NEW_TAB_TYPES
} from "../../shared/TabType";
import { Units } from "../../shared/units";
import { GITHUB_REPOSITORY } from "../github";
import { loadAssets } from "./assetLoader";
import { LocalStorageKeys } from "./localStorageKeys";

let HUB_FRAME: HTMLIFrameElement;
let POPUP_FRAME: HTMLIFrameElement;
let POINTER_BLOCK: HTMLElement;
let TOO_SMALL_WARNING: HTMLElement;
let MOBILE_WARNING: HTMLElement;
let MENU_ANCHOR: HTMLElement;

let hubPort: MessagePort | null = null;
let popupMenu = new TinyPopupMenu();
let assetsPromise: Promise<AdvantageScopeAssets>;
let liveSources: LiveSourceInfo[] = []; // From LiveSourceRegistry, reported by the hub
let downloadInterval: number | null = null;
let popupRequiresForceClose = false;

/**
 * Open a new popup menu
 * @param rect The rectangle for the button
 * @param items The menu items to include
 */
function openMenu(rect: ButtonRect, items: (MenuItem | Submenu | "-")[]) {
  MENU_ANCHOR.style.left = rect.x.toString() + "px";
  MENU_ANCHOR.style.top = rect.y.toString() + "px";
  MENU_ANCHOR.style.width = rect.width.toString() + "px";
  MENU_ANCHOR.style.height = rect.height.toString() + "px";
  MENU_ANCHOR.onclick = (event) => {
    popupMenu.open({
      event: event,
      position: rect.y + rect.height / 2 > window.innerHeight / 2 ? "top" : "bottom",
      menuItems: items
    });
  };
  MENU_ANCHOR.click();
}
window.addEventListener("resize", () => popupMenu.close());
popupMenu.on("open", () => {
  POINTER_BLOCK.hidden = false;
});
popupMenu.on("close", () => {
  POINTER_BLOCK.hidden = true;
});

/**
 * Open a new popup window with a message port
 * @param path The path to the HTML of the popup page
 * @param size The dimensions of the popup
 * @param type Whether the dimensions are fixed pixel values or percentages
 * @param messageCallback Callback for incoming messages
 * @returns The message port for outgoing messages
 */
function openPopupWindow(
  path: string,
  size: [number, number],
  type: "pixels" | "percent",
  messageCallback?: (message: NamedMessage | any, port: MessagePort) => void,
  requireForceClose = false
): Promise<MessagePort> {
  return new Promise((resolve) => {
    popupRequiresForceClose = requireForceClose;

    if (downloadInterval !== null) {
      window.clearInterval(downloadInterval);
    }

    POPUP_FRAME.style.width = size[0].toString() + (type === "pixels" ? "px" : "%");
    POPUP_FRAME.style.height = size[1].toString() + (type === "pixels" ? "px" : "%");
    POPUP_FRAME.onload = () => {
      POPUP_FRAME.hidden = false;
      HUB_FRAME.classList.add("background");

      // Set up message ports
      const channel = new MessageChannel();
      POPUP_FRAME.contentWindow?.postMessage("port", "*", [channel.port1]);
      if (messageCallback !== undefined) {
        channel.port2.addEventListener("message", (event) => {
          messageCallback(event.data, channel.port2);
        });
      }
      channel.port2.start();
      resolve(channel.port2);

      // Close events
      if (!requireForceClose) {
        window.onclick = () => closePopupWindow();
        POPUP_FRAME.contentWindow?.addEventListener(
          "keydown",
          (event) => {
            if (event.code === "Escape") {
              closePopupWindow();
            } else {
              processKeydown(event as KeyboardEvent);
            }
          },
          { capture: true }
        );
      }
      POPUP_FRAME.contentWindow?.focus();
    };
    POPUP_FRAME.src = path;
  });
}

/** Close any open popup windows */
function closePopupWindow(forceClose = false) {
  if (popupRequiresForceClose && !forceClose) return;
  window.onclick = null;
  POPUP_FRAME.onload = null;
  POPUP_FRAME.hidden = true;
  POPUP_FRAME.src = "";
  HUB_FRAME.classList.remove("background");
  window.focus();
  if (downloadInterval !== null) {
    window.clearInterval(downloadInterval);
  }
}

/**
 * Sends a message to a port.
 * @param window The window target
 * @param name The name of the message
 * @param data Arbitrary data to include
 * @returns Whether the operation was successful
 */
function sendMessage(port: MessagePort | null, name: string, data?: any): boolean {
  try {
    port?.postMessage({ name: name, data: data });
  } catch (e) {
    return false;
  }
  return true;
}

/** Opens a popup window for source list help. */
function openSourceListHelp(config: SourceListConfig) {
  openPopupWindow("www/sourceListHelp.html", [30, 65], "percent").then((port) => {
    sendMessage(port, "set-config", config);
  });
}

/** Opens a popup window for preferences. */
function openPreferences() {
  const width = 400;
  const optionRows = 8;
  const titleRows = 2;
  const height = optionRows * 27 + titleRows * 34 + 54;
  openPopupWindow("www/preferences.html", [width, height], "pixels", (message) => {
    closePopupWindow();
    sendMessage(hubPort, "set-preferences", message);
    localStorage.setItem(LocalStorageKeys.PREFS, JSON.stringify(message));
  }).then((port) => {
    let prefs = DEFAULT_PREFS;
    let prefsRaw = localStorage.getItem(LocalStorageKeys.PREFS);
    if (prefsRaw !== null) mergePreferences(prefs, JSON.parse(prefsRaw));
    port.postMessage({ platform: "lite", prefs: prefs });
  });
}

// Keep File objects rather than duplicate large byte arrays while the importer runs.
let uploadedFiles = new Map<string, File>();

function chooseFile(accept: string, multiple: boolean, callback: (files: File[]) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.multiple = multiple;
  input.onchange = () => callback(Array.from(input.files ?? []));
  input.click();
}

function openLocalLog() {
  chooseFile(".wpilog,.wpilogxz,.rlog,.log,.csv,.jsonl,.dbc,.json", true, (files) => {
    uploadedFiles = new Map(files.map((file) => [file.name, file]));
    const logs = files.filter((file) => /\.(wpilog|wpilogxz|rlog|log|csv|jsonl)$/i.test(file.name));
    sendMessage(hubPort, "open-files", {
      files: logs.filter((file) => !file.name.endsWith(".markers.csv")).map((file) => file.name),
      merge: false
    });
  });
}

let layoutExportId = 0;
let pendingLayoutExport: { id: number; timeout: number } | null = null;

function requestLayoutExport() {
  if (pendingLayoutExport !== null) return;
  const id = ++layoutExportId;
  const timeout = window.setTimeout(() => {
    pendingLayoutExport = null;
    window.alert("Failed to export layout: the hub response timed out. Please try again.");
  }, 3000);
  pendingLayoutExport = { id, timeout };
  sendMessage(hubPort, "export-layout", id);
}

function exportLayout(state: HubState) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify({ version: LITE_VERSION, hubs: [state], satellites: [] }, null, 2)], {
      type: "application/json"
    })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "mur-voir-layout.json";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importLayout() {
  chooseFile(".json", false, async ([file]) => {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const state = data.hubs?.[0];
      if (!state?.sidebar || !Array.isArray(state.tabs?.tabs)) throw new Error("Unrecognized layout format");
      sendMessage(hubPort, "restore-state", state);
    } catch (error) {
      window.alert("Failed to import layout: " + String(error));
    }
  });
}

/** Opens a popup window for downloading logs. */
function openDownload() {
  openPopupWindow("www/download.html", [35, 65], "percent", (message, port) => {
    switch ((message as NamedMessage).name) {
      case "start":
        let path: string = message.data.path;
        let updateList = async () => {
          let response: Response;
          try {
            response = await fetch(`logs?folder=${encodeURIComponent(path)}`);
          } catch (e) {
            sendMessage(port, "show-error", "Fetch failed");
            return;
          }
          if (!response.ok) {
            if (response.status === 404) {
              sendMessage(port, "show-error", "No such file");
            } else {
              sendMessage(port, "show-error", response.statusText);
            }
          } else {
            sendMessage(port, "set-list", await response.json());
          }
        };
        updateList();
        downloadInterval = window.setInterval(() => updateList(), 3000);
        break;

      case "close":
        closePopupWindow();
        break;

      case "save":
        closePopupWindow();
        sendMessage(hubPort, "open-files", { files: message.data, merge: false });
        break;
    }
  }).then((port) => {
    let prefs = DEFAULT_PREFS;
    let prefsRaw = localStorage.getItem(LocalStorageKeys.PREFS);
    if (prefsRaw !== null) mergePreferences(prefs, JSON.parse(prefsRaw));
    sendMessage(port, "set-platform", "lite");
    sendMessage(port, "set-preferences", prefs);
  });
}

/** Opens a popup window for uploading assets. */
async function openUploadAsset() {
  let port = await openPopupWindow("www/uploadAsset.html", [360, 120], "pixels", async () => {
    closePopupWindow();
    sendMessage(hubPort, "set-assets", await loadAssets());
  });
  port.postMessage(null);
}

async function initHub() {
  // Create message ports
  const channel = new MessageChannel();
  HUB_FRAME.contentWindow?.postMessage("port", "*", [channel.port1]);
  hubPort = channel.port2;
  hubPort.addEventListener("message", (event) => {
    handleHubMessage(event.data);
  });
  hubPort.start();

  // Propagate the hub's title to the parent tab
  const hubTitleElement = HUB_FRAME.contentDocument?.querySelector("title");
  if (hubTitleElement) {
    const syncTitle = () => {
      if (hubTitleElement.textContent) document.title = hubTitleElement.textContent;
    };
    new MutationObserver(syncTitle).observe(hubTitleElement, {
      childList: true,
      characterData: true,
      subtree: true
    });
    syncTitle();
  }

  // Init messages
  sendMessage(hubPort, "set-version", {
    platform: "lite",
    platformRelease: "",
    platformArch: "",
    appVersion: LITE_VERSION
  });
  let prefs = DEFAULT_PREFS;
  let prefsRaw = localStorage.getItem(LocalStorageKeys.PREFS);
  if (prefsRaw !== null) mergePreferences(prefs, JSON.parse(prefsRaw));
  sendMessage(hubPort, "set-preferences", prefs);
  sendMessage(hubPort, "set-assets", await assetsPromise);
  let typeMemory = localStorage.getItem(LocalStorageKeys.TYPE_MEMORY);
  if (typeMemory !== null) sendMessage(hubPort, "restore-type-memory", JSON.parse(typeMemory));
  let state: HubState | null = null;
  let stateStr = localStorage.getItem(LocalStorageKeys.STATE);
  if (stateStr !== null) {
    state = JSON.parse(stateStr);
  }
  if (state !== null) sendMessage(hubPort, "restore-state", state);
  sendMessage(hubPort, "show-when-ready");

  // Add cursor event handlers
  HUB_FRAME.contentWindow?.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
  HUB_FRAME.contentWindow?.addEventListener("mousedown", (event) => {
    if (
      event.target !== null &&
      typeof event.target === "object" &&
      "tagName" in event.target &&
      typeof event.target.tagName === "string" &&
      (event.target.tagName.toLowerCase() === "input" || event.target.tagName.toLowerCase() === "select")
    ) {
      // Input, allow propagation
      return;
    }
    event.preventDefault();
  });
  HUB_FRAME.contentWindow?.addEventListener("mousemove", (event) => event.preventDefault());

  // Add key handling event
  HUB_FRAME.contentWindow?.addEventListener("keydown", (event) => processKeydown(event as KeyboardEvent), {
    capture: true
  });
}

async function handleHubMessage(message: NamedMessage) {
  switch (message.name) {
    case "show":
      HUB_FRAME.style.opacity = "100%";
      break;

    case "set-live-sources":
      liveSources = message.data;
      break;

    case "show-open-log":
      openLocalLog();
      break;

    case "open-files-request":
      sendMessage(hubPort, "open-files", { files: message.data.files, merge: false });
      break;

    case "alert":
    case "error":
      window.alert(message.data.content);
      break;

    case "export-layout":
      if (pendingLayoutExport === null || message.data.id !== pendingLayoutExport.id) break;
      window.clearTimeout(pendingLayoutExport.timeout);
      pendingLayoutExport = null;
      exportLayout(message.data.state);
      break;

    case "save-state":
      localStorage.setItem(LocalStorageKeys.STATE, JSON.stringify(message.data));
      localStorage.setItem(LocalStorageKeys.SIDEBAR_WIDTH, JSON.stringify(message.data.sidebar.width));
      break;

    case "save-type-memory":
      let typeMemoryRaw = localStorage.getItem(LocalStorageKeys.TYPE_MEMORY);
      let typeMemory: SourceListTypeMemory = typeMemoryRaw === null ? {} : JSON.parse(typeMemoryRaw);
      let originalTypeMemoryStr = JSON.stringify(typeMemory);
      Object.entries(message.data as SourceListTypeMemory).forEach(([memoryId, fields]) => {
        if (memoryId in typeMemory) {
          typeMemory[memoryId] = { ...typeMemory[memoryId], ...fields };
        } else {
          typeMemory[memoryId] = fields;
        }
      });
      let newTypeMemoryStr = JSON.stringify(typeMemory);
      if ((typeMemoryRaw === null || originalTypeMemoryStr) !== newTypeMemoryStr) {
        localStorage.setItem(LocalStorageKeys.TYPE_MEMORY, JSON.stringify(typeMemory));
      }
      break;

    case "update-preferences":
      {
        let prefs = DEFAULT_PREFS;
        let prefsRaw = localStorage.getItem(LocalStorageKeys.PREFS);
        if (prefsRaw !== null) mergePreferences(prefs, JSON.parse(prefsRaw));
        mergePreferences(prefs, message.data);
        localStorage.setItem(LocalStorageKeys.PREFS, JSON.stringify(prefs));
        sendMessage(hubPort, "set-preferences", prefs);
      }
      break;

    case "historical-start":
      {
        const uuid: string = message.data.uuid;
        const path: string = message.data.path;

        let extension = path.split(".").pop();
        let prefs = DEFAULT_PREFS;
        let prefsRaw = localStorage.getItem(LocalStorageKeys.PREFS);
        if (prefsRaw !== null) mergePreferences(prefs, JSON.parse(prefsRaw));

        try {
          const uploaded = uploadedFiles.get(path);
          let buffer: ArrayBuffer;
          if (uploaded) {
            buffer = await uploaded.arrayBuffer();
          } else {
            const response = await fetch(
              `logs/${encodeURIComponent(path)}?folder=${encodeURIComponent(prefs.remotePath)}`
            );
            if (!response.ok) throw new Error(response.statusText);
            buffer = await response.arrayBuffer();
          }
          let array = new Uint8Array(buffer);
          let error: string | null = null;
          if (extension === "wpilogxz") {
            array = await WorkerManager.request("bundles/xzWorker.js", array);
            if (array.length === 0) error = "Failed to decompress WPILOG file.";
          }

          sendMessage(hubPort, "historical-data", {
            files: await (async () => {
              const read = async (name: string) => {
                const file = uploadedFiles.get(name);
                return file ? new Uint8Array(await file.arrayBuffer()) : null;
              };
              const stem = path.replace(/\.[^.]+$/, "");
              if (extension === "csv") return [array, await read(path + ".enums.json")];
              if (extension === "log") {
                const dbcs = Array.from(uploadedFiles.values()).filter((file) => file.name.endsWith(".dbc"));
                const pack = dbcs.length
                  ? new TextEncoder().encode(
                      JSON.stringify(
                        Object.fromEntries(await Promise.all(dbcs.map(async (file) => [file.name, await file.text()])))
                      )
                    )
                  : null;
                return [array, await read(stem + ".json"), await read(stem + ".markers.csv"), pack];
              }
              return [array];
            })(),
            error: error,
            uuid: uuid
          });
        } catch (error) {
          sendMessage(hubPort, "historical-data", { files: [null], error: String(error), uuid });
        }
      }
      break;

    case "historical-start-raw":
      {
        const uuid: string = message.data.uuid;
        const extension: string = message.data.extension;

        if (extension === "wpilogxz") {
          const decompressed = await WorkerManager.request("bundles/xzWorker.js", message.data.data);
          sendMessage(hubPort, "historical-data", {
            files: [decompressed],
            error: decompressed.length === 0 ? "Failed to decompress WPILOG file." : null,
            uuid: uuid
          });
        } else {
          sendMessage(hubPort, "historical-data", {
            files: [message.data.data],
            error: null,
            uuid: uuid
          });
        }
      }
      break;

    case "open-link":
      window.open(message.data, "_blank");
      break;

    case "ask-open-sidebar-context-menu":
      // Sidebar context menu is currently not implemented in the Lite version since the only current options require HTTPS APIs (navigator.clipboard APIs).
      break;

    case "ask-open-tuning-context-menu":
      break;

    case "open-app-menu":
      {
        let menuItems: (MenuItem | Submenu | "-")[] = [];
        const modifier = navigator.userAgent.includes("Macintosh") ? "\u2318" : "Ctrl";
        switch (message.data.index) {
          case 0:
            // App menu
            menuItems = [
              {
                content: "About mur-voir Lite",
                callback() {
                  let detailLines: string[] = [];
                  detailLines.push("Version: " + LITE_VERSION);
                  detailLines.push("Build Date: " + BUILD_DATE);
                  detailLines.push("User Agent: " + navigator.userAgent);
                  let detail = detailLines.join("\n");
                  window.alert("======= mur-voir Lite =======\n" + COPYRIGHT + "\n\n" + detail);
                }
              },
              {
                content: `Show Preferences (\u21e7 ${modifier} ,)`,
                callback() {
                  openPreferences();
                }
              },
              {
                content: `Show Licenses`,
                callback() {
                  openPopupWindow("www/licenses.html", [50, 75], "percent");
                }
              }
            ];
            break;

          case 1:
            // File menu
            let prefs = DEFAULT_PREFS;
            let prefsRaw = localStorage.getItem(LocalStorageKeys.PREFS);
            if (prefsRaw !== null) mergePreferences(prefs, JSON.parse(prefsRaw));
            menuItems = [
              {
                content: `Open Log (\u21e7 ${modifier} O)`,
                callback() {
                  openLocalLog();
                }
              },
              { content: "Browse Base Station Logs…", callback: openDownload },
              { content: "Export Layout…", callback: requestLayoutExport },
              { content: "Import Layout…", callback: importLayout },
              {
                content: `Connect\u2026 (${modifier} K)`,
                callback() {
                  sendMessage(hubPort, "show-connect-dialog");
                }
              },
              {
                content: "Live Source",
                items: liveSources.map((source) => {
                  const selectedId = liveSources.find((other) => other.id === prefs.liveMode)?.id ?? liveSources[0]?.id;
                  return {
                    content: (selectedId === source.id ? "\u2714 " : "") + source.name,
                    callback() {
                      prefs.liveMode = source.id;
                      localStorage.setItem(LocalStorageKeys.PREFS, JSON.stringify(prefs));
                      sendMessage(hubPort, "set-preferences", prefs);
                      sendMessage(hubPort, "start-live", "robot");
                    }
                  };
                })
              },
              {
                content: `Upload Asset`,
                callback() {
                  openUploadAsset();
                }
              }
            ];
            break;

          case 2:
            // View menu
            menuItems = [
              {
                content: `Zoom to Enabled Range (${modifier} \\ )`,
                callback() {
                  sendMessage(hubPort, "zoom-enabled");
                }
              },
              "-",
              {
                content: `Toggle Sidebar (${modifier} . )`,
                callback() {
                  sendMessage(hubPort, "toggle-sidebar");
                }
              },
              {
                content: `Toggle Controls (${modifier} / )`,
                callback() {
                  sendMessage(hubPort, "toggle-controls");
                }
              }
            ];
            break;

          case 3:
            // Tabs menu
            menuItems = [
              {
                content: "New Tab",
                items: NEW_TAB_TYPES.filter((tabType) => LITE_COMPATIBLE_TABS.includes(tabType)).map((tabType) => {
                  return {
                    content: `${getTabIcon(tabType)} ${getDefaultTabTitle(tabType)} (${getTabAccelerator(
                      tabType
                    ).replace("Alt+", "\u2325 ")})`,
                    callback() {
                      sendMessage(hubPort, "new-tab", tabType);
                    }
                  };
                })
              },
              "-",
              {
                content: `Previous Tab (${modifier} \u2190 )`,
                callback() {
                  sendMessage(hubPort, "move-tab", -1);
                }
              },
              {
                content: `Next Tab (${modifier} \u2192 )`,
                callback() {
                  sendMessage(hubPort, "move-tab", 1);
                }
              },
              "-",
              {
                content: `Shift Left (${modifier} [ )`,
                callback() {
                  sendMessage(hubPort, "shift-tab", -1);
                }
              },
              {
                content: `Shift Right (${modifier} ] )`,
                callback() {
                  sendMessage(hubPort, "shift-tab", 1);
                }
              },
              "-",
              {
                content: `Close Tab (${modifier} E)`,
                callback() {
                  sendMessage(hubPort, "close-tab");
                }
              }
            ];
            break;

          case 5:
            // Help menu
            menuItems = [
              {
                content: "Report a Problem",
                callback() {
                  window.open("https://github.com/" + GITHUB_REPOSITORY + "/issues", "_blank");
                }
              },
              {
                content: "GitHub Repository",
                callback() {
                  window.open("https://github.com/" + GITHUB_REPOSITORY, "_blank");
                }
              },
              {
                content: "Based on AdvantageScope",
                callback() {
                  window.open("https://github.com/Mechanical-Advantage/AdvantageScope", "_blank");
                }
              }
            ];
            break;
        }
        const rect: ButtonRect = message.data.rect;
        openMenu(rect, menuItems);
      }
      break;

    case "close-app-menu":
      popupMenu.close();
      break;

    case "ask-playback-options":
      let menuItems: (MenuItem | Submenu | "-")[] = [];
      Array(0.25, 0.5, 1, 1.5, 2, 4, 8).forEach((value) => {
        menuItems.push({
          content: (value === message.data.speed ? "\u2714 " : "") + (value * 100).toString() + "%",
          callback() {
            sendMessage(hubPort, "set-playback-options", { speed: value, looping: message.data.looping });
          }
        });
      });
      menuItems.push("-");
      menuItems.push({
        content: (message.data.looping ? "\u2714 " : "") + "Loop Visible Range",
        callback() {
          sendMessage(hubPort, "set-playback-options", { speed: message.data.speed, looping: !message.data.looping });
        }
      });
      openMenu(message.data.rect, menuItems);
      break;

    case "ask-new-tab":
      openMenu(
        message.data,
        NEW_TAB_TYPES.filter((tabType) => LITE_COMPATIBLE_TABS.includes(tabType)).map((tabType) => {
          return {
            content: `${getTabIcon(tabType)} ${getDefaultTabTitle(tabType)} (${getTabAccelerator(tabType).replace(
              "Alt+",
              "\u2325 "
            )})`,
            callback() {
              sendMessage(hubPort, "new-tab", tabType);
            }
          };
        })
      );
      break;

    case "source-list-type-prompt":
      {
        let uuid: string = message.data.uuid;
        let config: SourceListConfig = message.data.config;
        let state: SourceListItemState = message.data.state;
        let rect: ButtonRect = message.data.rect;
        let menuItems: (MenuItem | Submenu | "-")[] = [];

        let respond = () => {
          sendMessage(hubPort, "source-list-type-response", {
            uuid: uuid,
            state: state
          });
        };

        // Make colorred text
        let getStyle = (value: string): string => {
          if (value.startsWith("#")) {
            const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            return `color: ${ensureThemeContrast(value, isDark)};`;
          } else {
            return "";
          }
        };

        // Add options
        let currentTypeConfig = config.types.find((typeConfig) => typeConfig.key === state.type)!;
        if (currentTypeConfig.options.length === 1) {
          let optionConfig = currentTypeConfig.options[0];
          optionConfig.values.forEach((optionValue) => {
            menuItems.push({
              content: (optionValue.key === state.options[optionConfig.key] ? "\u2714 " : "") + optionValue.display,
              style: getStyle(optionValue.key),
              callback() {
                state.options[optionConfig.key] = optionValue.key;
                respond();
              }
            });
          });
        } else {
          currentTypeConfig.options.forEach((optionConfig) => {
            menuItems.push({
              content: optionConfig.display,
              items: optionConfig.values.map((optionValue) => {
                return {
                  content: (optionValue.key === state.options[optionConfig.key] ? "\u2714 " : "") + optionValue.display,
                  style: getStyle(optionValue.key),
                  callback() {
                    state.options[optionConfig.key] = optionValue.key;
                    respond();
                  }
                };
              })
            });
          });
        }

        // Add type options
        let validTypes = config.types.filter(
          (typeConfig) =>
            typeConfig.sourceTypes.includes(state.logType) && typeConfig.childOf === currentTypeConfig.childOf
        );
        if (validTypes.length > 1) {
          if (menuItems.length > 0) {
            menuItems.push("-");
          }
          validTypes.forEach((typeConfig) => {
            let current = state.type === typeConfig.key;
            let optionConfig = current
              ? undefined
              : typeConfig.options.find((optionConfig) => optionConfig.key === typeConfig.initialSelectionOption);
            if (optionConfig === undefined) {
              menuItems.push({
                content: (current ? "\u2714 " : "") + typeConfig.display,
                callback() {
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
              });
            } else {
              menuItems.push({
                content: (current ? "\u2714 " : "") + typeConfig.display,
                items: optionConfig.values.map((optionValue) => {
                  return {
                    content: optionValue.display,
                    style: getStyle(optionValue.key),
                    callback() {
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
                })
              });
            }
          });
        }

        if (menuItems.length === 0) {
          menuItems.push({
            content: "No Options",
            className: "disabled"
          });
        }

        menuItems.push("-");
        menuItems.push({
          content: "Help",
          callback() {
            openSourceListHelp(config);
          }
        });
        openMenu(rect, menuItems);
      }
      break;

    case "source-list-clear-prompt":
      openMenu(message.data.rect, [
        {
          content: "Clear All",
          callback() {
            sendMessage(hubPort, "source-list-clear-response", {
              uuid: message.data.uuid
            });
          }
        }
      ]);
      break;

    case "source-list-help":
      openSourceListHelp(message.data);
      break;

    case "ask-edit-axis":
      {
        let legend: string = message.data.legend;
        const menuItems: (MenuItem | Submenu | "-")[] = [];

        if (legend === "discrete") {
          let showRobotMode: boolean = message.data.showRobotMode;
          // Discrete controls
          menuItems.push({
            content: (showRobotMode ? "\u2714 " : "") + "Show Robot Mode",
            callback() {
              sendMessage(hubPort, "set-robot-mode-visible", { showRobotMode: !showRobotMode });
            }
          });
        } else {
          // Left and right controls
          let lockedRange: [number, number] | null = message.data.lockedRange;
          let autoUnitGroup: string | "none" | "inconsistent" = message.data.autoUnitGroup;
          let autoUnitSelected: string | null = message.data.autoUnitSelected;
          let autoUnitDefault: string | null = message.data.autoUnitDefault;
          let unitConversion: Units.UIUnitOptions = message.data.unitConversion;
          let filter: LineGraphFilter = message.data.filter;

          menuItems.push({
            content: (lockedRange !== null ? "\u2714 " : "") + "Lock Axis",
            callback() {
              sendMessage(hubPort, "edit-axis", {
                legend: legend,
                lockedRange: lockedRange === null ? [null, null] : null,
                unitConversion: unitConversion,
                filter: filter
              });
            }
          });
          menuItems.push({
            content: "Edit Range",
            className: lockedRange !== null ? "" : "disabled",
            async callback() {
              let port = await openPopupWindow("www/editRange.html", [300, 108], "pixels", (message) => {
                closePopupWindow();
                sendMessage(hubPort, "edit-axis", {
                  legend: legend,
                  lockedRange: message,
                  unitConversion: unitConversion,
                  filter: filter
                });
              });
              port.postMessage(lockedRange);
            }
          });
          menuItems.push("-");
          let updateRecents = (newUnitConversion: Units.UnitConversionPreset) => {
            let newUnitConversionStr = JSON.stringify(newUnitConversion);
            if (newUnitConversionStr !== JSON.stringify(Units.NoopUnitConversion)) {
              let recentUnitsRaw = localStorage.getItem(LocalStorageKeys.RECENT_UNITS);
              let recentUnits: Units.UnitConversionPreset[] = recentUnitsRaw === null ? [] : JSON.parse(recentUnitsRaw);
              recentUnits = recentUnits.filter((x) => JSON.stringify(x) !== newUnitConversionStr);
              recentUnits.splice(0, 0, newUnitConversion);
              while (recentUnits.length > Units.MAX_RECENT_UNITS) {
                recentUnits.pop();
              }
              localStorage.setItem(LocalStorageKeys.RECENT_UNITS, JSON.stringify(recentUnits));
            }
          };
          switch (autoUnitGroup) {
            case "none":
              menuItems.push({
                content: "(No Unit Metadata)",
                className: "disabled"
              });
              break;

            case "inconsistent":
              menuItems.push({
                content: "(Inconsistent Units)",
                className: "disabled"
              });
              break;

            default:
              Object.keys(Units.UNIT_GROUPS[autoUnitGroup]).forEach((unit) => {
                menuItems.push({
                  content:
                    (autoUnitSelected === unit ? "\u2714 " : "") +
                    unit.charAt(0).toUpperCase() +
                    unit.slice(1) +
                    (unit === autoUnitDefault ? " [Default]" : ""),
                  callback() {
                    unitConversion.autoTarget = unit;
                    unitConversion.preset = null;
                    sendMessage(hubPort, "edit-axis", {
                      legend: legend,
                      lockedRange: lockedRange,
                      unitConversion: unitConversion,
                      filter: filter
                    });
                  }
                });
              });
              break;
          }
          let recentUnitsRaw = localStorage.getItem(LocalStorageKeys.RECENT_UNITS);
          let recentUnits: Units.UnitConversionPreset[] = recentUnitsRaw === null ? [] : JSON.parse(recentUnitsRaw);
          menuItems.push({
            content: "Manual Units",
            items: [
              {
                content: "Edit Conversion",
                async callback() {
                  let port = await openPopupWindow("www/unitConversion.html", [300, 162], "pixels", (message) => {
                    closePopupWindow();
                    if (message === null) return;
                    unitConversion.autoTarget = null;
                    unitConversion.preset = message;
                    sendMessage(hubPort, "edit-axis", {
                      legend: legend,
                      lockedRange: lockedRange,
                      unitConversion: unitConversion,
                      filter: filter
                    });
                    updateRecents(unitConversion.preset!);
                  });
                  port.postMessage(unitConversion.preset ?? Units.NoopUnitConversion);
                }
              },
              {
                content: (unitConversion.preset !== null ? "\u2714 " : "") + "Disable Automatic Units",
                callback() {
                  unitConversion.autoTarget = null;
                  if (unitConversion.preset === null) {
                    unitConversion.preset = Units.NoopUnitConversion;
                  } else {
                    unitConversion.preset = null;
                  }
                  sendMessage(hubPort, "edit-axis", {
                    legend: legend,
                    lockedRange: lockedRange,
                    unitConversion: unitConversion,
                    filter: filter
                  });
                }
              },
              {
                content: "Reset Units",
                className:
                  unitConversion.preset !== null &&
                  JSON.stringify(unitConversion.preset) !== JSON.stringify(Units.NoopUnitConversion)
                    ? ""
                    : "disabled",
                callback() {
                  unitConversion.autoTarget = null;
                  unitConversion.preset = Units.NoopUnitConversion;
                  sendMessage(hubPort, "edit-axis", {
                    legend: legend,
                    lockedRange: lockedRange,
                    unitConversion: unitConversion,
                    filter: filter
                  });
                }
              },
              ...(recentUnits.length > 0
                ? [
                    {
                      content: "\u2014 Recent Presets \u2014",
                      className: "disabled"
                    }
                  ]
                : []),
              ...recentUnits.map((preset) => {
                let fromToText =
                  preset.from === undefined || preset.to === undefined
                    ? ""
                    : preset.from?.replace(/(^\w|\s\w|\/\w)/g, (m) => m.toUpperCase()) +
                      " \u2192 " +
                      preset.to?.replace(/(^\w|\s\w|\/\w)/g, (m) => m.toUpperCase());
                let factorText = preset.factor === 1 ? "" : "x" + preset.factor.toString();
                let bothPresent = fromToText.length > 0 && factorText.length > 0;
                return {
                  content: fromToText + (bothPresent ? ", " : "") + factorText,
                  callback() {
                    unitConversion.autoTarget = null;
                    unitConversion.preset = preset;
                    sendMessage(hubPort, "edit-axis", {
                      legend: legend,
                      lockedRange: lockedRange,
                      unitConversion: unitConversion,
                      filter: filter
                    });
                    updateRecents(preset);
                  }
                };
              })
            ]
          });
          menuItems.push("-");
          menuItems.push({
            content: (filter === LineGraphFilter.Differentiate ? "\u2714 " : "") + "Differentiate",
            callback() {
              sendMessage(hubPort, "edit-axis", {
                legend: legend,
                lockedRange: lockedRange,
                unitConversion: unitConversion,
                filter: filter === LineGraphFilter.Differentiate ? LineGraphFilter.None : LineGraphFilter.Differentiate
              });
            }
          });
          menuItems.push({
            content: (filter === LineGraphFilter.Integrate ? "\u2714 " : "") + "Integrate",
            callback() {
              sendMessage(hubPort, "edit-axis", {
                legend: legend,
                lockedRange: lockedRange,
                unitConversion: unitConversion,
                filter: filter === LineGraphFilter.Integrate ? LineGraphFilter.None : LineGraphFilter.Integrate
              });
            }
          });
          menuItems.push("-");
        }

        // Always include help and clear buttons
        menuItems.push({
          content: "Help",
          callback() {
            openSourceListHelp(message.data.config);
          }
        });
        menuItems.push({
          content: "Clear All",
          callback() {
            sendMessage(hubPort, "clear-axis", legend);
          }
        });
        const rect: ButtonRect = message.data.rect;
        openMenu(rect, menuItems);
      }
      break;

    case "ask-rename-tab":
      {
        const rect = message.data.rect;
        openMenu(rect, [
          {
            content: "Rename Tab",
            async callback() {
              let port = await openPopupWindow("www/renameTab.html", [300, 81], "pixels", (renameMessage) => {
                closePopupWindow();
                const newName: string = renameMessage;
                sendMessage(hubPort, "rename-tab", {
                  index: message.data.index,
                  name: newName
                });
              });
              port.postMessage(message.data.name);
            }
          }
        ]);
      }
      break;

    case "ask-2d-camera":
      {
        let position: [number, number] = message.data.position;
        let selectedIndex: Field2dCameraMode = message.data.selectedIndex;
        let menuItems: (MenuItem | Submenu | "-")[] = [
          {
            content: (selectedIndex === Field2dCameraMode.Unlocked ? "\u2714 " : "") + "Unlocked",
            callback() {
              sendMessage(hubPort, "set-2d-camera", Field2dCameraMode.Unlocked);
            }
          },
          {
            content: (selectedIndex === Field2dCameraMode.Robot ? "\u2714 " : "") + "Locked to Robot",
            callback() {
              sendMessage(hubPort, "set-2d-camera", Field2dCameraMode.Robot);
            }
          },
          {
            content:
              (selectedIndex === Field2dCameraMode.RobotAndRotation ? "\u2714 " : "") + "Locked to Robot & Rotation",
            callback() {
              sendMessage(hubPort, "set-2d-camera", Field2dCameraMode.RobotAndRotation);
            }
          }
        ];
        openMenu({ x: position[0], y: position[1], width: 0, height: 0 }, menuItems);
      }
      break;

    default:
      console.warn("Unknown message from hub", message);
      break;
  }
}

/**
 * Process keyboard shortcuts
 * @param event The event
 * @returns Whether a shortcut was triggered
 */
function processKeydown(event: KeyboardEvent): boolean {
  let triggered = true;
  let modifier = event.metaKey || event.ctrlKey;
  let lowerKey = event.key.toLowerCase();
  if (event.shiftKey && modifier && lowerKey === "o") {
    openLocalLog();
  } else if (!event.shiftKey && modifier && lowerKey === "k") {
    sendMessage(hubPort, "show-connect-dialog");
  } else if (!event.shiftKey && modifier && lowerKey === "\\") {
    sendMessage(hubPort, "zoom-enabled");
  } else if (!event.shiftKey && modifier && lowerKey === ".") {
    sendMessage(hubPort, "toggle-sidebar");
  } else if (!event.shiftKey && modifier && lowerKey === "/") {
    sendMessage(hubPort, "toggle-controls");
  } else if (!event.shiftKey && modifier && lowerKey === "arrowleft") {
    sendMessage(hubPort, "move-tab", -1);
  } else if (!event.shiftKey && modifier && lowerKey === "arrowright") {
    sendMessage(hubPort, "move-tab", 1);
  } else if (!event.shiftKey && modifier && lowerKey === "[") {
    sendMessage(hubPort, "shift-tab", -1);
  } else if (!event.shiftKey && modifier && lowerKey === "]") {
    sendMessage(hubPort, "shift-tab", 1);
  } else if (!event.shiftKey && modifier && lowerKey === "e") {
    sendMessage(hubPort, "close-tab");
  } else if (event.shiftKey && modifier && lowerKey === ",") {
    openPreferences();
  } else if (!event.shiftKey && !modifier && event.altKey && !event.code.startsWith("Alt")) {
    triggered = false;
    NEW_TAB_TYPES.filter((tabType) => LITE_COMPATIBLE_TABS.includes(tabType)).forEach((tabType) => {
      let accelerator = getTabAccelerator(tabType).replace("Alt+", "").toLowerCase();
      if (accelerator.length > 0 && event.code.slice(-1).toLowerCase() === accelerator) {
        sendMessage(hubPort, "new-tab", tabType);
        triggered = true;
      }
    });
  } else if (event.code === "Escape") {
    closePopupWindow();
  } else {
    triggered = false;
  }
  if (triggered) {
    event.preventDefault();
  }
  return triggered;
}

// Get elements on page load
window.addEventListener("load", () => {
  // Load assets
  assetsPromise = loadAssets();

  // Get HTML elements
  HUB_FRAME = document.getElementsByClassName("hub-frame")[0] as HTMLIFrameElement;
  POPUP_FRAME = document.getElementsByClassName("popup-frame")[0] as HTMLIFrameElement;
  POINTER_BLOCK = document.getElementsByClassName("pointer-block")[0] as HTMLElement;
  TOO_SMALL_WARNING = document.getElementsByClassName("too-small")[0] as HTMLElement;
  MOBILE_WARNING = TOO_SMALL_WARNING.getElementsByClassName("mobile-warning")[0] as HTMLElement;
  MENU_ANCHOR = document.getElementsByClassName("menu-anchor")[0] as HTMLElement;

  // Set up too small warning
  let updateTooSmallWarning = () => {
    TOO_SMALL_WARNING.hidden = window.innerWidth >= 800 && window.innerHeight >= 400;
    let userAgent = navigator.userAgent.toLowerCase();
    MOBILE_WARNING.hidden =
      !userAgent.includes("iphone") && !userAgent.includes("android") && !userAgent.includes("mobile");
  };
  window.addEventListener("resize", () => updateTooSmallWarning());
  updateTooSmallWarning();

  // Set up pointer block
  POINTER_BLOCK.addEventListener("click", () => {
    popupMenu.close();
  });

  // Prevent dragging
  document.addEventListener("mousedown", (event) => event.preventDefault());
  document.addEventListener("mousemove", (event) => event.preventDefault());

  // Set up keyboard shortcuts
  window.addEventListener(
    "keydown",
    (event) => {
      if (!processKeydown(event)) {
        HUB_FRAME.contentWindow?.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: event.key,
            code: event.code,
            metaKey: event.metaKey,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey,
            shiftKey: event.shiftKey
          })
        );
      }
    },
    { capture: true }
  );
  window.addEventListener(
    "keyup",
    (event) => {
      HUB_FRAME.contentWindow?.dispatchEvent(
        new KeyboardEvent("keyup", {
          key: event.key,
          code: event.code,
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
          altKey: event.altKey,
          shiftKey: event.shiftKey
        })
      );
    },
    { capture: true }
  );

  // Handle hub loading
  if (HUB_FRAME.contentWindow?.document.readyState === "complete") {
    initHub();
  } else {
    HUB_FRAME.addEventListener("load", () => {
      initHub();
    });
  }
});
