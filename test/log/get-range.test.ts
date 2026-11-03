// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import LogField from "../../src/shared/log/LogField";
import LoggableType from "../../src/shared/log/LoggableType";
import { LegacyRange } from "./LegacyRange";

function compare(field: LogField, seed: number) {
  const old = new LegacyRange(field.toSerialized());
  let state = seed;
  const random = () => (state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 2 ** 32;
  for (let round = 0; round < 50; round++) {
    const timestamps = field.getTimestamps();
    const boundaries = [-Infinity, Infinity, NaN, -1, 0, 0.5, 1, 2, 10, ...timestamps];
    for (let query = 0; query < 100; query++) {
      const start = boundaries[Math.floor(random() * boundaries.length)];
      const end = query % 2 ? start : boundaries[Math.floor(random() * boundaries.length)];
      const uuid = query % 3 ? "reader" + (query % 4) : undefined;
      const offsets = [undefined, -100, -2, -1, 0, 1, 2, 100, 0.5, Infinity];
      const offset = offsets[Math.floor(random() * offsets.length)];
      old.data = field.toSerialized();
      assert.deepEqual(
        field.getRange(start, end, uuid, offset),
        old.getRange(start, end, uuid, offset),
        JSON.stringify({ seed, round, query, start, end, offset })
      );
    }
    // Append, overwrite and insert older data with persistent reader caches.
    field.putNumber(round + 20.25, round);
    field.putNumber(Math.floor(random() * (round + 20)), round + 100);
    field.putNumber(round + 20.25, round + 200);
    if (round % 3 === 0) field.clearBeforeTime(round + 0.5);
    assert.deepEqual(
      field.getTimestamps(),
      [...field.getTimestamps()].sort((a, b) => a - b)
    );
  }
}

test("range lookup matches the old implementation across boundaries, caches, appends and discards", () => {
  for (let seed = 1; seed <= 12; seed++) {
    const field = new LogField(LoggableType.Number);
    if (seed > 1) {
      const serialized = field.toSerialized();
      // Serialized fields and front-discard can contain duplicate timestamps.
      serialized.timestamps = seed === 2 ? [1] : [-Infinity, 0, 0, 1, 1, 2, Infinity];
      serialized.values = serialized.timestamps.map((_: number, index: number) => index);
      compare(LogField.fromSerialized(structuredClone(serialized)), seed);
    } else compare(field, seed);
  }
});

test("range results own their outer arrays and survive serialization and later writes", () => {
  const field = new LogField(LoggableType.Number);
  field.putNumber(2, 20);
  field.putNumber(0, 0);
  field.putNumber(1, 10);
  field.putNumber(1, 11);
  assert.deepEqual(field.getRange(0.5, 1.5), { timestamps: [0, 1, 2], values: [0, 11, 20] });
  const result = field.getRange(-Infinity, Infinity);
  result.timestamps.shift();
  result.values[0] = 99;
  assert.deepEqual(field.getRange(-Infinity, Infinity).values, [0, 11, 20]);
  const restored = LogField.fromSerialized(structuredClone(field.toSerialized()));
  restored.clearBeforeTime(1);
  restored.putNumber(3, 30);
  assert.deepEqual(restored.getRange(1, Infinity), { timestamps: [1, 2, 3], values: [11, 20, 30] });
});
