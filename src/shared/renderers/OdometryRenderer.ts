import { AnnotatedPose2d, Pose2d, SwerveState, Translation2d } from "../geometry";
import { convert } from "../units";
import { scaleValue, transformPx } from "../util";
import Heatmap from "./Heatmap";
import TabRenderer from "./TabRenderer";

export default class OdometryRenderer implements TabRenderer {
  private CONTAINER: HTMLElement;
  private CANVAS: HTMLCanvasElement;
  private IMAGE: HTMLImageElement;
  private HEATMAP_CONTAINER: HTMLElement;

  private heatmap: Heatmap;
  private lastImageSource = "";
  private aspectRatio = 1;
  private lastRenderState = "";
  private imageLoadCount = 0;

  constructor(root: HTMLElement) {
    this.CONTAINER = root.getElementsByClassName("odometry-canvas-container")[0] as HTMLElement;
    this.CANVAS = root.getElementsByClassName("odometry-canvas")[0] as HTMLCanvasElement;
    this.IMAGE = document.createElement("img");
    this.HEATMAP_CONTAINER = root.getElementsByClassName("odometry-heatmap-container")[0] as HTMLElement;
    this.heatmap = new Heatmap(this.HEATMAP_CONTAINER);
    this.IMAGE.addEventListener("load", () => this.imageLoadCount++);
  }

  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {}

  getAspectRatio(): number | null {
    return this.aspectRatio;
  }

