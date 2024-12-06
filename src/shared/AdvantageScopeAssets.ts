import { convert } from "./units";

export const STANDARD_FIELD_LENGTH = convert(54, "feet", "meters");
export const STANDARD_FIELD_WIDTH = convert(27, "feet", "meters");
export const ALLIANCE_STATION_WIDTH = convert(69, "inches", "meters");
export const DEFAULT_DRIVER_STATIONS: [number, number][] = [
  [-STANDARD_FIELD_LENGTH / 2, ALLIANCE_STATION_WIDTH],
  [-STANDARD_FIELD_LENGTH / 2, 0],
  [-STANDARD_FIELD_LENGTH / 2, -ALLIANCE_STATION_WIDTH],
  [STANDARD_FIELD_LENGTH / 2, -ALLIANCE_STATION_WIDTH],
  [STANDARD_FIELD_LENGTH / 2, 0],
  [STANDARD_FIELD_LENGTH / 2, ALLIANCE_STATION_WIDTH]
];

export interface AdvantageScopeAssets {
  field2ds: Config2d[];
  field3ds: Config3dField[];
  robots: Config3dRobot[];
  joysticks: ConfigJoystick[];
  loadFailures: string[];
}

export interface Config2d {
  name: string;
  path: string;

  sourceUrl?: string;
  topLeft: [number, number];
  bottomRight: [number, number];
  widthInches: number;
  heightInches: number;
  defaultOrigin: "auto" | "blue" | "red";
}

export interface Config3dField {
  name: string;
  path: string;

  sourceUrl?: string; // Unused starting in 2025
  rotations: Config3d_Rotation[];
  widthInches: number;
  heightInches: number;
  defaultOrigin: "auto" | "blue" | "red";
  driverStations: [number, number][];
  gamePieces: Config3dField_GamePiece[];
}

export interface Config3dField_GamePiece {
  name: string;
  rotations: Config3d_Rotation[];
  position: [number, number, number];
  stagedObjects: string[];
}

export interface Config3dField_GamePieceLocation {
  rotations: Config3d_Rotation[];
  position: [number, number, number];
}

export interface Config3dRobot {
  name: string;
  path: string;

  sourceUrl?: string;
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
