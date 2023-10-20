import checkDiskSpace from "check-disk-space";
import download from "download";
import fs from "fs";
import path from "path";
import { DISTRIBUTOR, Distributor } from "../shared/buildConstants";
import { ASSETS_REPOSITORY, ASSET_TAG_DEFAULT, ASSET_TAG_FRC6328, AUTO_ASSETS } from "./Constants";

const REQUIRED_SPACE_GB = 8;
const FAILURE_TIMEOUT_MS = 30 * 1000; // 30 seconds
const SUCCESS_TIMEOUT_MS = 3 * 60 * 60 * 1000; // 3 hours

let statusText = "No status available.";

/** Updates the local set of automatic assets and retries periodically in case of network issues. */
export function startAssetDownload(updateCallback: () => void) {
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
                statusText =
                  "All assets downloaded. Will check for updates at " +
                  new Date(new Date().getTime() + SUCCESS_TIMEOUT_MS).toLocaleTimeString() +
                  ".";
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
  let response = await fetch("https://api.github.com/repos/" + ASSETS_REPOSITORY + "/releases", {
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
    if (release.tag_name === ASSET_TAG_DEFAULT || release.tag_name === ASSET_TAG_FRC6328) {
      release.assets.forEach((asset) => {
        downloadInfo.push({
          target: path.join(AUTO_ASSETS, asset.name.slice(0, asset.name.length - 4)), // Remove ".zip"
          source: asset.browser_download_url,
          optional: DISTRIBUTOR === Distributor.WPILib && release.tag_name === ASSET_TAG_FRC6328
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
      .map((assetInfo) => download(assetInfo.source, assetInfo.target, { extract: true }))
  );

  // Delete old assets
  fs.readdirSync(AUTO_ASSETS).forEach((folder) => {
    let folderPath = path.join(AUTO_ASSETS, folder);
    if (!downloadInfo.some((assetInfo) => assetInfo.target === folderPath)) {
      fs.rmSync(folderPath, { recursive: true });
    }
  });
}
