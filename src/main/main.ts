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
  shell
} from "electron";
import fs from "fs";
import jsonfile from "jsonfile";
import os from "os";
import path from "path";
import NamedMessage from "../lib/NamedMessage";
import Preferences from "../lib/Preferences";
import checkForUpdate from "./checkForUpdate";
import { DEFAULT_PREFS, LAST_OPEN_FILE, PREFS_FILENAME, REPOSITORY, WINDOW_ICON } from "./constants";
import net from "net";
import StateTracker from "./StateTracker";
import TabType from "../lib/TabType";

// Global variables
var hubWindows: BrowserWindow[] = []; // Ordered by last focus time (recent first)
var downloadWindow: BrowserWindow | null = null;
var prefsWindow: BrowserWindow | null = null;
var satelliteWindows: BrowserWindow[] = [];
var windowPorts: { [id: number]: MessagePortMain } = {};

var hubStateTracker = new StateTracker();
var usingUsb = false; // Menu bar setting, bundled with other prefs for renderers
var firstOpenPath: string | null = null; // Cache path to open immediately

// Live RLOG variables
const RLOG_CONNECT_TIMEOUT_MS = 1000; // How long to wait when connecting
const RLOG_DATA_TIMEOUT_MS = 3000; // How long with no data until timeout
const RLOG_HEARTBEAT_DELAY_MS = 1000; // How long to wait between heartbeats
const RLOG_HEARTBEAT_DATA = new Uint8Array([6, 3, 2, 8]);
var rlogSockets: { [id: number]: net.Socket } = {};
var rlogSocketTimeouts: { [id: number]: NodeJS.Timeout } = {};
var rlogDataArrays: { [id: number]: Uint8Array } = {};

/** Records the last open file for the robot program (and recent files for the OS). */
function recordOpenFile(filePath: string) {
  fs.writeFile(LAST_OPEN_FILE, filePath, () => {});
  app.addRecentDocument(filePath);
}

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
  var data: Preferences = jsonfile.readFileSync(PREFS_FILENAME);
  data.usb = usingUsb;
  nativeTheme.themeSource = data.theme;
  hubWindows.forEach((window) => {
    if (!window.isDestroyed()) {
      sendMessage(window, "set-preferences", data);
    }
  });
  if (downloadWindow != null && !downloadWindow.isDestroyed()) sendMessage(downloadWindow, "set-preferences", data);
}

/**
 * Process a message from a hub window.
 * @param window The source hub window
 * @param message The received message
 */
