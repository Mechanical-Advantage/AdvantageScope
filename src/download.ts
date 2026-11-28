// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { IS_LITE } from "./shared/buildConstants";
import { KeyboardUtil } from "./shared/KeyboardUtil";
import {
  formatParsedLogSummary,
  formatParsedMatch,
  formatParsedTimestamp,
  ParsedLogFilename,
  parseLogFilename
} from "./shared/LogFilenameParser";
import NamedMessage from "./shared/NamedMessage";
import Preferences, { getRobotAddress } from "./shared/Preferences";
import { zfill } from "./shared/util";

const FILE_LIST: HTMLElement = document.getElementsByClassName("file-list")[0] as HTMLElement;
const FILE_LIST_ITEMS: HTMLElement = FILE_LIST.children[0] as HTMLElement;
const LOADING_ANIMATION: HTMLElement = document.getElementsByClassName("loading")[0] as HTMLElement;
const ALERT_TEXT: HTMLElement = document.getElementsByClassName("alert-text")[0] as HTMLElement;
const SELECTION_SUMMARY: HTMLElement = document.getElementsByClassName("selection-summary")[0] as HTMLElement;
const PROGRESS_BAR: HTMLProgressElement = document.getElementsByTagName("progress")[0] as HTMLProgressElement;
const PROGRESS_DETAILS: HTMLElement = document.getElementsByClassName("progress-details")[0] as HTMLElement;
const EXIT_BUTTON: HTMLElement = document.getElementById("exit") as HTMLElement;
const DOWNLOAD_BUTTON: HTMLElement = document.getElementById("download") as HTMLElement;

const FILE_ITEM_HEIGHT_PX = 25;
const BOTTOM_FILLER_MARGIN_PX = 5;

let messagePort: MessagePort | null = null;
let platform: string = "";
let systemLocale: string | undefined = undefined;
let preferences: Preferences | null = null;

let address: string = IS_LITE ? window.location.hostname : "";
let loading = true;
let startTime: number | null = null;
let alertIsError = false;
let filenames: string[] = [];
let fileSizes: Map<string, number> = new Map();
let parsedFiles: Map<string, ParsedLogFilename | null> = new Map();
let selectedFiles: string[] = [];
let hoveredFilename: string | null = null;
let lastClickedIndex: number | null = null;
let lastClickedSelect = true;

function sendMainMessage(name: string, data?: any) {
  if (messagePort !== null) {
    let message: NamedMessage = { name: name, data: data };
    messagePort.postMessage(message);
  }
}

window.addEventListener("message", (event) => {
  if (event.data === "port") {
    messagePort = event.ports[0];
    messagePort.onmessage = (event) => {
      let message: NamedMessage = event.data;
      handleMainMessage(message);
    };
  }
});

