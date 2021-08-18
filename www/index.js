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

function updateToolbar() {
  if (platform == "darwin" && Number(window.platformRelease.split(".")[0]) >= 20 && !isFullscreen) {
    document.getElementsByClassName("main-view")[0].style.top = "40px"
    document.getElementsByClassName("title-bar")[0].hidden = false
  } else {
    document.getElementsByClassName("main-view")[0].style.top = null
    document.getElementsByClassName("title-bar")[0].hidden = true
  }
}

window.addEventListener("set-fullscreen", function (event) {
  window.isFullscreen = event.detail
  updateToolbar()
})

window.addEventListener("set-platform", function (event) {
  window.platform = event.detail.platform
  window.platformRelease = event.detail.release
  updateToolbar()
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