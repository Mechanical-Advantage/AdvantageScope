// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Without GPS, live laps add 0.5 s grid samples. The grid must line up with a full analysis.
import assert from "node:assert/strict";
import { test } from "node:test";
import { isDeepStrictEqual } from "node:util";
import { LapService } from "../src/hub/LapService";
import Log from "../src/shared/log/Log";

const strip = (r: any) => JSON.parse(JSON.stringify(r));

function view(service: LapService) {
  const r = strip(service.result);
  return {
    laps: r.laps.map((l: any) => ({
      index: l.index,
      start: l.start,
      end: l.end,
      valid: l.valid,
      complete: l.complete,
      distance: l.distance,
      sectors: l.sectors
    })),
    theoretical: r.theoretical,
    best: r.best,
    reference: service.reference,
    overlays: service.overlays,
    bands: strip(service.bands())
  };
}

/** Runs a fresh service on a copy of the log with the same settings and reference. Returns differing keys. */
function compare(service: LapService, full = false): { diff: string[]; a: any; b: any } {
  const log = (globalThis as any).window.log as Log;
  const copy = Log.fromSerialized(log.toSerialized());
  const saved = (globalThis as any).window;
  (globalThis as any).window = { ...saved, log: copy };
  const fresh = new LapService();
  fresh.settings = structuredClone(service.settings);
  fresh.update();
  fresh.reference = service.reference;
  fresh.selected = service.selected;
  fresh.invalidate();
  fresh.update();
  (globalThis as any).window = saved;
  const a = full ? strip(service.result) : view(service),
    b = full ? strip(fresh.result) : view(fresh);
  return { diff: Object.keys(b).filter((k) => !isDeepStrictEqual(a[k], b[k])), a, b };
}

function step(service: LapService) {
  service.invalidate();
  service.update();
}

test("wheel-speed-only live laps match a full analysis after 60 appends", () => {
  let now = 0;
  const log = new Log();
  (globalThis as any).window = { log, selection: { getCurrentLiveTime: () => now } };
  const service = new LapService();
  let t = 0;
  for (let batch = 0; batch < 60; batch++) {
    const until = t + 1.37;
    for (; t < until; t = Math.round((t + 0.02) * 1000) / 1000) {
      const v = Math.round((10 + 4 * Math.sin(t / 3)) * 2) / 2;
      log.putNumber("wheel_speed_fl", t, v);
      log.putNumber("wheel_speed_fr", t, v);
      log.putNumber("lap_counter", t, Math.floor(t / 20));
    }
    for (const k of ["wheel_speed_fl", "wheel_speed_fr"]) log.setMetadataString(k, JSON.stringify({ unit: "m/s" }));
    now = t;
    step(service);
  }
  const { a, b } = compare(service, true);
  const ta = a.samples.map((s: any) => s.t),
    tb = b.samples.map((s: any) => s.t);
  const onlyLive = ta.filter((x: number) => !tb.includes(x)),
    onlyFull = tb.filter((x: number) => !ta.includes(x));
  let maxSector = 0;
  a.laps.forEach((l: any, i: number) =>
    l.sectors.forEach((s: number, j: number) => (maxSector = Math.max(maxSector, Math.abs(s - b.laps[i].sectors[j]))))
  );
  console.log(
    JSON.stringify({
      laps: [a.laps.length, b.laps.length],
      samples: [ta.length, tb.length],
      onlyLive: onlyLive.slice(0, 8),
      onlyFull: onlyFull.slice(0, 8),
      maxSectorDiffSeconds: maxSector,
      theoretical: [a.theoretical, b.theoretical]
    })
  );
  assert.deepEqual(ta, tb);
  assert.equal(maxSector, 0);
});

test("wheel-speed-only, dense noisy speeds at 75 Hz, lap counter", () => {
  let now = 0;
  const log = new Log();
  (globalThis as any).window = { log, selection: { getCurrentLiveTime: () => now } };
  const service = new LapService();
  let t = 0,
    i = 0,
    mismatched = 0,
    first = -1;
  for (let batch = 0; batch < 60; batch++) {
    const until = t + 1.37;
    for (; t < until; t = ++i / 75) {
      const v = 10 + 4 * Math.sin(t / 3) + Math.sin(i * 12.9898) * 0.05;
      log.putNumber("wheel_speed_fl", t, v);
      log.putNumber("wheel_speed_fr", t, v + 0.01);
      log.putNumber("lap_counter", t, Math.floor(t / 20));
    }
    for (const k of ["wheel_speed_fl", "wheel_speed_fr"]) log.setMetadataString(k, JSON.stringify({ unit: "m/s" }));
    now = t;
    step(service);
    const r = compare(service);
    if (r.diff.length) {
      mismatched++;
      if (first < 0) first = batch;
    }
  }
  const { a, b } = compare(service, true);
  let maxSector = 0;
  a.laps.forEach((l: any, k: number) =>
    l.sectors.forEach((s: number, j: number) => (maxSector = Math.max(maxSector, Math.abs(s - b.laps[k].sectors[j]))))
  );
  console.log(
    JSON.stringify({
      laps: a.laps.length,
      mismatchedBatches: mismatched,
      firstBatch: first,
      samples: [a.samples.length, b.samples.length],
      maxSectorDiffSeconds: maxSector
    })
  );
  assert.equal(mismatched, 0);
});
