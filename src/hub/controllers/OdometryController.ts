import { NeonColors } from "../../shared/Colors";
import { SourceListConfig, SourceListItemState, SourceListState } from "../../shared/SourceListConfig";
import {
  AnnotatedPose2d,
  AnnotatedPose3d,
  Translation2d,
  annotatedPose3dTo2d,
  grabPosesAuto,
  translation3dTo2d
} from "../../shared/geometry";
import { getIsRedAlliance, getOrDefault, getRobotStateRanges } from "../../shared/log/LogUtil";
import LoggableType from "../../shared/log/LoggableType";
import {
  OdometryRendererCommand,
  OdometryRendererCommand_AllObjs,
  Orientation
} from "../../shared/renderers/OdometryRenderer";
import { convert } from "../../shared/units";
import { createUUID } from "../../shared/util";
import SourceList from "../SourceList";
import TabController from "./TabController";

export default class OdometryController implements TabController {
  private static HEATMAP_DT = 0.25;
  private static TRAIL_LENGTH_SECS = 3;
  private static TRAIL_DT = 0.1;

  private UUID = createUUID();
  private BUMPER_SWITCHER: HTMLElement;
  private ORIGIN_SWITCHER: HTMLElement;
  private ORIENTATION_SWITCHER: HTMLElement;
  private SIZE_SWITCHER: HTMLElement;
  private GAME_SELECT: HTMLSelectElement;
  private GAME_SOURCE: HTMLElement;

  private sourceList: SourceList;

  private bumperSetting: "auto" | "blue" | "red" = "auto";
  private originSetting: "auto" | "blue" | "red" = "auto";
  private orientationSetting = Orientation.DEG_0;
  private sizeSetting: 30 | 27 | 24 = 30;

  constructor(root: HTMLElement) {
    this.sourceList = new SourceList(
      root.getElementsByClassName("odometry-sources")[0] as HTMLElement,
      SourcesConfig,
      []
    );
    let settings = root.getElementsByClassName("odometry-settings")[0] as HTMLElement;
    this.BUMPER_SWITCHER = settings.getElementsByClassName("bumper-switcher")[0] as HTMLElement;
    this.ORIGIN_SWITCHER = settings.getElementsByClassName("origin-switcher")[0] as HTMLElement;
    this.ORIENTATION_SWITCHER = settings.getElementsByClassName("orientation-switcher")[0] as HTMLElement;
    this.SIZE_SWITCHER = settings.getElementsByClassName("size-switcher")[0] as HTMLElement;
    this.GAME_SELECT = settings.getElementsByClassName("game-select")[0] as HTMLSelectElement;
    this.GAME_SOURCE = settings.getElementsByClassName("game-source")[0] as HTMLElement;

    // Set up game select
    this.GAME_SELECT.addEventListener("change", () => this.updateGameDependentControls());
    this.GAME_SOURCE.addEventListener("click", () => {
      window.sendMainMessage(
        "open-link",
        window.assets?.field2ds.find((game) => game.name === this.GAME_SELECT.value)?.sourceUrl
      );
    });
    this.updateGameOptions();

    // Set up switchers
    (["auto", "blue", "red"] as const).forEach((value, index) => {
      this.BUMPER_SWITCHER.children[index].addEventListener("click", () => {
        this.bumperSetting = value;
        this.updateSwitchers();
      });
    });
    (["auto", "blue", "red"] as const).forEach((value, index) => {
      this.ORIGIN_SWITCHER.children[index].addEventListener("click", () => {
        this.originSetting = value;
        this.updateSwitchers();
      });
    });
    this.ORIENTATION_SWITCHER.children[0].addEventListener("click", () => {
      this.orientationSetting--;
      if (this.orientationSetting < 0) this.orientationSetting = 3;
    });
    this.ORIENTATION_SWITCHER.children[1].addEventListener("click", () => {
      this.orientationSetting++;
      if (this.orientationSetting > 3) this.orientationSetting = 0;
    });
    ([30, 27, 24] as const).forEach((value, index) => {
      this.SIZE_SWITCHER.children[index].addEventListener("click", () => {
        this.sizeSetting = value;
        this.updateSwitchers();
      });
    });
    this.updateSwitchers();
  }

