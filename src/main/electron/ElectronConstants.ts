// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { app } from "electron";
import path from "path";

// General
export const APP_VERSION = app.isPackaged ? app.getVersion() : "dev";
export const PREFS_FILENAME = path.join(app.getPath("userData"), "prefs.json");
export const STATE_FILENAME = path.join(
  app.getPath("userData"),
  "state-" + (app.isPackaged ? app.getVersion().replaceAll(".", "_") : "dev") + ".json"
);
export const TYPE_MEMORY_FILENAME = path.join(app.getPath("userData"), "type-memory.json");
export const RECENT_UNITS_FILENAME = path.join(app.getPath("userData"), "recent-units.json");
export const BUNDLED_ASSETS = path.join(__dirname, "..", "bundledAssets");
export const DEFAULT_USER_ASSETS = path.join(app.getPath("userData"), "userAssets");
export const AKIT_PATH_OUTPUT = path.join(app.getPath("temp"), "akit-log-path.txt");
export const AKIT_PATH_INPUT = path.join(app.getPath("temp"), "ascope-log-path.txt");
export const AKIT_PATH_INPUT_PERIOD = 250;
export const VIDEO_CACHE = path.join(app.getPath("temp"), "mur-voir-video-cache");
export const VIDEO_CACHE_FALLBACK = path.join(app.getPath("userData"), "video-cache");
export const WINDOW_ICON = process.platform === "darwin" ? undefined : path.join(__dirname, "../icons/window-icon.png");
export const HUB_DEFAULT_WIDTH = 1100;
export const HUB_DEFAULT_HEIGHT = 650;
export const SATELLITE_DEFAULT_WIDTH = 900;
export const SATELLITE_DEFAULT_HEIGHT = 500;
