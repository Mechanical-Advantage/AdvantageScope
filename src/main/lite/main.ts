// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { TFunction } from "i18next";
import TinyPopupMenu, { MenuItem, Submenu } from "tiny-popup-menu";
import { setupI18n, translateHTML } from "../../i18n/i18n";
import { AdvantageScopeAssets } from "../../shared/AdvantageScopeAssets";
import { BUILD_DATE, COPYRIGHT, Distribution, DISTRIBUTION, LITE_VERSION } from "../../shared/buildConstants";
import ButtonRect from "../../shared/ButtonRect";
import { ensureThemeContrast } from "../../shared/Colors";
import { HubState } from "../../shared/HubState";
import LineGraphFilter from "../../shared/LineGraphFilter";
import NamedMessage from "../../shared/NamedMessage";
import Preferences, {
  DEFAULT_PREFS,
  DEFAULT_PREFS_LITEDS,
  getLiveModeName,
  LITE_ALLOWED_LIVE_MODES,
  LiveMode,
  mergePreferences,
  SUPPORTED_LANGS
} from "../../shared/Preferences";
import {
  getSourceListPrefix,
  SourceListConfig,
  SourceListItemState,
  SourceListTypeMemory,
  tOption,
  tType,
  tValue
} from "../../shared/SourceListConfig";
import {
  getAllTabTypes,
  getDefaultTabTitle,
  getTabAccelerator,
  getTabIcon,
  LITE_COMPATIBLE_TABS
} from "../../shared/TabType";
import { Units } from "../../shared/units";
import { GITHUB_REPOSITORY } from "../github";
import { loadAssets } from "./assetLoader";
import { isAlpha, isBeta, isBetaExpired, isBetaWelcomeComplete, saveBetaWelcomeComplete } from "./betaUtil";
import { getDefaultDsLayout } from "./dsLayout";
import { LocalStorageKeys } from "./localStorageKeys";

let HUB_FRAME: HTMLIFrameElement;
let POPUP_FRAME: HTMLIFrameElement;
let POINTER_BLOCK: HTMLElement;
let TOO_SMALL_WARNING: HTMLElement;
let MOBILE_WARNING: HTMLElement;
let MENU_ANCHOR: HTMLElement;

let lang = getLocale();
let isRtl = false;
let hubPort: MessagePort | null = null;

// Global variables
declare global {
  interface Window {
    t: TFunction;
  }
}

let popupMenu = new TinyPopupMenu();
let assetsPromise: Promise<AdvantageScopeAssets>;
let downloadInterval: number | null = null;
let popupRequiresForceClose = false;

// Set up locale
function getLocale(prefs: Preferences | null = null): string {
  if (prefs === null) {
    prefs = DISTRIBUTION === Distribution.LiteDS ? DEFAULT_PREFS_LITEDS : DEFAULT_PREFS;
    let prefsRaw = localStorage.getItem(LocalStorageKeys.PREFS);
    if (prefsRaw !== null) mergePreferences(prefs, JSON.parse(prefsRaw));
  }
  if (prefs !== null && prefs.language !== "") {
    return prefs.language;
  }

  let preferredLangs = navigator.languages;
  for (const lang of preferredLangs) {
    if (SUPPORTED_LANGS.includes(lang)) {
      return lang;
    }
    const primaryLang = lang.split("-")[0];
    if (SUPPORTED_LANGS.includes(primaryLang)) {
      return primaryLang;
    }
    switch (primaryLang) {
      case "en":
        return "en-US";
      case "es":
        return "es-419";
      case "pt":
        return "pt-BR";
      case "zh":
        return "zh-CN";
    }
  }
  return "en-US";
}

t = setupI18n(lang);
translateHTML(document, t);

