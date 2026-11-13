// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

const PREVIEW_FORMAT = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
  useGrouping: false
});

/** Formats source values with the Line Graph precision and unit suffix. */
export function formatNumericPreview(value: number, suffix = "", pluralizeSuffix = false): string {
  let output = PREVIEW_FORMAT.format(value);
  output += suffix.length > 1 ? " " : "";
  output += suffix;
  if (pluralizeSuffix && value !== 1) output += "s";
  return output;
}
