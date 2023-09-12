import {
  AprilTag,
  logReadNumberArrayToPose2dArray,
  logReadNumberArrayToPose3dArray,
  logReadPose2d,
  logReadPose2dArray,
  logReadPose3d,
  logReadPose3dArray,
  logReadTrajectoryToPose2dArray,
  logReadTranslation2dArrayToPose2dArray,
  logReadTranslation2dToPose2d,
  logReadTranslation3dArrayToPose3dArray,
  logReadTranslation3dToPose3d,
  pose2dArrayTo3d,
  pose2dTo3d,
  Pose3d
} from "../../shared/geometry";
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
  private TRAJECTORY_MAX_LENGTH = 40;
  private static POSE_3D_TYPES = [
    "Robot",
    "Green Ghost",
    "Yellow Ghost",
    "AprilTag",
    "AprilTag ID",
    "Camera Override",
    "Component (Robot)",
    "Component (Green Ghost)",
    "Component (Yellow Ghost)",
    "Vision Target",
    "Axes",
    "Blue Cone (Front)",
    "Blue Cone (Center)",
    "Blue Cone (Back)",
    "Yellow Cone (Front)",
    "Yellow Cone (Center)",
    "Yellow Cone (Back)"
  ];
  private static POSE_2D_TYPES = [
    "Robot",
    "Green Ghost",
    "Yellow Ghost",
    "Trajectory",
    "Vision Target",
    "Blue Cone (Front)",
    "Blue Cone (Center)",
    "Blue Cone (Back)",
    "Yellow Cone (Front)",
    "Yellow Cone (Center)",
    "Yellow Cone (Back)"
  ];

  private FIELD: HTMLSelectElement;
  private ALLIANCE: HTMLSelectElement;
  private FIELD_SOURCE_LINK: HTMLInputElement;
  private ROBOT: HTMLSelectElement;
  private ROBOT_SOURCE_LINK: HTMLInputElement;
  private UNIT_DISTANCE: HTMLInputElement;
  private UNIT_ROTATION: HTMLInputElement;

  private lastCameraIndex = -1;
  private lastFov = 50;

  constructor(content: HTMLElement) {
    let configBody = content.getElementsByClassName("timeline-viz-config")[0].firstElementChild as HTMLElement;
    super(
      content,
      TabType.ThreeDimension,
      [],
      [
        {
          element: configBody.children[1].children[0] as HTMLElement,
          types: [
            LoggableType.NumberArray,
            "Pose3d",
            "Pose3d[]",
            "Transform3d",
            "Transform3d[]",
            "Translation3d",
            "Translation3d[]"
          ],
          options: [
            ThreeDimensionController.POSE_3D_TYPES, // NumberArray
            ThreeDimensionController.POSE_3D_TYPES.filter((x) => x !== "AprilTag ID"), // Pose3d
            ThreeDimensionController.POSE_3D_TYPES.filter((x) => x !== "AprilTag ID" && x !== "Camera Override"), // Pose3d[]
            ThreeDimensionController.POSE_3D_TYPES.filter((x) => x !== "AprilTag ID"), // Transform3d
            ThreeDimensionController.POSE_3D_TYPES.filter((x) => x !== "AprilTag ID" && x !== "Camera Override"), // Transform3d[]
            ["Vision Target"], // Translation3d
            ["Vision Target"] // Translation3d[]
          ]
        },
        {
          element: configBody.children[1].children[1] as HTMLElement,
          types: [
            LoggableType.NumberArray,
            "Pose2d",
            "Pose2d[]",
            "Transform2d",
            "Transform2d[]",
            "Translation2d",
            "Translation2d[]",
            "Trajectory",
            "Mechanism2d"
          ],
          options: [
            ThreeDimensionController.POSE_2D_TYPES, // NumberArray
            ThreeDimensionController.POSE_2D_TYPES.filter((x) => x !== "Trajectory"), // Pose2d
            ThreeDimensionController.POSE_2D_TYPES, // Pose2d[]
            ThreeDimensionController.POSE_2D_TYPES.filter((x) => x !== "Trajectory"), // Transform2d
            ThreeDimensionController.POSE_2D_TYPES, // Transform2d[]
            ["Vision Target"], // Translation2d
            ["Trajectory", "Vision Target"], // Translation2d[]
            ["Trajectory"], // Trajectory
            ["Mechanism (Robot)", "Mechanism (Green Ghost)", "Mechanism (Yellow Ghost)"] // Mechanism2d
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
        window.assets?.field3ds.find((field) => field.name === this.FIELD.value)?.sourceUrl
      );
    });
    this.ROBOT.addEventListener("change", () => this.updateFieldRobotExtraControls());
    this.ROBOT_SOURCE_LINK.addEventListener("click", () => {
      window.sendMainMessage(
        "open-link",
        window.assets?.robots.find((robot) => robot.name === this.ROBOT.value)?.sourceUrl
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
        options = [...window.assets.field3ds.map((game) => game.name), "Evergreen", "Axes"];
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
    let fieldConfig = window.assets?.field3ds.find((game) => game.name === this.FIELD.value);
    this.FIELD_SOURCE_LINK.hidden = fieldConfig === undefined || fieldConfig.sourceUrl === undefined;
    if (this.FIELD.value === "Axes") this.ALLIANCE.value = "blue";
    this.ALLIANCE.hidden = this.FIELD.value === "Axes";

    let robotConfig = window.assets?.robots.find((game) => game.name === this.ROBOT.value);
    this.ROBOT_SOURCE_LINK.hidden = robotConfig !== undefined && robotConfig.sourceUrl === undefined;
  }

  get options(): { [id: string]: any } {
    return {
      field: this.FIELD.value,
      alliance: this.ALLIANCE.value,
      robot: this.ROBOT.value,
      unitDistance: this.UNIT_DISTANCE.value,
      unitRotation: this.UNIT_ROTATION.value,
      cameraIndex: this.lastCameraIndex,
      fov: this.lastFov
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
    this.set3DCamera(options.cameraIndex);
    this.setFov(options.fov);
  }

  newAssets() {
    this.resetFieldRobotOptions();
  }

  /** Switches the selected camera for the main visualizer. */
  set3DCamera(index: number) {
    this.lastCameraIndex = index;
    (this.visualizer as ThreeDimensionVisualizer).set3DCamera(index);
  }

  /** Switches the orbit FOV for the main visualizer. */
  setFov(fov: number) {
    this.lastFov = fov;
    (this.visualizer as ThreeDimensionVisualizer).setFov(fov);
  }

  getAdditionalActiveFields(): string[] {
    if (this.ALLIANCE.value === "auto") {
      return ALLIANCE_KEYS;
    } else {
      return [];
    }
  }

  getCommand(time: number) {
    const distanceConversion = convert(1, this.UNIT_DISTANCE.value, "meters");
    const rotationConversion = convert(1, this.UNIT_ROTATION.value, "meters");

    // Returns the current value for a 3D field
    let get3DValue = (key: string, type: LoggableType | string): Pose3d[] => {
      if (type === LoggableType.NumberArray) {
        return logReadNumberArrayToPose3dArray(window.log, key, time, distanceConversion);
      } else if (typeof type === "string" && type.endsWith("[]")) {
        return type.startsWith("Translation")
          ? logReadTranslation3dArrayToPose3dArray(window.log, key, time, distanceConversion)
          : logReadPose3dArray(window.log, key, time, distanceConversion);
      } else {
        let pose =
          typeof type === "string" && type.startsWith("Translation")
            ? logReadTranslation3dToPose3d(window.log, key, time, distanceConversion)
            : logReadPose3d(window.log, key, time, distanceConversion);
        return pose === null ? [] : [pose];
      }
    };

    // Returns the current value for a 2D field
    let get2DValue = (key: string, type: LoggableType | string, height = 0): Pose3d[] => {
      if (type === LoggableType.NumberArray) {
        return pose2dArrayTo3d(
          logReadNumberArrayToPose2dArray(window.log, key, time, distanceConversion, rotationConversion),
          height
        );
      } else if (type === "Trajectory") {
        return pose2dArrayTo3d(logReadTrajectoryToPose2dArray(window.log, key, time, distanceConversion), height);
      } else if (typeof type === "string" && type.endsWith("[]")) {
        return pose2dArrayTo3d(
          type.startsWith("Translation")
            ? logReadTranslation2dArrayToPose2dArray(window.log, key, time, distanceConversion)
            : logReadPose2dArray(window.log, key, time, distanceConversion),
          height
        );
      } else {
        let pose =
          typeof type === "string" && type.startsWith("Translation")
            ? logReadTranslation2dToPose2d(window.log, key, time, distanceConversion)
            : logReadPose2d(window.log, key, time, distanceConversion);
        return pose === null ? [] : [pose2dTo3d(pose, height)];
      }
    };

    // Set up data
    let robotData: Pose3d[] = [];
    let greenGhostData: Pose3d[] = [];
    let yellowGhostData: Pose3d[] = [];
    let aprilTagData: AprilTag[] = [];
    let aprilTagPoseData: Pose3d[] = [];
    let aprilTagIdData: number[] = [];
    let cameraOverrideData: Pose3d[] = [];
    let componentRobotData: Pose3d[] = [];
    let componentGreenGhostData: Pose3d[] = [];
    let componentYellowGhostData: Pose3d[] = [];
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
    let mechanismGreenGhostData: MechanismState | null = null;
    let mechanismYellowGhostData: MechanismState | null = null;

    // Get 3D data
    this.getListFields()[0].forEach((field) => {
      switch (field.type) {
        case "Robot":
          robotData = robotData.concat(get3DValue(field.key, field.sourceType));
          break;
        case "Green Ghost":
          greenGhostData = greenGhostData.concat(get3DValue(field.key, field.sourceType));
          break;
        case "Yellow Ghost":
          yellowGhostData = yellowGhostData.concat(get3DValue(field.key, field.sourceType));
          break;
        case "AprilTag":
          aprilTagPoseData = aprilTagPoseData.concat(get3DValue(field.key, field.sourceType));
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
          cameraOverrideData = cameraOverrideData.concat(get3DValue(field.key, field.sourceType));
          break;
        case "Component (Robot)":
          componentRobotData = componentRobotData.concat(get3DValue(field.key, field.sourceType));
          break;
        case "Component (Green Ghost)":
          componentGreenGhostData = componentGreenGhostData.concat(get3DValue(field.key, field.sourceType));
          break;
        case "Component (Yellow Ghost)":
          componentYellowGhostData = componentYellowGhostData.concat(get3DValue(field.key, field.sourceType));
          break;
        case "Vision Target":
          visionTargetData = visionTargetData.concat(get3DValue(field.key, field.sourceType));
          break;
        case "Axes":
          axesData = axesData.concat(get3DValue(field.key, field.sourceType));
          break;
        case "Blue Cone (Front)":
          coneBlueFrontData = coneBlueFrontData.concat(get3DValue(field.key, field.sourceType));
          break;
        case "Blue Cone (Center)":
          coneBlueCenterData = coneBlueCenterData.concat(get3DValue(field.key, field.sourceType));
          break;
        case "Blue Cone (Back)":
          coneBlueBackData = coneBlueBackData.concat(get3DValue(field.key, field.sourceType));
          break;
        case "Yellow Cone (Front)":
          coneYellowFrontData = coneYellowFrontData.concat(get3DValue(field.key, field.sourceType));
          break;
        case "Yellow Cone (Center)":
          coneYellowCenterData = coneYellowCenterData.concat(get3DValue(field.key, field.sourceType));
          break;
        case "Yellow Cone (Back)":
          coneYellowBackData = coneYellowBackData.concat(get3DValue(field.key, field.sourceType));
          break;
      }
    });

    // Get 2D data
    this.getListFields()[1].forEach((field) => {
      switch (field.type) {
        case "Robot":
          robotData = robotData.concat(get2DValue(field.key, field.sourceType));
          break;
        case "Green Ghost":
          greenGhostData = greenGhostData.concat(get2DValue(field.key, field.sourceType));
          break;
        case "Yellow Ghost":
          yellowGhostData = yellowGhostData.concat(get2DValue(field.key, field.sourceType));
          break;
        case "Trajectory":
          trajectoryData.push(get2DValue(field.key, field.sourceType, 0.02)); // Render outside the floor
          break;
        case "Vision Target":
          visionTargetData = visionTargetData.concat(get2DValue(field.key, field.sourceType, 0.75));
          break;
        case "Blue Cone (Front)":
          coneBlueFrontData = coneBlueFrontData.concat(get2DValue(field.key, field.sourceType));
          break;
        case "Blue Cone (Center)":
          coneBlueCenterData = coneBlueCenterData.concat(get2DValue(field.key, field.sourceType));
          break;
        case "Blue Cone (Back)":
          coneBlueBackData = coneBlueBackData.concat(get2DValue(field.key, field.sourceType));
          break;
        case "Yellow Cone (Front)":
          coneYellowFrontData = coneYellowFrontData.concat(get2DValue(field.key, field.sourceType));
          break;
        case "Yellow Cone (Center)":
          coneYellowCenterData = coneYellowCenterData.concat(get2DValue(field.key, field.sourceType));
          break;
        case "Yellow Cone (Back)":
          coneYellowBackData = coneYellowBackData.concat(get2DValue(field.key, field.sourceType));
          break;
        case "Mechanism (Robot)":
          {
            let mechanismState = getMechanismState(window.log, field.key, time);
            if (mechanismState) {
              if (mechanismRobotData === null) {
                mechanismRobotData = mechanismState;
              } else {
                mechanismRobotData = mergeMechanismStates([mechanismRobotData, mechanismState]);
              }
            }
          }
          break;
        case "Mechanism (Green Ghost)":
          {
            let mechanismState = getMechanismState(window.log, field.key, time);
            if (mechanismState) {
              if (mechanismGreenGhostData === null) {
                mechanismGreenGhostData = mechanismState;
              } else {
                mechanismGreenGhostData = mergeMechanismStates([mechanismGreenGhostData, mechanismState]);
              }
            }
          }
          break;
        case "Mechanism (Yellow Ghost)":
          {
            let mechanismState = getMechanismState(window.log, field.key, time);
            if (mechanismState) {
              if (mechanismYellowGhostData === null) {
                mechanismYellowGhostData = mechanismState;
              } else {
                mechanismYellowGhostData = mergeMechanismStates([mechanismYellowGhostData, mechanismState]);
              }
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

    // Clean up trajectories (filter empty & resample)
    trajectoryData = trajectoryData.filter((trajectory) => trajectory.length > 0);
    trajectoryData = trajectoryData.map((trajectory) => {
      if (trajectory.length < this.TRAJECTORY_MAX_LENGTH) {
        return trajectory;
      } else {
        let newTrajectory: Pose3d[] = [];
        let lastSourceIndex = -1;
        for (let i = 0; i < this.TRAJECTORY_MAX_LENGTH; i++) {
          let sourceIndex = Math.round((i / (this.TRAJECTORY_MAX_LENGTH - 1)) * (trajectory.length - 1));
          if (sourceIndex !== lastSourceIndex) {
            lastSourceIndex = sourceIndex;
            newTrajectory.push(trajectory[sourceIndex]);
          }
        }
        return newTrajectory;
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
        greenGhost: greenGhostData,
        yellowGhost: yellowGhostData,
        aprilTag: aprilTagData,
        cameraOverride: cameraOverrideData,
        componentRobot: componentRobotData,
        componentGreenGhost: componentGreenGhostData,
        componentYellowGhost: componentYellowGhostData,
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
        mechanismGreenGhost: mechanismGreenGhostData,
        mechanismYellowGhost: mechanismYellowGhostData
      },
      options: this.options,
      allianceRedOrigin: allianceRedOrigin
    };
  }
}
