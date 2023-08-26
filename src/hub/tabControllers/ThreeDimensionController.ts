import { AprilTag, pose2dTo3d, Pose3d } from "../../shared/geometry";
import LoggableType from "../../shared/log/LoggableType";
import {
  ALLIANCE_KEYS,
  getIsRedAlliance,
  getMechanismState,
  MechanismState,
  mergeMechanismStates
} from "../../shared/log/LogUtil";
import TabType from "../../shared/TabType";
import { convert } from "../../shared/units";
import { cleanFloat } from "../../shared/util";
import ThreeDimensionVisualizer from "../../shared/visualizers/ThreeDimensionVisualizer";
import TimelineVizController from "./TimelineVizController";

export default class ThreeDimensionController extends TimelineVizController {
  private FIELD: HTMLSelectElement;
  private ALLIANCE: HTMLSelectElement;
  private FIELD_SOURCE_LINK: HTMLInputElement;
  private ROBOT: HTMLSelectElement;
  private ROBOT_SOURCE_LINK: HTMLInputElement;
  private UNIT_DISTANCE: HTMLInputElement;
  private UNIT_ROTATION: HTMLInputElement;

  constructor(content: HTMLElement) {
    let configBody = content.getElementsByClassName("timeline-viz-config")[0].firstElementChild as HTMLElement;
    super(
      content,
      TabType.ThreeDimension,
      [],
      [
        {
          element: configBody.children[1].children[0] as HTMLElement,
          types: [LoggableType.NumberArray],
          options: [
            [
              "Robot",
              "Ghost",
              "AprilTag",
              "AprilTag ID",
              "Camera Override",
              "Component (Robot)",
              "Component (Ghost)",
              "Vision Target",
              "Axes",
              "Blue Cone (Front)",
              "Blue Cone (Center)",
              "Blue Cone (Back)",
              "Yellow Cone (Front)",
              "Yellow Cone (Center)",
              "Yellow Cone (Back)"
            ]
          ]
        },
        {
          element: configBody.children[1].children[1] as HTMLElement,
          types: [LoggableType.NumberArray, "mechanism"],
          options: [
            [
              "Robot",
              "Ghost",
              "Trajectory",
              "Vision Target",
              "Blue Cone (Front)",
              "Blue Cone (Center)",
              "Blue Cone (Back)",
              "Yellow Cone (Front)",
              "Yellow Cone (Center)",
              "Yellow Cone (Back)"
            ],
            ["Mechanism (Robot)", "Mechanism (Ghost)"]
          ]
        }
      ],
      new ThreeDimensionVisualizer(
        content,
        content.getElementsByClassName("three-dimension-canvas")[0] as HTMLCanvasElement,
        content.getElementsByClassName("three-dimension-alert")[0] as HTMLElement
      )
    );

    // Get option inputs
    this.FIELD = configBody.children[1].children[2].children[1] as HTMLSelectElement;
    this.ALLIANCE = configBody.children[1].children[2].children[2] as HTMLSelectElement;
    this.FIELD_SOURCE_LINK = configBody.children[1].children[2].children[3] as HTMLInputElement;
    this.ROBOT = configBody.children[2].children[0].children[1] as HTMLSelectElement;
    this.ROBOT_SOURCE_LINK = configBody.children[2].children[0].children[2] as HTMLInputElement;
    this.UNIT_DISTANCE = configBody.children[3].children[0].children[1] as HTMLInputElement;
    this.UNIT_ROTATION = configBody.children[3].children[0].children[2] as HTMLInputElement;

    // Set default alliance value
    this.ALLIANCE.value = "blue";

    // Add initial set of options
    this.resetFieldRobotOptions();

    // Bind source links
    this.FIELD.addEventListener("change", () => this.updateFieldRobotExtraControls());
    this.FIELD_SOURCE_LINK.addEventListener("click", () => {
      window.sendMainMessage(
        "open-link",
        window.assets?.field3ds.find((field) => field.name == this.FIELD.value)?.sourceUrl
      );
    });
    this.ROBOT.addEventListener("change", () => this.updateFieldRobotExtraControls());
    this.ROBOT_SOURCE_LINK.addEventListener("click", () => {
      window.sendMainMessage(
        "open-link",
        window.assets?.robots.find((robot) => robot.name == this.ROBOT.value)?.sourceUrl
      );
    });
  }

