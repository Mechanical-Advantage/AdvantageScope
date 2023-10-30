import TabType from "../../shared/TabType";
import {
  Pose2d,
  Translation2d,
  logReadNumberArrayToPose2dArray,
  logReadPose2d,
  logReadPose2dArray,
  logReadTrajectoryToPose2dArray,
  logReadTranslation2dArrayToPose2dArray,
  logReadTranslation2dToPose2d,
  numberArrayToPose2dArray
} from "../../shared/geometry";
import { ALLIANCE_KEYS, getEnabledData, getIsRedAlliance, getOrDefault } from "../../shared/log/LogUtil";
import LoggableType from "../../shared/log/LoggableType";
import { convert } from "../../shared/units";
import { scaleValue } from "../../shared/util";
import OdometryVisualizer from "../../shared/visualizers/OdometryVisualizer";
import TimelineVizController from "./TimelineVizController";

export default class OdometryController extends TimelineVizController {
  private static HEATMAP_DT = 0.1;
  private static TRAIL_LENGTH_SECS = 5;
  private static POSE_TYPES = [
    "Robot",
    "Ghost",
    "Trajectory",
    "Vision Target",
    "Heatmap",
    "Heatmap (Enabled)",
    "Arrow (Front)",
    "Arrow (Center)",
    "Arrow (Back)"
  ];

  private GAME: HTMLInputElement;
  private GAME_SOURCE_LINK: HTMLElement;
  private UNIT_DISTANCE: HTMLInputElement;
  private UNIT_ROTATION: HTMLInputElement;
  private ORIGIN: HTMLInputElement;
  private SIZE: HTMLInputElement;
  private SIZE_TEXT: HTMLElement;
  private ALLIANCE_BUMPERS: HTMLInputElement;
  private ALLIANCE_ORIGIN: HTMLInputElement;
  private ORIENTATION: HTMLInputElement;

  private lastUnitDistance = "meters";

  constructor(content: HTMLElement) {
    let configBody = content.getElementsByClassName("timeline-viz-config")[0].firstElementChild as HTMLElement;
    super(
      content,
      TabType.Odometry,
      [],
      [
        {
          element: configBody.children[1].firstElementChild as HTMLElement,
          types: [
            LoggableType.NumberArray,
            "Pose2d",
            "Pose2d[]",
            "Transform2d",
            "Transform2d[]",
            "Translation2d",
            "Translation2d[]",
            "Trajectory",
            "ZebraTranslation"
          ],
          options: [
            OdometryController.POSE_TYPES, // NumberArray
            OdometryController.POSE_TYPES.filter((x) => x !== "Trajectory"), // Pose2d
            OdometryController.POSE_TYPES, // Pose2d[]
            OdometryController.POSE_TYPES.filter((x) => x !== "Trajectory"), // Transform2d
            OdometryController.POSE_TYPES, // Transform2d[]
            ["Vision Target", "Heatmap", "Heatmap (Enabled)"], // Translation2d
            ["Trajectory", "Vision Target", "Heatmap", "Heatmap (Enabled)"], // Translation2d[]
            ["Trajectory"], // Trajectory
            ["Zebra Marker", "Ghost"] // ZebraTranslation
          ],
          autoAdvanceOptions: [true, true, true, true, true, true, true, true, false]
        }
      ],
      new OdometryVisualizer(
        content.getElementsByClassName("odometry-canvas-container")[0] as HTMLElement,
        content.getElementsByClassName("odometry-heatmap-container")[0] as HTMLElement
      )
    );

    // Get option inputs
    this.GAME = configBody.children[1].children[1].children[1] as HTMLInputElement;
    this.GAME_SOURCE_LINK = configBody.children[1].children[1].children[2] as HTMLElement;
    this.UNIT_DISTANCE = configBody.children[2].children[0].children[1] as HTMLInputElement;
    this.UNIT_ROTATION = configBody.children[2].children[0].children[2] as HTMLInputElement;
    this.ORIGIN = configBody.children[3].children[0].lastElementChild as HTMLInputElement;
    this.SIZE = configBody.children[1].lastElementChild?.children[1] as HTMLInputElement;
    this.SIZE_TEXT = configBody.children[1].lastElementChild?.lastElementChild as HTMLElement;
    this.ALLIANCE_BUMPERS = configBody.children[2].lastElementChild?.children[1] as HTMLInputElement;
    this.ALLIANCE_ORIGIN = configBody.children[2].lastElementChild?.children[2] as HTMLInputElement;
    this.ORIENTATION = configBody.children[3].lastElementChild?.lastElementChild as HTMLInputElement;

    // Set default alliance values
    this.ALLIANCE_BUMPERS.value = "auto";
    this.ALLIANCE_ORIGIN.value = "blue";

    // Add initial set of options
    this.resetGameOptions();

    // Unit conversion for distance
    this.UNIT_DISTANCE.addEventListener("change", () => {
      let newUnit = this.UNIT_DISTANCE.value;
      if (newUnit !== this.lastUnitDistance) {
        let oldSize = Number(this.SIZE.value);
        if (newUnit === "meters") {
          this.SIZE.value = (Math.round(convert(oldSize, "inches", "meters") * 1000) / 1000).toString();
          this.SIZE.step = "0.01";
        } else {
          this.SIZE.value = (Math.round(convert(oldSize, "meters", "inches") * 100) / 100).toString();
          this.SIZE.step = "1";
        }
        this.SIZE_TEXT.innerText = newUnit;
        this.lastUnitDistance = newUnit;
      }
    });

    // Bind source link
    this.GAME.addEventListener("change", () => {
      let config = window.assets?.field2ds.find((game) => game.name === this.GAME.value);
      this.GAME_SOURCE_LINK.hidden = config !== undefined && config.sourceUrl === undefined;
    });
    this.GAME_SOURCE_LINK.addEventListener("click", () => {
      window.sendMainMessage(
        "open-link",
        window.assets?.field2ds.find((game) => game.name === this.GAME.value)?.sourceUrl
      );
    });

    // Enforce side length range
    this.SIZE.addEventListener("change", () => {
      if (Number(this.SIZE.value) < 0) this.SIZE.value = "0.1";
      if (Number(this.SIZE.value) === 0) this.SIZE.value = "0.1";
    });
  }

