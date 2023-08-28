import { AdvantageScopeAssets } from "../shared/AdvantageScopeAssets";
import { HubState } from "../shared/HubState";
import { SIM_ADDRESS, USB_ADDRESS } from "../shared/IPAddresses";
import Log from "../shared/log/Log";
import { getEnabledData, searchFields } from "../shared/log/LogUtil";
import NamedMessage from "../shared/NamedMessage";
import Preferences from "../shared/Preferences";
import { htmlEncode } from "../shared/util";
import { HistoricalDataSource, HistoricalDataSourceStatus } from "./dataSources/HistoricalDataSource";
import { LiveDataSource, LiveDataSourceStatus } from "./dataSources/LiveDataSource";
import { NT4Publisher } from "./dataSources/NT4Publisher";
import NT4Source from "./dataSources/NT4Source";
import RLOGServerSource from "./dataSources/RLOGServerSource";
import Selection from "./Selection";
import Sidebar from "./Sidebar";
import Tabs from "./Tabs";
import WorkerManager from "./WorkerManager";

// Constants
const SAVE_PERIOD_MS = 250;
const DRAG_ITEM = document.getElementById("dragItem") as HTMLElement;
const UPDATE_BUTTON = document.getElementsByClassName("update")[0] as HTMLElement;

// Global variables
declare global {
  interface Window {
    log: Log;
    preferences: Preferences | null;
    assets: AdvantageScopeAssets | null;
    platform: string;
    platformRelease: string;
    appVersion: string;
    isFullscreen: boolean;
    isFocused: boolean;
    isBattery: boolean;

    selection: Selection;
    sidebar: Sidebar;
    tabs: Tabs;
    messagePort: MessagePort | null;
    sendMainMessage: (name: string, data?: any) => void;
    startDrag: (x: number, y: number, offsetX: number, offsetY: number, data: any) => void;

    search: (query: string) => void;
  }
}
window.log = new Log();
window.preferences = null;
window.assets = null;
window.platform = "";
window.platformRelease = "";
window.isFullscreen = false;
window.isFocused = true;
window.isBattery = false;

window.search = (query) => searchFields(window.log, query);

window.selection = new Selection();
window.sidebar = new Sidebar();
window.tabs = new Tabs();
window.messagePort = null;

let historicalSource: HistoricalDataSource | null = null;
let liveSource: LiveDataSource | null = null;
let publisher: NT4Publisher | null = null;
let isExporting = false;
let logPath: string | null = null;
let liveActive = false;
let liveConnected = false;

let dragActive = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let dragLastX = 0;
let dragLastY = 0;
let dragData: any = null;

// WINDOW UTILITIES

function setWindowTitle(name: string, status?: string) {
  let title = htmlEncode(name) + (status ? " (" + htmlEncode(status) + ")" : "") + " &mdash; AdvantageScope";
  document.getElementsByTagName("title")[0].innerHTML = title;
  document.getElementsByClassName("title-bar-text")[0].innerHTML = title;
}

/** Shows or hides the loading indicator and updates progress. Pass "null" to disable loading indicator. */
function setLoading(progress: number | null) {
  let showLoadingGlowProperty = progress !== null ? "1" : "0";
  if (document.documentElement.style.getPropertyValue("--show-loading-glow") !== showLoadingGlowProperty) {
    document.documentElement.style.setProperty("--show-loading-glow", showLoadingGlowProperty);
  }
  if (progress !== null) {
    document.documentElement.style.setProperty("--loading-glow-progress", progress.toString());
  }
}

