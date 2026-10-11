// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import fs from "fs";
import path from "path";

let licenses = [];
let packageLock = JSON.parse(fs.readFileSync("package-lock.json"));
for (const modulePath of Object.keys(packageLock.packages)) {
  let moduleName = modulePath === "" ? "AdvantageScope" : modulePath.replaceAll("node_modules/", "");
  if (modulePath !== "" && !fs.existsSync(modulePath)) {
    // Module not installed
    continue;
  }
  let licenseFiles = fs
    .readdirSync(modulePath === "" ? "." : modulePath)
    .filter(
      (filename) =>
        filename.toLowerCase().startsWith("license") &&
        !filename.endsWith(".js") &&
        !filename.endsWith(".json") &&
        !filename.includes("header") &&
        !fs.statSync(path.join(modulePath === "" ? "." : modulePath, filename)).isDirectory()
    );
  let licenseText = null;
  if (licenseFiles.length > 0) {
    // Get license text from local files
    licenseText = licenseFiles.map((filename) => fs.readFileSync(path.join(modulePath, filename))).join("\n");
  } else if (fs.existsSync(path.join(modulePath, "package.json"))) {
    // Read from package.json
    let packageJson = JSON.parse(fs.readFileSync(path.join(modulePath, "package.json")));
    let spdxId = packageJson.license;
    if (typeof spdxId === "string") {
      spdxId = spdxId.replace(/[()]/g, "").trim();
      if (spdxId.includes(" OR ")) {
        spdxId = spdxId.split(" OR ")[0].trim();
      }
    }
    try {
      let request = await fetch(
        "https://raw.githubusercontent.com/spdx/license-list-data/main/json/details/" +
          encodeURIComponent(spdxId) +
          ".json"
      );
      if (!request.ok) {
        console.error('Failed to get license for "' + moduleName + '"');
        continue;
      }
      let spdxLicense = await request.json();
      licenseText = spdxLicense.licenseText;
    } catch {
      console.error('Failed to get license for "' + moduleName + '"');
      continue;
    }
  }
  if (licenseText !== null) {
    licenses.push({
      module: moduleName,
      text: licenseText
    });
  }
}

// Add extra licenses from "licenses" directory
if (fs.existsSync("licenses")) {
  fs.readdirSync("licenses")
    .filter((filename) => filename.endsWith(".txt"))
    .sort()
    .forEach((filename) => {
      let moduleName = filename.slice(0, -4);
      let licenseText = fs.readFileSync(path.join("licenses", filename), "utf-8");
      licenses.push({
        module: moduleName,
        text: licenseText
      });
    });
}

// Sort licenses alphabetically with AdvantageScope first
licenses.sort((a, b) => {
  if (a.module === "AdvantageScope") return -1;
  if (b.module === "AdvantageScope") return 1;
  return a.module.localeCompare(b.module);
});

// Save JSON version
fs.writeFileSync("src/licenses.json", JSON.stringify(licenses));

// Save text version
let fullText = "";
licenses.forEach((license, index) => {
  if (index === 0) return; // AdvantageScope license already included
  if (index > 1) fullText += "\n";
  fullText += "---------- " + license.module + " ----------\n\n";
  fullText += license.text;
});
fs.writeFileSync("ThirdPartyLicenses.txt", fullText);

// Print status
console.log("Saved " + licenses.length.toString() + " licenses");
