import { MetadataController } from "./tabControllers/metadataController.mjs"
import { LineGraphController } from "./tabControllers/lineGraphController.mjs"
import { TableController } from "./tabControllers/tableController.mjs"
import { OdometryController } from "./tabControllers/odometryController.mjs"

// Manages the tab bar
export class Tabs {
  #viewer = document.getElementsByClassName("viewer")[0]
  #tabBar = document.getElementsByClassName("tab-bar")[0]
  #shadowLeft = document.getElementsByClassName("tab-bar-shadow-left")[0]
  #shadowRight = document.getElementsByClassName("tab-bar-shadow-right")[0]
  #scrollOverlay = document.getElementsByClassName("tab-bar-scroll")[0]
  #scrollOverlayContent = document.getElementsByClassName("tab-bar-scroll-content")[0]
  #contentTemplates = document.getElementById("tabContentTemplates")

  #leftButton = document.getElementsByClassName("move-left")[0]
  #rightButton = document.getElementsByClassName("move-right")[0]
  #closeButton = document.getElementsByClassName("close")[0]
  #addButton = document.getElementsByClassName("add-tab")[0]

  #tabList = []
  #selectedTab = 0
  #verticalScroll = true

  constructor() {
    this.#updateElements()

    // Scroll handling
    window.addEventListener("resize", () => this.updateScrollBounds())
    this.#scrollOverlay.addEventListener("scroll", () => this.#updateScroll())

    // Hover and click handling
    this.#scrollOverlay.addEventListener("click", (event) => {
      this.#tabList.forEach((tab, index) => {
        var rect = tab.element.getBoundingClientRect()
        if (event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom) {
          this.#selectedTab = index
          this.#updateElements()
        }
      })
    })
    this.#scrollOverlay.addEventListener("mousemove", (event) => {
      this.#tabList.forEach((tab) => {
        var rect = tab.element.getBoundingClientRect()
        if (event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom) {
          tab.element.classList.add("tab-hovered")
        } else {
          tab.element.classList.remove("tab-hovered")
        }
      })
    })
    this.#scrollOverlay.addEventListener("mouseout", (event) => {
      this.#tabList.forEach((tab) => {
        tab.element.classList.remove("tab-hovered")
      })
    })

    // Control buttons
    this.#leftButton.addEventListener("click", () => this.shiftSelected(-1))
    this.#rightButton.addEventListener("click", () => this.shiftSelected(1))
    this.#closeButton.addEventListener("click", () => this.closeSelected())
    this.#addButton.addEventListener("click", () => window.dispatchEvent(new Event("add-tab")))
    window.addEventListener("add-tab-response", event => {
      this.addTab(event.detail)
    })
    this.addTab(0, true)
    this.addTab(1)

    // Menu bar commands
    window.addEventListener("tab-command", event => {
      switch (event.detail.type) {
        case "new":
          this.addTab(event.detail.value)
          break;
        case "move":
          this.#selectedTab += event.detail.value
          if (this.#selectedTab < 0) this.#selectedTab = 0
          if (this.#selectedTab > this.#tabList.length - 1) this.#selectedTab = this.#tabList.length - 1
          this.#updateElements()
          break;
        case "shift":
          this.shiftSelected(event.detail.value)
          break;
        case "close":
          this.closeSelected()
          break;
      }
    })

    // Periodic function
    var periodic = () => {
      this.#tabList[this.#selectedTab].controller.periodic()
      window.requestAnimationFrame(periodic)
    }
    window.requestAnimationFrame(periodic)
  }

  // Standard function: retrieves current state
  get state() {
    return {
      scroll: this.#verticalScroll ? this.#scrollOverlay.scrollTop : this.#scrollOverlay.scrollLeft,
      selected: this.#selectedTab,
      tabs: this.#tabList.map(tab => {
        return {
          type: tab.type,
          state: tab.controller.state
        }
      })
    }
  }

  // Standard function: restores state where possible
  set state(newState) {
    var oldTabs = this.#tabList.map(tab => tab.type)
    var newTabs = newState.tabs.map(tab => tab.type)
    if (JSON.stringify(oldTabs) == JSON.stringify(newTabs)) { // Reset all tabs, don't recreate them
      for (let i = 0; i < this.#tabList.length; i++) {
        this.#tabList[i].controller.state = newState.tabs[i].state
      }
    } else { // Something changed, recreate all tabs
      this.#tabList.forEach(tab => {
        this.#viewer.removeChild(tab.content)
      })
      this.#tabList = []
      newState.tabs.forEach(tab => {
        this.addTab(tab.type, true)
        this.#tabList[this.#tabList.length - 1].controller.state = tab.state
      })
      this.#selectedTab = newState.selected
      this.#updateElements()
    }

    if (this.#verticalScroll) {
      this.#scrollOverlay.scrollTop = newState.scroll
    } else {
      this.#scrollOverlay.scrollLeft = newState.scroll
    }
  }

  // Standard function: updates based on new live data
  updateLive() {
    this.#tabList.forEach(tab => {
      tab.controller.updateLive()
    })
  }

  // Passthrough to each tab controller
  sideBarResize() {
    this.#tabList.forEach((tab) => {
      tab.controller.sideBarResize()
    })
  }

  // Closes the current tab
  closeSelected() {
    if (this.#selectedTab == 0) return // Don't close metadata tab
    this.#viewer.removeChild(this.#tabList[this.#selectedTab].content)
    this.#tabList.splice(this.#selectedTab, 1)
    if (this.#selectedTab > this.#tabList.length - 1) this.#selectedTab = this.#tabList.length - 1
    this.#updateElements()
  }

  // Adds a new tab to the list
  addTab(type, skipUpdate) {
    var tabData = { type: type }
    switch (type) {
      case 0:
        tabData.title = "\ud83d\udd0d"
        tabData.content = this.#contentTemplates.children[0].cloneNode(true)
        this.#viewer.appendChild(tabData.content)
        tabData.controller = new MetadataController(tabData.content)
        break
      case 1:
        tabData.title = "Line Graph"
        tabData.content = this.#contentTemplates.children[1].cloneNode(true)
        this.#viewer.appendChild(tabData.content)
        tabData.controller = new LineGraphController(tabData.content)
        break
      case 2:
        tabData.title = "Table"
        tabData.content = this.#contentTemplates.children[2].cloneNode(true)
        this.#viewer.appendChild(tabData.content)
        tabData.controller = new TableController(tabData.content)
        break
      case 3:
        tabData.title = "Odometry"
        tabData.content = this.#contentTemplates.children[3].cloneNode(true)
        this.#viewer.appendChild(tabData.content)
        tabData.controller = new OdometryController(tabData.content)
        break

    }
    this.#tabList.push(tabData)
    this.#selectedTab = this.#tabList.length - 1
    if (!skipUpdate) this.#updateElements()
  }

  // Shifts the currently selected tab left or right
  shiftSelected(shift) {
    if (this.#selectedTab == 0) return // Don't move metadata tab
    var tab = this.#tabList.splice(this.#selectedTab, 1)[0]
    this.#selectedTab += shift
    if (this.#selectedTab < 1) this.#selectedTab = 1 // Stay to the right of metadata tab
    if (this.#selectedTab > this.#tabList.length) this.#selectedTab = this.#tabList.length
    this.#tabList.splice(this.#selectedTab, 0, tab)
    this.#updateElements()
  }

  // Updates all tab elements
  #updateElements() {
    var scrollPos = this.#tabBar.scrollLeft

    // Remove old tabs
    while (this.#tabBar.firstChild) {
      this.#tabBar.removeChild(this.#tabBar.firstChild)
    }

    // Update display titles
    var uniqueTitles = []
    var multipleTitles = {}
    this.#tabList.forEach((tab) => {
      if (uniqueTitles.includes(tab.title)) {
        if (!(tab.title in multipleTitles)) {
          multipleTitles[tab.title] = 0
        }
      } else {
        uniqueTitles.push(tab.title)
      }
    })
    this.#tabList.forEach((tab) => {
      if (tab.title in multipleTitles) {
        multipleTitles[tab.title]++
        tab.displayTitle = tab.title + " #" + multipleTitles[tab.title].toString()
      } else {
        tab.displayTitle = tab.title
      }
    })

    // Create elements
    this.#tabList.forEach((tabItem, index) => {
      var tab = null
      if (index > this.#tabBar.children.length - 1) {
        tab = document.createElement("div")
        this.#tabBar.appendChild(tab)
        tab.classList.add("tab")
      } else {
        tab = this.#tabBar.children[index]
      }
      tab.innerText = tabItem.displayTitle
      tabItem.element = tab
      if (index == this.#selectedTab) {
        tab.classList.add("tab-selected")
        tabItem.content.hidden = false
      } else {
        tab.classList.remove("tab-selected")
        tabItem.content.hidden = true
      }
    })
    this.#tabBar.scrollLeft = scrollPos
    this.updateScrollBounds()
  }

  // Updates the scroll overlay after switching direction or resizing
  updateScrollBounds() {
    var scrollLength = this.#tabBar.scrollWidth - this.#tabBar.clientWidth
    var oldPos = this.#tabBar.scrollLeft
    if (this.#verticalScroll) {
      this.#scrollOverlayContent.style.width = (2 + Math.ceil(this.#scrollOverlay.clientWidth)).toString() + "px"
      this.#scrollOverlay.scrollLeft = 1
      this.#scrollOverlayContent.style.height = (scrollLength + Math.ceil(this.#scrollOverlay.clientHeight)).toString() + "px"
      this.#scrollOverlay.scrollTop = oldPos
    } else {
      this.#scrollOverlayContent.style.height = (2 + Math.ceil(this.#scrollOverlay.clientHeight)).toString() + "px"
      this.#scrollOverlay.scrollTop = 1
      this.#scrollOverlayContent.style.width = (scrollLength + Math.ceil(this.#scrollOverlay.clientWidth)).toString() + "px"
      this.#scrollOverlay.scrollLeft = oldPos
    }
    this.#updateScroll() // Update scroll in case resizing adjusted position
  }

  // Updates scroll position based on overlay
  #updateScroll() {
    var secondaryScroll = this.#verticalScroll ? this.#scrollOverlay.scrollLeft : this.#scrollOverlay.scrollTop
    if (Math.round(secondaryScroll) != 1) {
      this.#verticalScroll = !this.#verticalScroll
      this.updateScrollBounds()
    } else {
      var scrollPos = this.#verticalScroll ? this.#scrollOverlay.scrollTop : this.#scrollOverlay.scrollLeft
      this.#tabBar.scrollLeft = scrollPos
      this.#shadowLeft.style.opacity = Math.floor(scrollPos) == 0 ? 0 : 1
      this.#shadowRight.style.opacity = Math.ceil(scrollPos) == this.#tabBar.scrollWidth - this.#tabBar.clientWidth ? 0 : 1
    }
  }
}