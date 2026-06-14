// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import checkDiskSpace from "check-disk-space";
import download from "download";
import fs from "fs";
import path from "path";
import { DISTRIBUTION, Distribution } from "../../shared/buildConstants";
import { GITHUB_ASSET_TAG_DEFAULT, GITHUB_ASSET_TAG_FRC6328, GITHUB_ASSETS_REPOSITORY } from "../github";
import { AUTO_ASSETS } from "./ElectronConstants";

const REQUIRED_SPACE_GB = 8;
const FAILURE_TIMEOUT_MS = 30 * 1000; // 30 seconds
const SUCCESS_TIMEOUT_MS = 6 * 60 * 60 * 1000; // 6 hours

let statusText = "No status available.";

/** Updates the local set of automatic assets and retries periodically in case of network issues. */
export function startAssetDownloadLoop(updateCallback: () => void) {
  let check: () => void = () => {
    checkDiskSpace(AUTO_ASSETS)
      .then((diskSpace) => {
        if (diskSpace.free / 1e9 < REQUIRED_SPACE_GB) {
          throw new Error();
        }
        getAssetInfo()
          .then((assetInfo) => {
            statusText =
              "Download started at " +
              new Date().toLocaleTimeString() +
              ". Please wait a few minutes for the download to complete.";
            updateLocalAssets(assetInfo)
              .then(() => {
                statusText = "All assets downloaded. AdvantageScope will check for updates periodically.";
                updateCallback();
                setTimeout(() => check(), SUCCESS_TIMEOUT_MS);
              })
              .catch(() => {
                statusText = "Cannot connect to GitHub. Trying again soon.";
                setTimeout(() => check(), FAILURE_TIMEOUT_MS);
              });
          })
          .catch(() => {
            statusText = "Cannot connect to GitHub. Trying again soon.";
            setTimeout(() => check(), FAILURE_TIMEOUT_MS);
          });
      })
      .catch(() => {
        statusText = "Not enough disk space. Trying again soon.";
        setTimeout(() => check(), FAILURE_TIMEOUT_MS);
      });
  };
  check();
}

/** Returns a string for the current status of the download. */
export function getAssetDownloadStatus() {
  return statusText;
}

interface AssetDownloadInfo {
  source: string;
  target: string;
  optional: boolean;
}

/** Gets the set of assets to download from GitHub. */
async function getAssetInfo(): Promise<AssetDownloadInfo[]> {
  // Get all release info
  let response = await fetch("https://api.github.com/repos/" + GITHUB_ASSETS_REPOSITORY + "/releases", {
    method: "GET",
    headers: {
      pragma: "no-cache",
      "cache-control": "no-cache"
    },
    signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) {
    throw new Error();
  }
  let releaseData = (await response.json()) as {
    tag_name: string;
    assets: {
      name: string;
      browser_download_url: string;
    }[];
  }[];

  // Extract download info
  let downloadInfo: AssetDownloadInfo[] = [];
  releaseData.forEach((release) => {
    if (release.tag_name === GITHUB_ASSET_TAG_DEFAULT || release.tag_name === GITHUB_ASSET_TAG_FRC6328) {
      release.assets.forEach((asset) => {
        downloadInfo.push({
          target: path.join(AUTO_ASSETS, asset.name.slice(0, asset.name.length - 4)), // Remove ".zip"
          source: asset.browser_download_url,
          optional: DISTRIBUTION === Distribution.WPILib && release.tag_name === GITHUB_ASSET_TAG_FRC6328
        });
      });
    }
  });
  return downloadInfo;
}

/** Downloads and extracts any new assets and deletes old assets. */
async function updateLocalAssets(downloadInfo: AssetDownloadInfo[]) {
  // Download new assets
  await Promise.all(
    downloadInfo
      .filter((assetInfo) => !assetInfo.optional && !fs.existsSync(assetInfo.target))
      .map((assetInfo) =>
        download(assetInfo.source, assetInfo.target + "_download", { extract: true }).then(() =>
          fs.renameSync(assetInfo.target + "_download", assetInfo.target)
        )
      )
  );

  // Delete old assets
  fs.readdirSync(AUTO_ASSETS).forEach((folder) => {
    let folderPath = path.join(AUTO_ASSETS, folder);
    if (!downloadInfo.some((assetInfo) => assetInfo.target === folderPath)) {
      fs.rmSync(folderPath, { recursive: true });
    }
  });
}
