// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import ScrollSensor, { ScrollSensorMouseControl } from "../../hub/ScrollSensor";
import { Field2dCameraMode } from "../Field2dCameraMode";
import { AnnotatedPose2d, ModuleVelocity, Pose2d, Translation2d } from "../geometry";
import { Units } from "../units";
import { scaleValue, transformPx } from "../util";
import Heatmap from "./Heatmap";
import TabRenderer from "./TabRenderer";

export default class Field2dRenderer implements TabRenderer {
  private CONTAINER: HTMLElement;
  private CANVAS: HTMLCanvasElement;
  private IMAGE: HTMLImageElement;
  private HEATMAP_CONTAINER: HTMLElement;
  private SCROLL_CONTAINER: HTMLElement;
  private scrollSensor: ScrollSensor;

  private heatmap: Heatmap;
  private lastImageSource = "";
  private aspectRatio = 1;
  private lastRenderState = "";
  private imageLoadCount = 0;

  private zoom = 1;
  private pan: [number, number] = [0, 0];
  private trackingMode: Field2dCameraMode = Field2dCameraMode.Unlocked;
  private jumpToRobot = false;
  private lastTrackingMode: Field2dCameraMode = Field2dCameraMode.Unlocked;
  private lastFieldCenter?: [number, number];
  private isFTC = false;
  private lastCommand: Field2dRendererCommand | null = null;

  constructor(root: HTMLElement) {
    this.CONTAINER = root.getElementsByClassName("field-2d-canvas-container")[0] as HTMLElement;
    this.CANVAS = root.getElementsByClassName("field-2d-canvas")[0] as HTMLCanvasElement;
    this.IMAGE = document.createElement("img");
    this.HEATMAP_CONTAINER = root.getElementsByClassName("field-2d-heatmap-container")[0] as HTMLElement;
    this.heatmap = new Heatmap(this.HEATMAP_CONTAINER);
    this.IMAGE.addEventListener("load", () => this.imageLoadCount++);

    this.SCROLL_CONTAINER = root.getElementsByClassName("field-2d-scroll")[0] as HTMLElement;
    this.scrollSensor = new ScrollSensor(
      this.SCROLL_CONTAINER,
      (dx: number, dy: number, isPan: boolean, cursorX: number, cursorY: number) => {
        if (!this.lastCommand) return;
        let isVertical =
          this.lastCommand.orientation === Orientation.DEG_90 || this.lastCommand.orientation === Orientation.DEG_270;
        let containerWidth = this.CONTAINER.clientWidth;
        let containerHeight = this.CONTAINER.clientHeight;

        let isSatellite = document.body.classList.contains("satellite");
        let visibleYOffset = isSatellite ? 0 : -13;
        let boundingWidth = isVertical ? containerHeight - Math.abs(visibleYOffset * 2) : containerWidth;
        let boundingHeight = isVertical ? containerWidth : containerHeight - Math.abs(visibleYOffset * 2);

        let fieldData = window.assets?.field2ds.find((field) => field.id === this.lastCommand?.field);
        if (!fieldData) return;

        let fieldWidth = fieldData.bottomRight[0] - fieldData.topLeft[0];
        let fieldHeight = fieldData.bottomRight[1] - fieldData.topLeft[1];
        let topMargin = fieldData.topLeft[1];
        let bottomMargin = this.IMAGE.height - fieldData.bottomRight[1];
        let leftMargin = fieldData.topLeft[0];
        let rightMargin = this.IMAGE.width - fieldData.bottomRight[0];
        let margin = Math.min(topMargin, bottomMargin, leftMargin, rightMargin);
        let extendedFieldWidth = fieldWidth + margin * 2;
        let extendedFieldHeight = fieldHeight + margin * 2;

        let constrainHeight = boundingWidth / boundingHeight > extendedFieldWidth / extendedFieldHeight;
        let baseImageScalar = constrainHeight
          ? boundingHeight / extendedFieldHeight
          : boundingWidth / extendedFieldWidth;

        let canvasCenterX = cursorX - containerWidth / 2;
        let canvasCenterY = cursorY - containerHeight / 2;

        if (isPan) {
          this.pan[0] += dx / (baseImageScalar * this.zoom);
          this.pan[1] += dy / (baseImageScalar * this.zoom);
        } else {
          // Zoom
          let zoomChange = dy * -0.005;
          let oldZoom = this.zoom;
          this.zoom = Math.min(10, Math.max(1, this.zoom + zoomChange));

          if (this.zoom !== oldZoom) {
            this.pan[0] += (canvasCenterX / baseImageScalar) * (1 / oldZoom - 1 / this.zoom);
            this.pan[1] += (canvasCenterY / baseImageScalar) * (1 / oldZoom - 1 / this.zoom);
          }
        }

        window.requestAnimationFrame(() => {
          if (this.lastCommand) this.render(this.lastCommand);
        });
      },
      ScrollSensorMouseControl.PanXY
    );

    // Context menu for camera mode
    let startPx: [number, number] | null = null;
    this.SCROLL_CONTAINER.addEventListener("mousedown", (event) => {
      if (event.button === 2) {
        startPx = [event.clientX, event.clientY];
      }
    });
    this.SCROLL_CONTAINER.addEventListener("mouseup", (event) => {
      if (startPx && event.clientX === startPx[0] && event.clientY === startPx[1]) {
        window.sendMainMessage("ask-2d-camera", {
          position: [event.clientX, event.clientY],
          selectedIndex: this.trackingMode
        });
      }
      startPx = null;
    });
  }

