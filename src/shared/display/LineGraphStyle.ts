// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { Units } from "../units";
import { ChannelProfile } from "./ChannelProfile";

export function splitLegendName(path: string) {
  const parts = path.split(/[/.]/);
  return { leaf: parts.pop() ?? path, parent: parts.join("/") };
}
export function middleEllipsis(text: string, limit = 48): string {
  if (text.length <= limit) return text;
  const half = Math.floor((limit - 1) / 2);
  return text.slice(0, half) + "…" + text.slice(-half);
}
export function traceDash(index: number): number[] {
  return [[], [8, 4], [2, 4]][index % 3];
}
export function compatibleProfiles(a: ChannelProfile, b: ChannelProfile): boolean {
  if (a.dimension && b.dimension && a.dimension !== b.dimension) return false;
  if (a.from && b.from) return Units.GROUP_BY_UNIT[a.from] === Units.GROUP_BY_UNIT[b.from];
  return !a.rawUnit || !b.rawUnit || a.rawUnit === b.rawUnit;
}
