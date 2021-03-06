import { GameConstants } from "../../../games/games.mjs";
import { OdometryRenderer } from "../odometryRenderer.mjs";
import { PointsRenderer } from "../pointsRenderer.mjs";

// Controls rendering of generic visualization tab (odometry and points)
export class GenericVizController {
  #type = null; // "odometry" or "points"
  #content = null;
  #timelineInput = null;
  #timelineMarkerContainer = null;
  #dragHighlight = null;
  #configTable = null;
  #config = null;
  #tabIdentifier = Math.random().toString(36).slice(2);

  // Odometry variables
  #odometryCanvas = null;
  #odometryRenderer = null;
  #odometrylastUnitDistance = "meters";
  #odometryInchesPerMeter = 39.37007874015748;
  #odometryTrailLengthSecs = 5;

  // Points variables
  #pointsContainer = null;
  #pointsRenderer = null;

  constructor(content, type) {
    this.#type = type;
    this.#content = content;
    this.#dragHighlight = content.getElementsByClassName("generic-viz-drag-highlight")[0];
    this.#timelineInput = content.getElementsByClassName("generic-viz-timeline-slider")[0];
    this.#timelineMarkerContainer = content.getElementsByClassName("generic-viz-timeline-marker-container")[0];
    this.#configTable = content.getElementsByClassName("generic-viz-config")[0];

    this.#timelineInput.addEventListener("input", () => {
      window.selection.selectedTime = Number(this.#timelineInput.value);
    });
    content.getElementsByClassName("generic-viz-popup-button")[0].addEventListener("click", () => {
      window.dispatchEvent(
        new CustomEvent("create-generic-viz-popup", {
          detail: {
            id: this.#tabIdentifier,
            type: this.#type
          }
        })
      );
    });

