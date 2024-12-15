export type XRSettings = {
  calibration: XRCalibrationMode;
  showCarpet: boolean;
  showField: boolean;
  showRobots: boolean;
};

export enum XRCalibrationMode {
  Miniature,
  FullSizeBlue,
  FullSizeRed
}
