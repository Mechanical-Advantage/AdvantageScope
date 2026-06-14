// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import path from "path";
import { BETA_CONFIG } from "./main/betaConfig";
import { downloadOwletInternal } from "./main/electron/owletDownload";

function download(platform: string) {
  downloadOwletInternal(path.join("owlet", platform), platform, BETA_CONFIG === null).then(() => {
    console.log("Finished downloading for " + platform);
  });
}

console.log("Downloading owlet...");
download("mac-x64");
download("mac-arm64");
download("linux-x64");
download("linux-arm64");
download("linux-armv7l");
download("win-x64");
download("win-arm64");