function handleMainMessage(message: NamedMessage) {
  switch (message.name) {
    case "set-platform":
      platform = message.data;
      break;

    case "set-system-locale":
      systemLocale = message.data;
      break;

    case "set-preferences":
      preferences = message.data;
      let path = "";
      if (preferences) {
        if (!IS_LITE) {
          // https://github.com/Mechanical-Advantage/AdvantageScope/issues/167
          address = getRobotAddress(preferences, platform)
            .split(".")
            .map((part) => part.replace(/^0+/, "") || "0")
            .join(".");
        }
        path = preferences.remotePath;
      }
      sendMainMessage("start", {
        address: address,
        path: path
      });
      break;

    case "set-focused":
      Array.from(document.getElementsByTagName("button")).forEach((button) => {
        if (message.data) {
          button.classList.remove("blurred");
        } else {
          button.classList.add("blurred");
        }
      });
      break;

    case "show-error":
      // Show loading animation and alert text
      LOADING_ANIMATION.hidden = false;
      loading = true;
      startTime = null;
      ALERT_TEXT.hidden = false;
      PROGRESS_BAR.hidden = true;
      PROGRESS_DETAILS.hidden = true;

      // Remove list items
      while (FILE_LIST_ITEMS.firstChild) {
        FILE_LIST_ITEMS.removeChild(FILE_LIST_ITEMS.firstChild as HTMLElement);
      }

      // Set error text
      console.warn(message.data);
      let friendlyText = "";
      if (message.data === "No such file") {
        friendlyText = t("download.errorNoFolder", { path: preferences?.remotePath });
      } else if (message.data === "Timed out while waiting for handshake" || message.data === "Fetch failed") {
        friendlyText = t("download.errorNotFound", { address: address });
      } else if (message.data.includes("ENOTFOUND")) {
        friendlyText = t("download.errorUnknownAddress", { address: address });
      } else if (message.data === "All configured authentication methods failed") {
        friendlyText = t("download.errorAuthFailed", { address: address });
      } else if (message.data === "Not connected") {
        friendlyText = t("download.errorNotConnected");
      } else {
        friendlyText = t("download.errorUnknown", { error: message.data });
      }
      alertIsError = true;
      ALERT_TEXT.innerHTML = friendlyText;
      updateSelectionSummary();
      break;

    case "show-alert":
      // Show alert text (don't change file list/loading animation)
      ALERT_TEXT.hidden = false;
      PROGRESS_BAR.hidden = true;
      PROGRESS_DETAILS.hidden = true;
      startTime = null;
      alertIsError = false;
      ALERT_TEXT.innerHTML = message.data;
      updateSelectionSummary();
      break;

    case "set-progress":
      // Show progress bar
      ALERT_TEXT.hidden = true;
      PROGRESS_BAR.hidden = false;
      PROGRESS_DETAILS.hidden = false;
      updateSelectionSummary();

      alertIsError = false;
      if (message.data === 0) {
        PROGRESS_BAR.value = 0;
        PROGRESS_DETAILS.innerText = t("download.statusPreparing");
      } else if (message.data === 1) {
        PROGRESS_BAR.value = 1;
        PROGRESS_DETAILS.innerText = t("download.statusFinished");
      } else {
        let currentSize: number = message.data.current;
        let totalSize: number = message.data.total;
        if (startTime === null) startTime = new Date().getTime() / 1000;

        let currentMB = Math.floor(currentSize / 1e6).toLocaleString(undefined, { useGrouping: false });
        let totalMB = Math.floor(totalSize / 1e6).toLocaleString(undefined, { useGrouping: false });
        let detailsText = "";
        if (new Date().getTime() / 1000 - startTime > 0.5 && currentSize > 1e6) {
          // Wait to establish speed
          let speed = Math.round((currentSize / (new Date().getTime() / 1000 - startTime) / 1e6) * 8);
          let remainingSeconds = Math.floor(
            ((new Date().getTime() / 1000 - startTime) / currentSize) * (totalSize - currentSize)
          );
          let remainingMinutes = Math.floor(remainingSeconds / 60);
          remainingSeconds -= remainingMinutes * 60;
          detailsText = t("download.progressDetailed", {
            current: currentMB,
            total: totalMB,
            speed: speed.toLocaleString(undefined, { useGrouping: false }),
            minutes: remainingMinutes.toLocaleString(undefined, { useGrouping: false }),
            seconds: zfill(remainingSeconds.toString(), 2)
          });
        } else {
          detailsText = t("download.progressSimple", {
            current: currentMB,
            total: totalMB
          });
        }

        PROGRESS_BAR.value = totalSize === 0 ? 0 : currentSize / totalSize;
        PROGRESS_DETAILS.innerText = detailsText;
      }
      break;

    case "set-list":
      // Hide loading animation and alert text
      LOADING_ANIMATION.hidden = true;
      loading = false;
      if (alertIsError) {
        ALERT_TEXT.hidden = true;
        PROGRESS_BAR.hidden = true;
        PROGRESS_DETAILS.hidden = true;
      }

      // Remove old list items
      while (FILE_LIST_ITEMS.firstChild) {
        FILE_LIST_ITEMS.removeChild(FILE_LIST_ITEMS.firstChild);
      }

      // Get and sort filenames
      let fileData: { name: string; size: number; isFolder: boolean }[] = message.data;
      let isRandomized = (name: string): boolean =>
        name.includes("TBD") || // WPILib DataLogManager
        ((name.startsWith("Log_") || name.startsWith("akit_")) && !name.includes("-")); // AdvantageKit
      fileData.sort((a, b) => {
        let aRandomized = isRandomized(a.name);
        let bRandomized = isRandomized(b.name);
        if (aRandomized && !bRandomized) {
          return 1;
        } else if (!aRandomized && bRandomized) {
          return -1;
        } else {
          return -a.name.localeCompare(b.name);
        }
      });

      // Add new list items
      filenames = fileData.map((file) => file.name);
      fileSizes.clear();
      parsedFiles.clear();
      fileData.forEach((file, index) => {
        fileSizes.set(file.name, file.size);
        const parsed = file.isFolder ? null : parseLogFilename(file.name);
        parsedFiles.set(file.name, parsed);

        let item = document.createElement("div");
        FILE_LIST_ITEMS.appendChild(item);
        item.classList.add("file-item");
        if (parsed?.match) {
          item.classList.add("match");
        }
        if (parsed) {
          const summary = formatParsedLogSummary(parsed, t, document.documentElement.lang || undefined, systemLocale);
          if (summary.length > 0) {
            item.title = summary;
          }
        }

        if (selectedFiles.includes(file.name)) {
          item.classList.add("selected");
        }
        item.addEventListener("mouseenter", () => {
          hoveredFilename = file.name;
          updateSelectionSummary();
        });
        item.addEventListener("mouseleave", () => {
          if (hoveredFilename === file.name) {
            hoveredFilename = null;
            updateSelectionSummary();
          }
        });
        item.addEventListener("click", (event) => {
          if (event.shiftKey && lastClickedIndex !== null) {
            // Update a range of items
            let range = [Math.min(index, lastClickedIndex), Math.max(index, lastClickedIndex)];
            for (let i = range[0]; i < range[1] + 1; i++) {
              if (lastClickedSelect && !selectedFiles.includes(filenames[i])) {
                selectedFiles.push(filenames[i]);
                FILE_LIST_ITEMS.children[i].classList.add("selected");
              }
              if (!lastClickedSelect && selectedFiles.includes(filenames[i])) {
                selectedFiles.splice(selectedFiles.indexOf(filenames[i]), 1);
                FILE_LIST_ITEMS.children[i].classList.remove("selected");
              }
            }
          } else if (selectedFiles.includes(file.name)) {
            // Deselect item
            selectedFiles.splice(selectedFiles.indexOf(file.name), 1);
            item.classList.remove("selected");
            lastClickedIndex = index;
            lastClickedSelect = false;
          } else {
            // Select item
            selectedFiles.push(file.name);
            item.classList.add("selected");
            lastClickedIndex = index;
            lastClickedSelect = true;
          }
          updateSelectionSummary();
        });

        let img = document.createElement("img");
        item.appendChild(img);
        if (file.isFolder) {
          img.src = "../icons/download/folder-icon.png";
          img.classList.add("folder");
        } else {
          let filenameComponents = file.name.split(".");
          let extension = filenameComponents[filenameComponents.length - 1];
          if (extension === "wpilogxz") extension = "wpilog";
          switch (platform) {
            case "darwin":
              img.src = "../icons/download/" + extension + "-icon-mac.png";
              img.classList.add("mac");
              break;
            case "linux":
            case "win32":
              img.src = "../icons/download/" + extension + "-icon-linuxwin.png";
              break;
            case "lite":
              img.src = "../icons/" + extension + "-icon.png";
              break;
          }
        }
        let filenameSpan = document.createElement("span");
        item.appendChild(filenameSpan);
        filenameSpan.innerText = file.name;
        let sizeSpan = document.createElement("span");
        item.appendChild(sizeSpan);
        sizeSpan.innerText =
          " " +
          (file.size < 1e5
            ? t("download.sizeLessThanMinimum")
            : t("download.sizeValue", { size: (Math.round(file.size / 1e5) / 10).toString() }));
      });

      updateFiller();
      updateSelectionSummary();
      break;

    default:
      console.warn("Unknown message from main process", message);
      break;
  }
}

