import QRCodeStyling from "qr-code-styling";
import NamedMessage from "./shared/NamedMessage";
import { XRSettings } from "./shared/XRSettings";

const QR_CONTAINER = document.getElementsByClassName("qr-container")[0] as HTMLElement;
const QR_DIV = document.getElementsByClassName("qr")[0] as HTMLElement;
const CONTROLS_DIV = document.getElementsByClassName("controls")[0] as HTMLElement;
const CALIBRATION_MODE = document.getElementsByName("calibration-mode")[0] as HTMLSelectElement;
const SHOW_CARPET = document.getElementsByName("show-carpet")[0] as HTMLInputElement;
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
      errorCorrectionLevel: "L"
    },
    dotsOptions: {
      type: "extra-rounded",
      color: isDark ? "#6484e5" : "#012be5"
    },
    cornersSquareOptions: {
      type: "extra-rounded"
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
    showCarpet: SHOW_CARPET.checked,
    showField: SHOW_FIELD.checked,
    showRobots: SHOW_ROBOTS.checked
  };
  sendMainMessage("xr-settings", settings);
}
[CALIBRATION_MODE, SHOW_CARPET, SHOW_FIELD, SHOW_ROBOTS].forEach((input) =>
  input.addEventListener("change", sendSettings)
);

// Update layout periodically
let periodic = () => {
  let width = window.innerWidth - QR_CONTAINER.clientWidth;
  CONTROLS_DIV.style.width = width.toString() + "px";
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (isDark !== lastIsDark && lastQRText.length > 0) {
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
  if (event.source === window && event.data === "port") {
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
        makeQRcode(newQRText);
        lastQRText = newQRText;
      }
      break;
  }
}
