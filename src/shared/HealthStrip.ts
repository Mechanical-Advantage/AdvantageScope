// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { canonicalChannelPath, ChannelOverride } from "./display/ChannelProfile";

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
  defaultsApplied: boolean;
  trackside?: boolean;
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
const defaults: [string, RegExp, "high" | "low", number?, number?, boolean?][] = [
  ["SoC", /(?:state_of_charge|(?:ennoid_|ecu_)?(?:soc|accusoc))$/, "low", 25, 15],
  ["Min cell", /(?:cell_voltage_min|(?:ennoid_)?cellvoltagemin)$/, "low", 3.3, 3.1],
  ["Max cell", /(?:cell_voltage_max|(?:ennoid_)?cellvoltagemax)$/, "high", 4.15, 4.2],
  ["Max cell temp", /(?:accumulator\/temperature_max|(?:ennoid_)?tempcellmax|ecu_accutempmax)$/, "high", 50, 60],
  ["Motor temp", /(?:motor_temperature|(?:inv_|ecu_)?motortemp)$/, "high", 90, 110],
  ["Inverter temp", /(?:module_temperature|ecu_invertertemp|inv_moduleatemp)$/, "high", 70, 85],
  ["HV pack", /(?:pack_voltage|(?:ennoid_)?packvoltage)$/, "low", 350, 320],
  [
    "BMS fault",
    /(?:bms_faults?|bms\/faultflags|ennoid_faultflags|imd_state|ttcs_imdstate)$/,
    "high",
    undefined,
    undefined,
    true
  ],
  ["Vehicle state", /(?:car_state|ecu_ecustate)$/, "high"]
];
export function defaultHealthTiles(paths: string[]): HealthTile[] {
  return defaults.flatMap(([label, pattern, direction, warn, critical, fault]) => {
    const path = paths.find((key) => !key.endsWith("/raw") && pattern.test(canonicalChannelPath(key).toLowerCase()));
    return path ? [{ path, label, direction, warn, critical, fault, latch: fault ?? false }] : [];
  });
}

/** Seconds without data from the oldest critical tile before the banner declares DATA LOST. */
export const DATA_LOST_AFTER_S = 10;

export type CarBannerState = "ok" | "partial" | "lost";

/** One shared age definition, "oldest critical": the longest time since any health tile's signal was received. */
export function bannerState(
  ages: (number | null)[],
  unknownCount: number,
  backendConnected: boolean,
  lastReceiptAgeS: number | null
): { state: CarBannerState; oldestCriticalS: number | null } {
  const known = ages.filter((age): age is number => age !== null);
  let oldest = known.length ? Math.max(...known) : null;
  if (!backendConnected && lastReceiptAgeS !== null) oldest = Math.max(oldest ?? 0, lastReceiptAgeS);
  const lost = oldest !== null ? oldest >= DATA_LOST_AFTER_S : !backendConnected;
  return { state: lost ? "lost" : unknownCount > 0 || !backendConnected ? "partial" : "ok", oldestCriticalS: oldest };
}
