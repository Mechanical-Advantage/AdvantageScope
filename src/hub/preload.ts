import NamedMessage from "../lib/NamedMessage";
import { ipcRenderer } from "electron";

const windowLoaded = new Promise((resolve) => {
  window.onload = resolve;
});

ipcRenderer.on("port", async (event) => {
  await windowLoaded;
  window.postMessage("port", "*", event.ports);
});
