import { Pose2d, Translation2d } from "../../shared/geometry";
import LoggableType from "../../shared/log/LoggableType";
import { getIsRedAlliance } from "../../shared/log/LogUtil";
import TabType from "../../shared/TabType";
import { convert } from "../../shared/units";
import OdometryVisualizer from "../../shared/visualizers/OdometryVisualizer";
import TimelineVizController from "./TimelineVizController";

export default class OdometryController extends TimelineVizController {
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

  private TRAIL_LENGTH_SECS = 5;
  private lastUnitDistance = "meters";
  private lastOptions: { [id: string]: any } | null = null;

  constructor(content: HTMLElement) {
    let configBody = content.getElementsByClassName("timeline-viz-config")[0].firstElementChild as HTMLElement;
    super(
      content,
      TabType.Odometry,
      [],
      [
        {
          element: configBody.children[1].firstElementChild as HTMLElement,
          types: [LoggableType.NumberArray],
          options: [
            ["Robot", "Ghost", "Trajectory", "Vision Target", "Arrow (Front)", "Arrow (Center)", "Arrow (Back)"]
          ]
        }
      ],
      new OdometryVisualizer(content.getElementsByClassName("odometry-canvas-container")[0] as HTMLElement)
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

    // Unit conversion for distance
    this.UNIT_DISTANCE.addEventListener("change", () => {
      let newUnit = this.UNIT_DISTANCE.value;
      if (newUnit != this.lastUnitDistance) {
        let oldSize = Number(this.SIZE.value);
        if (newUnit == "meters") {
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
      let config = window.frcData?.field2ds.find((game) => game.title == this.GAME.value);
      this.GAME_SOURCE_LINK.hidden = config != undefined && config.sourceUrl == undefined;
    });
    this.GAME_SOURCE_LINK.addEventListener("click", () => {
      window.sendMainMessage(
        "open-link",
        window.frcData?.field2ds.find((game) => game.title == this.GAME.value)?.sourceUrl
      );
    });

    // Enforce side length range
    this.SIZE.addEventListener("change", () => {
      if (Number(this.SIZE.value) < 0) this.SIZE.value = "0.1";
      if (Number(this.SIZE.value) == 0) this.SIZE.value = "0.1";
    });
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
    this.lastOptions = options;
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

    // Set whether source link is hidden
    let fieldConfig = window.frcData?.field2ds.find((game) => game.title == this.GAME.value);
    this.GAME_SOURCE_LINK.hidden = fieldConfig != undefined && fieldConfig.sourceUrl == undefined;
  }

  getCommand(time: number) {
    let fields = this.getListFields()[0];

    // Add game options
    if (this.GAME.children.length == 0 && window.frcData) {
      window.frcData.field2ds.forEach((game) => {
        let option = document.createElement("option");
        option.innerText = game.title;
        this.GAME.appendChild(option);
      });
      if (this.lastOptions) this.options = this.lastOptions;
    }

    // Returns the current value for a field
    let getCurrentValue = (key: string): Pose2d[] => {
      let logData = window.log.getNumberArray(key, time, time);
      if (
        logData &&
        logData.timestamps[0] <= time &&
        (logData.values[0].length == 2 || logData.values[0].length % 3 == 0)
      ) {
        let poses: Pose2d[] = [];
        if (logData.values[0].length == 2) {
          poses.push({
            translation: [
              convert(logData.values[0][0], this.UNIT_DISTANCE.value, "meters"),
              convert(logData.values[0][1], this.UNIT_DISTANCE.value, "meters")
            ],
            rotation: 0
          });
        } else {
          for (let i = 0; i < logData.values[0].length; i += 3) {
            poses.push({
              translation: [
                convert(logData.values[0][i], this.UNIT_DISTANCE.value, "meters"),
                convert(logData.values[0][i + 1], this.UNIT_DISTANCE.value, "meters")
              ],
              rotation: convert(logData.values[0][i + 2], this.UNIT_ROTATION.value, "radians")
            });
          }
        }
        return poses;
      } else {
      }
      return [];
    };

    // Get data
    let robotData: Pose2d[] = [];
    let trailData: Translation2d[][] = [];
    let ghostData: Pose2d[] = [];
    let trajectoryData: Pose2d[][] = [];
    let visionTargetData: Pose2d[] = [];
    let arrowFrontData: Pose2d[] = [];
    let arrowCenterData: Pose2d[] = [];
    let arrowBackData: Pose2d[] = [];
    fields.forEach((field) => {
      switch (field.type) {
        case "Robot":
          let currentRobotData = getCurrentValue(field.key);
          robotData = robotData.concat(currentRobotData);

          // Get trails
          let trailsTemp: Translation2d[][] = currentRobotData.map(() => []);
          let trailLogData = window.log.getNumberArray(
            field.key,
            time - this.TRAIL_LENGTH_SECS,
            time + this.TRAIL_LENGTH_SECS
          );
          if (trailLogData) {
            if (time - trailLogData.timestamps[0] > this.TRAIL_LENGTH_SECS) {
              trailLogData.timestamps.shift();
              trailLogData.values.shift();
            }
            if (trailLogData.timestamps[trailLogData.timestamps.length - 1] - time > this.TRAIL_LENGTH_SECS) {
              trailLogData.timestamps.pop();
              trailLogData.values.pop();
            }
            trailLogData.values.forEach((value) => {
              if (value.length % 3 == 0) {
                for (let i = 0; i < value.length / 3; i += 1) {
                  if (i >= trailsTemp.length) continue;
                  trailsTemp[i].push([
                    convert(value[i * 3], this.UNIT_DISTANCE.value, "meters"),
                    convert(value[i * 3 + 1], this.UNIT_DISTANCE.value, "meters")
                  ]);
                }
              }
            });
          }
          trailData = trailData.concat(trailsTemp);
          break;
        case "Ghost":
          ghostData = ghostData.concat(getCurrentValue(field.key));
          break;
        case "Trajectory":
          trajectoryData.push(getCurrentValue(field.key));
          break;
        case "Vision Target":
          visionTargetData = visionTargetData.concat(getCurrentValue(field.key));
          break;
        case "Arrow (Front)":
          arrowFrontData = arrowFrontData.concat(getCurrentValue(field.key));
          break;
        case "Arrow (Center)":
          arrowCenterData = arrowCenterData.concat(getCurrentValue(field.key));
          break;
        case "Arrow (Back)":
          arrowBackData = arrowBackData.concat(getCurrentValue(field.key));
          break;
      }
    });

    // Get alliance colors
    let allianceRedBumpers = false;
    let allianceRedOrigin = false;
    let autoRedAlliance = getIsRedAlliance(window.log);
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

    // Package command data
    return {
      poses: {
        robot: robotData,
        trail: trailData,
        ghost: ghostData,
        trajectory: trajectoryData,
        visionTarget: visionTargetData,
        arrowFront: arrowFrontData,
        arrowCenter: arrowCenterData,
        arrowBack: arrowBackData
      },
      options: this.options,
      allianceRedBumpers: allianceRedBumpers,
      allianceRedOrigin: allianceRedOrigin
    };
  }
}
