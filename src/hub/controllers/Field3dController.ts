// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { BuiltIn3dFields } from "../../shared/AdvantageScopeAssets";
import { SourceListItemState, SourceListOptionValueConfig, SourceListState } from "../../shared/SourceListConfig";
import { DISTRIBUTION, Distribution } from "../../shared/buildConstants";
import {
  APRIL_TAG_16H5_COUNT,
  APRIL_TAG_36H11_COUNT,
  AnnotatedPose3d,
  SwerveState,
  grabHeatmapData,
  grabPosesAuto,
  grabSwerveStates,
  rotationSequenceToQuaternion
} from "../../shared/geometry";
import {
  ALLIANCE_KEYS,
  DRIVER_STATION_KEYS,
  MechanismState,
  getDriverStation,
  getIsRedAlliance,
  getMechanismState,
  getOrDefault,
  mergeMechanismStates
} from "../../shared/log/LogUtil";
import LoggableType from "../../shared/log/LoggableType";
import { Field3dRendererCommand, Field3dRendererCommand_AnyObj } from "../../shared/renderers/Field3dRenderer";
import { clampValue, createUUID } from "../../shared/util";
import SourceList from "../SourceList";
import Field3dController_Config from "./Field3dController_Config";
import TabController from "./TabController";

export default class Field3dController implements TabController {
  UUID = createUUID();

  private XR_BUTTON: HTMLButtonElement;
  private FIELD_SELECT: HTMLSelectElement;

  private sourceList: SourceList;
  private lastIsFTCField = false;

  constructor(root: HTMLElement) {
    this.sourceList = new SourceList(
      root.getElementsByClassName("field-3d-sources")[0] as HTMLElement,
      Field3dController_Config,
      []
    );
    let settings = root.getElementsByClassName("field-3d-settings")[0] as HTMLElement;
    this.XR_BUTTON = settings.getElementsByClassName("xr-button")[0] as HTMLButtonElement;
    this.FIELD_SELECT = settings.getElementsByClassName("field-select")[0] as HTMLSelectElement;

    // Set up XR button
    if (DISTRIBUTION === Distribution.Lite) {
      Array.from(settings.getElementsByClassName("xr-control")).forEach((element) => {
        let htmlElement = element as HTMLElement;
        htmlElement.parentElement?.removeChild(htmlElement);
      });
    }
    this.XR_BUTTON.addEventListener("click", () => {
      window.sendMainMessage("open-xr", this.UUID);
    });

    // Set up game select
    this.FIELD_SELECT.addEventListener("change", () => {
      this.updateFieldDependentControls();
      let fieldConfig = [...(window.assets === null ? [] : window.assets.field3ds), ...BuiltIn3dFields].find(
        (field) => field.id === this.FIELD_SELECT.value
      );
      if (fieldConfig !== undefined) {
        if (fieldConfig.isFTC && !this.lastIsFTCField) window.sendMainMessage("ftc-experimental-warning");
        this.lastIsFTCField = fieldConfig.isFTC;
      }
    });
    this.updateFieldOptions();
    this.updateRobotOptions();
  }

