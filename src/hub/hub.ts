import Log from "../lib/log/Log";
import NamedMessage from "../lib/NamedMessage";
import Preferences from "../lib/Preferences";
import { HistorialDataSource, HistorialDataSourceStatus } from "./sources/HistoricalDataSource";
import RLOGFileSource from "./sources/RLOGFileSource";

var platform: string = "";
var platformRelease: string = "";
var isFullscreen: boolean = false;
var isFocused: boolean = true;
var preferences: Preferences | null = null;
var messagePort: MessagePort | null = null;

var historicalSource: HistorialDataSource | null;

function updateFancyWindow() {
  // Using fancy title bar?
  if (platform == "darwin" && Number(platformRelease.split(".")[0]) >= 20 && !isFullscreen) {
    document.body.classList.add("fancy-title-bar");
  } else {
    document.body.classList.remove("fancy-title-bar");
  }

  // Using fancy side bar?
  if (platform == "darwin") {
    document.body.classList.add("fancy-side-bar");
  } else {
    document.body.classList.remove("fancy-side-bar");
  }
}

// MAIN MESSAGING

function sendMainMessage(name: string, data: any) {
  if (messagePort != null) {
    messagePort.postMessage({ name: name, data: data });
  }
}

function handleMainMessage(message: NamedMessage) {
  console.log(message);
  switch (message.name) {
    case "set-fullscreen":
      isFullscreen = message.data;
      updateFancyWindow();
      break;

    case "set-focused":
      isFocused = message.data;
      Array.from(document.getElementsByTagName("button")).forEach((button) => {
        if (isFocused) {
          button.classList.remove("blurred");
        } else {
          button.classList.add("blurred");
        }
      });
      break;

    case "set-platform":
      platform = message.data.platform;
      platformRelease = message.data.release;
      updateFancyWindow();
      break;

    case "set-preferences":
      preferences = message.data;
      break;

    case "open-file":
      alert('Opening file "' + message.data + '"');
      historicalSource = new RLOGFileSource(sendMainMessage);
      historicalSource.openFile(
        message.data,
        (status: HistorialDataSourceStatus) => {
          console.log("New status", status);
        },
        (log: Log) => {
          console.log("Log finished", log);
        }
      );
      break;

    case "historical-data":
      if (historicalSource != null) {
        historicalSource.handleMainMessage(message.data);
      }
      break;
  }
}

window.addEventListener("message", (event) => {
  const message: NamedMessage = event.data;
  if (event.source == window && message.name == "set-port") {
    messagePort = event.ports[0];
    messagePort.onmessage = (event) => {
      var message: NamedMessage = event.data;
      handleMainMessage(message);
    };
  }
});
