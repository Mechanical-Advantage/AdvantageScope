// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { DISTRIBUTION, Distribution } from "./shared/buildConstants";
import { USB_ADDRESS } from "./shared/IPAddresses";
import NamedMessage from "./shared/NamedMessage";
import Preferences from "./shared/Preferences";
import { zfill } from "./shared/util";

const FILE_LIST: HTMLElement = document.getElementsByClassName("file-list")[0] as HTMLElement;
const FILE_LIST_ITEMS: HTMLElement = FILE_LIST.children[0] as HTMLElement;
const LOADING_ANIMATION: HTMLElement = document.getElementsByClassName("loading")[0] as HTMLElement;
const ALERT_TEXT: HTMLElement = document.getElementsByClassName("alert-text")[0] as HTMLElement;
const PROGRESS_BAR: HTMLProgressElement = document.getElementsByTagName("progress")[0] as HTMLProgressElement;
const PROGRESS_DETAILS: HTMLElement = document.getElementsByClassName("progress-details")[0] as HTMLElement;
const EXIT_BUTTON: HTMLElement = document.getElementById("exit") as HTMLElement;
const DOWNLOAD_BUTTON: HTMLElement = document.getElementById("download") as HTMLElement;

const FILE_ITEM_HEIGHT_PX = 25;
const BOTTOM_FILLER_MARGIN_PX = 5;

let messagePort: MessagePort | null = null;
let platform: string = "";
let preferences: Preferences | null = null;

let address: string = DISTRIBUTION === Distribution.Lite ? window.location.origin : "";
let loading = true;
let startTime: number | null = null;
let alertIsError = false;
let filenames: string[] = [];
let selectedFiles: string[] = [];
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

    case "set-preferences":
      preferences = message.data;
      let path = "";
      if (preferences) {
        if (DISTRIBUTION !== Distribution.Lite) {
          address = preferences.usb ? USB_ADDRESS : preferences.robotAddress;
          // https://github.com/Mechanical-Advantage/AdvantageScope/issues/167
          address = address
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
        friendlyText = `Failed to open log folder at <u>${preferences?.remotePath}</u>`;
      } else if (message.data === "No files") {
        friendlyText = `No files found in folder <u>${preferences?.remotePath}</u> (check path)`;
      } else if (
        message.data.includes("ENETUNREACH") ||
        message.data.includes("EHOSTDOWN") ||
        message.data.includes("ENOTFOUND") ||
        message.data.toLowerCase().includes("timeout") ||
        message.data === "Fetch failed"
      ) {
        friendlyText = `Robot not found at <u>${address}</u> (check connection)`;
      } else {
        friendlyText = "Unknown error: " + message.data;
      }
      alertIsError = true;
      ALERT_TEXT.innerHTML = friendlyText;
      break;

    case "show-alert":
      // Show alert text (don't change file list/loading animation)
      ALERT_TEXT.hidden = false;
      PROGRESS_BAR.hidden = true;
      PROGRESS_DETAILS.hidden = true;
      startTime = null;
      alertIsError = false;
      ALERT_TEXT.innerHTML = message.data;
      break;

    case "set-progress":
      // Show progress bar
      ALERT_TEXT.hidden = true;
      PROGRESS_BAR.hidden = false;
      PROGRESS_DETAILS.hidden = false;

      alertIsError = false;
      if (message.data === 0) {
        PROGRESS_BAR.value = 0;
        PROGRESS_DETAILS.innerText = "Preparing";
      } else if (message.data === 1) {
        PROGRESS_BAR.value = 1;
        PROGRESS_DETAILS.innerText = "Finished";
      } else {
        let currentSize: number = message.data.current;
        let totalSize: number = message.data.total;
        if (startTime === null) startTime = new Date().getTime() / 1000;

        let detailsText =
          Math.floor(currentSize / 1e6).toString() + "MB / " + Math.floor(totalSize / 1e6).toString() + "MB";
        if (new Date().getTime() / 1000 - startTime > 0.5 && currentSize > 1e6) {
          // Wait to establish speed
          let speed = Math.round((currentSize / (new Date().getTime() / 1000 - startTime) / 1e6) * 8);
          let remainingSeconds = Math.floor(
            ((new Date().getTime() / 1000 - startTime) / currentSize) * (totalSize - currentSize)
          );
          let remainingMinutes = Math.floor(remainingSeconds / 60);
          remainingSeconds -= remainingMinutes * 60;
          detailsText +=
            " (" +
            speed.toString() +
            "Mb/s, " +
            remainingMinutes.toString() +
            "m" +
            zfill(remainingSeconds.toString(), 2) +
            "s)";
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
      let fileData: { name: string; size: number }[] = message.data;
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
      fileData.forEach((file, index) => {
        let item = document.createElement("div");
        FILE_LIST_ITEMS.appendChild(item);
        item.classList.add("file-item");

        if (selectedFiles.includes(file.name)) {
          item.classList.add("selected");
        }
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
        });

        let img = document.createElement("img");
        item.appendChild(img);
        let filenameComponents = file.name.split(".");
        let extension = filenameComponents[filenameComponents.length - 1];
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
            img.src = "icons/" + extension + "-icon.png";
            break;
        }
        let filenameSpan = document.createElement("span");
        item.appendChild(filenameSpan);
        filenameSpan.innerText = file.name;
        let sizeSpan = document.createElement("span");
        item.appendChild(sizeSpan);
        sizeSpan.innerText = " (" + (file.size < 1e5 ? "<0.1" : Math.round(file.size / 1e5) / 10) + " MB)";
      });

      updateFiller();
      break;

    default:
      console.warn("Unknown message from main process", message);
      break;
  }
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
    alert("Please select a log to download.");
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
  if (event.code === "Enter") {
    save();
  } else if (
    DISTRIBUTION !== Distribution.Lite &&
    event.key === "a" &&
    (platform === "darwin" ? event.metaKey : event.ctrlKey)
  ) {
    if (filenames.length === selectedFiles.length) {
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
  }
});
window.addEventListener("load", () => {
  (DOWNLOAD_BUTTON.children[0] as HTMLElement).hidden = DISTRIBUTION === Distribution.Lite;
  (DOWNLOAD_BUTTON.children[1] as HTMLElement).hidden = DISTRIBUTION !== Distribution.Lite;
});
