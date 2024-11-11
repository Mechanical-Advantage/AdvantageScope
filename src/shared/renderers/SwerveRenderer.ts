import { ChassisSpeeds, Rotation2d, SwerveState } from "../geometry";
import { transformPx, wrapRadians } from "../util";
import TabRenderer from "./TabRenderer";

export default class SwerveRenderer implements TabRenderer {
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

  render(command: SwerveRendererCommand): void {
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
    this.lastRenderState = renderStateString;

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
    const hasSpeeds = command.speeds.length > 0;
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
      let drawModuleData = (state: SwerveState, color: string) => {
        let fullRotation = command.rotation + state.angle;
        context.fillStyle = color;
        context.strokeStyle = color;
        context.lineWidth = 4;

        // Draw rotation
        context.beginPath();
        if (command.states.length >= 2) {
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
      command.states.forEach((set) => {
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

    // Draw chassis speeds
    command.speeds.forEach((speed) => {
      context.strokeStyle = speed.color;
      context.lineWidth = 4;

      // Linear speed
      let angle = Math.atan2(speed.value.vy, speed.value.vx);
      let length = Math.hypot(speed.value.vx, speed.value.vy);
      if (length < 0.05) return;
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
  }
}

export type SwerveRendererCommand = {
  rotation: Rotation2d;
  frameAspectRatio: number;
  states: {
    values: SwerveState[];
    color: string;
  }[];
  speeds: {
    value: ChassisSpeeds;
    color: string;
  }[];
};
