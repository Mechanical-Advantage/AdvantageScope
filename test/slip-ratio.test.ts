// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import { slipRatio } from "../src/shared/laps/SlipRatio";

test("slip ratio has signed wheel/GPS semantics", () => {
  assert.equal(slipRatio(22, 20), 0.1);
  assert.equal(slipRatio(18, 20), -0.1);
  assert.equal(slipRatio(20, 20), 0);
});
test("slip is unavailable at low speed, on missing data and across outages", () => {
  for (const v of [slipRatio(1, 1), slipRatio(20, NaN), slipRatio(20, 20, 0.3), slipRatio(20, 20, 0, 0.3)])
    assert.ok(Number.isNaN(v));
});
