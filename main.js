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
    { role: "appMenu" },
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
  if (firstOpenPath != null) {
    window.webContents.once("dom-ready", () => {
      window.send("open-file", firstOpenPath + " (first open)")
    })
  }

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit()
})

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