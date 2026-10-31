// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import fs from "fs";
import path from "path";

// Copies the bundled assets into the Lite build. No assets are downloaded.
const bundledAssetsPath = "bundledAssets";
const liteAssetsPath = path.join("lite", "static", "bundledAssets");

if (fs.existsSync(liteAssetsPath)) {
  fs.rmSync(liteAssetsPath, { recursive: true });
}
fs.cpSync(bundledAssetsPath, liteAssetsPath, { recursive: true });
console.log("Copied bundled assets to Lite.");
