import { htmlEncode } from "../lib/util";
import NamedMessage from "../lib/NamedMessage";
import Preferences from "../lib/Preferences";
import { HubState } from "./HubState";
import Log from "./log/Log";
import Selection from "./Selection";
import Sidebar from "./Sidebar";
import { HistorialDataSource, HistorialDataSourceStatus } from "./sources/HistoricalDataSource";
import { LiveDataSource, LiveDataSourceStatus } from "./sources/LiveDataSource";
import RLOGFileSource from "./sources/RLOGFileSource";
import RLOGServerSource from "./sources/RLOGServerSource";

// Constants
const USB_ADDRESS = "172.22.11.2";
const SIM_ADDRESS = "127.0.0.1";
const SAVE_PERIOD_MS = 500;
const DRAG_ITEM = document.getElementById("dragItem") as HTMLElement;

// Global variables
declare global {
  interface Window {
    log: Log;
    preferences: Preferences | null;
    platform: string;
    platformRelease: string;
    isFullscreen: boolean;
    isFocused: boolean;

    selection: Selection;
    sidebar: Sidebar;
    messagePort: MessagePort | null;
    sendMainMessage: (name: string, data?: any) => void;

    startDrag: (x: number, y: number, offsetX: number, offsetY: number, data: any) => void;
  }
}
window.log = new Log();
window.preferences = null;
window.platform = "";
window.platformRelease = "";
window.isFullscreen = false;
window.isFocused = true;

window.selection = new Selection();
window.sidebar = new Sidebar();
window.messagePort = null;

var historicalSource: HistorialDataSource | null;
var liveSource: LiveDataSource | null;

var dragActive = false;
var dragOffsetX = 0;
var dragOffsetY = 0;
var dragLastX = 0;
var dragLastY = 0;
var dragData: any = null;

// WINDOW UTILITIES

function setWindowTitle(name: string, status?: string) {
  let title = htmlEncode(name) + (status ? " (" + htmlEncode(status) + ")" : "") + " &mdash; Advantage Scope";
  document.getElementsByTagName("title")[0].innerHTML = title;
  document.getElementsByClassName("title-bar-text")[0].innerHTML = title;
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

// MANAGE STATE

/** Returns the current state. */
function saveState(): HubState {
  return {
    sidebar: window.sidebar.saveState(),
    tabController: { selected: null, tabs: [] }
  };
}

/** Restores to the provided state. */
function restoreState(state: HubState) {
  window.sidebar.restoreState(state.sidebar);
}

setInterval(() => {
  window.sendMainMessage("save-state", saveState());
}, SAVE_PERIOD_MS);

// MANAGE DRAGGING

window.startDrag = (x, y, offsetX, offsetY, data) => {
  dragActive = true;
  dragOffsetX = offsetX;
  dragOffsetY = offsetY;
  dragLastX = x;
  dragLastY = y;
  dragData = data;

  DRAG_ITEM.hidden = false;
  DRAG_ITEM.style.left = (x - offsetX).toString() + "px";
  DRAG_ITEM.style.top = (y - offsetY).toString() + "px";
};

function dragMove(x: number, y: number) {
  if (dragActive) {
    DRAG_ITEM.style.left = (x - dragOffsetX).toString() + "px";
    DRAG_ITEM.style.top = (y - dragOffsetY).toString() + "px";
    dragLastX = x;
    dragLastY = y;
    window.dispatchEvent(
      new CustomEvent("drag-update", {
        detail: { x: x, y: y, data: dragData }
      })
    );
  }
}
window.addEventListener("mousemove", (event) => {
  dragMove(event.clientX, event.clientY);
});
window.addEventListener("touchmove", (event) => {
  dragMove(event.touches[0].clientX, event.touches[0].clientY);
});

function dragEnd() {
  if (dragActive) {
    dragActive = false;
    DRAG_ITEM.hidden = true;
    window.dispatchEvent(
      new CustomEvent("drag-stop", {
        detail: { x: dragLastX, y: dragLastY, data: dragData }
      })
    );
  }
}
window.addEventListener("mouseup", () => {
  dragEnd();
});
window.addEventListener("touchend", () => {
  dragEnd();
});

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
    case "restore-state":
      restoreState(message.data);
      break;

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
      liveSource?.stop();
      historicalSource = new RLOGFileSource();
      historicalSource.openFile(
        message.data,
        (status: HistorialDataSourceStatus) => {
          let components = message.data.split(window.platform == "win32" ? "\\" : "/");
          let friendlyName = components[components.length - 1];
          switch (status) {
            case HistorialDataSourceStatus.Reading:
            case HistorialDataSourceStatus.Decoding:
              setWindowTitle(friendlyName, "Loading");
              break;
            case HistorialDataSourceStatus.Ready:
              setWindowTitle(friendlyName);
              break;
            case HistorialDataSourceStatus.Error:
              setWindowTitle(friendlyName, "Error");
              break;
          }
        },
        (log: Log) => {
          window.log = log;
          window.sidebar.refresh();
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
          switch (status) {
            case LiveDataSourceStatus.Connecting:
              setWindowTitle(address, "Connecting");
              break;
            case LiveDataSourceStatus.Active:
              setWindowTitle(address);
              break;
            case LiveDataSourceStatus.Error:
              setWindowTitle(address, "Disconnected");
              break;
          }

          if (status == LiveDataSourceStatus.Error || status == LiveDataSourceStatus.Stopped) {
            window.selection.setLiveDisconnected();
          }
        },
        () => {
          let logRange = window.log.getTimestampRange();
          let newLiveZeroTime = new Date().getTime() / 1000 - (logRange[1] - logRange[0]);
          let oldLiveZeroTime = window.selection.getLiveZeroTime();
          if (oldLiveZeroTime == null || oldLiveZeroTime > newLiveZeroTime) {
            window.selection.setLiveConnected(newLiveZeroTime);
          }
          if (oldLiveZeroTime == null) {
            window.selection.lock();
          }

          window.sidebar.refresh();
        }
      );
      break;

    case "set-playback-speed":
      window.selection.setPlaybackSpeed(message.data);
      break;
  }
}
