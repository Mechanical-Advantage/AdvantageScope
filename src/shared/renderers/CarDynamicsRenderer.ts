// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Ported from the upstream SwerveRenderer. The frame, modules, arrows and angular speed arc are
// unchanged; the g circle and damper readouts are added at the end.

import { NeonColors_RedStart } from "../Colors";
import { RobotVelocities, Rotation2d } from "../geometry";
import { transformPx, wrapRadians } from "../util";
import TabRenderer from "./TabRenderer";

export default class CarDynamicsRenderer implements TabRenderer {
  private CONTAINER: HTMLElement;
  private CANVAS: HTMLCanvasElement;

  private BLACK_COLOR = "#222222";
  private WHITE_COLOR = "#eeeeee";

  private lastRenderState = "";

  constructor(root: HTMLElement) {
    this.CONTAINER = root.firstElementChild as HTMLElement;
    this.CANVAS = this.CONTAINER.firstElementChild as HTMLCanvasElement;
  }

  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {}

  getAspectRatio(): number | null {
    return 1;
  }

  render(command: CarDynamicsRendererCommand): void {
    // Exit if render state unchanged
    let renderState: any[] = [
      this.CONTAINER.clientWidth,
      this.CONTAINER.clientHeight,
      window.matchMedia("(prefers-color-scheme: dark)").matches,
      window.devicePixelRatio,
      command
    ];
    let renderStateString = JSON.stringify(renderState);
    if (renderStateString === this.lastRenderState) {
      return;
    }

    this.lastRenderState = "";

    // Update canvas size
    let context = this.CANVAS.getContext("2d") as CanvasRenderingContext2D;
    let size = Math.min(this.CONTAINER.clientWidth, this.CONTAINER.clientHeight);
    this.CANVAS.style.width = size.toString() + "px";
    this.CANVAS.style.height = size.toString() + "px";
    this.CANVAS.width = size * window.devicePixelRatio;
    this.CANVAS.height = size * window.devicePixelRatio;
    context.scale(window.devicePixelRatio, window.devicePixelRatio);
    context.clearRect(0, 0, size, size);
    context.lineCap = "round";
    context.lineJoin = "round";
    let centerPx: [number, number] = [size / 2, size / 2];
    let isLight = !window.matchMedia("(prefers-color-scheme: dark)").matches;
    let strokeColor = isLight ? this.BLACK_COLOR : this.WHITE_COLOR;

    // Calculate component dimensions
    let frameWidthPx = size * 0.3 * Math.min(command.frameAspectRatio, 1);
    let frameHeightPx = (size * 0.3) / Math.max(command.frameAspectRatio, 1);
    let moduleRadiusPx = size * 0.05;
    let fullVectorPx = size * 0.25;

    // Draw frame
    context.strokeStyle = strokeColor;
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(...transformPx(centerPx, command.rotation, [frameHeightPx / 2, frameWidthPx / 2 - moduleRadiusPx]));
    context.lineTo(...transformPx(centerPx, command.rotation, [frameHeightPx / 2, -frameWidthPx / 2 + moduleRadiusPx]));
    context.stroke();
    context.beginPath();
    context.moveTo(...transformPx(centerPx, command.rotation, [frameHeightPx / 2 - moduleRadiusPx, -frameWidthPx / 2]));
    context.lineTo(
      ...transformPx(centerPx, command.rotation, [-frameHeightPx / 2 + moduleRadiusPx, -frameWidthPx / 2])
    );
    context.stroke();
    context.beginPath();
    context.moveTo(...transformPx(centerPx, command.rotation, [frameHeightPx / 2 - moduleRadiusPx, frameWidthPx / 2]));
    context.lineTo(...transformPx(centerPx, command.rotation, [-frameHeightPx / 2 + moduleRadiusPx, frameWidthPx / 2]));
    context.stroke();
    context.beginPath();
    context.moveTo(...transformPx(centerPx, command.rotation, [-frameHeightPx / 2, frameWidthPx / 2 - moduleRadiusPx]));
    context.lineTo(
      ...transformPx(centerPx, command.rotation, [-frameHeightPx / 2, -frameWidthPx / 2 + moduleRadiusPx])
    );
    context.stroke();

    // Draw arrow on robot
    context.strokeStyle = strokeColor;
    context.lineWidth = 4;
    const hasSpeeds = command.robotVelocities.length > 0;
    let arrowBack = transformPx(
      centerPx,
      command.rotation,
      hasSpeeds ? [frameHeightPx * 0.5, 0] : [frameHeightPx * -0.3, 0]
    );
    let arrowFront = transformPx(
      centerPx,
      command.rotation,
      hasSpeeds ? [frameHeightPx * 0.8, 0] : [frameHeightPx * 0.3, 0]
    );
    let arrowLeft = transformPx(
      centerPx,
      command.rotation,
      hasSpeeds ? [frameHeightPx * 0.65, frameWidthPx * 0.15] : [frameHeightPx * 0.15, frameWidthPx * 0.15]
    );
    let arrowRight = transformPx(
      centerPx,
      command.rotation,
      hasSpeeds ? [frameHeightPx * 0.65, frameWidthPx * -0.15] : [frameHeightPx * 0.15, frameWidthPx * -0.15]
    );
    context.beginPath();
    context.moveTo(...arrowBack);
    context.lineTo(...arrowFront);
    context.moveTo(...arrowLeft);
    context.lineTo(...arrowFront);
    context.lineTo(...arrowRight);
    context.stroke();

    // Draw modules
    [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1]
    ].forEach((corner, index) => {
      let moduleCenterPx = transformPx(centerPx, command.rotation, [
        (frameHeightPx / 2) * corner[0],
        (frameWidthPx / 2) * corner[1]
      ]);

      // Draw module data
      let drawModuleData = (state: { angle: number; velocity: number | null }, color: string) => {
        let fullRotation = command.rotation + state.angle;
        context.fillStyle = color;
        context.strokeStyle = color;
        context.lineWidth = 4;

        // Draw rotation
        context.beginPath();
        if (command.moduleVelocities.length >= 2) {
          context.moveTo(...moduleCenterPx);
        } else {
          context.moveTo(...transformPx(moduleCenterPx, fullRotation, [moduleRadiusPx, 0]));
        }
        context.arc(
          ...moduleCenterPx,
          moduleRadiusPx,
          -wrapRadians(fullRotation - (5 * Math.PI) / 6),
          -wrapRadians(fullRotation + (5 * Math.PI) / 6)
        );
        context.closePath();
        context.fill();

        // Draw speed
        if (state.velocity === null || Math.abs(state.velocity) <= 0.001) return;
        let vectorSpeed = state.velocity;
        let vectorRotation = fullRotation;
        if (state.velocity < 0) {
          vectorSpeed *= -1;
          vectorRotation += Math.PI;
        }
        if (vectorSpeed < 0.05) return;
        let vectorLength = fullVectorPx * vectorSpeed;
        let arrowBack = transformPx(moduleCenterPx, vectorRotation, [moduleRadiusPx, 0]);
        let arrowFront = transformPx(moduleCenterPx, vectorRotation, [moduleRadiusPx + vectorLength, 0]);
        let arrowLeft = transformPx(moduleCenterPx, vectorRotation, [
          moduleRadiusPx + vectorLength - moduleRadiusPx * 0.4,
          moduleRadiusPx * 0.4
        ]);
        let arrowRight = transformPx(moduleCenterPx, vectorRotation, [
          moduleRadiusPx + vectorLength - moduleRadiusPx * 0.4,
          moduleRadiusPx * -0.4
        ]);
        context.beginPath();
        context.moveTo(...arrowBack);
        context.lineTo(...arrowFront);
        context.moveTo(...arrowLeft);
        context.lineTo(...arrowFront);
        context.lineTo(...arrowRight);
        context.stroke();
      };
      command.moduleVelocities.forEach((set) => {
        if (index < set.values.length) {
          drawModuleData(set.values[index], set.color);
        }
      });

      // Draw module outline
      context.strokeStyle = strokeColor;
      context.lineWidth = 4;
      context.beginPath();
      context.arc(...moduleCenterPx, moduleRadiusPx, 0, Math.PI * 2);
      context.stroke();
    });

