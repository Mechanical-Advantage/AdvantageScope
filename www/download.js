const fileList = document.getElementsByClassName("file-list")[0]
const fileListItems = fileList.children[0]
const loadingAnimation = document.getElementsByClassName("loading")[0]
const progessBar = document.getElementsByTagName("progress")[0]
const errorText = document.getElementsByClassName("error-text")[0]
const exitButton = document.getElementById("exit")
const downloadButton = document.getElementById("download")

const fileItemHeight = 25
const bottomFillerMargin = 5

var platform = null
var prefs = null
var loading = true

// Update platform name
window.addEventListener("set-platform", event => {
  platform = event.detail
})

// Update preferences
window.addEventListener("set-preferences", event => {
  prefs = event.detail
})

// Update list of files
window.addEventListener("status-list", event => {
  // Hide loading animation and error text
  loadingAnimation.hidden = true
  loading = false
  errorText.hidden = true

  // Remove old list items
  while (fileListItems.firstChild) {
    fileListItems.removeChild(fileListItems.firstChild)
  }

  // Add new list items
  event.detail.forEach(filename => {
    var item = document.createElement("div")
    fileListItems.appendChild(item)
    item.classList.add("file-item")

    var img = document.createElement("img")
    item.appendChild(img)
    switch (platform) {
      case "darwin":
        img.src = "../icons/download/rlog-icon-mac.png"
        img.classList.add("mac")
        break
      case "win32":
        img.src = "../icons/download/rlog-icon-win.png"
        break
      case "linux":
        img.src = "../icons/download/rlog-icon-linux.png"
        break
    }
    var span = document.createElement("span")
    item.appendChild(span)
    span.innerText = filename
  })

  updateFiller()
})

// Add/remove filler rows
function updateFiller() {
  if (loading) return
  var itemCount = Array.from(fileListItems.childNodes).filter(x => x.childElementCount != 0).length
  var targetFillerCount = Math.ceil((fileList.getBoundingClientRect().height - bottomFillerMargin - (itemCount * 25)) / 25)
  if (targetFillerCount < 0) targetFillerCount = 0

  // Update rows
  var getCurrentFillerCount = () => { return Array.from(fileListItems.childNodes).filter(x => x.childElementCount == 0).length }
  while (getCurrentFillerCount() > targetFillerCount) {
    fileListItems.removeChild(fileListItems.lastElementChild)
  }
  while (getCurrentFillerCount() < targetFillerCount) {
    var item = document.createElement("div")
    fileListItems.appendChild(item)
    item.classList.add("file-item")
  }

  // Disable scroll when using filler
  fileList.style.overflow = targetFillerCount > 0 ? "hidden" : "auto"
}
window.addEventListener("resize", updateFiller)

// Display error message
window.addEventListener("status-error", event => {
  loadingAnimation.hidden = false
  loading = true
  errorText.hidden = false

  // Remove list items
  while (fileListItems.firstChild) {
    fileListItems.removeChild(fileListItems.firstChild)
  }

  // Set error text
  var friendlyText = ""
  if (event.detail == "No such file") {
    friendlyText = "Failed to open log folder at <u>" + prefs.rioPath + "</u>"
  } else if (event.detail == "Timed out while waiting for handshake") {
    friendlyText = "roboRIO not found at <u>" + prefs.address + "</u> (check connection)"
  } else if (event.detail.includes("ENOTFOUND")) {
    friendlyText = "Unknown address <u>" + prefs.address + "</u>"
  } else if (event.detail == "All configured authentication methods failed") {
    friendlyText = "Failed to authenticate to roboRIO at <u>" + prefs.address + "</u>"
  } else if (event.detail == "Not connected") {
    friendlyText = "" // We tried to refresh files while actively disconnecting, ignore this
  } else {
    friendlyText = "Unknown error" + " (" + event.detail + ")"
  }
  errorText.innerHTML = friendlyText
})