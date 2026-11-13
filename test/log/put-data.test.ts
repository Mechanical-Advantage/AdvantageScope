// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import Log from "../../src/shared/log/Log";

/** The insertion rules before the binary search, for a field that compresses repeated values. */
function legacyPut(data: { timestamps: number[]; values: number[] }, timestamp: number, value: number) {
  let insertIndex: number;
  if (data.timestamps.length > 0 && timestamp > data.timestamps[data.timestamps.length - 1]) {
    insertIndex = data.timestamps.length;
  } else {
    let alreadyExists = false;
    insertIndex =
      data.timestamps.findLastIndex((x) => {
        if (alreadyExists) return;
        if (x === timestamp) alreadyExists = true;
        return x < timestamp;
      }) + 1;
    if (alreadyExists) {
      data.values[data.timestamps.indexOf(timestamp)] = value;
      return;
    }
  }
  if (insertIndex > 0 && value === data.values[insertIndex - 1]) {
    // Same as the previous value
  } else if (insertIndex < data.values.length && value === data.values[insertIndex]) {
    data.timestamps[insertIndex] = timestamp;
  } else {
    data.timestamps.splice(insertIndex, 0, timestamp);
    data.values.splice(insertIndex, 0, value);
  }
}

test("out-of-order puts match the previous insertion rules", () => {
  let seed = 7;
  const random = () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
  for (let run = 0; run < 50; run++) {
    const log = new Log();
    const expected = { timestamps: [] as number[], values: [] as number[] };
    for (let i = 0; i < 400; i++) {
      const timestamp = Math.floor(random() * 300) / 4;
      const value = Math.floor(random() * 4);
      log.putNumber("/field", timestamp, value);
      legacyPut(expected, timestamp, value);
    }
    assert.deepEqual(log.getNumber("/field", -Infinity, Infinity), expected);
  }
});

test("rewriting recent values reads a bounded part of a long history", () => {
  const log = new Log();
  for (let i = 0; i < 100_000; i++) log.putNumber("/field", i / 50, i);
  const data = (log as any).fields["/field"].data;
  let reads = 0;
  data.timestamps = new Proxy(data.timestamps, {
    get(target, key, receiver) {
      if (typeof key === "string" && /^\d+$/.test(key)) reads++;
      return Reflect.get(target, key, receiver);
    }
  });
  for (let i = 99_000; i < 100_000; i++) log.putNumber("/field", i / 50, -i);
  assert.ok(reads < 100_000, `read ${reads} timestamps to rewrite 1000 values`);
  const result = log.getNumber("/field", 1999, Infinity)!;
  assert.equal(result.values.at(-1), -99_999);
  assert.equal(result.timestamps.length, 50);
});