function updateFancyWindow() {
  // Using fancy title bar?
  if (window.platform === "darwin" && Number(window.platformRelease.split(".")[0]) >= 20 && !window.isFullscreen) {
    document.body.classList.add("fancy-title-bar");
  } else {
    document.body.classList.remove("fancy-title-bar");
  }

  // Using fancy sidebar?
  if (window.platform === "darwin") {
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
function startHistorical(path: string, shouldMerge: boolean = false) {
  historicalSource?.stop();
  liveSource?.stop();
  liveActive = false;
  setLoading(null);

  historicalSource = new HistoricalDataSource();
  historicalSource.openFile(
    path,
    (status: HistoricalDataSourceStatus) => {
      let components = path.split(window.platform === "win32" ? "\\" : "/");
      let friendlyName = components[components.length - 1];
      switch (status) {
        case HistoricalDataSourceStatus.Reading:
        case HistoricalDataSourceStatus.Decoding:
          if (!shouldMerge) setWindowTitle(friendlyName, "Loading");
          break;
        case HistoricalDataSourceStatus.Ready:
          if (!shouldMerge) setWindowTitle(friendlyName);
          setLoading(null);
          break;
        case HistoricalDataSourceStatus.Error:
          if (!shouldMerge) setWindowTitle(friendlyName, "Error");
          setLoading(null);
          window.sendMainMessage("error", {
            title: "Failed to open log",
            content: "There was a problem while reading the log file. Please try again."
          });
          break;
        case HistoricalDataSourceStatus.Stopped:
          break;
      }
    },
    (progress: number) => {
      setLoading(progress);
    },
    (log: Log) => {
      if (shouldMerge && window.log.getFieldKeys().length > 0) {
        // Check for field conflicts
        let newFields = log.getFieldKeys();
        let canMerge = true;
        window.log.getFieldKeys().forEach((key) => {
          if (newFields.includes(key)) canMerge = false;
        });
        if (!canMerge) {
          window.sendMainMessage("error", {
            title: "Failed to merge logs",
            content:
              "The logs contain conflicting fields. Merging is only possible when the logged fields don't overlap."
          });
          return;
        }

        // Merge based on first enable
        let currentFirstEnable = 0;
        let newFirstEnabled = 0;
        let currentEnabledData = getEnabledData(window.log);
        let newEnabledData = getEnabledData(log);
        if (currentEnabledData && currentEnabledData.values.includes(true)) {
          currentFirstEnable = currentEnabledData.timestamps[currentEnabledData.values.indexOf(true)];
        }
        if (newEnabledData && newEnabledData.values.includes(true)) {
          newFirstEnabled = newEnabledData.timestamps[newEnabledData.values.indexOf(true)];
        }
        window.log = Log.mergeLogs(window.log, log, currentFirstEnable - newFirstEnabled);
      } else {
        window.log = log;
        logPath = path;
      }

      liveConnected = false;
      window.sidebar.refresh();
      window.tabs.refresh();
    }
  );
}

/** Connects to a live data source. */
function startLive(isSim: boolean) {
  historicalSource?.stop();
  liveSource?.stop();
  publisher?.stop();
  liveActive = true;

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

      if (status !== LiveDataSourceStatus.Active) {
        window.selection.setLiveDisconnected();
      }
    },
    (log: Log, timeSupplier: () => number) => {
      logPath = null;
      liveConnected = true;
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
  if (window.messagePort !== null) {
    let message: NamedMessage = { name: name, data: data };
    window.messagePort.postMessage(message);
  }
};

window.addEventListener("message", (event) => {
  if (event.source === window && event.data === "port") {
    window.messagePort = event.ports[0];
    window.messagePort.onmessage = (event) => {
      let message: NamedMessage = event.data;
      handleMainMessage(message);
    };
  }
});

UPDATE_BUTTON.addEventListener("click", () => {
  window.sendMainMessage("prompt-update");
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

    case "set-battery":
      window.isBattery = message.data;
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

    case "set-assets":
      if (JSON.stringify(window.assets) !== JSON.stringify(message.data)) {
        window.assets = message.data;
        window.tabs.newAssets();
      }
      break;

    case "show-update-button":
      document.documentElement.style.setProperty("--show-update-button", message.data ? "1" : "0");
      UPDATE_BUTTON.hidden = !message.data;
      break;

    case "historical-data":
      if (historicalSource !== null) {
        historicalSource.handleMainMessage(message.data);
      }
      break;

    case "live-rlog-data":
      if (liveSource !== null) {
        liveSource.handleMainMessage(message.data);
      }
      break;

    case "open-file":
      if (isExporting) {
        window.sendMainMessage("error", {
          title: "Cannot open file",
          content: "Please wait for the export to finish, then try again."
        });
      } else {
        startHistorical(message.data);
      }
      break;

    case "open-file-merge":
      if (isExporting) {
        window.sendMainMessage("error", {
          title: "Cannot open file",
          content: "Please wait for the export to finish, then try again."
        });
      } else {
        startHistorical(message.data, true);
      }
      break;

    case "start-live":
      if (isExporting) {
        window.sendMainMessage("error", {
          title: "Cannot connect",
          content: "Please wait for the export to finish, then try again."
        });
      } else {
        startLive(message.data);
      }
      break;

    case "start-publish":
      if (liveActive) {
        window.sendMainMessage("error", {
          title: "Cannot publish",
          content: "Publishing is is not allowed from a live source."
        });
      } else if (!("NT" in window.log.getFieldTree())) {
        window.sendMainMessage("error", {
          title: "Cannot publish",
          content: "Please open a log file with NetworkTables data, then try again."
        });
      } else {
        publisher?.stop();
        publisher = new NT4Publisher(message.data);
      }
      break;

    case "stop-publish":
      publisher?.stop();
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

    case "rename-tab":
      window.tabs.renameTab(message.data.index, message.data.name);
      break;

    case "edit-axis":
      window.tabs.editAxis(message.data.legend, message.data.lockedRange, message.data.unitConversion);
      break;

    case "clear-axis":
      window.tabs.clearAxis(message.data);
      break;

    case "set-3d-camera":
      window.tabs.set3DCamera(message.data);
      break;

    case "video-data":
      window.tabs.processVideoData(message.data);
      break;

    case "start-export":
      if (isExporting) {
        window.sendMainMessage("error", {
          title: "Cannot export data",
          content: "Please wait for the previous export to finish, then try again."
        });
      } else if (logPath === null && !liveConnected) {
        window.sendMainMessage("error", {
          title: "Cannot export data",
          content: "Please open a log file or connect to a live source, then try again."
        });
      } else {
        isExporting = true;
        window.sendMainMessage("prompt-export", {
          path: logPath,
          incompleteWarning: liveConnected && window.preferences?.liveSubscribeMode === "low-bandwidth"
        });
      }
      break;

    case "cancel-export":
      isExporting = false;
      break;

    case "prepare-export":
      setLoading(null);
      historicalSource?.stop();
      WorkerManager.request(
        "../bundles/hub$exportWorker.js",
        {
          options: message.data.options,
          log: window.log.toSerialized()
        },
        (progress: number) => {
          setLoading(progress);
        }
      )
        .then((content) => {
          window.sendMainMessage("write-export", {
            path: message.data.path,
            content: content
          });
        })
        .catch(() => {
          window.sendMainMessage("error", {
            title: "Failed to export data",
            content: "There was a problem while converting to the export format. Please try again."
          });
        })
        .finally(() => {
          isExporting = false;
        });
      break;

    case "finish-export":
      setLoading(null);
      break;

    default:
      console.warn("Unknown message from main process", message);
      break;
  }
}
