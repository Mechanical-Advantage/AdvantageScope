const { app, BrowserWindow, Menu, MenuItem, shell, dialog, ipcMain } = require("electron")
const WindowStateKeeper = require("./windowState.js")
const { setUpdateNotification } = require("electron-update-notifier")
const path = require("path")
const os = require("os")

const stateFileName = "state-" + app.getVersion().replaceAll(".", '_') + ".json"

var firstOpenPath = null
app.whenReady().then(() => {
  setupMenu()
  var window = createWindow()

  // Check for file path given as argument
  if (process.defaultApp) {
    if (process.argv.length > 2) {
      firstOpenPath = process.argv[2]
    }
  } else {
    if (process.argv.length > 1) {
      firstOpenPath = process.argv[1]
    }
  }

  // Open file if exists
  if (firstOpenPath != null) {
    window.webContents.once("dom-ready", () => {
      window.send("open-file", firstOpenPath)
    })
  }

  // Create new window if activated while none exist
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length == 0) createWindow()
  })

  // Notify about any updates
  window.once("show", () => setUpdateNotification({
    repository: "Mechanical-Advantage/LogViewer"
  }))
})

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit()
})

// macOS only, Linux & Windows start a new process and pass the file as an argument
app.on("open-file", (_, path) => {
  if (app.isReady()) { // Already running, create a new window
    var window = createWindow()
    window.webContents.once("dom-ready", () => {
      window.send("open-file", path)
    })
  } else { // Not running yet, open in first window
    firstOpenPath = path
  }
})

function createWindow() {
  var prefs = {
    minWidth: 800,
    minHeight: 400,
    icon: path.join(__dirname, "assets/icon-256.png"),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "indexPreload.js")
    }
  }

  // Manage window state
  var window = null
  var windowState = WindowStateKeeper({
    file: stateFileName,
    defaultWidth: 1100,
    defaultHeight: 650,
    fullScreen: false,
    saveDataHandler: saveStateHandler,
    restoreDataHandler: state => {
      window.once("ready-to-show", () => {
        window.send("restore-state", state)
      })
    }
  })
  if (BrowserWindow.getFocusedWindow() == null) {
    prefs.x = windowState.x
    prefs.y = windowState.y
    prefs.width = windowState.width
    prefs.height = windowState.height
  } else {
    var focusedWindow = BrowserWindow.getFocusedWindow()
    prefs.x = focusedWindow.getPosition()[0] + 30
    prefs.y = focusedWindow.getPosition()[1] + 30
    prefs.width = focusedWindow.getSize()[0]
    prefs.height = focusedWindow.getSize()[1]
  }

  // Set fancy window effects
  if (process.platform == "darwin") {
    prefs.vibrancy = "sidebar"
    if (Number(os.release().split(".")[0]) >= 20) prefs.titleBarStyle = "hiddenInset"
  }

  // Create window
  window = new BrowserWindow(prefs)
  windowState.manage(window)

  // Finish setup
  if (process.defaultApp) window.webContents.openDevTools()
  window.once("ready-to-show", window.show)
  window.webContents.on("dom-ready", () => window.send("set-fullscreen", window.isFullScreen()))
  window.on("enter-full-screen", () => window.send("set-fullscreen", true))
  window.on("leave-full-screen", () => window.send("set-fullscreen", false))
  window.on("blur", () => window.send("set-focused", false))
  window.on("focus", () => window.send("set-focused", true))
  window.loadFile("www/index.html")
  return window
}

// Manage state
var states = {}
ipcMain.on("save-state", (event, state) => {
  states[event.sender.getOwnerBrowserWindow()] = state
})

function saveStateHandler(window) {
  return states[window]
}

