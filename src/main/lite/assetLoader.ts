// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { AdvantageScopeAssets } from "../../shared/AdvantageScopeAssets";
import { filterAndSortAssets, parseField2d } from "../assetUtil";

/** Loads all current assets. */
export async function loadAssets(): Promise<AdvantageScopeAssets> {
  let assets: AdvantageScopeAssets = {
    field2ds: [],
    loadFailures: []
  };

  // Request asset index
  let response = await fetch("assets");
  let assetIndex = await response.json();
  let currentPath = window.location.pathname;

  // Filter and sort index
  let configPaths = Object.keys(assetIndex)
    .filter((path) => path.endsWith("config.json"))
    .sort((a, b) => (a < b ? 1 : a > b ? -1 : 0)); // Inverse order so newer versions take priority
  for (let configPath of configPaths) {
    let name = configPath.split("/")[0];
    let configRaw = assetIndex[configPath];
    assets.loadFailures.push(name); // Assume failure, remove if successful

    if (configRaw === null) {
      // We need to load configRaw from the path
      // We need to make sure this doesn't error, and instead continues.
      try {
        let configResponse = await fetch(`assets/${configPath}`);
        configRaw = await configResponse.json();
      } catch (e) {
        continue;
      }
    }

    let isField2d = name.startsWith("Field2d_");

    if (isField2d) {
      // ***** 2D FIELD *****
      let config = parseField2d(configRaw);
      if (config === "skip") {
        assets.loadFailures.splice(assets.loadFailures.indexOf(name), 1);
        continue;
      } else if (config === "invalid") {
        continue;
      }
      config.path = currentPath + `assets/${encodeURIComponent(name)}/image.png`;
      if (`${name}/image.png` in assetIndex) {
        assets.field2ds.push(config);
        assets.loadFailures.splice(assets.loadFailures.indexOf(name), 1);
      }
    }
  }

  return filterAndSortAssets(assets);
}