// Set up RTL layout
try {
  const locale = new Intl.Locale(lang) as any;
  const direction = locale.textInfo
    ? locale.textInfo.direction
    : locale.getTextInfo
    ? locale.getTextInfo().direction
    : undefined;
  if (direction === "rtl") {
    isRtl = true;
  }
} catch (e) {}
if (isRtl) {
  document.documentElement.dir = "rtl";
}

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
      if (isRtl && POPUP_FRAME.contentDocument?.documentElement) {
        POPUP_FRAME.contentDocument.documentElement.dir = "rtl";
      }
      POPUP_FRAME.hidden = false;
      HUB_FRAME.classList.add("background");
      if (POPUP_FRAME.contentWindow) {
        (POPUP_FRAME.contentWindow as any).t = window.t;
        translateHTML(POPUP_FRAME.contentWindow.document, window.t);
      }

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
    // Check if language has changed
    let newLang = getLocale(message);
    let reload = false;
    if (newLang !== lang) {
      if (confirm("AdvantageScope Lite needs to reload to switch languages. Continue?")) {
        reload = true;
      } else {
        return;
      }
    }

    // Update preferences
    closePopupWindow();
    sendMessage(hubPort, "set-preferences", message);
    localStorage.setItem(LocalStorageKeys.PREFS, JSON.stringify(message));

    // Reload if needed
    if (reload) {
      location.reload();
    }
  }).then((port) => {
    let prefs = DEFAULT_PREFS;
    let prefsRaw = localStorage.getItem(LocalStorageKeys.PREFS);
    if (prefsRaw !== null) mergePreferences(prefs, JSON.parse(prefsRaw));
    port.postMessage({ platform: "lite", prefs: prefs });
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

  // Set up locale
  if (HUB_FRAME.contentWindow) {
    (HUB_FRAME.contentWindow as any).t = window.t;
    translateHTML(HUB_FRAME.contentWindow.document, window.t);
  }

  // Init messages
  sendMessage(hubPort, "set-version", {
    platform: "lite",
    platformRelease: "",
    platformArch: "",
    appVersion: LITE_VERSION
  });
  let prefs = DISTRIBUTION === Distribution.LiteDS ? DEFAULT_PREFS_LITEDS : DEFAULT_PREFS;
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
  } else if (DISTRIBUTION === Distribution.LiteDS) {
    state = getDefaultDsLayout();
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

  // Set up RTL layout
  if (isRtl && HUB_FRAME.contentDocument?.documentElement) {
    HUB_FRAME.contentDocument.documentElement.dir = "rtl";
  }
}

async function handleHubMessage(message: NamedMessage) {
  switch (message.name) {
    case "show":
      HUB_FRAME.style.opacity = "100%";
      break;

    case "alert":
    case "error":
      window.alert(message.data.content);
      break;

    case "save-state":
      localStorage.setItem(LocalStorageKeys.STATE, JSON.stringify(message.data));
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

    case "open-feedback":
      window.open("https://github.com/" + GITHUB_REPOSITORY + "/issues/new/choose", "_blank");
      break;

    case "historical-start":
      {
        const uuid: string = message.data.uuid;
        const path: string = message.data.path;

        let prefs = DEFAULT_PREFS;
        let prefsRaw = localStorage.getItem(LocalStorageKeys.PREFS);
        if (prefsRaw !== null) mergePreferences(prefs, JSON.parse(prefsRaw));

        let response = await fetch(`logs/${encodeURIComponent(path)}?folder=${encodeURIComponent(prefs.remotePath)}`);
        let buffer = await response.arrayBuffer();
        let array = new Uint8Array(buffer);

        sendMessage(hubPort, "historical-data", {
          files: [array],
          error: null,
          uuid: uuid
        });
      }
      break;

    case "open-link":
      window.open(message.data, "_blank");
      break;

    case "ask-open-sidebar-context-menu":
      // Sidebar context menu is currently not implemented in the Lite version since the only current options require HTTPS APIs (navigator.clipboard APIs).
      break;

    case "open-app-menu":
      {
        let menuItems: (MenuItem | Submenu | "-")[] = [];
        const modifier = navigator.userAgent.includes("Macintosh") ? "\u2318" : "Ctrl";
        switch (message.data.index) {
          case 0:
            {
              // App menu
              let prefs = Object.assign(
                {},
                DISTRIBUTION === Distribution.LiteDS ? DEFAULT_PREFS_LITEDS : DEFAULT_PREFS
              );
              let prefsRaw = localStorage.getItem(LocalStorageKeys.PREFS);
              if (prefsRaw !== null) mergePreferences(prefs, JSON.parse(prefsRaw));
              menuItems = [
                {
                  content: "About AdvantageScope Lite",
                  callback() {
                    let detailLines: string[] = [];
                    detailLines.push("Version: " + LITE_VERSION);
                    detailLines.push(
                      "Distribution: " + (DISTRIBUTION === Distribution.Lite ? "Lite" : "Lite (Driver Station)")
                    );
                    detailLines.push("Build Date: " + BUILD_DATE);
                    detailLines.push("User Agent: " + navigator.userAgent);
                    let detail = detailLines.join("\n");
                    window.alert("======= AdvantageScope Lite =======\n" + COPYRIGHT + "\n\n" + detail);
                  }
                },
                ...(DISTRIBUTION === Distribution.LiteDS
                  ? [
                      {
                        content: t("menu.app.setLanguage"),
                        items: [
                          { name: t("preferences.languageSystemDefault"), value: "" },
                          { name: "English (US)", value: "en-US" },
                          { name: "Español (Latinoamérica)", value: "es-419" },
                          { name: "Français", value: "fr" },
                          { name: "Português (Brasil)", value: "pt-BR" },
                          { name: "Türkçe", value: "tr" },
                          { name: "Românǎ", value: "ro" },
                          { name: "עִברִית", value: "he" },
                          { name: "Қазақша", value: "kk" },
                          { name: "Русский", value: "ru" },
                          { name: "العربية", value: "ar" },
                          { name: "简体中文", value: "zh-CN" },
                          { name: "繁體中文", value: "zh-TW" }
                        ].map((langOpt) => {
                          let isSelected = prefs.language === langOpt.value;
                          return {
                            content: (isSelected ? "\u2714 " : "") + langOpt.name,
                            callback() {
                              let newPrefs = Object.assign({}, prefs);
                              newPrefs.language = langOpt.value;
                              let newLang = getLocale(newPrefs);
                              let reload = false;
                              if (newLang !== lang) {
                                if (confirm(t("main.language.reloadResetLite"))) {
                                  reload = true;
                                } else {
                                  return;
                                }
                              }
                              localStorage.setItem(LocalStorageKeys.PREFS, JSON.stringify(newPrefs));
                              sendMessage(hubPort, "set-preferences", newPrefs);
                              if (reload) {
                                localStorage.setItem(LocalStorageKeys.STATE, JSON.stringify(getDefaultDsLayout()));
                                location.reload();
                              }
                            }
                          };
                        })
                      }
                    ]
                  : [
                      {
                        content: t("menu.app.preferencesShortcut", { shortcut: `\u21e7 ${modifier} ,` }),
                        callback() {
                          openPreferences();
                        }
                      }
                    ]),
                {
                  content: t("menu.app.licenses"),
                  callback() {
                    openPopupWindow("www/licenses.html", [50, 75], "percent");
                  }
                }
              ];
            }
            break;

          case 1:
            {
              // File menu
              let prefs = Object.assign(
                {},
                DISTRIBUTION === Distribution.LiteDS ? DEFAULT_PREFS_LITEDS : DEFAULT_PREFS
              );
              let prefsRaw = localStorage.getItem(LocalStorageKeys.PREFS);
              if (prefsRaw !== null) mergePreferences(prefs, JSON.parse(prefsRaw));
              menuItems = [
                {
                  content: t("menu.file.openLog", { shortcut: `\u21e7 ${modifier} O` }),
                  callback() {
                    openDownload();
                  }
                },
                {
                  content: t("menu.file.connectRobotShortcut", { shortcut: `${modifier} K` }),
                  callback() {
                    sendMessage(hubPort, "start-live", DISTRIBUTION === Distribution.LiteDS ? "ds" : "robot");
                  }
                },
                ...(DISTRIBUTION === Distribution.LiteDS
                  ? []
                  : [
                      {
                        content: t("menu.app.setLiveMode"),
                        items: LITE_ALLOWED_LIVE_MODES.map((liveMode: LiveMode) => {
                          return {
                            content: (prefs.liveMode === liveMode ? "\u2714 " : "") + getLiveModeName(liveMode),
                            callback() {
                              prefs.liveMode = liveMode;
                              localStorage.setItem(LocalStorageKeys.PREFS, JSON.stringify(prefs));
                              sendMessage(hubPort, "set-preferences", prefs);
                              sendMessage(hubPort, "start-live", "robot");
                            }
                          };
                        })
                      },
                      {
                        content: t("uploadAsset.title"),
                        callback() {
                          openUploadAsset();
                        }
                      }
                    ])
              ];
            }
            break;

          case 2:
            // View menu
            menuItems = [
              {
                content: t("menu.lineGraph.zoomEnabled") + ` (${modifier} \\ )`,
                callback() {
                  sendMessage(hubPort, "zoom-enabled");
                }
              },
              "-",
              {
                content: t("menu.view.toggleSidebar") + ` (${modifier} . )`,
                callback() {
                  sendMessage(hubPort, "toggle-sidebar");
                }
              },
              {
                content: t("menu.view.toggleControls") + ` (${modifier} / )`,
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
                content: t("menu.tabs.newTab"),
                items: getAllTabTypes()
                  .slice(1)
                  .filter((tabType) => LITE_COMPATIBLE_TABS.includes(tabType))
                  .map((tabType) => {
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
              ...((DISTRIBUTION === Distribution.LiteDS
                ? [
                    {
                      content: t("menu.view.resetLayout"),
                      callback() {
                        sendMessage(hubPort, "restore-state", getDefaultDsLayout());
                      }
                    }
                  ]
                : []) as (MenuItem | Submenu | "-")[]),
              "-",
              {
                content: t("menu.tabs.prevTabShortcut", { shortcut: `${modifier} \u2190` }),
                callback() {
                  sendMessage(hubPort, "move-tab", -1);
                }
              },
              {
                content: t("menu.tabs.nextTabShortcut", { shortcut: `${modifier} \u2192` }),
                callback() {
                  sendMessage(hubPort, "move-tab", 1);
                }
              },
              "-",
              {
                content: t("menu.tabs.shiftLeftShortcut", { shortcut: `${modifier} [` }),
                callback() {
                  sendMessage(hubPort, "shift-tab", -1);
                }
              },
              {
                content: t("menu.tabs.shiftRightShortcut", { shortcut: `${modifier} ]` }),
                callback() {
                  sendMessage(hubPort, "shift-tab", 1);
                }
              },
              "-",
              {
                content: t("menu.tabs.closeTabShortcut", { shortcut: `${modifier} E` }),
                callback() {
                  sendMessage(hubPort, "close-tab", false);
                }
              }
            ];
            break;

          case 5:
            // Help menu
            menuItems = [
              {
                content: t("menu.help.reportProblem"),
                callback() {
                  window.open("https://github.com/" + GITHUB_REPOSITORY + "/issues", "_blank");
                }
              },
              {
                content: t("menu.help.contactUs"),
                callback() {
                  window.open("mailto:software@team6328.org");
                }
              },
              {
                content: t("menu.help.githubRepo"),
                callback() {
                  window.open("https://github.com/" + GITHUB_REPOSITORY, "_blank");
                }
              },
              ...((DISTRIBUTION === Distribution.LiteDS
                ? [
                    // Add additional documentation links for the DS distribution (AdvantageScope docs are not bundled)
                    "-",
                    {
                      content: t("menu.help.advantagescopeDocs"),
                      callback() {
                        window.open("https://docs.advantagescope.org", "_blank");
                      }
                    },
                    {
                      content: t("menu.help.dsDocs"),
                      callback() {
                        window.open("https://github.com/wpilibsuite/FirstDriverStation-Public", "_blank");
                      }
                    }
                  ]
                : []) as (MenuItem | Submenu | "-")[]),
              {
                content: t("menu.help.wpilibDocs"),
                callback() {
                  window.open("https://docs.wpilib.org", "_blank");
                }
              },
              ...((DISTRIBUTION === Distribution.LiteDS ? ["-"] : []) as (MenuItem | Submenu | "-")[]),
              {
                content: t("menu.help.littletonRobotics"),
                callback() {
                  window.open("https://littletonrobotics.org", "_blank");
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
        content: (message.data.looping ? "\u2714 " : "") + t("menu.view.loopVisible"),
        callback() {
          sendMessage(hubPort, "set-playback-options", { speed: message.data.speed, looping: !message.data.looping });
        }
      });
      openMenu(message.data.rect, menuItems);
      break;

    case "ask-new-tab":
      openMenu(
        message.data,
        getAllTabTypes()
          .slice(1)
          .filter((tabType) => LITE_COMPATIBLE_TABS.includes(tabType))
          .map((tabType) => {
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

        let prefix = getSourceListPrefix(config.title);

        // Add options
        let currentTypeConfig = config.types.find((typeConfig) => typeConfig.key === state.type)!;
        if (currentTypeConfig.options.length === 1) {
          let optionConfig = currentTypeConfig.options[0];
          optionConfig.values.forEach((valueKey) => {
            menuItems.push({
              content:
                (valueKey === state.options[optionConfig.key] ? "\u2714 " : "") +
                tValue(prefix, currentTypeConfig.key, optionConfig.key, valueKey),
              style: getStyle(valueKey),
              callback() {
                state.options[optionConfig.key] = valueKey;
                respond();
              }
            });
          });
        } else {
          currentTypeConfig.options.forEach((optionConfig) => {
            menuItems.push({
              content: tOption(prefix, currentTypeConfig.key, optionConfig.key),
              items: optionConfig.values.map((valueKey) => {
                return {
                  content:
                    (valueKey === state.options[optionConfig.key] ? "\u2714 " : "") +
                    tValue(prefix, currentTypeConfig.key, optionConfig.key, valueKey),
                  style: getStyle(valueKey),
                  callback() {
                    state.options[optionConfig.key] = valueKey;
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
                content: (current ? "\u2714 " : "") + tType(prefix, typeConfig.key),
                callback() {
                  state.type = typeConfig.key;
                  let newOptions: { [key: string]: string } = {};
                  typeConfig.options.forEach((optionConfig) => {
                    if (
                      optionConfig.key in state.options &&
                      optionConfig.values.includes(state.options[optionConfig.key])
                    ) {
                      newOptions[optionConfig.key] = state.options[optionConfig.key];
                    } else {
                      newOptions[optionConfig.key] = optionConfig.values[0];
                    }
                  });
                  state.options = newOptions;
                  respond();
                }
              });
            } else {
              menuItems.push({
                content: (current ? "\u2714 " : "") + tType(prefix, typeConfig.key),
                items: optionConfig.values.map((valueKey) => {
                  return {
                    content: tValue(prefix, typeConfig.key, optionConfig.key, valueKey),
                    style: getStyle(valueKey),
                    callback() {
                      state.type = typeConfig.key;
                      let newOptions: { [key: string]: string } = {};
                      typeConfig.options.forEach((optionConfig) => {
                        if (
                          optionConfig.key in state.options &&
                          optionConfig.values.includes(state.options[optionConfig.key])
                        ) {
                          newOptions[optionConfig.key] = state.options[optionConfig.key];
                        } else {
                          newOptions[optionConfig.key] = optionConfig.values[0];
                        }
                      });
                      state.options = newOptions;
                      state.options[typeConfig.initialSelectionOption!] = valueKey;
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
            content: t("menu.help.noOptions"),
            className: "disabled"
          });
        }

        menuItems.push("-");
        menuItems.push({
          content: t("menu.help.heading"),
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
          content: t("menu.sidebar.clearAll"),
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
            content: (showRobotMode ? "\u2714 " : "") + t("menu.view.showRobotMode"),
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
            content: (lockedRange !== null ? "\u2714 " : "") + t("menu.lineGraph.lockAxis"),
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
            content: t("menu.lineGraph.editRange"),
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
                content: t("menu.lineGraph.noUnitMetadata"),
                className: "disabled"
              });
              break;

            case "inconsistent":
              menuItems.push({
                content: t("menu.lineGraph.inconsistentUnits"),
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
                    (unit === autoUnitDefault ? " [" + t("menu.file.default") + "]" : ""),
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
            content: t("menu.lineGraph.manualUnits"),
            items: [
              {
                content: t("menu.lineGraph.editConversion"),
                async callback() {
                  let port = await openPopupWindow("www/unitConversion.html", [300, 162], "pixels", (message) => {
                    if (message === null) return;
                    unitConversion.autoTarget = null;
                    unitConversion.preset = message;
                    closePopupWindow();
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
                content: (unitConversion.preset !== null ? "\u2714 " : "") + t("menu.lineGraph.disableAutoUnits"),
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
                content: t("menu.lineGraph.resetUnits"),
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
                      content: t("menu.file.recentPresets"),
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
            content: (filter === LineGraphFilter.Differentiate ? "\u2714 " : "") + t("menu.lineGraph.differentiate"),
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
            content: (filter === LineGraphFilter.Integrate ? "\u2714 " : "") + t("menu.lineGraph.integrate"),
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
          content: t("menu.help.heading"),
          callback() {
            openSourceListHelp(message.data.config);
          }
        });
        menuItems.push({
          content: t("menu.sidebar.clearAll"),
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
            content: t("menu.tabs.renameTab"),

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

    case "ask-3d-camera":
      {
        let position: [number, number] = message.data.position;
        let options: string[] = message.data.options;
        let selectedIndex: number = message.data.selectedIndex;
        let fov: number = message.data.fov;
        let isFTC: boolean = message.data.isFTC;

        let menuItems: (MenuItem | Submenu | "-")[] = [
          {
            content: (selectedIndex === -1 ? "\u2714 " : "") + t("menu.field3d.orbitField"),
            callback() {
              sendMessage(hubPort, "set-3d-camera", -1);
            }
          },
          {
            content: (selectedIndex === -2 ? "\u2714 " : "") + t("menu.field3d.orbitRobot"),
            callback() {
              sendMessage(hubPort, "set-3d-camera", -2);
            }
          },
          {
            content: isFTC ? t("menu.field3d.driverView") : t("menu.field3d.driverStation"),
            items: isFTC
              ? [
                  {
                    content: (selectedIndex === -4 ? "\u2714 " : "") + t("menu.field3d.blueLeft"),
                    callback() {
                      sendMessage(hubPort, "set-3d-camera", -4);
                    }
                  },
                  {
                    content: (selectedIndex === -5 ? "\u2714 " : "") + t("menu.field3d.blueRight"),
                    callback() {
                      sendMessage(hubPort, "set-3d-camera", -5);
                    }
                  },
                  {
                    content: (selectedIndex === -6 ? "\u2714 " : "") + t("menu.field3d.redLeft"),
                    callback() {
                      sendMessage(hubPort, "set-3d-camera", -6);
                    }
                  },
                  {
                    content: (selectedIndex === -7 ? "\u2714 " : "") + t("menu.field3d.redRight"),
                    callback() {
                      sendMessage(hubPort, "set-3d-camera", -7);
                    }
                  }
                ]
              : [
                  {
                    content: (selectedIndex === -3 ? "\u2714 " : "") + t("menu.field3d.auto"),
                    callback() {
                      sendMessage(hubPort, "set-3d-camera", -3);
                    }
                  },
                  {
                    content: (selectedIndex === -4 ? "\u2714 " : "") + t("menu.field3d.blue1"),
                    callback() {
                      sendMessage(hubPort, "set-3d-camera", -4);
                    }
                  },
                  {
                    content: (selectedIndex === -5 ? "\u2714 " : "") + t("menu.field3d.blue2"),
                    callback() {
                      sendMessage(hubPort, "set-3d-camera", -5);
                    }
                  },
                  {
                    content: (selectedIndex === -6 ? "\u2714 " : "") + t("menu.field3d.blue3"),
                    callback() {
                      sendMessage(hubPort, "set-3d-camera", -6);
                    }
                  },
                  {
                    content: (selectedIndex === -7 ? "\u2714 " : "") + t("menu.field3d.red1"),
                    callback() {
                      sendMessage(hubPort, "set-3d-camera", -7);
                    }
                  },
                  {
                    content: (selectedIndex === -8 ? "\u2714 " : "") + t("menu.field3d.red2"),
                    callback() {
                      sendMessage(hubPort, "set-3d-camera", -8);
                    }
                  },
                  {
                    content: (selectedIndex === -9 ? "\u2714 " : "") + t("menu.field3d.red3"),
                    callback() {
                      sendMessage(hubPort, "set-3d-camera", -9);
                    }
                  }
                ]
          },
          {
            content: t("menu.field3d.setFov"),
            async callback() {
              let port = await openPopupWindow("www/editFov.html", [300, 81], "pixels", (message) => {
                closePopupWindow();
                sendMessage(hubPort, "edit-fov", message);
              });
              port.postMessage(fov);
            }
          }
        ];
        if (options.length > 0) {
          menuItems.push("-");
        }
        options.forEach((option, index) => {
          menuItems.push({
            content: (index === selectedIndex ? "\u2714 " : "") + option,
            callback() {
              sendMessage(hubPort, "set-3d-camera", index);
            }
          });
        });
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
    openDownload();
  } else if (!event.shiftKey && modifier && lowerKey === "k") {
    sendMessage(hubPort, "start-live", false);
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
    sendMessage(hubPort, "close-tab", false);
  } else if (event.shiftKey && modifier && lowerKey === "," && DISTRIBUTION !== Distribution.LiteDS) {
    openPreferences();
  } else if (!event.shiftKey && !modifier && event.altKey && !event.code.startsWith("Alt")) {
    triggered = false;
    getAllTabTypes()
      .filter((tabType) => LITE_COMPATIBLE_TABS.includes(tabType))
      .forEach((tabType) => {
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
  // Set tab title
  if (DISTRIBUTION === Distribution.LiteDS) {
    document.title = "AdvantageScope Lite (DS)";
  }

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

  // Beta init
  if (isBeta()) {
    if (isBetaExpired()) {
      if (confirm(isAlpha() ? t("main.survey.expiredLiteAlpha") : t("main.survey.expiredLiteBeta"))) {
        // Redirect to Systemcore home page
        location.href = "http://" + location.hostname;
      }
    } else if (!isBetaWelcomeComplete()) {
      openPopupWindow(
        "www/betaWelcome.html",
        [450, 490],
        "pixels",
        () => {
          closePopupWindow(true); // Force close
          saveBetaWelcomeComplete();
        },
        true // Require force close
      ).then((port) => {
        port.postMessage(isAlpha());
      });
    }
  }
});
