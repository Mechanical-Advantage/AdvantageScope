import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  dialog,
  Menu,
  MessageChannelMain,
  MessagePortMain,
  nativeTheme,
  shell
} from "electron";
import fetch from "electron-fetch";
import fs from "fs";
import jsonfile from "jsonfile";
import os from "os";
import path from "path";
import NamedMessage from "../lib/NamedMessage";
import Preferences from "../lib/Preferences";

// Constants
const REPOSITORY = "Mechanical-Advantage/AdvantageScope";
const PREFS_FILENAME = path.join(app.getPath("userData"), "prefs.json");
const STATE_FILENAME = "state-" + app.getVersion().replaceAll(".", "_") + ".json";
const LAST_OPEN_FILE = path.join(app.getPath("temp"), "akit-log-path.txt");
const WINDOW_ICON: string | undefined = (() => {
  switch (process.platform) {
    case "win32": // Square icon
      return path.join(__dirname, "../icons/window/window-icon-win.png");
    case "linux": // Rounded icon
      return path.join(__dirname, "../icons/window/window-icon-linux.png");
    default: // macOS uses the app icon by default
      return undefined;
  }
})();
const DEFAULT_PREFS: Preferences = {
  port: 5800,
  address: "10.63.28.2",
  rioPath: "/media/sda1/",
  theme: process.platform == "linux" ? "light" : "system"
};

// Global variables
var hubWindows: BrowserWindow[] = []; // Ordered by last focus time (recent first)
var downloadWindow: BrowserWindow | null = null;
var prefsWindow: BrowserWindow | null = null;
var satelliteWindows: BrowserWindow[] = [];
var windowPorts: { [id: number]: MessagePortMain } = {};

var usingUsb = false; // Menu bar setting, bundled with other prefs for renderers
var firstOpenPath: string | null = null; // Cache path to open immediately

/** Records the last open file for the robot program (and recent files for the OS). */
function recordOpenFile(filePath: string) {
  fs.writeFile(LAST_OPEN_FILE, filePath, () => {});
  app.addRecentDocument(filePath);
}

