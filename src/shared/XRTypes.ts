import { AdvantageScopeAssets } from "./AdvantageScopeAssets";
import { Translation3d } from "./geometry";
import { ThreeDimensionRendererCommand } from "./renderers/ThreeDimensionRenderer";

export type XRSettings = {
  calibration: XRCalibrationMode;
  streaming: XRStreamingMode;
  showCarpet: boolean;
  showField: boolean;
  showRobots: boolean;
};

export enum XRCalibrationMode {
  Miniature = 0,
  FullSizeBlue = 1,
  FullSizeRed = 2
}

export enum XRStreamingMode {
  Smooth = 0,
  LowLatency = 1
}

export type XRPacket =
  | { type: "settings"; time: number; value: XRSettings }
  | { type: "command"; time: number; value: ThreeDimensionRendererCommand }
  | { type: "assets"; time: number; value: AdvantageScopeAssets };

export type XRFrameState = {
  camera: { projection: number[]; worldInverse: number[]; position: Translation3d };
  frameSize: [number, number];
  lighting: LightingState;
  raycast: RaycastResult;
  anchors: AnchorResult;
};

export type LightingState = {
  grain: number;
  intensity: number;
  temperature: number;
};

export type RaycastResult = { isValid: false } | { isValid: true; position: Translation3d; anchorId: string };

export type AnchorResult = { [key: string]: Translation3d };
