// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import fs from "fs";
import jsonfile from "jsonfile";
import path from "path";
import { AdvantageScopeAssets } from "../../shared/AdvantageScopeAssets";
import Preferences from "../../shared/Preferences";
import { filterAndSortAssets, parseField2d, parseField3d, parseJoystick, parseRobot } from "../assetUtil";
import { AUTO_ASSETS, BUNDLED_ASSETS, DEFAULT_USER_ASSETS, PREFS_FILENAME } from "./ElectronConstants";

const USER_ASSETS_README =
  'This folder contains extra assets for the 2D field, 3D field, and joystick views. For more details, see the "Custom Fields/Robots/Joysticks" page in the AdvantageScope documentation (available through the documentation tab in the app or the URL below).\n\nhttps://docs.advantagescope.org/more-features/custom-assets';

/** Returns the path to the user assets folder. */
export function getUserAssetsPath() {
  const prefs: Preferences = jsonfile.readFileSync(PREFS_FILENAME);
  if (prefs.userAssetsFolder === null) {
    return DEFAULT_USER_ASSETS;
  } else {
    return prefs.userAssetsFolder;
  }
}

/** Creates folders for user and automatic assets. */
export function createAssetFolders() {
  if (!fs.existsSync(AUTO_ASSETS)) {
    fs.mkdirSync(AUTO_ASSETS);
  }
  if (!fs.existsSync(DEFAULT_USER_ASSETS)) {
    fs.mkdirSync(DEFAULT_USER_ASSETS);
  }
  fs.writeFileSync(path.join(DEFAULT_USER_ASSETS, "README.txt"), USER_ASSETS_README);
}

/** Loads all current assets (bundled, auto downloaded, and user). */
export function loadAssets(): AdvantageScopeAssets {
  let assets: AdvantageScopeAssets = {
    field2ds: [],
    field3ds: [],
    robots: [],
    joysticks: [],
    loadFailures: []
  };

  // Highest priority is first
  [getUserAssetsPath(), AUTO_ASSETS, BUNDLED_ASSETS].forEach((parentFolder) => {
    if (!fs.existsSync(parentFolder)) return;
    fs.readdirSync(parentFolder, { withFileTypes: true })
      .sort((a, b) => (a.name < b.name ? 1 : a.name > b.name ? -1 : 0)) // Inverse order so newer versions take priority
      .forEach((object) => {
        if (!object.isDirectory() || object.name.startsWith(".")) return;
        assets.loadFailures.push(object.name); // Assume failure, remove if successful
        let isField2d = object.name.startsWith("Field2d_");
        let isField3d = object.name.startsWith("Field3d_");
        let isRobot = object.name.startsWith("Robot_");
        let isJoystick = object.name.startsWith("Joystick_");

        let configPath = path.join(parentFolder, object.name, "config.json");
        if (!fs.existsSync(configPath)) return;
        let configRaw: unknown;
        try {
          configRaw = jsonfile.readFileSync(configPath);
        } catch {
          return;
        }

        if (isField2d) {
          // ***** 2D FIELD *****
          let config = parseField2d(configRaw);
          if (config === "skip") {
            assets.loadFailures.splice(assets.loadFailures.indexOf(object.name), 1);
            return;
          } else if (config === "invalid") {
            return;
          }
          config.path = encodePath(path.join(parentFolder, object.name, "image.png"));
          if (fs.existsSync(decodeURIComponent(config.path))) {
            assets.field2ds.push(config);
            assets.loadFailures.splice(assets.loadFailures.indexOf(object.name), 1);
          }
        } else if (isField3d) {
          // ***** 3D FIELD *****
          let config = parseField3d(configRaw);
          if (config === "skip") {
            assets.loadFailures.splice(assets.loadFailures.indexOf(object.name), 1);
            return;
          } else if (config === "invalid") {
            return;
          }
          config.path = encodePath(path.join(parentFolder, object.name, "model.glb"));
          if (
            fs.existsSync(decodeURIComponent(config.path)) &&
            config.gamePieces.every((_, index) =>
              fs.existsSync(decodeURIComponent(config.path).slice(0, -4) + "_" + index.toString() + ".glb")
            )
          ) {
            assets.field3ds.push(config);
            assets.loadFailures.splice(assets.loadFailures.indexOf(object.name), 1);
          }
        } else if (isRobot) {
          // ***** 3D ROBOT *****
          let config = parseRobot(configRaw);
          if (config === "invalid") return;
          config.path = encodePath(path.join(parentFolder, object.name, "model.glb"));
          if (
            fs.existsSync(decodeURIComponent(config.path)) &&
            config.components.every((_, index) =>
              fs.existsSync(decodeURIComponent(config.path).slice(0, -4) + "_" + index.toString() + ".glb")
            )
          ) {
            assets.robots.push(config);
            assets.loadFailures.splice(assets.loadFailures.indexOf(object.name), 1);
          }
        } else if (isJoystick) {
          // ***** JOYSTICK *****
          let config = parseJoystick(configRaw);
          if (config === "invalid") return;
          config.path = encodePath(path.join(parentFolder, object.name, "image.png"));
          if (fs.existsSync(decodeURIComponent(config.path))) {
            assets.joysticks.push(config);
            assets.loadFailures.splice(assets.loadFailures.indexOf(object.name), 1);
          }
        }
      });
  });

  return filterAndSortAssets(assets);
}

/**
 * Encodes a path with special characters.
 */
function encodePath(pathStr: string): string {
  return pathStr
    .split(path.sep)
    .map((component, index) => {
      if (index === 0 && component.endsWith(":")) {
        // Windows drive letter
        return component;
      } else {
        return encodeURIComponent(component);
      }
    })
    .join(path.sep);
}
