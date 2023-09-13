import h337 from "heatmap.js";
import { Pose2d, Translation2d } from "../geometry";
import { convert } from "../units";
import { transformPx } from "../util";
import Visualizer from "./Visualizer";
import { typed } from "mathjs";

export default class OdometryVisualizer implements Visualizer {
  private HEATMAP_GRID_SIZE = 0.1;
  private HEATMAP_RADIUS = 0.1; // Fraction of field height

  private CONTAINER: HTMLElement;
  private HEATMAP_CONTAINER: HTMLElement;
  private CANVAS: HTMLCanvasElement;
  private IMAGE: HTMLImageElement;

  private heatmap: h337.Heatmap<"value", "x", "y"> | null = null;
  private lastWidth = 0;
  private lastHeight = 0;
  private lastObjectsFlipped: boolean | null = null;
  private lastHeatmapData = "";
  private lastImageSource = "";

  constructor(container: HTMLElement, heatmapContainer: HTMLElement) {
    this.CONTAINER = container;
    this.CANVAS = container.firstElementChild as HTMLCanvasElement;
    this.HEATMAP_CONTAINER = heatmapContainer;
    this.IMAGE = document.createElement("img");
    this.CANVAS.appendChild(this.IMAGE);
  }

  render(command: any): number | null {
    // Set up canvas
    let context = this.CANVAS.getContext("2d") as CanvasRenderingContext2D;
    let isVertical =
      command.options.orientation === "blue bottom, red top" || command.options.orientation === "red bottom, blue top";
    let width = isVertical ? this.CONTAINER.clientHeight : this.CONTAINER.clientWidth;
    let height = isVertical ? this.CONTAINER.clientWidth : this.CONTAINER.clientHeight;
    this.CANVAS.style.width = width.toString() + "px";
    this.CANVAS.style.height = height.toString() + "px";
    this.CANVAS.width = width * window.devicePixelRatio;
    this.CANVAS.height = height * window.devicePixelRatio;
    context.scale(window.devicePixelRatio, window.devicePixelRatio);
    context.clearRect(0, 0, width, height);

    // Set canvas transform
    switch (command.options.orientation) {
      case "blue left, red right":
        this.CANVAS.style.transform = "translate(-50%, -50%)";
        break;
      case "red left, blue right":
        this.CANVAS.style.transform = "translate(-50%, -50%) rotate(180deg)";
        break;
      case "blue bottom, red top":
        this.CANVAS.style.transform = "translate(-50%, -50%) rotate(-90deg)";
        break;
      case "red bottom, blue top":
        this.CANVAS.style.transform = "translate(-50%, -50%) rotate(90deg)";
        break;
    }

    // Get game data and update image element
    let gameData = window.assets?.field2ds.find((game) => game.name === command.options.game);
    if (!gameData) return null;
    if (gameData.path !== this.lastImageSource) {
      this.lastImageSource = gameData.path;
      this.IMAGE.src = gameData.path;
    }
    if (!(this.IMAGE.width > 0 && this.IMAGE.height > 0)) {
      return null;
    }

    // Determine if objects are flipped
    let objectsFlipped = command.allianceRedOrigin;

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

    // Calculate field edges
    let canvasFieldLeft = renderValues[0] + gameData.topLeft[0] * imageScalar;
    let canvasFieldTop = renderValues[1] + gameData.topLeft[1] * imageScalar;
    let canvasFieldWidth = fieldWidth * imageScalar;
    let canvasFieldHeight = fieldHeight * imageScalar;
    let pixelsPerInch = (canvasFieldHeight / gameData.heightInches + canvasFieldWidth / gameData.widthInches) / 2;

    // Convert translation to pixel coordinates
    let calcCoordinates = (translation: Translation2d, alwaysFlipped = false): [number, number] => {
      if (!gameData) return [0, 0];
      let positionInches = [convert(translation[0], "meters", "inches"), convert(translation[1], "meters", "inches")];

      positionInches[1] *= -1; // Positive y is flipped on the canvas
      switch (command.options.origin) {
        case "left":
          break;
        case "center":
          positionInches[1] += gameData.heightInches / 2;
          break;
        case "right":
          positionInches[1] += gameData.heightInches;
          break;
      }

      let positionPixels: [number, number] = [
        positionInches[0] * (canvasFieldWidth / gameData.widthInches),
        positionInches[1] * (canvasFieldHeight / gameData.heightInches)
      ];
      if (objectsFlipped || alwaysFlipped) {
        positionPixels[0] = canvasFieldLeft + canvasFieldWidth - positionPixels[0];
        positionPixels[1] = canvasFieldTop + canvasFieldHeight - positionPixels[1];
      } else {
        positionPixels[0] += canvasFieldLeft;
        positionPixels[1] += canvasFieldTop;
      }
      return positionPixels;
    };

    // Recreate heatmap canvas
    let newHeatmapInstance = false;
    if (
      width !== this.lastWidth ||
      height !== this.lastHeight ||
      objectsFlipped !== this.lastObjectsFlipped ||
      !this.heatmap
    ) {
      newHeatmapInstance = true;
      this.lastWidth = width;
      this.lastHeight = height;
      this.lastObjectsFlipped = objectsFlipped;
      while (this.HEATMAP_CONTAINER.firstChild) {
        this.HEATMAP_CONTAINER.removeChild(this.HEATMAP_CONTAINER.firstChild);
      }
      this.HEATMAP_CONTAINER.style.width = width.toString() + "px";
      this.HEATMAP_CONTAINER.style.height = height.toString() + "px";
      this.heatmap = h337.create({
        container: this.HEATMAP_CONTAINER,
        radius: this.IMAGE.height * imageScalar * this.HEATMAP_RADIUS,
        maxOpacity: 0.75
      });
    }

    // Update heatmap data
    let heatmapDataString = JSON.stringify(command.poses.heatmap);
    if (heatmapDataString !== this.lastHeatmapData || newHeatmapInstance) {
      this.lastHeatmapData = heatmapDataString;
      let grid: number[][] = [];
      let fieldWidthMeters = convert(gameData.widthInches, "inches", "meters");
      let fieldHeightMeters = convert(gameData.heightInches, "inches", "meters");
      for (let x = 0; x < fieldWidthMeters + this.HEATMAP_GRID_SIZE; x += this.HEATMAP_GRID_SIZE) {
        let column: number[] = [];
        grid.push(column);
        for (let y = 0; y < fieldHeightMeters + this.HEATMAP_GRID_SIZE; y += this.HEATMAP_GRID_SIZE) {
          column.push(0);
        }
      }

      (command.poses.heatmap as Translation2d[]).forEach((translation) => {
        let gridX = Math.floor(translation[0] / this.HEATMAP_GRID_SIZE);
        let gridY = Math.floor(translation[1] / this.HEATMAP_GRID_SIZE);
        if (gridX >= 0 && gridY >= 0 && gridX < grid.length && gridY < grid[0].length) {
          grid[gridX][gridY] += 1;
        }
      });

      let heatmapData: { x: number; y: number; value: number }[] = [];
      let x = this.HEATMAP_GRID_SIZE / 2;
      let y: number;
      let maxValue = 0;
      grid.forEach((column) => {
        x += this.HEATMAP_GRID_SIZE;
        y = this.HEATMAP_GRID_SIZE / 2;
        column.forEach((gridValue) => {
          y += this.HEATMAP_GRID_SIZE;
          let coordinates = calcCoordinates([x, y]);
          coordinates = [Math.round(coordinates[0]), Math.round(coordinates[1])];
          maxValue = Math.max(maxValue, gridValue);
          if (gridValue > 0) {
            heatmapData.push({
              x: coordinates[0],
              y: coordinates[1],
              value: gridValue
            });
          }
        });
      });
      this.heatmap.setData({
        min: 0,
        max: maxValue,
        data: heatmapData
      });
    }

    // Copy heatmap to main canvas
    context.drawImage(this.HEATMAP_CONTAINER.firstElementChild as HTMLCanvasElement, 0, 0);

    // Draw trajectories
    command.poses.trajectory.forEach((trajectory: Pose2d[]) => {
      context.strokeStyle = "orange";
      context.lineWidth = 2 * pixelsPerInch;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.beginPath();
      let firstPoint = true;
      trajectory.forEach((pose) => {
        if (firstPoint) {
          context.moveTo(...calcCoordinates(pose.translation));
          firstPoint = false;
        } else {
          context.lineTo(...calcCoordinates(pose.translation));
        }
      });
      context.stroke();
    });

    // Draw vision targets
    if (command.poses.robot.length > 0) {
      let robotPos = calcCoordinates(command.poses.robot[0].translation);
      command.poses.visionTarget.forEach((target: Pose2d) => {
        context.strokeStyle = "lightgreen";
        context.lineWidth = 1 * pixelsPerInch; // 1 inch
        context.beginPath();
        context.moveTo(robotPos[0], robotPos[1]);
        context.lineTo(...calcCoordinates(target.translation));
        context.stroke();
      });
    }

    // Draw robots
    let robotLengthPixels = pixelsPerInch * convert(command.options.size, command.options.unitDistance, "inches");
    command.poses.robot.forEach((robotPose: Pose2d, index: number) => {
      let robotPos = calcCoordinates(robotPose.translation);
      let rotation = robotPose.rotation;
      if (objectsFlipped) rotation += Math.PI;

      // Render trail
      let trailData = command.poses.trail[index] as Translation2d[];
      let trailCoordinates: [number, number][] = [];
      let maxDistance = 0;
      trailData.forEach((translation: Translation2d) => {
        let coordinates = calcCoordinates(translation);
        trailCoordinates.push(coordinates);
        let distance = Math.hypot(coordinates[0] - robotPos[0], coordinates[1] - robotPos[0]);
        if (distance > maxDistance) maxDistance = distance;
      });

      let gradient = context.createRadialGradient(
        robotPos[0],
        robotPos[1],
        robotLengthPixels * 0.5,
        robotPos[0],
        robotPos[1],
        maxDistance
      );
      gradient.addColorStop(0, "rgba(170, 170, 170, 1)");
      gradient.addColorStop(0.25, "rgba(170, 170, 170, 1)");
      gradient.addColorStop(1, "rgba(170, 170, 170, 0)");

      context.strokeStyle = gradient;
      context.lineWidth = 1 * pixelsPerInch; // 1 inch
      context.lineCap = "round";
      context.lineJoin = "round";
      context.beginPath();
      let firstPoint = true;
      trailCoordinates.forEach((position) => {
        if (firstPoint) {
          context.moveTo(position[0], position[1]);
          firstPoint = false;
        } else {
          context.lineTo(position[0], position[1]);
        }
      });
      context.stroke();

      // Render robot
      context.fillStyle = "#222";
      context.strokeStyle = command.allianceRedBumpers ? "red" : "blue";
      context.lineWidth = 3 * pixelsPerInch;
      let backLeft = transformPx(robotPos, rotation, [robotLengthPixels * -0.5, robotLengthPixels * 0.5]);
      let frontLeft = transformPx(robotPos, rotation, [robotLengthPixels * 0.5, robotLengthPixels * 0.5]);
      let frontRight = transformPx(robotPos, rotation, [robotLengthPixels * 0.5, robotLengthPixels * -0.5]);
      let backRight = transformPx(robotPos, rotation, [robotLengthPixels * -0.5, robotLengthPixels * -0.5]);
      context.beginPath();
      context.moveTo(frontLeft[0], frontLeft[1]);
      context.lineTo(frontRight[0], frontRight[1]);
      context.lineTo(backRight[0], backRight[1]);
      context.lineTo(backLeft[0], backLeft[1]);
      context.closePath();
      context.fill();
      context.stroke();

      context.strokeStyle = "white";
      context.lineWidth = 1.5 * pixelsPerInch;
      let arrowBack = transformPx(robotPos, rotation, [robotLengthPixels * -0.3, 0]);
      let arrowFront = transformPx(robotPos, rotation, [robotLengthPixels * 0.3, 0]);
      let arrowLeft = transformPx(robotPos, rotation, [robotLengthPixels * 0.15, robotLengthPixels * 0.15]);
      let arrowRight = transformPx(robotPos, rotation, [robotLengthPixels * 0.15, robotLengthPixels * -0.15]);
      context.beginPath();
      context.moveTo(arrowBack[0], arrowBack[1]);
      context.lineTo(arrowFront[0], arrowFront[1]);
      context.lineTo(arrowLeft[0], arrowLeft[1]);
      context.moveTo(arrowFront[0], arrowFront[1]);
      context.lineTo(arrowRight[0], arrowRight[1]);
      context.stroke();
    });

    // Draw ghosts
    [command.poses.ghost as Pose2d[], command.poses.zebraGhost as Pose2d[]].forEach((ghostSet, index) => {
      ghostSet.forEach((robotPose: Pose2d) => {
        const forceFlipped = index === 1; // Zebra data always uses red origin
        let robotPos = calcCoordinates(robotPose.translation, forceFlipped);
        let rotation = robotPose.rotation;
        if (objectsFlipped || forceFlipped) rotation += Math.PI;

        context.globalAlpha = 0.5;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.fillStyle = "#222";
        context.strokeStyle = command.allianceRedBumpers ? "red" : "blue";
        context.lineWidth = 3 * pixelsPerInch;
        let backLeft = transformPx(robotPos, rotation, [robotLengthPixels * -0.5, robotLengthPixels * 0.5]);
        let frontLeft = transformPx(robotPos, rotation, [robotLengthPixels * 0.5, robotLengthPixels * 0.5]);
        let frontRight = transformPx(robotPos, rotation, [robotLengthPixels * 0.5, robotLengthPixels * -0.5]);
        let backRight = transformPx(robotPos, rotation, [robotLengthPixels * -0.5, robotLengthPixels * -0.5]);
        context.beginPath();
        context.moveTo(frontLeft[0], frontLeft[1]);
        context.lineTo(frontRight[0], frontRight[1]);
        context.lineTo(backRight[0], backRight[1]);
        context.lineTo(backLeft[0], backLeft[1]);
        context.closePath();
        context.fill();
        context.stroke();

        context.strokeStyle = "white";
        context.lineWidth = 1.5 * pixelsPerInch;
        let arrowBack = transformPx(robotPos, rotation, [robotLengthPixels * -0.3, 0]);
        let arrowFront = transformPx(robotPos, rotation, [robotLengthPixels * 0.3, 0]);
        let arrowLeft = transformPx(robotPos, rotation, [robotLengthPixels * 0.15, robotLengthPixels * 0.15]);
        let arrowRight = transformPx(robotPos, rotation, [robotLengthPixels * 0.15, robotLengthPixels * -0.15]);
        context.beginPath();
        context.moveTo(arrowBack[0], arrowBack[1]);
        context.lineTo(arrowFront[0], arrowFront[1]);
        context.lineTo(arrowLeft[0], arrowLeft[1]);
        context.moveTo(arrowFront[0], arrowFront[1]);
        context.lineTo(arrowRight[0], arrowRight[1]);
        context.stroke();
        context.globalAlpha = 1;
      });
    });

    // Draw arrows
    [command.poses.arrowFront, command.poses.arrowCenter, command.poses.arrowBack].forEach(
      (arrowPoses: Pose2d[], index: number) => {
        arrowPoses.forEach((arrowPose: Pose2d) => {
          let position = calcCoordinates(arrowPose.translation);
          let rotation = arrowPose.rotation;
          if (objectsFlipped) rotation += Math.PI;

          context.strokeStyle = "white";
          context.lineCap = "round";
          context.lineJoin = "round";
          context.lineWidth = 1.5 * pixelsPerInch;
          let arrowBack = transformPx(position, rotation, [robotLengthPixels * (-0.6 + 0.3 * index), 0]);
          let arrowFront = transformPx(position, rotation, [robotLengthPixels * (0.3 * index), 0]);
          let arrowLeft = transformPx(position, rotation, [
            robotLengthPixels * (-0.15 + 0.3 * index),
            robotLengthPixels * 0.15
          ]);
          let arrowRight = transformPx(position, rotation, [
            robotLengthPixels * (-0.15 + 0.3 * index),
            robotLengthPixels * -0.15
          ]);
          let crossbarLeft = transformPx(position, rotation, [0, robotLengthPixels * (index === 0 ? 0.15 : 0.1)]);
          let crossbarRight = transformPx(position, rotation, [0, robotLengthPixels * -(index === 0 ? 0.15 : 0.1)]);
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
      }
    );

    // Draw Zebra markers
    context.font =
      Math.round(12 * pixelsPerInch).toString() + "px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont";
    Object.entries(command.poses.zebraMarker).forEach(([team, value]) => {
      let typedValue = value as {
        translation: Translation2d;
        alliance: string;
      };
      let coordinates = calcCoordinates(typedValue.translation, true);

      context.fillStyle = typedValue.alliance;
      context.strokeStyle = "white";
      context.lineWidth = 2 * pixelsPerInch;
      context.beginPath();
      context.arc(coordinates[0], coordinates[1], 6 * pixelsPerInch, 0, Math.PI * 2);
      context.fill();
      context.stroke();

      context.fillStyle = "white";
      context.textAlign = "center";
      context.fillText(team, coordinates[0], coordinates[1] - 15 * pixelsPerInch);
    });

    // Return target aspect ratio
    return isVertical ? fieldHeight / fieldWidth : fieldWidth / fieldHeight;
  }
}
