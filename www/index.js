import { Log } from "./modules/log.mjs"
import { Selection } from "./modules/selection.mjs"
import { SideBar } from "./modules/sideBar.mjs"
import { Tabs } from "./modules/tabs.mjs"

window.platform = null
window.platformRelease = null
window.isFullscreen = false
window.isFocused = true
window.prefs = {}

window.log = null
window.logPath = null
window.liveStatus = 0 // 0 = not live, 1 = connecting (first time), 2 = active, 3 = reconecting
window.liveStart = null
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

window.addEventListener("set-preferences", event => {
  window.prefs = event.detail
})

function setLiveStatus(status) {
  var oldStatus = window.liveStatus
  window.liveStatus = status
  if (status != 2 && oldStatus == 2) {
    selection.unlock()
  }
  if (status == 2 && oldStatus != 2) {
    selection.lock()
  }
  selection.updateLockButtons()
}

window.addEventListener("open-file", event => {
  window.logPath = event.detail.path
  var logName = event.detail.path.split(/[\\/]+/).reverse()[0]
  if (event.detail.data.length > 1000000) sideBar.startLoading(logName)
  setTitle(logName + " \u2014 Advantage Scope")
  if (window.liveStatus != 0) {
    setLiveStatus(0)
    window.dispatchEvent(new Event("stop-live-socket")) // Stop live logging
  }

  console.log("Opening file '" + logName + "'")
  var startTime = new Date().getTime()

  decodeWorker = new Worker("decodeWorker.js", { type: "module" })
  decodeWorker.postMessage({ bytes: event.detail.data, isLive: false })
  decodeWorker.onmessage = event => {
    switch (event.data.status) {
      case "incompatible": // Failed to read log file
        window.dispatchEvent(new CustomEvent("error", {
          detail: { title: "Failed to read log", content: event.data.message }
        }))
        break

      case "newLog": // New data to show, reset everything
        var oldState = getWindowState()
        window.log = new Log()
        window.log.rawData = event.data.data

        var length = new Date().getTime() - startTime
        console.log("Log ready in " + length.toString() + "ms")

        setWindowState(oldState, true) // Set to the same state (resets everything)
        break
    }
  }
})

window.addEventListener("start-live", () => {
  if (window.liveStatus != 3) {
    setLiveStatus(1)
    setTitle(prefs.address + ":" + prefs.port.toString() + " (Connecting) \u2014 Advantage Scope")
  }
  window.dispatchEvent(new Event("stop-live-socket"))

  decodeWorker = new Worker("decodeWorker.js", { type: "module" })
  var firstData = true
  decodeWorker.onmessage = event => {
    switch (event.data.status) {
      case "incompatible": // Failed to read log file
        setLiveStatus(0)
        setTitle(prefs.address + ":" + prefs.port.toString() + " (Failed) \u2014 Advantage Scope")
        window.dispatchEvent(new CustomEvent("error", {
          detail: { title: "Failed to read log", content: event.data.message }
        }))
        window.dispatchEvent(new Event("stop-live-socket"))
        break

      case "newLiveData": // New data to show
        var oldFieldCount = window.log == null ? 0 : window.log.getFieldCount(true)
        var oldState = getWindowState()

        if (firstData) window.log = new Log()

        window.log.add(event.data.data)
        window.log.updateDisplayKeys()

        var timeRange = window.log.getTimestamps()[window.log.getTimestamps().length - 1] - window.log.getTimestamps()[0]
        window.liveStart = (new Date().getTime() / 1000) - timeRange

        if (firstData) {
          firstData = false
          setTitle(prefs.address + ":" + prefs.port.toString() + " \u2014 Advantage Scope")
          setWindowState(oldState, true)
          setLiveStatus(2)
        } else if (window.log.getFieldCount(true) != oldFieldCount) { // Reset state when fields update
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
  if (window.liveStatus != 0) {
    decodeWorker.postMessage({ bytes: event.detail, isLive: true })
  }
})

window.addEventListener("live-error", () => {
  if (window.liveStatus == 1) {
    setLiveStatus(0)
    setTitle(prefs.address + ":" + prefs.port.toString() + " (Failed) \u2014 Advantage Scope")
    window.dispatchEvent(new CustomEvent("error", {
      detail: { title: "Log connection failed", content: "Could not connect to log server at " + prefs.address + ":" + prefs.port }
    }))
  } else if (window.liveStatus == 3) {
    window.setTimeout(() => {
      window.dispatchEvent(new Event("start-live"))
    }, 1000)
  }
})

window.addEventListener("live-closed", () => {
  if (window.liveStatus == 2) {
    setLiveStatus(3)
    setTitle(prefs.address + ":" + prefs.port.toString() + " (Reconnecting) \u2014 Advantage Scope")
    window.setTimeout(() => {
      window.dispatchEvent(new Event("start-live"))
    }, 1000)
  }
})

window.addEventListener("export-csv", () => {
  if (log == null || window.liveStatus != 0) {
    window.dispatchEvent(new CustomEvent("error", {
      detail: { title: "Cannot export as CSV", content: "Please open a log file, then try again" }
    }))
  } else {
    window.dispatchEvent(new CustomEvent("export-csv-dialog", {
      detail: window.logPath
    }))
  }
})

window.addEventListener("export-csv-dialog-response", event => {
  var filename = event.detail.split(/[\\/]+/).reverse()[0]
  sideBar.startExporting(filename)
  var csvWorker = new Worker("csvWorker.js", { type: "module" })
  csvWorker.postMessage(log.rawData)
  csvWorker.onmessage = message => {
    window.dispatchEvent(new CustomEvent("save-csv-data", {
      detail: {
        path: event.detail,
        data: message.data
      }
    }))
  }
})

window.addEventListener("save-csv-data-response", () => {
  sideBar.updateTitle()
})

// MANAGE DRAGGING

var dragItem = document.getElementById("dragItem")
var dragActive = false
var dragOffsetX = 0
var dragOffsetY = 0
var dragLastX = 0
var dragLastY = 0
var dragData = null

window.startDrag = (x, y, offsetX, offsetY, data) => {
  dragActive = true
  dragOffsetX = offsetX
  dragOffsetY = offsetY
  dragLastX = x
  dragLastY = y
  dragData = data

  dragItem.hidden = false
  dragItem.style.left = (x - offsetX).toString() + "px"
  dragItem.style.top = (y - offsetY).toString() + "px"
}

var dragMove = (x, y) => {
  if (dragActive) {
    dragItem.style.left = (x - dragOffsetX).toString() + "px"
    dragItem.style.top = (y - dragOffsetY).toString() + "px"
    dragLastX = x
    dragLastY = y
    window.dispatchEvent(new CustomEvent("drag-update", {
      detail: { x: x, y: y, data: dragData }
    }))
  }
}
window.addEventListener("mousemove", event => { dragMove(event.clientX, event.clientY) })
window.addEventListener("touchmove", event => { dragMove(event.touches[0].clientX, event.touches[0].clientY) })

var dragEnd = () => {
  if (dragActive) {
    dragActive = false
    dragItem.hidden = true
    window.dispatchEvent(new CustomEvent("drag-stop", {
      detail: { x: dragLastX, y: dragLastY, data: dragData }
    }))
  }
}
window.addEventListener("mouseup", () => { dragEnd() })
window.addEventListener("touchend", () => { dragEnd() })