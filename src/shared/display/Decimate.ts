// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Min/max/mean decimation of a time series into pixel columns, so high-rate data draws as a faint
// envelope plus a mean line instead of an aliased solid block.

export type Column = { x: number; min: number; max: number; mean: number };

/**
 * Collapse samples into one entry per device-pixel column.
 * @param xs sample positions (ascending)
 * @param vs sample values (NaN is skipped)
 * @param toX maps a position to a device pixel x (may be fractional)
 * @param left first visible device pixel
 * @param right last visible device pixel
 * @param smooth moving-average window in columns for the mean line (<= 1 disables)
 */
export function decimateColumns(
  xs: number[],
  vs: number[],
  toX: (x: number) => number,
  left: number,
  right: number,
  smooth = 0
): Column[] {
  const cols: Column[] = [];
  let sum = 0,
    count = 0,
    current: Column | null = null;
  const flush = () => {
    if (current && count) {
      current.mean = sum / count;
      cols.push(current);
    }
    current = null;
    sum = 0;
    count = 0;
  };
  for (let i = 0; i < xs.length; i++) {
    const v = vs[i];
    if (!Number.isFinite(v)) continue;
    const px = Math.floor(toX(xs[i]));
    if (px < left - 1) continue;
    if (px > right + 1) break;
    if (current && current.x !== px) flush();
    if (!current) current = { x: px, min: v, max: v, mean: v };
    if (v < current.min) current.min = v;
    if (v > current.max) current.max = v;
    sum += v;
    count++;
  }
  flush();
  if (smooth > 1 && cols.length > 1) {
    const half = Math.floor(smooth / 2);
    const means = cols.map((c) => c.mean);
    let lo = 0,
      hi = 0,
      total = 0;
    cols.forEach((c, i) => {
      while (hi < cols.length && cols[hi].x <= c.x + half) total += means[hi++];
      while (cols[lo].x < c.x - half) total -= means[lo++];
      c.mean = total / (hi - lo);
    });
  }
  return cols;
}

/** True when the series has more than ~2 samples per pixel column across the visible span. */
export function isDense(count: number, widthPx: number): boolean {
  return count > widthPx * 2;
}
