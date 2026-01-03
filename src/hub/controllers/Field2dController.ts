// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { SourceListItemState, SourceListState } from "../../shared/SourceListConfig";
import {
  AnnotatedPose2d,
  AnnotatedPose3d,
  SwerveState,
  Translation2d,
  annotatedPose3dTo2d,
  convertFromCoordinateSystem,
  grabHeatmapData,
  grabPosesAuto,
  grabSwerveStates,
  rotation3dTo2d
} from "../../shared/geometry";
import { ALLIANCE_KEYS, getIsRedAlliance } from "../../shared/log/LogUtil";
import {
  Field2dRendererCommand,
  Field2dRendererCommand_AnyObj,
  Orientation
} from "../../shared/renderers/Field2dRenderer";
import { Units } from "../../shared/units";
import { createUUID } from "../../shared/util";
import SourceList from "../SourceList";
import Field2dController_Config from "./Field2dController_Config";
import TabController from "./TabController";

export default class Field2dController implements TabController {
  UUID = createUUID();

  private static TRAIL_LENGTH_SECS = 3;
  private static TRAIL_DT = 0.1;

  private SETTINGS: HTMLElement;
  private ORIENTATION_SWITCHER: HTMLElement;
  private SIZE_SWITCHER: HTMLElement;
  private FIELD_SELECT: HTMLSelectElement;
  private FIELD_SOURCE: HTMLElement;

  private sourceList: SourceList;

  private orientationSetting = Orientation.DEG_0;
  private sizeSetting: "large" | "medium" | "small" = "large";
  private lastIsFTCField = false;

  constructor(root: HTMLElement) {
    this.sourceList = new SourceList(
      root.getElementsByClassName("field-2d-sources")[0] as HTMLElement,
      Field2dController_Config,
      []
    );
    this.SETTINGS = root.getElementsByClassName("field-2d-settings")[0] as HTMLElement;
    this.ORIENTATION_SWITCHER = this.SETTINGS.getElementsByClassName("orientation-switcher")[0] as HTMLElement;
    this.SIZE_SWITCHER = this.SETTINGS.getElementsByClassName("size-switcher")[0] as HTMLElement;
    this.FIELD_SELECT = this.SETTINGS.getElementsByClassName("field-select")[0] as HTMLSelectElement;
    this.FIELD_SOURCE = this.SETTINGS.getElementsByClassName("field-source")[0] as HTMLElement;

    // Set up field select
    this.FIELD_SELECT.addEventListener("change", () => {
      this.updateFieldDependentControls();
      let fieldConfig = window.assets?.field2ds.find((field) => field.id === this.FIELD_SELECT.value);
      if (fieldConfig !== undefined) {
        if (fieldConfig.isFTC && !this.lastIsFTCField) window.sendMainMessage("ftc-experimental-warning");
        this.lastIsFTCField = fieldConfig.isFTC;
      }
    });
    this.FIELD_SOURCE.addEventListener("click", () => {
      window.sendMainMessage(
        "open-link",
        window.assets?.field2ds.find((field) => field.id === this.FIELD_SELECT.value)?.sourceUrl
      );
    });
    this.updateFieldOptions();

    // Set up switchers
    this.ORIENTATION_SWITCHER.children[0].addEventListener("click", () => {
      this.orientationSetting--;
      if (this.orientationSetting < 0) this.orientationSetting = 3;
    });
    this.ORIENTATION_SWITCHER.children[1].addEventListener("click", () => {
      this.orientationSetting++;
      if (this.orientationSetting > 3) this.orientationSetting = 0;
    });
    (["large", "medium", "small"] as const).forEach((value, index) => {
      this.SIZE_SWITCHER.children[index].addEventListener("click", () => {
        this.sizeSetting = value;
        this.updateSwitchers();
      });
    });
    this.updateSwitchers();
  }