/** Checks for updates from GitHub and notifies the user if necessary. */
function checkForUpdate(alwaysNotify: boolean) {
  if (!app.isPackaged) {
    if (alwaysNotify) {
      dialog.showMessageBox({
        type: "info",
        title: "Update Checker",
        message: "Cannot check for updates",
        detail: "This app is running in a development environment.",
        icon: WINDOW_ICON
      });
    }
    return;
  }

  fetch("https://api.github.com/repos/" + REPOSITORY + "/releases", {
    method: "GET",
    headers: {
      pragma: "no-cache",
      "cache-control": "no-cache"
    }
  })
    .then((res) => res.json())
    .then((json) => {
      var currentVersion = app.getVersion();
      var latestVersion = json[0].tag_name.slice(1);
      var latestDate = new Date(json[0].published_at);
      var latestDateText = latestDate.toLocaleDateString();
      var translated = process.arch != "arm64" && app.runningUnderARM64Translation;
      var options =
        process.platform == "darwin"
          ? ["Download", "Later", "View Changelog"]
          : ["Download", "View Changelog", "Later"];

      var handleResponse = (result: Electron.MessageBoxReturnValue) => {
        var response = options[result.response];
        if (response == "Download") {
          var platformKey = "";
          switch (process.platform) {
            case "win32":
              platformKey = "win";
              break;
            case "linux":
              platformKey = "linux";
              break;
            case "darwin":
              platformKey = "mac";
              break;
          }
          var arch = translated ? "arm64" : process.arch; // If under translation, switch to ARM

          var url = null;
          json[0].assets.forEach((asset: any) => {
            if (asset.name.includes(platformKey) && asset.name.includes(arch)) {
              url = asset.browser_download_url;
            }
          });
          if (url == null) {
            shell.openExternal("https://github.com/" + REPOSITORY + "/releases/latest");
          } else {
            shell.openExternal(url);
          }
        } else if (response == "View Changelog") {
          shell.openExternal("https://github.com/" + REPOSITORY + "/releases");
        }
      };

      // Send appropriate prompt
      if (currentVersion != latestVersion && translated) {
        dialog
          .showMessageBox({
            type: "question",
            title: "Update Checker",
            message: "Download latest native version?",
            detail:
              "Version " +
              latestVersion +
              " is available (released " +
              latestDateText +
              "). You're currently running the x86 build of version " +
              currentVersion +
              " on an arm64 platform. Would you like to download the latest native version?",
            icon: WINDOW_ICON,
            buttons: options,
            defaultId: 0
          })
          .then(handleResponse);
      } else if (currentVersion != latestVersion) {
        dialog
          .showMessageBox({
            type: "question",
            title: "Update Checker",
            message: "Download latest version?",
            detail:
              "Version " +
              latestVersion +
              " is available (released " +
              latestDateText +
              "). You're currently running version " +
              currentVersion +
              ". Would you like to download the latest version?",
            icon: WINDOW_ICON,
            buttons: options,
            defaultId: 0
          })
          .then(handleResponse);
      } else if (translated) {
        dialog
          .showMessageBox({
            type: "question",
            title: "Update Checker",
            message: "Download native version?",
            detail:
              "It looks like you're running the x86 version of this app on an arm64 platform. Would you like to download the native version?",
            icon: WINDOW_ICON,
            buttons: options,
            defaultId: 0
          })
          .then(handleResponse);
      } else if (alwaysNotify) {
        dialog.showMessageBox({
          type: "info",
          title: "Update Checker",
          message: "No updates available",
          detail: "You're currently running version " + currentVersion + " (released " + latestDateText + ").",
          icon: WINDOW_ICON
        });
      }
    })
    .catch(() => {
      if (alwaysNotify) {
        dialog.showMessageBox({
          type: "info",
          title: "Update Checker",
          message: "Cannot check for updates",
          detail:
            "Failed to retrieve update information from GitHub. Please check your internet connection and try again.",
          icon: WINDOW_ICON
        });
      }
    });
}

// WINDOW MESSAGE HANDLING

/**
 * Sends a message to a single window.
 * @param window The window target
 * @param name The name of the message
 * @param data Arbitrary data to include
 */
