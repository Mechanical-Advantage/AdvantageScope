// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  formatSignedSeconds,
  heldValueAt,
  niceTicks,
  sectorDeltaText,
  sectorDeltas
} from "../src/shared/laps/LapAnalysis";

test("nice ticks land on round numbers", () => {
  assert.deepEqual(niceTicks(-4.3, 2.4, 4), [-4, -2, 0, 2]);
  assert.deepEqual(niceTicks(-0.05, 0.31, 4), [0, 0.1, 0.2, 0.3]);
  assert.deepEqual(niceTicks(0, 100, 4), [0, 50, 100]);
  assert.deepEqual(niceTicks(NaN, 1), []);
});
test("signed seconds carry sign and unit", () => {
  assert.equal(formatSignedSeconds(1.2), "+1.20 s");
  assert.equal(formatSignedSeconds(-0.3), "-0.30 s");
  assert.equal(formatSignedSeconds(0.001), "0.00 s");
  assert.equal(formatSignedSeconds(NaN), "—");
});
test("sector deltas are lap minus reference", () => {
  assert.deepEqual(
    sectorDeltas([10, 21.2], [10, 20]).map((d) => Number(d.toFixed(6))),
    [0, 1.2]
  );
  assert.equal(sectorDeltaText([10.5, 19.7], [10, 20]), "S1 +0.50 s · S2 -0.30 s");
  assert.ok(Number.isNaN(sectorDeltas([1, 2], [1])[1]));
});
test("held value is stepped, never interpolated", () => {
  const xs = [0, 1, 2];
  const vs = [10, 20, 30];
  assert.equal(heldValueAt(xs, vs, 1.9), 20);
  assert.equal(heldValueAt(xs, vs, 2), 30);
  assert.equal(heldValueAt(xs, vs, 5), 30);
  assert.ok(Number.isNaN(heldValueAt(xs, vs, -1)));
});
