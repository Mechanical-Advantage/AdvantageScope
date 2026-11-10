// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Ported from the upstream JoysticksRenderer. It keeps the canvas, colours, line widths, axis bars and
// aspect-fit layout, and draws one steering wheel and three pedal bars instead of joystick layouts.

import { scaleValue } from "../util";
import TabRenderer from "./TabRenderer";

export default class DriverInputsRenderer implements TabRenderer {
  private CANVAS: HTMLCanvasElement;

  private BLACK_COLOR = "#222222";
  private WHITE_COLOR = "#eeeeee";

  private lastRenderState = "";

  constructor(root: HTMLElement) {
    this.CANVAS = root.getElementsByTagName("canvas")[0] as HTMLCanvasElement;
  }

  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {}

  getAspectRatio(): number | null {
    return null;
  }

  render(command: DriverInputsRendererCommand): void {
    // Set up canvas
    let context = this.CANVAS.getContext("2d") as CanvasRenderingContext2D;
    let canvasWidth = this.CANVAS.clientWidth;
    let canvasHeight = this.CANVAS.clientHeight;
    let isLight = !window.matchMedia("(prefers-color-scheme: dark)").matches;

    // Exit if render state unchanged
    let renderState: any[] = [canvasWidth, canvasHeight, isLight, window.devicePixelRatio, command];
    let renderStateString = JSON.stringify(renderState);
    if (renderStateString === this.lastRenderState) {
      return;
    }

    this.lastRenderState = "";

    // Apply setup and scaling
    this.CANVAS.width = canvasWidth * window.devicePixelRatio;
    this.CANVAS.height = canvasHeight * window.devicePixelRatio;
    context.scale(window.devicePixelRatio, window.devicePixelRatio);
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    let color = isLight ? this.BLACK_COLOR : this.WHITE_COLOR;

    // Render message if no data
    if (
      command.steering === null &&
      command.throttle === null &&
      command.brakeFront === null &&
      command.brakeRear === null
    ) {
      context.font = "italic 16px sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = color;
      context.fillText("Drag steering, throttle and brake fields to Sources.", canvasWidth / 2, canvasHeight / 2);
      this.lastRenderState = renderStateString;
      return;
    }

    // Fit the layout to the canvas
    let backgroundWidth = 560;
    let backgroundHeight = 310;
    let left: number, top: number, width: number, height: number;
    let sourceAspectRatio = backgroundWidth / backgroundHeight;
    let targetAspectRatio = canvasWidth / canvasHeight;
    if (sourceAspectRatio > targetAspectRatio) {
      left = 0;
      top = canvasHeight / 2 - canvasWidth / sourceAspectRatio / 2;
      width = canvasWidth;
      height = canvasWidth / sourceAspectRatio;
    } else {
      left = canvasWidth / 2 - (canvasHeight * sourceAspectRatio) / 2;
      top = 0;
      width = canvasHeight * sourceAspectRatio;
      height = canvasHeight;
    }
    let scaleX = (x: number) => scaleValue(x, [0, backgroundWidth], [left, left + width]);
    let scaleY = (y: number) => scaleValue(y, [0, backgroundHeight], [top, top + height]);
    let scaleSize = (size: number) => (size / backgroundWidth) * width;
    context.fillStyle = color;
    context.strokeStyle = color;
    context.lineWidth = 5;
    context.lineCap = "round";

    // Function to draw a name and value under a component
    let drawLabel = (centerX: number, name: string, value: string) => {
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = color;
      context.font = scaleSize(20).toString() + "px sans-serif";
      context.fillText(name, scaleX(centerX), scaleY(262));
      context.font = "bold " + scaleSize(20).toString() + "px sans-serif";
      context.fillText(value, scaleX(centerX), scaleY(290));
    };

    // Function to draw an axis (from the joysticks renderer)
    let drawAxis = (centerPx: [number, number], sizePx: [number, number], scaledValue: number) => {
      let x = scaleX(centerPx[0] - sizePx[0] / 2);
      let y = scaleY(centerPx[1] - sizePx[1] / 2);
      let axisWidth = scaleSize(sizePx[0]);
      let axisHeight = scaleSize(sizePx[1]);

      scaledValue = Math.max(Math.min(scaledValue, 1), 0);
      context.strokeRect(x, y, axisWidth, axisHeight);
      context.fillRect(x, y + axisHeight - axisHeight * scaledValue, axisWidth, axisHeight * scaledValue);
    };

    // Draw an original formula wheel silhouette with grip openings and a blank display.
    let wheelCenter: [number, number] = [150, 130];
    context.save();
    context.translate(scaleX(wheelCenter[0]), scaleY(wheelCenter[1]));
    context.rotate(-((command.steering ?? 0) * Math.PI) / 180); // Positive turns left
    context.scale(scaleSize(1), scaleSize(1));
    context.lineWidth = 5 / scaleSize(1);
    const wheel = new Path2D(
      "M -105 -62 Q -120 -30 -116 22 Q -112 66 -87 70 " +
        "L -63 66 Q -35 48 0 48 Q 35 48 63 66 L 87 70 " +
        "Q 112 66 116 22 Q 120 -30 105 -62 Q 94 -78 72 -70 " +
        "Q 0 -86 -72 -70 Q -94 -78 -105 -62 Z " +
        "M -84 -48 Q -97 -29 -94 12 Q -92 37 -79 43 " +
        "L -58 30 Q -48 20 -59 7 L -65 -5 Q -47 -34 -65 -48 Z " +
        "M 84 -48 Q 97 -29 94 12 Q 92 37 79 43 " +
        "L 58 30 Q 48 20 59 7 L 65 -5 Q 47 -34 65 -48 Z " +
        "M -36 -55 L 36 -55 L 36 -15 L -36 -15 Z"
    );
    context.fill(wheel, "evenodd");
    context.stroke(wheel);
    context.restore();
    drawLabel(wheelCenter[0], "Steering", command.steering === null ? "—" : command.steering.toFixed(1) + "°");

    // Draw pedal bars
    let bars: [string, number | null, number, string][] = [
      ["Throttle", command.throttle, 100, "%"],
      ["Brake F", command.brakeFront, command.brakeScale, " psi"],
      ["Brake R", command.brakeRear, command.brakeScale, " psi"]
    ];
    bars.forEach(([name, value, fullScale, suffix], index) => {
      let centerX = 320 + index * 90;
      drawAxis([centerX, 130], [40, 200], value === null ? 0 : value / fullScale);
      drawLabel(centerX, name, value === null ? "—" : value.toFixed(0) + suffix);
    });
    this.lastRenderState = renderStateString;
  }
}

export type DriverInputsRendererCommand = {
  /** Steering wheel angle in degrees, positive left */
  steering: number | null;
  /** Throttle in percent */
  throttle: number | null;
  /** Brake line pressures in psi */
  brakeFront: number | null;
  brakeRear: number | null;
  /** Brake pressure at a full bar, in psi */
  brakeScale: number;
};
