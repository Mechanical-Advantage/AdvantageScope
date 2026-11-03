// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  evaluateThreshold,
  HealthTile,
  healthTime,
  restoreHealthState,
  saveTile,
  thresholdOrder,
  updateLatch
} from "../src/shared/HealthStrip";

test("thresholds include boundaries and respect direction", () => {
  const tile: HealthTile = { path: "x", label: "x", direction: "high", warn: 50, critical: 60 };
  assert.equal(evaluateThreshold(49, tile), "ok");
  assert.equal(evaluateThreshold(50, tile), "warn");
  assert.equal(evaluateThreshold(60, tile), "critical");
  assert.equal(evaluateThreshold(10, { ...tile, direction: "low", warn: 25, critical: 15 }), "critical");
  const low = { ...tile, direction: "low" as const, warn: 25, critical: 15 };
  assert.equal(evaluateThreshold(26, low), "ok");
  assert.equal(evaluateThreshold(25, low), "warn");
  assert.equal(evaluateThreshold(15, low), "critical");
  assert.equal(evaluateThreshold(NaN, tile), "ok");
});
test("fault labels and latches retain the fault until acknowledged", () => {
  const tile: HealthTile = { path: "x", label: "x", direction: "high", fault: true };
  assert.equal(evaluateThreshold("Normal", tile), "ok");
  assert.equal(evaluateThreshold("Earth Fault", tile), "critical");
  const fault = { severity: "critical" as const, text: "Earth Fault" };
  const clear = { severity: "ok" as const, text: "Normal" };
  assert.deepEqual(updateLatch(fault, clear, true), fault);
  assert.deepEqual(updateLatch(undefined, clear, true), clear);
  assert.deepEqual(updateLatch(fault, clear, false), clear);
});
test("tiles use live time or disk end, never cursor time", () => {
  for (const cursor of [0, 5, 100]) {
    assert.equal(healthTime(42, 99), 42);
  }
  assert.equal(healthTime(null, 99), 99);
});
test("layout round trip and old state migration retain tiles only", () => {
  const old = {
    visible: true,
    defaultsApplied: true,
    trackside: true,
    tiles: [
      {
        path: "missing",
        label: "Temp",
        direction: "low" as const,
        warn: 25,
        critical: 15,
        profile: { unit: "%", precision: 2 },
        latch: true
      }
    ]
  };
  assert.deepEqual(restoreHealthState(JSON.parse(JSON.stringify(old))), { visible: true, tiles: old.tiles });
  assert.deepEqual(restoreHealthState(), { visible: false, tiles: [] });
});
test("draft cancellation leaves list untouched; save commits once", () => {
  const tiles: HealthTile[] = [];
  const draft: HealthTile = { path: "x", label: "x", direction: "high" };
  assert.equal(tiles.length, 0);
  saveTile(tiles, draft, draft);
  saveTile(tiles, draft, draft);
  assert.equal(tiles.length, 1);
});
test("threshold order follows direction", () => {
  const tile: HealthTile = { path: "x", label: "x", direction: "high", warn: 20, critical: 10 };
  assert.equal(thresholdOrder(tile), false);
  assert.equal(thresholdOrder({ ...tile, direction: "low" }), true);
  assert.equal(thresholdOrder({ ...tile, critical: undefined }), true);
});
