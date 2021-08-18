const { ipcRenderer } = require("electron")
const fs = require("fs")
const os = require("os")

ipcRenderer.on("set-fullscreen", (_, isFullscreen) => {
  window.dispatchEvent(new CustomEvent("set-fullscreen", {
    detail: isFullscreen
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

window.addEventListener("DOMContentLoaded", () => {
  window.dispatchEvent(new CustomEvent("set-platform", {
    detail: {
      platform: process.platform,
      release: os.release()
    }
  }))

  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})