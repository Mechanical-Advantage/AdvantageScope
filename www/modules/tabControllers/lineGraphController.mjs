// Controls rendering of line graphs
export class LineGraphController {
  #content = null
  #legendItemTemplate = null
  #canvasContainer = null
  #canvas = null
  #scrollOverlay = null
  #scrollOverlayContent = null

  #colors = ["#EBC542", "#80588E", "#E48B32", "#AACAEE", "#AF2437", "#C0B487", "#858584", "#3B875A", "#D993AA", "#2B66A2", "#EB987E", "#5D4F92", "#EBAA3B", "#A64B6B", "#DBD345", "#7E331F", "#96B637", "#5F4528", "#D36134", "#2E3B28"]

  #zoomScalar = 0.0001
  #minZoomTime = 1
  #zoomExponent = 1.5

  #lastScrollTop = 0
  #lastCursorX = 0
  #lastClientWidth = 0
  #panActive = false
  #panStartCursorX = 0
  #panStartScrollLeft = 0
  #xRange = [0, 1]

  #legends = {
    left: {
      fields: [],
      element: null,
      dragTarget: null,
      types: ["Integer", "Double", "Byte"],
      arrayTypes: ["IntegerArray", "DoubleArray", "ByteArray"]
    },
    discrete: {
      fields: [],
      element: null,
      dragTarget: null,
      types: ["Boolean", "BooleanArray", "Integer", "IntegerArray", "Double", "DoubleArray", "String", "StringArray", "Byte", "ByteArray"], arrayTypes: []
    },
    right: {
      fields: [],
      element: null,
      dragTarget: null,
      types: ["Integer", "Double", "Byte"],
      arrayTypes: ["IntegerArray", "DoubleArray", "ByteArray"]
    }
  }

  constructor(content) {
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

    window.addEventListener("drag-update", (event) => this.#handleDrag(event))
    window.addEventListener("drag-stop", (event) => this.#handleDrag(event))

    window.addEventListener("resize", () => this.#updateScroll())
    this.#scrollOverlay.addEventListener("scroll", () => this.#updateScroll())
    this.#scrollOverlay.addEventListener("mousedown", (event) => {
      this.#panActive = true
      this.#panStartCursorX = event.layerX
      this.#panStartScrollLeft = this.#scrollOverlay.scrollLeft
    })
    this.#scrollOverlay.addEventListener("mousemove", (event) => {
      this.#lastCursorX = event.layerX // Update cursor for zoom
      if (this.#panActive) {
        this.#scrollOverlay.scrollLeft = this.#panStartScrollLeft + (this.#panStartCursorX - event.layerX)
        this.#updateScroll()
      }
    })
    this.#scrollOverlay.addEventListener("mouseup", () => this.#panActive = false)
    this.#scrollOverlay.addEventListener("mouseleave", () => this.#panActive = false)

    this.reset()
  }

  // Handles dragging events (moving and stopping)
  #handleDrag(event) {
    Object.keys(this.#legends).forEach((key) => {
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
  addField(legend, field) {
    // Get color
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

    // Create element
    var item = this.#legendItemTemplate.cloneNode(true)
    item.getElementsByClassName("legend-key")[0].innerText = log.getFieldInfo(field).displayKey
    item.getElementsByClassName("legend-splotch")[0].style.fill = color
    item.getElementsByClassName("legend-splotch")[0].addEventListener("click", () => {
      var index = Array.from(item.parentElement.children).indexOf(item) - 1
      var show = !this.#legends[legend].fields[index].show
      this.#legends[legend].fields[index].show = show
      item.firstElementChild.style.fill = show ? color : "transparent"
    })
    item.getElementsByClassName("legend-edit")[0].addEventListener("click", () => {
      var index = Array.from(item.parentElement.children).indexOf(item) - 1
      item.parentElement.removeChild(item)
      this.#legends[legend].fields.splice(index, 1)
    })

    // Add field
    this.#legends[legend].fields.push({
      id: field,
      color: color,
      show: true
    })
    this.#legends[legend].element.appendChild(item)
  }

  // Called by tab controller when log changes
  reset() {
    Object.values(this.#legends).forEach((legend) => {
      legend.fields = []
      while (legend.element.children.length > 1) {
        legend.element.removeChild(legend.element.lastChild)
      }
    })

    // Reset position to 0 seconds and zoom to 10 seconds
    this.#updateScroll(true)
  }

  // Called by tab controller when side bar size changes
  sideBarResize() {
    this.#updateScroll()
  }

  // Returns the current zoom level
  #calcZoom() {
    return (this.#scrollOverlay.scrollTop ** this.#zoomExponent) * this.#zoomScalar
  }

  // Updates scroll position based on overlay
  #updateScroll(reset, resizing) {
    // Find current time range
    if (log == null) {
      var timeRange = [0, 10]
    } else {
      var timeRange = [log.getTimestamps()[0], log.getTimestamps()[log.getTimestamps().length - 1]]
    }

    // Calculate maximum scroll lengths
    var scrollLengthVertical = ((timeRange[1] - timeRange[0]) / this.#zoomScalar) ** (1 / this.#zoomExponent) // Calc maximum zoom based on time range
    var scrollLengthHorizontal = this.#scrollOverlay.clientWidth * ((timeRange[1] - timeRange[0]) / this.#calcZoom()) // Calc horizontal length based on zoom

    // Adjust content size and enforce limits
    this.#scrollOverlayContent.style.height = (scrollLengthVertical + this.#scrollOverlay.clientHeight).toString() + "px"
    this.#scrollOverlayContent.style.width = scrollLengthHorizontal.toString() + "px"
    if (reset) {
      this.#scrollOverlay.scrollTop = scrollLengthVertical
      this.#scrollOverlay.scrollLeft = 0
    } else {
      var minZoom = (this.#minZoomTime / this.#zoomScalar) ** (1 / this.#zoomExponent)
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
      var cursorTime = ((this.#lastCursorX / this.#scrollOverlay.clientWidth) * (this.#xRange[1] - this.#xRange[0])) + this.#xRange[0] // Time represented by cursor before scroll
      var minX = cursorTime - ((this.#lastCursorX / this.#scrollOverlay.clientWidth) * this.#calcZoom()) // New min X to keep cursor at same time
      this.#scrollOverlay.scrollLeft = Math.round(((minX - timeRange[0]) / this.#calcZoom()) * this.#scrollOverlay.clientWidth)
    }

    // Update x range
    var minX = ((this.#scrollOverlay.scrollLeft / this.#scrollOverlay.clientWidth) * this.#calcZoom()) + timeRange[0]
    this.#xRange = [minX, minX + this.#calcZoom()]
    this.#lastScrollTop = this.#scrollOverlay.scrollTop
  }

  // Cleans up floating point errors
  #cleanFloat(float) {
    var output = Math.round(float * 10000) / 10000
    if (output == -0) output = 0
    return output
  }

  // Calculates appropriate bounds and steps based on data
  #calcAutoAxis(heightPx, targetStepPx, valueRange, marginProportion, primaryAxis) {
    // Calc target range
    var margin = (valueRange[1] - valueRange[0]) * marginProportion
    var targetRange = [valueRange[0] - margin, valueRange[1] + margin]

    // How many steps?
    if (primaryAxis == null) {
      var stepCount = heightPx / targetStepPx
    } else {
      var stepCount = (primaryAxis.max - primaryAxis.min) / primaryAxis.step
    }
    var stepValueApprox = (targetRange[1] - targetRange[0]) / stepCount


    // Clean up step size
    var roundBase = 10 ** Math.floor(Math.log10(stepValueApprox))
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
        step: stepValue
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
        step: stepValue
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
    if (this.#content.hidden) {
      return
    }

    // Shorthand to adjust pixel values based on screen scaling (retina vs non-retina)
    function pix(pixels) {
      return pixels * window.devicePixelRatio
    }

    function scaleValue(value, oldMin, oldMax, newMin, newMax) {
      return (((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin)) + newMin
    }

    function lastTimestamp(timestamp) {
      return log.getTimestamps()[log.getTimestamps().indexOf(timestamp) - 1]
    }

    var context = this.#canvas.getContext("2d")
    var width = this.#canvasContainer.clientWidth
    var height = this.#canvasContainer.clientHeight
    var light = !window.matchMedia("(prefers-color-scheme: dark)").matches
    this.#canvas.width = pix(width)
    this.#canvas.height = pix(height)

    context.clearRect(0, 0, pix(width), pix(height))
    var graphLeft = 60
    var graphTop = 5
    var graphWidth = width - graphLeft - 60
    var graphHeight = height - graphTop - 50
    var xRange = this.#xRange

    // Calculate axes
    var dataLookup = {}
    function getMinMax(fields) {
      var allValues = []
      fields.forEach((field) => {
        if (field.id in dataLookup) {
          allValues.push.apply(allValues, dataLookup[field.id].values)
        } else {
          var data = log.getDataInRange(field.id, xRange[0], xRange[1])
          dataLookup[field.id] = data
          allValues.push.apply(allValues, data.values)
        }
      })
      var minMax = [Math.min.apply(null, allValues), Math.max.apply(null, allValues)]
      if (!isFinite(minMax[0])) minMax[0] = -1
      if (!isFinite(minMax[1])) minMax[1] = 1
      return minMax
    }

    var visibleFieldsLeft = this.#legends.left.fields.filter((field) => field.show)
    var visibleFieldsRight = this.#legends.right.fields.filter((field) => field.show)
    if (visibleFieldsLeft.length >= visibleFieldsRight.length) {
      var leftIsPrimary = true
      var leftAxis = this.#calcAutoAxis(graphHeight, 50, getMinMax(visibleFieldsLeft), 0.05, null)
      var rightAxis = this.#calcAutoAxis(graphHeight, 50, getMinMax(visibleFieldsRight), 0.3, leftAxis)
    } else {
      var leftIsPrimary = false
      var rightAxis = this.#calcAutoAxis(graphHeight, 50, getMinMax(visibleFieldsRight), 0.05, null)
      var leftAxis = this.#calcAutoAxis(graphHeight, 50, getMinMax(visibleFieldsLeft), 0.3, rightAxis)
    }

    // Render discrete data
    context.globalAlpha = 1
    context.textAlign = "left"
    context.textBaseline = "middle"
    context.font = pix(12).toString() + "px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont"
    var visibleFieldsDiscrete = this.#legends.discrete.fields.filter((field) => field.show)
    visibleFieldsDiscrete.forEach((field, renderIndex) => {
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
            context.fillStyle = colorToggle ? this.#shiftColor(field.color, -15) : this.#shiftColor(field.color, 15)

            context.fillRect(pix(startX), pix(topY), pix(endX - startX), pix(15))

            // Draw text
            var adjustedStartX = startX < graphLeft ? graphLeft : startX
            if (endX - adjustedStartX > 10) {
              if (fieldInfo.type == "Byte") {
                var text = "0x" + (data.values[lastChange] & 0xFF).toString(16).padStart(2, "0")
              } else if (fieldInfo.type == "ByteArray") {
                var hexArray = data.values[lastChange].map(byte => {
                  "0x" + (byte & 0xff).toString(16).padStart(2, "0")
                })
                var text = "[" + hexArray.toString() + "]"
              } else {
                var text = JSON.stringify(data.values[lastChange])
              }

              context.fillStyle = colorToggle ? this.#shiftColor(field.color, 100) : this.#shiftColor(field.color, -100)
              context.fillText(text, pix(adjustedStartX + 5), pix(topY + (15 / 2)), pix(endX - adjustedStartX - 10))
            }
          }

          lastChange = i
        }
      }
    })

    // Render continuous data
    function renderLegend(fields, range) {
      fields.forEach((field) => {
        var data = dataLookup[field.id]
        context.lineWidth = pix(1)
        context.strokeStyle = field.color
        context.beginPath()

        for (let i = 0; i < data.timestamps.length; i++) {
          if (i > 0 && data.values[i - 1] != null) {
            var lastTimestampValue = lastTimestamp(data.timestamps[i])
            if (lastTimestampValue != data.timestamps[i - 1]) { // Skipped at least one cycle since last point
              var x = scaleValue(lastTimestampValue, xRange[0], xRange[1], graphLeft, graphLeft + graphWidth)
              var y = scaleValue(data.values[i - 1], range[0], range[1], graphTop + graphHeight, graphTop)
              context.lineTo(pix(x), pix(y))
            }
          }

          if (i == null) {
            context.stroke()
            context.beginPath()
          } else {
            var x = scaleValue(data.timestamps[i], xRange[0], xRange[1], graphLeft, graphLeft + graphWidth)
            var y = scaleValue(data.values[i], range[0], range[1], graphTop + graphHeight, graphTop)
            context.lineTo(pix(x), pix(y))
          }
        }
        context.stroke()
      })
    }
    renderLegend(visibleFieldsLeft, [leftAxis.min, leftAxis.max])
    renderLegend(visibleFieldsRight, [rightAxis.min, rightAxis.max])

    // Clear overflow & draw graph outline
    context.lineWidth = pix(1)
    context.strokeStyle = light ? "#222" : "#eee"
    context.clearRect(pix(0), pix(0), pix(width), pix(graphTop))
    context.clearRect(pix(0), pix(graphTop + graphHeight), pix(width), pix(height - graphTop - graphHeight))
    context.clearRect(pix(0), pix(graphTop), pix(graphLeft), pix(graphHeight))
    context.clearRect(pix(graphLeft + graphWidth), pix(graphTop), pix(width - graphLeft - graphWidth), pix(graphHeight))
    context.strokeRect(pix(graphLeft), pix(graphTop), pix(graphWidth), pix(graphHeight))

    // Render y axes
    context.lineWidth = pix(1)
    context.strokeStyle = light ? "#222" : "#eee"
    context.fillStyle = light ? "#222" : "#eee"
    context.textBaseline = "middle"
    context.font = pix(12).toString() + "px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont"

    var stepPosLeft = Math.ceil(this.#cleanFloat(leftAxis.min / leftAxis.step)) * leftAxis.step
    var stepPosRight = Math.ceil(this.#cleanFloat(rightAxis.min / rightAxis.step)) * rightAxis.step
    while (this.#cleanFloat(stepPosLeft) <= leftAxis.max) {
      var y = scaleValue(stepPosLeft, leftAxis.min, leftAxis.max, graphTop + graphHeight, graphTop)

      context.globalAlpha = 1
      if (leftIsPrimary || visibleFieldsLeft.length > 0) {
        context.textAlign = "right"
        context.fillText(this.#cleanFloat(stepPosLeft).toString(), pix(graphLeft - 10), pix(y))
      }
      if (!leftIsPrimary || visibleFieldsRight.length > 0) {
        context.textAlign = "left"
        context.fillText(this.#cleanFloat(stepPosRight).toString(), pix(graphLeft + graphWidth + 10), pix(y))
      }

      context.globalAlpha = 0.1
      context.beginPath()
      context.moveTo(pix(graphLeft), pix(y))
      context.lineTo(pix(graphLeft + graphWidth), pix(y))
      context.stroke()

      stepPosLeft += leftAxis.step
      stepPosRight += rightAxis.step
    }

    // Render x axis
    var axis = this.#calcAutoAxis(graphWidth, 100, xRange, 0, null)
    context.textAlign = "center"
    var stepPos = Math.ceil(this.#cleanFloat(axis.min / axis.step)) * axis.step
    while (this.#cleanFloat(stepPos) <= axis.max) {
      var x = scaleValue(stepPos, axis.min, axis.max, graphLeft, graphLeft + graphWidth)

      context.globalAlpha = 1
      context.fillText(this.#cleanFloat(stepPos).toString() + "s", pix(x), pix(graphTop + graphHeight + 10))

      context.globalAlpha = 0.1
      context.beginPath()
      context.moveTo(pix(x), pix(graphTop))
      context.lineTo(pix(x), pix(graphTop + graphHeight))
      context.stroke()

      stepPos += axis.step
    }
  }
}