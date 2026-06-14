// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { Decoder } from "@msgpack/msgpack";
import { AdvantageScopeAssets } from "../shared/AdvantageScopeAssets";
import NamedMessage from "../shared/NamedMessage";
import { XRPacket, XRFrameState as XRRenderState, XRSettings, XRStreamingMode } from "../shared/XRTypes";
import { Field3dRendererCommand } from "../shared/renderers/Field3dRenderer";
import XRRenderer from "./XRRenderer";

const bufferLengthMs = 250;
const msgpackDecoder = new Decoder();

let renderer: XRRenderer;
let settings: XRSettings | null = null;
let command: Field3dRendererCommand | null = null;
let assets: AdvantageScopeAssets | null = null;
let isRendering = false;
let serverTimeOffset: number | null = null;

window.addEventListener("load", () => {
  renderer = new XRRenderer();
});

// @ts-expect-error
window.setCommand = (commandRaw: string, isQueued: boolean) => {
  let commandBuffer = Uint8Array.from(atob(commandRaw), (c) => c.charCodeAt(0));
  let packet = msgpackDecoder.decode(commandBuffer) as XRPacket;
  switch (packet.type) {
    case "settings":
      settings = packet.value;
      break;
    case "command":
      if (!isQueued && serverTimeOffset === null) {
        serverTimeOffset = packet.time - new Date().getTime();
      }
      const isBuffered = settings === null || settings.streaming === XRStreamingMode.Smooth;
      const timeout = packet.time + (isBuffered ? bufferLengthMs : 0) - new Date().getTime() + (serverTimeOffset ?? 0);
      if (timeout < 0 || !isBuffered) {
        command = packet.value;
      } else {
        setTimeout(() => {
          const isBuffered = settings === null || settings.streaming === XRStreamingMode.Smooth;
          if (isBuffered) {
            command = packet.value;
          }
        }, timeout);
      }
      break;
    case "assets":
      assets = packet.value;
      break;
  }
};

// @ts-expect-error
window.render = (renderState: XRRenderState) => {
  if (!isRendering) {
    isRendering = true;
    window.requestAnimationFrame(() => {
      if (settings !== null && command !== null) {
        renderer.render(renderState, settings, command, assets);
      }
      isRendering = false;
    });
  }
};

// @ts-expect-error
window.requestCalibration = () => {
  renderer.resetCalibration();
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