  render(command: OdometryRendererCommand): void {
    // Get setup
    let context = this.CANVAS.getContext("2d") as CanvasRenderingContext2D;
    let isVertical = command.orientation === Orientation.DEG_90 || command.orientation === Orientation.DEG_270;
    let width = isVertical ? this.CONTAINER.clientHeight : this.CONTAINER.clientWidth;
    let height = isVertical ? this.CONTAINER.clientWidth : this.CONTAINER.clientHeight;

    // Exit if render state unchanged
    let renderState: any[] = [width, height, window.devicePixelRatio, command, this.imageLoadCount];
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
    switch (command.orientation) {
      case Orientation.DEG_0:
        this.CANVAS.style.transform = "translate(-50%, -50%) rotate(0deg)";
        break;
      case Orientation.DEG_90:
        this.CANVAS.style.transform = "translate(-50%, -50%) rotate(-90deg)";
        break;
      case Orientation.DEG_180:
        this.CANVAS.style.transform = "translate(-50%, -50%) rotate(180deg)";
        break;
      case Orientation.DEG_270:
        this.CANVAS.style.transform = "translate(-50%, -50%) rotate(90deg)";
        break;
    }

    // Get game data and update image element
    let gameData = window.assets?.field2ds.find((game) => game.name === command.game);
    if (!gameData) return;
    if (gameData.path !== this.lastImageSource) {
      this.lastImageSource = gameData.path;
      this.IMAGE.src = gameData.path;
    }
    if (!(this.IMAGE.width > 0 && this.IMAGE.height > 0)) return;

    // Determine if objects are flipped
    let objectsFlipped = command.origin === "red";

    // Render background
    let fieldWidth = gameData.bottomRight[0] - gameData.topLeft[0];
    let fieldHeight = gameData.bottomRight[1] - gameData.topLeft[1];

    let topMargin = gameData.topLeft[1];
    let bottomMargin = this.IMAGE.height - gameData.bottomRight[1];
    let leftMargin = gameData.topLeft[0];
    let rightMargin = this.IMAGE.width - gameData.bottomRight[0];

    let margin = Math.min(topMargin, bottomMargin, leftMargin, rightMargin);
    let extendedFieldWidth = fieldWidth + margin * 2;
    let extendedFieldHeight = fieldHeight + margin * 2;
    let constrainHeight = width / height > extendedFieldWidth / extendedFieldHeight;
    let imageScalar: number;
    if (constrainHeight) {
      imageScalar = height / extendedFieldHeight;
    } else {
      imageScalar = width / extendedFieldWidth;
    }
    let fieldCenterX = fieldWidth * 0.5 + gameData.topLeft[0];
    let fieldCenterY = fieldHeight * 0.5 + gameData.topLeft[1];
    let renderValues = [
      Math.floor(width * 0.5 - fieldCenterX * imageScalar), // X (normal)
      Math.floor(height * 0.5 - fieldCenterY * imageScalar), // Y (normal)
      Math.ceil(width * -0.5 - fieldCenterX * imageScalar), // X (flipped)
      Math.ceil(height * -0.5 - fieldCenterY * imageScalar), // Y (flipped)
      this.IMAGE.width * imageScalar, // Width
      this.IMAGE.height * imageScalar // Height
    ];
    context.drawImage(this.IMAGE, renderValues[0], renderValues[1], renderValues[4], renderValues[5]);
    this.aspectRatio = isVertical ? fieldHeight / fieldWidth : fieldWidth / fieldHeight;

    // Calculate field edges
    let canvasFieldLeft = renderValues[0] + gameData.topLeft[0] * imageScalar;
    let canvasFieldTop = renderValues[1] + gameData.topLeft[1] * imageScalar;
    let canvasFieldWidth = fieldWidth * imageScalar;
    let canvasFieldHeight = fieldHeight * imageScalar;
    let pixelsPerInch = (canvasFieldHeight / gameData.heightInches + canvasFieldWidth / gameData.widthInches) / 2;
    let robotLengthPixels = pixelsPerInch * command.size;

    // Convert translation to pixel coordinates
    let calcCoordinates = (translation: Translation2d): [number, number] => {
      if (!gameData) return [0, 0];
      let positionInches = [convert(translation[0], "meters", "inches"), convert(translation[1], "meters", "inches")];

      positionInches[1] = gameData.heightInches - positionInches[1]; // Positive y is flipped on the canvas

      let positionPixels: [number, number] = [
        positionInches[0] * (canvasFieldWidth / gameData.widthInches),
        positionInches[1] * (canvasFieldHeight / gameData.heightInches)
      ];
      if (objectsFlipped) {
        positionPixels[0] = canvasFieldLeft + canvasFieldWidth - positionPixels[0];
        positionPixels[1] = canvasFieldTop + canvasFieldHeight - positionPixels[1];
      } else {
        positionPixels[0] += canvasFieldLeft;
        positionPixels[1] += canvasFieldTop;
      }
      return positionPixels;
    };

    // Function to draw robot
    let drawRobot = (
      pose: Pose2d,
      swerveStates: {
        values: SwerveState[];
        color: string;
      }[],
      ghostColor?: string
    ) => {
      let centerPos = calcCoordinates(pose.translation);
      let rotation = pose.rotation;
      if (objectsFlipped) rotation += Math.PI;

      // Render robot
      context.fillStyle = ghostColor !== undefined ? ghostColor : "#222";
      context.strokeStyle = ghostColor !== undefined ? ghostColor : command.bumpers;
      context.lineWidth = 3 * pixelsPerInch;
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
      context.lineWidth = 1.5 * pixelsPerInch;
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

      // Render swerve states
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
        let drawModuleData = (state: SwerveState, color: string) => {
          let fullRotation = rotation + state.angle;
          context.strokeStyle = color;

          // Draw speed
          if (Math.abs(state.speed) <= 0.001) return;
          let vectorSpeed = state.speed / 5;
          let vectorRotation = fullRotation;
          if (state.speed < 0) {
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
        swerveStates.forEach((set) => {
          if (index < set.values.length) {
            drawModuleData(set.values[index], set.color);
          }
        });
      });
    };

    // Update heatmap data
    let heatmapTranslations: Translation2d[] = [];
    command.objects
      .filter((object) => object.type === "heatmap")
      .forEach((object) => {
        heatmapTranslations = heatmapTranslations.concat(object.poses.map((pose) => pose.pose.translation));
      });
    this.heatmap.update(
      heatmapTranslations,
      [canvasFieldWidth, canvasFieldHeight],
      [convert(gameData.widthInches, "inches", "meters"), convert(gameData.heightInches, "inches", "meters")],
      objectsFlipped
    );
    let heatmapCanvas = this.heatmap.getCanvas();
    if (heatmapCanvas !== null) {
      context.drawImage(heatmapCanvas, canvasFieldLeft, canvasFieldTop);
    }

    // Draw objects
    const renderingOrder = ["trajectory", "robot", "ghost", "arrow", "zebra"];
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
              drawRobot(pose.pose, object.swerveStates);
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
              drawRobot(pose.pose, object.swerveStates, object.color);
            });
            break;
          case "arrow":
            let offsetIndex = ["front", "center", "back"].indexOf(object.position);
            object.poses.forEach((pose) => {
              let position = calcCoordinates(pose.pose.translation);
              let rotation = pose.pose.rotation;
              if (objectsFlipped) rotation += Math.PI;

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
          case "zebra":
            context.font =
              Math.round(12 * pixelsPerInch).toString() +
              "px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont";
            object.poses.forEach((pose) => {
              let coordinates = calcCoordinates(pose.pose.translation);

              if (!pose.annotation.zebraAlliance) return;
              context.fillStyle = pose.annotation.zebraAlliance;
              context.strokeStyle = "white";
              context.lineWidth = 2 * pixelsPerInch;
              context.beginPath();
              context.arc(coordinates[0], coordinates[1], 6 * pixelsPerInch, 0, Math.PI * 2);
              context.fill();
              context.stroke();

              if (!pose.annotation.zebraTeam) return;
              context.fillStyle = "white";
              context.textAlign = "center";
              context.fillText(
                pose.annotation.zebraTeam.toString(),
                coordinates[0],
                coordinates[1] - 15 * pixelsPerInch
              );
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

export type OdometryRendererCommand = {
  game: string;
  bumpers: "blue" | "red";
  origin: "blue" | "red";
  orientation: Orientation;
  size: 30 | 27 | 24;
  objects: OdometryRendererCommand_AnyObj[];
};

export type OdometryRendererCommand_AnyObj =
  | OdometryRendererCommand_RobotObj
  | OdometryRendererCommand_GhostObj
  | OdometryRendererCommand_TrajectoryObj
  | OdometryRendererCommand_HeatmapObj
  | OdometryRendererCommand_ArrowObj
  | OdometryRendererCommand_ZebraMarkerObj;

export type OdometryRendererCommand_RobotObj = {
  type: "robot";
  poses: AnnotatedPose2d[];
  trails: Translation2d[][];
  visionTargets: AnnotatedPose2d[];
  swerveStates: {
    values: SwerveState[];
    color: string;
  }[];
};

export type OdometryRendererCommand_GhostObj = {
  type: "ghost";
  poses: AnnotatedPose2d[];
  color: string;
  visionTargets: AnnotatedPose2d[];
  swerveStates: {
    values: SwerveState[];
    color: string;
  }[];
};

export type OdometryRendererCommand_TrajectoryObj = {
  type: "trajectory";
  color: string;
  size: string;
  poses: AnnotatedPose2d[];
};

export type OdometryRendererCommand_HeatmapObj = {
  type: "heatmap";
  poses: AnnotatedPose2d[];
};

export type OdometryRendererCommand_ArrowObj = {
  type: "arrow";
  poses: AnnotatedPose2d[];
  position: "center" | "back" | "front";
};

export type OdometryRendererCommand_ZebraMarkerObj = {
  type: "zebra";
  poses: AnnotatedPose2d[];
};