/** Updates the single-line summary shown in the footer bar when idle. */
function updateSelectionSummary() {
  if (!ALERT_TEXT.hidden || !PROGRESS_BAR.hidden) {
    SELECTION_SUMMARY.hidden = true;
    return;
  }

  SELECTION_SUMMARY.replaceChildren();

  if (selectedFiles.length > 1) {
    let totalSize = 0;
    selectedFiles.forEach((name) => {
      totalSize += fileSizes.get(name) ?? 0;
    });
    const sizeText = totalSize < 1e5 ? "<0.1" : (Math.round(totalSize / 1e5) / 10).toString();
    SELECTION_SUMMARY.innerText = t("download.selectedSummary", {
      count: selectedFiles.length,
      size: sizeText
    });
    SELECTION_SUMMARY.hidden = false;
    return;
  }

  const targetFilename = selectedFiles.length === 1 ? selectedFiles[0] : hoveredFilename;
  const parsed = targetFilename !== null ? parsedFiles.get(targetFilename) ?? null : null;
  if (parsed === null) {
    SELECTION_SUMMARY.hidden = true;
    return;
  }

  const segments: HTMLElement[] = [];
  if (parsed.timestamp) {
    const tsSpan = document.createElement("span");
    tsSpan.innerText = formatParsedTimestamp(
      parsed.timestamp,
      document.documentElement.lang || undefined,
      systemLocale
    );
    segments.push(tsSpan);
  }
  if (parsed.event) {
    const eventSpan = document.createElement("span");
    eventSpan.innerText = parsed.event;
    segments.push(eventSpan);
  }
  if (parsed.match) {
    const matchSpan = document.createElement("span");
    matchSpan.innerText = formatParsedMatch(parsed.match, t);
    segments.push(matchSpan);
  }

  if (segments.length === 0) {
    SELECTION_SUMMARY.hidden = true;
    return;
  }

  segments.forEach((segment, index) => {
    if (index > 0) {
      SELECTION_SUMMARY.appendChild(document.createTextNode(" · "));
    }
    SELECTION_SUMMARY.appendChild(segment);
  });
  SELECTION_SUMMARY.hidden = false;
}