  /** Updates field select with the latest options. */
  private updateFieldOptions() {
    let value = this.FIELD_SELECT.value;
    let frcGroup = this.FIELD_SELECT.firstElementChild as HTMLElement;
    let ftcGroup = this.FIELD_SELECT.lastElementChild as HTMLElement;
    while (frcGroup.firstChild) {
      frcGroup.removeChild(frcGroup.firstChild);
    }
    while (ftcGroup.firstChild) {
      ftcGroup.removeChild(ftcGroup.firstChild);
    }
    let options: string[] = [];
    if (window.assets !== null) {
      window.assets.field2ds.forEach((field) => {
        let option = document.createElement("option");
        option.innerText = field.name;
        option.value = field.id;
        options.push(field.id);
        (field.isFTC ? ftcGroup : frcGroup).appendChild(option);
      });
    }
    if (options.includes(value)) {
      this.FIELD_SELECT.value = value;
    } else {
      this.FIELD_SELECT.selectedIndex = 0;
    }
    this.updateFieldDependentControls();
  }

  /** Updates the source link and size switcher based on the selected field. */
  private updateFieldDependentControls() {
    let fieldConfig = window.assets?.field2ds.find((field) => field.id === this.FIELD_SELECT.value);
    this.FIELD_SOURCE.hidden = fieldConfig !== undefined && fieldConfig.sourceUrl === undefined;
    if (fieldConfig?.isFTC) {
      this.SETTINGS.classList.add("ftc");
      this.SETTINGS.classList.remove("frc");
    } else {
      this.SETTINGS.classList.add("frc");
      this.SETTINGS.classList.remove("ftc");
    }
  }

  /** Updates the switcher elements to match the internal state. */
  private updateSwitchers() {
    // Size
    {
      let selectedIndex = ["large", "medium", "small"].indexOf(this.sizeSetting);
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
      field: this.FIELD_SELECT.value,
      orientation: this.orientationSetting,
      size: this.sizeSetting
    };
  }

