import { SourceListItemState, SourceListState } from "../../shared/SourceListConfig";
import {
  AnnotatedPose2d,
  AnnotatedPose3d,
  SwerveState,
  Translation2d,
  annotatedPose3dTo2d,
  grabHeatmapData,
  grabPosesAuto,
  grabSwerveStates,
  rotation3dTo2d,
  translation3dTo2d
} from "../../shared/geometry";
import { ALLIANCE_KEYS, getIsRedAlliance } from "../../shared/log/LogUtil";
import {
  OdometryRendererCommand,
  OdometryRendererCommand_AnyObj,
  Orientation
} from "../../shared/renderers/OdometryRenderer";
import { convert } from "../../shared/units";
import { createUUID } from "../../shared/util";
import SourceList from "../SourceList";
import OdometryController_Config from "./OdometryController_Config";
import TabController from "./TabController";

export default class OdometryController implements TabController {
  UUID = createUUID();

  private static TRAIL_LENGTH_SECS = 3;
  private static TRAIL_DT = 0.1;

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
      OdometryController_Config,
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
    let allianceKeys: string[] = [];
    if (this.bumperSetting === "auto" || this.originSetting === "auto") {
      allianceKeys = ALLIANCE_KEYS;
    }
    return [...this.sourceList.getActiveFields(), ...allianceKeys];
  }

  showTimeline(): boolean {
    return true;
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

    // Get objects
    let objects: OdometryRendererCommand_AnyObj[] = [];
    let sources = this.sourceList.getState(true);
    for (let i = 0; i < sources.length; i++) {
      let source = sources[i];
      let typeConfig = OdometryController_Config.types.find((typeConfig) => typeConfig.key === source.type);
      if (typeConfig?.childOf !== undefined) continue; // This is a child, don't render

      // Find children
      let children: SourceListItemState[] = [];
      while (
        sources.length > i + 1 &&
        OdometryController_Config.types.find((typeConfig) => typeConfig.key === sources[i + 1].type)?.childOf !==
          undefined
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
        if (time !== null) {
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
        }
      } else {
        let timeRange: "enabled" | "auto" | "teleop" | "teleop-no-endgame" | "full" = "enabled";
        if ("timeRange" in source.options) {
          let timeRangeRaw = source.options.timeRange;
          timeRange =
            timeRangeRaw === "enabled" ||
            timeRangeRaw === "auto" ||
            timeRangeRaw === "teleop" ||
            timeRangeRaw === "teleop-no-endgame" ||
            timeRangeRaw === "full"
              ? timeRangeRaw
              : "enabled";
        }
        pose3ds = grabHeatmapData(
          window.log,
          source.logKey,
          source.logType,
          timeRange,
          this.UUID,
          numberArrayFormat,
          numberArrayUnits,
          origin,
          fieldWidth,
          fieldHeight
        );
      }
      let poses = pose3ds.map(annotatedPose3dTo2d);

      // Get trail data for robot
      let trails: Translation2d[][] = Array(poses.length).fill([]);
      if (time !== null) {
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
      }

      // Add data from children
      let visionTargets: AnnotatedPose2d[] = [];
      let swerveStates: {
        values: SwerveState[];
        color: string;
      }[] = [];
      children.forEach((child) => {
        switch (child.type) {
          case "rotationOverride":
          case "rotationOverrideLegacy": {
            let numberArrayUnits: "radians" | "degrees" = "radians";
            if ("units" in child.options) {
              numberArrayUnits = child.options.units === "degrees" ? "degrees" : "radians";
            }
            let rotations = grabPosesAuto(
              window.log,
              child.logKey,
              child.logType,
              time!,
              this.UUID,
              undefined,
              numberArrayUnits
            );
            if (rotations.length > 0) {
              poses.forEach((value) => {
                value.pose.rotation = rotation3dTo2d(rotations[0].pose.rotation);
              });
            }
            break;
          }

          case "vision":
          case "visionLegacy": {
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
            visionPose3ds.forEach((annotatedPose) => {
              annotatedPose.annotation.visionColor = child.options.color;
              annotatedPose.annotation.visionSize = child.options.size;
            });
            visionTargets = visionTargets.concat(visionPose3ds.map(annotatedPose3dTo2d));
            break;
          }

          case "swerveStates":
          case "swerveStatesLegacy": {
            let numberArrayUnits: "radians" | "degrees" = "radians";
            if ("units" in child.options) {
              numberArrayUnits = child.options.units === "degrees" ? "degrees" : "radians";
            }
            let states = grabSwerveStates(
              window.log,
              child.logKey,
              child.logType,
              time!,
              child.options.arrangement,
              numberArrayUnits,
              this.UUID
            );
            swerveStates.push({
              values: states,
              color: child.options.color
            });
            break;
          }
        }
      });
      visionTargets.reverse();
      swerveStates.reverse();

      // Add object
      switch (source.type) {
        case "robot":
        case "robotLegacy":
          objects.push({
            type: "robot",
            poses: poses,
            trails: trails,
            visionTargets: visionTargets,
            swerveStates: swerveStates
          });
          break;
        case "ghost":
        case "ghostLegacy":
        case "ghostZebra":
          objects.push({
            type: "ghost",
            poses: poses,
            color: source.options.color,
            visionTargets: visionTargets,
            swerveStates: swerveStates
          });
          break;
        case "trajectory":
        case "trajectoryLegacy":
          objects.push({
            type: "trajectory",
            color: source.options.color,
            size: source.options.size,
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

    objects.reverse();
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
