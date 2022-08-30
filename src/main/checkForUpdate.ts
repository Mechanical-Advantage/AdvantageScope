import { app, dialog, shell } from "electron";
import fetch from "electron-fetch";
import { REPOSITORY, WINDOW_ICON } from "./constants";

/** Checks for updates from GitHub and notifies the user if necessary. */
export default function checkForUpdate(alwaysNotify: boolean) {
  if (!app.isPackaged) {
    if (alwaysNotify) {
      dialog.showMessageBox({
        type: "info",
        title: "Update Checker",
        message: "Cannot check for updates",
        detail: "This app is running in a development environment.",
        icon: WINDOW_ICON
      });
    }
    return;
  }

  fetch("https://api.github.com/repos/" + REPOSITORY + "/releases", {
    method: "GET",
    headers: {
      pragma: "no-cache",
      "cache-control": "no-cache"
    }
  })
    .then((res) => res.json())
    .then((releaseData) => {
      let currentVersion = app.getVersion();
      let latestVersionInfo: any;
      if (currentVersion.includes("beta") || currentVersion.includes("alpha")) {
        latestVersionInfo = releaseData[0];
      } else {
        latestVersionInfo = releaseData.find((release: any) => !release["prerelease"]);
      }
      let latestVersion = latestVersionInfo["tag_name"].slice(1);
      let latestDate = new Date(latestVersionInfo["published_at"]);
      let latestDateText = latestDate.toLocaleDateString();
      let translated = process.arch != "arm64" && app.runningUnderARM64Translation;
      let options =
        process.platform == "darwin"
          ? ["Download", "Later", "View Changelog"]
          : ["Download", "View Changelog", "Later"];
      let cancelId = process.platform == "darwin" ? 1 : 2;

      let handleResponse = (result: Electron.MessageBoxReturnValue) => {
        let response = options[result.response];
        if (response == "Download") {
          let platformKey = "";
          switch (process.platform) {
            case "win32":
              platformKey = "win";
              break;
            case "linux":
              platformKey = "linux";
              break;
            case "darwin":
              platformKey = "mac";
              break;
          }
          let arch = translated ? "arm64" : process.arch; // If under translation, switch to ARM

          let url = null;
          latestVersionInfo["assets"].forEach((asset: any) => {
            if (asset.name.includes(platformKey) && asset.name.includes(arch)) {
              url = asset.browser_download_url;
            }
          });
          if (url == null) {
            shell.openExternal("https://github.com/" + REPOSITORY + "/releases/latest");
          } else {
            shell.openExternal(url);
          }
        } else if (response == "View Changelog") {
          shell.openExternal("https://github.com/" + REPOSITORY + "/releases");
        }
      };

      // Send appropriate prompt
      if (currentVersion != latestVersion && translated) {
        dialog
          .showMessageBox({
            type: "question",
            title: "Update Checker",
            message: "Download latest native version?",
            detail:
              "Version " +
              latestVersion +
              " is available (released " +
              latestDateText +
              "). You're currently running the x86 build of version " +
              currentVersion +
              " on an arm64 platform. Would you like to download the latest native version?",
            icon: WINDOW_ICON,
            buttons: options,
            defaultId: 0,
            cancelId: cancelId
          })
          .then(handleResponse);
      } else if (currentVersion != latestVersion) {
        dialog
          .showMessageBox({
            type: "question",
            title: "Update Checker",
            message: "Download latest version?",
            detail:
              "Version " +
              latestVersion +
              " is available (released " +
              latestDateText +
              "). You're currently running version " +
              currentVersion +
              ". Would you like to download the latest version?",
            icon: WINDOW_ICON,
            buttons: options,
            defaultId: 0,
            cancelId: cancelId
          })
          .then(handleResponse);
      } else if (translated) {
        dialog
          .showMessageBox({
            type: "question",
            title: "Update Checker",
            message: "Download native version?",
            detail:
              "It looks like you're running the x86 version of this app on an arm64 platform. Would you like to download the native version?",
            icon: WINDOW_ICON,
            buttons: options,
            defaultId: 0,
            cancelId: cancelId
          })
          .then(handleResponse);
      } else if (alwaysNotify) {
        dialog.showMessageBox({
          type: "info",
          title: "Update Checker",
          message: "No updates available",
          detail: "You're currently running version " + currentVersion + " (released " + latestDateText + ").",
          icon: WINDOW_ICON
        });
      }
    })
    .catch(() => {
      if (alwaysNotify) {
        dialog.showMessageBox({
          type: "info",
          title: "Update Checker",
          message: "Cannot check for updates",
          detail:
            "Failed to retrieve update information from GitHub. Please check your internet connection and try again.",
          icon: WINDOW_ICON
        });
      }
    });
}
