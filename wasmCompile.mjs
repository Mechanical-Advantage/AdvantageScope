// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { exec } from "child_process";
import fs from "fs";

const EMSCRIPTEN_VERSION = "3.1.74";

try {
  await new Promise(async (resolve, reject) => {
    // Check Emscripten version
    try {
      await new Promise((resolve, reject) => {
        exec("emcc --version", (error, stdout) => {
          if (error !== null) {
            reject("Failed to invoke emcc. Is Emscripten installed?");
          }
          if (!stdout.includes(EMSCRIPTEN_VERSION)) {
            reject(
              `Emscripten version is not ${EMSCRIPTEN_VERSION}. Please install the correct version and try again.`
            );
          }
          resolve();
        });
      });
    } catch (error) {
      console.error(error);
      reject();
      return;
    }

    // Create directories
    if (!fs.existsSync("bundles")) {
      fs.mkdirSync("bundles");
    }
    if (!fs.existsSync("lite/static/bundles")) {
      fs.mkdirSync("lite/static/bundles");
    }

    // Compile wasm
    let inPath, outPath;
    if (process.platform === "win32") {
      inPath = "src\\hub\\dataSources\\wpilog\\indexer\\wpilogIndexer.c";
      outPath = "bundles\\hub$wpilogIndexer.js";
    } else {
      inPath = "'src/hub/dataSources/wpilog/indexer/wpilogIndexer.c'";
      outPath = "'bundles/hub$wpilogIndexer.js' ";
    }
    exec(
      `emcc ${inPath} -o ${outPath} -sEXPORTED_FUNCTIONS=_run,_malloc -sALLOW_MEMORY_GROWTH -O3`,
      (error, stdout, stderr) => {
        console.log(stdout);
        console.error(stderr);
        if (error === null) {
          // Copy to Lite bundles
          fs.copyFileSync("bundles/hub$wpilogIndexer.js", "lite/static/bundles/hub$wpilogIndexer.js");
          fs.copyFileSync("bundles/hub$wpilogIndexer.wasm", "lite/static/bundles/hub$wpilogIndexer.wasm");

          // Exit successfully
          resolve();
        } else {
          reject();
        }
      }
    );
  });
} catch (exception) {
  process.exit(1);
}
