// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { BrowserWindow, dialog, MessageChannelMain, MessagePortMain } from "electron";
import path from "path";
import NamedMessage from "../../shared/NamedMessage";
import { WINDOW_ICON } from "./ElectronConstants";
import { XRServer } from "./XRServer";

export namespace XRControls {
  let sourceUUID: string | null = null;
  let sourceUUIDCallbacks: ((uuid: string | null) => void)[] = [];
  let window: BrowserWindow | null = null;
  let windowPort: MessagePortMain | null = null;
  let qrTextInterval: NodeJS.Timeout | null = null;
  let hasConfirmedClose = false;

  function setSourceUUID(newSourceUUID: string | null) {
    if (sourceUUID === null && newSourceUUID !== null) {
      XRServer.start();
    } else if (sourceUUID !== null && newSourceUUID === null) {
      XRServer.stop();
    }
    sourceUUID = newSourceUUID;
    sourceUUIDCallbacks.forEach((callback) => callback(sourceUUID));
  }

  export function addSourceUUIDCallback(callback: (uuid: string | null) => void) {
    sourceUUIDCallbacks.push(callback);
  }

  function sendQRText() {
    if (windowPort !== null) {
      let message: NamedMessage = {
        name: "qr-text",
        data: XRServer.getQRText()
      };
      windowPort.postMessage(message);
    }
  }

  export function open(newSourceUUID: string, parentWindow: BrowserWindow) {
    setSourceUUID(newSourceUUID);

    if (window !== null && !window.isDestroyed()) {
      window.focus();
      return;
    }

    const width = 700;
    const height = process.platform === "win32" ? 365 : 325;
    window = new BrowserWindow({
      width: width,
      height: height,
      x: Math.floor(parentWindow.getBounds().x + parentWindow.getBounds().width / 2 - width / 2),
      y: Math.floor(parentWindow.getBounds().y + parentWindow.getBounds().height / 2 - height / 2),
      resizable: false,
      useContentSize: true,
      icon: WINDOW_ICON,
      show: false,
      fullscreenable: false,
      webPreferences: {
        preload: path.join(__dirname, "preload.js")
      }
    });

    // Message handling
    window.webContents.on("dom-ready", () => {
      // Create ports on reload
      if (window === null) return;
      const { port1, port2 } = new MessageChannelMain();
      window.webContents.postMessage("port", null, [port1]);
      windowPort = port2;
      port2.on("message", (event) => {
        let message = event.data as NamedMessage;
        switch (message.name) {
          case "xr-settings":
            XRServer.setXRSettings(message.data);
            break;
        }
      });
      port2.start();
      sendQRText();
    });

    // Start periodic QR code send
    if (qrTextInterval !== null) clearInterval(qrTextInterval);
    qrTextInterval = setInterval(sendQRText, 1000);

    // Finish setup
    window.setMenu(null);
    window.once("ready-to-show", window.show);
    hasConfirmedClose = false;
    window.on("close", (event) => {
      if (window === null || hasConfirmedClose) return;
      event.preventDefault();
      let response = dialog.showMessageBoxSync(window, {
        type: "question",
        title: "Alert",
        message: "Stop XR Server?",
        detail: "Closing this window will stop the XR server and disconnect all devices.",
        buttons: ["Don't Close", "Close"],
        defaultId: 1,
        icon: WINDOW_ICON
      });
      if (response === 1) {
        close();
      }
    });
    window.loadFile(path.join(__dirname, "../www/xrControls.html"));
  }

  export function close() {
    hasConfirmedClose = true;
    window?.close();
    setSourceUUID(null);
    if (qrTextInterval !== null) clearInterval(qrTextInterval);
  }
}
