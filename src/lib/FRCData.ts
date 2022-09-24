export interface FRCData {
  field2ds: Config2d[];
  field3ds: Config3dField[];
  robots: Config3dRobot[];
}

export interface Config2d {
  title: string;
  path: string;

  sourceUrl: string;
  topLeft: [number, number];
  bottomRight: [number, number];
  widthInches: number;
  heightInches: number;
}

export interface Config3dField {
  title: string;
  path: string;

  sourceUrl: string;
  rotations: [number, number, number, number][];
  widthInches: number;
  heightInches: number;
}

export interface Config3dRobot {
  title: string;
  path: string;

  sourceUrl: string;
  rotations: [number, number, number, number][];
  position: [number, number, number];
}