  /** Updates game select with the latest options. */
  private updateGameOptions() {
    let value = this.GAME_SELECT.value;
    while (this.GAME_SELECT.firstChild) {
      this.GAME_SELECT.removeChild(this.GAME_SELECT.firstChild);
    }
    let options: string[] = [];
    if (window.assets !== null) {
      options = window.assets.field2ds.map((game) => game.name);
      options.forEach((title) => {
        let option = document.createElement("option");
        option.innerText = title;
        this.GAME_SELECT.appendChild(option);
      });
    }
    if (options.includes(value)) {
      this.GAME_SELECT.value = value;
    } else {
      this.GAME_SELECT.value = options[0];
    }
    this.updateGameDependentControls(this.GAME_SELECT.value === value); // Skip origin reset if game is unchanged
  }

  /** Updates the alliance and source buttons based on the selected value. */
  private updateGameDependentControls(skipOriginReset = false) {
    let fieldConfig = window.assets?.field2ds.find((game) => game.name === this.GAME_SELECT.value);
    this.GAME_SOURCE.hidden = fieldConfig !== undefined && fieldConfig.sourceUrl === undefined;

    if (fieldConfig !== undefined && !skipOriginReset) {
      this.originSetting = fieldConfig.defaultOrigin;
      this.updateSwitchers();
    }
  }

  /** Updates the switcher elements to match the internal state. */
  private updateSwitchers() {
    // Bumpers
    {
      let selectedIndex = ["auto", "blue", "red"].indexOf(this.bumperSetting);
      if (selectedIndex === -1) selectedIndex = 0;
      for (let i = 0; i < 3; i++) {
        if (i === selectedIndex) {
          this.BUMPER_SWITCHER.children[i].classList.add("selected");
        } else {
          this.BUMPER_SWITCHER.children[i].classList.remove("selected");
        }
      }
    }

    // Origin
    {
      let selectedIndex = ["auto", "blue", "red"].indexOf(this.originSetting);
      if (selectedIndex === -1) selectedIndex = 0;
      for (let i = 0; i < 3; i++) {
        if (i === selectedIndex) {
          this.ORIGIN_SWITCHER.children[i].classList.add("selected");
        } else {
          this.ORIGIN_SWITCHER.children[i].classList.remove("selected");
        }
      }
    }

    // Size
    {
      let selectedIndex = [30, 27, 24].indexOf(this.sizeSetting);
      if (selectedIndex === -1) selectedIndex = 0;
      for (let i = 0; i < 3; i++) {
        if (i === selectedIndex) {
          this.SIZE_SWITCHER.children[i].classList.add("selected");
        } else {
          this.SIZE_SWITCHER.children[i].classList.remove("selected");
        }
      }
    }
  }

  saveState(): unknown {
    return {
      sources: this.sourceList.getState(),
      game: this.GAME_SELECT.value,
      bumpers: this.bumperSetting,
      origin: this.originSetting,
      orientation: this.orientationSetting,
      size: this.sizeSetting
    };
  }

  restoreState(state: unknown): void {
    if (typeof state !== "object" || state === null) return;

    this.updateGameOptions();
    if ("sources" in state) {
      this.sourceList.setState(state.sources as SourceListState);
    }
    if ("game" in state && typeof state.game === "string") {
      this.GAME_SELECT.value = state.game;
      if (this.GAME_SELECT.value === "") {
        this.GAME_SELECT.selectedIndex = 0;
      }
    }
    if ("bumpers" in state && (state.bumpers === "auto" || state.bumpers === "blue" || state.bumpers === "red")) {
      this.bumperSetting = state.bumpers;
    }
    if ("origin" in state && (state.origin === "auto" || state.origin === "blue" || state.origin === "red")) {
      this.originSetting = state.origin;
    }
    if (
      "orientation" in state &&
      (state.orientation === Orientation.DEG_0 ||
        state.orientation === Orientation.DEG_90 ||
        state.orientation === Orientation.DEG_180 ||
        state.orientation === Orientation.DEG_270)
    ) {
      this.orientationSetting = state.orientation;
    }
    if ("size" in state && (state.size === 30 || state.size === 27 || state.size === 24)) {
      this.sizeSetting = state.size;
    }
    this.updateGameDependentControls(true);
    this.updateSwitchers();
  }

  refresh(): void {
    this.sourceList.refresh();
  }

  newAssets(): void {
    this.updateGameOptions();
  }

  getActiveFields(): string[] {
    return this.sourceList.getActiveFields();
  }

