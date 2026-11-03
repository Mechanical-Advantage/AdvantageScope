// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import test from "node:test";
import { SpatialLayers } from "../src/hub/controllers/SpatialLayers";
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

test("incremental markers preserve observed events across discards, with seeks, lifetimes and actions", () => {
  const rand = random(42);
  const layers = new SpatialLayers();
  let log = new Log();
  let end = 0;
  let previousLog: Log | null = null;
  let previousField: unknown;
  let previousTime = -Infinity;
  const active = new Map<string, { marker: any; stamp: number }>();
  const seen = new Set<string>();
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
    const field = log.getField("m/spatial");
    if (log !== previousLog || field !== previousField || time < previousTime) {
      active.clear();
      seen.clear();
    }
    previousLog = log;
    previousField = field;
    previousTime = time;
    const whole = log.getString("m/spatial", -Infinity, time)!;
    whole.timestamps.forEach((stamp, n) => {
      if (stamp > time || seen.has(whole.values[n])) return;
      // Observed ADDs survive retention, as in RViz; only seeks/replacements replay retained history.
      seen.add(whole.values[n]);
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

for (const type of ["visualization_msgs/MarkerArray", "geometry_msgs/PoseStamped"]) {
  test(`live ${type} discard ticks copy only new samples`, () => {
    const log = new Log();
    const layers = new SpatialLayers();
    const put = (i: number) => {
      log.putRaw("m", i / 100, new Uint8Array());
      log.setStructuredType("m", type);
      log.putString(
        "m/spatial",
        i / 100,
        JSON.stringify({
          header: { frame_id: "map" },
          markers: [
            { ns: "n", id: i, header: { frame_id: "map" }, pose: { position: { x: i }, orientation: { w: 1 } } }
          ],
          pose: { position: { x: i }, orientation: { w: 1 } }
        })
      );
    };
    for (let i = 0; i < 1000; i++) put(i);
    layers.begin(log, 9.99);
    layers.objects(log, "m", 9.99, "map");
    const getString = log.getString.bind(log);
    let copied = 0;
    log.getString = (...args) => {
      const data = getString(...args);
      if (args[0] === "m/spatial") copied += data?.timestamps.length ?? 0;
      return data;
    };
    for (let i = 1000; i < 1020; i++) {
      put(i);
      log.clearBeforeTime((i - 999.5) / 100);
      layers.begin(log, i / 100);
      layers.objects(log, "m", i / 100, "map");
    }
    assert.ok(copied <= 100, `copied ${copied} samples across 20 discard ticks`);
  });
}

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

test("marker ADDs survive discard with original lifetimes, until DELETE or DELETEALL", () => {
  const log = new Log();
  const layers = new SpatialLayers();
  const put = (time: number, markers: any[]) => {
    log.putRaw("m", time, new Uint8Array());
    log.setStructuredType("m", "visualization_msgs/MarkerArray");
    log.putString("m/spatial", time, JSON.stringify({ markers }));
  };
  const add = (id: number, sec = 0) => ({
    id,
    header: { frame_id: "map" },
    lifetime: { sec },
    pose: { position: { x: 0, y: 0, z: 0 }, orientation: { w: 1 } }
  });
  const ids = (time: number) => {
    layers.begin(log, time);
    return layers.objects(log, "m", time, "map").objects.map((o: any) => o.marker.id);
  };
  put(0, [add(1), add(2, 2)]);
  assert.deepEqual(ids(0), [1, 2]);
  put(1, [add(3)]);
  ids(1);
  log.clearBeforeTime(1.5);
  assert.deepEqual(ids(1.5), [1, 2, 3]);
  log.clearBeforeTime(2.5);
  assert.deepEqual(ids(2.5), [1, 3]);
  put(3, [{ id: 1, action: 2 }]);
  assert.deepEqual(ids(3), [3]);
  put(4, [{ action: 3 }]);
  assert.deepEqual(ids(4), []);
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

test("mixed live retention never replays marker, trail or gap history at expiry ticks", (t) => {
  const log = new Log();
  const layers = new SpatialLayers();
  const gaps = new TraceGapCache();
  const put = (i: number) => {
    const time = i / 20;
    for (const [key, type] of [
      ["m", "visualization_msgs/MarkerArray"],
      ["p", "geometry_msgs/PoseStamped"]
    ]) {
      log.putRaw(key, time, new Uint8Array([i % 256]));
      log.setStructuredType(key, type);
      log.putLazyString(key + "/spatial", time, () =>
        JSON.stringify({
          header: { frame_id: "map" },
          markers:
            i === 0
              ? [
                  {
                    id: 1,
                    header: { frame_id: "map" },
                    pose: { position: { x: 0, y: 0, z: 0 }, orientation: { w: 1 } }
                  }
                ]
              : [],
          pose: { position: { x: i }, orientation: { w: 1 } }
        })
      );
    }
    log.putNumber("v", time, i);
  };
  put(0);
  for (const key of ["m", "m/spatial", "p", "p/spatial"]) log.setLiveRetention(key, 60);
  const render = (time: number) => {
    layers.begin(log, time);
    layers.objects(log, "m", time, "map");
    layers.objects(log, "p", time, "map");
    gaps.update(log, "v", time);
  };
  render(0);
  for (let i = 1; i <= 1300; i++) put(i);
  render(65);
  const getString = log.getString.bind(log);
  const getNumber = log.getNumber.bind(log);
  const copied = { markers: 0, trails: 0, gaps: 0 };
  log.getString = (...args) => {
    const data = getString(...args);
    if (args[0] === "m/spatial") copied.markers += data?.timestamps.length ?? 0;
    if (args[0] === "p/spatial") copied.trails += data?.timestamps.length ?? 0;
    return data;
  };
  log.getNumber = (...args) => {
    const data = getNumber(...args);
    copied.gaps += data?.timestamps.length ?? 0;
    return data;
  };
  // 20 Hz producer, 60 Hz expiry/render loop. Numeric telemetry uses clearBeforeTime.
  for (let tick = 0; tick < 600; tick++) {
    if (tick % 3 === 0) put(1301 + tick / 3);
    const time = 65.05 + tick / 60;
    log.discardLiveData(time, 60);
    render(time);
  }
  t.diagnostic(JSON.stringify(copied));
  assert.ok(copied.markers <= 2000, `markers copied ${copied.markers}`);
  assert.ok(copied.trails <= 2000, `trails copied ${copied.trails}`);
  assert.ok(copied.gaps <= 2000, `gaps copied ${copied.gaps}`);
  // With all message history expired, observed markers still obey lifetime and actions.
  log.discardLiveData(200, 60);
  layers.begin(log, 200);
  assert.equal(layers.objects(log, "m", 200, "map").objects.length, 1);
  // Empty retained history followed by an append is still the same observed marker stream.
  layers.begin(log, 200.5);
  layers.objects(log, "m", 200.5, "map");
  log.putString(
    "m/spatial",
    201,
    JSON.stringify({
      markers: [{ id: 2, header: { frame_id: "map" }, pose: { position: { x: 0, y: 0, z: 0 }, orientation: { w: 1 } } }]
    })
  );
  layers.begin(log, 201);
  assert.equal(layers.objects(log, "m", 201, "map").objects.length, 2);
  log.putString("m/spatial", 201.5, JSON.stringify({ markers: [{ id: 2, action: 2 }] }));
  layers.begin(log, 201.5);
  assert.equal(layers.objects(log, "m", 201.5, "map").objects.length, 1);
  log.putString("m/spatial", 202, JSON.stringify({ markers: [{ action: 3 }] }));
  layers.begin(log, 202);
  assert.equal(layers.objects(log, "m", 202, "map").objects.length, 0);
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
