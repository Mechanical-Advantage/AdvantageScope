import { app } from "electron";
import path from "path";
import Preferences from "../shared/Preferences";

// General
export const REPOSITORY = "Mechanical-Advantage/AdvantageScope";
export const PREFS_FILENAME = path.join(app.getPath("userData"), "prefs.json");
export const STATE_FILENAME = path.join(
  app.getPath("userData"),
  "state-" + app.getVersion().replaceAll(".", "_") + ".json"
);
export const EXTRA_FRC_DATA = path.join(app.getPath("userData"), "frcData");
export const LAST_OPEN_FILE = path.join(app.getPath("temp"), "akit-log-path.txt");
export const VIDEO_CACHE = path.join(app.getPath("temp"), "advantagescope-videos");
export const WINDOW_ICON: string | undefined = (() => {
  switch (process.platform) {
    case "win32": // Square icon
      return path.join(__dirname, "../icons/window/window-icon-win.png");
    case "linux": // Rounded icon
      return path.join(__dirname, "../icons/window/window-icon-linux.png");
    default: // macOS uses the app icon by default
      return undefined;
  }
})();
export const DEFAULT_PREFS: Preferences = {
  theme: process.platform == "linux" ? "light" : "system",
  rioAddress: "10.63.28.2",
  rioPath: "/media/sda1/",
  liveMode: "nt4",
  rlogPort: 5800,
  threeDimensionMode: "quality",
  keys: []
};

// Live RLOG
export const RLOG_CONNECT_TIMEOUT_MS = 3000; // How long to wait when connecting
export const RLOG_DATA_TIMEOUT_MS = 3000; // How long with no data until timeout
export const RLOG_HEARTBEAT_DELAY_MS = 500; // How long to wait between heartbeats
export const RLOG_HEARTBEAT_DATA = new Uint8Array([6, 3, 2, 8]);

// Download
export const DOWNLOAD_USERNAME = "lvuser";
export const DOWNLOAD_PASSWORD = "";
export const DOWNLOAD_CONNECT_TIMEOUT_MS = 3000; // How long to wait when connecting
export const DOWNLOAD_RETRY_DELAY_MS = 1000; // How long to wait between connection attempts
export const DOWNLOAD_REFRESH_INTERVAL_MS = 5000; // How often to refresh file list when connected