  set2DCamera(index: number) {
    if (index >= 0 && index <= 2) {
      this.setTrackingMode(index as Field2dCameraMode);
      if (this.lastCommand) {
        this.render(this.lastCommand);
      }
    }
  }

  saveState(): unknown {
    return {
      zoom: this.zoom,
      pan: this.pan,
      trackingMode: this.trackingMode,
      isFTC: this.isFTC
    };
  }

  restoreState(state: unknown): void {
    if (typeof state !== "object" || state === null) return;

    if ("zoom" in state && typeof state.zoom === "number") {
      this.zoom = state.zoom;
    }
    if ("pan" in state && Array.isArray(state.pan) && state.pan.length === 2) {
      this.pan = state.pan as [number, number];
    }
    if ("trackingMode" in state && typeof state.trackingMode === "number") {
      this.setTrackingMode(state.trackingMode as Field2dCameraMode);
    }
    if ("isFTC" in state && typeof state.isFTC === "boolean") {
      this.isFTC = state.isFTC;
    }
  }

  setTrackingMode(mode: Field2dCameraMode) {
    if (mode !== Field2dCameraMode.Unlocked) {
      this.jumpToRobot = true;
    }
    this.trackingMode = mode;
  }

  getAspectRatio(): number | null {
    return this.aspectRatio;
  }

