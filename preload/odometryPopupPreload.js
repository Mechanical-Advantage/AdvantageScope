const { ipcRenderer } = require("electron")

ipcRenderer.on("render", (_, command) => {
  window.dispatchEvent(new CustomEvent("render", {
    detail: command
  }))
})

window.addEventListener("set-aspect-ratio", event => {
  ipcRenderer.send("resize-odometry-popup", event.detail)
})