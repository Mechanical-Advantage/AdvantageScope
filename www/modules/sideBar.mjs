// Controls the side bar and field list
export class SideBar {
  #sideBar = document.getElementsByClassName("side-bar")[0]
  #sideBarHandle = document.getElementsByClassName("side-bar-handle")[0]
  #sideBarShadow = document.getElementsByClassName("side-bar-shadow")[0]
  #sideBarTitle = document.getElementsByClassName("side-bar-title")[0]
  #fieldList = document.getElementById("fieldList")

  #sideBarHandleActive = false

  constructor() {
    // Set up handle for resizing
    this.#sideBarHandle.addEventListener("mousedown", (_) => this.#sideBarHandleActive = true)
    window.addEventListener("mouseup", (_) => this.#sideBarHandleActive = false)
    window.addEventListener("mousemove", (event) => {
      if (this.#sideBarHandleActive) {
        var width = event.clientX
        if (width < 130) width = 130
        if (width > 500) width = 500
        document.documentElement.style.setProperty("--side-bar-width", width.toString() + "px")
      }
    })

    // Set up shadow when scrolling
    this.#sideBar.addEventListener("scroll", (event) => {
      this.#sideBarShadow.style.opacity = this.#sideBar.scrollTop == 0 ? 0 : 1
    })
  }

  // Update the list of fields
  update() {
    // Remove old list
    while (this.#fieldList.firstChild) {
      this.#fieldList.removeChild(this.#fieldList.firstChild)
    }

    // Update title
    var runtime = log.getTimestamps()[log.getTimestamps().length - 1]
    var runtimeUnit = "s"
    if (runtime > 120) {
      runtime /= 60
      runtimeUnit = "m"
    }
    if (runtime > 120) {
      runtime /= 60
      runtimeUnit = "h"
    }
    this.#sideBarTitle.innerText = log.getFieldCount().toString() + " field" + (log.getFieldCount() == 0 ? "" : "s") + ", " + Math.round(runtime).toString() + runtimeUnit + " runtime"

    // Add fields
    function addField(parentElement, title, field, indent) {
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
      label.innerText = title
      label.style.fontStyle = field.field == null ? "normal" : "italic"
      label.style.cursor = field.field == null ? "auto" : "grab"

      if (hasChildren) {
        var childSpan = document.createElement("span")
        parentElement.appendChild(childSpan)
        childSpan.style.setProperty("--indent", (indent + 20).toString() + "px")
        childSpan.hidden = true

        function toggle() {
          childSpan.hidden = !childSpan.hidden
          closedIcon.style.display = childSpan.hidden ? "initial" : "none"
          openIcon.style.display = childSpan.hidden ? "none" : "initial"
        }
        closedIcon.addEventListener("click", toggle)
        openIcon.addEventListener("click", toggle)

        var keys = Object.keys(field.children).sort()
        for (let i in keys) {
          addField(childSpan, keys[i], field.children[keys[i]], indent + 20)
        }
      }
    }

    var tree = log.getFieldTree()
    var keys = Object.keys(tree).sort()
    for (let i in keys) {
      addField(this.#fieldList, keys[i], tree[keys[i]], 0)
    }
  }
}