// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import { coneStyle } from "../../src/shared/spatial/ConeStyle";
test("cone classes accept names, integer IDs and producer colours", () => {
  assert.equal(coneStyle({ ns: "cones_yellow" })?.color.r, 1);
  assert.equal(coneStyle({ class_id: 0 })?.color.b, 1);
  assert.equal(coneStyle({ class: 3 })?.large, true);
  assert.equal(coneStyle({ ns: "orange_small" })?.large, false);
  const color = { r: 0, g: 0.4, b: 1, a: 1 };
  assert.deepEqual(coneStyle({ ns: "cones", color })?.color, color);
  assert.equal(coneStyle({ ns: "obstacles", type: 3 }), null);
});
