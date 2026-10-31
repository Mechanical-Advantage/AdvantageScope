// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/** Common FSD class IDs: blue=0, yellow=1, small orange=2, big orange=3. */
export function coneStyle(
  marker: any
): { color: { r: number; g: number; b: number; a: number }; large: boolean } | null {
  const label = String(marker.class ?? marker.class_id ?? marker.ns ?? "").toLowerCase();
  const large = label === "3" || /big|large/.test(label);
  let color;
  if (label === "0" || label.includes("blue")) color = { r: 0.05, g: 0.3, b: 1, a: 1 };
  else if (label === "1" || label.includes("yellow")) color = { r: 1, g: 0.8, b: 0, a: 1 };
  else if (label === "2" || label === "3" || label.includes("orange")) color = { r: 1, g: 0.35, b: 0, a: 1 };
  else if (/cone/.test(label) && marker.color?.a > 0) color = marker.color;
  else return null;
  return { color, large };
}
