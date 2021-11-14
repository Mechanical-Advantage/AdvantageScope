import { Log } from "../log.mjs"

// Controls rendering of line graphs
export class LineGraphController {
  #content = null
  #legendItemTemplate = null
  #canvasContainer = null
  #canvas = null
  #scrollOverlay = null
  #scrollOverlayContent = null

  #colors = ["#EBC542", "#80588E", "#E48B32", "#AACAEE", "#AF2437", "#C0B487", "#858584", "#3B875A", "#D993AA", "#2B66A2", "#EB987E", "#5D4F92", "#EBAA3B", "#A64B6B", "#DBD345", "#7E331F", "#96B637", "#5F4528", "#D36134", "#2E3B28"]

  #zoomScalar = 0.01
  #minZoomTime = 0.1
  #zoomExponentBaseDarwin = 1.001
  #zoomExponentBaseOther = 1.1

  #firstReset = true
  #lastCursorX = null
  #lastScrollTop = 0
  #lastClientWidth = 0
  #lastPlatform = null
  #resetOnNextUpdate = false
  #panActive = false
  #panStartCursorX = 0
  #panStartScrollLeft = 0
  #xRange = [0, 10]
  #maxScrollVert = true
  #maxScrollHorz = true

  #legends = {
    left: {
      fields: [],
      element: null,
      dragTarget: null,
      types: ["Integer", "Double", "Byte"],
      arrayTypes: ["IntegerArray", "DoubleArray", "ByteArray"],
      locked: false,
      range: [],
      editTimestamp: 0.0
    },
    discrete: {
      fields: [],
      element: null,
      dragTarget: null,
      types: ["Boolean", "BooleanArray", "Integer", "IntegerArray", "Double", "DoubleArray", "String", "StringArray", "Byte", "ByteArray"],
      arrayTypes: []
    },
    right: {
      fields: [],
      element: null,
      dragTarget: null,
      types: ["Integer", "Double", "Byte"],
      arrayTypes: ["IntegerArray", "DoubleArray", "ByteArray"],
      locked: false,
      range: [],
      editTimestamp: 0.0
    }
  }

  constructor(content) {
    // Set up elements
    this.#content = content
    this.#legendItemTemplate = content.getElementsByClassName("legend-item-template")[0].firstElementChild
    this.#canvasContainer = content.getElementsByClassName("line-graph-canvas-container")[0]
    this.#canvas = content.getElementsByClassName("line-graph-canvas")[0]
    this.#scrollOverlay = content.getElementsByClassName("line-graph-scroll")[0]
    this.#scrollOverlayContent = content.getElementsByClassName("line-graph-scroll-content")[0]

    this.#legends.left.element = content.getElementsByClassName("legend-left")[0]
    this.#legends.discrete.element = content.getElementsByClassName("legend-discrete")[0]
    this.#legends.right.element = content.getElementsByClassName("legend-right")[0]
    this.#legends.left.dragTarget = content.getElementsByClassName("legend-left")[1]
    this.#legends.discrete.dragTarget = content.getElementsByClassName("legend-discrete")[1]
    this.#legends.right.dragTarget = content.getElementsByClassName("legend-right")[1]

    // Edit axis menus
    this.#legends.left.element.firstElementChild.lastElementChild.addEventListener("click", () => {
      this.#legends.left.editTimestamp = new Date().getTime()
      window.dispatchEvent(new CustomEvent("edit-axis", {
        detail: {
          timestamp: this.#legends.left.editTimestamp,
          locked: this.#legends.left.locked,
          range: this.#legends.left.range
        }
      }))
    })
    this.#legends.right.element.firstElementChild.lastElementChild.addEventListener("click", () => {
      this.#legends.right.editTimestamp = new Date().getTime()
      window.dispatchEvent(new CustomEvent("edit-axis", {
        detail: {
          timestamp: this.#legends.right.editTimestamp,
          locked: this.#legends.right.locked,
          range: this.#legends.right.range
        }
      }))
    })
    window.addEventListener("edit-axis-response", (event) => {
      if (event.detail.timestamp == this.#legends.left.editTimestamp) {
        var legend = this.#legends.left
      } else if (event.detail.timestamp == this.#legends.right.editTimestamp) {
        var legend = this.#legends.right
      } else {
        return // Response for a different tab
      }

      switch (event.detail.command) {
        case "toggle-lock":
          legend.locked = !legend.locked
          legend.element.firstElementChild.firstElementChild.lastElementChild.hidden = !legend.locked
          break
        case "set-range":
          legend.range = event.detail.value
          break
      }
    })

    // Bind events
    window.addEventListener("drag-update", event => this.#handleDrag(event))
    window.addEventListener("drag-stop", event => this.#handleDrag(event))
    window.addEventListener("resize", () => this.#updateScroll())
    this.#scrollOverlay.addEventListener("scroll", () => this.#updateScroll())
    this.#scrollOverlay.addEventListener("mousemove", event => {
      this.#lastCursorX = event.layerX
      if (this.#panActive) {
        this.#scrollOverlay.scrollLeft = this.#panStartScrollLeft + (this.#panStartCursorX - event.layerX)
        this.#updateScroll()
      }
    })
    this.#scrollOverlay.addEventListener("mouseleave", () => {
      this.#panActive = false
      this.#lastCursorX = null
    })
    this.#scrollOverlay.addEventListener("mousedown", event => {
      this.#panActive = true
      this.#panStartCursorX = event.layerX
      this.#panStartScrollLeft = this.#scrollOverlay.scrollLeft
    })
    this.#scrollOverlay.addEventListener("mouseup", () => this.#panActive = false)
    this.#scrollOverlay.addEventListener("click", event => {
      if (Math.abs(event.layerX - this.#panStartCursorX) <= 5) {
        window.selection.selectedTime = window.selection.hoveredTime
      }
    })
    this.#scrollOverlay.addEventListener("contextmenu", () => window.selection.selectedTime = null)

    this.#updateScroll(true)
  }

  // Standard function: retrieves current state
  get state() {
    var processFields = x => {
      if (x.id == null) {
        return {
          displayKey: x.missingKey,
          color: x.color,
          show: x.show
        }
      } else {
        return {
          displayKey: log.getFieldInfo(x.id).displayKey,
          color: x.color,
          show: x.show
        }
      }
    }
    return {
      range: this.#xRange,
      legends: {
        left: {
          fields: this.#legends.left.fields.map(processFields),
          locked: this.#legends.left.locked,
          range: this.#legends.left.range,
          scroll: this.#legends.left.element.scrollTop
        },
        discrete: {
          fields: this.#legends.discrete.fields.map(processFields),
          scroll: this.#legends.discrete.element.scrollTop
        },
        right: {
          fields: this.#legends.right.fields.map(processFields),
          locked: this.#legends.right.locked,
          range: this.#legends.right.range,
          scroll: this.#legends.right.element.scrollTop
        }
      }
    }
  }

  // Standard function: restores state where possible
  set state(newState) {
    Object.keys(this.#legends).forEach(legendKey => {
      var legend = this.#legends[legendKey]

      // Update locked status & range
      legend.locked = newState.legends[legendKey].locked
      legend.range = newState.legends[legendKey].range

      // Remove all fields
      legend.fields = []
      while (legend.element.children.length > 1) {
        legend.element.removeChild(legend.element.lastChild)
      }

      // Add new fields
      newState.legends[legendKey].fields.forEach(field => {
        if (log != null) {
          var id = log.findFieldDisplay(field.displayKey)
          if (id != -1) {
            this.addField(legendKey, id, field.color, field.show)
            return
          }
        }

        // Field not available, insert filler
        this.addField(legendKey, null, field.color, field.show, field.displayKey)
      })

      // Update scroll
      legend.element.scrollTop = newState.legends[legendKey].scroll
    })

    // Update zoom and pan
    if (log == null) return
    if (this.#firstReset) {
      this.#updateScroll(true)
      this.#firstReset = false
    } else {
      this.#updateScroll() // Updates limits
      this.#scrollOverlay.scrollTop = this.#calcReverseZoom(newState.range[1] - newState.range[0]) // Update zoom
      this.#scrollOverlay.scrollLeft = Math.round(((newState.range[0] - log.getTimestamps()[0]) / this.#calcZoom()) * this.#scrollOverlay.clientWidth) // Update pan}
    }
  }

  // Handles dragging events (moving and stopping)
  #handleDrag(event) {
    if (this.#content.hidden) return
    Object.keys(this.#legends).forEach(key => {
      var legend = this.#legends[key]
      var rect = legend.element.getBoundingClientRect()
      var active = event.detail.x > rect.left && event.detail.x < rect.right && event.detail.y > rect.top && event.detail.y < rect.bottom
      var type = log.getFieldInfo(event.detail.data.id).type
      var validType = (legend.types.includes(type) || legend.arrayTypes.includes(type))

      if (event.type == "drag-update") {
        legend.dragTarget.hidden = !(active && validType)
      } else {
        legend.dragTarget.hidden = true
        if (active && validType) {
          if (legend.types.includes(type)) {
            this.addField(key, event.detail.data.id)
          } else { // Array, so add all children
            event.detail.data.children.forEach(id => {
              this.addField(key, id)
            })
          }
        }
      }
    })
  }

  // Adds a new field to the specified legend
  addField(legend, field, forcedColor, forcedShow, missingKey) {
    // Get color
    if (forcedColor) {
      var color = forcedColor
    } else {
      var usedColors = []
      Object.keys(this.#legends).forEach((key) => {
        this.#legends[key].fields.forEach((x) => {
          usedColors.push(x.color)
        })
      })
      var availableColors = this.#colors.filter((color) => !usedColors.includes(color))
      if (availableColors.length == 0) {
        var color = this.#colors[Math.floor(Math.random() * this.#colors.length)]
      } else {
        var color = availableColors[0]
      }
    }

    // Determine if showing
    if (forcedShow == null) {
      var show = true
    } else {
      var show = forcedShow
    }

    // Create element
    var item = this.#legendItemTemplate.cloneNode(true)
    if (field != null) {
      var text = log.getFieldInfo(field).displayKey
    } else {
      var text = missingKey
    }
    item.title = text
    item.getElementsByClassName("legend-key")[0].innerText = text
    if (field == null) item.getElementsByClassName("legend-key")[0].style.textDecoration = "line-through"
    item.getElementsByClassName("legend-splotch")[0].style.fill = color
    if (field != null) {
      item.getElementsByClassName("legend-splotch")[0].addEventListener("click", () => {
        var index = Array.from(item.parentElement.children).indexOf(item) - 1
        var show = !this.#legends[legend].fields[index].show
        this.#legends[legend].fields[index].show = show
        item.firstElementChild.style.fill = show ? color : "transparent"
      })
    }
    item.getElementsByClassName("legend-splotch")[0].style.fill = show && (field != null) ? color : "transparent"
    item.getElementsByClassName("legend-edit")[0].title = ""
    item.getElementsByClassName("legend-edit")[0].addEventListener("click", () => {
      var index = Array.from(item.parentElement.children).indexOf(item) - 1
      item.parentElement.removeChild(item)
      this.#legends[legend].fields.splice(index, 1)
    })

    // Add field
    this.#legends[legend].fields.push({
      id: field,
      missingKey: missingKey,
      color: color,
      show: show
    })
    this.#legends[legend].element.appendChild(item)
  }

  // Standard function: updates based on new live data
  updateLive() {
    this.#updateScroll(this.#maxScrollVert)
  }

  // Called by tab controller when side bar size changes
  sideBarResize() {
    this.#updateScroll()
  }

  // Returns the current zoom level based on scroll position
  #calcZoom() {
    return ((platform == "darwin" ? this.#zoomExponentBaseDarwin : this.#zoomExponentBaseOther) ** this.#scrollOverlay.scrollTop) * this.#zoomScalar
  }

  // Returns the necessary scroll position for the specified zoom level
  #calcReverseZoom(zoomTarget) {
    return Math.log(zoomTarget / this.#zoomScalar) / Math.log(platform == "darwin" ? this.#zoomExponentBaseDarwin : this.#zoomExponentBaseOther)
  }

  // Updates scroll position based on overlay
  #updateScroll(reset) {
    // Exit if not visible (cannot get element sizes)
    if (this.#content.hidden) {
      if (reset) this.#resetOnNextUpdate = true
      return
    }

    // Find current time range
    if (log == null) {
      var timeRange = [0, 10]
    } else if (selection.locked) {
      var timeRange = [log.getTimestamps()[0], selection.selectedTime]
    } else {
      var timeRange = [log.getTimestamps()[0], log.getTimestamps()[log.getTimestamps().length - 1]]
    }

    // Calculate maximum scroll lengths
    var scrollLengthVertical = this.#calcReverseZoom(timeRange[1] - timeRange[0]) // Calc maximum zoom based on time range
    var scrollLengthHorizontal = this.#scrollOverlay.clientWidth * ((timeRange[1] - timeRange[0]) / this.#calcZoom()) // Calc horizontal length based on zoom

    // Adjust content size and enforce limits
    this.#scrollOverlayContent.style.height = (scrollLengthVertical + this.#scrollOverlay.clientHeight).toString() + "px"
    this.#scrollOverlayContent.style.width = scrollLengthHorizontal.toString() + "px"
    if (reset || platform != this.#lastPlatform) {
      this.#lastPlatform = platform
      this.#scrollOverlay.scrollTop = scrollLengthVertical
      this.#scrollOverlay.scrollLeft = 0
    } else {
      var minZoom = this.#calcReverseZoom(this.#minZoomTime)
      if (this.#scrollOverlay.scrollTop < minZoom) this.#scrollOverlay.scrollTop = minZoom
      if (this.#scrollOverlay.scrollLeft < 0) this.#scrollOverlay.scrollLeft = 0
      if (this.#scrollOverlay.scrollTop > scrollLengthVertical) this.#scrollOverlay.scrollTop = scrollLengthVertical
      if (this.#scrollOverlay.scrollLeft > scrollLengthHorizontal) this.#scrollOverlay.scrollLeft = scrollLengthHorizontal
    }

    // Lock minX when resizing, since changing client width would otherwise affect pan
    if (this.#scrollOverlay.clientWidth != this.#lastClientWidth) {
      this.#lastClientWidth = this.#scrollOverlay.clientWidth
      this.#scrollOverlay.scrollLeft = Math.round(((this.#xRange[0] - timeRange[0]) / this.#calcZoom()) * this.#scrollOverlay.clientWidth)
    }

    // Manage zoom
    if (this.#scrollOverlay.scrollTop != this.#lastScrollTop) {
      var cursorX = this.#lastCursorX == null ? this.#scrollOverlay.clientWidth * 0.5 : this.#lastCursorX
      var cursorTime = ((cursorX / this.#scrollOverlay.clientWidth) * (this.#xRange[1] - this.#xRange[0])) + this.#xRange[0] // Time represented by cursor before scroll
      var minX = cursorTime - ((cursorX / this.#scrollOverlay.clientWidth) * this.#calcZoom()) // New min X to keep cursor at same time
      this.#scrollOverlay.scrollLeft = Math.round(((minX - timeRange[0]) / this.#calcZoom()) * this.#scrollOverlay.clientWidth)
    }

    // Locked horzontal scroll
    if (selection.locked && !(reset || platform != this.#lastPlatform)) {
      this.#scrollOverlay.scrollLeft = scrollLengthHorizontal
    }

    // Update x range
    var minX = ((this.#scrollOverlay.scrollLeft / this.#scrollOverlay.clientWidth) * this.#calcZoom()) + timeRange[0]
    this.#xRange = [minX, minX + this.#calcZoom()]
    this.#lastScrollTop = this.#scrollOverlay.scrollTop

    // Check if at limits
    this.#maxScrollVert = Math.ceil(this.#scrollOverlay.scrollTop) == Math.floor(scrollLengthVertical)
    this.#maxScrollHorz = Math.ceil(this.#scrollOverlay.scrollLeft) == Math.floor(scrollLengthHorizontal)
  }

  // Cleans up floating point errors
  #cleanFloat(float) {
    var output = Math.round(float * 10000) / 10000
    if (output == -0) output = 0
    return output
  }

  // Calculates appropriate bounds and steps based on data
  #calcAutoAxis(heightPx, targetStepPx, valueRange, marginProportion, customUnit, primaryAxis, lockedRange) {
    // Calc target range
    if (lockedRange == null) {
      var margin = (valueRange[1] - valueRange[0]) * marginProportion
      var targetRange = [valueRange[0] - margin, valueRange[1] + margin]
      if (targetRange[0] == targetRange[1]) {
        targetRange[0] -= 1
        targetRange[1] += 1
      }
    } else {
      var targetRange = lockedRange
    }

    // How many steps?
    if (primaryAxis == null) {
      var stepCount = heightPx / targetStepPx
    } else {
      var stepCount = (primaryAxis.max - primaryAxis.min) / primaryAxis.step
    }
    var stepValueApprox = (targetRange[1] - targetRange[0]) / stepCount


    // Clean up step size
    var useCustomUnit = customUnit != null && stepValueApprox > customUnit
    if (useCustomUnit) {
      var roundBase = customUnit * 10 ** Math.floor(Math.log10(stepValueApprox / customUnit))
    } else {
      var roundBase = 10 ** Math.floor(Math.log10(stepValueApprox))
    }
    if (primaryAxis == null) {
      var multiplierLookup = [0, 1, 2, 2, 5, 5, 5, 5, 5, 10, 10]
    } else {
      var multiplierLookup = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    }
    var stepValue = roundBase * multiplierLookup[Math.round(stepValueApprox / roundBase)]

    // Adjust to match primary gridlines
    if (primaryAxis == null) {
      return {
        min: targetRange[0],
        max: targetRange[1],
        step: stepValue,
        customUnit: useCustomUnit
      }
    } else {
      var midPrimary = (primaryAxis.min + primaryAxis.max) / 2
      var midSecondary = (targetRange[0] + targetRange[1]) / 2
      var midStepPrimary = Math.ceil(this.#cleanFloat(midPrimary / primaryAxis.step)) * primaryAxis.step
      var midStepSecondary = Math.ceil(this.#cleanFloat(midSecondary / stepValue)) * stepValue

      var newMin = (((primaryAxis.min - midStepPrimary) / primaryAxis.step) * stepValue) + midStepSecondary
      var newMax = (((primaryAxis.max - midStepPrimary) / primaryAxis.step) * stepValue) + midStepSecondary
      return {
        min: newMin,
        max: newMax,
        step: stepValue,
        customUnit: useCustomUnit
      }
    }
  }

  // Adjusts color brightness
  #shiftColor(color, shift) {
    var colorArray = color.slice(1).match(/.{1,2}/g)
    colorArray = [parseInt(colorArray[0], 16), parseInt(colorArray[1], 16), parseInt(colorArray[2], 16)]
    var colorArray = colorArray.map(x => {
      x += shift
      if (x < 0) x = 0
      if (x > 255) x = 255
      return x
    })
    return "rgb(" + colorArray.toString() + ")"
  }

  // Called every 15ms by the tab controller
  periodic() {
    // Reset scroll if queued
    if (this.#resetOnNextUpdate) {
      this.#resetOnNextUpdate = false
      this.#updateScroll(true)
    } else if (selection.locked) { // Update every cycle when locked to ensure smoothness
      this.#updateScroll()
    }

    // Utility function to scale value between two ranges
    var scaleValue = (value, oldMin, oldMax, newMin, newMax) => {
      return (((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin)) + newMin
    }

    const devicePixelRatio = window.devicePixelRatio
    var context = this.#canvas.getContext("2d")
    var width = this.#canvasContainer.clientWidth
    var height = this.#canvasContainer.clientHeight
    var light = !window.matchMedia("(prefers-color-scheme: dark)").matches
    this.#canvas.width = width * devicePixelRatio
    this.#canvas.height = height * devicePixelRatio
    context.scale(devicePixelRatio, devicePixelRatio)

    context.clearRect(0, 0, width, height)
    var graphLeft = 60
    var graphTop = 8
    var graphWidth = width - graphLeft - 60
    var graphHeight = height - graphTop - 50
    var xRange = this.#xRange

    // Calculate axes
    var dataLookup = {}
    var getMinMax = (fields) => {
      var allValues = []
      fields.forEach((field) => {
        if (field.id == null) return // Missing field
        if (field.id in dataLookup) {
          allValues.push.apply(allValues, dataLookup[field.id].values)
        } else {
          var data = log.getDataInRange(field.id, xRange[0], xRange[1])
          dataLookup[field.id] = data
          allValues.push.apply(allValues, data.values)
        }
      })

      function arrayMin(arr) {
        var len = arr.length, min = Infinity;
        while (len--) {
          if (arr[len] < min) {
            min = arr[len];
          }
        }
        return min;
      }

      function arrayMax(arr) {
        var len = arr.length, max = -Infinity;
        while (len--) {
          if (arr[len] > max) {
            max = arr[len];
          }
        }
        return max;
      }

      var minMax = [arrayMin(allValues), arrayMax(allValues)]
      if (!isFinite(minMax[0])) minMax[0] = -1
      if (!isFinite(minMax[1])) minMax[1] = 1
      return minMax
    }

    var visibleFieldsLeft = this.#legends.left.fields.filter((field) => field.show)
    var visibleFieldsRight = this.#legends.right.fields.filter((field) => field.show)

    const targetStepPx = 50
    const primaryMargin = 0.05
    const secondaryMargin = 0.3
    var leftIsPrimary = false
    if (this.#legends.left.locked && this.#legends.right.locked) { // No secondary axis
      leftIsPrimary = visibleFieldsLeft.length >= visibleFieldsRight.length
      var leftAxis = this.#calcAutoAxis(graphHeight, targetStepPx, getMinMax(visibleFieldsLeft), primaryMargin, 1, null, this.#legends.left.range)
      var rightAxis = this.#calcAutoAxis(graphHeight, targetStepPx, getMinMax(visibleFieldsRight), secondaryMargin, 1, null, this.#legends.right.range)
    } else if (this.#legends.left.locked) { // Only left locked, make it primary
      leftIsPrimary = true
      var leftAxis = this.#calcAutoAxis(graphHeight, targetStepPx, getMinMax(visibleFieldsLeft), primaryMargin, 1, null, this.#legends.left.range)
      var rightAxis = this.#calcAutoAxis(graphHeight, targetStepPx, getMinMax(visibleFieldsRight), secondaryMargin, 1, leftAxis, null)
    } else if (this.#legends.right.locked) { // Only right locked, make it primary
      leftIsPrimary = false
      var rightAxis = this.#calcAutoAxis(graphHeight, targetStepPx, getMinMax(visibleFieldsRight), primaryMargin, 1, null, this.#legends.right.range)
      var leftAxis = this.#calcAutoAxis(graphHeight, targetStepPx, getMinMax(visibleFieldsLeft), secondaryMargin, 1, rightAxis, null)
    } else if (visibleFieldsRight.length > visibleFieldsLeft.length) { // Right has more fields, make it primary
      leftIsPrimary = false
      var rightAxis = this.#calcAutoAxis(graphHeight, targetStepPx, getMinMax(visibleFieldsRight), primaryMargin, 1, null, null)
      var leftAxis = this.#calcAutoAxis(graphHeight, targetStepPx, getMinMax(visibleFieldsLeft), secondaryMargin, 1, rightAxis, null)
    } else { // Left is primary by default
      leftIsPrimary = true
      var leftAxis = this.#calcAutoAxis(graphHeight, targetStepPx, getMinMax(visibleFieldsLeft), primaryMargin, 1, null, null)
      var rightAxis = this.#calcAutoAxis(graphHeight, targetStepPx, getMinMax(visibleFieldsRight), secondaryMargin, 1, leftAxis, null)
    }
    var showLeftAxis = visibleFieldsLeft.length > 0 || this.#legends.left.locked
    var showRightAxis = visibleFieldsRight.length > 0 || this.#legends.right.locked
    if (!showLeftAxis && !showRightAxis) showLeftAxis = true
    this.#legends.left.range = [leftAxis.min, leftAxis.max]
    this.#legends.right.range = [rightAxis.min, rightAxis.max]

    // Render discrete data
    context.globalAlpha = 1
    context.textAlign = "left"
    context.textBaseline = "middle"
    context.font = "12px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont"
    var visibleFieldsDiscrete = this.#legends.discrete.fields.filter((field) => field.show)
    visibleFieldsDiscrete.forEach((field, renderIndex) => {
      if (field.id == null) return // Missing field
      if (field.id in dataLookup) {
        var data = dataLookup[field.id]
      } else {
        var data = log.getDataInRange(field.id, xRange[0], xRange[1])
      }
      var fieldInfo = log.getFieldInfo(field.id)
      var lastChange = 0
      var colorToggle = data.startValueIndex % 2 == 0
      for (let i = 1; i < data.timestamps.length + 1; i++) {
        if (i == data.timestamps.length || data.values[i] != data.values[lastChange]) {
          if (data.values[lastChange] != null) {
            var startX = scaleValue(data.timestamps[lastChange], xRange[0], xRange[1], graphLeft, graphLeft + graphWidth)
            if (i == data.timestamps.length) {
              var endX = graphLeft + graphWidth
            } else {
              var endX = scaleValue(data.timestamps[i], xRange[0], xRange[1], graphLeft, graphLeft + graphWidth)
            }
            var topY = graphTop + graphHeight - 20 - (renderIndex * 20)

            // Draw rectangle
            colorToggle = !colorToggle
            context.fillStyle = colorToggle ? this.#shiftColor(field.color, -30) : this.#shiftColor(field.color, 30)
            context.fillRect(startX, topY, endX - startX, 15)

            // Draw text
            var adjustedStartX = startX < graphLeft ? graphLeft : startX
            if (endX - adjustedStartX > 10) {
              if (fieldInfo.type == "Byte") {
                var text = "0x" + (data.values[lastChange] & 0xff).toString(16).padStart(2, "0")
              } else if (fieldInfo.type == "ByteArray") {
                var hexArray = data.values[lastChange].map(byte => {
                  "0x" + (byte & 0xff).toString(16).padStart(2, "0")
                })
                var text = "[" + hexArray.toString() + "]"
              } else {
                var text = JSON.stringify(data.values[lastChange])
              }

              context.fillStyle = colorToggle ? this.#shiftColor(field.color, 100) : this.#shiftColor(field.color, -100)
              context.fillText(text, adjustedStartX + 5, topY + (15 / 2), endX - adjustedStartX - 10)
            }
          }

          lastChange = i
        }
      }
    })

    // Render continuous data
    var renderLegend = (fields, range) => {
      fields.forEach(field => {
        if (field.id == null) return // Missing field
        var data = dataLookup[field.id]
        context.lineWidth = 1
        context.strokeStyle = field.color
        context.beginPath()

        // Render starting point
        var startVal = data.values[data.timestamps.length - 1]
        if (startVal != null) {
          context.moveTo(graphLeft + graphWidth, scaleValue(startVal, range[0], range[1], graphTop + graphHeight, graphTop))
        }

        // Render main data
        var i = data.timestamps.length - 1
        while (true) {
          var x = scaleValue(data.timestamps[i], xRange[0], xRange[1], graphLeft, graphLeft + graphWidth)

          // Render start of current data point
          if (data.values[i] != null) {
            var y = scaleValue(data.values[i], range[0], range[1], graphTop + graphHeight, graphTop)
            context.lineTo(x, y)
          }

          // Find previous data point and vertical range
          var currentX = Math.floor(x * devicePixelRatio)
          var vertRange = [data.values[i], data.values[i]]
          do {
            i--
            if (data.values[i] != null) {
              if (vertRange[0] == null || data.values[i] < vertRange[0]) vertRange[0] = data.values[i]
              if (vertRange[1] == null || data.values[i] > vertRange[1]) vertRange[1] = data.values[i]
            }
            var newX = Math.floor(scaleValue(data.timestamps[i], xRange[0], xRange[1], graphLeft, graphLeft + graphWidth) * devicePixelRatio)
          } while (i >= 0 && newX >= currentX)
          if (i < 0) break

          // Render vertical range
          if (vertRange[0] != null && vertRange[1] != null) {
            context.moveTo(x, scaleValue(vertRange[0], range[0], range[1], graphTop + graphHeight, graphTop))
            context.lineTo(x, scaleValue(vertRange[1], range[0], range[1], graphTop + graphHeight, graphTop))
          }

          // Move to end of previous data point
          if (data.values[i] != null) {
            var y = scaleValue(data.values[i], range[0], range[1], graphTop + graphHeight, graphTop)
            context.moveTo(x, y)
          } else {
            context.stroke()
            context.beginPath()
          }
        }
        context.stroke()
        context.beginPath()
      })
    }
    renderLegend(visibleFieldsLeft, [leftAxis.min, leftAxis.max])
    renderLegend(visibleFieldsRight, [rightAxis.min, rightAxis.max])

    // Render selected times
    var markTime = (time, alpha) => {
      if (time == null) return
      if (time >= xRange[0] && time <= xRange[1]) {
        context.globalAlpha = alpha
        context.lineWidth = 1
        context.setLineDash([5, 5])
        context.strokeStyle = light ? "#222" : "#eee"

        var x = scaleValue(time, xRange[0], xRange[1], graphLeft, graphLeft + graphWidth)
        context.beginPath()
        context.moveTo(x, graphTop)
        context.lineTo(x, graphTop + graphHeight)
        context.stroke()
        context.setLineDash([])
        context.globalAlpha = 1
      }
    }
    if (this.#lastCursorX == null) {
      window.selection.hoveredTime = null
    } else {
      window.selection.hoveredTime = ((this.#lastCursorX / this.#scrollOverlay.clientWidth) * (xRange[1] - xRange[0])) + xRange[0]
    }
    if (!window.selection.locked) markTime(window.selection.selectedTime, 1)
    markTime(window.selection.hoveredTime, 0.35)

    // Clear overflow & draw graph outline
    context.lineWidth = 1
    context.strokeStyle = light ? "#222" : "#eee"
    context.clearRect(0, 0, width, graphTop)
    context.clearRect(0, graphTop + graphHeight, width, height - graphTop - graphHeight)
    context.clearRect(0, graphTop, graphLeft, graphHeight)
    context.clearRect(graphLeft + graphWidth, graphTop, width - graphLeft - graphWidth, graphHeight)
    context.strokeRect(graphLeft, graphTop, graphWidth, graphHeight)

    // Render y axes
    context.lineWidth = 1
    context.strokeStyle = light ? "#222" : "#eee"
    context.fillStyle = light ? "#222" : "#eee"
    context.textBaseline = "middle"
    context.font = "12px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont"

    if (showLeftAxis) {
      context.textAlign = "right"
      var stepPos = Math.ceil(this.#cleanFloat(leftAxis.min / leftAxis.step)) * leftAxis.step
      while (this.#cleanFloat(stepPos) <= leftAxis.max) {
        var y = scaleValue(stepPos, leftAxis.min, leftAxis.max, graphTop + graphHeight, graphTop)

        context.globalAlpha = 1
        context.fillText(this.#cleanFloat(stepPos).toString(), graphLeft - 15, y)
        context.beginPath()
        context.moveTo(graphLeft, y)
        context.lineTo(graphLeft - 5, y)
        context.stroke()

        if (leftIsPrimary) {
          context.globalAlpha = 0.1
          context.beginPath()
          context.moveTo(graphLeft, y)
          context.lineTo(graphLeft + graphWidth, y)
          context.stroke()
        }

        stepPos += leftAxis.step
      }
    }

    if (showRightAxis) {
      context.textAlign = "left"
      var stepPos = Math.ceil(this.#cleanFloat(rightAxis.min / rightAxis.step)) * rightAxis.step
      while (this.#cleanFloat(stepPos) <= rightAxis.max) {
        var y = scaleValue(stepPos, rightAxis.min, rightAxis.max, graphTop + graphHeight, graphTop)

        context.globalAlpha = 1
        context.fillText(this.#cleanFloat(stepPos).toString(), graphLeft + graphWidth + 15, y)
        context.beginPath()
        context.moveTo(graphLeft + graphWidth, y)
        context.lineTo(graphLeft + graphWidth + 5, y)
        context.stroke()

        if (!leftIsPrimary) {
          context.globalAlpha = 0.1
          context.beginPath()
          context.moveTo(graphLeft, y)
          context.lineTo(graphLeft + graphWidth, y)
          context.stroke()
        }

        stepPos += rightAxis.step
      }
    }

    // Render x axis
    var axis = this.#calcAutoAxis(graphWidth, 100, xRange, 0, 60, null, null)
    context.textAlign = "center"
    var stepPos = Math.ceil(this.#cleanFloat(axis.min / axis.step)) * axis.step
    while (true) {
      var x = scaleValue(stepPos, axis.min, axis.max, graphLeft, graphLeft + graphWidth)

      // Clean up final x (scroll can cause rounding problems)
      if (x - graphLeft - graphWidth > 1) {
        break
      } else if (x - graphLeft - graphWidth > 0) {
        x = graphLeft + graphWidth
      }

      if (axis.customUnit) {
        var text = this.#cleanFloat(stepPos / 60).toString() + "m"
      } else {
        var text = this.#cleanFloat(stepPos).toString() + "s"
      }

      context.globalAlpha = 1
      context.fillText(text, x, graphTop + graphHeight + 15)
      context.beginPath()
      context.moveTo(x, graphTop + graphHeight)
      context.lineTo(x, graphTop + graphHeight + 5)
      context.stroke()

      context.globalAlpha = 0.1
      context.beginPath()
      context.moveTo(x, graphTop)
      context.lineTo(x, graphTop + graphHeight)
      context.stroke()

      stepPos += axis.step
    }
  }
}