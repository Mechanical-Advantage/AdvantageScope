const { ipcRenderer } = require("electron")

ipcRenderer.on("render", (_, command) => {
  window.dispatchEvent(new CustomEvent("render", {
    detail: command
  }))
})