// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import test from "node:test";
import { clipGaps, findGaps, gapThreshold, isUnresumed, PeriodStats, prepareTrace } from "../src/shared/TraceGaps";

const resumed = { t0: 0.2, v0: 2, t1: 5, v1: 5 };
test("threshold is strictly greater than max(1 second, ten median periods)", () => {
  assert.equal(gapThreshold(0.02), 1);
  assert.equal(gapThreshold(0.2), 2);
  assert.equal(gapThreshold(1), 10);
  assert.deepEqual(findGaps([0, 1], [1, 2], 1, 1), []);
  assert.equal(findGaps([0, 1.01], [1, 2], 1, 1.01).length, 1);
});
test("exact whole-log median is cached and updates for appended samples", () => {
  const stats = new PeriodStats();
  stats.update([0, 0.25, 0.5, 0.75, 5]);
  assert.equal(stats.median(), 0.25);
  stats.update([0, 0.25, 0.5, 0.75, 5]);
  assert.equal(stats.median(), 0.25);
  stats.update([0, 0.25, 0.5, 0.75, 5, 5.25, 5.5]);
  assert.equal(stats.median(), 0.25);
});
test("even median averages the middle periods; cutoff is exact", () => {
  const stats = new PeriodStats();
  stats.update([0, 1, 2.002]);
  assert.ok(stats.median()! > 1);
  assert.equal(gapThreshold(stats.median()), null);
});
test("period cache resets after truncation, replacement and inserted history", () => {
  const stats = new PeriodStats();
  stats.update([0, 0.1, 0.2]);
  stats.update([0, 0.05, 0.1, 0.2]);
  assert.equal(stats.median(), 0.05);
  stats.update([10, 12]);
  assert.equal(stats.median(), 2);
  stats.update([10]);
  assert.equal(stats.median(), null);
});
test("on-change fields opt out; a new field uses the minimum threshold", () => {
  assert.equal(gapThreshold(2), null);
  assert.equal(gapThreshold(null), 1);
  assert.ok(isUnresumed(findGaps([0], [2], gapThreshold(null)!, 0.1, true)));
});
test("zoom inside a gap keeps whole-log threshold and real bridge endpoints", () => {
  const stats = new PeriodStats();
  stats.update([0, 0.1, 0.2, 5, 5.1]);
  const gaps = findGaps([0, 0.1, 0.2, 5, 5.1], [0, 1, 2, 5, 6], gapThreshold(stats.median())!, 5.1);
  assert.deepEqual(gaps, [resumed]);
  assert.deepEqual(prepareTrace([1, 5], [2, 5], gaps), { timestamps: [5], values: [5], gapAfter: [false] });
});
test("NaN runs bridge nearest valid samples even below threshold", () => {
  assert.deepEqual(findGaps([0, 0.1, 0.2, 0.3], [1, NaN, NaN, 4], 1, 0.3), [{ t0: 0, v0: 1, t1: 0.3, v1: 4 }]);
  assert.deepEqual(findGaps([0, 0.1], [NaN, NaN], 1, 5), []);
});
test("solid segments split at gaps without a flat hold", () => {
  assert.deepEqual(prepareTrace([0, 0.1, 0.2, 1, 5, 5.1], [0, 1, 2, NaN, 5, 6], [resumed]), {
    timestamps: [0, 0.1, 0.2, 5, 5.1],
    values: [0, 1, 2, 5, 6],
    gapAfter: [false, false, true, false, false]
  });
});
test("normal streaming holds until threshold; stale/offline stops immediately", () => {
  assert.deepEqual(findGaps([0, 0.1], [1, 2], 1, 1.1), []);
  assert.ok(isUnresumed(findGaps([0, 0.1], [1, 2], 1, 0.2, true)));
  assert.ok(isUnresumed(findGaps([0, 0.1], [1, 2], 1, 1.11)));
});
test("unresumed and trailing NaN gaps have no finite bridge destination", () => {
  const gaps = findGaps([0, 0.1, 0.2], [1, 2, NaN], 1, 0.3);
  assert.ok(isUnresumed(gaps));
  assert.equal(gaps[0].t1, Infinity);
  assert.deepEqual(prepareTrace([0.1, 4], [2, 2], gaps).timestamps, [0.1]);
});
test("lap-time and distance map bridge endpoints and clip both lap boundaries", () => {
  const gap = { t0: 10, v0: 0, t1: 20, v1: 10 };
  assert.deepEqual(
    clipGaps([gap], 12, 18, (t) => t),
    [{ t0: 0, v0: 2, t1: 6, v1: 8 }]
  );
  assert.deepEqual(
    clipGaps([gap], 12, 18, (t) => t * 5),
    [{ t0: 0, v0: 2, t1: 30, v1: 8 }]
  );
  assert.deepEqual(
    clipGaps([gap], 21, 30, (t) => t),
    []
  );
});
test("unresumed gaps stay unresumed in lap coordinates", () => {
  const gaps = findGaps([10, 10.1], [1, 2], 1, 20);
  assert.ok(isUnresumed(clipGaps(gaps, 10, 15, (t) => t * 2)));
});
