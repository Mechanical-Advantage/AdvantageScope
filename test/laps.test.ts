// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// In-page live connection UI (works the same in Electron and Lite):
// - ConnectDialog: File -> Connect... (Cmd/Ctrl+K). Pick a registered source, enter an address, or pick a
//   recent server. Styled like the Preferences prompt.
// - LiveStatusPill: title-bar pill with three separate indicators (backend, car, sim), plus a popover with
//   details, sim controls (only when the backend has sim endpoints) and connect/disconnect.

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { analyze, classifySkidpad, crossing, deltaTime, project, resample, Sample } from "../src/shared/laps/LapEngine";
const gate = { a: { x: 0, y: -10 }, b: { x: 0, y: 10 }, direction: 1 };
test("segment crossing interpolates and rejects reverse direction and outside gate", () => {
  assert.equal(crossing({ x: -2, y: 0, t: 10 }, { x: 6, y: 0, t: 14 }, gate), 11);
  assert.equal(crossing({ x: 6, y: 0, t: 14 }, { x: -2, y: 0, t: 18 }, gate), undefined);
  assert.equal(crossing({ x: -2, y: 11, t: 10 }, { x: 6, y: 11, t: 14 }, gate), undefined);
});
test("gate debounce enforces minimum time and rearm distance", () => {
  const samples: Sample[] = [];
  for (let t = 0; t <= 100; t += 0.1)
    samples.push({ t, x: 40 * Math.sin(((t - 1) * Math.PI) / 10), y: 40 * Math.cos(((t - 1) * Math.PI) / 10) });
  const r = analyze(samples, {
    gate: { a: { x: 0, y: -50 }, b: { x: 0, y: 50 }, direction: 1 },
    minTime: 30,
    rearm: 30
  });
  assert.ok(r.laps.filter((l) => l.complete).every((l) => l.end - l.start >= 30));
  assert.ok(r.laps.filter((l) => l.complete).length > 0);
});
test("skidpad re-syncs on yaw sign change", () =>
  assert.deepEqual(classifySkidpad([-1, -2, 1, 2, 0, -1]), ["R1", "R2", "L1", "L2", "Invalid yaw", "R1"]));
test("distance resampling collapses stops, rescales and retains endpoint", () => {
  const grid = resample([0, 0, 5, 10], [0, 2, 3, 4], 20);
  assert.equal(grid.length, 21);
  assert.equal(grid[10].time, 3);
  assert.deepEqual(grid.at(-1), { distance: 20, time: 4 });
  assert.deepEqual(resample([0, 0], [0, 1], 20), []);
});
test("counter source, sector bests and distance delta", () => {
  const samples: Sample[] = Array.from({ length: 121 }, (_, i) => ({
    t: i / 10,
    x: i / 10,
    y: 0,
    speed: 1,
    counter: Math.floor(i / 40)
  }));
  const r = analyze(samples, { minTime: 1, length: 4 });
  assert.equal(r.laps[1].source, "counter");
  assert.ok(r.laps[1].valid);
  assert.equal(r.laps[1].sectors.length, 3);
  assert.ok(r.theoretical.length === 3);
  const ref = r.laps[1],
    slower = { ...ref, grid: ref.grid.map((p) => ({ ...p, time: p.time * 1.1 })) };
  assert.ok(Math.abs(deltaTime(slower, ref, 4) - 0.4) < 1e-9);
});
test("ENU projection uses metres at local latitude", () => {
  assert.deepEqual(project(-37, 145, { lat: -37, lon: 145 }), { x: 0, y: 0 });
  assert.ok(Math.abs(project(-36.999, 145, { lat: -37, lon: 145 }).y - 111.195) < 0.01);
});
