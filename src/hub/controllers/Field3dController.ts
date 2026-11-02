// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { BuiltIn3dFields } from "../../shared/AdvantageScopeAssets";
import { SourceListItemState, SourceListOptionValueConfig, SourceListState } from "../../shared/SourceListConfig";
import {
  APRIL_TAG_16H5_COUNT,
  APRIL_TAG_36H11_COUNT,
  AnnotatedPose3d,
  ModuleVelocity,
  grabHeatmapData,
  grabModuleVelocities,
  grabPosesAuto,
  rotationSequenceToQuaternion
} from "../../shared/geometry";
import { MechanismState, getMechanismState, mergeMechanismStates } from "../../shared/log/LogMechanismState";
import { getOrDefault } from "../../shared/log/LogUtil";
import LoggableType from "../../shared/log/LoggableType";
import { Field3dRendererCommand, Field3dRendererCommand_AnyObj } from "../../shared/renderers/Field3dRenderer";
import { DEFAULT_CAR_URDF } from "../../shared/spatial/DefaultCar";
import { metadata } from "../../shared/spatial/SpatialLog";
import { StaticTrack, parseStaticTrack } from "../../shared/spatial/StaticTrack";
import { compose, identity } from "../../shared/spatial/Transform";
import { computeLinkPoses, parseURDF, resolveMeshPath } from "../../shared/spatial/URDF";
import { clampValue, createUUID } from "../../shared/util";
import SourceList from "../SourceList";
import Field3dController_Config from "./Field3dController_Config";
import { SpatialLayers } from "./SpatialLayers";
import TabController from "./TabController";

export default class Field3dController implements TabController {
  UUID = createUUID();

  private staticTrack: StaticTrack | null = null;
  private spatial = new SpatialLayers();
  private fixedFrame = document.createElement("select");
  private treePopover = document.createElement("div");
  private frameSig = "";
  private frameAxes = document.createElement("input");
  private layerStatus = document.createElement("div");
  private robot = parseURDF(DEFAULT_CAR_URDF);
  private localRobotLoaded = false;
  private robotLog: unknown = null;
  private robotAssets: Record<string, string> = {};
  private robotStatus = document.createElement("div");
  private FIELD_SELECT: HTMLSelectElement;

  private sourceList: SourceList;

