import { Tabs } from "./tabs.mjs"

// Controls the side bar and field list
export class SideBar {
  #sideBar = document.getElementsByClassName("side-bar")[0]
  #sideBarHandle = document.getElementsByClassName("side-bar-handle")[0]
  #sideBarShadow = document.getElementsByClassName("side-bar-shadow")[0]
  #sideBarTitle = document.getElementsByClassName("side-bar-title")[0]
  #fieldList = document.getElementById("fieldList")

  #knownKeys = ["DriverStation", "NetworkTables", "RealOutputs", "ReplayOutputs", "SystemStats"]
  #fieldDragThreshold = 3

  #sideBarHandleActive = false
  #sideBarWidth = 300
  #fieldControlLookup = {}
  #expandedCache = null
  #selectGroup = []
  #selectGroupUpdaters = []

  constructor() {
    // Set up handle for resizing
    this.#sideBarHandle.addEventListener("mousedown", (_) => {
      this.#sideBarHandleActive = true
      document.body.style.cursor = "col-resize"
    })
    window.addEventListener("mouseup", (_) => {
      this.#sideBarHandleActive = false
      document.body.style.cursor = "initial"
    })
    window.addEventListener("mousemove", (event) => {
      if (this.#sideBarHandleActive) {
        var width = event.clientX
        if (width > 500) width = 500
        if (width >= 80 && width < 160) width = 160
        if (width < 80) width = 0
        this.#sideBarWidth = width
        this.#updateWidth()
      }
    })
    this.#updateWidth()

    // Set up shadow when scrolling
    this.#sideBar.addEventListener("scroll", (event) => {
      this.#sideBarShadow.style.opacity = this.#sideBar.scrollTop == 0 ? 0 : 1
    })
  }

  // Standard function: retrieves current state
  get state() {
    if (this.#expandedCache == null) {
      var expanded = []
      for (let [title, elements] of Object.entries(this.#fieldControlLookup)) {
        if (!elements.childSpan.hidden) {
          expanded.push(title)
        }
      }
    } else {
      var expanded = this.#expandedCache
    }
    return {
      width: this.#sideBarWidth,
      scroll: this.#sideBar.scrollTop,
      expanded: expanded,
      selected: this.#selectGroup.map(id => log.getFieldInfo(id).displayKey)
    }
  }

  // Standard function: restores state where possible
  set state(newState) {
    // Update side bar width
    this.#sideBarWidth = newState.width
    this.#updateWidth()

    // Exit if log not ready
    if (log == null) {
      this.#expandedCache = newState.expanded
      return
    } else {
      this.#expandedCache = null
    }

    // Remove old list
    while (this.#fieldList.firstChild) {
      this.#fieldList.removeChild(this.#fieldList.firstChild)
    }

    // Update title
    this.updateTitle()

    // Sorting function that correctly interprets numbers within strings
    function smartSort(a, b) {
      function getNum(str) {
        for (let i = str.length; i > 0; i -= 1) {
          var num = Number(str.slice(-i))
          if (!isNaN(num)) {
            return num
          }
        }
      }

      var aNum = getNum(a)
      var bNum = getNum(b)
      if (aNum != null && bNum != null) {
        return aNum - bNum
      } else {
        if (a == b) return 0
        if (a > b) return 1
        if (a < b) return -1
      }
    }

    // Add fields
    var addField = (parentElement, title, field, indent, fullTitle) => {
      var hasChildren = Object.keys(field.children).length > 0

      var fieldElement = document.createElement("div")
      parentElement.appendChild(fieldElement)
      fieldElement.classList.add("field-item")

      var closedIcon = document.getElementById("fieldItemIconTemplates").children[0].cloneNode(true)
      var openIcon = document.getElementById("fieldItemIconTemplates").children[1].cloneNode(true)
      var neutralIcon = document.getElementById("fieldItemIconTemplates").children[2].cloneNode(true)
      fieldElement.append(closedIcon, openIcon, neutralIcon)
      closedIcon.style.display = hasChildren ? "initial" : "none"
      openIcon.style.display = "none"
      neutralIcon.style.display = hasChildren ? "none" : "initial"

      var label = document.createElement("div")
      fieldElement.appendChild(label)
      label.classList.add("field-item-label")
      if (this.#knownKeys.includes(title)) label.classList.add("known")
      label.innerText = title
      label.style.fontStyle = field.field == null ? "normal" : "italic"
      label.style.cursor = field.field == null ? "auto" : "grab"
      if (field.field != null) {
        var dragEvent = (x, y, offsetX, offsetY) => {
          var isGroup = this.#selectGroup.includes(field.field)
          document.getElementById("dragItem").innerText = title + (isGroup ? "..." : "")
          document.getElementById("dragItem").style.fontWeight = isGroup ? "bolder" : "initial"
          startDrag(x, y, offsetX, offsetY, {
            ids: isGroup ? this.#selectGroup : [field.field],
            children: isGroup ? [] : Object.values(field.children).map(x => x.field)
          })
          if (isGroup) {
            this.#selectGroup = []
            this.updateSelectGroup()
          }
        }

        var mouseDownInfo = null
        label.addEventListener("mousedown", event => {
          mouseDownInfo = [event.clientX, event.clientY, event.offsetX, event.offsetY]
        })
        window.addEventListener("mousemove", event => {
          if (mouseDownInfo != null) {
            if (Math.abs(event.clientX - mouseDownInfo[0]) >= this.#fieldDragThreshold || Math.abs(event.clientY - mouseDownInfo[1]) >= this.#fieldDragThreshold) {
              dragEvent(mouseDownInfo[0], mouseDownInfo[1], mouseDownInfo[2], mouseDownInfo[3])
              mouseDownInfo = null
            }
          }
        })
        label.addEventListener("mouseup", event => {
          if (mouseDownInfo != null) {
            if ((event.ctrlKey || event.metaKey) && Math.abs(event.clientX - mouseDownInfo[0]) < this.#fieldDragThreshold && Math.abs(event.clientY - mouseDownInfo[1]) < this.#fieldDragThreshold) {
              var index = this.#selectGroup.indexOf(field.field)
              if (index == -1) {
                this.#selectGroup.push(field.field)
                label.style.fontWeight = "bolder"
              } else {
                this.#selectGroup.splice(index, 1)
                label.style.fontWeight = "initial"
              }
            }
            mouseDownInfo = null
          }
        })
        label.addEventListener("touchstart", event => {
          var touch = event.targetTouches[0]
          dragEvent(touch.clientX, touch.clientY, touch.clientX - label.getBoundingClientRect().x, touch.clientY - label.getBoundingClientRect().y)
        })

        // Restore selection
        if (newState.selected.includes(log.getFieldInfo(field.field).displayKey)) {
          this.#selectGroup.push(field.field)
          label.style.fontWeight = "bolder"
        }

        // Add select update callback
        this.#selectGroupUpdaters.push(() => {
          label.style.fontWeight = this.#selectGroup.includes(field.field) ? "bolder" : "initial"
        })
      }

      if (hasChildren) {
        var childSpan = document.createElement("span")
        parentElement.appendChild(childSpan)
        childSpan.style.setProperty("--indent", (indent + 20).toString() + "px")
        childSpan.hidden = true

        closedIcon.addEventListener("click", () => this.#setExpanded(fieldElement, childSpan, true))
        openIcon.addEventListener("click", () => this.#setExpanded(fieldElement, childSpan, false))
        if (newState.expanded.includes(fullTitle)) this.#setExpanded(fieldElement, childSpan, true)
        this.#fieldControlLookup[fullTitle] = {
          fieldElement: fieldElement,
          childSpan: childSpan
        }

        var keys = Object.keys(field.children).sort(smartSort)
        for (let i in keys) {
          addField(childSpan, keys[i], field.children[keys[i]], indent + 20, fullTitle + "/" + keys[i])
        }
      }
    }

    // Start adding fields recursively
    this.#selectGroupUpdaters = []
    var tree = log.getFieldTree(true)
    var keys = Object.keys(tree).sort(smartSort).sort((a, b) => {
      if (this.#knownKeys.includes(a) && !this.#knownKeys.includes(b)) return 1
      if (!this.#knownKeys.includes(a) && this.#knownKeys.includes(b)) return -1
      return 0
    })
    for (let i in keys) {
      if (keys[i] == "RealMetadata" || keys[i] == "ReplayMetadata") {
        continue // Hide metadata b/c viewed separately
      }
      addField(this.#fieldList, keys[i], tree[keys[i]], 0, keys[i])
    }

    // Restore scroll position
    this.#sideBar.scrollTop = newState.scroll
  }

  // Updates set of bolded items based on current selected group
  updateSelectGroup() {
    this.#selectGroupUpdaters.forEach(update => update())
  }

  // Updates the title, including runtime
  updateTitle() {
    var runtime = log.getTimestamps()[log.getTimestamps().length - 1] - log.getTimestamps()[0]
    var runtimeUnit = "s"
    if (runtime > 120) {
      runtime /= 60
      runtimeUnit = "m"
    }
    if (runtime > 120) {
      runtime /= 60
      runtimeUnit = "h"
    }
    this.#sideBarTitle.innerText = log.getFieldCount(false).toString() + " field" + (log.getFieldCount(false) == 1 ? "" : "s") + ", " + Math.round(runtime).toString() + runtimeUnit + " runtime"
  }

  // Updates the current side bar width
  #updateWidth() {
    document.documentElement.style.setProperty("--side-bar-width", this.#sideBarWidth.toString() + "px")
    document.documentElement.style.setProperty("--show-side-bar", this.#sideBarWidth > 0 ? 1 : 0)
    tabs.updateScrollBounds()
    tabs.sideBarResize()
  }

  // Displays a loading message in the side bar title (when opening a file)
  startLoading(name) {
    this.#sideBarTitle.innerText = "Reading " + name + "..."
  }

  // Displays a loading message in the side bar title (when exporting a CSV)
  startExporting(name) {
    this.#sideBarTitle.innerText = "Exporting " + name + "..."
  }

  // Expand or hide field children
  #setExpanded(fieldElement, childSpan, expanded) {
    var closedIcon = fieldElement.children[0]
    var openIcon = fieldElement.children[1]

    childSpan.hidden = !expanded
    closedIcon.style.display = expanded ? "none" : "initial"
    openIcon.style.display = expanded ? "initial" : "none"
  }
}