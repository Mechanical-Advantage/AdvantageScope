// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export function splitLegendName(path: string) {
  const parts = path.split(/[/.]/);
  return { leaf: parts.pop() ?? path, parent: parts.join("/") };
}
export function middleEllipsis(text: string, limit = 48): string {
  if (text.length <= limit) return text;
  const half = Math.floor((limit - 1) / 2);
  return text.slice(0, half) + "…" + text.slice(-half);
}
