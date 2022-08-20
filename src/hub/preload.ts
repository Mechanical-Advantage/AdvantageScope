import NamedMessage from "../lib/NamedMessage";
import { ipcRenderer } from "electron";

const windowLoaded = new Promise((resolve) => {
  window.onload = resolve;
});

ipcRenderer.on("set-port", async (event) => {
  await windowLoaded;
  const message: NamedMessage = { name: "set-port" };
  window.postMessage(message, "*", event.ports);
});
