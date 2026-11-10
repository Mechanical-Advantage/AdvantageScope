// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { app, BrowserWindow, dialog, nativeTheme, shell } from "electron";

/**
 * Headless mode for agents and scripts (tools/screenshot.mjs). With MURVOIR_HEADLESS=1 the app never
 * shows a window, a dialog or a browser tab, stays out of the Dock and app switcher, and never takes
 * focus. Windows still render, so screenshots work. Suppressed dialogs print to stdout.
 *
 * MURVOIR_USER_DATA moves prefs and saved window state to a separate folder, so a headless run cannot
 * overwrite the state of the copy you use.
 *
 * ElectronConstants imports this module, so it runs before any userData path is read.
 * The patches below cover every call site, so new code needs no headless checks of its own.
 */
export const HEADLESS = process.env.MURVOIR_HEADLESS === "1";

if (HEADLESS) {
  const userData = process.env.MURVOIR_USER_DATA;
  if (userData) app.setPath("userData", userData);
  if (process.platform === "darwin") app.setActivationPolicy("accessory");

  const log = (what: string, detail?: unknown) => console.log(`[headless] suppressed ${what}`, detail ?? "");
  const noop = () => {};
  const proto = BrowserWindow.prototype as any;
  for (const method of ["show", "showInactive", "focus", "moveTop"]) proto[method] = noop;
  app.focus = noop;
  app.on("web-contents-created", (_, contents) => {
    // Dev builds dock DevTools into the hub, which would shrink the page in every screenshot.
    contents.openDevTools = noop;
    contents.setBackgroundThrottling(false);
  });
  app.on("browser-window-created", (_, window) => {
    // macOS vibrancy shows the desktop through the sidebar, and a hidden window has no desktop behind
    // it, so the sidebar would capture as transparent. Use a solid colour close to the blurred sidebar.
    if (process.platform !== "darwin") return;
    window.setVibrancy(null);
    window.setBackgroundColor(nativeTheme.shouldUseDarkColors ? "#2a2a2a" : "#e8e8e8");
  });

  // Answer with the cancel button when there is one, otherwise the first button.
  const pick = (options: any) => options?.cancelId ?? 0;
  const optionsOf = (args: any[]) => (args[0] instanceof BrowserWindow ? args[1] : args[0]);
  dialog.showMessageBox = (async (...args: any[]) => {
    const options = optionsOf(args);
    log("message box", { message: options?.message, detail: options?.detail, buttons: options?.buttons });
    return { response: pick(options), checkboxChecked: false };
  }) as any;
  dialog.showMessageBoxSync = ((...args: any[]) => {
    const options = optionsOf(args);
    log("message box", { message: options?.message, detail: options?.detail, buttons: options?.buttons });
    return pick(options);
  }) as any;
  dialog.showErrorBox = (title, content) => log("error box", { title, content });
  dialog.showOpenDialog = (async () => (log("open dialog"), { canceled: true, filePaths: [] })) as any;
  dialog.showOpenDialogSync = (() => (log("open dialog"), undefined)) as any;
  dialog.showSaveDialog = (async () => (log("save dialog"), { canceled: true, filePath: "" })) as any;
  dialog.showSaveDialogSync = (() => (log("save dialog"), "")) as any;
  shell.openExternal = async (url) => log("openExternal", url);
  shell.openPath = async (path) => (log("openPath", path), "");
}