  /** Clears all options from the game selector then updates it with the latest options. */
  private resetGameOptions() {
    let value = this.GAME.value;
    while (this.GAME.firstChild) {
      this.GAME.removeChild(this.GAME.firstChild);
    }
    let options: string[] = [];
    if (window.assets !== null) {
      options = window.assets.field2ds.map((game) => game.name);
      options.forEach((title) => {
        let option = document.createElement("option");
        option.innerText = title;
        this.GAME.appendChild(option);
      });
    }
    if (options.includes(value)) {
      this.GAME.value = value;
    } else {
      this.GAME.value = options[0];
    }
    this.updateGameSourceLink();
  }

  /** Shows or hides the source link based on the selected game. */
  private updateGameSourceLink() {
    let fieldConfig = window.assets?.field2ds.find((game) => game.name === this.GAME.value);
    this.GAME_SOURCE_LINK.hidden = fieldConfig !== undefined && fieldConfig.sourceUrl === undefined;
  }

  get options(): { [id: string]: any } {
    return {
      game: this.GAME.value,
      unitDistance: this.UNIT_DISTANCE.value,
      unitRotation: this.UNIT_ROTATION.value,
      origin: this.ORIGIN.value,
      size: Number(this.SIZE.value),
      allianceBumpers: this.ALLIANCE_BUMPERS.value,
      allianceOrigin: this.ALLIANCE_ORIGIN.value,
      orientation: this.ORIENTATION.value
    };
  }

  set options(options: { [id: string]: any }) {
    this.resetGameOptions();
    this.GAME.value = options.game;
    this.UNIT_DISTANCE.value = options.unitDistance;
    this.UNIT_ROTATION.value = options.unitRotation;
    this.ORIGIN.value = options.origin;
    this.SIZE.value = options.size;
    this.SIZE_TEXT.innerText = options.unitDistance;
    this.lastUnitDistance = options.unitDistance;
    this.ALLIANCE_BUMPERS.value = options.allianceBumpers;
    this.ALLIANCE_ORIGIN.value = options.allianceOrigin;
    this.ORIENTATION.value = options.orientation;
    this.updateGameSourceLink();
  }

  newAssets() {
    this.resetGameOptions();
  }

  getAdditionalActiveFields(): string[] {
    if (this.ALLIANCE_BUMPERS.value === "auto" || this.ALLIANCE_ORIGIN.value === "auto") {
      return ALLIANCE_KEYS;
    } else {
      return [];
    }
  }

