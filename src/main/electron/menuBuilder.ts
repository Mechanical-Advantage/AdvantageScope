// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { BrowserWindow, MenuItemConstructorOptions } from "electron";

/**
 * Builds the edit menu item based on language mode.
 */
export function buildEditMenu(isEnglish: boolean): MenuItemConstructorOptions {
  if (isEnglish) {
    return { role: "editMenu" };
  }
  return {
    label: t("menu.edit.heading"),
    submenu: [
      { label: t("menu.edit.undo"), role: "undo" },
      { label: t("menu.edit.redo"), role: "redo" },
      { type: "separator" },
      { label: t("menu.edit.cut"), role: "cut" },
      { label: t("menu.edit.copy"), role: "copy" },
      { label: t("menu.edit.paste"), role: "paste" },
      { label: t("menu.edit.selectAll"), role: "selectAll" }
    ]
  };
}

/**
 * Builds the view menu item based on  language mode.
 */
export function buildViewMenu(
  isEnglish: boolean,
  customItems: MenuItemConstructorOptions[]
): MenuItemConstructorOptions {
  return {
    role: "viewMenu",
    label: isEnglish ? undefined : t("menu.titles.view"),
    submenu: [
      isEnglish ? { role: "reload" } : { label: t("menu.view.reload"), role: "reload" },
      isEnglish ? { role: "toggleDevTools" } : { label: t("menu.view.toggleDevTools"), role: "toggleDevTools" },
      { type: "separator" },
      isEnglish ? { role: "resetZoom" } : { label: t("menu.view.resetZoom"), role: "resetZoom" },
      isEnglish ? { role: "zoomIn" } : { label: t("menu.view.zoomIn"), role: "zoomIn" },
      isEnglish ? { role: "zoomOut" } : { label: t("menu.view.zoomOut"), role: "zoomOut" },
      { type: "separator" },
      ...customItems,
      { label: t("menu.view.toggleFullscreen"), role: "togglefullscreen" }
    ]
  };
}

/**
 * Builds the window menu item based on platform and language mode.
 */
export function buildWindowMenu(
  isMac: boolean,
  isEnglish: boolean,
  bringFrontHandler: (window: BrowserWindow | undefined) => void
): MenuItemConstructorOptions {
  if (isMac) {
    if (isEnglish) {
      return { role: "windowMenu" };
    }
    return {
      label: t("menu.window.heading"),
      submenu: [
        { label: t("menu.window.minimize"), role: "minimize" },
        { label: t("menu.window.zoom"), role: "zoom" },
        { type: "separator" },
        {
          label: t("menu.window.bringFront"),
          click(_, window) {
            bringFrontHandler(window as BrowserWindow | undefined);
          }
        },
        { type: "separator" }
      ]
    };
  }

  // Windows / Linux
  return {
    label: t("menu.window.heading"),
    submenu: [
      { label: t("menu.window.minimize"), role: "minimize" },
      {
        label: t("menu.window.bringFront"),
        accelerator: "Ctrl+B",
        click(_, window) {
          bringFrontHandler(window as BrowserWindow | undefined);
        }
      },
      { type: "separator" }
    ]
  };
}

/**
 * Returns macOS app menu system items (Services, Hide, Quit) based on language mode.
 */
export function buildAppMenuSystemItems(isMac: boolean, isEnglish: boolean): MenuItemConstructorOptions[] {
  if (!isMac) return [];

  if (isEnglish) {
    return [
      { type: "separator" },
      { role: "services" },
      { type: "separator" },
      { role: "hide" },
      { role: "hideOthers" },
      { role: "unhide" },
      { type: "separator" },
      { role: "quit" }
    ];
  }

  return [
    { type: "separator" },
    { label: t("menu.app.services"), role: "services" },
    { type: "separator" },
    { label: t("menu.app.hide"), role: "hide" },
    { label: t("menu.app.hideOthers"), role: "hideOthers" },
    { label: t("menu.app.unhide"), role: "unhide" },
    { type: "separator" },
    { label: t("menu.app.quit"), role: "quit" }
  ];
}
