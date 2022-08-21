import { app } from "electron";
import path from "path";
import Preferences from "../lib/Preferences";

export const REPOSITORY = "Mechanical-Advantage/AdvantageScope";
export const PREFS_FILENAME = path.join(app.getPath("userData"), "prefs.json");
export const STATE_FILENAME = path.join(
  app.getPath("userData"),
  "state-" + app.getVersion().replaceAll(".", "_") + ".json"
);
export const LAST_OPEN_FILE = path.join(app.getPath("temp"), "akit-log-path.txt");
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
  port: 5800,
  address: "10.63.28.2",
  rioPath: "/media/sda1/",
  theme: process.platform == "linux" ? "light" : "system"
};