function handleHubMessage(window: BrowserWindow, message: NamedMessage) {
  let windowId = window.id;
  switch (message.name) {
    case "save-state":
      hubStateTracker.saveRendererState(window, message.data);
      break;

    case "historical-start":
      console.log("Reading historical data for window " + windowId.toString());
      let sendError = () => {
        console.log("Failed to read historical data for window " + windowId.toString());
        sendMessage(window, "historical-data", {
          success: false
        });
      };
      fs.open(message.data, "r", (error, file) => {
        if (error) sendError();
        fs.readFile(file, (error, buffer) => {
          if (error) {
            sendError();
          } else {
            console.log("Successfully read historical data for window " + windowId.toString());
            sendMessage(window, "historical-data", {
              success: true,
              raw: buffer
            });
          }
        });
      });
      break;

    case "live-rlog-start":
      rlogSockets[windowId] = net.createConnection({
        host: message.data.address,
        port: message.data.port
      });

      rlogSockets[windowId].setTimeout(RLOG_CONNECT_TIMEOUT_MS, () => {
        sendMessage(window, "live-rlog-data", { status: false });
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
          rlogSockets[windowId].destroy();
        }, RLOG_DATA_TIMEOUT_MS);

        while (true) {
          var expectedLength;
          if (rlogDataArrays[windowId].length < 4) {
            break;
          } else {
            expectedLength = new DataView(rlogDataArrays[windowId].buffer).getInt32(0) + 4;
            if (rlogDataArrays[windowId].length < expectedLength) {
              break;
            }
          }

          var singleArray = rlogDataArrays[windowId].slice(4, expectedLength);
          rlogDataArrays[windowId] = rlogDataArrays[windowId].slice(expectedLength);

          let success = sendMessage(window, "live-rlog-data", { success: true, raw: new Uint8Array(singleArray) });
          if (!success) {
            rlogSockets[windowId].destroy();
            console.log(
              "Closed RLOG socket for window " + windowId.toString() + " because the renderer port was destroyed"
            );
          }
        }
      });

      rlogSockets[windowId].on("error", () => {
        sendMessage(window, "live-rlog-data", { success: false });
      });

      rlogSockets[windowId].on("close", () => {
        sendMessage(window, "live-rlog-data", { success: false });
      });

      console.log("Opened RLOG socket for window " + windowId.toString());
      break;

    case "live-rlog-stop":
      rlogSockets[windowId].destroy();
      console.log("Closed RLOG socket for window " + windowId.toString());
      break;

    case "ask-playback-speed":
      const playbackSpeedMenu = new Menu();
      Array(0.25, 0.5, 1, 1.5, 2, 4, 8).forEach((value) => {
        playbackSpeedMenu.append(
          new MenuItem({
            label: (value * 100).toString() + "%",
            type: "checkbox",
            checked: value == message.data,
            click() {
              sendMessage(window, "set-playback-speed", value);
            }
          })
        );
      });
      playbackSpeedMenu.popup();
      break;

    case "ask-new-tab":
      const newTabMenu = new Menu();
      newTabMenu.append(
        new MenuItem({
          label: "Line Graph",
          click() {
            sendMessage(window, "new-tab", TabType.LineGraph);
          }
        })
      );
      newTabMenu.append(
        new MenuItem({
          label: "Table",
          click() {
            sendMessage(window, "new-tab", TabType.Table);
          }
        })
      );
      newTabMenu.append(
        new MenuItem({
          label: "Odometry",
          click() {
            sendMessage(window, "new-tab", TabType.Odometry);
          }
        })
      );
      newTabMenu.append(
        new MenuItem({
          label: "Points",
          click() {
            sendMessage(window, "new-tab", TabType.Points);
          }
        })
      );

      newTabMenu.popup();
      break;

    case "ask-edit-axis":
      let isLeft: boolean = message.data.isLeft;
      let lockedRange: [number, number] | null = message.data.lockedRange;

      const menu = new Menu();
      menu.append(
        new MenuItem({
          label: "Lock Axis",
          type: "checkbox",
          checked: lockedRange != null,
          click() {
            sendMessage(window, "edit-axis", {
              isLeft: message.data.isLeft,
              range: lockedRange == null ? [null, null] : null
            });
          }
        })
      );
      menu.append(
        new MenuItem({
          type: "separator"
        })
      );
      menu.append(
        new MenuItem({
          label: "Edit Range",
          enabled: lockedRange != null,
          click() {
            createEditAxisWindow(window, lockedRange as [number, number], (newRange) => {
              sendMessage(window, "edit-axis", {
                isLeft: message.data.isLeft,
                range: newRange
              });
            });
          }
        })
      );
      menu.popup();
      break;
  }
}

// Send live RLOG heartbeats
setInterval(() => {
  Object.values(rlogSockets).forEach((socket) => {
    socket.write(RLOG_HEARTBEAT_DATA);
  });
}, RLOG_HEARTBEAT_DELAY_MS);

// CREATE WINDOWS

