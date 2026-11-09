// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import { SegmentTracker } from "../../src/hub/dataSources/mur/MURSegments.ts";

const SPEED = "vehicles/mur27/dynamics/vehicle_speed";
const SOC = "vehicles/mur27/accumulator/state_of_charge";

test("monotonic data stays in one segment, out-of-order samples are accepted", () => {
  const tracker = new SegmentTracker();
  assert.equal(tracker.observe(SPEED, "a", 0, 0.0), "accept");
  assert.equal(tracker.observe(SPEED, "a", 2, 0.04), "accept");
  assert.equal(tracker.observe(SPEED, "a", 1, 0.02), "accept");
  assert.equal(tracker.getSegmentIndex(), 0);
});

test("a backward jump with a new stream_id starts a new segment and the old stream is retired", () => {
  const tracker = new SegmentTracker();
  tracker.observe(SPEED, "telemetry-can-1", 5000, 100);
  tracker.observe(SOC, "ennoid-bms-1", 100, 100);

  assert.equal(tracker.observe(SPEED, "telemetry-can-2", 0, 0.02), "new-segment");
  tracker.startNewSegment();
  assert.equal(tracker.observe(SPEED, "telemetry-can-2", 0, 0.02), "accept");
  assert.equal(tracker.getSegmentIndex(), 1);

  // Late pre-reset samples from any old stream are dropped, not mixed into the new run
  assert.equal(tracker.observe(SPEED, "telemetry-can-1", 5001, 100.02), "drop");
  assert.equal(tracker.observe(SOC, "ennoid-bms-1", 101, 101), "drop");
  assert.equal(tracker.acceptHistory("ennoid-bms-1"), false);

  // Other paths moving to their new streams don't start further segments
  assert.equal(tracker.observe(SOC, "ennoid-bms-2", 0, 0.5), "accept");
  assert.equal(tracker.getSegmentIndex(), 1);
});

test("same stream, time rewound with seq moving forwards: new segment", () => {
  const tracker = new SegmentTracker();
  tracker.observe(SPEED, "a", 10, 50);
  assert.equal(tracker.observe(SPEED, "a", 11, 0.1), "new-segment");
});

test("small backward jitter within tolerance is not a reset", () => {
  const tracker = new SegmentTracker(1);
  tracker.observe(SPEED, "a", 10, 50);
  assert.equal(tracker.observe(SPEED, "a", 11, 49.5), "accept");
});

test("unix domain: a producer restart with time moving forwards stays in the segment", () => {
  const tracker = new SegmentTracker();
  tracker.observe(SOC, "bms-boot-1", 100, 3600);
  assert.equal(tracker.observe(SOC, "bms-boot-2", 0, 3610), "accept");
  assert.equal(tracker.getSegmentIndex(), 0);
  // ... but a new stream that jumps backwards does start one
  assert.equal(tracker.observe(SOC, "bms-boot-3", 0, 10), "new-segment");
});

test("untrusted (receive-time fallback) samples never trigger a backward-jump segment", () => {
  const tracker = new SegmentTracker();
  tracker.observe(SOC, "bms", 10, 50, false);
  assert.equal(tracker.observe(SOC, "bms", 11, 45, false), "accept");
});