/** Add/remove filler rows (zebra striping). */
function updateFiller() {
  if (loading) return;
  let itemCount = Array.from(FILE_LIST_ITEMS.children).filter((x) => x.childElementCount !== 0).length;
  let targetFillerCount = Math.ceil(
    (FILE_LIST.getBoundingClientRect().height - BOTTOM_FILLER_MARGIN_PX - itemCount * FILE_ITEM_HEIGHT_PX) /
      FILE_ITEM_HEIGHT_PX
  );
  if (targetFillerCount < 0) targetFillerCount = 0;

  // Update rows
  let getCurrentFillerCount = () => {
    return Array.from(FILE_LIST_ITEMS.children).filter((x) => x.childElementCount === 0).length;
  };
  while (getCurrentFillerCount() > targetFillerCount) {
    FILE_LIST_ITEMS.removeChild(FILE_LIST_ITEMS.lastElementChild as HTMLElement);
  }
  while (getCurrentFillerCount() < targetFillerCount) {
    let item = document.createElement("div");
    FILE_LIST_ITEMS.appendChild(item);
    item.classList.add("file-item");
  }

  // Disable scroll when using filler
  FILE_LIST.style.overflow = targetFillerCount > 0 ? "hidden" : "auto";
}

/** Starts the download process for the selected files. */
function save() {
  if (selectedFiles.length === 0) {
    alert(t("download.alertSelectLog"));
  } else {
    sendMainMessage("save", selectedFiles);
  }
}

// Bind events
window.addEventListener("resize", updateFiller);
EXIT_BUTTON.addEventListener("click", () => {
  sendMainMessage("close");
});
DOWNLOAD_BUTTON.addEventListener("click", save);
window.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  if (event.code === "Enter") {
    save();
  } else if (!IS_LITE && KeyboardUtil.isPrimaryModifier(event) && KeyboardUtil.matchesKey(event, "a")) {
    event.preventDefault();
    if (event.shiftKey) {
      const matchFilenames = filenames.filter((name) => parsedFiles.get(name)?.match !== undefined);
      const allMatchesSelected =
        matchFilenames.length > 0 &&
        selectedFiles.length === matchFilenames.length &&
        matchFilenames.every((name) => selectedFiles.includes(name));
      if (allMatchesSelected) {
        // Deselect all
        selectedFiles = [];
        Array.from(FILE_LIST_ITEMS.children).forEach((row) => {
          row.classList.remove("selected");
        });
      } else {
        // Select all match logs
        selectedFiles = [...matchFilenames];
        Array.from(FILE_LIST_ITEMS.children).forEach((row, index) => {
          if (index < filenames.length) {
            row.classList.toggle("selected", matchFilenames.includes(filenames[index]));
          }
        });
      }
    } else if (filenames.length === selectedFiles.length) {
      // Deselect all
      selectedFiles = [];
      Array.from(FILE_LIST_ITEMS.children).forEach((row) => {
        row.classList.remove("selected");
      });
    } else {
      // Select all
      selectedFiles = [...filenames];
      Array.from(FILE_LIST_ITEMS.children).forEach((row, index) => {
        if (index < filenames.length) {
          row.classList.add("selected");
        }
      });
    }
    updateSelectionSummary();
  }
});
window.addEventListener("load", () => {
  (DOWNLOAD_BUTTON.children[0] as HTMLElement).hidden = IS_LITE;
  (DOWNLOAD_BUTTON.children[1] as HTMLElement).hidden = !IS_LITE;
});