    // Draw robot velocities
    command.robotVelocities.forEach((speed) => {
      context.strokeStyle = speed.color;
      context.lineWidth = 4;

      // Linear speed
      let angle = Math.atan2(speed.value.vy, speed.value.vx);
      let length = Math.hypot(speed.value.vx, speed.value.vy);
      if (length >= 0.05) {
        length *= fullVectorPx;

        let arrowBack = transformPx(centerPx, command.rotation + angle, [0, 0]);
        let arrowFront = transformPx(centerPx, command.rotation + angle, [length, 0]);
        let arrowLeft = transformPx(centerPx, command.rotation + angle, [
          length - moduleRadiusPx * 0.4,
          moduleRadiusPx * 0.4
        ]);
        let arrowRight = transformPx(centerPx, command.rotation + angle, [
          length - moduleRadiusPx * 0.4,
          moduleRadiusPx * -0.4
        ]);
        context.beginPath();
        context.moveTo(...arrowBack);
        context.lineTo(...arrowFront);
        context.moveTo(...arrowLeft);
        context.lineTo(...arrowFront);
        context.lineTo(...arrowRight);
        context.stroke();
      }

      // Angular speed
      if (Math.abs(speed.value.omega) > 0.1) {
        context.beginPath();
        context.arc(
          centerPx[0],
          centerPx[1],
          frameWidthPx * 0.25,
          -command.rotation,
          -(command.rotation + speed.value.omega),
          speed.value.omega > 0
        );
        let arrowFront = transformPx(centerPx, command.rotation + speed.value.omega, [frameWidthPx * 0.25, 0]);
        let arrowLeft = transformPx(
          centerPx,
          command.rotation + speed.value.omega - 0.3 * Math.sign(speed.value.omega),
          [frameWidthPx * 0.25 - moduleRadiusPx * 0.4, 0]
        );
        let arrowRight = transformPx(
          centerPx,
          command.rotation + speed.value.omega - 0.3 * Math.sign(speed.value.omega),
          [frameWidthPx * 0.25 + moduleRadiusPx * 0.4, 0]
        );
        context.lineTo(...arrowFront);
        context.moveTo(...arrowLeft);
        context.lineTo(...arrowFront);
        context.lineTo(...arrowRight);
        context.stroke();
      }
    });