  /** Clears all options from the field and robot selectors then updates them with the latest options. */
  private resetFieldRobotOptions() {
    {
      let value = this.FIELD.value;
      while (this.FIELD.firstChild) {
        this.FIELD.removeChild(this.FIELD.firstChild);
      }
      let options: string[] = [];
      if (window.assets !== null) {
        options = [...window.assets.field3ds.map((game) => game.name), "Axes"];
        options.forEach((title) => {
          let option = document.createElement("option");
          option.innerText = title;
          this.FIELD.appendChild(option);
        });
      }
      if (options.includes(value)) {
        this.FIELD.value = value;
      } else {
        this.FIELD.value = options[0];
      }
    }
    {
      let value = this.ROBOT.value;
      while (this.ROBOT.firstChild) {
        this.ROBOT.removeChild(this.ROBOT.firstChild);
      }
      let options: string[] = [];
      if (window.assets !== null) {
        options = window.assets.robots.map((robot) => robot.name);
        options.forEach((title) => {
          let option = document.createElement("option");
          option.innerText = title;
          this.ROBOT.appendChild(option);
        });
      }
      if (options.includes(value)) {
        this.ROBOT.value = value;
      } else {
        this.ROBOT.value = options[0];
      }
    }
    this.updateFieldRobotExtraControls();
  }

  /** Updates the alliance and source buttons based on the selected value. */
  private updateFieldRobotExtraControls() {
    let fieldConfig = window.assets?.field3ds.find((game) => game.name == this.FIELD.value);
    this.FIELD_SOURCE_LINK.hidden = fieldConfig == undefined || fieldConfig.sourceUrl == undefined;
    if (this.FIELD.value === "Axes") this.ALLIANCE.value = "blue";
    this.ALLIANCE.hidden = this.FIELD.value === "Axes";

    let robotConfig = window.assets?.robots.find((game) => game.name == this.ROBOT.value);
    this.ROBOT_SOURCE_LINK.hidden = robotConfig != undefined && robotConfig.sourceUrl == undefined;
  }

  get options(): { [id: string]: any } {
    return {
      field: this.FIELD.value,
      alliance: this.ALLIANCE.value,
      robot: this.ROBOT.value,
      unitDistance: this.UNIT_DISTANCE.value,
      unitRotation: this.UNIT_ROTATION.value
    };
  }

  set options(options: { [id: string]: any }) {
    this.resetFieldRobotOptions(); // Cannot set field and robot values without options
    this.FIELD.value = options.field;
    this.ALLIANCE.value = options.alliance;
    this.ROBOT.value = options.robot;
    this.UNIT_DISTANCE.value = options.unitDistance;
    this.UNIT_ROTATION.value = options.unitRotation;
    this.updateFieldRobotExtraControls();
  }

  newAssets() {
    this.resetFieldRobotOptions();
  }

  /** Switches the selected camera for the main visualizer. */
  set3DCamera(index: number) {
    (this.visualizer as ThreeDimensionVisualizer).set3DCamera(index);
  }

  getAdditionalActiveFields(): string[] {
    if (this.ALLIANCE.value === "auto") {
      return ALLIANCE_KEYS;
    } else {
      return [];
    }
  }

