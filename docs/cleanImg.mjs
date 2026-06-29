// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.join(__dirname, "build");

if (fs.existsSync(buildDir)) {
  const children = fs.readdirSync(buildDir, { withFileTypes: true });
  for (const child of children) {
    if (child.isDirectory()) {
      const name = child.name;
      // Exclude non-language assets folders
      if (name !== "assets" && name !== "icons" && name !== "img") {
        const imgPath = path.join(buildDir, name, "img");
        if (fs.existsSync(imgPath)) {
          fs.rmSync(imgPath, { recursive: true, force: true });
        }
      }
    }
  }
}
