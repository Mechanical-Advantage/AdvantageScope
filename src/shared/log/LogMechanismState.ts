// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { Rotation2d, Translation2d } from "../geometry";
import { Units } from "../units";
import { jsonCopy } from "../util";
import Log from "./Log";
import LogFieldTree from "./LogFieldTree";
import { getOrDefault } from "./LogUtil";
import LoggableType from "./LoggableType";

/** Represents the state of a 2D mechanism at a point in time. */
export type MechanismState = {
  backgroundColor: string;
  dimensions: [number, number];
  lines: MechanismLine[];
};

/** Represents a single line segment of a mechanism. */
export type MechanismLine = {
  start: Translation2d;
  end: Translation2d;
  color: string;
  weight: number;
};

/** Extracts the mechanism state from the log at a given time. */
export function getMechanismState(log: Log, key: string, time: number): MechanismState | null {
  // Get general config
  let backgroundColor = getOrDefault(log, key + "/backgroundColor", LoggableType.String, time, null);
  let dimensions = getOrDefault(log, key + "/dims", LoggableType.NumberArray, time, null);
  if (backgroundColor === null || dimensions === null) {
    return null;
  }

  // Get all lines
  let lines: MechanismLine[] = [];
  try {
    // Add a line and children recursively
    let addLine = (lineTree: LogFieldTree, startTranslation: Translation2d, startRotation: Rotation2d) => {
      let angle = getOrDefault(
        log,
        key! + "/" + lineTree.children["angle"].fullKey,
        LoggableType.Number,
        time,
        0
      ) as number;
      let length = getOrDefault(
        log,
        key! + "/" + lineTree.children["length"].fullKey,
        LoggableType.Number,
        time,
        0
      ) as number;
      let color = getOrDefault(
        log,
        key! + "/" + lineTree.children["color"].fullKey,
        LoggableType.String,
        time,
        0
      ) as string;
      let weight = getOrDefault(
        log,
        key! + "/" + lineTree.children["weight"].fullKey,
        LoggableType.Number,
        time,
        0
      ) as number;

      let endRotation = startRotation + Units.convert(angle, "degrees", "radians");
      let endTranslation: Translation2d = [
        startTranslation[0] + Math.cos(endRotation) * length,
        startTranslation[1] + Math.sin(endRotation) * length
      ];
      lines.push({
        start: startTranslation,
        end: endTranslation,
        color: color,
        weight: weight
      });
      for (let [childKey, childTree] of Object.entries(lineTree.children)) {
        if ([".type", "angle", "color", "length", "weight"].includes(childKey)) continue;
        addLine(childTree, endTranslation, endRotation);
      }
    };

    // Find all roots and add children
    for (let [mechanismChildKey, mechanismChildTree] of Object.entries(log.getFieldTree(true, key + "/"))) {
      if (
        mechanismChildKey.startsWith(".") ||
        mechanismChildKey === "backgroundColor" ||
        mechanismChildKey === "dims"
      ) {
        continue;
      }

      let translation: Translation2d = Object.keys(mechanismChildTree.children).includes("position")
        ? getOrDefault(
            log,
            key + "/" + mechanismChildTree.children["position"].fullKey!,
            LoggableType.NumberArray,
            time,
            [0, 0]
          )
        : [
            getOrDefault(log, key + "/" + mechanismChildTree.children["x"].fullKey!, LoggableType.Number, time, 0),
            getOrDefault(log, key + "/" + mechanismChildTree.children["y"].fullKey!, LoggableType.Number, time, 0)
          ];
      for (let [rootChildKey, rootChildTree] of Object.entries(mechanismChildTree.children)) {
        if (rootChildKey === "x" || rootChildKey === "y" || rootChildKey === "position") continue;
        addLine(rootChildTree, translation, 0.0);
      }
    }
  } catch {
    console.error("Failed to parse mechanism data");
  }

  // Return result
  return {
    backgroundColor: backgroundColor,
    dimensions: dimensions,
    lines: lines
  };
}

/** Merges multiple mechanism states into a single state. */
export function mergeMechanismStates(states: MechanismState[]): MechanismState {
  let newWidth = Math.max(...states.map((state) => state.dimensions[0]));
  let newHeight = Math.max(...states.map((state) => state.dimensions[1]));

  let lines: MechanismLine[] = [];
  states.forEach((state) => {
    let xOffset = (newWidth - state.dimensions[0]) / 2;
    state.lines.forEach((line) => {
      let newLine = jsonCopy(line);
      newLine.start[0] += xOffset;
      newLine.end[0] += xOffset;
      lines.push(newLine);
    });
  });

  return {
    backgroundColor: states[0].backgroundColor,
    dimensions: [newWidth, newHeight],
    lines: lines
  };
}