  render(command: Field2dRendererCommand): void {
    this.scrollSensor.periodic();
    this.lastCommand = command;

    // Get field data
    let fieldData = window.assets?.field2ds.find((field) => field.id === command.field);
    if (!fieldData) return;

    if (fieldData.isFTC !== this.isFTC) {
      this.isFTC = fieldData.isFTC;
      this.zoom = 1;
      this.pan = [0, 0];
      this.trackingMode = 0;
    }

    // Find primary robot pose
    let primaryRobotPose: Pose2d | null = null;
    let primaryRobotObj = command.objects.find((obj) => obj.type === "robot") as Field2dRendererCommand_RobotObj;
    if (primaryRobotObj && primaryRobotObj.poses.length > 0) {
      primaryRobotPose = primaryRobotObj.poses[0].pose;
    }

    // Get setup
    let context = this.CANVAS.getContext("2d") as CanvasRenderingContext2D;

    let isVertical = command.orientation === Orientation.DEG_90 || command.orientation === Orientation.DEG_270;
    let isSatellite = document.body.classList.contains("satellite");
    let visibleYOffset = isSatellite ? 0 : -13;

    let width = isVertical ? this.CONTAINER.clientHeight : this.CONTAINER.clientWidth;
    let height = isVertical ? this.CONTAINER.clientWidth : this.CONTAINER.clientHeight;

    let boundingWidth = isVertical
      ? this.CONTAINER.clientHeight - Math.abs(visibleYOffset * 2)
      : this.CONTAINER.clientWidth;
    let boundingHeight = isVertical
      ? this.CONTAINER.clientWidth
      : this.CONTAINER.clientHeight - Math.abs(visibleYOffset * 2);

    if (this.trackingMode === Field2dCameraMode.RobotAndRotation) {
      let maxDim = Math.hypot(this.CONTAINER.clientWidth, this.CONTAINER.clientHeight);
      width = maxDim;
      height = maxDim;
      boundingWidth = maxDim;
      boundingHeight = maxDim;
    }

    // Exit if render state unchanged
    let renderState: any[] = [
      width,
      height,
      window.devicePixelRatio,
      command,
      this.imageLoadCount,
      this.zoom,
      this.pan[0],
      this.pan[1],
      this.trackingMode
    ];
    let renderStateString = JSON.stringify(renderState);
    if (renderStateString === this.lastRenderState) {
      return;
    }
    this.lastRenderState = renderStateString;

    // Set up canvas
    this.CANVAS.style.width = width.toString() + "px";
    this.CANVAS.style.height = height.toString() + "px";
    this.CANVAS.width = width * window.devicePixelRatio;
    this.CANVAS.height = height * window.devicePixelRatio;
    context.scale(window.devicePixelRatio, window.devicePixelRatio);
    context.clearRect(0, 0, width, height);
    context.lineCap = "round";
    context.lineJoin = "round";

    // Set canvas transform
    let canvasRotation = 0;
    switch (command.orientation) {
      case Orientation.DEG_0:
        canvasRotation = 0;
        break;
      case Orientation.DEG_90:
        canvasRotation = -Math.PI / 2;
        break;
      case Orientation.DEG_180:
        canvasRotation = Math.PI;
        break;
      case Orientation.DEG_270:
        canvasRotation = Math.PI / 2;
        break;
    }

    if (this.trackingMode === Field2dCameraMode.RobotAndRotation && primaryRobotPose) {
      canvasRotation += primaryRobotPose.rotation;
    }

    this.CANVAS.style.transform = `translate(-50%, -50%) rotate(${canvasRotation}rad)`;

    // Update image element
    if (fieldData.path !== this.lastImageSource) {
      this.lastImageSource = fieldData.path;
      this.IMAGE.src = fieldData.path;
    }
    if (!(this.IMAGE.width > 0 && this.IMAGE.height > 0)) return;

    // Render background
    let fieldWidth = fieldData.bottomRight[0] - fieldData.topLeft[0];
    let fieldHeight = fieldData.bottomRight[1] - fieldData.topLeft[1];
    let fieldCenterX = fieldWidth * 0.5 + fieldData.topLeft[0];
    let fieldCenterY = fieldHeight * 0.5 + fieldData.topLeft[1];

    let targetFieldX = fieldCenterX;
    let targetFieldY = fieldCenterY;
    if (this.trackingMode > Field2dCameraMode.Unlocked && primaryRobotPose) {
      let positionInches = [
        Units.convert(primaryRobotPose.translation[0], "meters", "inches"),
        Units.convert(primaryRobotPose.translation[1], "meters", "inches")
      ];
      targetFieldX = scaleValue(
        positionInches[0],
        [-fieldData.widthInches / 2, fieldData.widthInches / 2],
        [fieldData.topLeft[0], fieldData.topLeft[0] + fieldWidth]
      );
      targetFieldY = scaleValue(
        positionInches[1],
        [-fieldData.heightInches / 2, fieldData.heightInches / 2],
        [fieldData.topLeft[1] + fieldHeight, fieldData.topLeft[1]]
      );
    }

    if (this.jumpToRobot) {
      this.pan = [0, 0];
      this.jumpToRobot = false;
    } else if (
      this.lastTrackingMode !== this.trackingMode &&
      this.trackingMode === Field2dCameraMode.Unlocked &&
      this.lastFieldCenter
    ) {
      let dx = this.lastFieldCenter[0] - targetFieldX;
      let dy = this.lastFieldCenter[1] - targetFieldY;
      this.pan[0] = dx * Math.cos(canvasRotation) - dy * Math.sin(canvasRotation);
      this.pan[1] = dx * Math.sin(canvasRotation) + dy * Math.cos(canvasRotation);
    }
    this.lastTrackingMode = this.trackingMode;

    let panFieldX = this.pan[0] * Math.cos(-canvasRotation) - this.pan[1] * Math.sin(-canvasRotation);
    let panFieldY = this.pan[0] * Math.sin(-canvasRotation) + this.pan[1] * Math.cos(-canvasRotation);
    fieldCenterX = targetFieldX + panFieldX;
    fieldCenterY = targetFieldY + panFieldY;

    let topMargin = fieldData.topLeft[1];
    let bottomMargin = this.IMAGE.height - fieldData.bottomRight[1];
    let leftMargin = fieldData.topLeft[0];
    let rightMargin = this.IMAGE.width - fieldData.bottomRight[0];

    let margin = Math.min(topMargin, bottomMargin, leftMargin, rightMargin);
    let extendedFieldWidth = fieldWidth + margin * 2;
    let extendedFieldHeight = fieldHeight + margin * 2;
    let constrainHeight = boundingWidth / boundingHeight > extendedFieldWidth / extendedFieldHeight;
    let baseImageScalar = constrainHeight ? boundingHeight / extendedFieldHeight : boundingWidth / extendedFieldWidth;
    let imageScalar = baseImageScalar * this.zoom;

    if (this.trackingMode === Field2dCameraMode.Unlocked) {
      let fieldDisplayWidth = extendedFieldWidth * imageScalar;
      let fieldDisplayHeight = extendedFieldHeight * imageScalar;

      let panOffsetX = (Math.sin(canvasRotation) * visibleYOffset) / imageScalar;
      let panOffsetY = (Math.cos(canvasRotation) * visibleYOffset) / imageScalar;

      let marginX = Math.max(0, (fieldDisplayWidth - boundingWidth) * 0.5) / imageScalar;
      let minPanX = -marginX + panOffsetX;
      let maxPanX = marginX + panOffsetX;

      let marginY = Math.max(0, (fieldDisplayHeight - boundingHeight) * 0.5) / imageScalar;
      let minPanY = -marginY + panOffsetY;
      let maxPanY = marginY + panOffsetY;

      panFieldX = Math.max(minPanX, Math.min(maxPanX, panFieldX));
      panFieldY = Math.max(minPanY, Math.min(maxPanY, panFieldY));

      fieldCenterX = targetFieldX + panFieldX;
      fieldCenterY = targetFieldY + panFieldY;

      this.pan[0] = panFieldX * Math.cos(canvasRotation) - panFieldY * Math.sin(canvasRotation);
      this.pan[1] = panFieldX * Math.sin(canvasRotation) + panFieldY * Math.cos(canvasRotation);
    }

    this.lastFieldCenter = [fieldCenterX, fieldCenterY];

    let renderValues: [number, number, number, number] = [
      width * 0.5 - fieldCenterX * imageScalar,
      height * 0.5 - fieldCenterY * imageScalar,
      this.IMAGE.width * imageScalar,
      this.IMAGE.height * imageScalar
    ];

    // Draw field image
    {
      let imgDx = renderValues[0];
      let imgDy = renderValues[1];
      let imgDw = renderValues[2];
      let imgDh = renderValues[3];
      let drawL = Math.max(imgDx, 0);
      let drawT = Math.max(imgDy, 0);
      let drawR = Math.min(imgDx + imgDw, width);
      let drawB = Math.min(imgDy + imgDh, height);
      if (drawR > drawL && drawB > drawT) {
        let sx = ((drawL - imgDx) / imgDw) * this.IMAGE.width;
        let sy = ((drawT - imgDy) / imgDh) * this.IMAGE.height;
        let sWidth = ((drawR - drawL) / imgDw) * this.IMAGE.width;
        let sHeight = ((drawB - drawT) / imgDh) * this.IMAGE.height;
        context.drawImage(this.IMAGE, sx, sy, sWidth, sHeight, drawL, drawT, drawR - drawL, drawB - drawT);
      }
    }
    this.aspectRatio = isVertical ? fieldHeight / fieldWidth : fieldWidth / fieldHeight;

    // Calculate field edges
    let canvasFieldLeft = renderValues[0] + fieldData.topLeft[0] * imageScalar;
    let canvasFieldTop = renderValues[1] + fieldData.topLeft[1] * imageScalar;
    let canvasFieldWidth = fieldWidth * imageScalar;
    let canvasFieldHeight = fieldHeight * imageScalar;
    let pixelsPerInch = (canvasFieldHeight / fieldData.heightInches + canvasFieldWidth / fieldData.widthInches) / 2;
    let robotLengthPixels = pixelsPerInch * command.size;

    // Convert translation to pixel coordinates
    let calcCoordinates = (translation: Translation2d): [number, number] => {
      if (!fieldData) return [0, 0];
      let positionInches = [
        Units.convert(translation[0], "meters", "inches"),
        Units.convert(translation[1], "meters", "inches")
      ];
      let positionPixels: [number, number] = [
        scaleValue(
          positionInches[0],
          [-fieldData.widthInches / 2, fieldData.widthInches / 2],
          [canvasFieldLeft, canvasFieldLeft + canvasFieldWidth]
        ),
        scaleValue(
          positionInches[1],
          [-fieldData.heightInches / 2, fieldData.heightInches / 2],
          [canvasFieldTop + canvasFieldHeight, canvasFieldTop]
        )
      ];
      return positionPixels;
    };

    // Function to draw robot
    let drawRobot = (
      pose: Pose2d,
      swerveModuleVelocities: {
        values: ModuleVelocity[];
        color: string;
      }[],
      bumperColor?: string,
      ghostColor?: string
    ) => {
      let centerPos = calcCoordinates(pose.translation);
      let rotation = pose.rotation;

      // Render robot
      context.fillStyle = ghostColor !== undefined ? ghostColor : "#222";
      context.strokeStyle = ghostColor !== undefined ? ghostColor : bumperColor !== undefined ? bumperColor : "white";
      context.lineWidth = (fieldData.isFTC ? 1 : 3) * pixelsPerInch;
      let backLeft = transformPx(centerPos, rotation, [robotLengthPixels * -0.5, robotLengthPixels * 0.5]);
      let frontLeft = transformPx(centerPos, rotation, [robotLengthPixels * 0.5, robotLengthPixels * 0.5]);
      let frontRight = transformPx(centerPos, rotation, [robotLengthPixels * 0.5, robotLengthPixels * -0.5]);
      let backRight = transformPx(centerPos, rotation, [robotLengthPixels * -0.5, robotLengthPixels * -0.5]);
      context.beginPath();
      context.moveTo(frontLeft[0], frontLeft[1]);
      context.lineTo(frontRight[0], frontRight[1]);
      context.lineTo(backRight[0], backRight[1]);
      context.lineTo(backLeft[0], backLeft[1]);
      context.closePath();
      if (ghostColor === undefined) {
        context.fill();
        context.stroke();
      } else {
        context.globalAlpha = 0.2;
        context.fill();
        context.globalAlpha = 1;
        context.stroke();
      }

      // Render arrow
      context.strokeStyle = "white";
      context.lineWidth = (fieldData.isFTC ? 1 : 1.5) * pixelsPerInch;
      let arrowBack = transformPx(centerPos, rotation, [robotLengthPixels * -0.3, 0]);
      let arrowFront = transformPx(centerPos, rotation, [robotLengthPixels * 0.3, 0]);
      let arrowLeft = transformPx(centerPos, rotation, [robotLengthPixels * 0.15, robotLengthPixels * 0.15]);
      let arrowRight = transformPx(centerPos, rotation, [robotLengthPixels * 0.15, robotLengthPixels * -0.15]);
      context.beginPath();
      context.moveTo(arrowBack[0], arrowBack[1]);
      context.lineTo(arrowFront[0], arrowFront[1]);
      context.lineTo(arrowLeft[0], arrowLeft[1]);
      context.moveTo(arrowFront[0], arrowFront[1]);
      context.lineTo(arrowRight[0], arrowRight[1]);
      context.stroke();

      // Render swerve module velocities
      [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1]
      ].forEach((corner, index) => {
        let moduleCenterPx = transformPx(centerPos, rotation, [
          (robotLengthPixels / 2) * corner[0],
          (robotLengthPixels / 2) * corner[1]
        ]);

        // Draw module data
        let drawModuleData = (state: ModuleVelocity, color: string) => {
          let fullRotation = rotation + state.angle;
          context.strokeStyle = color;

          // Draw speed
          if (Math.abs(state.velocity) <= 0.001) return;
          let vectorSpeed = state.velocity / 5;
          let vectorRotation = fullRotation;
          if (state.velocity < 0) {
            vectorSpeed *= -1;
            vectorRotation += Math.PI;
          }
          if (vectorSpeed < 0.05) return;
          let vectorLength = pixelsPerInch * 36 * vectorSpeed;
          let arrowBack = transformPx(moduleCenterPx, vectorRotation, [0, 0]);
          let arrowFront = transformPx(moduleCenterPx, vectorRotation, [vectorLength, 0]);
          let arrowLeft = transformPx(moduleCenterPx, vectorRotation, [
            vectorLength - pixelsPerInch * 4,
            pixelsPerInch * 4
          ]);
          let arrowRight = transformPx(moduleCenterPx, vectorRotation, [
            vectorLength - pixelsPerInch * 4,
            pixelsPerInch * -4
          ]);
          context.beginPath();
          context.moveTo(...arrowBack);
          context.lineTo(...arrowFront);
          context.moveTo(...arrowLeft);
          context.lineTo(...arrowFront);
          context.lineTo(...arrowRight);
          context.stroke();
        };
        swerveModuleVelocities.forEach((set) => {
          if (index < set.values.length) {
            drawModuleData(set.values[index], set.color);
          }
        });
      });
    };