  getCommand(): OdometryRendererCommand {
    // Get timestamp
    let time = window.selection.getRenderTime();

    // Get game data
    let gameData = window.assets?.field2ds.find((game) => game.name === this.GAME_SELECT.value);
    let fieldWidth = gameData === undefined ? 0 : convert(gameData.widthInches, "inches", "meters");
    let fieldHeight = gameData === undefined ? 0 : convert(gameData.heightInches, "inches", "meters");

    // Get alliance
    let autoRedAlliance = time === null ? false : getIsRedAlliance(window.log, time);
    let bumpers: "blue" | "red" =
      (this.bumperSetting === "auto" && autoRedAlliance) || this.bumperSetting === "red" ? "red" : "blue";
    let origin: "blue" | "red" =
      (this.originSetting === "auto" && autoRedAlliance) || this.originSetting === "red" ? "red" : "blue";

    let objects: OdometryRendererCommand_AllObjs[] = [];
    let sources = this.sourceList.getState(true);
    if (time !== null) {
      for (let i = 0; i < sources.length; i++) {
        let source = sources[i];
        let typeConfig = SourcesConfig.types.find((typeConfig) => typeConfig.key === source.type);
        if (typeConfig?.childOf !== undefined) continue; // This is a child, don't render

        // Find children
        let children: SourceListItemState[] = [];
        while (
          sources.length > i + 1 &&
          SourcesConfig.types.find((typeConfig) => typeConfig.key === sources[i + 1].type)?.childOf !== undefined
        ) {
          i++;
          children.push(sources[i]);
        }

        // Get pose data
        let numberArrayFormat: "Translation2d" | "Translation3d" | "Pose2d" | "Pose3d" = "Pose2d";
        let numberArrayUnits: "radians" | "degrees" = "radians";
        if ("format" in source.options) {
          let formatRaw = source.options.format;
          numberArrayFormat =
            formatRaw === "Pose2d" ||
            formatRaw === "Pose3d" ||
            formatRaw === "Translation2d" ||
            formatRaw === "Translation3d"
              ? formatRaw
              : "Pose2d";
        }
        if ("units" in source.options) {
          numberArrayUnits = source.options.units === "degrees" ? "degrees" : "radians";
        }
        let isHeatmap = source.type === "heatmap" || source.type === "heatmapLegacy";
        let pose3ds: AnnotatedPose3d[] = [];
        if (!isHeatmap) {
          pose3ds = grabPosesAuto(
            window.log,
            source.logKey,
            source.logType,
            time,
            this.UUID,
            numberArrayFormat,
            numberArrayUnits,
            origin,
            fieldWidth,
            fieldHeight
          );
        } else {
          let isFullLog = source.options.filter === "full";
          let stateRanges = isFullLog ? null : getRobotStateRanges(window.log);
          let isValid = (timestamp: number) => {
            if (isFullLog) return true;
            if (stateRanges === null) return false;
            let currentRange = stateRanges.findLast((range) => range.start <= timestamp);
            switch (source.options.filter) {
              case "enabled":
                return currentRange?.mode !== "disabled";
              case "auto":
                return currentRange?.mode === "auto";
              case "teleop":
                return currentRange?.mode === "teleop";
              case "teleop-no-endgame":
                return (
                  currentRange?.mode === "teleop" &&
                  currentRange?.end !== undefined &&
                  currentRange?.end - timestamp > 30
                );
            }
          };
          for (
            let sampleTime = window.log.getTimestampRange()[0];
            sampleTime < window.log.getTimestampRange()[1];
            sampleTime += OdometryController.HEATMAP_DT
          ) {
            if (!isValid(sampleTime)) continue;
            pose3ds = pose3ds.concat(
              grabPosesAuto(
                window.log,
                source.logKey,
                source.logType,
                sampleTime,
                this.UUID,
                numberArrayFormat,
                numberArrayUnits,
                origin,
                fieldWidth,
                fieldHeight
              )
            );
          }
        }
        let poses = pose3ds.map(annotatedPose3dTo2d);

        // Get trail data for robot
        let trails: Translation2d[][] = Array(poses.length).fill([]);
        if (source.type === "robot" || source.type === "robotLegacy") {
          let startTime = Math.max(window.log.getTimestampRange()[0], time - OdometryController.TRAIL_LENGTH_SECS);
          let endTime = Math.min(window.log.getTimestampRange()[1], time + OdometryController.TRAIL_LENGTH_SECS);

          let timestamps = [startTime];
          for (
            let sampleTime = Math.ceil(startTime / OdometryController.TRAIL_DT) * OdometryController.TRAIL_DT;
            sampleTime < endTime;
            sampleTime += OdometryController.TRAIL_DT
          ) {
            timestamps.push(sampleTime);
          }
          timestamps.push(endTime);
          timestamps.forEach((sampleTime) => {
            let pose3ds = grabPosesAuto(
              window.log,
              source.logKey,
              source.logType,
              sampleTime,
              this.UUID,
              numberArrayFormat,
              numberArrayUnits,
              origin,
              fieldWidth,
              fieldHeight
            );
            if (pose3ds.length !== trails.length) return;
            pose3ds.forEach((pose, index) => {
              trails[index].push(translation3dTo2d(pose.pose.translation));
            });
          });
        }

        // Add data from children
        let visionTargets: AnnotatedPose2d[] = [];
        children.forEach((child) => {
          switch (child.type) {
            case "rotationOverride":
            case "rotationOverrideLegacy":
              let isRotation2d = child.logType === "Rotation2d";
              let rotationKey = isRotation2d ? child.logKey + "/value" : child.logKey;
              let rotation = getOrDefault(window.log, rotationKey, LoggableType.Number, time!, 0, this.UUID);
              if (!isRotation2d) {
                rotation = convert(rotation, child.options.units, "radians");
              }
              poses.forEach((value) => {
                value.pose.rotation = rotation;
              });
              break;

            case "vision":
            case "visionLegacy":
              let numberArrayFormat: "Translation2d" | "Translation3d" | "Pose2d" | "Pose3d" | undefined = undefined;
              if ("format" in child.options) {
                let formatRaw = child.options.format;
                numberArrayFormat =
                  formatRaw === "Pose2d" ||
                  formatRaw === "Pose3d" ||
                  formatRaw === "Translation2d" ||
                  formatRaw === "Translation3d"
                    ? formatRaw
                    : "Pose2d";
              }
              let visionPose3ds = grabPosesAuto(
                window.log,
                child.logKey,
                child.logType,
                time!,
                this.UUID,
                numberArrayFormat,
                "radians"
              );
              visionTargets = visionPose3ds.map(annotatedPose3dTo2d);
              break;
          }
        });

        // Add object
        switch (source.type) {
          case "robot":
          case "robotLegacy":
            objects.push({
              type: "robot",
              poses: poses,
              trails: trails,
              visionTargets: visionTargets
            });
            break;
          case "ghost":
          case "ghostLegacy":
          case "ghostZebra":
            objects.push({
              type: "ghost",
              poses: poses,
              color: source.options.color,
              visionTargets: visionTargets
            });
            break;
          case "trajectory":
          case "trajectoryLegacy":
            objects.push({
              type: "trajectory",
              poses: poses
            });
            break;
          case "heatmap":
          case "heatmapLegacy":
            objects.push({
              type: "heatmap",
              poses: poses
            });
            break;
          case "arrow":
          case "arrowLegacy":
            let positionRaw = source.options.position;
            let position: "center" | "back" | "front" =
              positionRaw === "center" || positionRaw === "back" || positionRaw === "front" ? positionRaw : "center";
            objects.push({
              type: "arrow",
              poses: poses,
              position: position
            });
            break;
          case "zebra":
            objects.push({
              type: "zebra",
              poses: poses
            });
            break;
        }
      }
    }

    return {
      game: this.GAME_SELECT.value,
      bumpers: bumpers,
      origin: origin,
      orientation: this.orientationSetting,
      size: this.sizeSetting,
      objects: objects
    };
  }
}

