// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import fs from "fs";

const FILENAME = "eng.traineddata.gz";
const URL = "https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/" + FILENAME;

const response = await fetch(URL);
if (!response.ok) {
  throw new Error(`Failed to download ${FILENAME}: ${response.status} ${response.statusText}`);
}
await fs.promises.writeFile(FILENAME, Buffer.from(await response.arrayBuffer()));
