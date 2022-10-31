import { Config3d_Rotation, FRCData } from "../shared/FRCData";
import { SIM_ADDRESS, USB_ADDRESS } from "../shared/IPAddresses";
import Log from "../shared/log/Log";
import NamedMessage from "../shared/NamedMessage";
import Preferences from "../shared/Preferences";
import { htmlEncode } from "../shared/util";
import { HistorialDataSource, HistorialDataSourceStatus } from "./dataSources/HistoricalDataSource";
import { LiveDataSource, LiveDataSourceStatus } from "./dataSources/LiveDataSource";
import NT4Source from "./dataSources/NT4Source";
import RLOGFileSource from "./dataSources/RLOGFileSource";
import RLOGServerSource from "./dataSources/RLOGServerSource";
import WPILOGSource from "./dataSources/WPILOGSource";
import { HubState } from "../shared/HubState";
import Selection from "./Selection";
import Sidebar from "./Sidebar";
import Tabs from "./Tabs";
import WorkerManager from "./WorkerManager";

// Constants
const SAVE_PERIOD_MS = 250;
const DRAG_ITEM = document.getElementById("dragItem") as HTMLElement;

// Global variables
declare global {
  interface Window {
    log: Log;
    preferences: Preferences | null;
    frcData: FRCData | null;
    platform: string;
    platformRelease: string;
    appVersion: string;
    isFullscreen: boolean;
    isFocused: boolean;

    selection: Selection;
    sidebar: Sidebar;
    tabs: Tabs;
    messagePort: MessagePort | null;
    sendMainMessage: (name: string, data?: any) => void;
    startDrag: (x: number, y: number, offsetX: number, offsetY: number, data: any) => void;

    override3dRobotConfig: (title: string, rotations: Config3d_Rotation[], position: [number, number, number]) => void;
  }
}
window.log = new Log();
window.preferences = null;
window.frcData = null;
window.platform = "";
window.platformRelease = "";
window.isFullscreen = false;
window.isFocused = true;

window.selection = new Selection();
window.sidebar = new Sidebar();
window.tabs = new Tabs();
window.messagePort = null;

let historicalSource: HistorialDataSource | null;
let liveSource: LiveDataSource | null;
let logPath: string | null = null;

let dragActive = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let dragLastX = 0;
let dragLastY = 0;
let dragData: any = null;

// WINDOW UTILITIES

function setWindowTitle(name: string, status?: string) {
  let title = htmlEncode(name) + (status ? " (" + htmlEncode(status) + ")" : "") + " &mdash; Advantage Scope";
  document.getElementsByTagName("title")[0].innerHTML = title;
  document.getElementsByClassName("title-bar-text")[0].innerHTML = title;
}

