const { app, BrowserWindow, Menu, MenuItem, shell, dialog } = require("electron")
const path = require("path")

function createWindow() {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "assets/icon-256.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  })

  // win.webContents.openDevTools()
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
              title: "Select log file to open:",
              properties: ["openFile"],
              filters: [
                { name: "Robot logs", extensions: ["rlog"] }
              ]
            })
            files.then((files) => {
              if (files.filePaths.length > 0) {
                window.webContents.send("open-file", files.filePaths[0] + " (existing window)")
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

var firstOpenPath = null
app.whenReady().then(() => {
  setupMenu()
  var window = createWindow()

  // Check for file path given as argument
  if (process.defaultApp) {
    if (process.argv.length > 2) {
      firstOpenPath = "ARG: " + process.argv[2]
    }
  } else {
    if (process.argv.length > 1) {
      firstOpenPath = "ARG: " + process.argv[1]
    }
  }

  // Open file if exists
  if (firstOpenPath != null) {
    window.webContents.once("dom-ready", () => {
      window.send("open-file", firstOpenPath + " (first open)")
    })
  }

  // Create new window if activated while none exist
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit()
})

// macOS only, Linux & Windows start a new process and pass the file as an argument
app.on("open-file", (event, path) => {
  if (app.isReady()) { // Already running, create a new window
    var window = createWindow()
    window.webContents.once("dom-ready", () => {
      window.send("open-file", path + " (new window)")
    })
  } else { // Not running yet, open in first window
    firstOpenPath = path
  }
})