/** Create the app menu. */
function setupMenu() {
  const isMac = process.platform === "darwin";

  const template: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = [
    {
      label: "File",
      submenu: [
        {
          label: "Open...",
          accelerator: "CmdOrCtrl+O",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            let files = dialog.showOpenDialog(window, {
              title: "Select a robot log file to open",
              properties: ["openFile"],
              filters: [{ name: "Robot logs", extensions: ["rlog", "wpilog"] }]
            });
            files.then((files) => {
              if (files.filePaths.length > 0) {
                sendMessage(window, "open-file", files.filePaths[0]);
                recordOpenFile(files.filePaths[0]);
              }
            });
          }
        },
        {
          label: "Connect to Robot",
          accelerator: "CmdOrCtrl+K",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            sendMessage(window, "start-live", "robot");
          }
        },
        {
          label: "Connect to Simulator",
          accelerator: "CmdOrCtrl+Shift+K",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            sendMessage(window, "start-live", "sim");
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
          label: "Export CSV...",
          accelerator: "CmdOrCtrl+E",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            sendMessage(window, "export-csv");
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
          label: "New Window",
          accelerator: "CommandOrControl+N",
          click() {
            createHubWindow();
          }
        },
        isMac ? { role: "close", accelerator: "Shift+Cmd+W" } : { role: "quit" }
      ]
    },
    { role: "editMenu" },
    { role: "viewMenu" },
    {
      label: "Tabs",
      submenu: [
        {
          label: "New Line Graph",
          accelerator: "CmdOrCtrl+1",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            sendMessage(window, "new-tab", TabType.LineGraph);
          }
        },
        {
          label: "New Table",
          accelerator: "CmdOrCtrl+2",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            sendMessage(window, "new-tab", TabType.Table);
          }
        },
        {
          label: "New Odometry",
          accelerator: "CmdOrCtrl+3",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            sendMessage(window, "new-tab", TabType.Odometry);
          }
        },
        {
          label: "New Points",
          accelerator: "CmdOrCtrl+4",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            sendMessage(window, "new-tab", TabType.Points);
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
          accelerator: isMac ? "Cmd+W" : "Ctrl+Q",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            sendMessage(window, "close-tab");
          }
        }
      ]
    },
    { role: "windowMenu" },
    {
      role: "help",
      submenu: [
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
        label: "About Advantage Scope",
        click() {
          dialog.showMessageBox({
            type: "info",
            title: "About",
            message: "Advantage Scope",
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
    if (!firstLoad) createPorts(); // Create ports on reload
    firstLoad = false;

    // Init messages
    if (rendererState) sendMessage(window, "restore-state", rendererState);
    sendMessage(window, "set-fullscreen", window.isFullScreen());
    sendMessage(window, "set-platform", {
      platform: process.platform,
      release: os.release()
    });
    sendAllPreferences();
  });
  window.on("enter-full-screen", () => sendMessage(window, "set-fullscreen", true));
  window.on("leave-full-screen", () => sendMessage(window, "set-fullscreen", false));
  window.on("blur", () => sendMessage(window, "set-focused", false));
  window.on("focus", () => {
    sendMessage(window, "set-focused", true);
    hubStateTracker.setFocusedWindow(window);
  });

  window.loadFile(path.join(__dirname, "../www/hub.html"));
  return window;
}

/**
 * Creates a new window to edit axis range.
 * @param parentWindow The parent window to use for alignment
 */
function createEditAxisWindow(
  parentWindow: Electron.BrowserWindow,
  range: [number, number],
  callback: (range: [number, number]) => void
) {
  // Create edit axis window
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
    port2.start();
  });
  editWindow.loadFile(path.join(__dirname, "../www/editAxis.html"));
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
  const height = process.platform == "win32" ? 249 : 189; // "useContentSize" is broken on Windows when not resizable
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
    port2.start();
  });
  prefsWindow.loadFile(path.join(__dirname, "../www/preferences.html"));
}

/**
 * Creates a new download window if it doesn't already exist.
 * @param parentWindow The parent window to use for alignment
 */
function openDownload(parentWindow: Electron.BrowserWindow) {}

// APPLICATION EVENTS

// Workaround to set menu bar color on some Linux environments
if (process.platform == "linux" && fs.existsSync(PREFS_FILENAME)) {
  let prefs: Preferences = jsonfile.readFileSync(PREFS_FILENAME);
  if (prefs.theme == "dark") {
    process.env["GTK_THEME"] = "Adwaita:dark";
  }
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
    recordOpenFile(firstOpenPath);
  }

  // Create new window if activated while none exist
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length == 0) createHubWindow();
  });

  // Send update notification once the window is ready
  window.once("show", () => checkForUpdate(false));
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
    recordOpenFile(path);
  } else {
    // Not running yet, open in first window
    firstOpenPath = path;
  }
});

// Remove the open file path from temp file
app.on("quit", () => {
  fs.unlink(LAST_OPEN_FILE, () => {});
});
