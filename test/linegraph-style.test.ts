// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import { middleEllipsis, splitLegendName } from "../src/shared/display/LineGraphStyle";

test("legend preserves the full leaf and abbreviates only the parent", () => {
  assert.deepEqual(splitLegendName("bus1/INVERTER/INV_MotorSpeedRPM"), {
    leaf: "INV_MotorSpeedRPM",
    parent: "bus1/INVERTER"
  });
  assert.deepEqual(splitLegendName("Speed"), { leaf: "Speed", parent: "" });
  assert.equal(middleEllipsis("abcdefghijklmno", 9), "abcd…lmno");
});
