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
import {
  analyze,
  classifySkidpad,
  crossing,
  deltaTime,
  lapSamples,
  project,
  resample,
  Sample
} from "../src/shared/laps/LapEngine";
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

test("acceleration ends at interpolated 75 m and excludes between-run intervals", () => {
  const ss: Sample[] = Array.from({ length: 201 }, (_, i) => ({ t: i / 10, x: 0, y: 0, speed: i === 0 ? 0 : 10 }));
  const r = analyze(ss, { mode: "accel" });
  const run = r.laps.find((l) => l.complete)!;
  assert.ok(run);
  assert.ok(Math.abs(run.distance - 75) < 1e-8);
  assert.ok(run.valid);
});
test("manual markers beat distance fallback and retain partial intervals", () => {
  const ss = Array.from({ length: 101 }, (_, i) => ({ t: i / 10, x: i, y: 0, speed: 10 }));
  const r = analyze(ss, { manual: [2, 5, 8], minTime: 1, length: 30 });
  assert.equal(r.laps[1].source, "manual");
  assert.equal(r.laps[1].end - r.laps[1].start, 3);
  assert.equal(r.laps[0].complete, false);
  assert.equal(r.laps.at(-1)!.complete, false);
});
test("active partial laps retain their travelled distance", () => {
  const ss = Array.from({ length: 101 }, (_, i) => ({ t: i / 10, x: i, y: 0, speed: 10, counter: Math.floor(i / 40) }));
  const r = analyze(ss, { minTime: 1, length: 100 });
  assert.equal(r.laps[1].distance, 100);
  assert.ok(r.laps.at(-1)!.distance < 100);
});
test("GPS gaps exclude laps from bests", () => {
  const ss = [0, 1, 2, 5, 6, 7, 8].map((t) => ({ t, x: t, y: 0, counter: t < 1 ? 0 : t < 7 ? 1 : 2 }));
  assert.equal(analyze(ss, { minTime: 1 }).best, undefined);
});
test("endurance increments stint after driver-change standstill", () => {
  const ss = Array.from({ length: 1001 }, (_, i) => ({
    t: i / 10,
    x: i / 10,
    y: 0,
    speed: i >= 100 && i < 800 ? 0 : 5,
    counter: Math.floor(i / 50)
  }));
  const r = analyze(ss, { mode: "endurance", minTime: 1 });
  assert.ok(r.laps.some((l) => l.stint === 2));
  assert.ok(r.laps.some((l) => !l.valid));
});

test("distance fallback includes an exact final split", () => {
  const ss = Array.from({ length: 101 }, (_, i) => ({ t: i / 10, x: i, y: 0, speed: 10 }));
  const laps = analyze(ss, { length: 50, minTime: 1 }).laps;
  assert.equal(laps.length, 2);
  assert.ok(laps.every((lap) => lap.complete));
});

test("autocross times only start-to-finish runs", () => {
  const ss = Array.from({ length: 401 }, (_, i) => ({ t: i / 10, x: (i % 200) - 20, y: 0, speed: 10 }));
  const finish = { a: { x: 100, y: -10 }, b: { x: 100, y: 10 }, direction: 1 };
  const laps = analyze(ss, { mode: "autocross", gate, finish, minTime: 1, rearm: 5 }).laps;
  const runs = laps.filter((lap) => lap.complete);
  assert.equal(runs.length, 2);
  assert.ok(runs.every((lap) => Math.abs(lap.end - lap.start - 10) < 1e-9));
});

test("lap overlay keeps raw sample values and holds the value at the lap start", () => {
  const lap = {
    start: 10,
    end: 12,
    grid: [
      { time: 0, distance: 0 },
      { time: 2, distance: 100 }
    ]
  };
  const timestamps = [9.5, 10.5, 11, 11.5, 12.5];
  const values = [1, 7, 3, 9, 4];
  assert.deepEqual(lapSamples(timestamps, values, lap, false), {
    timestamps: [0, 0.5, 1, 1.5],
    values: [1, 7, 3, 9]
  });
  assert.deepEqual(lapSamples(timestamps, values, lap, true), {
    timestamps: [0, 25, 50, 75],
    values: [1, 7, 3, 9]
  });
});