    // Draw FTC Grid
    if (fieldData.isFTC && fieldData.useGrid) {
      context.beginPath();

      context.strokeStyle = `rgb(0 0 0 / 10%`;
      context.lineWidth = 0.3 * pixelsPerInch;

      for (let i = 1; i <= 5; i++) {
        const lineDistance = (canvasFieldHeight / 6) * i;

        // Draw Horizontal Line
        context.moveTo(canvasFieldLeft, canvasFieldTop + lineDistance);
        context.lineTo(canvasFieldLeft + canvasFieldWidth, canvasFieldTop + lineDistance);

        // Draw Vertical Line
        context.moveTo(canvasFieldLeft + lineDistance, canvasFieldTop);
        context.lineTo(canvasFieldLeft + lineDistance, canvasFieldTop + canvasFieldHeight);
      }

      context.stroke();
      context.closePath();
    }

    // Update heatmap data
    let heatmapTranslations: Translation2d[] = [];
    command.objects
      .filter((object) => object.type === "heatmap")
      .forEach((object) => {
        heatmapTranslations = heatmapTranslations.concat(object.poses.map((pose) => pose.pose.translation));
      });
    this.heatmap.update(
      heatmapTranslations,
      [fieldWidth, fieldHeight],
      [
        Units.convert(fieldData.widthInches, "inches", "meters"),
        Units.convert(fieldData.heightInches, "inches", "meters")
      ]
    );
    let heatmapCanvas = this.heatmap.getCanvas();
    if (heatmapCanvas !== null) {
      context.drawImage(heatmapCanvas, canvasFieldLeft, canvasFieldTop, canvasFieldWidth, canvasFieldHeight);
    }

