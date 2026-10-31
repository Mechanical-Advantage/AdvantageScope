// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { Units } from "./units";

export const FRC_STANDARD_FIELD_LENGTH = Units.convert(54, "feet", "meters");
export const FRC_STANDARD_FIELD_WIDTH = Units.convert(27, "feet", "meters");
export const FTC_STANDARD_FIELD_LENGTH = Units.convert(12, "feet", "meters");
export const FTC_STANDARD_FIELD_WIDTH = Units.convert(12, "feet", "meters");

export interface AdvantageScopeAssets {
  field2ds: Config2d[];
  field3ds: Config3dField[];
  robots: Config3dRobot[];
  loadFailures: string[];
}

/**
 * All poses use a single right-handed coordinate system: origin at the center
 * of the field, +X forward, +Y left, +Z up.
 */

export interface Config2d {
  name: string;
  path: string;
  id: string;

  isFTC: boolean;
  useGrid: boolean | undefined;
  sourceUrl?: string;
  topLeft: [number, number];
  bottomRight: [number, number];
  widthInches: number;
  heightInches: number;
}

export interface Config3dField {
  name: string;
  path: string;
  id: string;

  isFTC: boolean;
  useGrid: boolean | undefined;
  rotations: Config3d_Rotation[];
  position: [number, number, number];
  widthInches: number;
  heightInches: number;
  gamePieces: Config3dField_GamePiece[];
  aprilTags: Config3dField_AprilTag[];
}

export interface Config3dField_GamePiece {
  name: string;
  rotations: Config3d_Rotation[];
  position: [number, number, number];
  stagedObjects: string[];
}

export interface Config3dField_AprilTag {
  variant: string;
  id: number;
  rotations: Config3d_Rotation[];
  position: [number, number, number];
}

export interface Config3dRobot {
  name: string;
  path: string;

  isFTC: boolean;
  disableSimplification: boolean;
  rotations: Config3d_Rotation[];
  position: [number, number, number];
  cameras: Config3dRobot_Camera[];
  components: Config3dRobot_Component[];
}

export interface Config3dRobot_Camera {
  name: string;
  rotations: Config3d_Rotation[];
  position: [number, number, number];
  resolution: [number, number];
  fov: number;
}

export interface Config3dRobot_Component {
  zeroedRotations: Config3d_Rotation[];
  zeroedPosition: [number, number, number];
}

export interface Config3d_Rotation {
  axis: "x" | "y" | "z";
  degrees: number;
}

export const BuiltIn3dFields: Config3dField[] = [
  ...["Grid", "Track", "None"].map((name) => ({
    name,
    path: "",
    id: "MUR:" + name,
    isFTC: false,
    useGrid: false,
    rotations: [],
    position: [0, 0, 0] as [number, number, number],
    widthInches: 1600,
    heightInches: 800,
    gamePieces: [],
    aprilTags: []
  })),
  {
    name: "Evergreen",
    path: "",
    id: "FRC:Evergreen",
    isFTC: false,
    useGrid: true,
    rotations: [],
    position: [0, 0, 0],
    widthInches: Units.convert(FRC_STANDARD_FIELD_LENGTH, "meters", "inches"),
    heightInches: Units.convert(FRC_STANDARD_FIELD_WIDTH, "meters", "inches"),
    gamePieces: [],
    aprilTags: []
  },
  {
    name: "Axes",
    path: "",
    id: "FRC:Axes",
    isFTC: false,
    useGrid: true,
    rotations: [],
    position: [0, 0, 0],
    widthInches: Units.convert(FRC_STANDARD_FIELD_LENGTH, "meters", "inches"),
    heightInches: Units.convert(FRC_STANDARD_FIELD_WIDTH, "meters", "inches"),
    gamePieces: [],
    aprilTags: []
  }
];
