const { app, BrowserWindow, Menu, MenuItem, shell, dialog, ipcMain } = require("electron")
const windowStateKeeper = require("electron-window-state")
const path = require("path")
const os = require("os")

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
  var windowState = windowStateKeeper({
    defaultWidth: 1100,
    defaultHeight: 650,
    fullScreen: false
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
  const window = new BrowserWindow(prefs)
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

ipcMain.on("add-tab", () => {
  const menu = new Menu()
  menu.append(new MenuItem({
    label: "Line Graph",
    click() {
      BrowserWindow.getFocusedWindow().webContents.send("add-tab-response", 0)
    }
  }))
  menu.append(new MenuItem({
    label: "Table",
    click() {
      BrowserWindow.getFocusedWindow().webContents.send("add-tab-response", 1)
    }
  }))
  menu.append(new MenuItem({
    label: "Odometry",
    click() {
      BrowserWindow.getFocusedWindow().webContents.send("add-tab-response", 2)
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