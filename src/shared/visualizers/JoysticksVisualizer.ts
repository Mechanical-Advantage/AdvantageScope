import { JoystickState } from "../log/LogUtil";
import { scaleValue } from "../util";
import Visualizer from "./Visualizer";

export default class JoysticksVisualizer implements Visualizer {
  private CANVAS: HTMLCanvasElement;
  private IMAGES: HTMLImageElement[] = [];

  private YELLOW_COLOR = "#ffff00";
  private BLACK_COLOR = "#222222";
  private WHITE_COLOR = "#eeeeee";

  constructor(canvas: HTMLCanvasElement) {
    this.CANVAS = canvas;
    for (let i = 0; i < 3; i++) {
      let image = document.createElement("img");
      this.IMAGES.push(image);
      canvas.appendChild(image);
    }
  }

  render(
    command: {
      layoutTitle: string;
      state: JoystickState;
    }[]
  ): number | null {
    // Set up canvas
    let context = this.CANVAS.getContext("2d") as CanvasRenderingContext2D;
    let canvasWidth = this.CANVAS.clientWidth;
    let canvasHeight = this.CANVAS.clientHeight;
    this.CANVAS.width = canvasWidth * window.devicePixelRatio;
    this.CANVAS.height = canvasHeight * window.devicePixelRatio;
    context.scale(window.devicePixelRatio, window.devicePixelRatio);
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    let isLight = !window.matchMedia("(prefers-color-scheme: dark)").matches;

    // Iterate over joysticks
    command.forEach((joystick, index) => {
      let config = window.assets?.joysticks.find((joystickConfig) => joystickConfig.name === joystick.layoutTitle);

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
          if (index === 2) {
            joystickRegionWidth = canvasWidth;
            joystickRegionHeight = canvasHeight / 2;
            joystickRegionLeft = 0;
            joystickRegionTop = canvasHeight / 2;
          } else {
            joystickRegionWidth = canvasWidth / 2;
            joystickRegionHeight = canvasHeight / 2;
            joystickRegionLeft = joystickRegionWidth * index;
            joystickRegionTop = 0;
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
          Math.ceil(joystick.state.povs.length / 6);
        let columnCount = Math.max(
          Math.min(joystick.state.buttons.length, 6),
          Math.min(joystick.state.axes.length, 6),
          Math.min(joystick.state.povs.length, 6)
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
        config.components.forEach((component) => {
          switch (component.type) {
            case "button":
              let active = false;
              if (component.sourcePov) {
                if (component.sourceIndex < joystick.state.povs.length) {
                  let povValue = joystick.state.povs[component.sourceIndex];
                  switch (component.sourcePov) {
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
              } else if (component.sourceIndex <= joystick.state.buttons.length) {
                active = joystick.state.buttons[component.sourceIndex - 1];
              }
              drawButton(component.isYellow, component.isEllipse, component.centerPx, component.sizePx, active);
              break;

            case "joystick":
              let xValue = 0,
                yValue = 0,
                buttonActive = false;
              if (component.xSourceIndex < joystick.state.axes.length) {
                xValue = joystick.state.axes[component.xSourceIndex];
                if (component.xSourceInverted) xValue *= -1;
              }
              if (component.ySourceIndex < joystick.state.axes.length) {
                yValue = joystick.state.axes[component.ySourceIndex];
                if (component.ySourceInverted) yValue *= -1;
              }
              if (component.buttonSourceIndex && component.buttonSourceIndex <= joystick.state.buttons.length) {
                buttonActive = joystick.state.buttons[component.buttonSourceIndex - 1];
              }
              drawJoystick(component.isYellow, component.centerPx, component.radiusPx, xValue, yValue, buttonActive);
              break;

            case "axis":
              let scaledValue = 0;
              if (component.sourceIndex < joystick.state.axes.length) {
                scaledValue = scaleValue(joystick.state.axes[component.sourceIndex], component.sourceRange, [0, 1]);
              }
              drawAxis(component.isYellow, component.centerPx, component.sizePx, scaledValue);
              break;

            default:
              break;
          }
        });
      } else {
        // Draw buttons
        joystick.state.buttons.forEach((buttonValue, index) => {
          let buttonLayout = drawButton(
            false,
            false,
            [70 + (index % 6) * 100, 70 + Math.floor(index / 6) * 100],
            [60, 60],
            buttonValue
          );
          context.font = (buttonLayout[3] * 0.5).toString() + "px sans-serif";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillStyle = isLight === buttonValue ? this.WHITE_COLOR : this.BLACK_COLOR;
          context.fillText((index + 1).toString(), buttonLayout[0], buttonLayout[1]);
        });

        // Draw axes
        joystick.state.axes.forEach((axisValue, index) => {
          let axisLayout = drawAxis(
            false,
            [95 + (index % 6) * 100, 70 + (Math.floor(index / 6) + Math.ceil(joystick.state.buttons.length / 6)) * 100],
            [30, 80],
            scaleValue(axisValue, [-1, 1], [0, 1])
          );
          context.font = (axisLayout[3] * 0.6).toString() + "px sans-serif";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillStyle = isLight ? this.BLACK_COLOR : this.WHITE_COLOR;
          context.fillText(index.toString(), axisLayout[0] - axisLayout[2], axisLayout[1] + axisLayout[3] / 2);
        });

        // Draw POVs
        joystick.state.povs.forEach((povValue, index) => {
          // Draw POV buttons
          let povCenter = [
            70 + (index % 6) * 100,
            70 +
              (Math.floor(index / 6) +
                Math.ceil(joystick.state.buttons.length / 6) +
                Math.ceil(joystick.state.axes.length / 6)) *
                100
          ];
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
          context.fillText(index.toString(), scaledPovCenter[0], scaledPovCenter[1]);
        });
        if (
          joystick.state.buttons.length === 0 &&
          joystick.state.axes.length === 0 &&
          joystick.state.povs.length === 0
        ) {
          context.font = "italic 16px sans-serif";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillStyle = isLight ? this.BLACK_COLOR : this.WHITE_COLOR;
          context.fillText("No data for joystick.", joystickLeft + joystickWidth / 2, joystickTop + joystickHeight / 2);
        }
      }
    });

    // Render message if no joysticks
    if (command.length === 0) {
      context.font = "italic 16px sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = isLight ? this.BLACK_COLOR : this.WHITE_COLOR;
      context.fillText("No joysticks selected.", canvasWidth / 2, canvasHeight / 2);
    }

    return null;
  }
}
