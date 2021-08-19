import { Log } from "./modules/log.mjs"

window.platform = null
window.platformRelease = null
window.isFullscreen = false

window.logPath = null
window.log = null

function setTitle(newTitle) {
  document.getElementsByTagName("title")[0].innerText = newTitle
  document.getElementsByClassName("title-bar-text")[0].innerText = newTitle
}

function updateFancyWindow() {
  // Using fancy title bar?
  if (platform == "darwin" && Number(platformRelease.split(".")[0]) >= 20 && !isFullscreen) {
    document.getElementsByClassName("main-view")[0].style.top = "38px"
    document.getElementsByClassName("title-bar")[0].hidden = false
  } else {
    document.getElementsByClassName("main-view")[0].style.top = "0px"
    document.getElementsByClassName("title-bar")[0].hidden = true
  }

  // Using fancy side bar?
  if (platform == "darwin") {
    document.getElementsByClassName("side-bar-background")[0].hidden = true
  } else {
    document.getElementsByClassName("side-bar-background")[0].hidden = false
  }
}

window.addEventListener("set-fullscreen", function (event) {
  window.isFullscreen = event.detail
  updateFancyWindow()
})

window.addEventListener("set-platform", function (event) {
  window.platform = event.detail.platform
  window.platformRelease = event.detail.release
  updateFancyWindow()
})

window.addEventListener("open-file", function (event) {
  window.logPath = event.detail.path
  setTitle(logPath.split(/[\\/]+/).reverse()[0] + " \u2014 6328 Log Viewer")
  console.log("Opening file '" + logPath + "'")
  var startTime = new Date().getTime()

  var decodeWorker = new Worker("decodeWorker.js", { type: "module" })
  decodeWorker.postMessage(event.detail.data)

  decodeWorker.onmessage = function (event) {
    window.log = new Log()
    window.log.rawData = event.data

    var length = new Date().getTime() - startTime
    console.log("Log decoded in " + length.toString() + "ms")
  }
})

const sideBarHandle = document.getElementsByClassName("side-bar-handle")[0]
var sideBarHandleActive = false

sideBarHandle.addEventListener("mousedown", (_) => sideBarHandleActive = true)
window.addEventListener("mouseup", (_) => sideBarHandleActive = false)
window.addEventListener("mousemove", (event) => {
  if (sideBarHandleActive) {
    var width = event.clientX
    if (width < 130) width = 130
    if (width > 500) width = 500
    document.documentElement.style.setProperty("--side-bar-width", width.toString() + "px")
  }
})