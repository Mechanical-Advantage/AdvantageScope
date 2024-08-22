import { AnnotatedPose2d, Translation2d } from "../geometry";
import TabRenderer from "./TabRenderer";

export default class OdometryRenderer implements TabRenderer {
  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {}

  render(command: unknown): void {}
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
  objects: OdometryRendererCommand_AllObjs[];
};

export type OdometryRendererCommand_AllObjs =
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
};

export type OdometryRendererCommand_GhostObj = {
  type: "ghost";
  poses: AnnotatedPose2d[];
  color: string;
  visionTargets: AnnotatedPose2d[];
};

export type OdometryRendererCommand_TrajectoryObj = {
  type: "trajectory";
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
