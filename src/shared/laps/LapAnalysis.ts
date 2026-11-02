// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/** Nice-number tick values covering [min, max], aiming for about `target` ticks (steps of 1, 2 or 5 x 10^n). */
export function niceTicks(min: number, max: number, target = 4): number[] {
  if (!isFinite(min) || !isFinite(max)) return [];
  if (max < min) [min, max] = [max, min];
  const span = max - min || 1;
  const raw = span / Math.max(1, target);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step - 1e-9); v * step <= max + step * 1e-9; v++) {
    ticks.push(Number((v * step).toPrecision(12)) + 0);
  }
  return ticks;
}

/** Signed time with an explicit sign and unit, e.g. +1.20 s. The one place a leading + is allowed. */
export function formatSignedSeconds(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const text = Math.abs(value).toFixed(2);
  return `${value > 0 && Number(text) !== 0 ? "+" : value < 0 && Number(text) !== 0 ? "-" : ""}${text} s`;
}

/** Per-sector gain/loss of a lap against the reference. Positive means slower. */
export function sectorDeltas(lap: number[], reference: number[]): number[] {
  return lap.map((t, i) => (i < reference.length ? t - reference[i] : NaN));
}

/** "S1 +0.10 s · S2 -0.30 s"; sectors with no time show a dash. */
export function sectorDeltaText(lap: number[], reference: number[]): string {
  return sectorDeltas(lap, reference)
    .map((d, i) => `S${i + 1} ${formatSignedSeconds(d)}`)
    .join(" · ");
}

/** Value held at x (stepped lookup, no interpolation). NaN before the first sample. */
export function heldValueAt(xs: number[], values: number[], x: number): number {
  let lo = 0,
    hi = xs.length - 1,
    found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] <= x) {
      found = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return found < 0 ? NaN : values[found];
}
