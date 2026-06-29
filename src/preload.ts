// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { contextBridge, ipcRenderer, webUtils } from "electron";
import { setupI18n, translateHTML } from "./i18n/i18n";

// Set up locale
const t = setupI18n(navigator.language);
contextBridge.exposeInMainWorld("t", t);
contextBridge.exposeInMainWorld("lang", navigator.language);
window.addEventListener("DOMContentLoaded", () => {
  translateHTML(document, t);
});

// Set up RTL layout
let isRtl = false;
try {
  const locale = new Intl.Locale(navigator.language) as any;
  const direction = locale.textInfo
    ? locale.textInfo.direction
    : locale.getTextInfo
    ? locale.getTextInfo().direction
    : undefined;
  if (direction === "rtl") {
    isRtl = true;
  }
} catch (e) {
  // Ignore
}
if (isRtl) {
  window.addEventListener("DOMContentLoaded", () => {
    document.documentElement.dir = "rtl";
  });
}

const windowLoaded = new Promise((resolve) => {
  window.onload = resolve;
});

ipcRenderer.on("port", async (event) => {
  await windowLoaded;
  window.postMessage("port", "*", event.ports);
});

contextBridge.exposeInMainWorld("electron", {
  getFilePath(file: File): string {
    return webUtils.getPathForFile(file);
  }
});