  getCommand(time: number) {
    const distanceConversion = convert(1, this.UNIT_DISTANCE.value, "meters");
    const rotationConversion = convert(1, this.UNIT_ROTATION.value, "radians");

    // Returns the current value for a field
    let getCurrentValue = (key: string, type: LoggableType | string): Pose2d[] => {
      if (type === LoggableType.NumberArray) {
        return logReadNumberArrayToPose2dArray(window.log, key, time, distanceConversion, rotationConversion);
      } else if (type === "Trajectory") {
        return logReadTrajectoryToPose2dArray(window.log, key, time, distanceConversion);
      } else if (typeof type === "string" && type.endsWith("[]")) {
        return type.startsWith("Translation")
          ? logReadTranslation2dArrayToPose2dArray(window.log, key, time, distanceConversion)
          : logReadPose2dArray(window.log, key, time, distanceConversion);
      } else {
        let pose =
          typeof type === "string" && type.startsWith("Translation")
            ? logReadTranslation2dToPose2d(window.log, key, time, distanceConversion)
            : logReadPose2d(window.log, key, time, distanceConversion);
        return pose === null ? [] : [pose];
      }
    };

    // Get data
    let robotData: Pose2d[] = [];
    let trailData: Translation2d[][] = [];
    let ghostData: Pose2d[] = [];
    let trajectoryData: Pose2d[][] = [];
    let visionTargetData: Pose2d[] = [];
    let heatmapData: Translation2d[] = [];
    let arrowFrontData: Pose2d[] = [];
    let arrowCenterData: Pose2d[] = [];
    let arrowBackData: Pose2d[] = [];
    let zebraMarkerData: { [key: string]: { translation: Translation2d; alliance: string } } = {};
    let zebraGhostDataTranslations: Translation2d[] = [];
    let zebraGhostData: Pose2d[] = [];
    this.getListFields()[0].forEach((field) => {
      switch (field.type) {
        case "Robot":
          let currentRobotData = getCurrentValue(field.key, field.sourceType);
          robotData = robotData.concat(currentRobotData);

          // Get timestamps for trail
          let keys: string[] = [];
          let arrayLength = 0;
          if (field.sourceType === LoggableType.NumberArray) {
            keys = [field.key];
          } else if (typeof field.sourceType === "string" && field.sourceType.endsWith("[]")) {
            arrayLength = getOrDefault(window.log, field.key + "/length", LoggableType.Number, time, 0);
            for (let i = 0; i < arrayLength; i++) {
              let itemKey = field.key + "/" + i.toString();
              keys = keys.concat([itemKey + "/translation/x", itemKey + "/translation/y", itemKey + "/rotation/value"]);
            }
          } else if (typeof field.sourceType === "string") {
            keys = [field.key + "/translation/x", field.key + "/translation/y", field.key + "/rotation/value"];
          }
          let timestamps = window.log
            .getTimestamps([field.key], this.UUID)
            .filter(
              (x) => x > time - OdometryController.TRAIL_LENGTH_SECS && x < time + OdometryController.TRAIL_LENGTH_SECS
            );

          // Get trail data
          let trailsTemp: Translation2d[][] = currentRobotData.map(() => []);
          if (field.sourceType === LoggableType.NumberArray) {
            let data = window.log.getNumberArray(field.key, timestamps[0], timestamps[timestamps.length - 1]);
            if (data !== undefined) {
              let dataIndex = 1;
              timestamps.forEach((timestamp) => {
                let poses = numberArrayToPose2dArray(
                  data!.values[dataIndex - 1],
                  distanceConversion,
                  rotationConversion
                );
                poses.forEach((pose, index) => {
                  if (index < trailsTemp.length) {
                    trailsTemp[index].push(pose.translation);
                  }
                });
                while (dataIndex < data!.timestamps.length && data!.timestamps[dataIndex] < timestamp) {
                  dataIndex++;
                }
              });
            }
          } else if (typeof field.sourceType === "string") {
            let addTrail = (key: string, trailIndex = 0) => {
              if (trailIndex >= trailsTemp.length) {
                return;
              }
              let xData = window.log.getNumber(
                key + "/translation/x",
                timestamps[0],
                timestamps[timestamps.length - 1]
              );
              let yData = window.log.getNumber(
                key + "/translation/y",
                timestamps[0],
                timestamps[timestamps.length - 1]
              );
              if (xData !== undefined && yData !== undefined) {
                let xDataIndex = 1;
                let yDataIndex = 1;
                timestamps.forEach((timestamp) => {
                  trailsTemp[trailIndex].push([
                    xData!.values[xDataIndex - 1] * distanceConversion,
                    yData!.values[yDataIndex - 1] * distanceConversion
                  ]);
                  while (xDataIndex < xData!.timestamps.length && xData!.timestamps[xDataIndex] < timestamp) {
                    xDataIndex++;
                  }
                  while (yDataIndex < yData!.timestamps.length && yData!.timestamps[yDataIndex] < timestamp) {
                    yDataIndex++;
                  }
                });
              }
            };
            if (field.sourceType.endsWith("[]")) {
              for (let i = 0; i < arrayLength; i++) {
                addTrail(field.key + "/" + i.toString(), i);
              }
            } else {
              addTrail(field.key);
            }
          }
          trailData = trailData.concat(trailsTemp);
          break;
        case "Ghost":
          if (field.sourceType !== "ZebraTranslation") {
            ghostData = ghostData.concat(getCurrentValue(field.key, field.sourceType));
          } else {
            let x: number | null = null;
            let y: number | null = null;
            {
              let xData = window.log.getNumber(field.key + "/x", time, time);
              if (xData !== undefined && xData.values.length > 0) {
                if (xData.values.length === 1) {
                  x = xData.values[0];
                } else {
                  x = scaleValue(time, [xData.timestamps[0], xData.timestamps[1]], [xData.values[0], xData.values[1]]);
                }
              }
            }
            {
              let yData = window.log.getNumber(field.key + "/y", time, time);
              if (yData !== undefined && yData.values.length > 0) {
                if (yData.values.length === 1) {
                  y = yData.values[0];
                } else {
                  y = scaleValue(time, [yData.timestamps[0], yData.timestamps[1]], [yData.values[0], yData.values[1]]);
                }
              }
            }
            if (x !== null && y !== null) {
              zebraGhostDataTranslations.push([convert(x, "feet", "meters"), convert(y, "feet", "meters")]);
            }
          }
          break;
        case "Trajectory":
          trajectoryData.push(getCurrentValue(field.key, field.sourceType));
          break;
        case "Vision Target":
          visionTargetData = visionTargetData.concat(getCurrentValue(field.key, field.sourceType));
          break;
        case "Heatmap":
        case "Heatmap (Enabled)":
          {
            // Get enabled data
            let enabledFilter = field.type === "Heatmap (Enabled)";
            let enabledData = enabledFilter ? getEnabledData(window.log) : null;
            let isEnabled = (timestamp: number) => {
              if (!enabledFilter) return true;
              if (enabledData === null) return false;
              let enabledDataIndex = enabledData.timestamps.findLastIndex((x) => x <= timestamp);
              if (enabledDataIndex === -1) return false;
              return enabledData.values[enabledDataIndex];
            };

            // Get timestamps
            let timestamps: number[] = [];
            for (
              let sampleTime = window.log.getTimestampRange()[0];
              sampleTime < window.log.getTimestampRange()[1];
              sampleTime += OdometryController.HEATMAP_DT
            ) {
              timestamps.push(sampleTime);
            }

            // Get data
            if (field.sourceType === LoggableType.NumberArray) {
              let data = window.log.getNumberArray(field.key, timestamps[0], timestamps[timestamps.length - 1]);
              if (data !== undefined) {
                let dataIndex = 1;
                timestamps.forEach((timestamp) => {
                  if (!isEnabled(timestamp)) return;
                  let poses = numberArrayToPose2dArray(
                    data!.values[dataIndex - 1],
                    distanceConversion,
                    rotationConversion
                  );
                  poses.forEach((pose, index) => {
                    heatmapData.push(pose.translation);
                  });
                  while (dataIndex < data!.timestamps.length && data!.timestamps[dataIndex] < timestamp) {
                    dataIndex++;
                  }
                });
              }
            } else if (typeof field.sourceType === "string") {
              let addData = (key: string) => {
                let xData = window.log.getNumber(
                  key + "/translation/x",
                  timestamps[0],
                  timestamps[timestamps.length - 1]
                );
                let yData = window.log.getNumber(
                  key + "/translation/y",
                  timestamps[0],
                  timestamps[timestamps.length - 1]
                );
                if (xData !== undefined && yData !== undefined) {
                  let xDataIndex = 1;
                  let yDataIndex = 1;
                  timestamps.forEach((timestamp) => {
                    if (!isEnabled(timestamp)) return;
                    heatmapData.push([
                      xData!.values[xDataIndex - 1] * distanceConversion,
                      yData!.values[yDataIndex - 1] * distanceConversion
                    ]);
                    while (xDataIndex < xData!.timestamps.length && xData!.timestamps[xDataIndex] < timestamp) {
                      xDataIndex++;
                    }
                    while (yDataIndex < yData!.timestamps.length && yData!.timestamps[yDataIndex] < timestamp) {
                      yDataIndex++;
                    }
                  });
                }
              };
              if (field.sourceType.endsWith("[]")) {
                let length = getOrDefault(window.log, field.key + "/length", LoggableType.Number, time, 0);
                for (let i = 0; i < length; i++) {
                  addData(field.key + "/" + i.toString());
                }
              } else {
                addData(field.key);
              }
            }
          }
          break;
        case "Arrow (Front)":
          arrowFrontData = arrowFrontData.concat(getCurrentValue(field.key, field.sourceType));
          break;
        case "Arrow (Center)":
          arrowCenterData = arrowCenterData.concat(getCurrentValue(field.key, field.sourceType));
          break;
        case "Arrow (Back)":
          arrowBackData = arrowBackData.concat(getCurrentValue(field.key, field.sourceType));
          break;
        case "Zebra Marker":
          let team = field.key.split("FRC")[1];
          let x: number | null = null;
          let y: number | null = null;
          {
            let xData = window.log.getNumber(field.key + "/x", time, time);
            if (xData !== undefined && xData.values.length > 0) {
              if (xData.values.length === 1) {
                x = xData.values[0];
              } else {
                x = scaleValue(time, [xData.timestamps[0], xData.timestamps[1]], [xData.values[0], xData.values[1]]);
              }
            }
          }
          {
            let yData = window.log.getNumber(field.key + "/y", time, time);
            if (yData !== undefined && yData.values.length > 0) {
              if (yData.values.length === 1) {
                y = yData.values[0];
              } else {
                y = scaleValue(time, [yData.timestamps[0], yData.timestamps[1]], [yData.values[0], yData.values[1]]);
              }
            }
          }
          let alliance = getOrDefault(window.log, field.key + "/alliance", LoggableType.String, Infinity, "blue");
          if (x !== null && y !== null) {
            zebraMarkerData[team] = {
              translation: [convert(x, "feet", "meters"), convert(y, "feet", "meters")],
              alliance: alliance
            };
          }
          break;
      }
    });

    // Get alliance colors
    let allianceRedBumpers = false;
    let allianceRedOrigin = false;
    let autoRedAlliance = getIsRedAlliance(window.log, time);
    switch (this.ALLIANCE_BUMPERS.value) {
      case "auto":
        allianceRedBumpers = autoRedAlliance;
        break;
      case "blue":
        allianceRedBumpers = false;
        break;
      case "red":
        allianceRedBumpers = true;
        break;
    }
    switch (this.ALLIANCE_ORIGIN.value) {
      case "auto":
        allianceRedOrigin = autoRedAlliance;
        break;
      case "blue":
        allianceRedOrigin = false;
        break;
      case "red":
        allianceRedOrigin = true;
        break;
    }

    // Apply robot rotation to Zebra ghost translations
    let robotRotation = 0;
    if (robotData.length > 0) {
      robotRotation = robotData[0].rotation;
      if (!allianceRedOrigin) {
        // Switch from blue to red origin to match translation
        robotRotation += Math.PI;
      }
    }
    zebraGhostDataTranslations.forEach((translation) => {
      zebraGhostData.push({
        translation: translation,
        rotation: robotRotation
      });
    });

    // Package command data
    return {
      poses: {
        robot: robotData,
        trail: trailData,
        ghost: ghostData,
        trajectory: trajectoryData,
        visionTarget: visionTargetData,
        heatmap: heatmapData,
        arrowFront: arrowFrontData,
        arrowCenter: arrowCenterData,
        arrowBack: arrowBackData,
        zebraMarker: zebraMarkerData,
        zebraGhost: zebraGhostData
      },
      options: this.options,
      allianceRedBumpers: allianceRedBumpers,
      allianceRedOrigin: allianceRedOrigin
    };
  }
}
