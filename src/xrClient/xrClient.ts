// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { Decoder } from "@msgpack/msgpack";
import { AdvantageScopeAssets } from "../shared/AdvantageScopeAssets";
import NamedMessage from "../shared/NamedMessage";
import { Field3dRendererCommand } from "../shared/renderers/Field3dRenderer";
import { XRPacket, XRFrameState as XRRenderState, XRSettings, XRStreamingMode } from "../shared/XRTypes";
import XRRenderer from "./XRRenderer";

const bufferLengthMs = 250;
const msgpackDecoder = new Decoder();

let renderer: XRRenderer;
let settings: XRSettings | null = null;
let command: Field3dRendererCommand | null = null;
let assets: AdvantageScopeAssets | null = null;
let isRendering = false;
let serverTimeOffset: number | null = null;
let socket: WebSocket | null = null;
let webxrEnabled = false;

// can't access ElectronConstants from web
const XR_NATIVE_HOST_COMPATIBILITY = 0;
const XR_URL_PREFIX =
  "https://appclip.apple.com/id?p=org.littletonrobotics.advantagescopexr.Clip&c=" +
  XR_NATIVE_HOST_COMPATIBILITY +
  "&a=";
const HTTPS_XR_SERVER_PORT = 56329;

//  TODO Jonah: Update with published ID/URL of Android app. Also change in docs
const ANDROID_APP_ID = "org.advantagescope.advantagescopexr";
const PLAY_STORE_LINK = "https://play.google.com/store/apps/details?id=" + ANDROID_APP_ID;

const PING_TIMEOUT_MS = 2000;

window.addEventListener("load", () => {
  let iosApp = true;
  try {
    // @ts-expect-error
    window.webkit.messageHandlers.asxr;
  } catch (e) {
    iosApp = false;
  }
  if (iosApp) {
    // iOS app or app clip
    webxrEnabled = false;
    renderer = new XRRenderer(false);
  } else if (!window.isSecureContext || navigator.xr === undefined) {
    // don't load renderer; show navigation menu
    webxrEnabled = false;
    document.getElementById("container")!!.hidden = true;
    document.getElementById("spinner-cubes-container")!!.hidden = true;
    document.getElementById("app-selection")!!.hidden = false;

    const selfSignedUri = "https://" + location.hostname + ":" + HTTPS_XR_SERVER_PORT;
    document.getElementById("app-button-selfsigned")!!.setAttribute("href", selfSignedUri);
    // https://developer.chrome.com/docs/android/intents
    const androidIntentUri =
      "intent://proxy/?url=" +
      location.hostname +
      "#Intent;scheme=advantagescope;package=" +
      ANDROID_APP_ID +
      ";S.browser_fallback_url=" +
      encodeURI(PLAY_STORE_LINK) +
      ";end";
    document.getElementById("app-button-android")!!.setAttribute("href", androidIntentUri);
    const iosAppClipUri = XR_URL_PREFIX + location.hostname;
    document.getElementById("app-button-ios")!!.setAttribute("href", iosAppClipUri);
    // https://developers.meta.com/horizon/documentation/web/web-launch/
    const oculusUri = "https://oculus.com/open_url/?url=" + encodeURI(selfSignedUri);
    document.getElementById("app-button-oculus")!!.setAttribute("href", oculusUri);
  } else {
    webxrEnabled = true;
    renderer = new XRRenderer(true);
    renderer.renderer.setAnimationLoop(renderWebXR);
    let url = window.location.href.replace("http://", "ws://").replace("https://", "wss://").concat("ws");
    startSocket(url);

    document.getElementById("spinner-cubes-container")!!.hidden = true;
    document.getElementById("container")!!.hidden = true;

    // Make custom button instead of using the three.js one so it can be styled
    let xrButton = document.getElementById("start-xr") as HTMLButtonElement;
    const sessionConfig = {
      optionalFeatures: [
        "local-floor",
        "bounded-floor",
        "layers",
        "hit-test",
        "light-estimation",
        "hand-tracking",
        "anchors"
      ]
    };
    let onSessionStart = (session: XRSession): void => {
      session.addEventListener("end", () => {
        document.location.reload();
      });
      renderer.renderer.xr.setSession(session);
    };

    xrButton.hidden = false;
    navigator.xr?.isSessionSupported("immersive-ar").then((ar) => {
      xrButton.onclick = () => {
        // Some devices support WebXR but not AR passthrough, such as Apple Vision Pro
        navigator.xr?.requestSession(ar ? "immersive-ar" : "immersive-vr", sessionConfig).then(onSessionStart);
      };
      if ("offerSession" in navigator.xr!!) {
        // Another API not in the types that three.js just uses without explanation
        // Adds a nice fancy button to the URL bar on Quest
        // @ts-expect-error
        navigator.xr
          .offerSession(ar ? "immersive-ar" : "immersive-vr", sessionConfig)
          .then(onSessionStart)
          .catch((error: any) => {
            console.warn(error);
          });
      }
    });
  }
});

// Typescript timeouts are extremely annoying to type
// https://stackoverflow.com/questions/45802988/typescript-use-correct-version-of-settimeout-node-vs-window
let timeoutId: ReturnType<typeof setTimeout> | null = null;

// The desktop app sends command data every 500ms
// So if it hasn't sent any data for 2 seconds, reconnect
function startSocket(url: string) {
  function resetTimeout() {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      startSocket(url);
    }, PING_TIMEOUT_MS);
  }
  socket = new WebSocket(url);
  resetTimeout();
  socket.onmessage = async (event) => {
    if (event.data instanceof Blob) {
      let packet = msgpackDecoder.decode(await event.data.arrayBuffer()) as XRPacket;
      setCommand(packet, false);
    }
    resetTimeout();
  };
}

// @ts-expect-error
window.setCommand = (commandRaw: string, isQueued: boolean) => {
  let commandBuffer = Uint8Array.from(atob(commandRaw), (c) => c.charCodeAt(0));
  let packet = msgpackDecoder.decode(commandBuffer) as XRPacket;
  setCommand(packet, isQueued);
};

function setCommand(packet: XRPacket, isQueued: boolean) {
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
}

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
  if (webxrEnabled) {
    return;
  }
  let message: NamedMessage = { name: name, data: data };
  try {
    // @ts-expect-error
    window.webkit.messageHandlers.asxr.postMessage(message);
  } catch (error) {
    console.error(error);
  }
}

function renderWebXR(_: DOMHighResTimeStamp, frame?: XRFrame | undefined) {
  if (settings !== null && command !== null && frame !== undefined) {
    renderer.render(renderer.webXrStateToXRFrameState(frame), settings, command, assets);
  }
}
