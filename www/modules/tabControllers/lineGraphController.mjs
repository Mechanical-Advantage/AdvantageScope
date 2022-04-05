import { Colors } from "../colors.mjs";

// Controls rendering of line graphs
export class LineGraphController {
  #content = null;
  #legendItemTemplate = null;
  #canvasContainer = null;
  #canvas = null;
  #scrollOverlay = null;

  #minZoomTime = 0.1;
  #zoomBase = 1.001;
  #scrollCenter = 500000;
  #scrollStationaryMs = 1000;

  #lastScrollUpdate = 0;
  #lastScrollLeft = null;
  #lastScrollTop = null;
  #resetOnNextUpdate = false;

  #firstRestore = true;
  #maxZoom = false;
  #lastCursorX = null;
  #panActive = false;
  #panStartCursorX = 0;
  #panStartXRangeMin = 0;
  #xRange = [0, 10];

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
      types: [
        "Boolean",
        "BooleanArray",
        "Integer",
        "IntegerArray",
        "Double",
        "DoubleArray",
        "String",
        "StringArray",
        "Byte",
        "ByteArray"
      ],
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
  };

  constructor(content) {
    // Set up elements
    this.#content = content;
    this.#legendItemTemplate = content.getElementsByClassName("legend-item-template")[0].firstElementChild;
    this.#canvasContainer = content.getElementsByClassName("line-graph-canvas-container")[0];
    this.#canvas = content.getElementsByClassName("line-graph-canvas")[0];
    this.#scrollOverlay = content.getElementsByClassName("line-graph-scroll")[0];

    this.#legends.left.element = content.getElementsByClassName("legend-left")[0];
    this.#legends.discrete.element = content.getElementsByClassName("legend-discrete")[0];
    this.#legends.right.element = content.getElementsByClassName("legend-right")[0];
    this.#legends.left.dragTarget = content.getElementsByClassName("legend-left")[1];
    this.#legends.discrete.dragTarget = content.getElementsByClassName("legend-discrete")[1];
    this.#legends.right.dragTarget = content.getElementsByClassName("legend-right")[1];

    // Edit axis menus
    this.#legends.left.element.firstElementChild.lastElementChild.addEventListener("click", () => {
      this.#legends.left.editTimestamp = new Date().getTime();
      window.dispatchEvent(
        new CustomEvent("edit-axis", {
          detail: {
            timestamp: this.#legends.left.editTimestamp,
            locked: this.#legends.left.locked,
            range: this.#legends.left.range
          }
        })
      );
    });
    this.#legends.right.element.firstElementChild.lastElementChild.addEventListener("click", () => {
      this.#legends.right.editTimestamp = new Date().getTime();
      window.dispatchEvent(
        new CustomEvent("edit-axis", {
          detail: {
            timestamp: this.#legends.right.editTimestamp,
            locked: this.#legends.right.locked,
            range: this.#legends.right.range
          }
        })
      );
    });
    window.addEventListener("edit-axis-response", (event) => {
      if (event.detail.timestamp == this.#legends.left.editTimestamp) {
        var legend = this.#legends.left;
      } else if (event.detail.timestamp == this.#legends.right.editTimestamp) {
        var legend = this.#legends.right;
      } else {
        return; // Response for a different tab
      }

      switch (event.detail.command) {
        case "toggle-lock":
          legend.locked = !legend.locked;
          legend.element.firstElementChild.firstElementChild.lastElementChild.hidden = !legend.locked;
          break;
        case "set-range":
          legend.range = event.detail.value;
          break;
      }
    });

    // Bind events
    window.addEventListener("drag-update", (event) => this.#handleDrag(event));
    window.addEventListener("drag-stop", (event) => this.#handleDrag(event));
    this.#scrollOverlay.addEventListener("scroll", () => this.#updateRange());
    this.#scrollOverlay.addEventListener("mousemove", (event) => {
      this.#lastCursorX = event.layerX;
      if (this.#panActive) {
        var zoomTime = this.#xRange[1] - this.#xRange[0];
        var shift = ((this.#panStartCursorX - event.layerX) / this.#scrollOverlay.clientWidth) * zoomTime;
        this.#xRange[0] = this.#panStartXRangeMin + shift;
        this.#xRange[1] = this.#panStartXRangeMin + shift + zoomTime;
        this.#updateRange(); // Enforces limits
      }
    });
    this.#scrollOverlay.addEventListener("mouseleave", () => {
      this.#panActive = false;
      this.#lastCursorX = null;
    });
    this.#scrollOverlay.addEventListener("mousedown", (event) => {
      this.#panActive = true;
      this.#panStartCursorX = event.layerX;
      this.#panStartXRangeMin = this.#xRange[0];
    });
    this.#scrollOverlay.addEventListener("mouseup", () => (this.#panActive = false));
    this.#scrollOverlay.addEventListener("click", (event) => {
      if (Math.abs(event.layerX - this.#panStartCursorX) <= 5) {
        window.selection.selectedTime = window.selection.hoveredTime;
      }
    });
    this.#scrollOverlay.addEventListener("contextmenu", () => (window.selection.selectedTime = null));

    this.#updateRange(true);
  }

  // Standard function: retrieves current state
  get state() {
    var processFields = (x) => {
      if (x.id == null) {
        return {
          displayKey: x.missingKey,
          color: x.color,
          show: x.show
        };
      } else {
        return {
          displayKey: log.getFieldInfo(x.id).displayKey,
          color: x.color,
          show: x.show
        };
      }
    };
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
    };
  }

  // Standard function: restores state where possible
  set state(newState) {
    Object.keys(this.#legends).forEach((legendKey) => {
      var legend = this.#legends[legendKey];

      // Update locked status & range
      legend.locked = newState.legends[legendKey].locked;
      legend.range = newState.legends[legendKey].range;
      if (legend.locked != undefined)
        legend.element.firstElementChild.firstElementChild.lastElementChild.hidden = !legend.locked;

      // Remove all fields
      legend.fields = [];
      while (legend.element.children.length > 1) {
        legend.element.removeChild(legend.element.lastChild);
      }

      // Add new fields
      newState.legends[legendKey].fields.forEach((field) => {
        if (log != null) {
          var id = log.findFieldDisplay(field.displayKey);
          if (id != -1) {
            this.addField(legendKey, id, field.color, field.show);
            return;
          }
        }

        // Field not available, insert filler
        this.addField(legendKey, null, field.color, field.show, field.displayKey);
      });

      // Update scroll
      legend.element.scrollTop = newState.legends[legendKey].scroll;
    });

    // Update zoom and pan
    if (log == null) return;
    if (this.#firstRestore) {
      this.#updateRange(true);
      this.#firstRestore = false;
    } else {
      this.#updateRange(); // Enforces limits
    }
  }

  // Handles dragging events (moving and stopping)
  #handleDrag(event) {
    if (this.#content.hidden) return;
    Object.keys(this.#legends).forEach((key) => {
      var legend = this.#legends[key];
      var rect = legend.element.getBoundingClientRect();
      var active =
        event.detail.x > rect.left &&
        event.detail.x < rect.right &&
        event.detail.y > rect.top &&
        event.detail.y < rect.bottom;
      var validType = false;
      event.detail.data.ids.forEach((id) => {
        var type = log.getFieldInfo(id).type;
        if (legend.types.includes(type)) {
          validType = true;
        }
        if (event.detail.data.ids.length == 1) {
          if (legend.arrayTypes.includes(type)) {
            validType = true;
          }
        }
      });

      if (event.type == "drag-update") {
        legend.dragTarget.hidden = !(active && validType);
      } else {
        legend.dragTarget.hidden = true;
        if (active && validType) {
          event.detail.data.ids.forEach((id) => {
            var type = log.getFieldInfo(id).type;
            if (legend.types.includes(type)) {
              this.addField(key, id);
            } else if (legend.arrayTypes.includes(type)) {
              // Single array
              if (event.detail.data.ids.length == 1) {
                event.detail.data.children.forEach((id) => {
                  this.addField(key, id);
                });
              }
            }
          });
        }
      }
    });
  }

  // Adds a new field to the specified legend
  addField(legend, field, forcedColor, forcedShow, missingKey) {
    // Get color
    if (forcedColor) {
      var color = forcedColor;
    } else {
      var usedColors = [];
      Object.keys(this.#legends).forEach((key) => {
        this.#legends[key].fields.forEach((x) => {
          usedColors.push(x.color);
        });
      });
      var availableColors = Colors.filter((color) => !usedColors.includes(color));
      if (availableColors.length == 0) {
        var color = Colors[Math.floor(Math.random() * Colors.length)];
      } else {
        var color = availableColors[0];
      }
    }

    // Determine if showing
    if (forcedShow == null) {
      var show = true;
    } else {
      var show = forcedShow;
    }

    // Create element
    var item = this.#legendItemTemplate.cloneNode(true);
    if (field != null) {
      var text = log.getFieldInfo(field).displayKey;
    } else {
      var text = missingKey;
    }
    item.title = text;
    item.getElementsByClassName("legend-key")[0].innerText = text;
    if (field == null) item.getElementsByClassName("legend-key")[0].style.textDecoration = "line-through";
    item.getElementsByClassName("legend-splotch")[0].style.fill = color;
    if (field != null) {
      item.getElementsByClassName("legend-splotch")[0].addEventListener("click", () => {
        var index = Array.from(item.parentElement.children).indexOf(item) - 1;
        var show = !this.#legends[legend].fields[index].show;
        this.#legends[legend].fields[index].show = show;
        item.firstElementChild.style.fill = show ? color : "transparent";
      });
    }
    item.getElementsByClassName("legend-splotch")[0].style.fill = show && field != null ? color : "transparent";
    item.getElementsByClassName("legend-edit")[0].title = "";
    item.getElementsByClassName("legend-edit")[0].addEventListener("click", () => {
      var index = Array.from(item.parentElement.children).indexOf(item) - 1;
      item.parentElement.removeChild(item);
      this.#legends[legend].fields.splice(index, 1);
    });

    // Add field
    this.#legends[legend].fields.push({
      id: field,
      missingKey: missingKey,
      color: color,
      show: show
    });
    this.#legends[legend].element.appendChild(item);
  }

  // Standard function: updates based on new live data
  updateLive() {
    this.#updateRange();
  }

  // Called by tab controller when side bar size changes
  sideBarResize() {}

  // Updates current x range based on scroll
  #updateRange(reset) {
    var currentTime = new Date().getTime();

    // Exit if not visible (cannot get scroll position)
    if (this.#content.hidden) {
      if (reset) this.#resetOnNextUpdate = true;
      return;
    }

    // Find available time range
    if (log == null) {
      var availableRange = [0, 10];
    } else if (selection.isLocked()) {
      var availableRange = [log.getTimestamps()[0], selection.selectedTime];
    } else {
      var availableRange = [log.getTimestamps()[0], log.getTimestamps()[log.getTimestamps().length - 1]];
    }
    if (availableRange[1] - availableRange[0] < this.#minZoomTime)
      availableRange[1] = availableRange[0] + this.#minZoomTime;

    // Reset to center
    if (currentTime - this.#lastScrollUpdate > this.#scrollStationaryMs) {
      this.#scrollOverlay.scrollLeft = this.#scrollCenter;
      this.#scrollOverlay.scrollTop = this.#scrollCenter;
      this.#lastScrollLeft = this.#scrollCenter;
      this.#lastScrollTop = this.#scrollCenter;
    }
    this.#lastScrollUpdate = currentTime;

    // Measure scroll movement
    var dx = this.#scrollOverlay.scrollLeft - this.#lastScrollLeft;
    var dy = this.#scrollOverlay.scrollTop - this.#lastScrollTop;
    this.#lastScrollLeft = this.#scrollOverlay.scrollLeft;
    this.#lastScrollTop = this.#scrollOverlay.scrollTop;

    // Reset to max range
    if (reset) {
      this.#xRange = availableRange;
      return;
    }

    // Apply horizontal scroll
    if (selection.isLocked()) {
      var zoom = this.#xRange[1] - this.#xRange[0];
      this.#xRange[0] = availableRange[1] - zoom;
      this.#xRange[1] = availableRange[1];
      if (dx < 0) selection.unlock(); // Unlock if attempting to scroll away
    } else if (dx != 0) {
      var secsPerPixel = (this.#xRange[1] - this.#xRange[0]) / this.#scrollOverlay.clientWidth;
      this.#xRange[0] += dx * secsPerPixel;
      this.#xRange[1] += dx * secsPerPixel;
    }

    // Apply vertical scroll
    if (dy != 0) {
      var zoomPercent = Math.pow(this.#zoomBase, dy);
      var newZoom = (this.#xRange[1] - this.#xRange[0]) * zoomPercent;
      if (newZoom < this.#minZoomTime) newZoom = this.#minZoomTime;
      if (newZoom > availableRange[1] - availableRange[0]) newZoom = availableRange[1] - availableRange[0];

      if (selection.hoveredTime != null) {
        var hoveredPercent = (selection.hoveredTime - this.#xRange[0]) / (this.#xRange[1] - this.#xRange[0]);
        this.#xRange[0] = selection.hoveredTime - newZoom * hoveredPercent;
        this.#xRange[1] = selection.hoveredTime + newZoom * (1 - hoveredPercent);
      }
    } else if (this.#maxZoom) {
      this.#xRange = availableRange;
    }

    // Enforce max range
    if (this.#xRange[1] - this.#xRange[0] > availableRange[1] - availableRange[0]) {
      this.#xRange = availableRange;
    }
    this.#maxZoom = this.#xRange[1] - this.#xRange[0] == availableRange[1] - availableRange[0];

    // Enforce left limit
    if (this.#xRange[0] < availableRange[0]) {
      var shift = availableRange[0] - this.#xRange[0];
      this.#xRange[0] += shift;
      this.#xRange[1] += shift;
    }

    // Enforce right limit
    if (this.#xRange[1] > availableRange[1]) {
      var shift = availableRange[1] - this.#xRange[1];
      this.#xRange[0] += shift;
      this.#xRange[1] += shift;
      if (dx > 0) selection.lock(); // Lock if action is intentional
    }
  }

  // Cleans up floating point errors
  #cleanFloat(float) {
    var output = Math.round(float * 10000) / 10000;
    if (output == -0) output = 0;
    return output;
  }

  // Calculates appropriate bounds and steps based on data
  #calcAutoAxis(heightPx, targetStepPx, valueRange, marginProportion, customUnit, primaryAxis, lockedRange) {
    // Calc target range
    if (lockedRange == null) {
      var margin = (valueRange[1] - valueRange[0]) * marginProportion;
      var targetRange = [valueRange[0] - margin, valueRange[1] + margin];
      if (targetRange[0] == targetRange[1]) {
        targetRange[0] -= 1;
        targetRange[1] += 1;
      }
    } else {
      var targetRange = lockedRange;
    }

    // How many steps?
    if (primaryAxis == null) {
      var stepCount = heightPx / targetStepPx;
    } else {
      var stepCount = (primaryAxis.max - primaryAxis.min) / primaryAxis.step;
    }
    var stepValueApprox = (targetRange[1] - targetRange[0]) / stepCount;

    // Clean up step size
    var useCustomUnit = customUnit != null && stepValueApprox > customUnit;
    if (useCustomUnit) {
      var roundBase = customUnit * 10 ** Math.floor(Math.log10(stepValueApprox / customUnit));
    } else {
      var roundBase = 10 ** Math.floor(Math.log10(stepValueApprox));
    }
    if (primaryAxis == null) {
      var multiplierLookup = [0, 1, 2, 2, 5, 5, 5, 5, 5, 10, 10];
    } else {
      var multiplierLookup = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    }
    var stepValue = roundBase * multiplierLookup[Math.round(stepValueApprox / roundBase)];

    // Adjust to match primary gridlines
    if (primaryAxis == null) {
      return {
        min: targetRange[0],
        max: targetRange[1],
        step: stepValue,
        customUnit: useCustomUnit
      };
    } else {
      var midPrimary = (primaryAxis.min + primaryAxis.max) / 2;
      var midSecondary = (targetRange[0] + targetRange[1]) / 2;
      var midStepPrimary = Math.ceil(this.#cleanFloat(midPrimary / primaryAxis.step)) * primaryAxis.step;
      var midStepSecondary = Math.ceil(this.#cleanFloat(midSecondary / stepValue)) * stepValue;

      var newMin = ((primaryAxis.min - midStepPrimary) / primaryAxis.step) * stepValue + midStepSecondary;
      var newMax = ((primaryAxis.max - midStepPrimary) / primaryAxis.step) * stepValue + midStepSecondary;
      return {
        min: newMin,
        max: newMax,
        step: stepValue,
        customUnit: useCustomUnit
      };
    }
  }

  // Adjusts color brightness
  #shiftColor(color, shift) {
    var colorArray = color.slice(1).match(/.{1,2}/g);
    colorArray = [parseInt(colorArray[0], 16), parseInt(colorArray[1], 16), parseInt(colorArray[2], 16)];
    var colorArray = colorArray.map((x) => {
      x += shift;
      if (x < 0) x = 0;
      if (x > 255) x = 255;
      return x;
    });
    return "rgb(" + colorArray.toString() + ")";
  }

  // Called every 15ms by the tab controller
  periodic() {
    // Reset scroll if queued
    if (this.#resetOnNextUpdate) {
      this.#resetOnNextUpdate = false;
      this.#updateRange(true);
    } else if (selection.isLocked()) {
      // Update every cycle when locked to ensure smoothness
      this.#updateRange();
    }

    // Utility function to scale value between two ranges
    var scaleValue = (value, oldMin, oldMax, newMin, newMax) => {
      return ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;
    };

    const devicePixelRatio = window.devicePixelRatio;
    var context = this.#canvas.getContext("2d");
    var width = this.#canvasContainer.clientWidth;
    var height = this.#canvasContainer.clientHeight;
    var light = !window.matchMedia("(prefers-color-scheme: dark)").matches;
    this.#canvas.width = width * devicePixelRatio;
    this.#canvas.height = height * devicePixelRatio;
    context.scale(devicePixelRatio, devicePixelRatio);

    context.clearRect(0, 0, width, height);
    var graphLeft = 60;
    var graphTop = 8;
    var graphWidth = width - graphLeft - 60;
    var graphHeight = height - graphTop - 50;
    var xRange = this.#xRange;
    if (graphWidth < 1) graphWidth = 1;
    if (graphHeight < 1) graphHeight = 1;

    // Calculate axes
    var dataLookup = {};
    var getMinMax = (fields) => {
      var allValues = [];
      fields.forEach((field) => {
        if (field.id == null) return; // Missing field
        if (field.id in dataLookup) {
          allValues.push.apply(allValues, dataLookup[field.id].values);
        } else {
          var data = log.getDataInRange(field.id, xRange[0], xRange[1]);
          dataLookup[field.id] = data;
          allValues.push.apply(allValues, data.values);
        }
      });

      function arrayMin(arr) {
        var len = arr.length,
          min = Infinity;
        while (len--) {
          if (arr[len] == null) continue;
          if (arr[len] < min) {
            min = arr[len];
          }
        }
        return min;
      }

      function arrayMax(arr) {
        var len = arr.length,
          max = -Infinity;
        while (len--) {
          if (arr[len] == null) continue;
          if (arr[len] > max) {
            max = arr[len];
          }
        }
        return max;
      }

      var minMax = [arrayMin(allValues), arrayMax(allValues)];
      if (!isFinite(minMax[0])) minMax[0] = -1;
      if (!isFinite(minMax[1])) minMax[1] = 1;
      return minMax;
    };

    var visibleFieldsDiscrete = this.#legends.discrete.fields.filter((field) => field.show);
    var visibleFieldsLeft = this.#legends.left.fields.filter((field) => field.show);
    var visibleFieldsRight = this.#legends.right.fields.filter((field) => field.show);
    var graphHeightOpen = graphHeight - visibleFieldsDiscrete.length * 20 - (visibleFieldsDiscrete.length > 0 ? 5 : 0); // Graph height above discrete fields
    if (graphHeightOpen < 1) graphHeightOpen = 1;

    const targetStepPx = 50;
    const primaryMargin = 0.05;
    const secondaryMargin = 0.3;
    var leftIsPrimary = false;
    if (this.#legends.left.locked && this.#legends.right.locked) {
      // No secondary axis
      leftIsPrimary = visibleFieldsLeft.length >= visibleFieldsRight.length;
      var leftAxis = this.#calcAutoAxis(
        graphHeightOpen,
        targetStepPx,
        getMinMax(visibleFieldsLeft),
        primaryMargin,
        1,
        null,
        this.#legends.left.range
      );
      var rightAxis = this.#calcAutoAxis(
        graphHeightOpen,
        targetStepPx,
        getMinMax(visibleFieldsRight),
        secondaryMargin,
        1,
        null,
        this.#legends.right.range
      );
    } else if (this.#legends.left.locked) {
      // Only left locked, make it primary
      leftIsPrimary = true;
      var leftAxis = this.#calcAutoAxis(
        graphHeightOpen,
        targetStepPx,
        getMinMax(visibleFieldsLeft),
        primaryMargin,
        1,
        null,
        this.#legends.left.range
      );
      var rightAxis = this.#calcAutoAxis(
        graphHeightOpen,
        targetStepPx,
        getMinMax(visibleFieldsRight),
        secondaryMargin,
        1,
        leftAxis,
        null
      );
    } else if (this.#legends.right.locked) {
      // Only right locked, make it primary
      leftIsPrimary = false;
      var rightAxis = this.#calcAutoAxis(
        graphHeightOpen,
        targetStepPx,
        getMinMax(visibleFieldsRight),
        primaryMargin,
        1,
        null,
        this.#legends.right.range
      );
      var leftAxis = this.#calcAutoAxis(
        graphHeightOpen,
        targetStepPx,
        getMinMax(visibleFieldsLeft),
        secondaryMargin,
        1,
        rightAxis,
        null
      );
    } else if (visibleFieldsRight.length > visibleFieldsLeft.length) {
      // Right has more fields, make it primary
      leftIsPrimary = false;
      var rightAxis = this.#calcAutoAxis(
        graphHeightOpen,
        targetStepPx,
        getMinMax(visibleFieldsRight),
        primaryMargin,
        1,
        null,
        null
      );
      var leftAxis = this.#calcAutoAxis(
        graphHeightOpen,
        targetStepPx,
        getMinMax(visibleFieldsLeft),
        secondaryMargin,
        1,
        rightAxis,
        null
      );
    } else {
      // Left is primary by default
      leftIsPrimary = true;
      var leftAxis = this.#calcAutoAxis(
        graphHeightOpen,
        targetStepPx,
        getMinMax(visibleFieldsLeft),
        primaryMargin,
        1,
        null,
        null
      );
      var rightAxis = this.#calcAutoAxis(
        graphHeightOpen,
        targetStepPx,
        getMinMax(visibleFieldsRight),
        secondaryMargin,
        1,
        leftAxis,
        null
      );
    }
    var showLeftAxis = visibleFieldsLeft.length > 0 || this.#legends.left.locked;
    var showRightAxis = visibleFieldsRight.length > 0 || this.#legends.right.locked;
    if (!showLeftAxis && !showRightAxis) showLeftAxis = true;
    this.#legends.left.range = [leftAxis.min, leftAxis.max];
    this.#legends.right.range = [rightAxis.min, rightAxis.max];

    // Render discrete data
    context.globalAlpha = 1;
    context.textAlign = "left";
    context.textBaseline = "middle";
    context.font = "12px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont";
    visibleFieldsDiscrete.forEach((field, renderIndex) => {
      if (field.id == null) return; // Missing field
      if (field.id in dataLookup) {
        var data = dataLookup[field.id];
      } else {
        var data = log.getDataInRange(field.id, xRange[0], xRange[1]);
      }
      var fieldInfo = log.getFieldInfo(field.id);
      var lastChange = 0;
      var colorToggle = data.startValueIndex % 2 == 0;
      for (let i = 1; i < data.timestamps.length + 1; i++) {
        if (i == data.timestamps.length || data.values[i] != data.values[lastChange]) {
          if (data.values[lastChange] != null) {
            var startX = scaleValue(
              data.timestamps[lastChange],
              xRange[0],
              xRange[1],
              graphLeft,
              graphLeft + graphWidth
            );
            if (i == data.timestamps.length) {
              var endX = graphLeft + graphWidth;
            } else {
              var endX = scaleValue(data.timestamps[i], xRange[0], xRange[1], graphLeft, graphLeft + graphWidth);
            }
            var topY = graphTop + graphHeight - 20 - renderIndex * 20;

            // Draw rectangle
            colorToggle = !colorToggle;
            context.fillStyle = colorToggle ? this.#shiftColor(field.color, -30) : this.#shiftColor(field.color, 30);
            context.fillRect(startX, topY, endX - startX, 15);

            // Draw text
            var adjustedStartX = startX < graphLeft ? graphLeft : startX;
            if (endX - adjustedStartX > 10) {
              if (fieldInfo.type == "Byte") {
                var text = "0x" + (data.values[lastChange] & 0xff).toString(16).padStart(2, "0");
              } else if (fieldInfo.type == "ByteArray") {
                var hexArray = data.values[lastChange].map((byte) => {
                  "0x" + (byte & 0xff).toString(16).padStart(2, "0");
                });
                var text = "[" + hexArray.toString() + "]";
              } else {
                var text = JSON.stringify(data.values[lastChange]);
              }

              context.fillStyle = colorToggle
                ? this.#shiftColor(field.color, 100)
                : this.#shiftColor(field.color, -100);
              context.fillText(text, adjustedStartX + 5, topY + 15 / 2, endX - adjustedStartX - 10);
            }
          }

          lastChange = i;
        }
      }
    });

    // Render continuous data
    var renderLegend = (fields, range) => {
      fields.forEach((field) => {
        if (field.id == null) return; // Missing field
        var data = dataLookup[field.id];
        context.lineWidth = 1;
        context.strokeStyle = field.color;
        context.beginPath();

        // Render starting point
        var startVal = data.values[data.timestamps.length - 1];
        if (startVal != null) {
          context.moveTo(
            graphLeft + graphWidth,
            scaleValue(startVal, range[0], range[1], graphTop + graphHeightOpen, graphTop)
          );
        }

        // Render main data
        var i = data.timestamps.length - 1;
        while (true) {
          var x = scaleValue(data.timestamps[i], xRange[0], xRange[1], graphLeft, graphLeft + graphWidth);

          // Render start of current data point
          if (data.values[i] != null) {
            var y = scaleValue(data.values[i], range[0], range[1], graphTop + graphHeightOpen, graphTop);
            context.lineTo(x, y);
          }

          // Find previous data point and vertical range
          var currentX = Math.floor(x * devicePixelRatio);
          var vertRange = [data.values[i], data.values[i]];
          do {
            i--;
            if (data.values[i] != null) {
              if (vertRange[0] == null || data.values[i] < vertRange[0]) vertRange[0] = data.values[i];
              if (vertRange[1] == null || data.values[i] > vertRange[1]) vertRange[1] = data.values[i];
            }
            var newX = Math.floor(
              scaleValue(data.timestamps[i], xRange[0], xRange[1], graphLeft, graphLeft + graphWidth) * devicePixelRatio
            );
          } while (i >= 0 && newX >= currentX);
          if (i < 0) break;

          // Render vertical range
          if (vertRange[0] != null && vertRange[1] != null) {
            context.moveTo(x, scaleValue(vertRange[0], range[0], range[1], graphTop + graphHeightOpen, graphTop));
            context.lineTo(x, scaleValue(vertRange[1], range[0], range[1], graphTop + graphHeightOpen, graphTop));
          }

          // Move to end of previous data point
          if (data.values[i] != null) {
            var y = scaleValue(data.values[i], range[0], range[1], graphTop + graphHeightOpen, graphTop);
            context.moveTo(x, y);
          } else {
            context.stroke();
            context.beginPath();
          }
        }
        context.stroke();
        context.beginPath();
      });
    };
    renderLegend(visibleFieldsLeft, [leftAxis.min, leftAxis.max]);
    renderLegend(visibleFieldsRight, [rightAxis.min, rightAxis.max]);

    // Render selected times
    var markTime = (time, alpha) => {
      if (time == null) return;
      if (time >= xRange[0] && time <= xRange[1]) {
        context.globalAlpha = alpha;
        context.lineWidth = 1;
        context.setLineDash([5, 5]);
        context.strokeStyle = light ? "#222" : "#eee";

        var x = scaleValue(time, xRange[0], xRange[1], graphLeft, graphLeft + graphWidth);
        context.beginPath();
        context.moveTo(x, graphTop);
        context.lineTo(x, graphTop + graphHeight);
        context.stroke();
        context.setLineDash([]);
        context.globalAlpha = 1;
      }
    };
    if (this.#lastCursorX == null) {
      window.selection.hoveredTime = null;
    } else {
      window.selection.hoveredTime =
        (this.#lastCursorX / this.#scrollOverlay.clientWidth) * (xRange[1] - xRange[0]) + xRange[0];
    }
    if (!window.selection.isLocked()) markTime(window.selection.selectedTime, 1);
    markTime(window.selection.hoveredTime, 0.35);

    // Clear overflow & draw graph outline
    context.lineWidth = 1;
    context.strokeStyle = light ? "#222" : "#eee";
    context.clearRect(0, 0, width, graphTop);
    context.clearRect(0, graphTop + graphHeight, width, height - graphTop - graphHeight);
    context.clearRect(0, graphTop, graphLeft, graphHeight);
    context.clearRect(graphLeft + graphWidth, graphTop, width - graphLeft - graphWidth, graphHeight);
    context.strokeRect(graphLeft, graphTop, graphWidth, graphHeight);

    // Render y axes
    context.lineWidth = 1;
    context.strokeStyle = light ? "#222" : "#eee";
    context.fillStyle = light ? "#222" : "#eee";
    context.textBaseline = "middle";
    context.font = "12px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont";

    if (showLeftAxis) {
      context.textAlign = "right";
      var stepPos = Math.floor(this.#cleanFloat(leftAxis.max / leftAxis.step)) * leftAxis.step;
      while (true) {
        var y = scaleValue(stepPos, leftAxis.min, leftAxis.max, graphTop + graphHeightOpen, graphTop);
        if (y > graphTop + graphHeight) break;

        context.globalAlpha = 1;
        context.fillText(this.#cleanFloat(stepPos).toString(), graphLeft - 15, y);
        context.beginPath();
        context.moveTo(graphLeft, y);
        context.lineTo(graphLeft - 5, y);
        context.stroke();

        if (leftIsPrimary) {
          context.globalAlpha = 0.1;
          context.beginPath();
          context.moveTo(graphLeft, y);
          context.lineTo(graphLeft + graphWidth, y);
          context.stroke();
        }

        stepPos -= leftAxis.step;
      }
    }

    if (showRightAxis) {
      context.textAlign = "left";
      var stepPos = Math.floor(this.#cleanFloat(rightAxis.max / rightAxis.step)) * rightAxis.step;
      while (true) {
        var y = scaleValue(stepPos, rightAxis.min, rightAxis.max, graphTop + graphHeightOpen, graphTop);
        if (y > graphTop + graphHeight) break;

        context.globalAlpha = 1;
        context.fillText(this.#cleanFloat(stepPos).toString(), graphLeft + graphWidth + 15, y);
        context.beginPath();
        context.moveTo(graphLeft + graphWidth, y);
        context.lineTo(graphLeft + graphWidth + 5, y);
        context.stroke();

        if (!leftIsPrimary) {
          context.globalAlpha = 0.1;
          context.beginPath();
          context.moveTo(graphLeft, y);
          context.lineTo(graphLeft + graphWidth, y);
          context.stroke();
        }

        stepPos -= rightAxis.step;
      }
    }

    // Render x axis
    var axis = this.#calcAutoAxis(graphWidth, 100, xRange, 0, 60, null, null);
    context.textAlign = "center";
    var stepPos = Math.ceil(this.#cleanFloat(axis.min / axis.step)) * axis.step;
    while (true) {
      var x = scaleValue(stepPos, axis.min, axis.max, graphLeft, graphLeft + graphWidth);

      // Clean up final x (scroll can cause rounding problems)
      if (x - graphLeft - graphWidth > 1) {
        break;
      } else if (x - graphLeft - graphWidth > 0) {
        x = graphLeft + graphWidth;
      }

      if (axis.customUnit) {
        var text = this.#cleanFloat(stepPos / 60).toString() + "m";
      } else {
        var text = this.#cleanFloat(stepPos).toString() + "s";
      }

      context.globalAlpha = 1;
      context.fillText(text, x, graphTop + graphHeight + 15);
      context.beginPath();
      context.moveTo(x, graphTop + graphHeight);
      context.lineTo(x, graphTop + graphHeight + 5);
      context.stroke();

      context.globalAlpha = 0.1;
      context.beginPath();
      context.moveTo(x, graphTop);
      context.lineTo(x, graphTop + graphHeight);
      context.stroke();

      stepPos += axis.step;
    }
  }
}
