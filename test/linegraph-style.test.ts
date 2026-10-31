// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import { channelProfile } from "../src/shared/display/ChannelProfile";
import { compatibleProfiles, middleEllipsis, splitLegendName, traceDash } from "../src/shared/display/LineGraphStyle";
import { Units } from "../src/shared/units";

test("drop compatibility accepts conversions and rejects different dimensions", () => {
  const profile = (unit: string) => channelProfile({ name: "signal", unit });
  assert.equal(compatibleProfiles(profile("m/s"), profile("km/h")), true);
  assert.equal(Units.convert(36, profile("km/h").from!, profile("m/s").from!), 10);
  assert.equal(compatibleProfiles(profile("A"), profile("V")), false);
  assert.equal(compatibleProfiles(profile("custom"), profile("other")), false);
});
test("legend preserves the full leaf and abbreviates only the parent", () => {
  assert.deepEqual(splitLegendName("bus1/INVERTER/INV_MotorSpeedRPM"), {
    leaf: "INV_MotorSpeedRPM",
    parent: "bus1/INVERTER"
  });
  assert.deepEqual(splitLegendName("Speed"), { leaf: "Speed", parent: "" });
  assert.equal(middleEllipsis("abcdefghijklmno", 9), "abcd…lmno");
});
test("dash assignment cycles solid dashed dotted", () => {
  assert.deepEqual([0, 1, 2, 3].map(traceDash), [[], [8, 4], [2, 4], []]);
});
