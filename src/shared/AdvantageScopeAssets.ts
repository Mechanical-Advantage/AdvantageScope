// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { Units } from "./units";

export const FRC_STANDARD_FIELD_LENGTH = Units.convert(54, "feet", "meters");
export const FRC_STANDARD_FIELD_WIDTH = Units.convert(27, "feet", "meters");
export const FTC_STANDARD_FIELD_LENGTH = Units.convert(12, "feet", "meters");
export const FTC_STANDARD_FIELD_WIDTH = Units.convert(12, "feet", "meters");

export interface AdvantageScopeAssets {
  field2ds: Config2d[];
  loadFailures: string[];
}

/**
 * All poses use a single right-handed coordinate system: origin at the center
 * of the field, +X forward, +Y left, +Z up.
 */

export interface Config2d {
  name: string;
  path: string;
  id: string;

  isFTC: boolean;
  useGrid: boolean | undefined;
  sourceUrl?: string;
  topLeft: [number, number];
  bottomRight: [number, number];
  widthInches: number;
  heightInches: number;
}

export interface Config3d_Rotation {
  axis: "x" | "y" | "z";
  degrees: number;
}
