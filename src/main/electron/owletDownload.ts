// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { compareVersions } from "compare-versions";
import download from "download";
import fs from "fs";
import crypto from "node:crypto";
import path from "path";

const INDEX_URL = "https://redist.ctr-electronics.com/index.json";

type CTRERedistIndex = {
  JsonVersion: string;
  LatestChannel: string;
  ChannelCompliancy: { Compliancy: number; Name: string }[];
  Tools: CTRERedistIndex_Tool[];
};

type CTRERedistIndex_Tool = {
  Name: string;
  Items: CTRERedistIndex_Version[];
};

type CTRERedistIndex_Version = {
  Version: string;
  Compliancy: number;
  Urls: { [key: string]: string };
};

function getOwletPlatform(electronPlatform: string): string {
  switch (electronPlatform) {
    case "mac-x64":
      return "macosuniversal";
    case "mac-arm64":
      return "macosuniversal";
    case "linux-x64":
      return "linuxx86-64";
    case "linux-arm64":
      return "linuxarm64";
    case "linux-armv7l":
      return "linuxarm32";
    case "win-x64":
      return "windowsx86-64";
    case "win-arm64":
      return "windowsx86-64";
    default:
      return "";
  }
}

/**
 * Updates stored copies of owlet from online index.
 *
 * @param target Target folder where owlet is stored
 * @param platform Platform key in Electron format
 */
export async function downloadOwletInternal(target: string, platform: string, stableOnly = false): Promise<void> {
  // Create target folder
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  // Fetch tools index
  const owletPlatform = getOwletPlatform(platform);
  const request = await fetch(INDEX_URL);
  const redistIndex: CTRERedistIndex = await request.json();
  if (redistIndex.JsonVersion !== "1.0.0.0") throw "Invalid JSON version";
  const owletIndex = redistIndex.Tools.find((tool) => tool.Name === "owlet");
  if (owletIndex === undefined) throw "Owlet not available in index";

  // Loop through each compliancy version
  for (let i = 0; i < redistIndex.ChannelCompliancy.length; i++) {
    // Check if stable
    let compliancyName = redistIndex.ChannelCompliancy[i].Name.toLowerCase();
    if (stableOnly && (compliancyName.includes("beta") || compliancyName.includes("alpha"))) {
      continue;
    }

    // Find latest version for compliancy
    let compatibleVersions = owletIndex.Items.filter(
      (version) => version.Compliancy === redistIndex.ChannelCompliancy[i].Compliancy
    );
    compatibleVersions.sort((a, b) => -compareVersions(a.Version, b.Version));
    if (compatibleVersions.length > 0) {
      let downloadVersion = compatibleVersions[0];

      // Get download filename
      let filename = "owlet-" + downloadVersion.Version + "-C" + downloadVersion.Compliancy.toString();
      let tempFilename = filename + "-temp";
      if (platform.startsWith("win")) {
        filename += ".exe";
        tempFilename += ".exe";
      }

      // Check if remote copy should be downloaded
      let shouldDownload = false;
      if (owletPlatform in downloadVersion.Urls && owletPlatform + "-sha1" in downloadVersion.Urls) {
        const localPath = path.join(target, filename);
        if (!fs.existsSync(localPath)) {
          shouldDownload = true;
        } else {
          const hash = crypto.createHash("sha1");
          hash.update(fs.readFileSync(localPath));
          if (hash.digest("hex") !== downloadVersion.Urls[owletPlatform + "-sha1"]) {
            shouldDownload = true;
          }
        }
      }

      // Download if necessary
      if (shouldDownload) {
        // Get list of existing files to delete
        const existingFiles = await new Promise<string[]>((resolve) =>
          fs.readdir(target, (_, files) => resolve(files))
        );
        const toDelete = existingFiles.filter((filename) =>
          filename.includes("-C" + downloadVersion.Compliancy.toString())
        );

        // Download file to temporary location
        await download(downloadVersion.Urls[owletPlatform], target, { filename: tempFilename });

        // Verify hash
        const hash = crypto.createHash("sha1");
        hash.update(fs.readFileSync(path.join(target, tempFilename)));
        const hex = hash.digest("hex");
        if (hex === downloadVersion.Urls[owletPlatform + "-sha1"]) {
          fs.chmodSync(path.join(target, tempFilename), 0o755);

          // Delete older versions
          toDelete.forEach((filename) => fs.unlinkSync(path.join(target, filename)));

          // Move to final location
          fs.renameSync(path.join(target, tempFilename), path.join(target, filename));
        } else {
          // Delete temporary file
          fs.unlinkSync(path.join(target, tempFilename));
        }
      }
    }
  }
}
