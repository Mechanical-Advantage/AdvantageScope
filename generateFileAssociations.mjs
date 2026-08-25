// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import fs from "fs";
import path from "path";

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
const associations = packageJson.build?.fileAssociations || [];

const targetDirs = process.argv.slice(2);
if (targetDirs.length === 0) {
  targetDirs.push("./dist");
}

for (const targetDir of targetDirs) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const iconsDir = path.join(targetDir, "icons");
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const formattedAssociations = associations.map((assoc) => {
    let iconRelativePath = null;
    if (assoc.icon) {
      const sourceIcon = `${assoc.icon}.ico`;
      const iconFileName = path.basename(sourceIcon);
      if (fs.existsSync(sourceIcon)) {
        fs.copyFileSync(sourceIcon, path.join(iconsDir, iconFileName));
        iconRelativePath = `icons/${iconFileName}`;
      }
    }
    return {
      ext: assoc.ext,
      name: assoc.name,
      description: assoc.description,
      mimeType: assoc.mimeType,
      icon: iconRelativePath
    };
  });

  const outputPath = path.join(targetDir, "fileAssociations.json");
  fs.writeFileSync(outputPath, JSON.stringify(formattedAssociations, null, 2));
  console.log(`Generated ${outputPath} and copied icons to ${iconsDir}.`);
}
