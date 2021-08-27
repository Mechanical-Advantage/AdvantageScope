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
    this.#addButton.addEventListener("click", () => window.dispatchEvent(new Event("add-tab")))
    window.addEventListener("add-tab-response", (event) => {
      this.addTab(event.detail)
    })
    this.addTab(0)

    // Periodic function
    window.setInterval(() => {
      this.#tabList[this.#selectedTab].controller.periodic()
    }, 15)
  }

  // Resets all tabs to their default states
  reset() {
    this.#tabList.forEach((tab) => {
      tab.controller.reset()
    })
  }

  // Resets all tabs to their default states
  sideBarResize() {
    this.#tabList.forEach((tab) => {
      tab.controller.sideBarResize()
    })
  }

  // Adds a new tab to the list
  addTab(type) {
    var tabData = {}
    switch (type) {
      case 0:
        tabData.title = "Line Graph"
        tabData.content = this.#contentTemplates.children[0].cloneNode(true)
        this.#viewer.appendChild(tabData.content)
        tabData.controller = new LineGraphController(tabData.content)
        break
      case 1:
        tabData.title = "Table"
        tabData.content = this.#contentTemplates.children[1].cloneNode(true)
        this.#viewer.appendChild(tabData.content)
        tabData.controller = new TableController(tabData.content)
        break
      case 2:
        tabData.title = "Odometry"
        tabData.content = this.#contentTemplates.children[2].cloneNode(true)
        this.#viewer.appendChild(tabData.content)
        tabData.controller = new OdometryController(tabData.content)
        break

    }
    this.#tabList.push(tabData)
    this.#selectedTab = this.#tabList.length - 1
    this.#updateElements()
  }

  // Shifts the currently selected tab left or right
  shiftSelected(shift) {
    var tab = this.#tabList.splice(this.#selectedTab, 1)[0]
    this.#selectedTab += shift
    if (this.#selectedTab < 0) this.#selectedTab = 0
    if (this.#selectedTab > this.#tabList.length) this.#selectedTab = this.#tabList.length
    this.#tabList.splice(this.#selectedTab, 0, tab)
    this.#updateElements()
  }

  // Updates all tab elements
  #updateElements() {
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
    var scrollPos = this.#tabBar.scrollLeft
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
      this.#scrollOverlayContent.style.width = (2 + this.#scrollOverlay.clientWidth).toString() + "px"
      this.#scrollOverlay.scrollLeft = 1
      this.#scrollOverlayContent.style.height = (scrollLength + this.#scrollOverlay.clientHeight).toString() + "px"
      this.#scrollOverlay.scrollTop = oldPos
    } else {
      this.#scrollOverlayContent.style.height = (2 + this.#scrollOverlay.clientHeight).toString() + "px"
      this.#scrollOverlay.scrollTop = 1
      this.#scrollOverlayContent.style.width = (scrollLength + this.#scrollOverlay.clientWidth).toString() + "px"
      this.#scrollOverlay.scrollLeft = oldPos
    }
    this.#updateScroll() // Update scroll in case resizing adjusted position
  }

  // Updates scroll position based on overlay
  #updateScroll() {
    var secondaryScroll = this.#verticalScroll ? this.#scrollOverlay.scrollLeft : this.#scrollOverlay.scrollTop
    if (secondaryScroll != 1) {
      this.#verticalScroll = !this.#verticalScroll
      this.updateScrollBounds()
    } else {
      var scrollPos = this.#verticalScroll ? this.#scrollOverlay.scrollTop : this.#scrollOverlay.scrollLeft
      this.#tabBar.scrollLeft = scrollPos
      this.#shadowLeft.style.opacity = scrollPos == 0 ? 0 : 1
      this.#shadowRight.style.opacity = scrollPos == this.#tabBar.scrollWidth - this.#tabBar.clientWidth ? 0 : 1
    }
  }

  // Updates button shade based on window focus
  setFocused(focused) {
    if (focused) {
      this.#leftButton.firstElementChild.classList.remove("blurred")
      this.#rightButton.firstElementChild.classList.remove("blurred")
      this.#addButton.firstElementChild.classList.remove("blurred")
    } else {
      this.#leftButton.firstElementChild.classList.add("blurred")
      this.#rightButton.firstElementChild.classList.add("blurred")
      this.#addButton.firstElementChild.classList.add("blurred")
    }
  }
}