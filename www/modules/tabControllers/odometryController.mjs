import { GameConstants } from "../../../games/games.mjs"
import { OdometryRenderer } from "../odometryRenderer.mjs"

// Controls rendering of odometry config
export class OdometryController {
  #content = null
  #timelineInput = null
  #timelineMarkerContainer = null
  #canvas = null
  #dragHighlight = null
  #configTable = null
  #config = null

  #tabIdentifier = Math.random().toString(36).slice(2)
  #lastUnitDistance = "meters"
  #renderer = null
  #inchesPerMeter = 39.37007874015748
  #trailLengthSecs = 5

  constructor(content) {
    this.#content = content
    this.#dragHighlight = content.getElementsByClassName("odometry-drag-highlight")[0]
    this.#timelineInput = content.getElementsByClassName("odometry-timeline-slider")[0]
    this.#timelineMarkerContainer = content.getElementsByClassName("odometry-timeline-marker-container")[0]
    this.#canvas = content.getElementsByClassName("odometry-canvas")[0]
    this.#configTable = content.getElementsByClassName("odometry-config")[0]
    this.#renderer = new OdometryRenderer(this.#canvas, true)

    this.#timelineInput.addEventListener("input", () => {
      window.selection.selectedTime = Number(this.#timelineInput.value)
    })
    content.getElementsByClassName("odometry-popup-button")[0].addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("create-odometry-popup", {
        detail: this.#tabIdentifier
      }))
    })
    var configBody = content.getElementsByClassName("odometry-config")[0].firstElementChild
    this.#config = {
      fields: {
        rotation: { element: configBody.children[1].firstElementChild, id: null, missingKey: null },
        x: { element: configBody.children[2].firstElementChild, id: null, missingKey: null },
        y: { element: configBody.children[3].firstElementChild, id: null, missingKey: null }
      },
      coordinates: {
        game: configBody.children[1].children[1].children[1],
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
    GameConstants.forEach(game => {
      var option = document.createElement("option")
      option.innerText = game.title
      this.#config.coordinates.game.appendChild(option)
    })
    configBody.children[1].children[1].children[2].addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("open-link", {
        detail: GameConstants.find(x => x.title == this.#config.coordinates.game.value).source
      }))
    })

    // Manage dragging
    window.addEventListener("drag-update", event => this.#handleDrag(event))
    window.addEventListener("drag-stop", event => this.#handleDrag(event))

    // Start periodic cycle and reset (in case log is already loaded)
    window.setInterval(() => this.customPeriodic(), 15)
    this.state = this.state
  }

  // Standard function: retrieves current state
  get state() {
    function processField(field) {
      if (field.id == null) {
        return field.missingKey
      } else {
        return log.getFieldInfo(field.id).displayKey
      }
    }
    return {
      fields: {
        rotation: processField(this.#config.fields.rotation),
        x: processField(this.#config.fields.x),
        y: processField(this.#config.fields.y)
      },
      coordinates: {
        game: this.#config.coordinates.game.value,
        unitDistance: this.#config.coordinates.unitDistance.value,
        unitRotation: this.#config.coordinates.unitRotation.value,
        origin: this.#config.coordinates.origin.value
      },
      robot: {
        size: Number(this.#config.robot.size.value),
        alliance: this.#config.robot.alliance.value,
        orientation: this.#config.robot.orientation.value
      }
    }
  }

  // Render timeline sections
  #renderTimeline() {
    while (this.#timelineMarkerContainer.firstChild) {
      this.#timelineMarkerContainer.removeChild(this.#timelineMarkerContainer.firstChild)
    }
    if (log) {
      var minTime = log.getTimestamps()[0]
      var maxTime = selection.isLocked() ? selection.selectedTime : log.getTimestamps()[log.getTimestamps().length - 1]
      this.#timelineInput.min = minTime
      this.#timelineInput.max = maxTime
      var data = log.getDataInRange(log.findField("/DriverStation/Enabled", "Boolean"), -Infinity, Infinity)
      for (let i = 0; i < data.values.length; i++) {
        if (data.values[i]) {
          var div = document.createElement("div")
          this.#timelineMarkerContainer.appendChild(div)
          var leftPercent = ((data.timestamps[i] - minTime) / (maxTime - minTime)) * 100
          var nextTime = i == data.values.length - 1 ? maxTime : data.timestamps[i + 1]
          var widthPercent = ((nextTime - data.timestamps[i]) / (maxTime - minTime)) * 100
          div.style.left = leftPercent.toString() + "%"
          div.style.width = widthPercent.toString() + "%"
        }
      }
    } else {
      this.#timelineInput.min = 0
      this.#timelineInput.max = 10
    }
  }

  // Standard function: restores state where possible
  set state(newState) {
    // Adjust timeline
    this.#renderTimeline()

    // Set config data
    this.#config.coordinates.game.value = newState.coordinates.game
    this.#config.coordinates.unitDistance.value = newState.coordinates.unitDistance
    this.#config.coordinates.unitRotation.value = newState.coordinates.unitRotation
    this.#config.coordinates.origin.value = newState.coordinates.origin
    this.#config.robot.size.value = newState.robot.size
    this.#config.robot.alliance.value = newState.robot.alliance
    this.#config.robot.orientation.value = newState.robot.orientation

    // Reset fields
    Object.keys(this.#config.fields).forEach(fieldKey => {
      var text = ""
      var missing = false
      if (newState.fields[fieldKey] == null) { // Field is empty
        text = "<Drag Here>"
        this.#config.fields[fieldKey].id = null
        this.#config.fields[fieldKey].missingKey = null
      } else {
        var id = log == null ? -1 : log.findFieldDisplay(newState.fields[fieldKey])
        if (id == -1) { // Missing field
          text = newState.fields[fieldKey]
          missing = true
          this.#config.fields[fieldKey].id = null
          this.#config.fields[fieldKey].missingKey = newState.fields[fieldKey]
        } else { // Valid field
          text = log.getFieldInfo(id).displayKey
          this.#config.fields[fieldKey].id = id
          this.#config.fields[fieldKey].missingKey = null
        }
      }
      this.#config.fields[fieldKey].element.lastElementChild.innerText = text
      this.#config.fields[fieldKey].element.lastElementChild.style.textDecoration = missing ? "line-through" : ""
    })
  }

  // Standard function: updates based on new live data
  updateLive() {
    this.#renderTimeline()
    if (selection.isLocked()) this.#timelineInput.value = this.#timelineInput.max
  }

  // Handles dragging events (moving and stopping)
  #handleDrag(event) {
    if (this.#content.hidden) return

    this.#dragHighlight.hidden = true
    Object.values(this.#config.fields).forEach(field => {
      var rect = field.element.getBoundingClientRect()
      var active = event.detail.x > rect.left && event.detail.x < rect.right && event.detail.y > rect.top && event.detail.y < rect.bottom
      var type = log.getFieldInfo(event.detail.data.id).type
      var validType = type == "Double" || type == "Integer" || type == "Byte"

      if (active && validType) {
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
          field.element.lastElementChild.style.textDecoration = ""
        }
      }
    })
  }

  // Called by tab controller when side bar size changes
  sideBarResize() { }

  // Called every 15ms by the tab controller
  periodic() { }

  // Called every 15ms (regardless of the visible tab)
  customPeriodic() {
    if (selection.isPlaying() || selection.isLocked()) {
      var time = selection.selectedTime
    } else {
      var time = selection.hoveredTime ? selection.hoveredTime : selection.selectedTime
    }
    if (time == null) time = 0

    // Update timeline
    this.#timelineInput.value = time

    // Update canvas height
    this.#canvas.style.setProperty("--bottom-margin", this.#configTable.getBoundingClientRect().height.toString() + "px")

    // Get rotation data from log
    if (this.#config.fields.rotation.id != null) {
      var currentRotation = log.getDataInRange(this.#config.fields.rotation.id, time, time).values[0]
    } else {
      var currentRotation = 0
    }

    // Get position data from log
    var currentPosition = []
    var positionData = {}
    Array("x", "y").forEach(fieldName => {
      if (this.#config.fields[fieldName].id == null) {
        positionData[fieldName] = {
          timestamps: [],
          values: []
        }
        currentPosition.push(0)
      } else {
        var fieldData = log.getDataInRange(this.#config.fields[fieldName].id, time - this.#trailLengthSecs, time + this.#trailLengthSecs)
        positionData[fieldName] = fieldData
        var nextIndex = fieldData.timestamps.findIndex(x => x > time)
        if (nextIndex == -1) nextIndex = fieldData.timestamps.length // Current time is past the end of the data
        if (nextIndex == 0) nextIndex = 1 // Current time is before the start of the data
        var currentValue = fieldData.values[nextIndex - 1]
        currentPosition.push(currentValue)
      }
    })
    var allTimestamps = [...new Set([...positionData.x.timestamps, ...positionData.y.timestamps])]
    if (allTimestamps[allTimestamps.length - 1] - time > this.#trailLengthSecs) allTimestamps.pop()
    var trailData = []
    allTimestamps.forEach(timestamp => {
      var point = []
      Array("x", "y").forEach(fieldName => {
        if (positionData[fieldName].timestamps.length > 0) {
          var nextIndex = positionData[fieldName].timestamps.findIndex(x => x > timestamp)
          if (nextIndex == -1) nextIndex = positionData[fieldName].timestamps.length
          if (nextIndex == 0) nextIndex = 1
          point.push(positionData[fieldName].values[nextIndex - 1])
        } else {
          point.push(0)
        }
      })
      trailData.push(point)
    })

    // Package command data
    var commandData = {
      pose: {
        rotation: currentRotation,
        position: currentPosition,
        trail: trailData
      },
      coordinates: {
        game: this.#config.coordinates.game.value,
        unitDistance: this.#config.coordinates.unitDistance.value,
        unitRotation: this.#config.coordinates.unitRotation.value,
        origin: this.#config.coordinates.origin.value,
      },
      robot: {
        size: Number(this.#config.robot.size.value),
        alliance: this.#config.robot.alliance.value,
        orientation: this.#config.robot.orientation.value
      }
    }
    if (!this.#content.hidden) this.#renderer.render(commandData)
    window.dispatchEvent(new CustomEvent("update-odometry-popup", {
      detail: {
        id: this.#tabIdentifier,
        command: commandData
      }
    }))
  }
}