// Controls rendering of odometry graphs
export class OdometryController {
  #content = null
  #dragHighlight = null
  #config = null

  #lastUnitDistance = "meters"

  #inchesPerMeter = 39.37007874015748

  constructor(content) {
    this.#content = content
    this.#dragHighlight = content.getElementsByClassName("odometry-drag-highlight")[0]
    var configBody = content.getElementsByClassName("odometry-config")[0].firstElementChild
    this.#config = {
      fields: {
        rotation: { element: configBody.children[1].firstElementChild, id: null },
        x: { element: configBody.children[2].firstElementChild, id: null },
        y: { element: configBody.children[3].firstElementChild, id: null }
      },
      coordinates: {
        game: configBody.children[1].children[1].lastElementChild,
        unitDistance: configBody.children[2].children[1].children[1],
        unitRotation: configBody.children[2].children[1].children[2],
        origin: configBody.children[3].children[1].lastElementChild
      },
      robot: {
        size: configBody.children[1].lastElementChild.children[1],
        sizeUnit: configBody.children[1].lastElementChild.lastElementChild,
        alliance: configBody.children[2].lastElementChild.lastElementChild,
        orientation: configBody.children[3].lastElementChild.lastElementChild
      }
    }
    this.#config.coordinates.unitDistance.addEventListener("change", () => {
      var newUnit = this.#config.coordinates.unitDistance.value
      if (newUnit != this.#lastUnitDistance) {
        var oldSize = this.#config.robot.size.value
        if (newUnit == "meters") {
          this.#config.robot.size.value = Math.round((oldSize / this.#inchesPerMeter) * 1000) / 1000
          this.#config.robot.size.step = 0.01
        } else {
          this.#config.robot.size.value = Math.round((oldSize * this.#inchesPerMeter) * 100) / 100
          this.#config.robot.size.step = 1
        }
        this.#config.robot.sizeUnit.innerText = newUnit
        this.#lastUnitDistance = newUnit
      }
    })

    // Manage dragging
    window.addEventListener("drag-update", event => this.#handleDrag(event))
    window.addEventListener("drag-stop", event => this.#handleDrag(event))
  }

  // Handles dragging events (moving and stopping)
  #handleDrag(event) {
    if (this.#content.hidden) return

    this.#dragHighlight.hidden = true
    Object.values(this.#config.fields).forEach(field => {
      var rect = field.element.getBoundingClientRect()
      var active = event.detail.x > rect.left && event.detail.x < rect.right && event.detail.y > rect.top && event.detail.y < rect.bottom

      if (active) {
        if (event.type == "drag-update") {
          var contentRect = this.#content.getBoundingClientRect()
          this.#dragHighlight.style.left = (rect.left - contentRect.left).toString() + "px"
          this.#dragHighlight.style.top = (rect.top - contentRect.top).toString() + "px"
          this.#dragHighlight.style.width = rect.width.toString() + "px"
          this.#dragHighlight.style.height = rect.height.toString() + "px"
          this.#dragHighlight.hidden = false
        } else {
          field.id = event.detail.data.id
          field.element.lastElementChild.innerText = log.getFieldInfo(field.id).displayKey
        }
      }
    })
  }

  // Called by tab controller when log changes
  reset() { }

  // Called by tab controller when side bar size changes
  sideBarResize() { }

  // Called every 15ms by the tab controller
  periodic() { }
}