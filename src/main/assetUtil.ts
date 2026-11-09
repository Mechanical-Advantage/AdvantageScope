// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { AdvantageScopeAssets, Config2d } from "../shared/AdvantageScopeAssets";
import { checkArrayType } from "../shared/util";

export function parseField2d(configRaw: unknown): Config2d | "invalid" | "skip" {
  if (configRaw === null || typeof configRaw !== "object") return "invalid";
  let config: Config2d = {
    name: "",
    path: "",
    id: "",
    isFTC: false,
    useGrid: true,
    topLeft: [-1, -1],
    bottomRight: [-1, -1],
    widthInches: 0,
    heightInches: 0
  };
  if ("name" in configRaw && typeof configRaw.name === "string") {
    config.name = configRaw.name;
  }
  if ("isFTC" in configRaw && typeof configRaw.isFTC === "boolean") {
    config.isFTC = configRaw.isFTC;
  } else {
    // Pre-2026 format, skip
    return "skip";
  }
  if ("useGrid" in configRaw && typeof configRaw.useGrid === "boolean") {
    config.useGrid = configRaw.useGrid;
  }
  if ("sourceUrl" in configRaw && typeof configRaw.sourceUrl === "string") {
    config.sourceUrl = configRaw.sourceUrl;
  }
  if (
    "topLeft" in configRaw &&
    checkArrayType(configRaw.topLeft, "number") &&
    (configRaw.topLeft as number[]).length === 2
  ) {
    config.topLeft = configRaw.topLeft as [number, number];
  }
  if (
    "bottomRight" in configRaw &&
    checkArrayType(configRaw.bottomRight, "number") &&
    (configRaw.bottomRight as number[]).length === 2
  ) {
    config.bottomRight = configRaw.bottomRight as [number, number];
  }
  if ("widthInches" in configRaw && typeof configRaw.widthInches === "number") {
    config.widthInches = configRaw.widthInches;
  }
  if ("heightInches" in configRaw && typeof configRaw.heightInches === "number") {
    config.heightInches = configRaw.heightInches;
  }
  if (
    config.name.length > 0 &&
    config.topLeft[0] >= 0 &&
    config.topLeft[1] >= 0 &&
    config.bottomRight[0] >= 0 &&
    config.bottomRight[1] >= 0 &&
    config.widthInches > 0 &&
    config.heightInches > 0
  ) {
    config.id = (config.isFTC ? "FTC" : "FRC") + ":" + config.name;
    return config;
  }
  return "invalid";
}

export function filterAndSortAssets(assets: AdvantageScopeAssets): AdvantageScopeAssets {
  // Remove duplicate names
  let uniqueAssets: AdvantageScopeAssets = {
    field2ds: [],
    loadFailures: assets.loadFailures
  };
  assets.field2ds.forEach((asset) => {
    if (uniqueAssets.field2ds.find((other) => other.id === asset.id) === undefined) {
      uniqueAssets.field2ds.push(asset);
    }
  });

  // Sort assets
  {
    // Evergeen field in asset files, sort to end of list
    uniqueAssets.field2ds.sort((a, b) => {
      if (a.name === "Evergreen") return 1;
      if (b.name === "Evergreen") return -1;
      return a.name > b.name ? -1 : b.name > a.name ? 1 : 0;
    });

    // Sort load failures normally
    uniqueAssets.loadFailures.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }

  return uniqueAssets;
}
