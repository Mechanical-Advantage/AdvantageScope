const { ipcRenderer } = require("electron")
const fs = require("fs")
const os = require("os")
const net = require("net")

// Window updates
ipcRenderer.on("set-fullscreen", (_, isFullscreen) => {
  window.dispatchEvent(new CustomEvent("set-fullscreen", {
    detail: isFullscreen
  }))
})

ipcRenderer.on("set-focused", (_, isFocused) => {
  window.dispatchEvent(new CustomEvent("set-focused", {
    detail: isFocused
  }))
})

// Set platform
window.addEventListener("DOMContentLoaded", () => {
  window.dispatchEvent(new CustomEvent("set-platform", {
    detail: {
      platform: process.platform,
      release: os.release()
    }
  }))
})

// State management
ipcRenderer.on("restore-state", (_, state) => {
  window.dispatchEvent(new CustomEvent("restore-state", {
    detail: state
  }))
})

window.addEventListener("save-state", event => {
  ipcRenderer.send("save-state", event.detail)
})

// Send preferences
ipcRenderer.on("set-preferences", (_, prefs) => {
  window.dispatchEvent(new CustomEvent("set-preferences", {
    detail: prefs
  }))
})

// Opening file
ipcRenderer.on("open-file", (_, path) => {
  fs.open(path, "r", function (err, file) {
    if (err) throw err

    fs.readFile(file, function (err, buffer) {
      window.dispatchEvent(new CustomEvent("open-file", {
        detail: {
          path: path,
          data: buffer
        }
      }))
    })
  })
})

// Display error popup
window.addEventListener("error", event => {
  ipcRenderer.send("error", event.detail.title, event.detail.content)
})

// Open link in browser
window.addEventListener("open-link", event => {
  ipcRenderer.send("open-link", event.detail)
})

// Set playback speed
window.addEventListener("set-playback-speed", event => {
  ipcRenderer.send("set-playback-speed", event.detail)
})

ipcRenderer.on("set-playback-speed-response", (_, speed) => {
  window.dispatchEvent(new CustomEvent("set-playback-speed-response", {
    detail: speed
  }))
})

// Add new tab
window.addEventListener("add-tab", () => {
  ipcRenderer.send("add-tab")
})

ipcRenderer.on("add-tab-response", (_, type) => {
  window.dispatchEvent(new CustomEvent("add-tab-response", {
    detail: type
  }))
})

// Menu bar tab commands
ipcRenderer.on("tab-command", (_, type, value) => {
  window.dispatchEvent(new CustomEvent("tab-command", {
    detail: {
      type: type,
      value: value
    }
  }))
})

// Edit axis popup
window.addEventListener("edit-axis", event => {
  ipcRenderer.send("edit-axis", event.detail)
})

ipcRenderer.on("edit-axis-response", (_, data) => {
  window.dispatchEvent(new CustomEvent("edit-axis-response", {
    detail: data
  }))
})

// Manage odometry popup
window.addEventListener("create-odometry-popup", event => {
  ipcRenderer.send("create-odometry-popup", event.detail)
})

window.addEventListener("update-odometry-popup", event => {
  ipcRenderer.send("update-odometry-popup", event.detail.id, event.detail.command)
})

// Manage live logging
ipcRenderer.on("start-live", () => {
  window.dispatchEvent(new Event("start-live"))
})


var client = null
window.addEventListener("start-live-socket", event => {
  client = net.createConnection({
    host: event.detail.address,
    port: event.detail.port
  })

  client.on("data", data => {
    if (client) {
      window.dispatchEvent(new CustomEvent("live-data", {
        detail: data
      }))
    }
  })

  client.on("error", () => {
    window.dispatchEvent(new Event("live-error"))
  })

  client.on("close", () => {
    window.dispatchEvent(new Event("live-closed"))
  })
})

window.addEventListener("stop-live-socket", () => {
  if (client) {
    client.destroy()
    client = null
  }
})