import {
  APRIL_TAG_16H5_COUNT,
  APRIL_TAG_36H11_COUNT,
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
  Pose3d,
  rotation2dTo3d,
  rotation3dTo2d,
  Translation2d
} from "../../shared/geometry";
import LoggableType from "../../shared/log/LoggableType";
import {
  ALLIANCE_KEYS,
  getDriverStation,
  getIsRedAlliance,
  getMechanismState,
  getOrDefault,
  MechanismState,
  mergeMechanismStates
} from "../../shared/log/LogUtil";
import TabType from "../../shared/TabType";
import { convert } from "../../shared/units";
import { cleanFloat, scaleValue } from "../../shared/util";
import ThreeDimensionVisualizer from "../../shared/visualizers/ThreeDimensionVisualizer";
import ThreeDimensionVisualizerSwitching from "../../shared/visualizers/ThreeDimensionVisualizerSwitching";
import TimelineVizController from "./TimelineVizController";

export default class ThreeDimensionController extends TimelineVizController {
  private TRAJECTORY_MAX_LENGTH = 40;
  private static POSE_3D_TYPES = [
    "Robot",
    ...ThreeDimensionVisualizer.GHOST_COLORS.map((color) => color + " Ghost"),
    "Camera Override",
    "Component (Robot)",
    "Component (Ghost)",
    "Game Piece 0",
    "Game Piece 1",
    "Game Piece 2",
    "Game Piece 3",
    "Game Piece 4",
    "Game Piece 5",
    "Trajectory",
    "Vision Target",
    "Axes",
    "AprilTag 36h11",
    "AprilTag 36h11 ID",
    "AprilTag 16h5",
    "AprilTag 16h5 ID",
    "Blue Cone (Front)",
    "Blue Cone (Center)",
    "Blue Cone (Back)",
    "Yellow Cone (Front)",
    "Yellow Cone (Center)",
    "Yellow Cone (Back)"
  ];
  private static APRIL_TAG_TYPES = [
    "AprilTag 36h11",
    "AprilTag 16h5",
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
    ...ThreeDimensionVisualizer.GHOST_COLORS.map((color) => color + " Ghost"),
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

  private newAssetsCounter = 0;

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
            "Translation3d[]",
            "AprilTag",
            "AprilTag[]"
          ],
          options: [
            ThreeDimensionController.POSE_3D_TYPES, // NumberArray
            ThreeDimensionController.POSE_3D_TYPES.filter((x) => !x.endsWith("ID") && x !== "Trajectory"), // Pose3d
            ThreeDimensionController.POSE_3D_TYPES.filter((x) => !x.endsWith("ID") && x !== "Camera Override"), // Pose3d[]
            ThreeDimensionController.POSE_3D_TYPES.filter((x) => !x.endsWith("ID") && x !== "Trajectory"), // Transform3d
            ThreeDimensionController.POSE_3D_TYPES.filter((x) => !x.endsWith("ID") && x !== "Camera Override"), // Transform3d[]
            ["Vision Target"], // Translation3d
            ["Trajectory", "Vision Target"], // Translation3d[]
            ThreeDimensionController.APRIL_TAG_TYPES, // AprilTag
            ThreeDimensionController.APRIL_TAG_TYPES // AprilTag[]
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
            "Mechanism2d",
            "ZebraTranslation"
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
            ["Mechanism (Robot)", "Mechanism (Ghost)"], // Mechanism2d
            ["Zebra Marker", ...ThreeDimensionVisualizer.GHOST_COLORS.map((color) => color + " Ghost")] // ZebraTranslation
          ],
          autoAdvanceOptions: [true, true, true, true, true, true, true, true, true, false]
        }
      ],
      new ThreeDimensionVisualizerSwitching(
        content,
        content.getElementsByClassName("three-dimension-canvas")[0] as HTMLCanvasElement,
        content.getElementsByClassName("three-dimension-annotations")[0] as HTMLElement,
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
    this.ALLIANCE.value = "auto";

    // Add initial set of options
    this.resetFieldRobotOptions();

    // Bind source links
    this.FIELD.addEventListener("change", () => this.updateFieldRobotDependentControls());
    this.FIELD_SOURCE_LINK.addEventListener("click", () => {
      window.sendMainMessage(
        "open-link",
        window.assets?.field3ds.find((field) => field.name === this.FIELD.value)?.sourceUrl
      );
    });
    this.ROBOT.addEventListener("change", () => this.updateFieldRobotDependentControls(true));
    this.ROBOT_SOURCE_LINK.addEventListener("click", () => {
      window.sendMainMessage(
        "open-link",
        window.assets?.robots.find((robot) => robot.name === this.ROBOT.value)?.sourceUrl
      );
    });
  }

  /** Clears all options from the field and robot selectors then updates them with the latest options. */
  private resetFieldRobotOptions() {
    let fieldChanged = false;
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
      fieldChanged = this.FIELD.value !== value;
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
    this.updateFieldRobotDependentControls(!fieldChanged);
  }

  /** Updates the alliance chooser, source buttons, and game piece names based on the selected value. */
  private updateFieldRobotDependentControls(skipAllianceReset = false) {
    let fieldConfig = window.assets?.field3ds.find((game) => game.name === this.FIELD.value);
    this.FIELD_SOURCE_LINK.hidden = fieldConfig === undefined || fieldConfig.sourceUrl === undefined;
    let robotConfig = window.assets?.robots.find((game) => game.name === this.ROBOT.value);
    this.ROBOT_SOURCE_LINK.hidden = robotConfig !== undefined && robotConfig.sourceUrl === undefined;

    if (this.FIELD.value === "Axes") this.ALLIANCE.value = "blue";
    this.ALLIANCE.hidden = this.FIELD.value === "Axes";
    if (fieldConfig !== undefined && !skipAllianceReset) {
      this.ALLIANCE.value = fieldConfig.defaultOrigin;
    }

    let aliases: { [key: string]: string | null } = {
      "Game Piece 0": null,
      "Game Piece 1": null,
      "Game Piece 2": null,
      "Game Piece 3": null,
      "Game Piece 4": null,
      "Game Piece 5": null
    };
    if (fieldConfig !== undefined) {
      fieldConfig.gamePieces.forEach((gamePiece, index) => {
        aliases["Game Piece " + index.toString()] = gamePiece.name;
      });
    }
    this.setListOptionAliases(aliases);
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
    this.updateFieldRobotDependentControls(true);
  }

  newAssets() {
    this.resetFieldRobotOptions();
    this.newAssetsCounter++;
  }

  /** Switches the selected camera for the main visualizer. */
  set3DCamera(index: number) {
    (this.visualizer as ThreeDimensionVisualizerSwitching).set3DCamera(index);
  }

  /** Switches the orbit FOV for the main visualizer. */
  setFov(fov: number) {
    (this.visualizer as ThreeDimensionVisualizerSwitching).setFov(fov);
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
    const rotationConversion = convert(1, this.UNIT_ROTATION.value, "radians");

    // Returns the current value for a 3D field
    let get3DValue = (key: string, type: LoggableType | string): Pose3d[] => {
      if (type === LoggableType.NumberArray) {
        return logReadNumberArrayToPose3dArray(window.log, key, time, distanceConversion);
      } else if (type === "AprilTag[]") {
        let length = getOrDefault(window.log, key + "/length", LoggableType.Number, time, 0);
        let poses: Pose3d[] = [];
        for (let i = 0; i < length; i++) {
          let pose = logReadPose3d(window.log, key + "/" + i.toString() + "/pose", time, distanceConversion);
          if (pose !== null) {
            poses.push(pose);
          }
        }
        return poses;
      } else if (type === "AprilTag") {
        let pose = logReadPose3d(window.log, key + "/pose", time, distanceConversion);
        return pose === null ? [] : [pose];
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
    let ghostData: { [key: string]: Pose3d[] } = {};
    ThreeDimensionVisualizer.GHOST_COLORS.forEach((color) => (ghostData[color] = []));
    let aprilTag36h11Data: AprilTag[] = [];
    let aprilTag36h11PoseData: Pose3d[] = [];
    let aprilTag36h11IdData: number[] = [];
    let aprilTag16h5Data: AprilTag[] = [];
    let aprilTag16h5PoseData: Pose3d[] = [];
    let aprilTag16h5IdData: number[] = [];
    let cameraOverrideData: Pose3d[] = [];
    let componentRobotData: Pose3d[] = [];
    let componentGhostData: Pose3d[] = [];
    let gamePieceData: Pose3d[][] = [[], [], [], [], [], []];
    let hasUserGamePieces = false;
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
    let zebraMarkerData: { [key: string]: { translation: Translation2d; alliance: string } } = {};
    let zebraGhostDataTranslations: { [key: string]: Translation2d[] } = {};
    ThreeDimensionVisualizer.GHOST_COLORS.forEach((color) => (zebraGhostDataTranslations[color] = []));
    let zebraGhostData: { [key: string]: Pose3d[] } = {};
    ThreeDimensionVisualizer.GHOST_COLORS.forEach((color) => (zebraGhostData[color] = []));

    // Get 3D data
    this.getListFields()[0].forEach((field) => {
      switch (field.type) {
        case "Robot":
          robotData = robotData.concat(get3DValue(field.key, field.sourceType));
          break;
        case "AprilTag 36h11":
        case "AprilTag 16h5":
          if (field.type === "AprilTag 36h11") {
            aprilTag36h11PoseData = aprilTag36h11PoseData.concat(get3DValue(field.key, field.sourceType));
          } else {
            aprilTag16h5PoseData = aprilTag16h5PoseData.concat(get3DValue(field.key, field.sourceType));
          }
          let idData = field.type === "AprilTag 36h11" ? aprilTag36h11IdData : aprilTag16h5IdData;
          if (field.sourceType === "AprilTag") {
            idData.push(getOrDefault(window.log, field.key + "/ID", LoggableType.Number, time, 0));
          } else if (field.sourceType === "AprilTag[]") {
            let length = getOrDefault(window.log, field.key + "/length", LoggableType.Number, time, 0);
            for (let i = 0; i < length; i++) {
              idData.push(
                getOrDefault(window.log, field.key + "/" + i.toString() + "/ID", LoggableType.Number, time, 0)
              );
            }
          }
          break;
        case "AprilTag 36h11 ID":
        case "AprilTag 16h5 ID":
          {
            let idData = field.type === "AprilTag 36h11 ID" ? aprilTag36h11IdData : aprilTag16h5IdData;
            let logData = window.log.getNumberArray(field.key, time, time);
            if (logData && logData.timestamps[0] <= time) {
              for (let i = 0; i < logData.values[0].length; i += 1) {
                idData.push(logData.values[0][i]);
              }
            }
          }
          break;
        case "Camera Override":
          cameraOverrideData = cameraOverrideData.concat(get3DValue(field.key, field.sourceType));
          break;
        case "Component (Robot)":
          componentRobotData = componentRobotData.concat(get3DValue(field.key, field.sourceType));
          break;
        case "Component (Ghost)":
          componentGhostData = componentGhostData.concat(get3DValue(field.key, field.sourceType));
          break;
        case "Game Piece 0":
        case "Game Piece 1":
        case "Game Piece 2":
        case "Game Piece 3":
        case "Game Piece 4":
        case "Game Piece 5":
          let index = Number(field.type[field.type.length - 1]);
          gamePieceData[index] = gamePieceData[index].concat(get3DValue(field.key, field.sourceType));
          hasUserGamePieces = true;
          break;
        case "Trajectory":
          trajectoryData.push(get3DValue(field.key, field.sourceType));
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
        default:
          ThreeDimensionVisualizer.GHOST_COLORS.forEach((color) => {
            if (field.type === color + " Ghost") {
              ghostData[color] = ghostData[color].concat(get3DValue(field.key, field.sourceType));
            }
          });
          break;
      }
    });

    // Get 2D data
    this.getListFields()[1].forEach((field) => {
      switch (field.type) {
        case "Robot":
          robotData = robotData.concat(get2DValue(field.key, field.sourceType));
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
        case "Mechanism (Ghost)":
          {
            let mechanismState = getMechanismState(window.log, field.key, time);
            if (mechanismState) {
              if (mechanismGhostData === null) {
                mechanismGhostData = mechanismState;
              } else {
                mechanismGhostData = mergeMechanismStates([mechanismGhostData, mechanismState]);
              }
            }
          }
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
        default:
          ThreeDimensionVisualizer.GHOST_COLORS.forEach((color) => {
            if (field.type === color + " Ghost") {
              if (field.sourceType !== "ZebraTranslation") {
                ghostData[color] = ghostData[color].concat(get2DValue(field.key, field.sourceType));
              } else {
                let x: number | null = null;
                let y: number | null = null;
                {
                  let xData = window.log.getNumber(field.key + "/x", time, time);
                  if (xData !== undefined && xData.values.length > 0) {
                    if (xData.values.length === 1) {
                      x = xData.values[0];
                    } else {
                      x = scaleValue(
                        time,
                        [xData.timestamps[0], xData.timestamps[1]],
                        [xData.values[0], xData.values[1]]
                      );
                    }
                  }
                }
                {
                  let yData = window.log.getNumber(field.key + "/y", time, time);
                  if (yData !== undefined && yData.values.length > 0) {
                    if (yData.values.length === 1) {
                      y = yData.values[0];
                    } else {
                      y = scaleValue(
                        time,
                        [yData.timestamps[0], yData.timestamps[1]],
                        [yData.values[0], yData.values[1]]
                      );
                    }
                  }
                }
                if (x !== null && y !== null) {
                  zebraGhostDataTranslations[color].push([convert(x, "feet", "meters"), convert(y, "feet", "meters")]);
                }
              }
            }
          });
          break;
      }
    });

    // Combine AprilTag data
    aprilTag36h11Data = aprilTag36h11PoseData.map((pose) => {
      return {
        id: null,
        pose: pose
      };
    });
    aprilTag16h5Data = aprilTag16h5PoseData.map((pose) => {
      return {
        id: null,
        pose: pose
      };
    });
    aprilTag36h11IdData.forEach((id, index) => {
      if (index < aprilTag36h11Data.length) {
        let cleanId = Math.round(cleanFloat(id));
        if (cleanId >= 0 && cleanId < APRIL_TAG_36H11_COUNT) {
          aprilTag36h11Data[index].id = cleanId;
        }
      }
    });
    aprilTag16h5IdData.forEach((id, index) => {
      if (index < aprilTag16h5Data.length) {
        let cleanId = Math.round(cleanFloat(id));
        if (cleanId >= 0 && cleanId < APRIL_TAG_16H5_COUNT) {
          aprilTag16h5Data[index].id = cleanId;
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
        allianceRedOrigin = getIsRedAlliance(window.log, time);
        break;
      case "blue":
        allianceRedOrigin = false;
        break;
      case "red":
        allianceRedOrigin = true;
        break;
    }

    // Apply robot rotation to Zebra ghost translations
    let robotRotation2d = 0;
    if (robotData.length > 0) {
      robotRotation2d = rotation3dTo2d(robotData[0].rotation);
      if (!allianceRedOrigin) {
        // Switch from blue to red origin to match translation
        robotRotation2d += Math.PI;
      }
    }
    let robotRotation3d = rotation2dTo3d(robotRotation2d);
    ThreeDimensionVisualizer.GHOST_COLORS.forEach((color) => {
      zebraGhostDataTranslations[color].forEach((translation) => {
        zebraGhostData[color].push({
          translation: [translation[0], translation[1], 0],
          rotation: robotRotation3d
        });
      });
    });

    // Package command data
    return {
      poses: {
        robot: robotData,
        ghost: ghostData,
        aprilTag36h11: aprilTag36h11Data,
        aprilTag16h5: aprilTag16h5Data,
        cameraOverride: cameraOverrideData,
        componentRobot: componentRobotData,
        componentGhost: componentGhostData,
        gamePiece: gamePieceData,
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
        mechanismGhost: mechanismGhostData,
        zebraMarker: zebraMarkerData,
        zebraGhost: zebraGhostData
      },
      options: this.options,
      allianceRedOrigin: allianceRedOrigin,
      autoDriverStation: getDriverStation(window.log, time),
      newAssetsCounter: this.newAssetsCounter,
      hasUserGamePieces: hasUserGamePieces
    };
  }
}
