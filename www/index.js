import { Log } from "./modules/log.mjs"
import { SideBar } from "./modules/sideBar.mjs"
import { Tabs } from "./modules/tabs.mjs"

window.platform = null
window.platformRelease = null
window.isFullscreen = false
window.isFocused = true

window.log = null
window.sideBar = new SideBar()
window.tabs = new Tabs()

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
    document.documentElement.style.setProperty("--tab-control-inline", 0)
  } else {
    document.getElementsByClassName("main-view")[0].style.top = "0px"
    document.getElementsByClassName("title-bar")[0].hidden = true
    document.getElementsByClassName("side-bar-shadow")[0].hidden = true
    document.documentElement.style.setProperty("--tab-control-inline", 1)
  }
  tabs.updateScrollBounds()

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

window.addEventListener("set-focused", function (event) {
  window.isFocused = event.detail
  Array.from(document.getElementsByTagName("button")).forEach(button => {
    if (window.isFocused) {
      button.classList.remove("blurred")
    } else {
      button.classList.add("blurred")
    }
  })
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
    console.log("Log decoded and processed in " + length.toString() + "ms")

    sideBar.update()
    tabs.reset()
  }
})

// MANAGE DRAGGING

var dragItem = document.getElementById("dragItem")
var dragActive = false
var dragOffsetX = 0
var dragOffsetY = 0
var dragData = null

window.startDrag = (x, y, offsetX, offsetY, data) => {
  dragActive = true
  dragOffsetX = offsetX
  dragOffsetY = offsetY
  dragData = data

  dragItem.hidden = false
  dragItem.style.left = (x - dragOffsetX).toString() + "px"
  dragItem.style.top = (y - dragOffsetY).toString() + "px"
}

window.addEventListener("mousemove", (event) => {
  if (dragActive) {
    dragItem.style.left = (event.clientX - dragOffsetX).toString() + "px"
    dragItem.style.top = (event.clientY - dragOffsetY).toString() + "px"
    window.dispatchEvent(new CustomEvent("drag-update", {
      detail: { x: event.clientX, y: event.clientY, data: dragData }
    }))
  }
})

window.addEventListener("mouseup", (event) => {
  if (dragActive) {
    dragActive = false
    dragItem.hidden = true
    window.dispatchEvent(new CustomEvent("drag-stop", {
      detail: { x: event.clientX, y: event.clientY, data: dragData }
    }))
  }
})