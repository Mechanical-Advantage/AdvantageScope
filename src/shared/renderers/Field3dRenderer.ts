// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { CoordinateSystem } from "../AdvantageScopeAssets";
import { AnnotatedPose3d, SwerveState } from "../geometry";
import { MechanismState } from "../log/LogUtil";
import Field3dRendererImpl from "./Field3dRendererImpl";
import TabRenderer from "./TabRenderer";

export default class Field3dRenderer implements TabRenderer {
  private CANVAS: HTMLCanvasElement;
  private CANVAS_CONTAINER: HTMLElement;
  private ALERT: HTMLElement;
  private SPINNER: HTMLElement;

  private implementation: Field3dRendererImpl | null = null;
  private lastMode: "cinematic" | "standard" | "low-power" | null = null;
  private lastUseAA = true;
  private stateRestoreCache: unknown | null = null;

  constructor(root: HTMLElement) {
    this.CANVAS = root.getElementsByClassName("field-3d-canvas")[0] as HTMLCanvasElement;
    this.CANVAS_CONTAINER = root.getElementsByClassName("field-3d-canvas-container")[0] as HTMLElement;
    this.ALERT = root.getElementsByClassName("field-3d-alert")[0] as HTMLElement;
    this.SPINNER = root.getElementsByClassName("spinner-cubes-container")[0] as HTMLElement;
    this.updateImplementation();
  }

  saveState(): unknown {
    return this.implementation === null ? null : this.implementation.saveState();
  }

  restoreState(state: unknown): void {
    if (state !== null) {
      if (this.implementation === null) {
        this.stateRestoreCache = state;
      } else {
        this.implementation.restoreState(state);
      }
    }
  }

  /** Switches the selected camera. */
  set3DCamera(index: number) {
    this.implementation?.set3DCamera(index);
  }

  /** Updates the orbit FOV. */
  setFov(fov: number) {
    this.implementation?.setFov(fov);
  }

  private updateImplementation() {
    // Get current mode
    let mode: "cinematic" | "standard" | "low-power" | null = null;
    if (window.preferences) {
      if (window.isBattery && window.preferences.field3dModeBattery !== "") {
        mode = window.preferences.field3dModeBattery;
      } else {
        mode = window.preferences.field3dModeAc;
      }
    }

    let useAA = true;
    if (window.preferences) {
      useAA = window.preferences.field3dAntialiasing;
    }

    // Recreate visualizer if necessary
    if ((mode !== this.lastMode || useAA != this.lastUseAA) && mode !== null) {
      this.lastMode = mode;
      this.lastUseAA = useAA;
      let state: any = null;
      if (this.implementation !== null) {
        state = this.implementation.saveState();
        this.implementation.stop();
      }
      {
        let newCanvas = document.createElement("canvas");
        this.CANVAS.classList.forEach((className) => {
          newCanvas.classList.add(className);
        });
        newCanvas.id = this.CANVAS.id;
        this.CANVAS.replaceWith(newCanvas);
        this.CANVAS = newCanvas;
      }
      this.implementation = new Field3dRendererImpl(
        mode,
        useAA,
        this.CANVAS,
        this.CANVAS_CONTAINER,
        this.ALERT,
        this.SPINNER
      );
      if (this.stateRestoreCache !== null) {
        this.implementation.restoreState(this.stateRestoreCache);
        this.stateRestoreCache = null;
      } else if (state !== null) {
        this.implementation.restoreState(state);
      }
    }
  }

  getAspectRatio(): number | null {
    return this.implementation === null ? null : this.implementation.getAspectRatio();
  }

  render(command: Field3dRendererCommand): void {
    this.updateImplementation();
    this.implementation?.render(command);
  }
}

// Most poses are still in their original coordinate system
// Heatmap poses are already converted to a center-red coordinate system
export type Field3dRendererCommand = {
  field: string;
  isRedAlliance: boolean;
  coordinateSystem: CoordinateSystem;
  objects: Field3dRendererCommand_AnyObj[];
  cameraOverride: AnnotatedPose3d | null;
  autoDriverStation: number;
  allRobotModels: string[];
};

export type Field3dRendererCommand_AnyObj =
  | Field3dRendererCommand_RobotObj
  | Field3dRendererCommand_GhostObj
  | Field3dRendererCommand_GamePieceObj
  | Field3dRendererCommand_TrajectoryObj
  | Field3dRendererCommand_HeatmapObj
  | Field3dRendererCommand_AprilTagObj
  | Field3dRendererCommand_AprilTagBuiltInObj
  | Field3dRendererCommand_AxesObj
  | Field3dRendererCommand_ConeObj;

export type Field3dRendererCommand_GenericRobotObj = {
  model: string;
  poses: AnnotatedPose3d[];
  components: AnnotatedPose3d[];
  mechanisms: {
    xz: MechanismState | null;
    yz: MechanismState | null;
  };
  visionTargets: AnnotatedPose3d[];
  swerveStates: {
    values: SwerveState[];
    color: string;
  }[];
};

export type Field3dRendererCommand_RobotObj = Field3dRendererCommand_GenericRobotObj & {
  type: "robot";
};

export type Field3dRendererCommand_GhostObj = Field3dRendererCommand_GenericRobotObj & {
  type: "ghost";
  color: string;
};

export type Field3dRendererCommand_GamePieceObj = {
  type: "gamePiece";
  variant: string;
  poses: AnnotatedPose3d[];
};

export type Field3dRendererCommand_TrajectoryObj = {
  type: "trajectory";
  color: string;
  size: string;
  poses: AnnotatedPose3d[];
};

export type Field3dRendererCommand_HeatmapObj = {
  type: "heatmap";
  poses: AnnotatedPose3d[];
};

export type Field3dRendererCommand_AprilTagVariant = {
  family: "36h11" | "16h5";
  inches: number;
};

export type Field3dRendererCommand_AprilTagObj = {
  type: "aprilTag";
  poses: AnnotatedPose3d[];
  variant: Field3dRendererCommand_AprilTagVariant;
};

export type Field3dRendererCommand_AprilTagBuiltInObj = Omit<Field3dRendererCommand_AprilTagObj, "type"> & {
  type: "aprilTagBuiltIn";
};

export type Field3dRendererCommand_AxesObj = {
  type: "axes";
  poses: AnnotatedPose3d[];
};

export type Field3dRendererCommand_ConeObj = {
  type: "cone";
  color: string;
  position: "center" | "back" | "front";
  poses: AnnotatedPose3d[];
};
