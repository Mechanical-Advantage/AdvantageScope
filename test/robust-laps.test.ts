// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { lapService } from "../src/hub/LapService";
import { analyze, resample } from "../src/shared/laps/LapEngine";
import Log from "../src/shared/log/Log";
import { RenderGuard } from "../src/shared/RenderGuard";

test("400,000 km grid and tiny distance splits are bounded by samples", () => {
  const ds = Array.from({ length: 1000 }, (_, i) => i * 400000);
  const grid = resample(
    ds,
    ds.map((_, i) => i),
    400000000
  );
  assert.ok(grid.length <= 4097);
  assert.equal(grid.at(-1)!.distance, 400000000);
  const result = analyze(
    ds.map((x, t) => ({ x, y: 0, t })),
    { length: 1e-300 }
  );
  assert.equal(result.laps.length, 1);
  assert.ok(result.laps[0].grid.length <= 4097);
  for (const length of [NaN, Infinity, -1]) assert.deepEqual(resample([0, 1], [0, 1], length), []);
});

test("transient counter jumps and non-boolean beacon values do not invent laps", () => {
  const samples = Array.from({ length: 100 }, (_, t) => ({
    t,
    x: t,
    y: 0,
    counter: t >= 30 && t < 40 ? 3 : 0,
    beacon: t % 2 ? 1e12 : 0
  }));
  const result = analyze(samples);
  assert.ok(result.laps.every((l) => !l.complete));
  const spike = samples.map((p, i) => ({ ...p, counter: i === 40 ? 1 : 0 }));
  assert.ok(analyze(spike).laps.every((l) => !l.complete));
});

test("GPS jump is excluded, next good fix recovers, unknown wheel units cannot integrate distance", () => {
  const log = new Log();
  for (let i = 0; i < 80; i++) {
    log.putNumber("latitude", i * 0.1, i === 0 || i === 40 ? 80 : -37 + i * 0.000001);
    log.putNumber("longitude", i * 0.1, 145);
    log.putNumber("WheelSpeedFL", i * 0.1, 1e100);
    log.putNumber("WheelSpeedFR", i * 0.1, 1e100);
  }
  (globalThis as any).window = { log };
  lapService.settings.latitude = "latitude";
  lapService.settings.longitude = "longitude";
  lapService.invalidate();
  lapService.update();
  assert.ok(!lapService.result.samples.some((p) => p.t === 0 || p.t === 4));
  assert.ok(lapService.result.samples.some((p) => p.t > 4));
  assert.ok(lapService.result.samples.at(-1)!.distance < 20);
  assert.equal(lapService.result.samples[0].speed, undefined);
  assert.equal(log.getNumber("latitude", 4, 4)!.values.at(-1), 80);
});

test("throwing periodic task logs once and recovers without stopping sibling work", () => {
  const guard = new RenderGuard();
  let logged = 0,
    recovered = 0,
    siblings = 0;
  const original = console.error;
  console.error = () => logged++;
  try {
    for (let i = 0; i < 60; i++) {
      guard.run(() => {
        throw new Error("synthetic");
      });
      siblings++;
    }
    guard.run(
      () => {},
      undefined,
      () => recovered++
    );
    assert.equal(logged, 1);
    assert.equal(recovered, 1);
    assert.equal(siblings, 60);
  } finally {
    console.error = original;
  }
});

import { fixedSampleCount } from "../src/shared/util";
test("fixed sampling rejects enormous spans and non-progressing steps before allocating", () => {
  assert.equal(fixedSampleCount(0, 10, 0.1), 100);
  for (const [start, end, step] of [
    [0, 1e300, 0.02],
    [1e300, 1e300, 0],
    [0, Infinity, 1]
  ])
    assert.throws(() => fixedSampleCount(start, end, step));
});

test("manual markers remain usable with an incompatible auto-detected counter", () => {
  const samples = Array.from({ length: 101 }, (_, i) => ({ t: i / 10, x: i, y: 0, counter: 0 }));
  const result = analyze(samples, { manual: [2, 5, 8], minTime: 1 });
  assert.equal(result.laps.filter((l) => l.complete).length, 2);
  assert.equal(result.laps[1].source, "manual");
});

test("numeric geometry array lengths cannot allocate more than available fields", async () => {
  const { grabModuleVelocities, grabRotation2dArray } = await import("../src/shared/geometry");
  const log = new Log();
  log.putNumber("Modules/length", 0, 1e300);
  log.putNumber("Modules/0/velocity", 0, 1);
  assert.ok(grabModuleVelocities(log, "Modules", 0).length <= log.getFieldKeys().length);
  assert.ok(grabRotation2dArray(log, "Modules", 0).length <= log.getFieldKeys().length);
});

test("a counter that never confirms a lap does not block GPS laps", () => {
  const samples = Array.from({ length: 2001 }, (_, i) => {
    const angle = (i / 400) * 2 * Math.PI;
    return { t: i / 10, x: 100 * Math.sin(angle), y: 100 - 100 * Math.cos(angle), counter: i === 500 ? 3 : 0 };
  });
  const result = analyze(samples);
  assert.ok(result.laps.filter((l) => l.complete).length >= 2);
  assert.ok(result.laps.every((l) => l.source === "gps"));
});

import { isMissingCell, isNumberCell } from "../src/hub/dataSources/csv/CSVParser";
test("missing value spellings are not text, and real text is not missing", () => {
  for (const cell of ["null", "NONE", "n/a", "NA", "-", "--", "?"]) assert.ok(isMissingCell(cell), cell);
  for (const cell of ["ERR", "0", "-1", "nan", "OK"]) assert.ok(!isMissingCell(cell), cell);
  assert.ok(!isNumberCell("n/a"));
});

test("a beacon with corrupt values or idling high does not create laps", () => {
  const base = Array.from({ length: 300 }, (_, t) => ({ t, x: t, y: 0 }));
  const idleHigh = base.map((p) => ({ ...p, beacon: p.t % 50 === 0 || p.t % 50 === 1 ? 0 : 1 }));
  const corrupt = base.map((p) => ({ ...p, beacon: p.t === 7 ? 4227858432 : p.t % 50 < 3 && p.t > 3 ? 1 : 0 }));
  const pulses = base.map((p) => ({ ...p, beacon: p.t % 50 < 3 && p.t > 3 ? 1 : 0 }));
  assert.ok(analyze(idleHigh).laps.every((l) => !l.complete));
  assert.ok(analyze(corrupt).laps.every((l) => !l.complete));
  assert.ok(analyze(pulses).laps.some((l) => l.complete && l.source === "beacon"));
});