  /** Sets whether XR streamling is currently active for this tab. */
  setXRActive(active: boolean) {
    if (active) {
      this.XR_BUTTON.classList.add("active");
    } else {
      this.XR_BUTTON.classList.remove("active");
    }
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
      [...window.assets.field3ds, ...BuiltIn3dFields].forEach((field) => {
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

  /** Updates source list with the latest robot models. */
  private updateRobotOptions() {
    if (window.assets === null) return;
    let fieldConfig = [...window.assets.field3ds, ...BuiltIn3dFields].find(
      (game) => game.id === this.FIELD_SELECT.value
    );
    let isFTC = fieldConfig !== undefined && fieldConfig.isFTC;
    let robotList: string[] = [];
    if (window.assets !== null) {
      robotList = window.assets.robots.filter((robot) => robot.isFTC === isFTC).map((robot) => robot.name);
    }
    if (robotList.length === 0) {
      robotList.push("KitBot");
    }
    let sourceListValues: SourceListOptionValueConfig[] = robotList.map((name) => {
      return { key: name, display: name };
    });
    this.sourceList.setOptionValues("robot", "model", sourceListValues);
    this.sourceList.setOptionValues("robotLegacy", "model", sourceListValues);
    this.sourceList.setOptionValues("ghost", "model", sourceListValues);
    this.sourceList.setOptionValues("ghostLegacy", "model", sourceListValues);
  }

  /** Updates the robots, source button, and other options based on the selected value. */
  private updateFieldDependentControls() {
    if (window.assets === null) return;
    let fieldConfig = [...window.assets.field3ds, ...BuiltIn3dFields].find(
      (game) => game.id === this.FIELD_SELECT.value
    );

    // Update game piece options
    let gamePieces: string[] = [];
    if (fieldConfig !== undefined) {
      gamePieces = fieldConfig.gamePieces.map((x) => x.name);
    }
    if (gamePieces.length === 0) {
      gamePieces.push("None");
    }
    let sourceListValues: SourceListOptionValueConfig[] = gamePieces.map((name) => {
      return { key: name, display: name };
    });
    this.sourceList.setOptionValues("gamePiece", "variant", sourceListValues);
    this.sourceList.setOptionValues("gamePieceLegacy", "variant", sourceListValues);

    // Update AprilTag variants
    let aprilTagVariants: { key: string; display: string }[] = fieldConfig?.isFTC
      ? [
          { key: "36h11-2in", display: "2 in" },
          { key: "36h11-3in", display: "3 in" },
          { key: "36h11-4in", display: "4 in" },
          { key: "36h11-5in", display: "5 in" },
          { key: "36h11-6.5in", display: "6.5 in" }
        ]
      : [
          { key: "36h11-6.5in", display: "36h11" },
          { key: "16h5-6in", display: "16h5" }
        ];
    this.sourceList.setOptionValues("aprilTag", "variant", aprilTagVariants);
    this.sourceList.setOptionValues("aprilTagLegacy", "variant", aprilTagVariants);

    this.updateRobotOptions();
  }

  saveState(): unknown {
    return {
      sources: this.sourceList.getState(),
      game: this.FIELD_SELECT.value
    };
  }

  restoreState(state: unknown): void {
    if (typeof state !== "object" || state === null) return;

    this.updateFieldOptions();
    if ("sources" in state) {
      this.sourceList.setState(state.sources as SourceListState);
    }
    if ("game" in state && typeof state.game === "string") {
      this.FIELD_SELECT.value = state.game;
      if (this.FIELD_SELECT.value === "") {
        this.FIELD_SELECT.selectedIndex = 0;
      }
      let fieldConfig = [...(window.assets === null ? [] : window.assets.field3ds), ...BuiltIn3dFields].find(
        (field) => field.id === this.FIELD_SELECT.value
      );
      if (fieldConfig !== undefined) {
        this.lastIsFTCField = fieldConfig.isFTC;
      }
    }
    this.updateFieldDependentControls();
  }

  refresh(): void {
    this.sourceList.refresh();
  }

  newAssets(): void {
    this.updateFieldOptions();
    this.updateRobotOptions();
  }

  getActiveFields(): string[] {
    return [...this.sourceList.getActiveFields(), ...ALLIANCE_KEYS, ...DRIVER_STATION_KEYS];
  }

  showTimeline(): boolean {
    return true;
  }

  getCommand(): Field3dRendererCommand {
    // Get timestamp
    let time = window.selection.getRenderTime();

    // Get field data
    let fieldData = [...(window.assets === null ? [] : window.assets.field3ds), ...BuiltIn3dFields].find(
      (game) => game.id === this.FIELD_SELECT.value
    );
    let coordinateSystem =
      (window.preferences?.coordinateSystem === "automatic"
        ? fieldData?.coordinateSystem
        : window.preferences?.coordinateSystem) ?? "center-red";

    // Get alliance
    let isRedAlliance = time === null ? false : getIsRedAlliance(window.log, time);

    let objects: Field3dRendererCommand_AnyObj[] = [];
    let cameraOverride: AnnotatedPose3d | null = null;
    let sources = this.sourceList.getState(true);
    for (let i = 0; i < sources.length; i++) {
      let source = sources[i];
      let typeConfig = Field3dController_Config.types.find((typeConfig) => typeConfig.key === source.type);
      if (typeConfig?.childOf !== undefined) continue; // This is a child, don't render

      // Find children
      let children: SourceListItemState[] = [];
      while (
        sources.length > i + 1 &&
        Field3dController_Config.types.find((typeConfig) => typeConfig.key === sources[i + 1].type)?.childOf !==
          undefined
      ) {
        i++;
        children.push(sources[i]);
      }

      // Get pose data
      let numberArrayFormat: "Translation2d" | "Translation3d" | "Pose2d" | "Pose3d" = "Pose3d";
      let numberArrayUnits: "radians" | "degrees" = "radians";
      if ("format" in source.options) {
        let formatRaw = source.options.format;
        numberArrayFormat =
          formatRaw === "Pose2d" ||
          formatRaw === "Pose3d" ||
          formatRaw === "Translation2d" ||
          formatRaw === "Translation3d"
            ? formatRaw
            : "Pose3d";
      }
      if ("units" in source.options) {
        numberArrayUnits = source.options.units === "degrees" ? "degrees" : "radians";
      }
      let isHeatmap = source.type === "heatmap" || source.type === "heatmapLegacy";
      let poses: AnnotatedPose3d[] = [];

      if (!isHeatmap) {
        if (time !== null) {
          poses = grabPosesAuto(
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
        poses = grabHeatmapData(
          window.log,
          source.logKey,
          source.logType,
          timeRange,
          this.UUID,
          numberArrayFormat,
          numberArrayUnits
        );
      }

      // Add data from children
      let components: AnnotatedPose3d[] = [];
      let mechanismsXZ: MechanismState[] = [];
      let mechanismsYZ: MechanismState[] = [];
      let visionTargets: AnnotatedPose3d[] = [];
      let swerveStates: {
        values: SwerveState[];
        color: string;
      }[] = [];
      if (time !== null) {
        children.forEach((child) => {
          switch (child.type) {
            case "component":
            case "componentLegacy": {
              // Components are always 3D poses so assume number array format
              components = components.concat(
                grabPosesAuto(window.log, child.logKey, child.logType, time!, this.UUID, "Pose3d")
              );
              break;
            }

            case "mechanism": {
              let state = getMechanismState(window.log, child.logKey, time!);
              if (state !== null) {
                (child.options.plane === "yz" ? mechanismsYZ : mechanismsXZ).push(state);
              }
              break;
            }

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
                  value.pose.rotation = rotations[0].pose.rotation;
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
              let newVisionTargets = grabPosesAuto(
                window.log,
                child.logKey,
                child.logType,
                time!,
                this.UUID,
                numberArrayFormat,
                "radians"
              );
              newVisionTargets.forEach((annotatedPose) => {
                annotatedPose.annotation.visionColor = child.options.color;
                annotatedPose.annotation.visionSize = child.options.size;
              });
              visionTargets = visionTargets.concat(newVisionTargets);
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

            case "aprilTagIDs": {
              let values: number[] = getOrDefault(
                window.log,
                child.logKey,
                LoggableType.NumberArray,
                time!,
                [],
                this.UUID
              );
              let tagCount = source.options.variant === "16h5" ? APRIL_TAG_16H5_COUNT : APRIL_TAG_36H11_COUNT;
              values.forEach((id) => {
                id = clampValue(Math.floor(id), 0, tagCount - 1);
                let index = poses.findIndex((value) => value.annotation.aprilTagId === undefined);
                if (index !== -1) {
                  poses[index].annotation.aprilTagId = id;
                }
              });
              break;
            }
          }
        });
      }
      let mechanismXZ = mechanismsXZ.length === 0 ? null : mergeMechanismStates(mechanismsXZ);
      let mechanismYZ = mechanismsYZ.length === 0 ? null : mergeMechanismStates(mechanismsYZ);
      visionTargets.reverse();
      swerveStates.reverse();

      // Add object
      switch (source.type) {
        case "robot":
        case "robotLegacy":
          objects.push({
            type: "robot",
            model: source.options.model,
            poses: poses,
            components: components,
            mechanisms: {
              xz: mechanismXZ,
              yz: mechanismYZ
            },
            visionTargets: visionTargets,
            swerveStates: swerveStates
          });
          break;
        case "ghost":
        case "ghostLegacy":
          objects.push({
            type: "ghost",
            color: source.options.color,
            model: source.options.model,
            poses: poses,
            components: components,
            mechanisms: {
              xz: mechanismXZ,
              yz: mechanismYZ
            },
            visionTargets: visionTargets,
            swerveStates: swerveStates
          });
          break;
        case "gamePiece":
        case "gamePieceLegacy":
          objects.push({
            type: "gamePiece",
            variant: source.options.variant,
            poses: poses
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
        case "aprilTag":
        case "aprilTagLegacy":
          const variantRaw = source.options.variant as string;
          const parts = variantRaw.split("-");
          const family = parts[0] as "36h11" | "16h5";
          const inches = parseFloat(parts[1]);
          objects.push({
            type: "aprilTag",
            poses: poses,
            variant: { family, inches }
          });
          break;
        case "axes":
        case "axesLegacy":
          objects.push({
            type: "axes",
            poses: poses
          });
          break;
        case "cone":
        case "coneLegacy":
          let positionRaw = source.options.position;
          let position: "center" | "back" | "front" =
            positionRaw === "center" || positionRaw === "back" || positionRaw === "front" ? positionRaw : "center";
          objects.push({
            type: "cone",
            color: source.options.color,
            position: position,
            poses: poses
          });
          break;
        case "cameraOverride":
        case "cameraOverrideLegacy":
          if (cameraOverride === null) {
            cameraOverride = poses[0];
          }
          break;
      }
    }

    // Add built-in AprilTag objects
    if (fieldData !== undefined) {
      new Set(fieldData.aprilTags.map((x) => x.variant)).forEach((variant) => {
        const parts = variant.split("-");
        const family = parts[0] as "36h11" | "16h5";
        const inches = parseFloat(parts[1]);

        objects.push({
          type: "aprilTagBuiltIn",
          poses: fieldData.aprilTags
            .filter((x) => x.variant === variant)
            .map((aprilTag) => {
              let quaternion = rotationSequenceToQuaternion(aprilTag.rotations);
              let annotatedPose: AnnotatedPose3d = {
                pose: {
                  translation: aprilTag.position,
                  rotation: [quaternion.w, quaternion.x, quaternion.y, quaternion.z]
                },
                annotation: {
                  is2DSource: false,
                  aprilTagId: aprilTag.id
                }
              };
              return annotatedPose;
            }),
          variant: { family, inches }
        });
      });
    }

    // Get all robot models
    let allRobotModels: Set<string> = new Set();
    let allSources = this.sourceList.getState();
    allSources.forEach((source) => {
      if (["robot", "robotLegacy", "ghost", "ghostLegacy"].includes(source.type)) {
        allRobotModels.add(source.options.model);
      }
    });

    return {
      field: this.FIELD_SELECT.value,
      isRedAlliance: isRedAlliance,
      coordinateSystem: coordinateSystem,
      objects: objects,
      cameraOverride: cameraOverride,
      autoDriverStation: getDriverStation(window.log, time!),
      allRobotModels: [...allRobotModels]
    };
  }
}
