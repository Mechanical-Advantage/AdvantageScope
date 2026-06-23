// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { JoystickState } from "../log/LogUtil";
import { scaleValue } from "../util";
import TabRenderer from "./TabRenderer";

export default class JoysticksRenderer implements TabRenderer {
  private CANVAS: HTMLCanvasElement;
  private IMAGES: HTMLImageElement[] = [];

  private YELLOW_COLOR = "#ffff00";
  private BLACK_COLOR = "#222222";
  private WHITE_COLOR = "#eeeeee";

  private lastRenderState = "";
  private imageLoadCount = 0;

  constructor(root: HTMLElement) {
    this.CANVAS = root.getElementsByTagName("canvas")[0] as HTMLCanvasElement;
    for (let i = 0; i < 6; i++) {
      let image = document.createElement("img");
      this.IMAGES.push(image);
      image.addEventListener("load", () => {
        this.imageLoadCount++;
      });
    }
  }

  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {}

  getAspectRatio(): number | null {
    return null;
  }

  render(command: JoysticksRendererCommand): void {
    // Set up canvas
    let context = this.CANVAS.getContext("2d") as CanvasRenderingContext2D;
    let canvasWidth = this.CANVAS.clientWidth;
    let canvasHeight = this.CANVAS.clientHeight;
    let isLight = !window.matchMedia("(prefers-color-scheme: dark)").matches;

    // Exit if render state unchanged
    let renderState: any[] = [
      canvasWidth,
      canvasHeight,
      isLight,
      window.devicePixelRatio,
      command,
      this.imageLoadCount
    ];
    let renderStateString = JSON.stringify(renderState);
    if (renderStateString === this.lastRenderState) {
      return;
    }
    this.lastRenderState = renderStateString;

    // Apply setup and scaling
    this.CANVAS.width = canvasWidth * window.devicePixelRatio;
    this.CANVAS.height = canvasHeight * window.devicePixelRatio;
    context.scale(window.devicePixelRatio, window.devicePixelRatio);
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    // Iterate over joysticks
    command.forEach((joystick, index) => {
      let config = window.assets?.joysticks.find((joystickConfig) => joystickConfig.name === joystick.layout);

      // Update image element
      let imageElement = this.IMAGES[index];
      if (config) {
        if (imageElement.src !== config.path) {
          imageElement.src = config.path;
        }
        if (!(imageElement.width > 0 && imageElement.height > 0)) {
          return;
        }
      }

      // Calculate region boundaries
      let joystickRegionWidth: number,
        joystickRegionHeight: number,
        joystickRegionLeft: number,
        joystickRegionTop: number;
      switch (command.length) {
        case 1:
          joystickRegionWidth = canvasWidth;
          joystickRegionHeight = canvasHeight;
          joystickRegionLeft = 0;
          joystickRegionTop = 0;
          break;
        case 2:
          joystickRegionWidth = canvasWidth / 2;
          joystickRegionHeight = canvasHeight;
          joystickRegionLeft = joystickRegionWidth * index;
          joystickRegionTop = 0;
          break;
        case 3:
          joystickRegionHeight = canvasHeight / 2;
          if (index < 2) {
            joystickRegionWidth = canvasWidth / 2;
            joystickRegionLeft = joystickRegionWidth * index;
            joystickRegionTop = 0;
          } else {
            joystickRegionWidth = canvasWidth;
            joystickRegionLeft = 0;
            joystickRegionTop = canvasHeight / 2;
          }
          break;
        case 4:
          joystickRegionWidth = canvasWidth / 2;
          joystickRegionHeight = canvasHeight / 2;
          if (index < 2) {
            joystickRegionLeft = joystickRegionWidth * index;
            joystickRegionTop = 0;
          } else {
            joystickRegionLeft = joystickRegionWidth * (index - 2);
            joystickRegionTop = joystickRegionHeight;
          }
          break;
        case 5:
          joystickRegionHeight = canvasHeight / 2;
          if (index < 2) {
            joystickRegionWidth = canvasWidth / 2;
            joystickRegionLeft = joystickRegionWidth * index;
            joystickRegionTop = 0;
          } else {
            joystickRegionWidth = canvasWidth / 3;
            joystickRegionLeft = joystickRegionWidth * (index - 2);
            joystickRegionTop = joystickRegionHeight;
          }
          break;
        case 6:
          joystickRegionHeight = canvasHeight / 2;
          if (index < 3) {
            joystickRegionWidth = canvasWidth / 3;
            joystickRegionLeft = joystickRegionWidth * index;
            joystickRegionTop = 0;
          } else {
            joystickRegionWidth = canvasWidth / 3;
            joystickRegionLeft = joystickRegionWidth * (index - 3);
            joystickRegionTop = joystickRegionHeight;
          }
          break;
        default:
          return;
      }

      // Draw background
      let joystickLeft: number,
        joystickTop: number,
        joystickWidth: number,
        joystickHeight: number,
        backgroundWidth: number,
        backgroundHeight: number;
      if (config) {
        backgroundWidth = imageElement.width;
        backgroundHeight = imageElement.height;
      } else {
        let rowCount =
          Math.ceil(joystick.state.buttons.length / 6) +
          Math.ceil(joystick.state.axes.length / 6) +
          Math.ceil(joystick.state.povs.length / 6) +
          Math.ceil(joystick.state.touchpads.length / 6);
        let columnCount = Math.max(
          Math.min(joystick.state.buttons.length, 6),
          Math.min(joystick.state.axes.length, 6),
          Math.min(joystick.state.povs.length, 6),
          joystick.state.touchpads.length > 0 ? Math.min(joystick.state.touchpads.length * 2, 6) : 1,
          1
        );
        backgroundWidth = 40 + columnCount * 100;
        backgroundHeight = 40 + rowCount * 100;
      }
      let sourceAspectRatio = backgroundWidth / backgroundHeight;
      let targetAspectRatio = joystickRegionWidth / joystickRegionHeight;
      if (sourceAspectRatio > targetAspectRatio) {
        joystickLeft = joystickRegionLeft;
        joystickTop = joystickRegionTop + joystickRegionHeight / 2 - joystickRegionWidth / sourceAspectRatio / 2;
        joystickWidth = joystickRegionWidth;
        joystickHeight = joystickRegionWidth / sourceAspectRatio;
      } else {
        joystickLeft = joystickRegionLeft + joystickRegionWidth / 2 - (joystickRegionHeight * sourceAspectRatio) / 2;
        joystickTop = joystickRegionTop;
        joystickWidth = joystickRegionHeight * sourceAspectRatio;
        joystickHeight = joystickRegionHeight;
      }
      if (config) {
        context.drawImage(imageElement, joystickLeft, joystickTop, joystickWidth, joystickHeight);
      }

      // Function to draw a button
      let drawButton = (
        isYellow: boolean,
        isEllipse: boolean,
        centerPx: [number, number],
        sizePx: [number, number],
        active: boolean
      ): [number, number, number, number] => {
        let color = isYellow ? this.YELLOW_COLOR : isLight ? this.BLACK_COLOR : this.WHITE_COLOR;
        context.fillStyle = color;
        context.strokeStyle = color;
        context.lineWidth = 5;
        context.beginPath();
        let scaledCenterPx: [number, number] = [
          scaleValue(centerPx[0], [0, backgroundWidth], [joystickLeft, joystickLeft + joystickWidth]),
          scaleValue(centerPx[1], [0, backgroundHeight], [joystickTop, joystickTop + joystickHeight])
        ];
        let scaledSizePx: [number, number] = [
          (sizePx[0] / backgroundWidth) * joystickWidth,
          (sizePx[1] / backgroundHeight) * joystickHeight
        ];
        if (isEllipse) {
          context.ellipse(
            scaledCenterPx[0],
            scaledCenterPx[1],
            scaledSizePx[0] / 2,
            scaledSizePx[1] / 2,
            0,
            0,
            Math.PI * 2
          );
        } else {
          context.rect(
            scaledCenterPx[0] - scaledSizePx[0] / 2,
            scaledCenterPx[1] - scaledSizePx[1] / 2,
            scaledSizePx[0],
            scaledSizePx[1]
          );
        }
        context.stroke();
        if (active) context.fill();
        return [scaledCenterPx[0], scaledCenterPx[1], scaledSizePx[0], scaledSizePx[1]];
      };

      // Function to draw a joystick
      let drawJoystick = (
        isYellow: boolean,
        centerPx: [number, number],
        radiusPx: number,
        xValue: number,
        yValue: number,
        buttonActive: boolean
      ) => {
        let color = isYellow ? this.YELLOW_COLOR : isLight ? this.BLACK_COLOR : this.WHITE_COLOR;
        context.fillStyle = color;
        context.strokeStyle = color;
        context.lineWidth = 5;

        // Draw outline
        context.beginPath();
        context.ellipse(
          scaleValue(centerPx[0], [0, backgroundWidth], [joystickLeft, joystickLeft + joystickWidth]),
          scaleValue(centerPx[1], [0, backgroundHeight], [joystickTop, joystickTop + joystickHeight]),
          (radiusPx / backgroundWidth) * joystickWidth,
          (radiusPx / backgroundHeight) * joystickHeight,
          0,
          0,
          Math.PI * 2
        );
        context.stroke();

        // Draw stick
        context.beginPath();
        let stickX = scaleValue(
          centerPx[0] + radiusPx * xValue,
          [0, imageElement.width],
          [joystickLeft, joystickLeft + joystickWidth]
        );
        let stickY = scaleValue(
          centerPx[1] - radiusPx * yValue,
          [0, imageElement.height],
          [joystickTop, joystickTop + joystickHeight]
        );
        let stickRadius = ((radiusPx * 0.75) / imageElement.width) * joystickWidth;
        context.ellipse(stickX, stickY, stickRadius, stickRadius, 0, 0, Math.PI * 2);
        context.fill();

        // Draw "X" for button
        if (buttonActive) {
          context.font = (stickRadius * 1.25).toString() + "px sans-serif";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillStyle = "#000000";
          context.fillText("X", stickX, stickY);
        }
      };

      // Function to draw an axis
      let drawAxis = (
        isYellow: boolean,
        centerPx: [number, number],
        sizePx: [number, number],
        scaledValue: number
      ): [number, number, number, number] => {
        let color = isYellow ? this.YELLOW_COLOR : isLight ? this.BLACK_COLOR : this.WHITE_COLOR;
        context.fillStyle = color;
        context.strokeStyle = color;
        context.lineWidth = 5;

        let x = scaleValue(
          centerPx[0] - sizePx[0] / 2,
          [0, backgroundWidth],
          [joystickLeft, joystickLeft + joystickWidth]
        );
        let y = scaleValue(
          centerPx[1] - sizePx[1] / 2,
          [0, backgroundHeight],
          [joystickTop, joystickTop + joystickHeight]
        );
        let width = (sizePx[0] / backgroundWidth) * joystickWidth;
        let height = (sizePx[1] / backgroundHeight) * joystickHeight;

        scaledValue = Math.max(Math.min(scaledValue, 1), 0);
        context.strokeRect(x, y, width, height);
        context.fillRect(x, y + height - height * scaledValue, width, height * scaledValue);
        return [x, y, width, height];
      };

      // Draw all components
      if (config) {
        let isSDL = joystick.state.mapping === "sdl";
        config.components.forEach((component) => {
          switch (component.type) {
            case "button":
              let active = false;
              let sourcePov = isSDL ? component.sdlSourcePov : component.niSourcePov;
              let sourceIndex = isSDL ? component.sdlSourceIndex : component.niSourceIndex;
              if (sourcePov !== undefined && sourceIndex !== undefined) {
                let pov = joystick.state.povs.find((p) => p.id === sourceIndex);
                if (pov) {
                  let povValue = pov.angle;
                  switch (sourcePov) {
                    case "up":
                      active = povValue === 315 || povValue === 0 || povValue === 45;
                      break;
                    case "right":
                      active = povValue === 45 || povValue === 90 || povValue === 135;
                      break;
                    case "down":
                      active = povValue === 135 || povValue === 180 || povValue === 225;
                      break;
                    case "left":
                      active = povValue === 225 || povValue === 270 || povValue === 315;
                      break;
                  }
                }
              } else if (sourceIndex !== undefined) {
                let button = joystick.state.buttons.find((b) => b.id === sourceIndex);
                if (button) {
                  active = button.state;
                }
              }
              drawButton(component.isYellow, component.isEllipse, component.centerPx, component.sizePx, active);
              break;

            case "joystick":
              let xValue = 0,
                yValue = 0,
                buttonActive = false;
              let xSourceIndex = isSDL ? component.sdlXSourceIndex : component.niXSourceIndex;
              let xSourceInverted = isSDL ? component.sdlXSourceInverted : component.niXSourceInverted;
              let ySourceIndex = isSDL ? component.sdlYSourceIndex : component.niYSourceIndex;
              let ySourceInverted = isSDL ? component.sdlYSourceInverted : component.niYSourceInverted;
              let buttonSourceIndex = isSDL ? component.sdlButtonSourceIndex : component.niButtonSourceIndex;

              if (xSourceIndex !== undefined) {
                let xAxis = joystick.state.axes.find((a) => a.id === xSourceIndex);
                if (xAxis) {
                  xValue = xAxis.value;
                  if (xSourceInverted) xValue *= -1;
                }
              }
              if (ySourceIndex !== undefined) {
                let yAxis = joystick.state.axes.find((a) => a.id === ySourceIndex);
                if (yAxis) {
                  yValue = yAxis.value;
                  if (ySourceInverted) yValue *= -1;
                }
              }
              if (buttonSourceIndex !== undefined) {
                let button = joystick.state.buttons.find((b) => b.id === buttonSourceIndex);
                if (button) {
                  buttonActive = button.state;
                }
              }
              drawJoystick(component.isYellow, component.centerPx, component.radiusPx, xValue, yValue, buttonActive);
              break;

            case "axis":
              let scaledValue = 0;
              let sourceIndexAxis = isSDL ? component.sdlSourceIndex : component.niSourceIndex;
              let sourceRangeAxis = isSDL ? component.sdlSourceRange : component.niSourceRange;
              if (sourceIndexAxis !== undefined) {
                let axis = joystick.state.axes.find((a) => a.id === sourceIndexAxis);
                if (axis) {
                  let range = sourceRangeAxis ?? [-1, 1];
                  scaledValue = scaleValue(axis.value, range, [0, 1]);
                }
              }
              drawAxis(component.isYellow, component.centerPx, component.sizePx, scaledValue);
              break;

            case "touchpad":
              if (isSDL && component.sdlSourceIndex !== undefined) {
                let layout = drawButton(component.isYellow, false, component.centerPx, component.sizePx, false);
                let touchpadState = joystick.state.touchpads[component.sdlSourceIndex];
                if (touchpadState) {
                  touchpadState.forEach((finger) => {
                    if (finger.down && finger.x >= 0 && finger.x <= 1 && finger.y >= 0 && finger.y <= 1) {
                      let canvasX = layout[0] - layout[2] / 2 + finger.x * layout[2];
                      let canvasY = layout[1] - layout[3] / 2 + finger.y * layout[3];
                      let color = component.isYellow
                        ? this.YELLOW_COLOR
                        : isLight
                        ? this.BLACK_COLOR
                        : this.WHITE_COLOR;
                      context.fillStyle = color;
                      context.beginPath();
                      context.arc(canvasX, canvasY, 8, 0, Math.PI * 2);
                      context.fill();
                    }
                  });
                }
              }
              break;
          }
        });
      } else {
        const isRtl = document.documentElement.dir === "rtl";
        const columnCount = Math.max(
          Math.min(joystick.state.buttons.length, 6),
          Math.min(joystick.state.axes.length, 6),
          Math.min(joystick.state.povs.length, 6),
          Math.min(joystick.state.touchpads.length, 6)
        );
        const getCol = (colIndex: number) => {
          let col = colIndex % 6;
          return isRtl ? columnCount - 1 - col : col;
        };

        // Draw buttons
        let buttonRows = Math.ceil(joystick.state.buttons.length / 6);
        joystick.state.buttons.forEach((button, index) => {
          let buttonLayout = drawButton(
            false,
            false,
            [70 + getCol(index) * 100, 70 + Math.floor(index / 6) * 100],
            [60, 60],
            button.state
          );
          context.font = (buttonLayout[3] * 0.5).toString() + "px sans-serif";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillStyle = isLight === button.state ? this.WHITE_COLOR : this.BLACK_COLOR;
          context.fillText(button.id.toString(), buttonLayout[0], buttonLayout[1]);
        });

        // Draw axes
        let axisRows = Math.ceil(joystick.state.axes.length / 6);
        joystick.state.axes.forEach((axis, index) => {
          let axisLayout = drawAxis(
            false,
            [(isRtl ? 45 : 95) + getCol(index) * 100, 70 + (Math.floor(index / 6) + buttonRows) * 100],
            [30, 80],
            scaleValue(axis.value, [-1, 1], [0, 1])
          );
          context.font = (axisLayout[3] * 0.6).toString() + "px sans-serif";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillStyle = isLight ? this.BLACK_COLOR : this.WHITE_COLOR;
          context.fillText(
            axis.id.toString(),
            isRtl ? axisLayout[0] + axisLayout[2] * 2 : axisLayout[0] - axisLayout[2],
            axisLayout[1] + axisLayout[3] / 2
          );
        });

        // Draw POVs
        let povRows = Math.ceil(joystick.state.povs.length / 6);
        joystick.state.povs.forEach((pov, index) => {
          // Draw POV buttons
          let povCenter = [70 + getCol(index) * 100, 70 + (Math.floor(index / 6) + buttonRows + axisRows) * 100];
          let povValue = pov.angle;
          let upActive = povValue === 315 || povValue === 0 || povValue === 45;
          let rightActive = povValue === 45 || povValue === 90 || povValue === 135;
          let downActive = povValue === 135 || povValue === 180 || povValue === 225;
          let leftActive = povValue === 225 || povValue === 270 || povValue === 315;
          drawButton(false, false, [povCenter[0], povCenter[1] - 30], [40, 20], upActive);
          drawButton(false, false, [povCenter[0] + 30, povCenter[1]], [20, 40], rightActive);
          drawButton(false, false, [povCenter[0], povCenter[1] + 30], [40, 20], downActive);
          drawButton(false, false, [povCenter[0] - 30, povCenter[1]], [20, 40], leftActive);

          // Draw POV text
          let scaledPovCenter = [
            scaleValue(povCenter[0], [0, backgroundWidth], [joystickLeft, joystickLeft + joystickWidth]),
            scaleValue(povCenter[1], [0, backgroundHeight], [joystickTop, joystickTop + joystickHeight])
          ];
          context.font = ((40 / backgroundWidth) * joystickWidth * 0.6).toString() + "px sans-serif";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillStyle = isLight ? this.BLACK_COLOR : this.WHITE_COLOR;
          context.fillText(pov.id.toString(), scaledPovCenter[0], scaledPovCenter[1]);
        });

        // Draw touchpads
        joystick.state.touchpads.forEach((touchpad, index) => {
          let touchpadCenter: [number, number] = [
            isRtl ? backgroundWidth - 95 - (index % 6) * 140 : 95 + (index % 6) * 140,
            70 + (Math.floor(index / 6) + buttonRows + axisRows + povRows) * 100
          ];
          let touchpadLayout = drawButton(false, false, touchpadCenter, [80, 80], false);

          // Draw fingers
          touchpad.forEach((finger) => {
            if (finger.down && finger.x >= 0 && finger.x <= 1 && finger.y >= 0 && finger.y <= 1) {
              let canvasX = touchpadLayout[0] - touchpadLayout[2] / 2 + finger.x * touchpadLayout[2];
              let canvasY = touchpadLayout[1] - touchpadLayout[3] / 2 + finger.y * touchpadLayout[3];
              let color = isLight ? this.BLACK_COLOR : this.WHITE_COLOR;
              context.fillStyle = color;
              context.beginPath();
              context.arc(canvasX, canvasY, 8, 0, Math.PI * 2);
              context.fill();
            }
          });

          // Draw touchpad text just outside to the left
          context.font = (touchpadLayout[3] * 0.4).toString() + "px sans-serif";
          context.textAlign = isRtl ? "left" : "right";
          context.textBaseline = "middle";
          context.fillStyle = isLight ? this.BLACK_COLOR : this.WHITE_COLOR;
          context.fillText(
            index.toString(),
            isRtl
              ? touchpadLayout[0] + touchpadLayout[2] / 2 + touchpadLayout[2] * 0.2
              : touchpadLayout[0] - touchpadLayout[2] / 2 - touchpadLayout[2] * 0.2,
            touchpadLayout[1]
          );
        });

        if (
          joystick.state.buttons.length === 0 &&
          joystick.state.axes.length === 0 &&
          joystick.state.povs.length === 0 &&
          joystick.state.touchpads.length === 0
        ) {
          context.font = "italic 16px sans-serif";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillStyle = isLight ? this.BLACK_COLOR : this.WHITE_COLOR;
          context.fillText(
            t("hub.joysticks.noData"),
            joystickLeft + joystickWidth / 2,
            joystickTop + joystickHeight / 2
          );
        }
      }
    });

    // Render message if no joysticks
    if (command.length === 0) {
      context.font = "italic 16px sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = isLight ? this.BLACK_COLOR : this.WHITE_COLOR;
      context.fillText(t("hub.joysticks.selectLayout"), canvasWidth / 2, canvasHeight / 2);
    }
  }
}

export type JoysticksRendererCommand = { layout: string; state: JoystickState }[];
