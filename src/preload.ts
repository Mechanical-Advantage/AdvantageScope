import { contextBridge, ipcRenderer, webUtils } from "electron";

const windowLoaded = new Promise((resolve) => {
  window.onload = resolve;
});

ipcRenderer.on("port", async (event) => {
  await windowLoaded;
  window.postMessage("port", "*", event.ports);
});

contextBridge.exposeInMainWorld("electron", {
  getFilePath(file: File): string {
    return webUtils.getPathForFile(file);
  }
});
