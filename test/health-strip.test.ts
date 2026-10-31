// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultHealthTiles, evaluateThreshold, HealthTile, updateLatch } from "../src/shared/HealthStrip";

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
test("defaults match canonical mock and DBC names without raw enum duplicates", () => {
  const paths = [
    "vehicles/mur27/accumulator/state_of_charge",
    "vehicles/mur27/accumulator/temperature_max",
    "ECU/ECU_MotorTemp",
    "ECU.ECU_ECUState",
    "ECU/ECU_FaultFlags",
    "TTCS/TTCS_IMDState/raw",
    "TTCS/TTCS_IMDState"
  ];
  const tiles = defaultHealthTiles(paths);
  assert.deepEqual(
    tiles.map((t) => t.label),
    ["SoC", "Max cell temp", "Motor temp", "BMS fault", "Vehicle state"]
  );
  assert.equal(tiles[3].path, "TTCS/TTCS_IMDState");
  assert.deepEqual(defaultHealthTiles(["unrelated/temperature"]), []);
});
