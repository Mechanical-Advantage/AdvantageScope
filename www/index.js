import { Log } from "./modules/log.mjs"
import { SideBar } from "./modules/sideBar.mjs"

window.platform = null
window.platformRelease = null
window.isFullscreen = false

window.log = null
window.sideBar = new SideBar()

function setTitle(newTitle) {
  document.getElementsByTagName("title")[0].innerText = newTitle
  document.getElementsByClassName("title-bar-text")[0].innerText = newTitle
}

function updateFancyWindow() {
  // Using fancy title bar?
  if (platform == "darwin" && Number(platformRelease.split(".")[0]) >= 20 && !isFullscreen) {
    document.getElementsByClassName("main-view")[0].style.top = "38px"
    document.getElementsByClassName("title-bar")[0].hidden = false
    document.getElementsByClassName("side-bar-shadow")[0].hidden = false
  } else {
    document.getElementsByClassName("main-view")[0].style.top = "0px"
    document.getElementsByClassName("title-bar")[0].hidden = true
    document.getElementsByClassName("side-bar-shadow")[0].hidden = true
  }

  // Using fancy side bar?
  if (platform == "darwin") {
    document.getElementsByClassName("side-bar-background")[0].hidden = true
  } else {
    document.getElementsByClassName("side-bar-background")[0].hidden = false
  }
}

// COMMUNICATION WITH PRELOAD

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
  var logName = event.detail.path.split(/[\\/]+/).reverse()[0]
  if (event.detail.data.length > 1000000) sideBar.startLoading(logName)
  setTitle(logName + " \u2014 6328 Log Viewer")

  console.log("Opening file '" + logName + "'")
  var startTime = new Date().getTime()

  var decodeWorker = new Worker("decodeWorker.js", { type: "module" })
  decodeWorker.postMessage(event.detail.data)
  decodeWorker.onmessage = function (event) {
    window.log = new Log()
    window.log.rawData = event.data

    var length = new Date().getTime() - startTime
    console.log("Log decoded in " + length.toString() + "ms")

    sideBar.update()
  }
})