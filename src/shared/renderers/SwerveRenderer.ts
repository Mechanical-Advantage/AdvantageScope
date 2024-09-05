import { Rotation2d, SwerveState } from "../geometry";
import { transformPx, wrapRadians } from "../util";
import TabRenderer from "./TabRenderer";

export default class SwerveRenderer implements TabRenderer {
  private CONTAINER: HTMLElement;
  private CANVAS: HTMLCanvasElement;

  private BLACK_COLOR = "#222222";
  private WHITE_COLOR = "#eeeeee";

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

  render(command: SwerveRendererCommand): void {
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
    let arrowBack = transformPx(centerPx, command.rotation, [frameHeightPx * -0.3, 0]);
    let arrowFront = transformPx(centerPx, command.rotation, [frameHeightPx * 0.3, 0]);
    let arrowLeft = transformPx(centerPx, command.rotation, [frameHeightPx * 0.15, frameWidthPx * 0.15]);
    let arrowRight = transformPx(centerPx, command.rotation, [frameHeightPx * 0.15, frameWidthPx * -0.15]);
    context.beginPath();
    context.moveTo(...arrowBack);
    context.lineTo(...arrowFront);
    context.moveTo(...arrowLeft);
    context.lineTo(...arrowFront);
    context.lineTo(...arrowRight);
    context.stroke();

    // Draw each corner
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
      let drawModuleData = (state: SwerveState, color: string) => {
        let fullRotation = command.rotation + state.angle;
        context.fillStyle = color;
        context.strokeStyle = color;
        context.lineWidth = 4;

        // Draw rotation
        context.beginPath();
        if (command.sets.length >= 2) {
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
        if (Math.abs(state.speed) <= 0.001) return;
        let vectorSpeed = state.speed;
        let vectorRotation = fullRotation;
        if (state.speed < 0) {
          vectorSpeed *= -1;
          vectorRotation += Math.PI;
        }
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
      command.sets.forEach((set) => {
        if (index < set.states.length) {
          drawModuleData(set.states[index], set.color);
        }
      });

      // Draw module outline
      context.strokeStyle = strokeColor;
      context.lineWidth = 4;
      context.beginPath();
      context.arc(...moduleCenterPx, moduleRadiusPx, 0, Math.PI * 2);
      context.stroke();
    });
  }
}

export type SwerveRendererCommand = {
  rotation: Rotation2d;
  frameAspectRatio: number;
  sets: {
    states: SwerveState[];
    color: string;
  }[];
};
