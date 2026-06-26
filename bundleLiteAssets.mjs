// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import download from "download";
import fs from "fs";
import path from "path";

// Constants
const isDS = process.env.ASCOPE_DISTRIBUTION === "LITEDS";
const bundledAssetsPath = "bundledAssets";
const liteAssetsPath = path.join("lite", "static", "bundledAssets");
const githubAssetsRepository = "Mechanical-Advantage/AdvantageScopeAssets";
const githubAssetsTag = "archive-v1";
let githubAssetNames = [
  "Joystick_LogitechF310V2",
  "Joystick_PS4ControllerV2",
  "Joystick_XboxControllerBlueV2",
  "Joystick_XboxControllerWhiteV2"
];
if (!isDS) {
  // Only include fields and robots in non-DS distribution
  githubAssetNames = githubAssetNames.concat([
    "Field2d_2026FRCFieldV1",
    "Field2d_20252026FTCFieldV1",
    "Field3d_2026FRCFieldV1",
    "Field3d_20252026FTCFieldV1",
    "Robot_2026FRCKitBotV1",
    "Robot_FTCDriveBaseV1"
  ]);
}

// Check if up-to-date
let shouldExitEarly = false;
if (fs.existsSync(liteAssetsPath)) {
  let existingAssetNames = fs.readdirSync(liteAssetsPath);

  // Sort both arrays for reliable comparison
  existingAssetNames.sort();
  const targetAssetNames = [...githubAssetNames, ...(isDS ? [] : fs.readdirSync(bundledAssetsPath))].sort();

  // Check if lengths are the same and all elements match
  if (existingAssetNames.length === targetAssetNames.length) {
    shouldExitEarly = true;
    for (let i = 0; i < existingAssetNames.length; i++) {
      if (existingAssetNames[i] !== targetAssetNames[i]) {
        shouldExitEarly = false;
        break;
      }
    }
  }
}
if (shouldExitEarly) {
  console.log("Lite assets are already up-to-date. Skipping download.");
  process.exit(0);
}

// Delete existing Lite assets
if (fs.existsSync(liteAssetsPath)) {
  fs.rmSync(liteAssetsPath, { recursive: true });
}

// Copy basic bundled assets
if (!isDS) {
  fs.cpSync(bundledAssetsPath, liteAssetsPath, { recursive: true });
}

// Download GitHub assets
githubAssetNames.forEach((asset) => {
  const url = `https://github.com/${githubAssetsRepository}/releases/download/${githubAssetsTag}/${asset}.zip`;
  const destination = path.join(liteAssetsPath, asset);
  download(url, destination, { extract: true }).then(() => {
    console.log("Finished downloading '" + asset + "'");
  });
});