    // Set up type-specific elements
    var configBody = content.getElementsByClassName("generic-viz-config")[0].firstElementChild;
    switch (type) {
      case "odometry":
        this.#odometryCanvas = content.getElementsByClassName("odometry-canvas")[0];
        this.#odometryRenderer = new OdometryRenderer(this.#odometryCanvas);

        this.#config = {
          fields: {
            robotPose: { element: configBody.children[1].firstElementChild, id: null, missingKey: null },
            ghostPose: { element: configBody.children[2].firstElementChild, id: null, missingKey: null },
            visionCoordinates: { element: configBody.children[3].firstElementChild, id: null, missingKey: null }
          },
          options: {
            game: configBody.children[1].children[1].children[1],
            unitDistance: configBody.children[2].children[1].children[1],
            unitRotation: configBody.children[2].children[1].children[2],
            origin: configBody.children[3].children[1].lastElementChild,
            size: configBody.children[1].lastElementChild.children[1],
            alliance: configBody.children[2].lastElementChild.lastElementChild,
            orientation: configBody.children[3].lastElementChild.lastElementChild
          }
        };
        this.#config.options.unitDistance.addEventListener("change", () => {
          var newUnit = this.#config.options.unitDistance.value;
          if (newUnit != this.#odometrylastUnitDistance) {
            var oldSize = this.#config.options.size.value;
            if (newUnit == "meters") {
              this.#config.options.size.value = Math.round((oldSize / this.#odometryInchesPerMeter) * 1000) / 1000;
              this.#config.options.size.step = 0.01;
            } else {
              this.#config.options.size.value = Math.round(oldSize * this.#odometryInchesPerMeter * 100) / 100;
              this.#config.options.size.step = 1;
            }
            configBody.children[1].lastElementChild.lastElementChild.innerText = newUnit;
            this.#odometrylastUnitDistance = newUnit;
          }
        });
        GameConstants.forEach((game) => {
          var option = document.createElement("option");
          option.innerText = game.title;
          this.#config.options.game.appendChild(option);
        });
        configBody.children[1].children[1].children[2].addEventListener("click", () => {
          window.dispatchEvent(
            new CustomEvent("open-link", {
              detail: GameConstants.find((x) => x.title == this.#config.options.game.value).source
            })
          );
        });
        break;
      case "points":
        this.#pointsContainer = content.getElementsByClassName("points-background-container")[0];
        this.#pointsRenderer = new PointsRenderer(this.#pointsContainer);

        this.#config = {
          fields: {
            x: { element: configBody.children[1].firstElementChild, id: null, missingKey: null },
            y: { element: configBody.children[2].firstElementChild, id: null, missingKey: null }
          },
          options: {
            width: configBody.children[1].children[1].children[1],
            height: configBody.children[1].children[1].children[3],
            group: configBody.children[2].children[1].children[1],
            pointShape: configBody.children[1].children[2].children[1],
            pointSize: configBody.children[2].children[2].children[1]
          }
        };
        window.test = this.#config;
        break;
    }

    // Manage dragging
    window.addEventListener("drag-update", (event) => this.#handleDrag(event));
    window.addEventListener("drag-stop", (event) => this.#handleDrag(event));

    // Clear fields on right click
    Object.values(this.#config.fields).forEach((field) => {
      field.element.addEventListener("contextmenu", () => {
        field.id = null;
        field.missingKey = null;
        field.element.lastElementChild.innerText = "<Drag Here>";
        field.element.lastElementChild.style.textDecoration = "";
      });
    });

    // Start periodic cycle and reset (in case log is already loaded)
    window.setInterval(() => this.customPeriodic(), 15);
    this.state = this.state;
  }

  // Render timeline sections
  #renderTimeline() {
    while (this.#timelineMarkerContainer.firstChild) {
      this.#timelineMarkerContainer.removeChild(this.#timelineMarkerContainer.firstChild);
    }
    if (log) {
      var minTime = log.getTimestamps()[0];
      var maxTime = selection.isLocked() ? selection.selectedTime : log.getTimestamps()[log.getTimestamps().length - 1];
      this.#timelineInput.min = minTime;
      this.#timelineInput.max = maxTime;
      var data = log.getDataInRange(log.findField("/DriverStation/Enabled", "Boolean"), -Infinity, Infinity);
      for (let i = 0; i < data.values.length; i++) {
        if (data.values[i]) {
          var div = document.createElement("div");
          this.#timelineMarkerContainer.appendChild(div);
          var leftPercent = ((data.timestamps[i] - minTime) / (maxTime - minTime)) * 100;
          var nextTime = i == data.values.length - 1 ? maxTime : data.timestamps[i + 1];
          var widthPercent = ((nextTime - data.timestamps[i]) / (maxTime - minTime)) * 100;
          div.style.left = leftPercent.toString() + "%";
          div.style.width = widthPercent.toString() + "%";
        }
      }
    } else {
      this.#timelineInput.min = 0;
      this.#timelineInput.max = 10;
    }
  }

  // Standard function: retrieves current state
  get state() {
    function processField(field) {
      if (field.id == null) {
        return field.missingKey;
      } else {
        return log.getFieldInfo(field.id).displayKey;
      }
    }
    var state = { fields: {}, options: {} };
    Object.entries(this.#config.fields).forEach(([key, field]) => {
      state.fields[key] = processField(field);
    });
    Object.entries(this.#config.options).forEach(([key, element]) => {
      state.options[key] = element.value;
    });
    return state;
  }

  // Standard function: restores state where possible
  set state(newState) {
    // Adjust timeline
    this.#renderTimeline();

    // Reset fields
    Object.keys(this.#config.fields).forEach((fieldKey) => {
      var text = "";
      var missing = false;
      if (newState.fields[fieldKey] == null) {
        // Field is empty
        text = "<Drag Here>";
        this.#config.fields[fieldKey].id = null;
        this.#config.fields[fieldKey].missingKey = null;
      } else {
        var id = log == null ? -1 : log.findFieldDisplay(newState.fields[fieldKey]);
        if (id == -1) {
          // Missing field
          text = newState.fields[fieldKey];
          missing = true;
          this.#config.fields[fieldKey].id = null;
          this.#config.fields[fieldKey].missingKey = newState.fields[fieldKey];
        } else {
          // Valid field
          text = log.getFieldInfo(id).displayKey;
          this.#config.fields[fieldKey].id = id;
          this.#config.fields[fieldKey].missingKey = null;
        }
      }
      this.#config.fields[fieldKey].element.lastElementChild.innerText = text;
      this.#config.fields[fieldKey].element.lastElementChild.style.textDecoration = missing ? "line-through" : "";
    });

    // Reset options
    Object.entries(newState.options).forEach(([key, value]) => {
      this.#config.options[key].value = value;
    });
  }

  // Standard function: updates based on new live data
  updateLive() {
    this.#renderTimeline();
    if (selection.isLocked()) this.#timelineInput.value = this.#timelineInput.max;
  }

  // Handles dragging events (moving and stopping)
  #handleDrag(event) {
    if (this.#content.hidden) return;

    this.#dragHighlight.hidden = true;
    Object.values(this.#config.fields).forEach((field) => {
      var rect = field.element.getBoundingClientRect();
      var active =
        event.detail.x > rect.left &&
        event.detail.x < rect.right &&
        event.detail.y > rect.top &&
        event.detail.y < rect.bottom;
      var type = log.getFieldInfo(event.detail.data.ids[0]).type;
      var validType = type == "DoubleArray";

      if (active && validType) {
        if (event.type == "drag-update") {
          var contentRect = this.#content.getBoundingClientRect();
          this.#dragHighlight.style.left = (rect.left - contentRect.left).toString() + "px";
          this.#dragHighlight.style.top = (rect.top - contentRect.top).toString() + "px";
          this.#dragHighlight.style.width = rect.width.toString() + "px";
          this.#dragHighlight.style.height = rect.height.toString() + "px";
          this.#dragHighlight.hidden = false;
        } else {
          field.id = event.detail.data.ids[0];
          field.element.lastElementChild.innerText = log.getFieldInfo(field.id).displayKey;
          field.element.lastElementChild.style.textDecoration = "";
        }
      }
    });
  }

  // Called by tab controller when side bar size changes
  sideBarResize() {}

  // Called every 15ms by the tab controller
  periodic() {}

  // Called every 15ms (regardless of the visible tab)
  customPeriodic() {
    if (selection.isPlaying() || selection.isLocked()) {
      var time = selection.selectedTime;
    } else {
      var time = selection.hoveredTime ? selection.hoveredTime : selection.selectedTime;
    }
    if (time == null) time = 0;

    // Update timeline
    this.#timelineInput.value = time;

    // Update content height
    this.#content.style.setProperty(
      "--bottom-margin",
      this.#configTable.getBoundingClientRect().height.toString() + "px"
    );

    // Run type-specific periodic function
    switch (this.#type) {
      case "odometry":
        this.#odometryPeriodic(time);
        break;
      case "points":
        this.#pointsPeriodic(time);
        break;
    }
  }

  // Periodic callback for updating odometry
  #odometryPeriodic(time) {
    // Get vision coordinates
    var visionCoordinates = null;
    if (this.#config.fields.visionCoordinates.id != null) {
      var currentData = log.getDataInRange(this.#config.fields.visionCoordinates.id, time, time);
      var currentDataTimestamp = currentData.timestamps[0];
      var currentDataValue = currentData.values[0];
      if (currentDataTimestamp <= time && currentDataValue != null && currentDataValue.length > 1) {
        visionCoordinates = currentDataValue;
      }
    }

    // Read pose data based on field id
    var getPoseData = (id, includeTrail) => {
      if (id == null) {
        return null;
      }

      var currentData = log.getDataInRange(id, time, time);
      if (currentData.timestamps[0] > time) {
        // No data yet
        currentData = null;
      } else {
        currentData = currentData.values[0];
      }
      if (currentData == null) {
        return null;
      }

      var pose = [0, 0, 0]; // x, y, rotation
      var trail = null;

      // Get current position/rotation
      if (currentData.length == 3) {
        pose = currentData;
      }

      // Get trail
      if (includeTrail) {
        var trailData = log.getDataInRange(
          id,
          time - this.#odometryTrailLengthSecs,
          time + this.#odometryTrailLengthSecs
        );
        if (time - trailData.timestamps[0] > this.#odometryTrailLengthSecs) {
          trailData.timestamps.shift();
          trailData.values.shift();
        }
        if (trailData.timestamps[trailData.timestamps.length - 1] - time > this.#odometryTrailLengthSecs) {
          trailData.timestamps.pop();
          trailData.values.pop();
        }
        trail = trailData.values.map((x) => {
          if (x == null || x.length != 3) {
            return null;
          } else {
            return [x[0], x[1]];
          }
        });

        // Return with trail
        return {
          pose: pose,
          trail: trail
        };
      } else {
        return pose;
      }
    };

    // Package command data
    var commandData = {
      pose: {
        robotPose: getPoseData(this.#config.fields.robotPose.id, true),
        ghostPose: getPoseData(this.#config.fields.ghostPose.id, false),
        visionCoordinates: visionCoordinates
      },
      options: {
        game: this.#config.options.game.value,
        unitDistance: this.#config.options.unitDistance.value,
        unitRotation: this.#config.options.unitRotation.value,
        origin: this.#config.options.origin.value,
        size: Number(this.#config.options.size.value),
        alliance: this.#config.options.alliance.value,
        orientation: this.#config.options.orientation.value
      }
    };
    if (!this.#content.hidden) this.#odometryRenderer.render(commandData);
    window.dispatchEvent(
      new CustomEvent("update-generic-viz-popup", {
        detail: {
          id: this.#tabIdentifier,
          command: commandData
        }
      })
    );
  }

  // Periodic callback for updating points
  #pointsPeriodic(time) {
    // Get current data
    var xId = this.#config.fields.x.id;
    var yId = this.#config.fields.y.id;
    var xData = null;
    var yData = null;

    if (xId != null) {
      var xDataTemp = log.getDataInRange(xId, time, time);
      if (xDataTemp.timestamps[0] <= time) {
        xData = xDataTemp.values[0];
      }
    }
    if (xData == null) xData = [];
    if (yId != null) {
      var yDataTemp = log.getDataInRange(yId, time, time);
      if (yDataTemp.timestamps[0] <= time) {
        yData = yDataTemp.values[0];
      }
    }
    if (yData == null) yData = [];

    // Package command data
    var commandData = {
      data: {
        x: xData,
        y: yData
      },
      options: {
        width: Number(this.#config.options.width.value),
        height: Number(this.#config.options.height.value),
        group: Number(this.#config.options.group.value),
        pointShape: this.#config.options.pointShape.value,
        pointSize: this.#config.options.pointSize.value
      }
    };
    if (!this.#content.hidden) this.#pointsRenderer.render(commandData);
    window.dispatchEvent(
      new CustomEvent("update-generic-viz-popup", {
        detail: {
          id: this.#tabIdentifier,
          command: commandData
        }
      })
    );
  }
}
