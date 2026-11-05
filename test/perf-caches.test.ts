// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import test from "node:test";
import HistoryCursor from "../src/shared/log/HistoryCursor";
import Log from "../src/shared/log/Log";
import LogField from "../src/shared/log/LogField";
import LoggableType from "../src/shared/log/LoggableType";
import { PeriodStats, TraceGapCache, findGaps, gapThreshold } from "../src/shared/TraceGaps";

function random(seed: number) {
  return () => (seed = (1664525 * seed + 1013904223) >>> 0) / 2 ** 32;
}

test("incremental gaps match full history through append, discard, replacement and viewport seeks", () => {
  const rand = random(1984);
  const cache = new TraceGapCache();
  let log = new Log();
  let time = 0;
  for (let i = 0; i < 1500; i++) {
    if (i % 137 === 0) log = new Log();
    if (i % 113 === 0) log.deleteField("v");
    time += rand() < 0.1 ? 4 : rand() * 0.2;
    log.putNumber("v", time, rand() < 0.15 ? NaN : rand());
    if (i % 29 === 0) log.clearBeforeTime(time - 2);
    const edge = time + (rand() - 0.5) * 20;
    const down = rand() < 0.5;
    const whole = log.getNumber("v", -Infinity, Infinity)!;
    const stats = new PeriodStats();
    stats.update(whole.timestamps);
    const threshold = gapThreshold(stats.median());
    const expected = threshold === null ? undefined : findGaps(whole.timestamps, whole.values, threshold, edge, down);
    assert.deepEqual(cache.update(log, "v", edge, down), expected, `step ${i}`);
    assert.deepEqual(cache.update(log, "v", edge, down), expected);
  }
});

test("warm gap cache requests only the tail and invalidates same-time edits", () => {
  const log = new Log();
  for (let i = 0; i < 1000; i++) log.putNumber("v", i * 0.1, i);
  const cache = new TraceGapCache();
  cache.update(log, "v", 100);
  const getNumber = log.getNumber.bind(log);
  let copied = 0;
  log.getNumber = (...args) => {
    const result = getNumber(...args);
    copied += result?.timestamps.length ?? 0;
    return result;
  };
  for (let i = 0; i < 10; i++) cache.update(log, "v", 100);
  assert.ok(copied <= 20, `copied ${copied} samples from a stationary field`);
  log.putNumber("v", 99.9, NaN);
  const whole = getNumber("v", -Infinity, Infinity)!;
  const stats = new PeriodStats();
  stats.update(whole.timestamps);
  assert.deepEqual(
    cache.update(log, "v", 101),
    findGaps(whole.timestamps, whole.values, gapThreshold(stats.median())!, 101)
  );
});

test("profiles and field catalogue invalidate on metadata and field changes", () => {
  const log = new Log();
  log.putNumber("v", 0, 1);
  const version = log.getFieldKeysVersion();
  const first = log.getChannelProfile("v");
  assert.equal(log.getChannelProfile("v"), first);
  log.setMetadataString("v", JSON.stringify({ unit: "m", precision: 2 }));
  assert.notEqual(log.getChannelProfile("v"), first);
  const metadataProfile = log.getChannelProfile("v");
  log.displayOverrides = { v: { precision: 4 } };
  assert.equal(log.getChannelProfile("v"), metadataProfile);
  log.displayOverrides = {};
  log.putNumber("other", 0, 2);
  assert.ok(log.getFieldKeysVersion() > version);
  assert.deepEqual(log.getFieldKeys(), ["v", "other"]);
  log.deleteField("other");
  assert.deepEqual(log.getFieldKeys(), ["v"]);
});

test("live gap discard ticks copy only new samples", () => {
  const log = new Log();
  const cache = new TraceGapCache();
  for (let i = 0; i < 1000; i++) log.putNumber("v", i / 10, i);
  cache.update(log, "v", 100);
  const getNumber = log.getNumber.bind(log);
  let copied = 0;
  log.getNumber = (...args) => {
    const data = getNumber(...args);
    copied += data?.timestamps.length ?? 0;
    return data;
  };
  for (let i = 0; i < 100; i++) {
    log.putNumber("v", 100 + i / 10, i);
    log.clearBeforeTime(0.05 + i / 10);
    cache.update(log, "v", 100 + i / 10);
  }
  assert.ok(copied <= 300, `copied ${copied} samples across 100 discard ticks`);
});

