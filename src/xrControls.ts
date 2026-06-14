// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import QRCodeStyling from "qr-code-styling";
import NamedMessage from "./shared/NamedMessage";
import { XRSettings } from "./shared/XRTypes";

const QR_CONTAINER = document.getElementsByClassName("qr-container")[0] as HTMLElement;
const QR_DIV = document.getElementsByClassName("qr")[0] as HTMLElement;
const CONTROLS_DIV = document.getElementsByClassName("controls")[0] as HTMLElement;
const CALIBRATION_MODE = document.getElementsByName("calibration-mode")[0] as HTMLSelectElement;
const STREAMING_MDOE = document.getElementsByName("streaming-mode")[0] as HTMLSelectElement;
const SHOW_FLOOR = document.getElementsByName("show-floor")[0] as HTMLInputElement;
const SHOW_FIELD = document.getElementsByName("show-field")[0] as HTMLInputElement;
const SHOW_ROBOTS = document.getElementsByName("show-robots")[0] as HTMLInputElement;

let messagePort: MessagePort | null = null;
let lastQRText = "";
let lastIsDark: boolean | null = null;

// Render QR code
function makeQRcode(text: string) {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  let qrCode = new QRCodeStyling({
    width: QR_CONTAINER.clientWidth,
    height: QR_CONTAINER.clientHeight,
    margin: 10,
    type: "svg",
    data: text,
    qrOptions: {
      errorCorrectionLevel: "M"
    },
    dotsOptions: {
      type: "rounded",
      color: isDark ? "#879de0" : "#2040a0"
    },
    cornersSquareOptions: {
      type: "dot"
    },
    cornersDotOptions: {
      type: "dot"
    },
    backgroundOptions: {
      color: "transparent"
    }
  });
  while (QR_DIV.firstChild) {
    QR_DIV.removeChild(QR_DIV.firstChild);
  }
  qrCode.append(QR_DIV);
}

// Send setting updates
function sendSettings() {
  let settings: XRSettings = {
    calibration: Number(CALIBRATION_MODE.value),
    streaming: Number(STREAMING_MDOE.value),
    showCarpet: SHOW_FLOOR.checked,
    showField: SHOW_FIELD.checked,
    showRobots: SHOW_ROBOTS.checked
  };
  sendMainMessage("xr-settings", settings);
}
[CALIBRATION_MODE, STREAMING_MDOE, SHOW_FLOOR, SHOW_FIELD, SHOW_ROBOTS].forEach((input) =>
  input.addEventListener("change", sendSettings)
);

// Update layout periodically
let periodic = () => {
  let width = window.innerWidth - QR_CONTAINER.clientWidth;
  CONTROLS_DIV.style.width = width.toString() + "px";
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (isDark !== lastIsDark && lastQRText.length > 0) {
    lastIsDark = isDark;
    makeQRcode(lastQRText);
  }
  window.requestAnimationFrame(periodic);
};
window.requestAnimationFrame(periodic);

// Message handling
function sendMainMessage(name: string, data?: any) {
  if (messagePort !== null) {
    let message: NamedMessage = { name: name, data: data };
    messagePort.postMessage(message);
  }
}

window.addEventListener("message", (event) => {
  if (event.data === "port") {
    messagePort = event.ports[0];
    messagePort.onmessage = (event) => {
      let message: NamedMessage = event.data;
      handleMainMessage(message);
    };
    sendSettings();
  }
});

function handleMainMessage(message: NamedMessage) {
  switch (message.name) {
    case "qr-text":
      let newQRText: string = message.data;
      if (newQRText !== lastQRText) {
        lastQRText = newQRText;
        makeQRcode(newQRText);
      }
      break;
  }
}
