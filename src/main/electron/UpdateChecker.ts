// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { app, dialog, net, shell } from "electron";
import { formatDate } from "../../shared/util";
import { GITHUB_REPOSITORY } from "../github";
import { isBeta } from "./betaUtil";
import { WINDOW_ICON } from "./ElectronConstants";

/** Checks for updates from GitHub and prompts the user when requested. */
export default class UpdateChecker {
  private shouldPrompt = false;
  private alertMessage = "";
  private alertDetail = "";
  private alertOptions: string[] | null = null;
  private alertCancelId: number | null = null;
  private latestVersion = "";
  private alertDownloadUrl: string | null = null;

  async check() {
    // Check if running in dev environment
    if (!app.isPackaged) {
      this.shouldPrompt = false;
      this.alertOptions = null;
      this.alertCancelId = null;
      this.alertDownloadUrl = null;
      this.alertMessage = t("main.cannotCheckUpdates");
      this.alertDetail = t("main.devEnvDetail");
      return;
    }

    // Read release data from GitHub
    let releaseData;
    try {
      let response = await net.fetch("https://api.github.com/repos/" + GITHUB_REPOSITORY + "/releases", {
        method: "GET",
        headers: {
          pragma: "no-cache",
          "cache-control": "no-cache"
        }
      });
      releaseData = await response.json();
    } catch (error) {
      console.error(error);
      this.shouldPrompt = false;
      this.alertOptions = null;
      this.alertCancelId = null;
      this.alertDownloadUrl = null;
      this.alertMessage = t("main.cannotCheckUpdates");
      this.alertDetail = t("main.fetchUpdateFailedDetail");
      return;
    }

    // Remove beta releases if not currently a beta
    if (!isBeta()) {
      releaseData = releaseData.filter((release: any) => !release["prerelease"]);
    }

    // Filter to same major version
    let currentVersion = app.getVersion();
    let currentMajorVersion = currentVersion.split(".")[0];
    releaseData = releaseData.filter(
      (release: any) => release["tag_name"].substring(1).split(".")[0] === currentMajorVersion
    );
    if (releaseData.length === 0) {
      this.shouldPrompt = false;
      this.alertOptions = null;
      this.alertCancelId = null;
      this.alertDownloadUrl = null;
      this.alertMessage = t("main.noUpdateData");
      this.alertDetail = t("main.noUpdateDataDetail");
      return;
    }

    // Get version info
    let latestVersionInfo = releaseData[0];
    this.latestVersion = latestVersionInfo["tag_name"].slice(1);
    let latestDate = new Date(latestVersionInfo["published_at"]);
    let latestDateText = formatDate(latestDate);
    let translated = process.arch !== "arm64" && app.runningUnderARM64Translation;

    // Update alert settings
    this.shouldPrompt = true;
    this.alertOptions =
      process.platform === "darwin"
        ? [t("main.download"), t("main.later"), t("main.viewChangelog")]
        : [t("main.download"), t("main.viewChangelog"), t("main.later")];
    this.alertCancelId = process.platform === "darwin" ? 1 : 2;
    this.alertDownloadUrl = null;

    // Set appropriate prompt
    if (currentVersion !== this.latestVersion && translated) {
      this.alertMessage = t("main.downloadLatestNativeQuery");
      this.alertDetail = t("main.downloadLatestNativeDetail", {
        latestVersion: this.latestVersion,
        latestDate: latestDateText,
        currentVersion: currentVersion
      });
    } else if (currentVersion !== this.latestVersion) {
      this.alertMessage = t("main.downloadLatestQuery");
      this.alertDetail = t("main.downloadLatestDetail", {
        latestVersion: this.latestVersion,
        latestDate: latestDateText,
        currentVersion: currentVersion
      });
    } else if (translated) {
      this.alertMessage = t("main.downloadNativeQuery");
      this.alertDetail = t("main.downloadNativeDetail");
    } else {
      this.shouldPrompt = false;
      this.alertOptions = null;
      this.alertCancelId = null;
      this.alertMessage = t("main.noUpdatesAvailable");
      this.alertDetail = t("main.upToDateDetail", { currentVersion: currentVersion, latestDate: latestDateText });
      return;
    }

    // Get download URL
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
    let downloadAssets = latestVersionInfo["assets"].filter((asset: any) => {
      return asset.name.includes(platformKey) && asset.name.includes(arch);
    });
    if (downloadAssets.length === 1) {
      this.alertDownloadUrl = downloadAssets[0].browser_download_url;
    }
  }

  /** Returns whether the user should be prompted to update. */
  getShouldPrompt(): boolean {
    return this.shouldPrompt;
  }

  /** Prompts the user with the current update status. */
  async showPrompt() {
    // Info prompt
    if (this.alertOptions === null || this.alertCancelId === null) {
      await dialog.showMessageBox({
        type: "info",
        title: t("main.updateChecker"),
        message: this.alertMessage || t("main.updateCheckNotComplete"),
        detail: this.alertDetail || t("main.updateCheckNotCompleteDetail"),
        icon: WINDOW_ICON
      });
      return;
    }

    // Update prompt (question)
    let result = await dialog.showMessageBox({
      type: "question",
      title: t("main.updateChecker"),
      message: this.alertMessage,
      detail: this.alertDetail,
      icon: WINDOW_ICON,
      buttons: this.alertOptions,
      defaultId: 0,
      cancelId: this.alertCancelId
    });
    let responseString = this.alertOptions[result.response];
    if (responseString === t("main.download")) {
      if (this.alertDownloadUrl === null) {
        this.alertDownloadUrl = `https://github.com/${GITHUB_REPOSITORY}/releases/v${this.latestVersion}`;
      }
      await shell.openExternal(this.alertDownloadUrl);
    } else if (responseString === t("main.viewChangelog")) {
      await shell.openExternal("https://github.com/" + GITHUB_REPOSITORY + "/releases");
    }
  }
}