const SourcesConfig: SourceListConfig = {
  title: "Poses",
  autoAdvance: true,
  allowChildrenFromDrag: false,
  typeMemoryId: "odometry",
  types: [
    {
      key: "robot",
      display: "Robot",
      symbol: "location.fill",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: [
        "Pose2d",
        "Pose3d",
        "Pose2d[]",
        "Pose3d[]",
        "Transform2d",
        "Transform3d",
        "Transform2d[]",
        "Transform3d[]"
      ],
      options: [],
      parentKey: "robot",
      geometryPreviewType: "Pose2d"
    },
    {
      key: "robotLegacy",
      display: "Robot",
      symbol: "location.fill",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["NumberArray"],
      options: [
        {
          key: "format",
          display: "Format",
          showInTypeName: false,
          values: [
            { key: "Pose2d", display: "2D Pose(s)" },
            { key: "Pose3d", display: "3D Pose(s)" },
            { key: "Translation2d", display: "2D Translation(s)" },
            { key: "Translation3d", display: "3D Translation(s)" }
          ]
        },
        {
          key: "units",
          display: "Rotation Units",
          showInTypeName: false,
          values: [
            { key: "radians", display: "Radians" },
            { key: "degrees", display: "Degrees" }
          ]
        }
      ],
      numberArrayDeprecated: true,
      parentKey: "robot",
      geometryPreviewType: "Pose2d"
    },
    {
      key: "ghost",
      display: "Ghost",
      symbol: "location.fill.viewfinder",
      showInTypeName: true,
      color: "color",
      sourceTypes: [
        "Pose2d",
        "Pose3d",
        "Pose2d[]",
        "Pose3d[]",
        "Transform2d",
        "Transform3d",
        "Transform2d[]",
        "Transform3d[]"
      ],
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors
        }
      ],
      initialSelectionOption: "color",
      parentKey: "robot",
      geometryPreviewType: "Pose2d"
    },
    {
      key: "ghostLegacy",
      display: "Ghost",
      symbol: "location.fill.viewfinder",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["NumberArray"],
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors
        },
        {
          key: "format",
          display: "Format",
          showInTypeName: false,
          values: [
            { key: "Pose2d", display: "2D Pose(s)" },
            { key: "Pose3d", display: "3D Pose(s)" },
            { key: "Translation2d", display: "2D Translation(s)" },
            { key: "Translation3d", display: "3D Translation(s)" }
          ]
        },
        {
          key: "units",
          display: "Rotation Units",
          showInTypeName: false,
          values: [
            { key: "radians", display: "Radians" },
            { key: "degrees", display: "Degrees" }
          ]
        }
      ],
      initialSelectionOption: "color",
      parentKey: "robot",
      numberArrayDeprecated: true,
      geometryPreviewType: "Pose2d"
    },
    {
      key: "ghostZebra",
      display: "Ghost",
      symbol: "location.fill.viewfinder",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["ZebraTranslation"],
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors
        }
      ],
      initialSelectionOption: "color",
      parentKey: "robot",
      geometryPreviewType: "Translation2d"
    },
    {
      key: "rotationOverride",
      display: "Rotation Override",
      symbol: "angle",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Rotation2d"],
      options: [],
      childOf: "robot",
      geometryPreviewType: "Rotation2d"
    },
    {
      key: "rotationOverrideLegacy",
      display: "Rotation Override",
      symbol: "angle",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Number"],
      options: [
        {
          key: "units",
          display: "Rotation Units",
          showInTypeName: false,
          values: [
            { key: "radians", display: "Radians" },
            { key: "degrees", display: "Degrees" }
          ]
        }
      ],
      childOf: "robot",
      geometryPreviewType: "Rotation2d"
    },
    {
      key: "vision",
      display: "Vision Target",
      symbol: "scope",
      showInTypeName: true,
      color: "#00bb00",
      sourceTypes: [
        "Pose2d",
        "Pose3d",
        "Pose2d[]",
        "Pose3d[]",
        "Transform2d",
        "Transform3d",
        "Transform2d[]",
        "Transform3d[]",
        "Translation2d",
        "Translation3d",
        "Translation2d[]",
        "Translation3d[]"
      ],
      options: [],
      childOf: "robot",
      geometryPreviewType: "Translation2d"
    },
    {
      key: "visionLegacy",
      display: "Vision Target",
      symbol: "scope",
      showInTypeName: true,
      color: "#00bb00",
      sourceTypes: ["NumberArray"],
      options: [
        {
          key: "format",
          display: "Format",
          showInTypeName: false,
          values: [
            { key: "Pose2d", display: "2D Pose(s)" },
            { key: "Pose3d", display: "3D Pose(s)" },
            { key: "Translation2d", display: "2D Translation(s)" },
            { key: "Translation3d", display: "3D Translation(s)" }
          ]
        }
      ],
      numberArrayDeprecated: true,
      childOf: "robot",
      geometryPreviewType: "Translation2d"
    },
    {
      key: "trajectory",
      display: "Trajectory",
      symbol: "point.bottomleft.forward.to.point.topright.scurvepath.fill",
      showInTypeName: true,
      color: "#ff8800",
      sourceTypes: [
        "Pose2d[]",
        "Pose3d[]",
        "Transform2d[]",
        "Transform3d[]",
        "Translation2d[]",
        "Translation3d[]",
        "Trajectory"
      ],
      options: [],
      geometryPreviewType: "Translation2d"
    },
    {
      key: "trajectoryLegacy",
      display: "Trajectory",
      symbol: "point.bottomleft.forward.to.point.topright.scurvepath.fill",
      showInTypeName: true,
      color: "#ff8800",
      sourceTypes: ["NumberArray"],
      options: [
        {
          key: "format",
          display: "Format",
          showInTypeName: false,
          values: [
            { key: "Pose2d", display: "2D Pose(s)" },
            { key: "Pose3d", display: "3D Pose(s)" },
            { key: "Translation2d", display: "2D Translation(s)" },
            { key: "Translation3d", display: "3D Translation(s)" }
          ]
        }
      ],
      numberArrayDeprecated: true,
      geometryPreviewType: "Translation2d"
    },
    {
      key: "heatmap",
      display: "Heatmap",
      symbol: "map.fill",
      showInTypeName: true,
      color: "#ff0000",
      sourceTypes: [
        "Pose2d",
        "Pose3d",
        "Pose2d[]",
        "Pose3d[]",
        "Transform2d",
        "Transform3d",
        "Transform2d[]",
        "Transform3d[]",
        "Translation2d",
        "Translation3d",
        "Translation2d[]",
        "Translation3d[]",
        "ZebraTranslation"
      ],
      options: [
        {
          key: "filter",
          display: "Filter",
          showInTypeName: false,
          values: [
            { key: "enabled", display: "Enabled" },
            { key: "auto", display: "Auto" },
            { key: "teleop", display: "Teleop" },
            { key: "teleop-no-endgame", display: "Teleop (No Endgame)" },
            { key: "full", display: "No Filter" }
          ]
        }
      ],
      initialSelectionOption: "filter",
      geometryPreviewType: null
    },
    {
      key: "heatmapLegacy",
      display: "Heatmap",
      symbol: "map.fill",
      showInTypeName: true,
      color: "#ff0000",
      sourceTypes: ["NumberArray"],
      options: [
        {
          key: "filter",
          display: "Filter",
          showInTypeName: false,
          values: [
            { key: "enabled", display: "Enabled" },
            { key: "auto", display: "Auto" },
            { key: "teleop", display: "Teleop" },
            { key: "teleop-no-endgame", display: "Teleop (No Endgame)" },
            { key: "full", display: "Full Log" }
          ]
        },
        {
          key: "format",
          display: "Format",
          showInTypeName: false,
          values: [
            { key: "Pose2d", display: "2D Pose(s)" },
            { key: "Pose3d", display: "3D Pose(s)" },
            { key: "Translation2d", display: "2D Translation(s)" },
            { key: "Translation3d", display: "3D Translation(s)" }
          ]
        }
      ],
      initialSelectionOption: "filter",
      numberArrayDeprecated: true,
      geometryPreviewType: null
    },
    {
      key: "arrow",
      display: "Arrow",
      symbol: "arrow.up.circle",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: [
        "Pose2d",
        "Pose3d",
        "Pose2d[]",
        "Pose3d[]",
        "Transform2d",
        "Transform3d",
        "Transform2d[]",
        "Transform3d[]",
        "Trajectory"
      ],
      options: [
        {
          key: "position",
          display: "Position",
          showInTypeName: true,
          values: [
            { key: "center", display: "Center" },
            { key: "back", display: "Back" },
            { key: "front", display: "Front" }
          ]
        }
      ],
      initialSelectionOption: "position",
      geometryPreviewType: "Pose2d"
    },
    {
      key: "arrowLegacy",
      display: "Arrow",
      symbol: "arrow.up.circle",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["NumberArray"],
      options: [
        {
          key: "position",
          display: "Position",
          showInTypeName: true,
          values: [
            { key: "center", display: "Center" },
            { key: "back", display: "Back" },
            { key: "front", display: "Front" }
          ]
        },
        {
          key: "format",
          display: "Format",
          showInTypeName: false,
          values: [
            { key: "Pose2d", display: "2D Pose(s)" },
            { key: "Pose3d", display: "3D Pose(s)" },
            { key: "Translation2d", display: "2D Translation(s)" },
            { key: "Translation3d", display: "3D Translation(s)" }
          ]
        },
        {
          key: "units",
          display: "Rotation Units",
          showInTypeName: false,
          values: [
            { key: "radians", display: "Radians" },
            { key: "degrees", display: "Degrees" }
          ]
        }
      ],
      initialSelectionOption: "position",
      numberArrayDeprecated: true,
      geometryPreviewType: "Pose2d"
    },
    {
      key: "zebra",
      display: "Zebra Marker",
      symbol: "mappin.circle.fill",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["ZebraTranslation"],
      options: [],
      geometryPreviewType: "Translation2d"
    }
  ]
};
