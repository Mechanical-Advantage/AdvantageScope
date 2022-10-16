import { USB_ADDRESS } from "./shared/IPAddresses";
import NamedMessage from "./shared/NamedMessage";
import Preferences from "./shared/Preferences";

const FILE_LIST: HTMLElement = document.getElementsByClassName("file-list")[0] as HTMLElement;
const FILE_LIST_ITEMS: HTMLElement = FILE_LIST.children[0] as HTMLElement;
const LOADING_ANIMATION: HTMLElement = document.getElementsByClassName("loading")[0] as HTMLElement;
const PROGRESS_BAR: HTMLProgressElement = document.getElementsByTagName("progress")[0] as HTMLProgressElement;
const ALERT_TEXT: HTMLElement = document.getElementsByClassName("alert-text")[0] as HTMLElement;
const EXIT_BUTTON: HTMLElement = document.getElementById("exit") as HTMLElement;
const DOWNLOAD_BUTTON: HTMLElement = document.getElementById("download") as HTMLElement;

const FILE_ITEM_HEIGHT_PX = 25;
const BOTTOM_FILLTER_MARGIN_PX = 5;

let messagePort: MessagePort | null = null;
let platform: string = "";
let preferences: Preferences | null = null;

let lastAddress: string = "";
let loading = true;
let alertIsError = false;
let filenames: string[] = [];
let selectedFiles: string[] = [];
let lastClickedIndex: number | null = null;
let lastClickedSelect = true;

function sendMainMessage(name: string, data?: any) {
  if (messagePort != null) {
    let message: NamedMessage = { name: name, data: data };
    messagePort.postMessage(message);
  }
}

window.addEventListener("message", (event) => {
  if (event.source == window && event.data == "port") {
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
        lastAddress = preferences.usb ? USB_ADDRESS : preferences.rioAddress;
        path = preferences.rioPath;
      }
      sendMainMessage("start", {
        address: lastAddress,
        path: path
      });
      break;

    case "show-error":
      // Show loading animation and alert text
      LOADING_ANIMATION.hidden = false;
      loading = true;
      ALERT_TEXT.hidden = false;
      PROGRESS_BAR.hidden = true;

      // Remove list items
      while (FILE_LIST_ITEMS.firstChild) {
        FILE_LIST_ITEMS.removeChild(FILE_LIST_ITEMS.firstChild as HTMLElement);
      }

      // Set error text
      console.warn(message.data);
      let friendlyText = "";
      if (message.data == "No such file") {
        friendlyText = "Failed to open log folder at <u>" + preferences?.rioPath + "</u>";
      } else if (message.data == "Timed out while waiting for handshake") {
        friendlyText = "roboRIO not found at <u>" + lastAddress + "</u> (check connection)";
      } else if (message.data.includes("ENOTFOUND")) {
        friendlyText = "Unknown address <u>" + lastAddress + "</u>";
      } else if (message.data == "All configured authentication methods failed") {
        friendlyText = "Failed to authenticate to roboRIO at <u>" + lastAddress + "</u>";
      } else if (message.data == "Not connected") {
        friendlyText = "Lost connection to roboRIO";
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
      alertIsError = false;
      ALERT_TEXT.innerHTML = message.data;
      break;

    case "set-progress":
      // Show progress bar
      ALERT_TEXT.hidden = true;
      PROGRESS_BAR.hidden = false;
      alertIsError = false;
      let progress: number | null = message.data;
      if (progress == null) {
        PROGRESS_BAR.removeAttribute("value"); // Show indeterminate
      } else {
        PROGRESS_BAR.value = progress;
      }
      break;

    case "set-list":
      // Hide loading animation and alert text
      LOADING_ANIMATION.hidden = true;
      loading = false;
      if (alertIsError) {
        ALERT_TEXT.hidden = true;
        PROGRESS_BAR.hidden = true;
      }

      // Remove old list items
      while (FILE_LIST_ITEMS.firstChild) {
        FILE_LIST_ITEMS.removeChild(FILE_LIST_ITEMS.firstChild);
      }

      // Add new list items
      filenames = message.data;
      filenames.forEach((filename, index) => {
        let item = document.createElement("div");
        FILE_LIST_ITEMS.appendChild(item);
        item.classList.add("file-item");

        if (selectedFiles.includes(filename)) {
          item.classList.add("selected");
        }
        item.addEventListener("click", (event) => {
          if (event.shiftKey && lastClickedIndex != null) {
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
          } else if (selectedFiles.includes(filename)) {
            // Deselect item
            selectedFiles.splice(selectedFiles.indexOf(filename), 1);
            item.classList.remove("selected");
            lastClickedIndex = index;
            lastClickedSelect = false;
          } else {
            // Select item
            selectedFiles.push(filename);
            item.classList.add("selected");
            lastClickedIndex = index;
            lastClickedSelect = true;
          }
        });

        let img = document.createElement("img");
        item.appendChild(img);
        let filenameComponents = filename.split(".");
        let extension = filenameComponents[filenameComponents.length - 1];
        switch (platform) {
          case "darwin":
            img.src = "../icons/download/" + extension + "-icon-mac.png";
            img.classList.add("mac");
            break;
          case "win32":
            img.src = "../icons/download/" + extension + "-icon-win.png";
            break;
          case "linux":
            img.src = "../icons/download/" + extension + "-icon-linux.png";
            break;
        }
        let span = document.createElement("span");
        item.appendChild(span);
        span.innerText = filename;
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
  let itemCount = Array.from(FILE_LIST_ITEMS.children).filter((x) => x.childElementCount != 0).length;
  let targetFillerCount = Math.ceil(
    (FILE_LIST.getBoundingClientRect().height - BOTTOM_FILLTER_MARGIN_PX - itemCount * FILE_ITEM_HEIGHT_PX) /
      FILE_ITEM_HEIGHT_PX
  );
  if (targetFillerCount < 0) targetFillerCount = 0;

  // Update rows
  let getCurrentFillerCount = () => {
    return Array.from(FILE_LIST_ITEMS.children).filter((x) => x.childElementCount == 0).length;
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
  if (selectedFiles.length == 0) {
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
  if (event.code == "Enter") save();
});
