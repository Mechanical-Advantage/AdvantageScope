import { Decoder } from "@msgpack/msgpack";
import { AdvantageScopeAssets } from "../shared/AdvantageScopeAssets";
import NamedMessage from "../shared/NamedMessage";
import { XRSettings } from "../shared/XRSettings";
import { ThreeDimensionRendererCommand } from "../shared/renderers/ThreeDimensionRenderer";
import XRRenderer from "./XRRenderer";
import { XRCameraState } from "./XRTypes";

const msgpackDecoder = new Decoder();

let renderer: XRRenderer;
let settings: XRSettings | null = null;
let command: ThreeDimensionRendererCommand | null = null;
let assets: AdvantageScopeAssets | null = null;

window.addEventListener("load", () => {
  renderer = new XRRenderer();
});

// @ts-expect-error
window.setCommand = (commandRaw: string) => {
  let commandBuffer = Uint8Array.from(atob(commandRaw), (c) => c.charCodeAt(0));
  let fullCommand = msgpackDecoder.decode(commandBuffer) as {
    settings: XRSettings;
    command: ThreeDimensionRendererCommand;
    assets: AdvantageScopeAssets;
  };
  settings = fullCommand.settings;
  command = fullCommand.command;
  assets = fullCommand.assets;
};

// @ts-expect-error
window.render = (cameraState: XRCameraState) => {
  if (settings !== null && command !== null) {
    renderer.render(cameraState, settings, command, assets);
  }
};

// @ts-expect-error
window.requestCalibration = () => {
  renderer.resetAnchors();
};

// @ts-expect-error
window.userTap = () => {
  renderer.userTap();
};

export function sendHostMessage(name: string, data?: any) {
  let message: NamedMessage = { name: name, data: data };
  try {
    // @ts-expect-error
    window.webkit.messageHandlers.asxr.postMessage(message);
  } catch (error) {
    console.error(error);
  }
}
