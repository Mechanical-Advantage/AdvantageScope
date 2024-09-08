import { SourceListState } from "../../shared/SourceListConfig";
import { Rotation2d, grabChassiSpeeds, grabPosesAuto, grabSwerveStates, rotation3dTo2d } from "../../shared/geometry";
import { Orientation } from "../../shared/renderers/OdometryRenderer";
import { SwerveRendererCommand } from "../../shared/renderers/SwerveRenderer";
import { clampValue, createUUID } from "../../shared/util";
import SourceList from "../SourceList";
import SwerveController_Config from "./SwerveController_Config";
import TabController from "./TabController";

export default class SwerveController implements TabController {
  UUID = createUUID();

  private MAX_SPEED: HTMLInputElement;
  private SIZE_X: HTMLInputElement;
  private SIZE_Y: HTMLInputElement;
  private ORIENTATION_SWITCHER: HTMLElement;

  private sourceList: SourceList;
  private orientation = Orientation.DEG_90;

  constructor(root: HTMLElement) {
    this.sourceList = new SourceList(root.firstElementChild as HTMLElement, SwerveController_Config, []);
    let settings = root.getElementsByClassName("swerve-settings")[0] as HTMLElement;
    this.MAX_SPEED = settings.getElementsByClassName("max-speed")[0] as HTMLInputElement;
    this.SIZE_X = settings.getElementsByClassName("size-x")[0] as HTMLInputElement;
    this.SIZE_Y = settings.getElementsByClassName("size-y")[0] as HTMLInputElement;
    this.ORIENTATION_SWITCHER = settings.getElementsByClassName("orientation-switcher")[0] as HTMLElement;

    // Enforce ranges
    this.MAX_SPEED.addEventListener("change", () => {
      if (Number(this.MAX_SPEED.value) <= 0) this.MAX_SPEED.value = "0.1";
    });
    this.SIZE_X.addEventListener("change", () => {
      if (Number(this.SIZE_X.value) <= 0) this.SIZE_X.value = "0.1";
    });
    this.SIZE_Y.addEventListener("change", () => {
      if (Number(this.SIZE_Y.value) <= 0) this.SIZE_Y.value = "0.1";
    });

    // Orientation controls
    this.ORIENTATION_SWITCHER.children[0].addEventListener("click", () => {
      this.orientation--;
      if (this.orientation < 0) this.orientation = 3;
    });
    this.ORIENTATION_SWITCHER.children[1].addEventListener("click", () => {
      this.orientation++;
      if (this.orientation > 3) this.orientation = 0;
    });
  }

  saveState(): unknown {
    return {
      sources: this.sourceList.getState(),
      maxSpeed: Number(this.MAX_SPEED.value),
      sizeX: Number(this.SIZE_X.value),
      sizeY: Number(this.SIZE_Y.value),
      orientation: this.orientation
    };
  }

  restoreState(state: unknown): void {
    if (typeof state !== "object" || state === null) return;

    if ("sources" in state) {
      this.sourceList.setState(state.sources as SourceListState);
    }
    if ("maxSpeed" in state && typeof state.maxSpeed === "number") {
      this.MAX_SPEED.value = state.maxSpeed.toString();
    }
    if ("sizeX" in state && typeof state.sizeX === "number") {
      this.SIZE_X.value = state.sizeX.toString();
    }
    if ("sizeY" in state && typeof state.sizeY === "number") {
      this.SIZE_Y.value = state.sizeY.toString();
    }
    if (
      "orientation" in state &&
      (state.orientation === Orientation.DEG_0 ||
        state.orientation === Orientation.DEG_90 ||
        state.orientation === Orientation.DEG_180 ||
        state.orientation === Orientation.DEG_270)
    ) {
      this.orientation = state.orientation;
    }
  }

  refresh(): void {
    this.sourceList.refresh();
  }

  newAssets(): void {}

  getActiveFields(): string[] {
    return this.sourceList.getActiveFields();
  }

  showTimeline(): boolean {
    return true;
  }

  getCommand(): SwerveRendererCommand {
    let time = window.selection.getRenderTime();
    if (time === null) time = window.log.getTimestampRange()[1];

    let rotation: Rotation2d = 0;
    let commandStates: SwerveRendererCommand["states"] = [];
    let commandSpeeds: SwerveRendererCommand["speeds"] = [];
    let sources = this.sourceList.getState(true);
    for (let i = 0; i < sources.length; i++) {
      let source = sources[i];
      let units: "radians" | "degrees" = "radians";
      if ("units" in source.options) {
        units = source.options.units === "degrees" ? "degrees" : "radians";
      }

      if (source.type === "states" || source.type === "statesLegacy") {
        let states = grabSwerveStates(
          window.log,
          source.logKey,
          source.logType,
          time,
          source.options.arrangement,
          units,
          this.UUID
        );
        states.forEach((state) => {
          // Normalize
          state.speed = clampValue(state.speed / Number(this.MAX_SPEED.value), -1, 1);
        });
        commandStates.push({
          values: states,
          color: source.options.color
        });
      } else if (source.type === "chassisSpeeds") {
        let speeds = grabChassiSpeeds(window.log, source.logKey, time, this.UUID);
        let angle = Math.atan2(speeds.vy, speeds.vx);
        let length = Math.hypot(speeds.vx, speeds.vy);
        length = clampValue(length / Number(this.MAX_SPEED.value), -1, 1);
        speeds.vx = Math.cos(angle) * length;
        speeds.vy = Math.sin(angle) * length;
        commandSpeeds.push({
          value: speeds,
          color: source.options.color
        });
      } else {
        let poses = grabPosesAuto(window.log, source.logKey, source.logType, time, this.UUID, undefined, units);
        if (poses.length > 0) {
          rotation = rotation3dTo2d(poses[0].pose.rotation);
        }
      }
    }
    rotation += this.orientation * (Math.PI / 2);

    commandStates.reverse();
    commandSpeeds.reverse();
    return {
      rotation: rotation,
      frameAspectRatio: Number(this.SIZE_Y.value) / Number(this.SIZE_X.value),
      states: commandStates,
      speeds: commandSpeeds
    };
  }
}