    // Draw objects
    const renderingOrder = ["trajectory", "robot", "ghost", "arrow"];
    command.objects
      .toSorted((objA, objB) => renderingOrder.indexOf(objA.type) - renderingOrder.indexOf(objB.type))
      .forEach((object) => {
        switch (object.type) {
          case "trajectory":
            context.strokeStyle = object.color;
            context.lineWidth = 2 * pixelsPerInch * (object.size === "bold" ? 3 : 1);
            context.lineCap = "round";
            context.lineJoin = "round";
            context.beginPath();
            let firstPoint = true;
            object.poses.forEach((pose) => {
              if (firstPoint) {
                context.moveTo(...calcCoordinates(pose.pose.translation));
                firstPoint = false;
              } else {
                context.lineTo(...calcCoordinates(pose.pose.translation));
              }
            });
            context.stroke();
            break;
          case "robot":
            object.poses.forEach((pose, index) => {
              // Draw trails
              let trailCoordinates: [number, number][] = [];
              object.trails[index].forEach((translation: Translation2d) => {
                let coordinates = calcCoordinates(translation);
                trailCoordinates.push(coordinates);
              });
              context.strokeStyle = "rgba(170, 170, 170)";
              context.lineCap = "round";
              context.lineJoin = "round";
              trailCoordinates.forEach((position, index) => {
                if (index === 0) return;
                let previous = trailCoordinates[index - 1];
                let current = position;
                let lineWidth = 1 - Math.abs(index - trailCoordinates.length / 2) / (trailCoordinates.length / 2);
                if (lineWidth > 0.75) {
                  lineWidth = 1;
                } else {
                  lineWidth = scaleValue(lineWidth, [0, 0.75], [0, 1]);
                }
                let lineWidthPixels = lineWidth * pixelsPerInch;
                context.lineWidth = lineWidthPixels;

                context.beginPath();
                context.moveTo(previous[0], previous[1]);
                context.lineTo(current[0], current[1]);
                context.stroke();
              });

              // Draw vision targets
              let robotPos = calcCoordinates(pose.pose.translation);
              object.visionTargets.forEach((target: AnnotatedPose2d) => {
                context.strokeStyle =
                  target.annotation.visionColor === undefined ? "#00ff00" : target.annotation.visionColor;
                context.lineWidth = 1 * pixelsPerInch * (target.annotation.visionSize === "bold" ? 3 : 1);
                context.beginPath();
                context.moveTo(robotPos[0], robotPos[1]);
                context.lineTo(...calcCoordinates(target.pose.translation));
                context.stroke();
              });

              // Draw main object
              drawRobot(pose.pose, object.swerveModuleVelocities, object.bumperColor);
            });
            break;
          case "ghost":
            object.poses.forEach((pose) => {
              // Draw vision targets
              let robotPos = calcCoordinates(pose.pose.translation);
              object.visionTargets.forEach((target: AnnotatedPose2d) => {
                context.strokeStyle =
                  target.annotation.visionColor === undefined ? "#00ff00" : target.annotation.visionColor;
                context.lineWidth = 1 * pixelsPerInch; // 1 inch
                context.beginPath();
                context.moveTo(robotPos[0], robotPos[1]);
                context.lineTo(...calcCoordinates(target.pose.translation));
                context.stroke();
              });

              // Draw main object
              drawRobot(pose.pose, object.swerveModuleVelocities, undefined, object.color);
            });
            break;
          case "arrow":
            let offsetIndex = ["front", "center", "back"].indexOf(object.position);
            object.poses.forEach((pose) => {
              let position = calcCoordinates(pose.pose.translation);
              let rotation = pose.pose.rotation;

              context.strokeStyle = "white";
              context.lineCap = "round";
              context.lineJoin = "round";
              context.lineWidth = 1.5 * pixelsPerInch;
              let arrowBack = transformPx(position, rotation, [robotLengthPixels * (-0.6 + 0.3 * offsetIndex), 0]);
              let arrowFront = transformPx(position, rotation, [robotLengthPixels * (0.3 * offsetIndex), 0]);
              let arrowLeft = transformPx(position, rotation, [
                robotLengthPixels * (-0.15 + 0.3 * offsetIndex),
                robotLengthPixels * 0.15
              ]);
              let arrowRight = transformPx(position, rotation, [
                robotLengthPixels * (-0.15 + 0.3 * offsetIndex),
                robotLengthPixels * -0.15
              ]);
              let crossbarLeft = transformPx(position, rotation, [
                0,
                robotLengthPixels * (offsetIndex === 0 ? 0.15 : 0.1)
              ]);
              let crossbarRight = transformPx(position, rotation, [
                0,
                robotLengthPixels * -(offsetIndex === 0 ? 0.15 : 0.1)
              ]);
              context.beginPath();
              context.moveTo(arrowBack[0], arrowBack[1]);
              context.lineTo(arrowFront[0], arrowFront[1]);
              context.lineTo(arrowLeft[0], arrowLeft[1]);
              context.moveTo(arrowFront[0], arrowFront[1]);
              context.lineTo(arrowRight[0], arrowRight[1]);
              context.stroke();
              context.beginPath();
              context.moveTo(crossbarLeft[0], crossbarLeft[1]);
              context.lineTo(crossbarRight[0], crossbarRight[1]);
              context.stroke();
            });
            break;
        }
      });
  }
}

