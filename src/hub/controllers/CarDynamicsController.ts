// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Ported from the upstream SwerveController. The settings and orientation controls are stock; the
// sources are one numeric field per measured signal instead of swerve structs.

import { NeonColors_RedStart } from "../../shared/Colors";
import { SourceListState } from "../../shared/SourceListConfig";
import { CarDynamicsRendererCommand } from "../../shared/renderers/CarDynamicsRenderer";
import { Orientation } from "../../shared/renderers/Field2dRenderer";
import { Units } from "../../shared/units";
import { clampValue, createUUID } from "../../shared/util";
import SourceList from "../SourceList";
import CarDynamicsController_Config, { CarDynamicsDefaults } from "./CarDynamicsController_Config";
import { DbcSlotFields, numberAt } from "./DbcFields";
import TabController, { setupKeyboardControls } from "./TabController";

/** Acceleration at the edge of the g circle */
const G_CIRCLE_FULL_SCALE = 2;

export default class CarDynamicsController implements TabController {
  UUID = createUUID();

  private MAX_SPEED: HTMLInputElement;
  private STEERING_RATIO: HTMLInputElement;
  private SIZE_X: HTMLInputElement;
  private SIZE_Y: HTMLInputElement;
  private ORIENTATION_SWITCHER: HTMLElement;

  private sourceList: SourceList;
  private fields = new DbcSlotFields(CarDynamicsDefaults);
  private orientation = Orientation.DEG_90;

  constructor(root: HTMLElement) {
    this.sourceList = new SourceList(root.firstElementChild as HTMLElement, CarDynamicsController_Config, []);
    let settings = root.getElementsByClassName("car-dynamics-settings")[0] as HTMLElement;
    this.MAX_SPEED = settings.getElementsByClassName("max-speed")[0] as HTMLInputElement;
    this.STEERING_RATIO = settings.getElementsByClassName("steering-ratio")[0] as HTMLInputElement;
    this.SIZE_X = settings.getElementsByClassName("size-x")[0] as HTMLInputElement;
    this.SIZE_Y = settings.getElementsByClassName("size-y")[0] as HTMLInputElement;
    this.ORIENTATION_SWITCHER = settings.getElementsByClassName("orientation-switcher")[0] as HTMLElement;

    // Enforce ranges
    this.MAX_SPEED.addEventListener("change", () => {
      if (Number(this.MAX_SPEED.value) <= 0) this.MAX_SPEED.value = "0.1";
    });
    this.STEERING_RATIO.addEventListener("change", () => {
      if (Number(this.STEERING_RATIO.value) <= 0) this.STEERING_RATIO.value = "0.1";
    });
    this.SIZE_X.addEventListener("change", () => {
      if (Number(this.SIZE_X.value) <= 0) this.SIZE_X.value = "0.1";
    });
    this.SIZE_Y.addEventListener("change", () => {
      if (Number(this.SIZE_Y.value) <= 0) this.SIZE_Y.value = "0.1";
    });

    // Orientation controls
    setupKeyboardControls(this.ORIENTATION_SWITCHER.children[0] as HTMLElement);
    this.ORIENTATION_SWITCHER.children[0].addEventListener("click", () => {
      this.orientation++;
      if (this.orientation > 3) this.orientation = 0;
    });
    setupKeyboardControls(this.ORIENTATION_SWITCHER.children[1] as HTMLElement);
    this.ORIENTATION_SWITCHER.children[1].addEventListener("click", () => {
      this.orientation--;
      if (this.orientation < 0) this.orientation = 3;
    });
  }

  dispose() {
    this.sourceList.stop();
  }

  saveState(): unknown {
    return {
      sources: this.sourceList.getState(),
      maxSpeed: Number(this.MAX_SPEED.value),
      steeringRatio: Number(this.STEERING_RATIO.value),
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
    if ("steeringRatio" in state && typeof state.steeringRatio === "number") {
      this.STEERING_RATIO.value = state.steeringRatio.toString();
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
    this.fields.refresh();
  }

  newAssets(): void {}

  getActiveFields(): string[] {
    return [...this.sourceList.getActiveFields(), ...this.fields.keys(this.sourceList.getState())];
  }

  showTimeline(): boolean {
    return true;
  }

  getCommand(): CarDynamicsRendererCommand {
    let time = window.selection.getRenderTime();
    if (time === null) time = window.log.getTimestampRange()[1];

    let fields = this.fields.resolve(this.sourceList.getState());
    let read = (slot: string, unit: string) => numberAt(fields[slot], time!, unit, this.UUID);

    // Front wheels turn by the road wheel angle, rear wheels stay straight
    let steering = read("steering", "degrees");
    let speedFL = read("speedFL", "kilometers/hour");
    let speedFR = read("speedFR", "kilometers/hour");
    let moduleVelocities: CarDynamicsRendererCommand["moduleVelocities"] = [];
    if (steering !== null || speedFL !== null || speedFR !== null) {
      let roadWheelAngle = (((steering ?? 0) / Number(this.STEERING_RATIO.value)) * Math.PI) / 180;
      let normalize = (speed: number | null) => clampValue((speed ?? 0) / Number(this.MAX_SPEED.value), -1, 1);
      moduleVelocities.push({
        values: [
          { velocity: normalize(speedFL), angle: roadWheelAngle },
          { velocity: normalize(speedFR), angle: roadWheelAngle },
          { velocity: 0, angle: 0 },
          { velocity: 0, angle: 0 }
        ],
        color: NeonColors_RedStart[0].key
      });
    }

    // Yaw rate is drawn as the stock angular speed arc
    let yawRate = read("yawRate", "radians/second");
    let robotVelocities: CarDynamicsRendererCommand["robotVelocities"] = [];
    if (yawRate !== null) {
      robotVelocities.push({ value: { vx: 0, vy: 0, omega: yawRate }, color: NeonColors_RedStart[1].key });
    }

    // Acceleration scaled to the g circle. The DBC unit "m/s^2" is not a recognised unit name, so
    // unconverted values are taken as m/s².
    let accelX = read("accelX", "meters/second²");
    let accelY = read("accelY", "meters/second²");
    let accel: CarDynamicsRendererCommand["accel"] = null;
    if (accelX !== null || accelY !== null) {
      let x = Units.convert(accelX ?? 0, "meters/second²", "standard gravity") / G_CIRCLE_FULL_SCALE;
      let y = Units.convert(accelY ?? 0, "meters/second²", "standard gravity") / G_CIRCLE_FULL_SCALE;
      let length = Math.hypot(x, y);
      if (length > 1) {
        x /= length;
        y /= length;
      }
      accel = { x: x, y: y, fullScale: G_CIRCLE_FULL_SCALE };
    }

    return {
      rotation: this.orientation * (Math.PI / 2),
      frameAspectRatio: Number(this.SIZE_Y.value) / Number(this.SIZE_X.value),
      moduleVelocities: moduleVelocities,
      robotVelocities: robotVelocities,
      accel: accel,
      dampers: ["shockFL", "shockFR", "shockRL", "shockRR"].map((slot) => read(slot, "millimeters"))
    };
  }
}
