// Manages the tab bar
export class Tabs {
  #tabBar = document.getElementsByClassName("tab-bar")[0]
  #shadowLeft = document.getElementsByClassName("tab-bar-shadow-left")[0]
  #shadowRight = document.getElementsByClassName("tab-bar-shadow-right")[0]
  #scrollOverlay = document.getElementsByClassName("tab-bar-scroll")[0]
  #scrollOverlayContent = document.getElementsByClassName("tab-bar-scroll-content")[0]

  #leftButton = document.getElementsByClassName("move-left")[0]
  #rightButton = document.getElementsByClassName("move-right")[0]
  #addButton = document.getElementsByClassName("add-tab")[0]

  #verticalScroll = true

  constructor() {
    this.updateScrollBounds()
    window.addEventListener("resize", () => this.updateScrollBounds())
    this.#scrollOverlay.addEventListener("scroll", () => this.updateScroll())
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
    this.updateScroll() // Update scroll in case resizing adjusted position
  }

  // Updates scroll position based on overlay
  updateScroll() {
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