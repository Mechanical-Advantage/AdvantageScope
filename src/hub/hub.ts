import Log from "./log/Log";
import NamedMessage from "../lib/NamedMessage";
import Preferences from "../lib/Preferences";
import { HistorialDataSource, HistorialDataSourceStatus } from "./sources/HistoricalDataSource";
import { LiveDataSource, LiveDataSourceStatus } from "./sources/LiveDataSource";
import RLOGFileSource from "./sources/RLOGFileSource";
import RLOGServerSource from "./sources/RLOGServerSource";
import htmlEncode from "../lib/htmlEncode";
import SelectionManager from "./SelectionManager";

// Constants
const USB_ADDRESS = "172.22.11.2";
const SIM_ADDRESS = "127.0.0.1";

// Global variables
declare global {
  interface Window {
    log: Log;
    preferences: Preferences | null;
    platform: string;
    platformRelease: string;
    isFullscreen: boolean;
    isFocused: boolean;

    selectionManager: SelectionManager;
    messagePort: MessagePort | null;
    sendMainMessage: (name: string, data?: any) => void;
  }
}
window.log = new Log();
window.preferences = null;
window.platform = "";
window.platformRelease = "";
window.isFullscreen = false;
window.isFocused = true;

window.selectionManager = new SelectionManager();
window.messagePort = null;

var historicalSource: HistorialDataSource | null;
var liveSource: LiveDataSource | null;

// WINDOW UTILITIES

function setWindowTitle(title: string) {
  document.getElementsByTagName("title")[0].innerHTML = htmlEncode(title);
  document.getElementsByClassName("title-bar-text")[0].innerHTML = htmlEncode(title);
}

function updateFancyWindow() {
  // Using fancy title bar?
  if (window.platform == "darwin" && Number(window.platformRelease.split(".")[0]) >= 20 && !window.isFullscreen) {
    document.body.classList.add("fancy-title-bar");
  } else {
    document.body.classList.remove("fancy-title-bar");
  }

  // Using fancy side bar?
  if (window.platform == "darwin") {
    document.body.classList.add("fancy-side-bar");
  } else {
    document.body.classList.remove("fancy-side-bar");
  }
}

// MAIN MESSAGE HANDLING

window.sendMainMessage = (name: string, data?: any) => {
  if (window.messagePort != null) {
    let message: NamedMessage = { name: name, data: data };
    window.messagePort.postMessage(message);
  }
};

window.addEventListener("message", (event) => {
  if (event.source == window && event.data == "port") {
    window.messagePort = event.ports[0];
    window.messagePort.onmessage = (event) => {
      var message: NamedMessage = event.data;
      handleMainMessage(message);
    };
  }
});

function handleMainMessage(message: NamedMessage) {
  switch (message.name) {
    case "set-fullscreen":
      window.isFullscreen = message.data;
      updateFancyWindow();
      break;

    case "set-focused":
      window.isFocused = message.data;
      Array.from(document.getElementsByTagName("button")).forEach((button) => {
        if (window.isFocused) {
          button.classList.remove("blurred");
        } else {
          button.classList.add("blurred");
        }
      });
      break;

    case "set-platform":
      window.platform = message.data.platform;
      window.platformRelease = message.data.release;
      updateFancyWindow();
      break;

    case "set-preferences":
      window.preferences = message.data;
      break;

    case "historical-data":
      if (historicalSource != null) {
        historicalSource.handleMainMessage(message.data);
      }
      break;

    case "live-rlog-data":
      if (liveSource != null) {
        liveSource.handleMainMessage(message.data);
      }
      break;

    case "open-file":
      alert('Opening file "' + message.data + '"');
      liveSource?.stop();
      historicalSource = new RLOGFileSource();
      historicalSource.openFile(
        message.data,
        (status: HistorialDataSourceStatus) => {
          console.log("Historical status", status);
        },
        (log: Log) => {
          console.log("Log finished");
          window.log = log;
        }
      );
      break;

    case "start-live":
      historicalSource?.stop();
      liveSource = new RLOGServerSource();
      window.log = new Log();

      let address = "";
      if (message.data == "sim") {
        address = SIM_ADDRESS;
      } else if (window.preferences?.usb) {
        address = USB_ADDRESS;
      } else {
        if (window.preferences) {
          address = window.preferences.address;
        }
      }

      liveSource.connect(
        address,
        window.log,
        (status: LiveDataSourceStatus) => {
          console.log("Live status", status);
          if (status == LiveDataSourceStatus.Error || status == LiveDataSourceStatus.Stopped) {
            window.selectionManager.setLiveDisconnected();
          }
        },
        () => {
          console.log("Log updated");
          let logRange = window.log.getTimestampRange();
          let newLiveZeroTime = new Date().getTime() / 1000 - (logRange[1] - logRange[0]);
          let oldLiveZeroTime = window.selectionManager.getLiveZeroTime();
          if (oldLiveZeroTime == null || oldLiveZeroTime > newLiveZeroTime) {
            window.selectionManager.setLiveConnected(newLiveZeroTime);
          }
          if (oldLiveZeroTime == null) {
            window.selectionManager.lock();
          }
        }
      );
      break;

    case "set-playback-speed":
      window.selectionManager.setPlaybackSpeed(message.data);
      break;
  }
}
