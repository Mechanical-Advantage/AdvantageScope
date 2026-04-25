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
let isRafPending = false;
let latestRenderState: XRRenderState | null = null;
let serverTimeOffset: number | null = null;
let lastAssetsJson = "";

window.addEventListener("load", () => {
  renderer = new XRRenderer();
});

// @ts-expect-error
window.setCommand = (commandRaw: string, isQueued: boolean) => {
  const commandBuffer = Uint8Array.from(atob(commandRaw), (c) => c.charCodeAt(0));
  const packet = msgpackDecoder.decode(commandBuffer) as XRPacket;
  switch (packet.type) {
    case "settings":
      settings = packet.value;
      break;
    case "command": {
      if (!isQueued && serverTimeOffset === null) {
        serverTimeOffset = packet.time - Date.now();
      }
      const isBuffered = settings === null || settings.streaming === XRStreamingMode.Smooth;
      const timeout = packet.time + (isBuffered ? bufferLengthMs : 0) - Date.now() + (serverTimeOffset ?? 0);
      if (timeout <= 0 || !isBuffered) {
        command = packet.value;
      } else {
        setTimeout(() => {
          if (settings === null || settings.streaming === XRStreamingMode.Smooth) {
            command = packet.value;
          }
        }, timeout);
      }
      break;
    }
    case "assets": {
      const json = JSON.stringify(packet.value);
      if (json !== lastAssetsJson) {
        lastAssetsJson = json;
        assets = packet.value;
      }
      break;
    }
  }
};

// @ts-expect-error
window.render = (renderState: XRRenderState) => {
  latestRenderState = renderState;
  if (!isRafPending) {
    isRafPending = true;
    window.requestAnimationFrame(() => {
      isRafPending = false;
      const state = latestRenderState;
      if (settings !== null && command !== null && state !== null) {
        renderer.render(state, settings, command, assets);
      }
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
  const message: NamedMessage = { name, data };
  try {
    // @ts-expect-error
    window.webkit.messageHandlers.asxr.postMessage(message);
  } catch (error) {
    console.error(error);
  }
}
