// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Log from "../../../shared/log/Log";

/**
 * Parses a non-numeric cell the way AdvantageScope's CSV export writes values: "(empty)" and
 * "aa-bb-cc" raw bytes, "[a; b]" arrays and JSON. Anything else is stored as a string.
 */
export function parseLegacyEntry(log: Log, timestamp: number, key: string, valueRaw: string) {
  // Try to parse empty raw
  if (valueRaw == "(empty)") {
    log.putRaw(key, timestamp, new Uint8Array());
    return;
  }

  // Try to parse populated raw
  // Note that this will only match if there are at least two bytes - we will just
  // parse it as a normal number if there is only one byte (and it that fails,
  // we will try to parse a single byte)
  if (/^([0123456789abcdef]{2}-)+[0123456789abcdef]{2}(-\.\.\.)?$/.test(valueRaw)) {
    const valueSplit = valueRaw.split("-");

    // Remove "..." added if raw is too long
    if (valueSplit.at(-1) === "...") {
      valueSplit.pop();
    }
    log.putRaw(key, timestamp, Uint8Array.from(valueSplit.map((value) => Number.parseInt(value, 16))));
    return;
  }

  // Try to parse an array
  if (valueRaw.startsWith("[") && valueRaw.endsWith("]")) {
    try {
      let value = valueRaw.slice(1, -1).split("; ");

      // If there is a single empty element, clear it
      if (value.length === 1 && value[0].length === 0) {
        value = [];
      }

      // Remove "..." added if array is too long
      if (value.at(-1) === "...") {
        value.pop();
      }

      // Now we can parse each value
      log.putUnknownStruct(
        key,
        timestamp,
        value.map((item) => JSON.parse(item)),
        true
      );
      return;
    } catch {}
  }

  // Otherwise, try to parse via JSON (objects and quoted strings)
  if (valueRaw.startsWith("{") || valueRaw.startsWith('"')) {
    try {
      log.putUnknownStruct(key, timestamp, JSON.parse(valueRaw), true);
      return;
    } catch {}
  }

  // Plain string
  log.putString(key, timestamp, valueRaw);
}
