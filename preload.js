const { ipcRenderer } = require("electron")

ipcRenderer.on("open-file", (event, path) => {
  window.dispatchEvent(new CustomEvent("open-file", {
    detail: { path: path }
  }))
})

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})