// Create app menu
function setupMenu() {
  const isMac = process.platform === "darwin"

  const template = [
    ...(isMac ? [{ role: "appMenu" }] : []),
    {
      label: "File",
      submenu: [
        {
          label: "New Window",
          accelerator: "CommandOrControl+N",
          click() {
            createWindow()
          }
        },
        {
          label: "Open...",
          accelerator: "CommandOrControl+O",
          click() {
            var window = BrowserWindow.getFocusedWindow()
            var files = dialog.showOpenDialog(window, {
              title: "Select a robot log file to open",
              properties: ["openFile"],
              filters: [
                { name: "Robot logs", extensions: ["rlog"] }
              ]
            })
            files.then((files) => {
              if (files.filePaths.length > 0) {
                window.webContents.send("open-file", files.filePaths[0])
              }
            })
          }
        },
        isMac ? { role: "close" } : { role: "quit" }
      ]
    },
    { role: "editMenu" },
    { role: "viewMenu" },
    { role: "windowMenu" },
    {
      role: "help",
      submenu: [
        {
          label: "Check for Updates...",
          click() {
            setUpdateNotification({
              repository: "Mechanical-Advantage/LogViewer",
              silent: false
            })
          }
        },
        {
          label: "View Repository",
          click() {
            shell.openExternal("https://github.com/Mechanical-Advantage/LogViewer")
          }
        },
        {
          label: "Team Website",
          click() {
            shell.openExternal("https://littletonrobotics.org")
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

ipcMain.on("error", (_, title, content) => {
  dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
    type: "error",
    title: "Error",
    message: title,
    detail: content
  })
})

ipcMain.on("open-link", (_, url) => {
  shell.openExternal(url)
})

ipcMain.on("set-playback-speed", (_, currentSpeed) => {
  const menu = new Menu()
  Array(0.25, 0.5, 1, 1.5, 2, 4, 8).forEach(value => {
    menu.append(new MenuItem({
      label: (value * 100).toString() + "%",
      type: "checkbox",
      checked: value == currentSpeed,
      click() {
        BrowserWindow.getFocusedWindow().webContents.send("set-playback-speed-response", value)
      }
    }))
  })
  menu.popup()
})

ipcMain.on("add-tab", () => {
  const menu = new Menu()
  menu.append(new MenuItem({
    label: "Line Graph",
    click() {
      BrowserWindow.getFocusedWindow().webContents.send("add-tab-response", 1)
    }
  }))
  menu.append(new MenuItem({
    label: "Table",
    click() {
      BrowserWindow.getFocusedWindow().webContents.send("add-tab-response", 2)
    }
  }))
  menu.append(new MenuItem({
    label: "Odometry",
    click() {
      BrowserWindow.getFocusedWindow().webContents.send("add-tab-response", 3)
    }
  }))

  menu.popup()
})

var editLookup = {}
ipcMain.on("edit-axis", (_, data) => {
  const menu = new Menu()
  const window = BrowserWindow.getFocusedWindow()
  menu.append(new MenuItem({
    label: data.locked ? "Unlock Axis" : "Lock Axis",
    click() {
      window.webContents.send("edit-axis-response", {
        timestamp: data.timestamp,
        command: "toggle-lock"
      })
    }
  }))
  menu.append(new MenuItem({
    type: "separator",
  }))
  menu.append(new MenuItem({
    label: "Edit Range",
    enabled: data.locked,
    click() {
      // Create edit axis window
      const editWindow = new BrowserWindow({
        width: 300,
        height: 140,
        resizable: false,
        icon: path.join(__dirname, "assets/icon-256.png"),
        show: false,
        parent: window,
        modal: true,
        webPreferences: {
          preload: path.join(__dirname, "editAxisPreload.js")
        }
      })

      // Finish setup
      editWindow.setMenu(null)
      editWindow.once("ready-to-show", window.show)
      editWindow.webContents.on("dom-ready", () => editWindow.send("start", data))
      editWindow.loadFile("www/editAxis.html")
      editLookup[data.timestamp] = {
        parent: window,
        child: editWindow
      }
    }
  }))
  menu.popup()
})

ipcMain.on("edit-axis-complete", (_, timestamp, range) => {
  editLookup[timestamp].child.close()
  if (range != null) {
    editLookup[timestamp].parent.webContents.send("edit-axis-response", {
      timestamp: timestamp,
      command: "set-range",
      value: range
    })
  }
})

var odometryLookup = {}
ipcMain.on("create-odometry-popup", (_, id) => {
  const popup = new BrowserWindow({
    width: 900,
    height: 500,
    minWidth: 200,
    minHeight: 100,
    resizable: true,
    icon: path.join(__dirname, "assets/icon-256.png"),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "odometryPopupPreload.js")
    }
  })
  popup.setMenu(null)
  popup.loadFile("www/odometryPopup.html")
  popup.once("ready-to-show", popup.show)

  if (!(id in odometryLookup)) {
    odometryLookup[id] = []
  }
  odometryLookup[id].push(popup)

  var closed = false
  BrowserWindow.getFocusedWindow().once("close", () => { if (!closed) popup.close() })
  popup.once("closed", () => {
    closed = true
    odometryLookup[id].splice(odometryLookup[id].indexOf(popup), 1)
  })
})

ipcMain.on("resize-odometry-popup", (event, aspectRatio) => {
  var window = BrowserWindow.fromWebContents(event.sender)
  var size = window.getContentSize()
  window.setAspectRatio(aspectRatio)
  window.setContentSize(Math.round(size[1] * aspectRatio), size[1])
})

ipcMain.on("update-odometry-popup", (_, id, command) => {
  if (id in odometryLookup) {
    odometryLookup[id].forEach(window => {
      if (window.isVisible()) {
        window.send("render", command)
      }
    })
  }
})