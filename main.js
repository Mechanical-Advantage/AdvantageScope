const { app, BrowserWindow, Menu, MenuItem, shell, dialog, ipcMain, nativeTheme } = require("electron");
const WindowStateKeeper = require("./windowState.js");
const jsonfile = require("jsonfile");
const fetch = require("electron-fetch").default;
const { Headers } = require("electron-fetch");
const path = require("path");
const fs = require("fs");
const os = require("os");

const repository = "Mechanical-Advantage/AdvantageScope";
const prefsFileName = path.join(app.getPath("userData"), "prefs.json");
const stateFileName = "state-" + app.getVersion().replaceAll(".", "_") + ".json";
const lastOpenFileName = "akit-log-path.txt";
var iconPath = null;
const defaultPrefs = {
  port: 5800,
  address: "10.63.28.2",
  rioPath: "/media/sda1/",
  theme: process.platform == "linux" ? "light" : "system"
};

// Workaround to set menu bar color on some Linux environments
if (process.platform == "linux" && fs.existsSync(prefsFileName)) {
  var prefs = jsonfile.readFileSync(prefsFileName);
  if (prefs.theme == "dark") {
    process.env["GTK_THEME"] = "Adwaita:dark";
  }
}

var firstOpenPath = null;
app.whenReady().then(() => {
  // Pick icon based on platform
  switch (process.platform) {
    case "win32":
      iconPath = path.join(__dirname, "icons/window/window-icon-win.png"); // Square icon
      break;
    case "linux":
      iconPath = path.join(__dirname, "icons/window/window-icon-linux.png"); // Rounded icon
      break;
    default:
      iconPath = null; // macOS uses the app icon by default
      break;
  }

  // Check preferences and set theme
  if (!fs.existsSync(prefsFileName)) {
    jsonfile.writeFileSync(prefsFileName, defaultPrefs);
    nativeTheme.themeSource = defaultPrefs.theme;
  } else {
    var prefs = jsonfile.readFileSync(prefsFileName);
    var modified = false;
    for (let [key, value] of Object.entries(defaultPrefs)) {
      if (!(key in prefs)) {
        prefs[key] = value;
        modified = true;
      }
    }
    if (modified) jsonfile.writeFileSync(prefsFileName, prefs);
    nativeTheme.themeSource = prefs.theme;
  }

  // Create menu and window
  setupMenu();
  var window = createWindow();

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
    window.webContents.once("dom-ready", () => {
      window.send("open-file", firstOpenPath);
      recordOpenFile(firstOpenPath);
    });
  }

  // Create new window if activated while none exist
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length == 0) createWindow();
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
    var window = createWindow();
    window.webContents.once("dom-ready", () => {
      window.send("open-file", path);
      recordOpenFile(path);
    });
  } else {
    // Not running yet, open in first window
    firstOpenPath = path;
  }
});

// Record open file path to temp file for robot program
function recordOpenFile(filePath) {
  fs.writeFile(path.join(app.getPath("temp"), lastOpenFileName), filePath, () => {});
}

// Remove the open file path from temp file
app.on("quit", () => {
  fs.unlink(path.join(app.getPath("temp"), lastOpenFileName), () => {});
});