  restoreState(state: unknown): void {
    if (typeof state !== "object" || state === null) return;

    this.updateFieldOptions();
    if ("sources" in state) {
      this.sourceList.setState(state.sources as SourceListState);
    }
    if ("field" in state && typeof state.field === "string") {
      this.FIELD_SELECT.value = state.field;
      if (this.FIELD_SELECT.value === "") {
        this.FIELD_SELECT.selectedIndex = 0;
      }
      let fieldConfig = window.assets?.field2ds.find((field) => field.id === this.FIELD_SELECT.value);
      if (fieldConfig !== undefined) {
        this.lastIsFTCField = fieldConfig.isFTC;
      }
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
    if ("size" in state && (state.size === "large" || state.size === "medium" || state.size === "small")) {
      this.sizeSetting = state.size;
    }
    this.updateFieldDependentControls();
    this.updateSwitchers();
  }

  refresh(): void {
    this.sourceList.refresh();
  }

  newAssets(): void {
    this.updateFieldOptions();
  }

  getActiveFields(): string[] {
    return [...this.sourceList.getActiveFields(), ...ALLIANCE_KEYS];
  }

  showTimeline(): boolean {
    return true;
  }

  getCommand(): Field2dRendererCommand {
    // Get timestamp
    let time = window.selection.getRenderTime();

    // Get field data
    let fieldData = window.assets?.field2ds.find((game) => game.id === this.FIELD_SELECT.value);
    let fieldWidth = fieldData === undefined ? 0 : Units.convert(fieldData.widthInches, "inches", "meters");
    let fieldHeight = fieldData === undefined ? 0 : Units.convert(fieldData.heightInches, "inches", "meters");
    let coordinateSystem =
      (window.preferences?.coordinateSystem === "automatic"
        ? fieldData?.coordinateSystem
        : window.preferences?.coordinateSystem) ?? "center-red";

    // Get alliance
    let isRedAlliance = time === null ? false : getIsRedAlliance(window.log, time);

    // Get objects
    let objects: Field2dRendererCommand_AnyObj[] = [];
    let sources = this.sourceList.getState(true);
    for (let i = 0; i < sources.length; i++) {
      let source = sources[i];
      let typeConfig = Field2dController_Config.types.find((typeConfig) => typeConfig.key === source.type);
      if (typeConfig?.childOf !== undefined) continue; // This is a child, don't render

      // Find children
      let children: SourceListItemState[] = [];
      while (
        sources.length > i + 1 &&
        Field2dController_Config.types.find((typeConfig) => typeConfig.key === sources[i + 1].type)?.childOf !==
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
            numberArrayUnits
          );
        }
      } else {
        let timeRange: "enabled" | "auto" | "teleop" | "teleop-no-endgame" | "full" | "visible" = "enabled";
        if ("timeRange" in source.options) {
          let timeRangeRaw = source.options.timeRange;
          timeRange =
            timeRangeRaw === "enabled" ||
            timeRangeRaw === "auto" ||
            timeRangeRaw === "teleop" ||
            timeRangeRaw === "teleop-no-endgame" ||
            timeRangeRaw === "full" ||
            timeRangeRaw === "visible"
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
          numberArrayUnits
        );
      }
      let poses = pose3ds.map(annotatedPose3dTo2d);

      // Get trail data for robot
      let trails: Translation2d[][] = Array(poses.length).fill([]);
      if (time !== null) {
        if (source.type === "robot" || source.type === "robotLegacy") {
          let startTime = Math.max(window.log.getTimestampRange()[0], time - Field2dController.TRAIL_LENGTH_SECS);
          let endTime = Math.min(window.log.getTimestampRange()[1], time + Field2dController.TRAIL_LENGTH_SECS);

          let timestamps = [startTime];
          for (
            let sampleTime = Math.ceil(startTime / Field2dController.TRAIL_DT) * Field2dController.TRAIL_DT;
            sampleTime < endTime;
            sampleTime += Field2dController.TRAIL_DT
          ) {
            timestamps.push(sampleTime);
          }
          timestamps.push(endTime);
          timestamps.forEach((sampleTime) => {
            let poses = grabPosesAuto(
              window.log,
              source.logKey,
              source.logType,
              sampleTime,
              this.UUID,
              numberArrayFormat,
              numberArrayUnits
            ).map((x) => annotatedPose3dTo2d(x));
            if (poses.length !== trails.length) return;
            if (fieldData !== undefined) {
              poses = convertFromCoordinateSystem(
                poses,
                coordinateSystem,
                isRedAlliance ? "red" : "blue",
                fieldWidth,
                fieldHeight
              );
            }
            poses.forEach((pose, index) => {
              trails[index].push(pose.pose.translation);
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

      // Apply coordinate system
      if (fieldData !== undefined) {
        poses = convertFromCoordinateSystem(
          poses,
          coordinateSystem,
          isRedAlliance ? "red" : "blue",
          fieldWidth,
          fieldHeight
        );
        visionTargets = convertFromCoordinateSystem(
          visionTargets,
          coordinateSystem,
          isRedAlliance ? "red" : "blue",
          fieldWidth,
          fieldHeight
        );
      }

      // Add object
      switch (source.type) {
        case "robot":
        case "robotLegacy":
          objects.push({
            type: "robot",
            poses: poses,
            trails: trails,
            bumperColor:
              source.options.bumpers === "" ? (isRedAlliance ? "#ff0000" : "#0000ff") : source.options.bumpers,
            visionTargets: visionTargets,
            swerveStates: swerveStates
          });
          break;
        case "ghost":
        case "ghostLegacy":
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
      }
    }

    // Get size setting
    let size = 0;
    switch (this.sizeSetting) {
      case "large":
        size = fieldData?.isFTC ? 18 : 30;
        break;
      case "medium":
        size = fieldData?.isFTC ? 16 : 27;
        break;
      case "small":
        size = fieldData?.isFTC ? 14 : 24;
        break;
    }

    objects.reverse();
    return {
      field: this.FIELD_SELECT.value,
      orientation: this.orientationSetting,
      size: size,
      objects: objects
    };
  }
}
