// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { AdvantageScopeAssets } from "../../shared/AdvantageScopeAssets";
import { filterAndSortAssets, parseField2d, parseField3d, parseJoystick, parseRobot } from "../assetUtil";

/** Loads all current assets. */
export async function loadAssets(): Promise<AdvantageScopeAssets> {
  let assets: AdvantageScopeAssets = {
    field2ds: [],
    field3ds: [],
    robots: [],
    joysticks: [],
    loadFailures: []
  };

  // Request asset index
  let response = await fetch("assets");
  let assetIndex = await response.json();
  let currentPath = window.location.pathname;

  // Filter and sort index
  let configPaths = Object.keys(assetIndex)
    .filter((path) => path.endsWith("config.json") && assetIndex[path] !== null)
    .sort((a, b) => (a < b ? 1 : a > b ? -1 : 0)); // Inverse order so newer versions take priority
  configPaths.forEach((configPath) => {
    let name = configPath.split("/")[0];
    let configRaw = assetIndex[configPath];
    assets.loadFailures.push(name); // Assume failure, remove if successful
    let isField2d = name.startsWith("Field2d_");
    let isField3d = name.startsWith("Field3d_");
    let isRobot = name.startsWith("Robot_");
    let isJoystick = name.startsWith("Joystick_");

    if (isField2d) {
      // ***** 2D FIELD *****
      let config = parseField2d(configRaw);
      if (config === "skip") {
        assets.loadFailures.splice(assets.loadFailures.indexOf(name), 1);
        return;
      } else if (config === "invalid") {
        return;
      }
      config.path = currentPath + `assets/${encodeURIComponent(name)}/image.png`;
      if (`${name}/image.png` in assetIndex) {
        assets.field2ds.push(config);
        assets.loadFailures.splice(assets.loadFailures.indexOf(name), 1);
      }
    } else if (isField3d) {
      // ***** 3D FIELD *****
      let config = parseField3d(configRaw);
      if (config === "skip") {
        assets.loadFailures.splice(assets.loadFailures.indexOf(name), 1);
        return;
      } else if (config === "invalid") {
        return;
      }
      config.path = currentPath + `assets/${encodeURIComponent(name)}/model.glb`;
      if (
        `${name}/model.glb` in assetIndex &&
        config.gamePieces.every((_, index) => `${name}/model_${index}.glb` in assetIndex)
      ) {
        assets.field3ds.push(config);
        assets.loadFailures.splice(assets.loadFailures.indexOf(name), 1);
      }
    } else if (isRobot) {
      // ***** 3D ROBOT *****
      let config = parseRobot(configRaw);
      if (config === "invalid") return;
      config.path = currentPath + `assets/${encodeURIComponent(name)}/model.glb`;
      if (
        `${name}/model.glb` in assetIndex &&
        config.components.every((_, index) => `${name}/model_${index}.glb` in assetIndex)
      ) {
        assets.robots.push(config);
        assets.loadFailures.splice(assets.loadFailures.indexOf(name), 1);
      }
    } else if (isJoystick) {
      // ***** JOYSTICK *****
      let config = parseJoystick(configRaw);
      if (config === "invalid") return;
      config.path = currentPath + `assets/${encodeURIComponent(name)}/image.png`;
      if (`${name}/image.png` in assetIndex) {
        assets.joysticks.push(config);
        assets.loadFailures.splice(assets.loadFailures.indexOf(name), 1);
      }
    }
  });

  return filterAndSortAssets(assets);
}