function sendMessage(window: BrowserWindow, name: string, data?: any) {
  windowPorts[window.id].postMessage({ name: name, data: data });
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
  switch (message.name) {
    case "historical-start":
      let sendError = () => {
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
            sendMessage(window, "historical-data", {
              success: true,
              raw: buffer
            });
          }
        });
      });
      break;
  }
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
          label: "Open...",
          accelerator: "CmdOrCtrl+O",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            var files = dialog.showOpenDialog(window, {
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
            sendMessage(window, "tab-command", { type: "new", detail: 1 });
          }
        },
        {
          label: "New Table",
          accelerator: "CmdOrCtrl+2",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            sendMessage(window, "tab-command", { type: "new", detail: 2 });
          }
        },
        {
          label: "New Odometry",
          accelerator: "CmdOrCtrl+3",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            sendMessage(window, "tab-command", { type: "new", detail: 3 });
          }
        },
        {
          label: "New Points",
          accelerator: "CmdOrCtrl+4",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            sendMessage(window, "tab-command", { type: "new", detail: 4 });
          }
        },
        { type: "separator" },
        {
          label: "Previous Tab",
          accelerator: "CmdOrCtrl+Left",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            sendMessage(window, "tab-command", { type: "move", detail: -1 });
          }
        },
        {
          label: "Next Tab",
          accelerator: "CmdOrCtrl+Right",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            sendMessage(window, "tab-command", { type: "move", detail: 1 });
          }
        },
        { type: "separator" },
        {
          label: "Shift Left",
          accelerator: "CmdOrCtrl+[",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            sendMessage(window, "tab-command", { type: "shift", detail: -1 });
          }
        },
        {
          label: "Shift Right",
          accelerator: "CmdOrCtrl+]",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            sendMessage(window, "tab-command", { type: "shift", detail: 1 });
          }
        },
        { type: "separator" },
        {
          label: "Close Tab",
          accelerator: isMac ? "Cmd+W" : "Ctrl+Q",
          click(_, window) {
            if (window == null || !hubWindows.includes(window)) return;
            sendMessage(window, "tab-command", { type: "close" });
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
  var prefs: BrowserWindowConstructorOptions = {
    minWidth: 800,
    minHeight: 400,
    icon: WINDOW_ICON,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "hub$preload.js")
    }
  };

  // Manage window state
  if (BrowserWindow.getFocusedWindow() == null) {
    // TODO: Get from window state management
    prefs.width = 1100;
    prefs.height = 650;
  } else {
    var focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow != null) {
      prefs.x = focusedWindow.getPosition()[0] + 30;
      prefs.y = focusedWindow.getPosition()[1] + 30;
      prefs.width = focusedWindow.getSize()[0];
      prefs.height = focusedWindow.getSize()[1];
    }
  }

  // Set fancy window effects
  if (process.platform == "darwin") {
    prefs.vibrancy = "sidebar";
    if (Number(os.release().split(".")[0]) >= 20) prefs.titleBarStyle = "hiddenInset";
  }

  // Create window
  var window = new BrowserWindow(prefs);
  hubWindows.splice(0, 0, window);
  const { port1, port2 } = new MessageChannelMain();
  windowPorts[window.id] = port2;
  window.webContents.postMessage("set-port", null, [port1]);
  port2.on("message", (event) => {
    handleHubMessage(window, event.data);
  });
  port2.start();

  // Finish setup
  if (!app.isPackaged) window.webContents.openDevTools();
  window.once("ready-to-show", window.show);
  sendMessage(window, "set-fullscreen", window.isFullScreen());
  sendMessage(window, "set-platform", {
    platform: process.platform,
    release: os.release()
  });
  sendAllPreferences();
  window.on("enter-full-screen", () => sendMessage(window, "set-fullscreen", true));
  window.on("leave-full-screen", () => sendMessage(window, "set-fullscreen", false));
  window.on("blur", () => sendMessage(window, "set-focused", false));
  window.on("focus", () => {
    sendMessage(window, "set-focused", true);
    hubWindows.splice(hubWindows.indexOf(window), 1);
    hubWindows.splice(0, 0, window);
  });

  window.loadFile(path.join(__dirname, "../www/hub.html"));
  return window;
}

/**
 * Creates a new preferences window if it doesn't already exist.
 * @param parentWindow The parent window to use for alignment
 */
function openPreferences(parentWindow: Electron.BrowserWindow) {}

/**
 * Creates a new download window if it doesn't already exist.
 * @param parentWindow The parent window to use for alignment
 */
function openDownload(parentWindow: Electron.BrowserWindow) {}

// APPLICATION EVENTS

// Workaround to set menu bar color on some Linux environments
if (process.platform == "linux" && fs.existsSync(PREFS_FILENAME)) {
  var prefs: Preferences = jsonfile.readFileSync(PREFS_FILENAME);
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
    var prefs: Preferences = jsonfile.readFileSync(PREFS_FILENAME);
    nativeTheme.themeSource = prefs.theme;
  }

  // Create menu and window
  setupMenu();
  var window = createHubWindow();

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
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length == 0) createHubWindow();
  });

  // Send update notification once the window is ready
  window.once("show", () => checkForUpdate(false));
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// macOS only, Linux & Windows start a new process and pass the file as an argument
app.on("open-file", (_, path) => {
  if (app.isReady()) {
    // Already running, create a new window
    var window = createHubWindow();
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