  constructor(root: HTMLElement) {
    this.sourceList = new SourceList(
      root.getElementsByClassName("field-3d-sources")[0] as HTMLElement,
      Field3dController_Config,
      []
    );
    let settings = root.getElementsByClassName("field-3d-settings")[0] as HTMLElement;
    this.FIELD_SELECT = settings.getElementsByClassName("field-select")[0] as HTMLSelectElement;

    const folder = document.createElement("input");
    folder.type = "file";
    folder.multiple = true;
    folder.setAttribute("webkitdirectory", "");
    folder.hidden = true;
    const load = document.createElement("button");
    load.textContent = "Load URDF folder…";
    load.onclick = () => folder.click();
    folder.onchange = async () => {
      try {
        const files = Array.from(folder.files ?? []);
        const urdf = files.find((file) => file.name.endsWith(".urdf"));
        if (!urdf) throw new Error("Folder must contain a .urdf file (expand xacro first)");
        const robot = parseURDF(await urdf.text());
        const assets: Record<string, string> = {};
        const entries = await Promise.all(
          files.map(
            async (file) =>
              [
                file.webkitRelativePath,
                await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(String(reader.result));
                  reader.onerror = reject;
                  reader.readAsDataURL(file);
                })
              ] as const
          )
        );
        entries.forEach(([name, url]) => {
          assets[name] = url;
          assets[name.split("/").pop()!] = url;
        });
        const base = urdf.webkitRelativePath.split("/").slice(0, -1).join("/");
        robot.links.forEach((link) =>
          link.visuals.forEach((visual) => {
            if (visual.geometry.type !== "mesh") return;
            const name = visual.geometry.filename;
            const match = resolveMeshPath(name, base).find((candidate) => assets[candidate]);
            if (match) assets[name] = assets[match];
          })
        );
        this.robot = robot;
        this.localRobotLoaded = true;
        this.robotAssets = assets;
        this.robotStatus.textContent = robot.name;
      } catch (error) {
        this.robotStatus.textContent = String(error);
      }
    };
    const fixedLabel = document.createElement("label");
    fixedLabel.textContent = "Fixed frame ";
    this.fixedFrame.append(new Option("map", "map"));
    this.fixedFrame.title = "Frame all layers are drawn in. Choices come from the TF tree.";
    const treeButton = document.createElement("button");
    treeButton.className = "tf-tree-button";
    treeButton.textContent = "Tree";
    treeButton.title = "Show TF parent/child links and transform ages";
    treeButton.onclick = () => {
      this.treePopover.hidden = !this.treePopover.hidden;
    };
    this.treePopover.hidden = true;
    this.treePopover.className = "tf-popover";
    this.treePopover.style.cssText =
      "position:absolute;top:36px;left:12px;z-index:5;max-height:60%;overflow:auto;padding:6px 8px;font-size:12px;" +
      "background:var(--background-color,#222);border:1px solid var(--divider-color,#555);font-family:monospace;white-space:pre";
    root.append(this.treePopover);
    fixedLabel.append(this.fixedFrame, treeButton);
    const axesLabel = document.createElement("label");
    axesLabel.textContent = "Frame axes ";
    this.frameAxes.type = "checkbox";
    this.frameAxes.className = "mv-checkbox";
    axesLabel.append(this.frameAxes);
    const trackInput = document.createElement("input");
    trackInput.type = "file";
    trackInput.accept = ".csv,.geojson,.json";
    trackInput.hidden = true;
    const trackButton = document.createElement("button");
    trackButton.textContent = "Load metric track…";
    trackButton.title = "CSV x,y,z,class or metric GeoJSON in the fixed frame";
    trackButton.onclick = () => trackInput.click();
    trackInput.onchange = async () => {
      try {
        this.staticTrack = parseStaticTrack(await trackInput.files![0].text());
        this.FIELD_SELECT.value = "MUR:Track";
      } catch (error) {
        this.robotStatus.textContent = String(error);
      }
    };
    const coneKey = document.createElement("div");
    coneKey.className = "cone-class-key";
    coneKey.textContent = "Cone classes: blue · yellow · orange · large orange · unknown";
    settings.append(fixedLabel, axesLabel, load, folder, trackButton, trackInput, coneKey, this.robotStatus);
    this.layerStatus.hidden = true;
    root.append(this.layerStatus);
    this.layerStatus.style.cssText = "position:absolute;bottom:4px;left:12px;font-size:12px;pointer-events:none";
    this.robotStatus.textContent = "MUR car · URDF";
    // Set up game select
    this.FIELD_SELECT.addEventListener("change", () => {
      let isFTC = [...(window.assets === null ? [] : window.assets.field3ds), ...BuiltIn3dFields].find(
        (game) => game.id === this.FIELD_SELECT.value
      )?.isFTC;
      if (isFTC !== undefined) {
        if (window.preferences) window.preferences.prefersFTC = isFTC;
        window.sendMainMessage("update-preferences", { prefersFTC: isFTC });
      }
      this.updateFieldDependentControls();
    });
    this.updateFieldOptions();
    this.updateRobotOptions();
  }

  /** Refreshes the Fixed frame dropdown and TF tree popover from the live TF tree. */
  private updateFrameControls(time: number) {
    const frames = this.spatial.tree.getFrames();
    const current = this.fixedFrame.value || "map";
    const list = frames.includes(current) ? frames : [current, ...frames];
    const sig = list.join("|");
    if (sig !== this.frameSig) {
      this.frameSig = sig;
      this.fixedFrame.replaceChildren(
        ...list.map((frame) => new Option(frames.includes(frame) ? frame : frame + " (not in TF)", frame))
      );
      this.fixedFrame.value = current;
    }
    if (this.treePopover.hidden) return;
    const edges = this.spatial.tree.getEdges(time);
    const lines = edges.map((e) => {
      const age =
        (e.isStatic ? "static · " : "") + (e.stamp === null ? "no sample" : (time - e.stamp).toFixed(2) + " s old");
      return e.parent + " → " + e.child + "   " + age;
    });
    this.treePopover.textContent = lines.length ? lines.join("\n") : "No TF data (subscribe to /tf and /tf_static)";
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
    frcGroup.hidden = frcGroup.childElementCount === 0;
    ftcGroup.hidden = ftcGroup.childElementCount === 0;
    if (options.includes(value)) {
      this.FIELD_SELECT.value = value;
    } else {
      this.selectDefaultField();
    }
    this.updateFieldDependentControls();
  }

  /** Selects the default field based on whether the user prefers FTC. */
  private selectDefaultField() {
    let prefersFTC = window.preferences?.prefersFTC ?? false;
    let primaryGroup = prefersFTC
      ? (this.FIELD_SELECT.lastElementChild as HTMLElement)
      : (this.FIELD_SELECT.firstElementChild as HTMLElement);
    let secondaryGroup = prefersFTC
      ? (this.FIELD_SELECT.firstElementChild as HTMLElement)
      : (this.FIELD_SELECT.lastElementChild as HTMLElement);

    if (primaryGroup.children.length > 0) {
      this.FIELD_SELECT.value = (primaryGroup.children[0] as HTMLOptionElement).value;
    } else if (secondaryGroup.children.length > 0) {
      this.FIELD_SELECT.value = (secondaryGroup.children[0] as HTMLOptionElement).value;
    } else {
      this.FIELD_SELECT.selectedIndex = 0;
    }
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
    robotList.unshift("MUR car");
    let sourceListValues: SourceListOptionValueConfig[] = robotList.map((name) => {
      return { key: name, display: name };
    });
    this.sourceList.setOptionValues("robot", "model", sourceListValues);
    this.sourceList.setOptionValues("ghost", "model", sourceListValues);
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

    // Update AprilTag variants
    let aprilTagVariants: { key: string; display: string }[] = fieldConfig?.isFTC
      ? [
          { key: "36h11-2in", display: "2 in" },
          { key: "36h11-3in", display: "3 in" },
          { key: "36h11-3.25in", display: "3.25 in" },
          { key: "36h11-4in", display: "4 in" },
          { key: "36h11-5in", display: "5 in" },
          { key: "36h11-6.5in", display: "6.5 in" }
        ]
      : [
          { key: "36h11-6.5in", display: "36h11" },
          { key: "16h5-6in", display: "16h5" }
        ];
    this.sourceList.setOptionValues("aprilTag", "variant", aprilTagVariants);

    this.updateRobotOptions();
  }

  saveState(): unknown {
    return {
      sources: this.sourceList.getState(),
      staticTrack: this.staticTrack,
      fixedFrame: this.fixedFrame.value,
      frameAxes: this.frameAxes.checked,
      localRobotLoaded: this.localRobotLoaded,
      robot: this.robot,
      robotAssets: this.robotAssets,
      game: this.FIELD_SELECT.value
    };
  }

  restoreState(state: unknown): void {
    if (typeof state !== "object" || state === null) return;

    if ("staticTrack" in state) this.staticTrack = state.staticTrack as StaticTrack | null;
    if ("fixedFrame" in state) {
      const frame = String(state.fixedFrame);
      if (![...this.fixedFrame.options].some((o) => o.value === frame))
        this.fixedFrame.append(new Option(frame, frame));
      this.fixedFrame.value = frame;
    }
    if ("frameAxes" in state) this.frameAxes.checked = Boolean(state.frameAxes);
    if ("localRobotLoaded" in state) this.localRobotLoaded = Boolean(state.localRobotLoaded);
    if ("robot" in state) this.robot = state.robot as typeof this.robot;
    if ("robotAssets" in state) this.robotAssets = state.robotAssets as typeof this.robotAssets;
    this.updateFieldOptions();
    if ("sources" in state) {
      this.sourceList.setState(state.sources as SourceListState);
    }
    if ("game" in state && typeof state.game === "string") {
      this.FIELD_SELECT.value = state.game;
      if (this.FIELD_SELECT.value === "") {
        this.selectDefaultField();
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
    return [
      ...this.sourceList.getActiveFields(),
      ...window.log
        .getFieldKeys()
        .filter((key) =>
          ["tf2_msgs/TFMessage", "sensor_msgs/JointState"].includes(window.log.getStructuredType(key) ?? "")
        ),
      "/robot_description"
    ];
  }

  showTimeline(): boolean {
    return true;
  }

  getCommand(): Field3dRendererCommand {
    // Get timestamp
    let time = window.selection.getRenderTime();

    // A source-provided robot belongs to that Log, not to later live connections.
    if (this.robotLog !== window.log) {
      this.robotLog = window.log;
      if (!this.localRobotLoaded) {
        this.robot = parseURDF(DEFAULT_CAR_URDF);
        this.robotAssets = {};
        this.robotStatus.textContent = "MUR car · URDF";
      }
    }
    const description =
      window.log.getString("/robot_description/xml", time ?? 0, time ?? 0)?.values[0] ??
      window.log.getString("/robot_description/data", time ?? 0, time ?? 0)?.values[0] ??
      window.log.getString("/robot_description", time ?? 0, time ?? 0)?.values[0];
    if (description && !this.localRobotLoaded) {
      try {
        if (this.robotStatus.textContent !== "/robot_description") {
          this.robot = parseURDF(description);
          this.robotStatus.textContent = "/robot_description";
        }
      } catch (error) {
        this.robotStatus.textContent = String(error);
      }
    }
    this.spatial.robot = this.robot;
    this.spatial.assets = this.robotAssets;
    this.spatial.begin(window.log, time ?? 0);
    const fixed = this.fixedFrame.value;
    this.updateFrameControls(time ?? 0);
    this.layerStatus.replaceChildren();
    const status = (text: string, error = false) => {
      const chip = document.createElement("div");
      chip.textContent = text;
      chip.style.color = error ? "var(--health-crit)" : "var(--health-muted)";
      this.layerStatus.append(chip);
    };
    // Get field data
    let fieldData = [...(window.assets === null ? [] : window.assets.field3ds), ...BuiltIn3dFields].find(
      (game) => game.id === this.FIELD_SELECT.value
    );
    let objects: Field3dRendererCommand_AnyObj[] = [];
    let cameraOverride: AnnotatedPose3d | null = null;
    let sources = this.sourceList.getState(true);
    for (let i = 0; i < sources.length; i++) {
      let source = sources[i];
      let typeConfig = Field3dController_Config.types.find((typeConfig) => typeConfig.key === source.type);
      if (typeConfig?.childOf !== undefined) continue; // This is a child, don't render

      if (
        source.type === "spatial" &&
        !source.logType.includes("/") &&
        !window.log.getString(source.logKey + "/spatial", time ?? 0, time ?? 0)
      ) {
        source = {
          ...source,
          type: source.logType.endsWith("[]") ? "trajectory" : "robot",
          options: { ...source.options, model: "MUR car", color: "#aaa", size: "normal" }
        };
      }
      if (source.type === "spatial" && time !== null) {
        try {
          const result = this.spatial.objects(window.log, source.logKey, time, fixed, source.options);
          objects.push(...result.objects);
          const origin = window.log.getTimestampRange()[0];
          const recent = window.log.getString(source.logKey + "/spatial", time - 1, time)?.timestamps ?? [];
          const rawRecent = recent.length ? recent : window.log.getRaw(source.logKey, time - 1, time)?.timestamps ?? [];
          const hz = rawRecent.filter((t) => t > time - 1 && t <= time).length;
          const lag = time - result.stamp;
          const stale = lag > 1 && !source.logKey.endsWith("tf_static");
          this.sourceList.itemStatus.set(source.logKey, {
            text:
              result.frame +
              " · t+" +
              (result.stamp - origin).toFixed(2) +
              " s · " +
              hz +
              " Hz" +
              (stale ? " · LAG " + lag.toFixed(1) + " s" : ""),
            title: "Stamp " + result.stamp.toFixed(6) + " s (epoch), session start " + origin.toFixed(6) + " s",
            error: false,
            warn: stale
          });
        } catch (error) {
          this.sourceList.itemStatus.set(source.logKey, { text: String(error), error: true });
        }
        continue;
      }
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
      let isHeatmap = source.type === "heatmap";
      let poses: AnnotatedPose3d[] = [];

      if (!isHeatmap) {
        if (time !== null) {
          poses = grabPosesAuto(window.log, source.logKey, source.logType, time, this.UUID);
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
        poses = grabHeatmapData(window.log, source.logKey, source.logType, timeRange, this.UUID);
      }

      const frame = metadata(window.log, source.logKey).frame_id;
      if (frame && time !== null) {
        try {
          const transform = this.spatial.resolve(frame, fixed, time);
          poses = poses.map((pose) => ({ ...pose, pose: compose(transform, pose.pose) }));
          status(source.logKey + " · " + frame + " · cursor " + time.toFixed(3) + " s");
        } catch (error) {
          this.sourceList.itemStatus.set(source.logKey, { text: String(error), error: true });
          poses = [];
        }
      }
      // Add data from children
      let components: AnnotatedPose3d[] = [];
      let mechanismsXZ: MechanismState[] = [];
      let mechanismsYZ: MechanismState[] = [];
      let visionTargets: AnnotatedPose3d[] = [];
      let swerveModuleVelocities: {
        values: ModuleVelocity[];
        color: string;
      }[] = [];
      if (time !== null) {
        children.forEach((child) => {
          switch (child.type) {
            case "component": {
              // Components are always 3D poses so assume number array format
              components = components.concat(grabPosesAuto(window.log, child.logKey, child.logType, time!, this.UUID));
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
              let numberRotationUnits: "radians" | "degrees" = "radians";
              if ("units" in child.options) {
                numberRotationUnits = child.options.units === "degrees" ? "degrees" : "radians";
              }
              let rotations = grabPosesAuto(
                window.log,
                child.logKey,
                child.logType,
                time!,
                this.UUID,
                numberRotationUnits
              );
              if (rotations.length > 0) {
                poses.forEach((value) => {
                  value.pose.rotation = rotations[0].pose.rotation;
                });
              }
              break;
            }

            case "vision": {
              let newVisionTargets = grabPosesAuto(window.log, child.logKey, child.logType, time!, this.UUID);
              newVisionTargets.forEach((annotatedPose) => {
                annotatedPose.annotation.visionColor = child.options.color;
                annotatedPose.annotation.visionSize = child.options.size;
              });
              visionTargets = visionTargets.concat(newVisionTargets);
              break;
            }

            case "swerveModuleVelocities": {
              let states = grabModuleVelocities(window.log, child.logKey, time!, child.options.arrangement, this.UUID);
              swerveModuleVelocities.push({
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
              let tagCount =
                typeof source.options.variant === "string" && source.options.variant.startsWith("16h5")
                  ? APRIL_TAG_16H5_COUNT
                  : APRIL_TAG_36H11_COUNT;
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
      swerveModuleVelocities.reverse();

      // Add object
      switch (source.type) {
        case "robot":
          if (source.options.model === "MUR car") {
            poses.forEach((pose) =>
              objects.push({
                type: "urdf",
                robot: this.robot,
                assets: this.robotAssets,
                links: computeLinkPoses(this.robot, this.spatial.joints, pose.pose, (link) => {
                  const result = this.spatial.tree.lookup(fixed, link, time ?? 0);
                  return result.status === "ok" ? result.transform : null;
                }).links
              })
            );
            break;
          }
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
            swerveModuleVelocities: swerveModuleVelocities
          });
          break;
        case "ghost":
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
            swerveModuleVelocities: swerveModuleVelocities
          });
          break;
        case "gamePiece":
          objects.push({
            type: "gamePiece",
            variant: source.options.variant,
            poses: poses
          });
          break;
        case "trajectory":
          objects.push({
            type: "trajectory",
            color: source.options.color,
            size: source.options.size,
            poses: poses
          });
          break;
        case "heatmap":
          objects.push({
            type: "heatmap",
            poses: poses
          });
          break;
        case "aprilTag":
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
          objects.push({
            type: "axes",
            poses: poses
          });
          break;
        case "cone":
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
          if (cameraOverride === null) {
            cameraOverride = poses[0];
          }
          break;
      }
    }

    if (sources.length === 0)
      objects.push({
        type: "urdf",
        robot: this.robot,
        assets: this.robotAssets,
        links: computeLinkPoses(this.robot, {}, identity()).links
      });
    if (this.frameAxes.checked && time !== null) {
      const poses: AnnotatedPose3d[] = [];
      for (const frame of this.spatial.tree.getFrames()) {
        try {
          poses.push({ pose: this.spatial.resolve(frame, fixed, time), annotation: { is2DSource: false } });
        } catch (error) {
          status(String(error), true);
        }
      }
      objects.push({ type: "axes", poses });
    }
    if (this.staticTrack && this.FIELD_SELECT.value === "MUR:Track") {
      if (this.staticTrack.centreline)
        objects.push({
          type: "trajectory",
          color: "#aaa",
          size: "normal",
          poses: this.staticTrack.points.map((point) => ({
            pose: { translation: point.position, rotation: [1, 0, 0, 0] },
            annotation: { is2DSource: false }
          }))
        });
      else
        for (const point of this.staticTrack.points) {
          objects.push({
            type: "marker",
            frameTransform: identity(),
            marker: {
              type: 3,
              shape: "cone",
              pose: {
                translation: [point.position[0], point.position[1], point.position[2] + 0.16],
                rotation: [1, 0, 0, 0]
              },
              scale: { x: 0.25, y: 0.25, z: 0.32 },
              color:
                point.class === "blue"
                  ? { r: 0.05, g: 0.3, b: 1, a: 1 }
                  : point.class === "yellow"
                  ? { r: 1, g: 0.8, b: 0, a: 1 }
                  : { r: 1, g: 0.4, b: 0, a: 1 }
            }
          });
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
      if (["robot", "ghost"].includes(source.type)) {
        allRobotModels.add(source.options.model);
      }
    });

    return {
      field: this.FIELD_SELECT.value,
      objects: objects,
      cameraOverride: cameraOverride,
      allRobotModels: [...allRobotModels]
    };
  }
}
