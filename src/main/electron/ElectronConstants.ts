// Copyright (c) 2021-2025 Littleton Robotics
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
export const AUTO_ASSETS = path.join(app.getPath("userData"), "autoAssets");
export const DEFAULT_USER_ASSETS = path.join(app.getPath("userData"), "userAssets");
export const AKIT_PATH_OUTPUT = path.join(app.getPath("temp"), "akit-log-path.txt");
export const AKIT_PATH_INPUT = path.join(app.getPath("temp"), "ascope-log-path.txt");
export const AKIT_PATH_INPUT_PERIOD = 250;
export const VIDEO_CACHE = path.join(app.getPath("temp"), "advantagescope-video-cache");
export const VIDEO_CACHE_FALLBACK = path.join(app.getPath("userData"), "video-cache");
export const FRC_LOG_FOLDER = "C:\\Users\\Public\\Documents\\FRC\\Log Files";
export const WINDOW_ICON = process.platform === "darwin" ? undefined : path.join(__dirname, "../icons/window-icon.png");
export const HUB_DEFAULT_WIDTH = 1100;
export const HUB_DEFAULT_HEIGHT = 650;
export const SATELLITE_DEFAULT_WIDTH = 900;
export const SATELLITE_DEFAULT_HEIGHT = 500;

// XR Server
export const XR_NATIVE_HOST_COMPATIBILITY = 0;
export const XR_URL_PREFIX =
  "https://appclip.apple.com/id?p=org.littletonrobotics.advantagescopexr.Clip&c=" +
  XR_NATIVE_HOST_COMPATIBILITY +
  "&a=";
export const XR_SERVER_PORT = 56328;

// Live RLOG
export const RLOG_CONNECT_TIMEOUT_MS = 3000; // How long to wait when connecting
export const RLOG_DATA_TIMEOUT_MS = 3000; // How long with no data until timeout
export const RLOG_HEARTBEAT_DELAY_MS = 500; // How long to wait between heartbeats
export const RLOG_HEARTBEAT_DATA = new Uint8Array([6, 3, 2, 8]);

// Live PathPlanner
export const PATHPLANNER_PORT = 5811;
export const PATHPLANNER_CONNECT_TIMEOUT_MS = 3000; // How long to wait when connecting
export const PATHPLANNER_DATA_TIMEOUT_MS = 3000; // How long with no data until timeout
export const PATHPLANNER_PING_DELAY_MS = 250; // How long to wait between pings
export const PATHPLANNER_PING_TEXT = "ping";

// Download
export const DOWNLOAD_TIMEOUT_MS = 2000; // Timeout for FTP operations
export const DOWNLOAD_RETRY_DELAY_MS = 2000; // How long to wait between connection attempts
export const DOWNLOAD_REFRESH_INTERVAL_MS = 3000; // How often to refresh file list when connected
