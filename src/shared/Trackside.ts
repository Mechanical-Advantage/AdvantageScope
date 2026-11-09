// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import type { Freshness, LiveStatusSummary } from "../hub/dataSources/LiveStatus";
import { classifyDBCFault, DBCFaultDefinition, Severity } from "./DBCFault";
import { ChannelProfile, convertChannelValue, formatChannelValue } from "./display/ChannelProfile";

export type Limits = { low?: number; high?: number };
export type TracksideTile = {
  label: string;
  text: string;
  unit: string;
  state: string;
  severity: Severity;
  freshness: Freshness | null;
  age: number | null;
};

export function dbcDefinition(metadataString: string, path: string): DBCFaultDefinition | null {
  if (path.endsWith("/raw")) return null;
  try {
    const metadata = JSON.parse(metadataString);
    if (!metadata.dbcSignal) return null;
    const def = { name: metadata.dbcSignal, values: metadata.values ?? metadata.enumLabels, comment: metadata.comment };
    return classifyDBCFault(def, 0) ? def : null;
  } catch {
    return null;
  }
}

export function tileState(
  path: string,
  value: unknown,
  profile: ChannelProfile,
  limits: Limits = {},
  definition: DBCFaultDefinition | null = null,
  live?: { summary: LiveStatusSummary; freshness: Freshness | null; age: number | null }
): TracksideTile {
  const fault = definition ? classifyDBCFault(definition, value) : null;
  const numeric = typeof value === "number" ? convertChannelValue(value, profile) : NaN;
  const violation = numeric < (limits.low ?? -Infinity) || numeric > (limits.high ?? Infinity);
  const available =
    !live || (live.summary.backend === "connected" && live.summary.hasFreshData && live.freshness === "online");
  const severity = !available
    ? "ok"
    : violation
    ? "critical"
    : fault?.severity === "unknown"
    ? "ok"
    : fault?.severity ?? "ok";
  const age = live?.age ?? null;
  const ageText = age === null ? "" : ` ${age.toFixed(1)} s`;
  let state = severity === "critical" ? "Alarm" : severity === "warn" ? "Warning" : "";
  if (live) {
    if (live.summary.backend !== "connected") state = "⊘ link lost";
    else if (live.freshness === "stale") state = `◇${ageText}`;
    else if (live.freshness === "offline") state = `⊘ offline${ageText}`;
    else if (live.freshness === "unknown" || live.freshness === null) state = "?";
  }
  return {
    label: path.split("/").pop() || path,
    text: value === undefined ? "—" : fault?.label ?? formatChannelValue(value, { ...profile, unit: "" }),
    unit:
      value !== undefined && typeof value === "number" && !fault && !profile.enumLabels && profile.unit !== "1"
        ? profile.unit
        : "",
    state,
    severity,
    freshness: live?.freshness ?? null,
    age
  };
}

export function alertLine(
  items: { tile: TracksideTile; value: unknown; profile: ChannelProfile; limits?: Limits; fault?: boolean }[]
) {
  const alarms = items.filter(({ tile }) => tile.severity !== "ok");
  return {
    severity: alarms.some(({ tile }) => tile.severity === "critical") ? "critical" : "warn",
    text: alarms
      .map(({ tile, value, profile, limits, fault }) => {
        if (fault) return `${tile.text} · ${tile.label}`;
        const above = typeof value === "number" && convertChannelValue(value, profile) > (limits?.high ?? Infinity);
        return `${tile.label} ${tile.text}${tile.unit ? " " + tile.unit : ""}, ${above ? "above" : "below"} ${
          above ? limits?.high : limits?.low
        }`;
      })
      .join("   ·   ")
  };
}