test("cursor distinguishes discards from front edits, replacements and backward seeks", () => {
  let log = new Log();
  log.putNumber("v", 0, 0);
  log.putNumber("v", 1, 1);
  const cursor = new HistoryCursor();
  let resets = 0;
  const update = (time = 2) => cursor.update(log, "v", time, () => resets++);
  update();
  cursor.stamp = 1;
  for (let i = 1; i < 20; i++) {
    log.clearBeforeTime(i / 10);
    update();
  }
  assert.equal(resets, 1);
  assert.equal(cursor.stamp, 1.9);
  log.putNumber("v", -1, 4);
  update();
  assert.equal(resets, 2);
  log.clearBeforeTime(2);
  log.putNumber("v", -2, 5);
  update();
  assert.equal(resets, 3, "an edit mixed with discard must still rebuild");
  const field = new LogField(LoggableType.Number);
  field.putNumber(2, 9);
  log.setField("v", field);
  update();
  assert.equal(resets, 4);
  update(1);
  assert.equal(resets, 5);
  log = new Log();
  update();
  assert.equal(resets, 6);
});

test("gap periods, candidates and storage follow retained data through repeated discards", () => {
  const log = new Log();
  const cache = new TraceGapCache();
  const rand = random(731);
  let time = 0;
  for (let i = 0; i < 3000; i++) {
    time += rand() < 0.1 ? 3 : 0.1;
    log.putNumber("v", time, rand() < 0.3 ? NaN : i);
    // Include ticks without appends, partial first periods, and all-history discards.
    for (let tick = 0; tick < 2; tick++) {
      log.clearBeforeTime(i % 109 === 0 ? time + tick / 100 : time - 5 + tick / 100);
      const whole = log.getNumber("v", -Infinity, Infinity)!;
      const stats = new PeriodStats();
      stats.update(whole.timestamps);
      const threshold = gapThreshold(stats.median());
      const expected = threshold === null ? undefined : findGaps(whole.timestamps, whole.values, threshold, time + 2);
      assert.deepEqual(cache.update(log, "v", time + 2), expected, `step ${i}, tick ${tick}`);
      const state = cache as any;
      assert.equal(state.stats.median(), stats.median());
      assert.ok(state.timestamps.length <= 2 * whole.timestamps.length);
      assert.ok(state.stats.counts.size <= whole.timestamps.length);
    }
  }
});

test("append and discard do not invalidate catalogue or channel profiles", () => {
  const log = new Log();
  log.putNumber("v", 0, 0);
  const profile = log.getChannelProfile("v");
  const keys = log.getFieldKeys();
  const version = log.getFieldKeysVersion();
  for (let i = 1; i < 100; i++) {
    log.putNumber("v", i, i);
    log.clearBeforeTime(i - 0.5);
    assert.equal(log.getFieldKeysVersion(), version);
    assert.deepEqual(log.getFieldKeys(), keys);
    assert.equal(log.getChannelProfile("v"), profile);
  }
});

test("live retention never replays gap history at expiry ticks", (t) => {
  const log = new Log();
  const gaps = new TraceGapCache();
  const put = (i: number) => log.putNumber("v", i / 20, i);
  put(0);
  gaps.update(log, "v", 0);
  for (let i = 1; i <= 1300; i++) put(i);
  gaps.update(log, "v", 65);
  const getNumber = log.getNumber.bind(log);
  let copied = 0;
  log.getNumber = (...args) => {
    const data = getNumber(...args);
    copied += data?.timestamps.length ?? 0;
    return data;
  };
  // Run a 20 Hz producer with a 60 Hz expiry and render loop.
  for (let tick = 0; tick < 600; tick++) {
    if (tick % 3 === 0) put(1301 + tick / 3);
    const time = 65.05 + tick / 60;
    log.discardLiveData(time, 60);
    gaps.update(log, "v", time);
  }
  t.diagnostic(JSON.stringify({ gaps: copied }));
  assert.ok(copied <= 2000, `gaps copied ${copied}`);
});

test("mixed physical and logical discards keep retained range indices and held origins", () => {
  const field = new LogField(LoggableType.Number);
  for (let i = 0; i < 20; i++) field.putNumber(i, i);
  field.getNumber(2, 2, "reader");
  field.discardBeforeTime(3);
  assert.equal(field.getFirstSampleTimestamp(), 3);
  assert.deepEqual(field.getNumber(4.5, 4.5, "reader")?.values, [4, 5]);
  field.clearBeforeTime(2); // No-op must not compact or expose the discarded prefix.
  assert.equal(field.getTimestamp(0), 3);
  field.clearBeforeTime(5.5);
  assert.equal(field.getFirstSampleTimestamp(), 5);
  assert.deepEqual(field.getNumber(6.5, 6.5, "reader")?.values, [6, 7]);
  field.discardBeforeTime(15); // Compacts and resets held origin.
  assert.equal(field.getFirstSampleTimestamp(), 15);
  assert.deepEqual(field.getNumber(16.5, 16.5, "reader")?.values, [16, 17]);
  field.discardBeforeTime(30);
  field.clearBeforeTime(40);
  assert.deepEqual(field.getNumber(-Infinity, Infinity)?.values, []);
  assert.equal(field.getFirstSampleTimestamp(), undefined);
});
