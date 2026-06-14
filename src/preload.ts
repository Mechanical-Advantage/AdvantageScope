// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { contextBridge, ipcRenderer, webUtils } from "electron";

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
