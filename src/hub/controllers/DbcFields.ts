// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import LoggableType from "../../shared/log/LoggableType";
import { getOrDefault } from "../../shared/log/LogUtil";
import { SourceListState, SourceListTypeConfig } from "../../shared/SourceListConfig";
import { Units } from "../../shared/units";

/** A source list type that takes one numeric field for a slot. */
export function numberSlot(key: string, display: string, symbol: string, invert = false): SourceListTypeConfig {
  return {
    key: key,
    display: display,
    symbol: symbol,
    showInTypeName: true,
    color: "#000000",
    darkColor: "#ffffff",
    sourceTypes: ["Number"],
    showDocs: true,
    options: invert
      ? [
          {
            key: "invert",
            display: "Invert",
            showInTypeName: true,
            values: [
              { key: "normal", display: "Normal" },
              { key: "inverted", display: "Inverted" }
            ]
          }
        ]
      : [],
    previewType: null
  };
}

/** Reads only the visible source assigned to a slot, including its saved sign option. */
export function sourceNumberAt(
  sources: SourceListState,
  slot: string,
  time: number,
  unit: string,
  uuid: string
): number | null {
  const source = sources.find((source) => source.type === slot && source.visible);
  const value = numberAt(source?.logKey, time, unit, uuid);
  return value === null ? null : value * (source?.options.invert === "inverted" ? -1 : 1);
}

/**
 * Reads a numeric field at `time` in `unit`, the unit its DBC signal uses. A field logged in another unit
 * of the same group, such as radians from the live API, is converted. Returns null without a finite value.
 */
export function numberAt(key: string | undefined, time: number, unit: string, uuid: string): number | null {
  if (key === undefined) return null;
  const value = getOrDefault(window.log, key, LoggableType.Number, time, null, uuid);
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const from = window.log.getUnit(key);
  if (from === null || Units.GROUP_BY_UNIT[from] === undefined || from === unit) return value;
  if (Units.GROUP_BY_UNIT[from] !== Units.GROUP_BY_UNIT[unit]) return null;
  return Units.convert(value, from, unit);
}
