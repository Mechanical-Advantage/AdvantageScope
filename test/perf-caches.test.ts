// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import test from "node:test";
import { SpatialLayers } from "../src/hub/controllers/SpatialLayers";
import Log from "../src/shared/log/Log";
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

test("incremental markers match full history including seeks, discards, lifetimes and actions", () => {
  const rand = random(42);
  const layers = new SpatialLayers();
  let log = new Log();
  let end = 0;
  for (let i = 0; i < 700; i++) {
    if (i % 101 === 0) log = new Log();
    if (i % 97 === 0) log.deleteField("m/spatial");
    end += 0.1;
    log.putRaw("m", end, new Uint8Array());
    log.setStructuredType("m", "visualization_msgs/MarkerArray");
    const markers = Array.from({ length: 3 }, () => ({
      ns: "n",
      id: Math.floor(rand() * 8),
      action: rand() < 0.06 ? 3 : rand() < 0.2 ? 2 : 0,
      header: { frame_id: "map" },
      lifetime: { sec: rand() < 0.5 ? 0 : 1 },
      pose: { position: { x: i, y: 0, z: 0 }, orientation: { w: 1, x: 0, y: 0, z: 0 } }
    }));
    log.putString("m/spatial", end, JSON.stringify({ markers }));
    if (i % 23 === 0) log.clearBeforeTime(end - 1);
    const time = rand() < 0.25 ? end - rand() * 2 : end;
    const active = new Map<string, { marker: any; stamp: number }>();
    const whole = log.getString("m/spatial", -Infinity, time)!;
    whole.timestamps.forEach((stamp, n) => {
      if (stamp > time) return;
      for (const marker of JSON.parse(whole.values[n]).markers) {
        const id = marker.ns + ":" + marker.id;
        if (marker.action === 3) active.clear();
        else if (marker.action === 2) active.delete(id);
        else active.set(id, { marker, stamp });
      }
    });
    const expected = [...active.values()]
      .filter(({ marker, stamp }) => !marker.lifetime.sec || time <= stamp + marker.lifetime.sec)
      .map(({ marker }) => [marker.id, marker.pose.position.x]);
    layers.begin(log, time);
    if (!whole.timestamps.some((stamp) => stamp <= time)) {
      assert.throws(() => layers.objects(log, "m", time, "map"), /waiting/);
      continue;
    }
    const actual = layers
      .objects(log, "m", time, "map")
      .objects.map((o: any) => [o.marker.id, o.marker.pose.translation[0]]);
    assert.deepEqual(actual, expected, `step ${i}`);
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

test("profiles and field catalogue invalidate on metadata, overrides and field changes", () => {
  const log = new Log();
  log.putNumber("v", 0, 1);
  const version = log.getFieldKeysVersion();
  const first = log.getChannelProfile("v");
  assert.equal(log.getChannelProfile("v"), first);
  log.setMetadataString("v", JSON.stringify({ unit: "m", precision: 2 }));
  assert.notEqual(log.getChannelProfile("v"), first);
  const metadataProfile = log.getChannelProfile("v");
  log.displayOverrides = { v: { precision: 4 } };
  assert.notEqual(log.getChannelProfile("v"), metadataProfile);
  log.displayOverrides = {};
  log.putNumber("other", 0, 2);
  assert.ok(log.getFieldKeysVersion() > version);
  assert.deepEqual(log.getFieldKeys(), ["v", "other"]);
  log.deleteField("other");
  assert.deepEqual(log.getFieldKeys(), ["v"]);
});