// Create a new main window
var indexWindows = [];
var lastIndexWindow = null;
function createWindow() {
  var prefs = {
    minWidth: 800,
    minHeight: 400,
    icon: iconPath,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload/indexPreload.js")
    }
  };

  // Manage window state
  var window = null;
  var windowState = WindowStateKeeper({
    file: stateFileName,
    defaultWidth: 1100,
    defaultHeight: 650,
    fullScreen: false,
    saveDataHandler: saveStateHandler,
    restoreDataHandler: (state) => {
      window.on("ready-to-show", () => {
        window.send("restore-state", state);
      });
    }
  });
  if (BrowserWindow.getFocusedWindow() == null) {
    prefs.x = windowState.x;
    prefs.y = windowState.y;
    prefs.width = windowState.width;
    prefs.height = windowState.height;
  } else {
    var focusedWindow = BrowserWindow.getFocusedWindow();
    prefs.x = focusedWindow.getPosition()[0] + 30;
    prefs.y = focusedWindow.getPosition()[1] + 30;
    prefs.width = focusedWindow.getSize()[0];
    prefs.height = focusedWindow.getSize()[1];
  }

  // Set fancy window effects
  if (process.platform == "darwin") {
    prefs.vibrancy = "sidebar";
    if (Number(os.release().split(".")[0]) >= 20) prefs.titleBarStyle = "hiddenInset";
  }

  // Create window
  window = new BrowserWindow(prefs);
  windowState.manage(window);
  indexWindows.push(window);

  // Finish setup
  if (!app.isPackaged) window.webContents.openDevTools();
  window.once("ready-to-show", window.show);
  window.webContents.on("dom-ready", () => {
    window.send("set-fullscreen", window.isFullScreen());
    window.send("set-preferences", jsonfile.readFileSync(prefsFileName));
  });
  window.on("enter-full-screen", () => window.send("set-fullscreen", true));
  window.on("leave-full-screen", () => window.send("set-fullscreen", false));
  window.on("blur", () => window.send("set-focused", false));
  window.on("focus", () => {
    window.send("set-focused", true);
    lastIndexWindow = window;
  });
  window.loadFile("www/index.html");
  return window;
}

// Manage state
var states = {};
ipcMain.on("save-state", (event, state) => {
  states[event.sender.getOwnerBrowserWindow()] = state;
});

function saveStateHandler(window) {
  return states[window];
}

