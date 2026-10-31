// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Ensures the Electron binary is extracted into node_modules/electron/dist.
//
// npm 11 only runs dependency install scripts listed in "allowScripts", and on
// newer Node versions (26+) Electron's own install script can exit silently
// without extracting the zip ("extract-zip" never resolves). This script
// downloads the artifact via @electron/get (using the shared cache) and
// extracts it with the platform's native unzip tool instead.

import { downloadArtifact } from "@electron/get";
import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

const electronDir = path.join("node_modules", "electron");
if (!fs.existsSync(path.join(electronDir, "package.json"))) {
  console.log("Electron is not installed, skipping binary extraction.");
  process.exit(0);
}
const version = JSON.parse(fs.readFileSync(path.join(electronDir, "package.json"), "utf-8")).version;
const platform = os.platform();
const platformPath = {
  darwin: "Electron.app/Contents/MacOS/Electron",
  linux: "electron",
  win32: "electron.exe"
}[platform];
if (platformPath === undefined) {
  console.error("Unsupported platform for Electron: " + platform);
  process.exit(0);
}
const distPath = path.join(electronDir, "dist");

function isInstalled() {
  try {
    return (
      fs.readFileSync(path.join(distPath, "version"), "utf-8").trim().replace(/^v/, "") === version &&
      fs.readFileSync(path.join(electronDir, "path.txt"), "utf-8") === platformPath &&
      fs.existsSync(path.join(distPath, platformPath))
    );
  } catch {
    return false;
  }
}

if (isInstalled()) {
  console.log("Electron " + version + " binary already installed.");
  process.exit(0);
}

console.log("Extracting Electron " + version + " binary...");
const zipPath = await downloadArtifact({
  version: version,
  artifactName: "electron",
  platform: platform,
  arch: process.arch,
  checksums: JSON.parse(fs.readFileSync(path.join(electronDir, "checksums.json"), "utf-8"))
});
fs.rmSync(distPath, { recursive: true, force: true });
fs.mkdirSync(distPath, { recursive: true });
if (platform === "darwin") {
  // "ditto" preserves the symlinks and permissions inside Electron.app
  execFileSync("ditto", ["-x", "-k", zipPath, distPath], { stdio: "inherit" });
} else if (platform === "win32") {
  execFileSync("tar", ["-xf", zipPath, "-C", distPath], { stdio: "inherit" });
} else {
  execFileSync("unzip", ["-q", "-o", zipPath, "-d", distPath], { stdio: "inherit" });
}
const typeDefPath = path.join(distPath, "electron.d.ts");
if (fs.existsSync(typeDefPath)) {
  fs.renameSync(typeDefPath, path.join(electronDir, "electron.d.ts"));
}
fs.writeFileSync(path.join(electronDir, "path.txt"), platformPath);
console.log("Electron binary installed.");
