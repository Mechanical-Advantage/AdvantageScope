// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { app, dialog, shell } from "electron";
import fetch from "electron-fetch";
import { GITHUB_REPOSITORY } from "../github";
import { isBeta } from "./betaUtil";
import { WINDOW_ICON } from "./ElectronConstants";

/** Checks for updates from GitHub and prompts the user when requested. */
export default class UpdateChecker {
  private shouldPrompt = false;
  private alertMessage = "Update check not complete";
  private alertDetail = "Checking for update information. Please try again.";
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
      this.alertMessage = "Cannot check for updates";
      this.alertDetail = "This app is running in a development environment.";
      return;
    }

    // Read release data from GitHub
    let releaseData;
    try {
      // @ts-ignore
      let response = await fetch.default("https://api.github.com/repos/" + GITHUB_REPOSITORY + "/releases", {
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
      this.alertMessage = "Cannot check for updates";
      this.alertDetail =
        "Failed to retrieve update information from GitHub. Please check your internet connection and try again.";
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
      this.alertMessage = "No update data available";
      this.alertDetail =
        "No update information was found for the installed version of AdvantageScope. Please check the AdvantageScope GitHub repository to download the latest release.";
      return;
    }

    // Get version info
    let latestVersionInfo = releaseData[0];
    this.latestVersion = latestVersionInfo["tag_name"].slice(1);
    let latestDate = new Date(latestVersionInfo["published_at"]);
    let latestDateText = latestDate.toLocaleDateString();
    let translated = process.arch !== "arm64" && app.runningUnderARM64Translation;

    // Update alert settings
    this.shouldPrompt = true;
    this.alertOptions =
      process.platform === "darwin" ? ["Download", "Later", "View Changelog"] : ["Download", "View Changelog", "Later"];
    this.alertCancelId = process.platform === "darwin" ? 1 : 2;
    this.alertDownloadUrl = null;

    // Set appropriate prompt
    if (currentVersion !== this.latestVersion && translated) {
      this.alertMessage = "Download latest native version?";
      this.alertDetail =
        "Version " +
        this.latestVersion +
        " is available (released " +
        latestDateText +
        "). You're currently running the x86 build of version " +
        currentVersion +
        " on an arm64 platform. Would you like to download the latest native version?";
    } else if (currentVersion !== this.latestVersion) {
      this.alertMessage = "Download latest version?";
      this.alertDetail =
        "Version " +
        this.latestVersion +
        " is available (released " +
        latestDateText +
        "). You're currently running version " +
        currentVersion +
        ". Would you like to download the latest version?";
    } else if (translated) {
      this.alertMessage = "Download native version?";
      this.alertDetail =
        "It looks like you're running the x86 version of this app on an arm64 platform. Would you like to download the native version?";
    } else {
      this.shouldPrompt = false;
      this.alertOptions = null;
      this.alertCancelId = null;
      this.alertMessage = "No updates available";
      this.alertDetail = "You're currently running version " + currentVersion + " (released " + latestDateText + ").";
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
        title: "Update Checker",
        message: this.alertMessage,
        detail: this.alertDetail,
        icon: WINDOW_ICON
      });
      return;
    }

    // Update prompt (question)
    let result = await dialog.showMessageBox({
      type: "question",
      title: "Update Checker",
      message: this.alertMessage,
      detail: this.alertDetail,
      icon: WINDOW_ICON,
      buttons: this.alertOptions,
      defaultId: 0,
      cancelId: this.alertCancelId
    });
    let responseString = this.alertOptions[result.response];
    if (responseString === "Download") {
      if (this.alertDownloadUrl === null) {
        this.alertDownloadUrl = `https://github.com/${GITHUB_REPOSITORY}/releases/v${this.latestVersion}`;
      }
      await shell.openExternal(this.alertDownloadUrl);
    } else if (responseString === "View Changelog") {
      await shell.openExternal("https://github.com/" + GITHUB_REPOSITORY + "/releases");
    }
  }
}
