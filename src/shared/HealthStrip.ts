// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { ChannelOverride } from "./display/ChannelProfile";

export type Severity = "ok" | "warn" | "critical";
export interface HealthTile {
  path: string;
  label: string;
  direction: "high" | "low";
  warn?: number;
  critical?: number;
  fault?: boolean;
  latch?: boolean;
  profile?: ChannelOverride;
}
export interface HealthStripState {
  visible: boolean;
  tiles: HealthTile[];
}
export function evaluateThreshold(value: unknown, tile: HealthTile): Severity {
  if (tile.fault) {
    if (typeof value === "number") return value === 0 ? "ok" : "critical";
    if (typeof value === "boolean") return value ? "critical" : "ok";
    return /^(normal|none|no faults?|ok|0)$/i.test(String(value)) ? "ok" : "critical";
  }
  if (typeof value !== "number" || !Number.isFinite(value)) return "ok";
  const crosses = (limit?: number) =>
    limit !== undefined && (tile.direction === "high" ? value >= limit : value <= limit);
  return crosses(tile.critical) ? "critical" : crosses(tile.warn) ? "warn" : "ok";
}
export interface LatchedHealth {
  severity: Severity;
  text: string;
}
export function updateLatch(
  previous: LatchedHealth | undefined,
  current: LatchedHealth,
  enabled: boolean
): LatchedHealth {
  const rank = { ok: 0, warn: 1, critical: 2 };
  return enabled && previous && rank[previous.severity] > 0 && rank[previous.severity] >= rank[current.severity]
    ? previous
    : current;
}

/** Tiles deliberately have no cursor input. Disk logs use their final sample. */
export function healthTime(live: number | null, end: number): number {
  return live ?? end;
}
export function thresholdOrder(tile: HealthTile): boolean {
  return (
    tile.warn === undefined ||
    tile.critical === undefined ||
    (tile.direction === "high" ? tile.warn <= tile.critical : tile.warn >= tile.critical)
  );
}
/** Drop retired state flags, retaining every saved tile and display override. */
export function restoreHealthState(state?: HealthStripState): HealthStripState {
  return { visible: state?.visible ?? false, tiles: structuredClone(state?.tiles ?? []) };
}
export function saveTile(tiles: HealthTile[], tile: HealthTile, changes: HealthTile): void {
  Object.assign(tile, changes);
  if (!tiles.includes(tile)) tiles.push(tile);
}
