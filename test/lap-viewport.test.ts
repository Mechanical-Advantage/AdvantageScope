// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import { LapViewport } from "../src/shared/laps/LapViewport";

for (const mode of ["lapTime", "distance"]) {
  test(`${mode}: zoom stays local, anchors at cursor and pans within bounds`, () => {
    const viewport = new LapViewport();
    const full: [number, number] = [0, 100];
    viewport.update(mode, full);
    viewport.scroll(0, -1000, 1000, 0.25);
    let range = viewport.update(mode, full);
    assert.ok(range[1] - range[0] < 40);
    assert.ok(Math.abs(range[0] + (range[1] - range[0]) * 0.25 - 25) < 1e-9);
    const start = range[0];
    viewport.scroll(100, 0, 1000);
    range = viewport.update(mode, full);
    assert.ok(range[0] > start);
    viewport.scroll(-100000, 0, 1000);
    assert.equal(viewport.update(mode, full)[0], 0);
    viewport.scroll(100000, 0, 1000);
    assert.equal(viewport.update(mode, full)[1], 100);
    viewport.scroll(0, -100000, 1000);
    range = viewport.update(mode, full);
    assert.ok(Math.abs(range[1] - range[0] - 0.001) < 1e-9);
    assert.deepEqual(full, [0, 100]);
    viewport.scroll(0, 100000, 1000);
    assert.deepEqual(viewport.update(mode, full), full);
    assert.deepEqual(viewport.update(mode, [0, 110]), [0, 110]);
  });
}
test("mode switches reset lap units and zoom survives growing or shrinking bounds", () => {
  const viewport = new LapViewport();
  viewport.update("distance", [0, 100]);
  viewport.scroll(0, -1000, 1000);
  const zoom = viewport.update("distance", [0, 110]);
  assert.ok(zoom[1] - zoom[0] < 40);
  assert.deepEqual(viewport.update("distance", [0, 10]), [0, 10]);
  assert.deepEqual(viewport.update("lapTime", [0, 60]), [0, 60]);
  assert.deepEqual(viewport.update("time", [100, 130]), [100, 130]);
  viewport.scroll(100, -1000, 1000);
  assert.deepEqual(viewport.update("time", [100, 130]), [100, 130]);
});
