const { ipcRenderer } = require("electron");

ipcRenderer.on("set-type", (_, type) => {
  window.dispatchEvent(
    new CustomEvent("set-type", {
      detail: type
    })
  );
});

ipcRenderer.on("render", (_, command) => {
  window.dispatchEvent(
    new CustomEvent("render", {
      detail: command
    })
  );
});

window.addEventListener("set-aspect-ratio", (event) => {
  ipcRenderer.send("resize-generic-viz-popup", event.detail);
});
