export type XRCameraState = {
  camera: { projection: number[]; worldInverse: number[] };
  frameSize: [number, number];
  lighting: {
    grain: number;
    intensity: number;
    temperature: number;
  };
  raycast: { isValid: false } | { isValid: true; position: [number, number, number] };
};
