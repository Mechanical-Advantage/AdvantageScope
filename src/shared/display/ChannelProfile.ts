// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { Units } from "../units";

export interface ChannelMetadata {
  name: string;
  unit?: string | null;
  dimension?: string;
  precision?: number;
  scale?: number;
  min?: number;
  max?: number;
  enumLabels?: Record<string, string>;
}
export interface ChannelOverride {
  unit?: string;
  precision?: number;
}
export interface ChannelProfile {
  dimension?: string;
  rawUnit: string;
  unit: string;
  from: string | null;
  to: string | null;
  precision?: number;
  enumLabels?: Record<string, string>;
}
export function canonicalChannelPath(path: string): string {
  return path.replaceAll(".", "/").replace(/^\/+|\/+$/g, "");
}
export function resolveUnit(unit: string): string | null {
  if (unit in Units.ALL_UNITS) return unit;
  return Units.UNIT_SUFFIXES[unit.toLowerCase()] ?? null;
}
export function channelProfile(metadata: ChannelMetadata, override: ChannelOverride = {}): ChannelProfile {
  const rawUnit = metadata.unit ?? "";
  const from = resolveUnit(rawUnit) ?? Units.getUnitForField(metadata.name);
  let to = from;
  if (from === "kelvin") to = "celsius";
  if (from === "pascals") to = "kilopascals";
  if (from === "meters" && /shock|suspension|damper/i.test(metadata.name)) to = "millimeters";
  if (from === "ratio" && /soc|state_?of_?charge|duty|throttle|pedal/i.test(metadata.name)) to = "percent";
  if (override.unit !== undefined) {
    const requested = resolveUnit(override.unit);
    if (requested && from && Units.GROUP_BY_UNIT[requested] === Units.GROUP_BY_UNIT[from]) to = requested;
  }
  const dimension = metadata.dimension?.toLowerCase() ?? (to ? Units.GROUP_BY_UNIT[to] : "");
  const dimensionPrecision: Record<string, number> = {
    temperature: 1,
    voltage: 2,
    current: 1,
    angle: 1,
    velocity: 2,
    "angular velocity": 4,
    acceleration: 2,
    "angular acceleration": 4,
    length: to === "millimeters" ? 1 : 3,
    pressure: 1,
    torque: 1,
    power: 0,
    energy: 1,
    time: 3,
    frequency: 1
  };
  let precision: number | undefined =
    metadata.precision ??
    (to === "rotations/minute" || /rpm/i.test(metadata.name)
      ? 0
      : to === "percent"
      ? 1
      : dimensionPrecision[dimension]);
  if (precision === undefined && metadata.scale && metadata.scale < 1)
    precision = Math.ceil(-Math.log10(metadata.scale));
  precision = override.precision ?? precision;
  if (precision !== undefined) precision = Math.max(0, Math.min(12, Math.round(precision)));
  return {
    rawUnit,
    dimension,
    unit: to ? Units.ALL_UNITS[to].suffix : rawUnit,
    from,
    to,
    precision,
    enumLabels: metadata.enumLabels
  };
}
export function convertChannelValue(value: number, profile: ChannelProfile, delta = false): number {
  if (!profile.from || !profile.to) return value;
  const converted = Units.convert(value, profile.from, profile.to);
  return delta ? converted - Units.convert(0, profile.from, profile.to) : converted;
}
export function formatChannelValue(value: unknown, profile: ChannelProfile, converted = false, delta = false): string {
  if (value === null || value === undefined)
    return "—" + (profile.unit && profile.unit !== "1" ? " " + profile.unit : "");
  if (typeof value === "boolean") return String(value);
  if (typeof value !== "number") return String(value);
  if (profile.enumLabels) return profile.enumLabels[String(value)] ?? `Unknown (${value})`;
  const number = converted ? value : convertChannelValue(value, profile, delta);
  let text: string;
  if (!Number.isFinite(number)) text = String(number);
  else {
    const digits = profile.precision ?? Math.max(0, Math.min(12, 3 - Math.floor(Math.log10(Math.abs(number) || 1))));
    const rounded = profile.precision === undefined ? Number(number.toPrecision(4)) : number;
    text = (Math.abs(rounded) < 0.5 * 10 ** -digits ? 0 : rounded).toFixed(digits);
  }
  return text + (profile.unit && profile.unit !== "1" ? " " + profile.unit : "");
}
export function rawChannelValue(value: unknown, profile: ChannelProfile): string {
  if (typeof value === "string" && profile.enumLabels) {
    const entry = Object.entries(profile.enumLabels).find(([, label]) => label === value);
    if (entry) value = entry[0];
    else {
      const unknown = value.match(/^Unknown \((-?\d+(?:\.\d+)?)\)$/);
      if (unknown) value = unknown[1];
    }
  }
  return `Raw: ${String(value)}${profile.rawUnit ? " " + profile.rawUnit : ""}`;
}