// Create app menu
function setupMenu() {
  const isMac = process.platform === "darwin";

  const template = [
    ...(isMac
      ? [
          {
            role: "appMenu",
            submenu: [
              { role: "about" },
              { type: "separator" },
              {
                label: "Preferences...",
                accelerator: "Cmd+,",
                click() {
                  openPreferences();
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
          }
        ]
      : []),
    {
      label: "File",
      submenu: [
        {
          label: "Open...",
          accelerator: "CmdOrCtrl+O",
          click() {
            var window = BrowserWindow.getFocusedWindow();
            if (!window.webContents.getURL().endsWith("index.html")) return;
            var files = dialog.showOpenDialog(window, {
              title: "Select a robot log file to open",
              properties: ["openFile"],
              filters: [{ name: "Robot logs", extensions: ["rlog"] }]
            });
            files.then((files) => {
              if (files.filePaths.length > 0) {
                window.webContents.send("open-file", files.filePaths[0]);
                recordOpenFile(files.filePaths[0]);
                app.addRecentDocument(files.filePaths[0]);
              }
            });
          }
        },
        {
          label: "Connect to Robot",
          accelerator: "CmdOrCtrl+K",
          click() {
            BrowserWindow.getFocusedWindow().webContents.send("start-live", "wireless");
          }
        },
        {
          label: "Connect to roboRIO via USB",
          click() {
            BrowserWindow.getFocusedWindow().webContents.send("start-live", "usb");
          }
        },
        {
          label: "Connect to Simulator",
          accelerator: "CmdOrCtrl+Shift+K",
          click() {
            BrowserWindow.getFocusedWindow().webContents.send("start-live", "sim");
          }
        },
        {
          label: "Download Logs...",
          accelerator: "CmdOrCtrl+D",
          click() {
            openDownload();
          }
        },
        {
          label: "Export CSV...",
          accelerator: "CmdOrCtrl+E",
          click() {
            var window = BrowserWindow.getFocusedWindow();
            if (!window.webContents.getURL().endsWith("index.html")) return;
            window.webContents.send("export-csv");
          }
        },
        { type: "separator" },
        {
          label: "New Window",
          accelerator: "CommandOrControl+N",
          click() {
            createWindow();
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
          click() {
            BrowserWindow.getFocusedWindow().webContents.send("tab-command", "new", 1);
          }
        },
        {
          label: "New Table",
          accelerator: "CmdOrCtrl+2",
          click() {
            BrowserWindow.getFocusedWindow().webContents.send("tab-command", "new", 2);
          }
        },
        {
          label: "New Odometry",
          accelerator: "CmdOrCtrl+3",
          click() {
            BrowserWindow.getFocusedWindow().webContents.send("tab-command", "new", 3);
          }
        },
        { type: "separator" },
        {
          label: "Previous Tab",
          accelerator: "CmdOrCtrl+Left",
          click() {
            BrowserWindow.getFocusedWindow().webContents.send("tab-command", "move", -1);
          }
        },
        {
          label: "Next Tab",
          accelerator: "CmdOrCtrl+Right",
          click() {
            BrowserWindow.getFocusedWindow().webContents.send("tab-command", "move", 1);
          }
        },
        { type: "separator" },
        {
          label: "Shift Left",
          accelerator: "CmdOrCtrl+[",
          click() {
            BrowserWindow.getFocusedWindow().webContents.send("tab-command", "shift", -1);
          }
        },
        {
          label: "Shift Right",
          accelerator: "CmdOrCtrl+]",
          click() {
            BrowserWindow.getFocusedWindow().webContents.send("tab-command", "shift", 1);
          }
        },
        { type: "separator" },
        {
          label: "Close Tab",
          accelerator: isMac ? "Cmd+W" : "Ctrl+Q",
          click() {
            BrowserWindow.getFocusedWindow().webContents.send("tab-command", "close", null);
          }
        }
      ]
    },
    { role: "windowMenu" },
    {
      role: "help",
      submenu: [
        ...(isMac
          ? []
          : [
              {
                label: "About Advantage Scope",
                click() {
                  dialog.showMessageBox({
                    type: "info",
                    title: "About",
                    message: "Advantage Scope",
                    detail: "Version: " + app.getVersion() + "\nPlatform: " + process.platform + "-" + process.arch,
                    buttons: ["Close"],
                    icon: iconPath
                  });
                }
              },
              {
                label: "Show Preferences...",
                accelerator: "Ctrl+,",
                click() {
                  openPreferences();
                }
              },
              {
                label: "Check for Updates...",
                click() {
                  checkForUpdate(true);
                }
              },
              { type: "separator" }
            ]),
        {
          label: "View Repository",
          click() {
            shell.openExternal("https://github.com/" + repository);
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

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Create a new preferences window
var prefsWindow = null;
function openPreferences() {
  if (prefsWindow != null && !prefsWindow.isDestroyed()) {
    prefsWindow.focus();
    return;
  }

  const width = 400;
  const height = process.platform == "win32" ? 222 : 162; // "useContentSize" is broken on Windows when not resizable
  prefsWindow = new BrowserWindow({
    width: width,
    height: height,
    x: Math.floor(
      BrowserWindow.getFocusedWindow().getBounds().x +
        BrowserWindow.getFocusedWindow().getBounds().width / 2 -
        width / 2
    ),
    y: Math.floor(
      BrowserWindow.getFocusedWindow().getBounds().y +
        BrowserWindow.getFocusedWindow().getBounds().height / 2 -
        height / 2
    ),
    useContentSize: true,
    resizable: false,
    alwaysOnTop: true,
    icon: iconPath,
    show: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload/preferencesPreload.js")
    }
  });

  // Finish setup
  prefsWindow.setMenu(null);
  prefsWindow.once("ready-to-show", prefsWindow.show);
  prefsWindow.webContents.on("dom-ready", () => prefsWindow.send("start", jsonfile.readFileSync(prefsFileName)));
  prefsWindow.loadFile("www/preferences.html");
}

ipcMain.on("update-preferences", (_, data) => {
  jsonfile.writeFileSync(prefsFileName, data);
  nativeTheme.themeSource = data.theme;
  indexWindows.forEach((window) => {
    if (!window.isDestroyed()) {
      window.send("set-preferences", data);
    }
  });
  if (downloadWindow != null && !downloadWindow.isDestroyed()) downloadWindow.send("set-preferences", data);
});

ipcMain.on("exit-preferences", () => {
  prefsWindow.close();
});

// Detect updates from GitHub
function checkForUpdate(alwaysNotify) {
  if (!app.isPackaged) {
    if (alwaysNotify) {
      dialog.showMessageBox({
        type: "info",
        title: "Update Checker",
        message: "Cannot check for updates",
        detail: "This app is running in a development environment.",
        icon: iconPath
      });
    }
    return;
  }

  var fetchHeaders = new Headers();
  fetchHeaders.append("pragma", "no-cache");
  fetchHeaders.append("cache-control", "no-cache");
  var fetchInit = {
    method: "GET",
    headers: fetchHeaders
  };
  fetch("https://api.github.com/repos/" + repository + "/releases", fetchInit)
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

      var handleResponse = (result) => {
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
          json[0].assets.forEach((asset) => {
            if (asset.name.includes(platformKey) && asset.name.includes(arch)) {
              url = asset.browser_download_url;
            }
          });
          if (url == null) {
            shell.openExternal("https://github.com/" + repository + "/releases/latest");
          } else {
            shell.openExternal(url);
          }
        } else if (response == "View Changelog") {
          shell.openExternal("https://github.com/" + repository + "/releases");
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
            icon: iconPath,
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
            icon: iconPath,
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
            icon: iconPath,
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
          icon: iconPath
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
          icon: iconPath
        });
      }
    });
}

// Create a new download window
var downloadWindow = null;
function openDownload() {
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
    x: Math.floor(
      BrowserWindow.getFocusedWindow().getBounds().x +
        BrowserWindow.getFocusedWindow().getBounds().width / 2 -
        width / 2
    ),
    y: Math.floor(
      BrowserWindow.getFocusedWindow().getBounds().y +
        BrowserWindow.getFocusedWindow().getBounds().height / 2 -
        height / 2
    ),
    resizable: true,
    alwaysOnTop: true,
    icon: iconPath,
    show: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload/downloadPreload.js")
    }
  });

  // Finish setup
  downloadWindow.setMenu(null);
  downloadWindow.once("ready-to-show", downloadWindow.show);
  downloadWindow.webContents.on("dom-ready", () =>
    downloadWindow.send("set-preferences", jsonfile.readFileSync(prefsFileName))
  );
  downloadWindow.loadFile("www/download.html");
}

ipcMain.on("exit-download", () => {
  downloadWindow.close();
});

ipcMain.on("prompt-download-save", (_, files) => {
  if (files.length > 1) {
    var result = dialog.showOpenDialog(downloadWindow, {
      title: "Select save location for robot logs",
      buttonLabel: "Save",
      properties: ["openDirectory", "createDirectory", "dontAddToRecent"]
    });
  } else {
    var result = dialog.showSaveDialog(downloadWindow, {
      title: "Select save location for robot log",
      defaultPath: files[0],
      properties: ["createDirectory", "showOverwriteConfirmation", "dontAddToRecent"],
      filters: [{ name: "Robot log", extensions: ["rlog"] }]
    });
  }
  result.then((response) => {
    if (!response.canceled) {
      var savePath = null;
      if (response.filePath) {
        savePath = response.filePath;
      } else if (response.filePaths.length > 0) {
        savePath = response.filePaths[0];
      }
      if (savePath != null) {
        downloadWindow.webContents.send("download-save", files, savePath);
      }
    }
  });
});

ipcMain.on("prompt-download-auto-open", (_, filePath) => {
  var filename = path.basename(filePath);
  dialog
    .showMessageBox(downloadWindow, {
      type: "question",
      message: "Open log?",
      detail: 'Would you like to open the log file "' + filename + '"?',
      icon: iconPath,
      buttons: ["Open", "Skip"],
      defaultId: 0
    })
    .then((result) => {
      if (result.response == 0) {
        downloadWindow.close();
        lastIndexWindow.focus();
        lastIndexWindow.send("open-file", filePath);
        recordOpenFile(filePath);
      }
    });
});

// MISC COMMUNICATION WITH PRELOAD

ipcMain.on("error", (_, title, content) => {
  dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
    type: "error",
    title: "Error",
    message: title,
    detail: content,
    icon: iconPath
  });
});

