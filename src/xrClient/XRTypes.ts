export type XRCameraState = {
  camera: { projection: number[]; worldInverse: number[] };
  hitTest: { isValid: false } | { isValid: true; transform: number[] };
};
