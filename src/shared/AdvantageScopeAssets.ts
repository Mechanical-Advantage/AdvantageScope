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

export const ALLIANCE_STATION_WIDTH = Units.convert(69, "inches", "meters");
export const DEFAULT_DRIVER_STATIONS_FRC: [number, number][] = [
  [FRC_STANDARD_FIELD_LENGTH / 2, -ALLIANCE_STATION_WIDTH],
  [FRC_STANDARD_FIELD_LENGTH / 2, 0],
  [FRC_STANDARD_FIELD_LENGTH / 2, ALLIANCE_STATION_WIDTH],
  [-FRC_STANDARD_FIELD_LENGTH / 2, ALLIANCE_STATION_WIDTH],
  [-FRC_STANDARD_FIELD_LENGTH / 2, 0],
  [-FRC_STANDARD_FIELD_LENGTH / 2, -ALLIANCE_STATION_WIDTH]
];
const DEFAULT_DRIVER_STATION_Y_OFFSET_FTC = FTC_STANDARD_FIELD_LENGTH / 2 + Units.convert(39, "inches", "meters");
export const DEFAULT_DRIVER_STATIONS_FTC: [number, number][] = [
  [DEFAULT_DRIVER_STATION_Y_OFFSET_FTC, -FTC_STANDARD_FIELD_WIDTH / 6],
  [DEFAULT_DRIVER_STATION_Y_OFFSET_FTC, FTC_STANDARD_FIELD_WIDTH / 6],
  [-DEFAULT_DRIVER_STATION_Y_OFFSET_FTC, FTC_STANDARD_FIELD_WIDTH / 6],
  [-DEFAULT_DRIVER_STATION_Y_OFFSET_FTC, -FTC_STANDARD_FIELD_WIDTH / 6]
];

export interface AdvantageScopeAssets {
  field2ds: Config2d[];
  field3ds: Config3dField[];
  robots: Config3dRobot[];
  joysticks: ConfigJoystick[];
  loadFailures: string[];
}

export type CoordinateSystem =
  | "wall-alliance" // FRC 2022
  | "wall-blue" // FRC 2023-2026
  | "center-rotated" // FTC traditional
  | "center-red"; // Systemcore

export interface Config2d {
  name: string;
  path: string;
  id: string;

  isFTC: boolean;
  coordinateSystem: CoordinateSystem;
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
  coordinateSystem: CoordinateSystem;
  rotations: Config3d_Rotation[];
  position: [number, number, number];
  widthInches: number;
  heightInches: number;
  driverStations: [number, number][];
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

export interface ConfigJoystick {
  name: string;
  path: string;

  components: (ConfigJoystick_Button | ConfigJoystick_Joystick | ConfigJoystick_Axis)[];
}

export interface ConfigJoystick_Button {
  type: "button";
  isYellow: boolean;
  isEllipse: boolean;
  centerPx: [number, number]; // X, Y
  sizePx: [number, number]; // width, height
  sourceIndex: number; // button or POV index
  sourcePov?: "up" | "right" | "down" | "left"; // If specified, read as POV
}

export interface ConfigJoystick_Joystick {
  type: "joystick";
  isYellow: boolean;
  centerPx: [number, number]; // X, Y
  radiusPx: number;
  xSourceIndex: number;
  xSourceInverted: boolean; // Not inverted: right = positive
  ySourceIndex: number;
  ySourceInverted: boolean; // Not inverted: up = positive
  buttonSourceIndex?: number;
}

export interface ConfigJoystick_Axis {
  type: "axis";
  isYellow: boolean;
  centerPx: [number, number]; // X, Y
  sizePx: [number, number]; // width, height
  sourceIndex: number;
  sourceRange: [number, number]; // Min greater than max to invert
}

export const BuiltIn3dFields: Config3dField[] = [
  {
    name: "Evergreen",
    path: "",
    id: "FRC:Evergreen",
    isFTC: false,
    coordinateSystem: "wall-blue",
    rotations: [],
    position: [0, 0, 0],
    widthInches: Units.convert(FRC_STANDARD_FIELD_LENGTH, "meters", "inches"),
    heightInches: Units.convert(FRC_STANDARD_FIELD_WIDTH, "meters", "inches"),
    driverStations: DEFAULT_DRIVER_STATIONS_FRC,
    gamePieces: [],
    aprilTags: []
  },
  {
    name: "Evergreen",
    path: "",
    id: "FTC:Evergreen",
    isFTC: true,
    coordinateSystem: "center-rotated",
    rotations: [],
    position: [0, 0, 0],
    widthInches: Units.convert(FTC_STANDARD_FIELD_LENGTH, "meters", "inches"),
    heightInches: Units.convert(FTC_STANDARD_FIELD_WIDTH, "meters", "inches"),
    driverStations: DEFAULT_DRIVER_STATIONS_FTC,
    gamePieces: [],
    aprilTags: []
  },
  {
    name: "Axes",
    path: "",
    id: "FRC:Axes",
    isFTC: false,
    coordinateSystem: "wall-blue",
    rotations: [],
    position: [0, 0, 0],
    widthInches: Units.convert(FRC_STANDARD_FIELD_LENGTH, "meters", "inches"),
    heightInches: Units.convert(FRC_STANDARD_FIELD_WIDTH, "meters", "inches"),
    driverStations: DEFAULT_DRIVER_STATIONS_FRC,
    gamePieces: [],
    aprilTags: []
  },
  {
    name: "Axes",
    path: "",
    id: "FTC:Axes",
    isFTC: true,
    coordinateSystem: "center-rotated",
    rotations: [],
    position: [0, 0, 0],
    widthInches: Units.convert(FTC_STANDARD_FIELD_LENGTH, "meters", "inches"),
    heightInches: Units.convert(FTC_STANDARD_FIELD_WIDTH, "meters", "inches"),
    driverStations: DEFAULT_DRIVER_STATIONS_FTC,
    gamePieces: [],
    aprilTags: []
  }
];
