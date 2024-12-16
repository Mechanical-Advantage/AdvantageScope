import { Translation3d } from "../shared/geometry";

export type XRCameraState = {
  camera: { projection: number[]; worldInverse: number[]; position: Translation3d };
  frameSize: [number, number];
  lighting: LightingState;
  raycast: RaycastResult;
};

export type LightingState = {
  grain: number;
  intensity: number;
  temperature: number;
};

export type RaycastResult = { isValid: false } | { isValid: true; position: Translation3d };