function setLoading(active: boolean) {
  if (active) {
    document.getElementsByClassName("loading-glow")[0].classList.add("active");
  } else {
    document.getElementsByClassName("loading-glow")[0].classList.remove("active");
  }
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

// FRC DATA OVERRIDE

window.override3dRobotConfig = (title, rotations, position) => {
  if (!window.frcData) {
    console.error("FRC data not loaded yet.");
    return;
  }
  let index = window.frcData.robots.findIndex((robot) => robot.title == title);
  if (index == -1) {
    console.error(
      'Could not find robot "' +
        title +
        '"\n\nCheck that your config files have the following names: "Robot_' +
        title +
        '.json" and "Robot_' +
        title +
        '.glb"'
    );
    return;
  }
  window.frcData.robots[index].rotations = rotations;
  window.frcData.robots[index].position = position;
};

// MANAGE STATE

/** Returns the current state. */
function saveState(): HubState {
  return {
    sidebar: window.sidebar.saveState(),
    tabs: window.tabs.saveState()
  };
}

/** Restores to the provided state. */
function restoreState(state: HubState) {
  window.sidebar.restoreState(state.sidebar);
  window.tabs.restoreState(state.tabs);
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
        detail: { end: false, x: x, y: y, data: dragData }
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
      new CustomEvent("drag-update", {
        detail: { end: true, x: dragLastX, y: dragLastY, data: dragData }
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

// DATA SOURCE HANDLING

/** Connects to a historical data source. */
function startHistorical(path: string) {
  historicalSource?.stop();
  liveSource?.stop();

  if (path.endsWith(".rlog")) {
    historicalSource = new RLOGFileSource();
  } else if (path.endsWith(".wpilog")) {
    historicalSource = new WPILOGSource();
  } else {
    window.sendMainMessage("error", {
      title: "Failed to open log",
      content: "Could not determine the format of the log file. Please try again."
    });
    return;
  }

  historicalSource.openFile(
    path,
    (status: HistorialDataSourceStatus) => {
      let components = path.split(window.platform == "win32" ? "\\" : "/");
      let friendlyName = components[components.length - 1];
      switch (status) {
        case HistorialDataSourceStatus.Reading:
        case HistorialDataSourceStatus.Decoding:
          setWindowTitle(friendlyName, "Loading");
          setLoading(true);
          break;
        case HistorialDataSourceStatus.Ready:
          setWindowTitle(friendlyName);
          setLoading(false);
          break;
        case HistorialDataSourceStatus.Error:
          setWindowTitle(friendlyName, "Error");
          setLoading(false);
          window.sendMainMessage("error", {
            title: "Failed to open log",
            content: "There was a problem while reading the log file. Please try again."
          });
          break;
        case HistorialDataSourceStatus.Stopped:
          setLoading(false);
          break;
      }
    },
    (log: Log) => {
      logPath = path;
      window.log = log;
      window.sidebar.refresh();
      window.tabs.refresh();
    }
  );
}

/** Connects to a live data source. */
function startLive(isSim: boolean) {
  historicalSource?.stop();
  liveSource?.stop();

  if (!window.preferences) return;
  switch (window.preferences.liveMode) {
    case "nt4":
      liveSource = new NT4Source(false);
      break;
    case "nt4-akit":
      liveSource = new NT4Source(true);
      break;
    case "rlog":
      liveSource = new RLOGServerSource();
      break;
  }

  let address = "";
  if (isSim) {
    address = SIM_ADDRESS;
  } else if (window.preferences?.usb) {
    address = USB_ADDRESS;
  } else {
    if (window.preferences) {
      address = window.preferences.rioAddress;
    }
  }

  liveSource.connect(
    address,
    (status: LiveDataSourceStatus) => {
      switch (status) {
        case LiveDataSourceStatus.Connecting:
          setWindowTitle(address, "Searching");
          break;
        case LiveDataSourceStatus.Active:
          setWindowTitle(address);
          break;
        case LiveDataSourceStatus.Error:
          setWindowTitle(address, "Error");
          window.sendMainMessage("error", {
            title: "Problem with live source",
            content:
              "There was a problem while connecting to the live source. Please check your connection settings and try again."
          });
          break;
      }

      if (status != LiveDataSourceStatus.Active) {
        window.selection.setLiveDisconnected();
      }
    },
    (log: Log, timeSupplier: () => number) => {
      logPath = null;
      window.log = log;
      window.selection.setLiveConnected(timeSupplier);
      window.sidebar.refresh();
      window.tabs.refresh();
    }
  );
}

// File dropped on window
document.addEventListener("dragover", (event) => {
  event.preventDefault();
});
document.addEventListener("drop", (event) => {
  event.preventDefault();
  event.stopPropagation();

  if (event.dataTransfer) {
    for (const file of event.dataTransfer.files) {
      startHistorical(file.path);
      return;
    }
  }
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
      let message: NamedMessage = event.data;
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

    case "set-version":
      window.platform = message.data.platform;
      window.platformRelease = message.data.platformRelease;
      window.appVersion = message.data.appVersion;
      updateFancyWindow();
      break;

    case "set-preferences":
      window.preferences = message.data;
      break;

    case "set-frc-data":
      window.frcData = message.data;
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
      startHistorical(message.data);
      break;

    case "start-live":
      startLive(message.data);
      break;

    case "set-playback-speed":
      window.selection.setPlaybackSpeed(message.data);
      break;

    case "new-tab":
      window.tabs.addTab(message.data);
      break;

    case "move-tab":
      window.tabs.setSelected(window.tabs.getSelectedTab() + message.data);
      break;

    case "shift-tab":
      window.tabs.shift(window.tabs.getSelectedTab(), message.data);
      break;

    case "close-tab":
      window.tabs.close(window.tabs.getSelectedTab());
      break;

    case "edit-axis":
      window.tabs.editAxis(message.data.isLeft, message.data.lockedRange, message.data.unitConversion);
      break;

    case "rename-tab":
      window.tabs.renameTab(message.data.index, message.data.name);
      break;

    case "video-data":
      window.tabs.processVideoData(message.data);
      break;

    case "start-export-csv":
      if (logPath != null) {
        window.sendMainMessage("prompt-export-csv", logPath);
      } else {
        window.sendMainMessage("error", {
          title: "Cannot export as CSV",
          content: "Please open a log file, then try again."
        });
      }
      break;

    case "prepare-export-csv":
      setLoading(true);
      WorkerManager.request("../bundles/hub$csvWorker.js", window.log.toSerialized())
        .then((csvContent) => {
          window.sendMainMessage("write-export-csv", {
            path: message.data,
            content: csvContent
          });
        })
        .catch(() => {
          window.sendMainMessage("error", {
            title: "Failed to export as CSV",
            content: "There was a problem while converting to the CSV format. Please try again."
          });
        });
      break;

    case "finish-export-csv":
      setLoading(false);
      break;

    default:
      console.warn("Unknown message from main process", message);
      break;
  }
}