    // Draw damper positions beside each wheel
    context.fillStyle = strokeColor;
    context.font = (size * 0.035).toString() + "px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    command.dampers.forEach((value, index) => {
      if (value === null) return;
      let corner = [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1]
      ][index];
      let textPx = transformPx(centerPx, command.rotation, [
        (frameHeightPx / 2) * corner[0],
        (frameWidthPx / 2 + moduleRadiusPx + size * 0.08) * corner[1]
      ]);
      context.fillText(value.toFixed(1) + " mm", ...textPx);
    });

    // Draw g circle in the bottom left corner, turned with the car
    if (command.accel !== null) {
      let circleCenterPx: [number, number] = [size * 0.14, size * 0.86];
      let circleRadiusPx = size * 0.1;
      context.strokeStyle = strokeColor;
      context.lineWidth = 2;
      context.beginPath();
      context.arc(...circleCenterPx, circleRadiusPx, 0, Math.PI * 2);
      context.moveTo(...transformPx(circleCenterPx, command.rotation, [circleRadiusPx, 0]));
      context.lineTo(...transformPx(circleCenterPx, command.rotation, [-circleRadiusPx, 0]));
      context.moveTo(...transformPx(circleCenterPx, command.rotation, [0, circleRadiusPx]));
      context.lineTo(...transformPx(circleCenterPx, command.rotation, [0, -circleRadiusPx]));
      context.stroke();
      context.textAlign = "left";
      context.textBaseline = "bottom";
      context.fillText(
        command.accel.fullScale.toString() + " g",
        circleCenterPx[0] + circleRadiusPx * 0.75,
        circleCenterPx[1] - circleRadiusPx * 0.75
      );
      context.fillStyle = NeonColors_RedStart[2].key;
      context.beginPath();
      context.arc(
        ...transformPx(circleCenterPx, command.rotation, [
          command.accel.x * circleRadiusPx,
          command.accel.y * circleRadiusPx
        ]),
        moduleRadiusPx * 0.4,
        0,
        Math.PI * 2
      );
      context.fill();
    }
    this.lastRenderState = renderStateString;
  }
}

export type CarDynamicsRendererCommand = {
  rotation: Rotation2d;
  frameAspectRatio: number;
  moduleVelocities: {
    values: { angle: number; velocity: number | null }[];
    color: string;
  }[];
  robotVelocities: {
    value: RobotVelocities;
    color: string;
  }[];
  /** Longitudinal (forward) and lateral (left) acceleration as fractions of the g circle */
  accel: { x: number; y: number; fullScale: number } | null;
  /** Damper positions in mm, FL/FR/RL/RR */
  dampers: (number | null)[];
};