  getCommand(time: number) {
    // Returns the current value for a 3D field
    let get3DValue = (key: string): Pose3d[] => {
      let logData = window.log.getNumberArray(key, time, time);
      if (logData && logData.timestamps[0] <= time && logData.values[0].length % 7 == 0) {
        let poses: Pose3d[] = [];
        for (let i = 0; i < logData.values[0].length; i += 7) {
          poses.push({
            translation: [
              convert(logData.values[0][i], this.UNIT_DISTANCE.value, "meters"),
              convert(logData.values[0][i + 1], this.UNIT_DISTANCE.value, "meters"),
              convert(logData.values[0][i + 2], this.UNIT_DISTANCE.value, "meters")
            ],
            rotation: [
              logData.values[0][i + 3],
              logData.values[0][i + 4],
              logData.values[0][i + 5],
              logData.values[0][i + 6]
            ]
          });
        }
        return poses;
      }
      return [];
    };

    // Returns the current value for a 2D field
    let get2DValue = (key: string, height: number = 0): Pose3d[] => {
      let logData = window.log.getNumberArray(key, time, time);
      if (
        logData &&
        logData.timestamps[0] <= time &&
        (logData.values[0].length == 2 || logData.values[0].length % 3 == 0)
      ) {
        let poses: Pose3d[] = [];
        if (logData.values[0].length == 2) {
          poses.push(
            pose2dTo3d(
              {
                translation: [
                  convert(logData.values[0][0], this.UNIT_DISTANCE.value, "meters"),
                  convert(logData.values[0][1], this.UNIT_DISTANCE.value, "meters")
                ],
                rotation: 0
              },
              height
            )
          );
        } else {
          for (let i = 0; i < logData.values[0].length; i += 3) {
            poses.push(
              pose2dTo3d(
                {
                  translation: [
                    convert(logData.values[0][i], this.UNIT_DISTANCE.value, "meters"),
                    convert(logData.values[0][i + 1], this.UNIT_DISTANCE.value, "meters")
                  ],
                  rotation: convert(logData.values[0][i + 2], this.UNIT_ROTATION.value, "radians")
                },
                height
              )
            );
          }
        }
        return poses;
      }
      return [];
    };

    // Set up data
    let robotData: Pose3d[] = [];
    let ghostData: Pose3d[] = [];
    let aprilTagData: AprilTag[] = [];
    let aprilTagPoseData: Pose3d[] = [];
    let aprilTagIdData: number[] = [];
    let cameraOverrideData: Pose3d[] = [];
    let componentRobotData: Pose3d[] = [];
    let componentGhostData: Pose3d[] = [];
    let trajectoryData: Pose3d[][] = [];
    let visionTargetData: Pose3d[] = [];
    let axesData: Pose3d[] = [];
    let coneBlueFrontData: Pose3d[] = [];
    let coneBlueCenterData: Pose3d[] = [];
    let coneBlueBackData: Pose3d[] = [];
    let coneYellowFrontData: Pose3d[] = [];
    let coneYellowCenterData: Pose3d[] = [];
    let coneYellowBackData: Pose3d[] = [];
    let mechanismRobotData: MechanismState | null = null;
    let mechanismGhostData: MechanismState | null = null;

    // Get 3D data
    this.getListFields()[0].forEach((field) => {
      switch (field.type) {
        case "Robot":
          robotData = robotData.concat(get3DValue(field.key));
          break;
        case "Ghost":
          ghostData = ghostData.concat(get3DValue(field.key));
          break;
        case "AprilTag":
          aprilTagPoseData = aprilTagPoseData.concat(get3DValue(field.key));
          break;
        case "AprilTag ID":
          let logData = window.log.getNumberArray(field.key, time, time);
          if (logData && logData.timestamps[0] <= time) {
            for (let i = 0; i < logData.values[0].length; i += 1) {
              aprilTagIdData.push(logData.values[0][i]);
            }
          }
          break;
        case "Camera Override":
          cameraOverrideData = cameraOverrideData.concat(get3DValue(field.key));
          break;
        case "Component (Robot)":
          componentRobotData = componentRobotData.concat(get3DValue(field.key));
          break;
        case "Component (Ghost)":
          componentGhostData = componentGhostData.concat(get3DValue(field.key));
          break;
        case "Vision Target":
          visionTargetData = visionTargetData.concat(get3DValue(field.key));
          break;
        case "Axes":
          axesData = axesData.concat(get3DValue(field.key));
          break;
        case "Blue Cone (Front)":
          coneBlueFrontData = coneBlueFrontData.concat(get3DValue(field.key));
          break;
        case "Blue Cone (Center)":
          coneBlueCenterData = coneBlueCenterData.concat(get3DValue(field.key));
          break;
        case "Blue Cone (Back)":
          coneBlueBackData = coneBlueBackData.concat(get3DValue(field.key));
          break;
        case "Yellow Cone (Front)":
          coneYellowFrontData = coneYellowFrontData.concat(get3DValue(field.key));
          break;
        case "Yellow Cone (Center)":
          coneYellowCenterData = coneYellowCenterData.concat(get3DValue(field.key));
          break;
        case "Yellow Cone (Back)":
          coneYellowBackData = coneYellowBackData.concat(get3DValue(field.key));
          break;
      }
    });

    // Get 2D data
    this.getListFields()[1].forEach((field) => {
      switch (field.type) {
        case "Robot":
          robotData = robotData.concat(get2DValue(field.key));
          break;
        case "Ghost":
          ghostData = ghostData.concat(get2DValue(field.key));
          break;
        case "Trajectory":
          trajectoryData.push(get2DValue(field.key, 0.02)); // Render outside the floor
          break;
        case "Vision Target":
          visionTargetData = visionTargetData.concat(get2DValue(field.key, 0.75));
          break;
        case "Blue Cone (Front)":
          coneBlueFrontData = coneBlueFrontData.concat(get2DValue(field.key));
          break;
        case "Blue Cone (Center)":
          coneBlueCenterData = coneBlueCenterData.concat(get2DValue(field.key));
          break;
        case "Blue Cone (Back)":
          coneBlueBackData = coneBlueBackData.concat(get2DValue(field.key));
          break;
        case "Yellow Cone (Front)":
          coneYellowFrontData = coneYellowFrontData.concat(get2DValue(field.key));
          break;
        case "Yellow Cone (Center)":
          coneYellowCenterData = coneYellowCenterData.concat(get2DValue(field.key));
          break;
        case "Yellow Cone (Back)":
          coneYellowBackData = coneYellowBackData.concat(get2DValue(field.key));
          break;
        case "Mechanism (Robot)":
          let mechanismRobotState = getMechanismState(window.log, field.key, time);
          if (mechanismRobotState) {
            if (mechanismRobotData === null) {
              mechanismRobotData = mechanismRobotState;
            } else {
              mechanismRobotData = mergeMechanismStates([mechanismRobotData, mechanismRobotState]);
            }
          }
          break;
        case "Mechanism (Ghost)":
          let mechanismGhostState = getMechanismState(window.log, field.key, time);
          if (mechanismGhostState) {
            if (mechanismGhostData === null) {
              mechanismGhostData = mechanismGhostState;
            } else {
              mechanismGhostData = mergeMechanismStates([mechanismGhostData, mechanismGhostState]);
            }
          }
          break;
      }
    });

    // Combine AprilTag data
    aprilTagData = aprilTagPoseData.map((pose) => {
      return {
        id: null,
        pose: pose
      };
    });
    aprilTagIdData.forEach((id, index) => {
      if (index < aprilTagData.length) {
        let cleanId = cleanFloat(id);
        if (cleanId >= 0 && cleanId <= 29) {
          aprilTagData[index].id = cleanId;
        }
      }
    });

    // Get origin location
    let allianceRedOrigin = false;
    switch (this.ALLIANCE.value) {
      case "auto":
        allianceRedOrigin = getIsRedAlliance(window.log);
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
        ghost: ghostData,
        aprilTag: aprilTagData,
        cameraOverride: cameraOverrideData,
        componentRobot: componentRobotData,
        componentGhost: componentGhostData,
        trajectory: trajectoryData,
        visionTarget: visionTargetData,
        axes: axesData,
        coneBlueFront: coneBlueFrontData,
        coneBlueCenter: coneBlueCenterData,
        coneBlueBack: coneBlueBackData,
        coneYellowFront: coneYellowFrontData,
        coneYellowCenter: coneYellowCenterData,
        coneYellowBack: coneYellowBackData,
        mechanismRobot: mechanismRobotData,
        mechanismGhost: mechanismGhostData
      },
      options: this.options,
      allianceRedOrigin: allianceRedOrigin
    };
  }
}