ipcMain.on("open-link", (_, url) => {
  shell.openExternal(url);
});

ipcMain.on("set-playback-speed", (_, currentSpeed) => {
  const menu = new Menu();
  Array(0.25, 0.5, 1, 1.5, 2, 4, 8).forEach((value) => {
    menu.append(
      new MenuItem({
        label: (value * 100).toString() + "%",
        type: "checkbox",
        checked: value == currentSpeed,
        click() {
          BrowserWindow.getFocusedWindow().webContents.send("set-playback-speed-response", value);
        }
      })
    );
  });
  menu.popup();
});

ipcMain.on("add-tab", () => {
  const menu = new Menu();
  menu.append(
    new MenuItem({
      label: "Line Graph",
      click() {
        BrowserWindow.getFocusedWindow().webContents.send("add-tab-response", 1);
      }
    })
  );
  menu.append(
    new MenuItem({
      label: "Table",
      click() {
        BrowserWindow.getFocusedWindow().webContents.send("add-tab-response", 2);
      }
    })
  );
  menu.append(
    new MenuItem({
      label: "Odometry",
      click() {
        BrowserWindow.getFocusedWindow().webContents.send("add-tab-response", 3);
      }
    })
  );

  menu.popup();
});

var editLookup = {};
ipcMain.on("edit-axis", (_, data) => {
  const menu = new Menu();
  const window = BrowserWindow.getFocusedWindow();
  menu.append(
    new MenuItem({
      label: data.locked ? "Unlock Axis" : "Lock Axis",
      click() {
        window.webContents.send("edit-axis-response", {
          timestamp: data.timestamp,
          command: "toggle-lock"
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
      enabled: data.locked,
      click() {
        // Create edit axis window
        const editWindow = new BrowserWindow({
          width: 300,
          height: process.platform == "win32" ? 125 : 108, // "useContentSize" is broken on Windows when not resizable
          useContentSize: true,
          resizable: false,
          icon: iconPath,
          show: false,
          parent: window,
          modal: true,
          webPreferences: {
            preload: path.join(__dirname, "preload/editAxisPreload.js")
          }
        });

        // Finish setup
        editWindow.setMenu(null);
        editWindow.once("ready-to-show", window.show);
        editWindow.webContents.on("dom-ready", () => editWindow.send("start", data));
        editWindow.loadFile("www/editAxis.html");
        editLookup[data.timestamp] = {
          parent: window,
          child: editWindow
        };
      }
    })
  );
  menu.popup();
});

ipcMain.on("edit-axis-complete", (_, timestamp, range) => {
  editLookup[timestamp].child.close();
  if (range != null) {
    editLookup[timestamp].parent.webContents.send("edit-axis-response", {
      timestamp: timestamp,
      command: "set-range",
      value: range
    });
  }
});

var odometryLookup = {};
ipcMain.on("create-odometry-popup", (_, id) => {
  const popup = new BrowserWindow({
    width: 900,
    height: 500,
    minWidth: 200,
    minHeight: 100,
    resizable: true,
    icon: iconPath,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload/odometryPopupPreload.js")
    }
  });
  popup.setMenu(null);
  popup.loadFile("www/odometryPopup.html");
  popup.once("ready-to-show", popup.show);

  if (!(id in odometryLookup)) {
    odometryLookup[id] = [];
  }
  odometryLookup[id].push(popup);

  var closed = false;
  BrowserWindow.getFocusedWindow().once("close", () => {
    if (!closed) popup.close();
  });
  popup.once("closed", () => {
    closed = true;
    odometryLookup[id].splice(odometryLookup[id].indexOf(popup), 1);
  });
});

ipcMain.on("resize-odometry-popup", (event, aspectRatio) => {
  var window = BrowserWindow.fromWebContents(event.sender);
  var size = window.getContentSize();
  window.setAspectRatio(aspectRatio);
  window.setContentSize(Math.round(size[1] * aspectRatio), size[1]);
});

ipcMain.on("update-odometry-popup", (_, id, command) => {
  if (id in odometryLookup) {
    odometryLookup[id].forEach((window) => {
      if (window.isVisible()) {
        window.send("render", command);
      }
    });
  }
});

ipcMain.on("export-csv-dialog", (_, path) => {
  var csvPath = path.substring(0, path.length - 4) + "csv";
  var result = dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
    title: "Select export location for robot log",
    defaultPath: csvPath,
    properties: ["createDirectory", "showOverwriteConfirmation", "dontAddToRecent"],
    filters: [{ name: "Comma-separated values", extensions: ["csv"] }]
  });
  result.then((response) => {
    if (!response.canceled) {
      BrowserWindow.getFocusedWindow().send("export-csv-dialog-response", response.filePath);
    }
  });
});
