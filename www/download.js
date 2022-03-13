const fileList = document.getElementsByClassName("file-list")[0];
const fileListItems = fileList.children[0];
const loadingAnimation = document.getElementsByClassName("loading")[0];
const progressBar = document.getElementsByTagName("progress")[0];
const alertText = document.getElementsByClassName("alert-text")[0];
const exitButton = document.getElementById("exit");
const downloadButton = document.getElementById("download");

const fileItemHeight = 25;
const bottomFillerMargin = 5;

var platform = null;
var prefs = null;
var loading = true;
var alertIsError = false;
var filenames = [];
var selectedFiles = [];
var lastClickedIndex = null;
var lastClickedSelect = true;

// Update platform name
window.addEventListener("set-platform", (event) => {
  platform = event.detail;
});

// Update preferences
window.addEventListener("set-preferences", (event) => {
  prefs = event.detail;
});

// Update list of files
window.addEventListener("status-list", (event) => {
  // Hide loading animation and alert text
  loadingAnimation.hidden = true;
  loading = false;
  if (alertIsError) {
    alertText.hidden = true;
    progressBar.hidden = true;
  }

  // Remove old list items
  while (fileListItems.firstChild) {
    fileListItems.removeChild(fileListItems.firstChild);
  }

  // Add new list items
  filenames = event.detail;
  event.detail.forEach((filename, index) => {
    var item = document.createElement("div");
    fileListItems.appendChild(item);
    item.classList.add("file-item");

    if (selectedFiles.includes(filename)) {
      item.classList.add("selected");
    }
    item.addEventListener("click", (event) => {
      if (event.shiftKey && lastClickedIndex != null) {
        // Update a range of items
        var range = [Math.min(index, lastClickedIndex), Math.max(index, lastClickedIndex)];
        for (let i = range[0]; i < range[1] + 1; i++) {
          if (lastClickedSelect && !selectedFiles.includes(filenames[i])) {
            selectedFiles.push(filenames[i]);
            fileListItems.children[i].classList.add("selected");
          }
          if (!lastClickedSelect && selectedFiles.includes(filenames[i])) {
            selectedFiles.splice(selectedFiles.indexOf(filenames[i]), 1);
            fileListItems.children[i].classList.remove("selected");
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

    var img = document.createElement("img");
    item.appendChild(img);
    switch (platform) {
      case "darwin":
        img.src = "../icons/download/rlog-icon-mac.png";
        img.classList.add("mac");
        break;
      case "win32":
        img.src = "../icons/download/rlog-icon-win.png";
        break;
      case "linux":
        img.src = "../icons/download/rlog-icon-linux.png";
        break;
    }
    var span = document.createElement("span");
    item.appendChild(span);
    span.innerText = filename;
  });

  updateFiller();
});

// Add/remove filler rows
function updateFiller() {
  if (loading) return;
  var itemCount = Array.from(fileListItems.childNodes).filter((x) => x.childElementCount != 0).length;
  var targetFillerCount = Math.ceil(
    (fileList.getBoundingClientRect().height - bottomFillerMargin - itemCount * 25) / 25
  );
  if (targetFillerCount < 0) targetFillerCount = 0;

  // Update rows
  var getCurrentFillerCount = () => {
    return Array.from(fileListItems.childNodes).filter((x) => x.childElementCount == 0).length;
  };
  while (getCurrentFillerCount() > targetFillerCount) {
    fileListItems.removeChild(fileListItems.lastElementChild);
  }
  while (getCurrentFillerCount() < targetFillerCount) {
    var item = document.createElement("div");
    fileListItems.appendChild(item);
    item.classList.add("file-item");
  }

  // Disable scroll when using filler
  fileList.style.overflow = targetFillerCount > 0 ? "hidden" : "auto";
}
window.addEventListener("resize", updateFiller);

// Display error message
window.addEventListener("status-error", (event) => {
  loadingAnimation.hidden = false;
  loading = true;
  alertText.hidden = false;
  progressBar.hidden = true;

  // Remove list items
  while (fileListItems.firstChild) {
    fileListItems.removeChild(fileListItems.firstChild);
  }

  // Set error text
  var friendlyText = "";
  if (event.detail == "No such file") {
    friendlyText = "Failed to open log folder at <u>" + prefs.rioPath + "</u>";
  } else if (event.detail == "Timed out while waiting for handshake") {
    friendlyText = "roboRIO not found at <u>" + prefs.address + "</u> (check connection)";
  } else if (event.detail.includes("ENOTFOUND")) {
    friendlyText = "Unknown address <u>" + prefs.address + "</u>";
  } else if (event.detail == "All configured authentication methods failed") {
    friendlyText = "Failed to authenticate to roboRIO at <u>" + prefs.address + "</u>";
  } else if (event.detail == "Not connected") {
    friendlyText = "Lost connection to roboRIO";
  } else {
    friendlyText = "Unknown error" + " (" + event.detail + ")";
  }
  alertIsError = true;
  alertText.innerHTML = friendlyText;
});

// Display alert
window.addEventListener("status-alert", (event) => {
  alertText.hidden = false;
  progressBar.hidden = true;
  alertIsError = false;
  alertText.innerHTML = event.detail;
});

// Update progress bar
window.addEventListener("status-progress", (event) => {
  alertText.hidden = true;
  progressBar.hidden = false;
  alertIsError = false;
  if (event.detail == null) {
    progressBar.removeAttribute("value"); // Show indeterminate
  } else {
    progressBar.value = event.detail;
  }
});

// Bind button functions
exitButton.addEventListener("click", () => {
  window.dispatchEvent(new Event("exit-download"));
});
downloadButton.addEventListener("click", save);
window.addEventListener("keydown", (event) => {
  if (event.code == "Enter") save();
});

function save() {
  if (selectedFiles.length == 0) {
    alert("Please select a log to download.");
  } else {
    window.dispatchEvent(
      new CustomEvent("prompt-download-save", {
        detail: selectedFiles
      })
    );
  }
}
