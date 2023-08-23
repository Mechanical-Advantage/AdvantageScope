export interface AdvantageScopeAssets {
  field2ds: Config2d[];
  field3ds: Config3dField[];
  robots: Config3dRobot[];
  joysticks: ConfigJoystick[];
}

export interface Config2d {
  name: string;
  path: string;

  sourceUrl?: string;
  topLeft: [number, number];
  bottomRight: [number, number];
  widthInches: number;
  heightInches: number;
}

export interface Config3dField {
  name: string;
  path: string;

  sourceUrl?: string;
  rotations: Config3d_Rotation[];
  widthInches: number;
  heightInches: number;
}

export interface Config3dRobot {
  name: string;
  path: string;

  sourceUrl?: string;
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
