import { Log } from "./modules/log.mjs"
import { Selection } from "./modules/selection.mjs"
import { SideBar } from "./modules/sideBar.mjs"
import { Tabs } from "./modules/tabs.mjs"
import { Holidays } from "./modules/holidays.mjs"

window.platform = null
window.platformRelease = null
window.isFullscreen = false
window.isFocused = true
window.prefs = {}

window.log = null
window.liveActive = false // Connected (or connecting) to live server
window.liveReconnecting = false // Reconnecting, supress errors
window.liveStart = null // If not null, actively receiving live data
window.selection = new Selection()
window.tabs = new Tabs()
window.sideBar = new SideBar()

var decodeWorker = null

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

// STATE MANAGEMENT

window.getWindowState = () => {
  return {
    tabs: tabs.state,
    sideBar: sideBar.state,
    selection: selection.state
  }
}

window.setWindowState = (newState, updateSelection) => {
  tabs.state = newState.tabs
  sideBar.state = newState.sideBar
  if (updateSelection) selection.state = newState.selection
}

window.addEventListener("restore-state", event => {
  setWindowState(event.detail, true)
})

window.setInterval(() => {
  window.dispatchEvent(new CustomEvent("save-state", {
    detail: getWindowState()
  }))
}, 1000)

// COMMUNICATION WITH PRELOAD

window.addEventListener("set-fullscreen", event => {
  window.isFullscreen = event.detail
  updateFancyWindow()
})

window.addEventListener("set-focused", event => {
  window.isFocused = event.detail
  Array.from(document.getElementsByTagName("button")).forEach(button => {
    if (window.isFocused) {
      button.classList.remove("blurred")
    } else {
      button.classList.add("blurred")
    }
  })
})

window.addEventListener("set-platform", event => {
  window.platform = event.detail.platform
  window.platformRelease = event.detail.release
  updateFancyWindow()
})

window.addEventListener("set-holiday", event => {
  if (event.detail in Holidays) {
    var holidayBanner = document.getElementsByClassName("holiday-banner")[0]
    while (holidayBanner.innerText.length < 200) {
      holidayBanner.innerText += Holidays[event.detail] + " "
    }
    holidayBanner.hidden = false
  }
})

window.addEventListener("set-preferences", event => {
  window.prefs = event.detail
})

window.addEventListener("open-file", event => {
  var logName = event.detail.path.split(/[\\/]+/).reverse()[0]
  if (event.detail.data.length > 1000000) sideBar.startLoading(logName)
  setTitle(logName + " \u2014 Advantage Scope")
  if (window.liveActive) {
    window.liveActive = false
    window.liveReconnecting = false
    window.liveStart = null
    selection.unlock()
    window.dispatchEvent(new Event("stop-live-socket")) // Stop live logging
  }

  console.log("Opening file '" + logName + "'")
  var startTime = new Date().getTime()

  decodeWorker = new Worker("decodeWorker.js", { type: "module" })
  decodeWorker.postMessage(event.detail.data)
  decodeWorker.onmessage = event => {
    switch (event.data.status) {
      case "incompatible": // Failed to read log file
        window.dispatchEvent(new CustomEvent("error", {
          detail: { title: "Failed to read log", content: event.data.message }
        }))
        break

      case "newData": // New data to show, reset everything
        var oldState = getWindowState()
        window.log = new Log()
        window.log.rawData = event.data.data
        window.liveStart = null
        selection.updateLockButtons()

        var length = new Date().getTime() - startTime
        console.log("Log ready in " + length.toString() + "ms")

        setWindowState(oldState, true) // Set to the same state (resets everything)
        break
    }
  }
})

window.addEventListener("start-live", () => {
  window.liveStart = null
  window.liveActive = true
  window.dispatchEvent(new Event("stop-live-socket"))
  setTitle(prefs.address + ":" + prefs.port.toString() + " \u2014 Advantage Scope")

  decodeWorker = new Worker("decodeWorker.js", { type: "module" })
  var firstData = true
  decodeWorker.onmessage = event => {
    switch (event.data.status) {
      case "incompatible": // Failed to read log file
        window.liveActive = false
        window.liveReconnecting = false
        window.liveStart = null
        selection.unlock()
        window.dispatchEvent(new CustomEvent("error", {
          detail: { title: "Failed to read log", content: event.data.message }
        }))
        window.dispatchEvent(new Event("stop-live-socket"))
        break

      case "newData": // New data to show
        var oldFieldCount = window.log == null ? 0 : window.log.getFieldCount()
        var oldState = getWindowState()

        window.log = new Log()
        window.log.rawData = event.data.data

        var timeRange = window.log.getTimestamps()[window.log.getTimestamps().length - 1] - window.log.getTimestamps()[0]
        window.liveStart = (new Date().getTime() / 1000) - timeRange

        if (firstData) {
          setWindowState(oldState, true)
          firstData = false
          window.liveReconnecting = false
          selection.updateLockButtons()
        } else if (window.log.getFieldCount() != oldFieldCount) { // Reset state when fields update
          setWindowState(oldState, false)
        }
        sideBar.updateTitle()
        tabs.updateLive()
        break
    }
  }

  // Start!
  window.dispatchEvent(new CustomEvent("start-live-socket", {
    detail: {
      address: prefs.address,
      port: prefs.port
    }
  }))
})

window.addEventListener("live-data", event => {
  if (window.liveActive) {
    decodeWorker.postMessage(event.detail)
  }
})

window.addEventListener("live-error", () => {
  if (window.liveActive) {
    if (window.liveReconnecting) {
      window.setTimeout(() => {
        window.dispatchEvent(new Event("start-live"))
      }, 1000)
    } else {
      window.dispatchEvent(new CustomEvent("error", {
        detail: { title: "Log connection failed", content: "Could not connect to log server at " + prefs.address + ":" + prefs.port }
      }))
    }
  }
})

window.addEventListener("live-closed", () => {
  if (window.liveStart != null) {
    window.liveStart = null
    window.liveReconnecting = true
    selection.unlock()
    window.setTimeout(() => {
      window.dispatchEvent(new Event("start-live"))
    }, 1000)
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