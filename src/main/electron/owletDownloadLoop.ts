// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import checkDiskSpace from "check-disk-space";
import { compareVersions } from "compare-versions";
import { app } from "electron";
import fs from "fs";
import path from "path";
import getElectronPlatform from "./getElectronPlatform";
import { downloadOwletInternal } from "./owletDownload";

export const OWLET_STORAGE = path.join(app.getPath("userData"), "owlet");
const OWLET_BUNDLED_STORAGE = path.join(__dirname, "..", "owlet", getElectronPlatform());

const REQUIRED_SPACE_GB = 1;
const FAILURE_TIMEOUT_MS = 30 * 1000; // 30 seconds
const SUCCESS_TIMEOUT_MS = 6 * 60 * 60 * 1000; // 6 hours

let statusText = "No status available.";

/** Updates the stored copies of owlet and retries periodically in case of network issues */
export async function startOwletDownloadLoop() {
  let check: () => Promise<void> = async () => {
    try {
      const diskSpace = await checkDiskSpace(OWLET_STORAGE);
      if (diskSpace.free / 1e9 < REQUIRED_SPACE_GB) {
        throw new Error();
      }
    } catch {
      statusText = "Not enough disk space. Trying again soon.";
      setTimeout(() => check(), FAILURE_TIMEOUT_MS);
    }
    try {
      downloadOwletInternal(OWLET_STORAGE, getElectronPlatform());
      statusText = "Owlet is up-to-date. AdvantageScope will check for updates periodically.";
      setTimeout(() => check(), SUCCESS_TIMEOUT_MS);
    } catch {
      statusText = "Using offline owlet cache. Checking for updates soon.";
      setTimeout(() => check(), FAILURE_TIMEOUT_MS);
    }
  };

  try {
    await copyBundledOwlet();
  } catch {}
  await check();
}

/** Returns a string for the current status of the download. */
export function getOwletDownloadStatus() {
  return statusText;
}

/** Updates stored copies of owlet from bundled cache. */
export async function copyBundledOwlet(): Promise<void> {
  // Create storage folder
  if (!fs.existsSync(OWLET_STORAGE)) {
    fs.mkdirSync(OWLET_STORAGE);
  }

  // Loop through bundled files
  let bundledFiles = await fs.promises.readdir(OWLET_BUNDLED_STORAGE);
  for (let i = 0; i < bundledFiles.length; i++) {
    let filename = bundledFiles[i];
    let bundledVersion = filename.split("-")[1];
    let compliancy = getCompliancy(filename);

    // Copy bundled file to storage folder
    let copy = async () => {
      await fs.promises.copyFile(path.join(OWLET_BUNDLED_STORAGE, filename), path.join(OWLET_STORAGE, filename));
      await fs.promises.chmod(path.join(OWLET_STORAGE, filename), 0o755);
    };

    // Look for stored version with same compliancy
    let storedFilenames = await fs.promises.readdir(OWLET_STORAGE);
    let storedFilename = storedFilenames.find((filename) => getCompliancy(filename) === compliancy);
    if (storedFilename !== undefined) {
      // Existing version found, check if bundled version is newer
      let storedVersion = storedFilename.split("-")[1];
      if (compareVersions(bundledVersion, storedVersion) > 0) {
        // Delete older version
        await fs.promises.unlink(path.join(OWLET_STORAGE, storedFilename));

        // Copy bundled version
        await copy();
      }
    } else {
      // No existing version with this compliancy, copy bundled version
      await copy();
    }
  }
}

/** Get compliancy string from filename (e.g. "C1"). */
function getCompliancy(filename: string): string {
  if (filename.endsWith(".exe")) {
    filename = filename.slice(0, -4);
  }
  let dashSplit = filename.split("-");
  if (dashSplit.length < 3) return "";
  return dashSplit[2];
}
