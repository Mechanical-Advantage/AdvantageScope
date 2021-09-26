const { ipcRenderer } = require("electron")
const fs = require("fs")
const os = require("os")

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

window.addEventListener("error", event => {
  ipcRenderer.send("error", event.detail.title, event.detail.content)
})

window.addEventListener("open-link", event => {
  ipcRenderer.send("open-link", event.detail)
})

window.addEventListener("add-tab", () => {
  ipcRenderer.send("add-tab")
})

ipcRenderer.on("add-tab-response", (_, type) => {
  window.dispatchEvent(new CustomEvent("add-tab-response", {
    detail: type
  }))
})

window.addEventListener("edit-axis", event => {
  ipcRenderer.send("edit-axis", event.detail)
})

ipcRenderer.on("edit-axis-response", (_, data) => {
  window.dispatchEvent(new CustomEvent("edit-axis-response", {
    detail: data
  }))
})

window.addEventListener("create-odometry-popup", event => {
  ipcRenderer.send("create-odometry-popup", event.detail)
})

window.addEventListener("update-odometry-popup", event => {
  ipcRenderer.send("update-odometry-popup", event.detail.id, event.detail.command)
})

window.addEventListener("DOMContentLoaded", () => {
  window.dispatchEvent(new CustomEvent("set-platform", {
    detail: {
      platform: process.platform,
      release: os.release()
    }
  }))
})