export enum Orientation {
  DEG_0 = 0,
  DEG_90 = 1,
  DEG_180 = 2,
  DEG_270 = 3
}

// All poses are already converted to a center-red coordinate system
export type Field2dRendererCommand = {
  field: string;
  orientation: Orientation;
  size: number;
  objects: Field2dRendererCommand_AnyObj[];
};

export type Field2dRendererCommand_AnyObj =
  | Field2dRendererCommand_RobotObj
  | Field2dRendererCommand_GhostObj
  | Field2dRendererCommand_TrajectoryObj
  | Field2dRendererCommand_HeatmapObj
  | Field2dRendererCommand_ArrowObj;

export type Field2dRendererCommand_RobotObj = {
  type: "robot";
  poses: AnnotatedPose2d[];
  trails: Translation2d[][];
  bumperColor: string;
  visionTargets: AnnotatedPose2d[];
  swerveModuleVelocities: {
    values: ModuleVelocity[];
    color: string;
  }[];
};

export type Field2dRendererCommand_GhostObj = {
  type: "ghost";
  poses: AnnotatedPose2d[];
  color: string;
  visionTargets: AnnotatedPose2d[];
  swerveModuleVelocities: {
    values: ModuleVelocity[];
    color: string;
  }[];
};

export type Field2dRendererCommand_TrajectoryObj = {
  type: "trajectory";
  color: string;
  size: string;
  poses: AnnotatedPose2d[];
};

export type Field2dRendererCommand_HeatmapObj = {
  type: "heatmap";
  poses: AnnotatedPose2d[];
};

export type Field2dRendererCommand_ArrowObj = {
  type: "arrow";
  poses: AnnotatedPose2d[];
  position: "center" | "back" | "front";
};
