// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { strict as assert } from "node:assert";
import { test } from "node:test";
import LapController from "../src/hub/controllers/LapController";
import { LapSourceConfigs } from "../src/hub/controllers/LapController_Config";
import { LapService, lapService } from "../src/hub/LapService";
import { analyze, Gate, gateAt, Sample } from "../src/shared/laps/LapEngine";
import Log from "../src/shared/log/Log";

const RADIUS = 100;
function circuit(lapTimes: number[], hz = 10): Sample[] {
  const samples: Sample[] = [];
  let t = 100;
  for (const lapTime of lapTimes)
    for (let i = 0; i < lapTime * hz; i++, t += 1 / hz) {
      const a = (2 * Math.PI * i) / (lapTime * hz);
      samples.push({ t, x: RADIUS * Math.cos(a), y: RADIUS * Math.sin(a) });
    }
  return samples;
}
const LAP_TIMES = [30, 28, 26, 29, 27];
const validTimes = (samples: Sample[], gate: Gate) =>
  analyze(samples, { gate })
    .laps.filter((l) => l.valid)
    .map((l) => +(l.end - l.start).toFixed(1));

test("a line placed at the cursor lies across the direction of travel and gives laps", () => {
  const samples = circuit(LAP_TIMES);
  const gate = gateAt(samples, samples[100].t)!;
  assert.ok(Math.abs(Math.hypot(gate.a.x - gate.b.x, gate.a.y - gate.b.y) - 24) < 1e-9);
  // A third of the way round each lap, so each time is a third of one lap plus two thirds of the next.
  assert.deepEqual(validTimes(samples, gate), [29.3, 27.3, 27, 28.3]);
  assert.equal(gateAt([], 0), undefined);
});

test("a line at the cursor doesn't land on a sample when laps repeat exactly", () => {
  const samples = circuit([30, 30, 30]);
  const gate = gateAt(samples, samples[100].t)!;
  assert.equal(analyze(samples, { gate }).laps.filter((l) => l.complete).length, 2);
});

test("a line at the end of the log or where the car is stopped still lies across its travel", () => {
  const samples = circuit(LAP_TIMES);
  const length = (g: Gate) => Math.hypot(g.a.x - g.b.x, g.a.y - g.b.y);
  assert.ok(length(gateAt(samples, samples.at(-1)!.t)!) > 23.9);
  // Stopped for 60 samples at sample 100.
  const stopped = samples.map((p, i) => (i >= 100 && i < 160 ? { ...p, x: samples[100].x, y: samples[100].y } : p));
  const gate = gateAt(stopped, stopped[120].t)!;
  assert.ok(length(gate) > 23.9);
  assert.ok(analyze(stopped, { gate }).laps.filter((l) => l.valid).length >= 3);
  assert.equal(
    gateAt(
      [
        { t: 0, x: 0, y: 0 },
        { t: 1, x: 0, y: 0 }
      ],
      0
    ),
    undefined
  );
});

test("the way round a line's ends lie doesn't change the laps", () => {
  const samples = circuit(LAP_TIMES);
  const gate = gateAt(samples, samples[100].t)!;
  assert.deepEqual(validTimes(samples, { a: gate.b, b: gate.a }), validTimes(samples, gate));
});

test("a line with no direction counts only the way the car usually crosses it", () => {
  // Three laps, then the car stops 300 degrees round, reverses back over the line and carries on forwards.
  const path: Sample[] = [];
  let angle = 0;
  const drive = (rate: number, seconds: number) => {
    for (let i = 0; i < seconds * 10; i++, angle += rate / 10) {
      path.push({ t: 100 + path.length / 10, x: RADIUS * Math.cos(angle), y: RADIUS * Math.sin(angle) });
    }
  };
  const FORWARD = (2 * Math.PI) / 30;
  drive(FORWARD, 95);
  drive(-FORWARD, 35);
  drive(FORWARD, 60);
  const { a, b } = gateAt(path, 110)!;
  const times = (g: Gate) => analyze(path, { gate: g }).laps.map((l) => [+l.start.toFixed(2), +l.end.toFixed(2)]);
  assert.deepEqual(times({ a, b }), times({ a, b, direction: -1 }));
});

test("a lap between crossings of a drawn line survives a GPS gap, but an automatic gate's does not", () => {
  const samples = circuit(LAP_TIMES).filter((p) => !(p.t > 140 && p.t < 141.7));
  const gate = gateAt(samples, samples[100].t)!;
  assert.equal(validTimes(samples, gate).length, 4);
  const auto = analyze(samples).laps;
  assert.equal(auto.filter((l) => l.complete).length - auto.filter((l) => l.valid).length, 1);
});

test("a line that reaches a parallel straight counts only the direction of travel at the cursor", () => {
  // An oval with straights 8 m apart, driven in opposite directions. A 24 m line crosses both.
  const samples: Sample[] = [];
  let t = 0;
  for (let lap = 0; lap < 4; lap++) {
    for (let x = -100; x < 100; x += 2) samples.push({ t: (t += 0.1), x, y: 0 });
    for (let i = 0; i < 40; i++) samples.push({ t: (t += 0.1), x: 100, y: (8 * i) / 40 });
    for (let x = 100; x > -100; x -= 2) samples.push({ t: (t += 0.1), x, y: 8 });
    for (let i = 0; i < 40; i++) samples.push({ t: (t += 0.1), x: -100, y: 8 - (8 * i) / 40 });
  }
  const gate = gateAt(samples, samples[50].t)!;
  const complete = analyze(samples, { gate, rearm: 5, minTime: 5 }).laps.filter((l) => l.complete);
  assert.equal(complete.length, 3);
  assert.ok(complete.every((l) => l.end - l.start > 27));
  // The same line dragged, with no direction: an even split takes the first crossing's direction.
  const dragged = analyze(samples, { gate: { a: gate.a, b: gate.b }, rearm: 5, minTime: 5 }).laps;
  assert.ok(dragged.filter((l) => l.complete).every((l) => l.end - l.start > 27));
});

test("a drawn line works on a course too small for the automatic gate's 30 m re-arm", () => {
  const samples: Sample[] = [];
  for (let t = 0; t < 130; t += 0.1) {
    const a = (2 * Math.PI * t) / 25;
    samples.push({ t, x: 14 * Math.cos(a), y: 14 * Math.sin(a) });
  }
  const gate = gateAt(samples, 10)!;
  assert.equal(analyze(samples, { gate }).laps.filter((l) => l.complete).length, 4);
});

test("a line the car never crosses gives way to the lap counter, and keeps the GPS gap rule", () => {
  const samples = circuit(LAP_TIMES).map((p) => ({ ...p, counter: Math.floor((p.t - 100) / 28) }));
  const away = { a: { x: 5000, y: -12 }, b: { x: 5000, y: 12 } };
  const laps = analyze(samples, { gate: away }).laps;
  assert.deepEqual([...new Set(laps.map((l) => l.source))], ["counter"]);
  const gapped = samples.filter((p) => !(p.t > 140 && p.t < 141.7));
  const auto = analyze(gapped).laps.filter((l) => l.valid).length;
  assert.equal(analyze(gapped, { gate: away }).laps.filter((l) => l.valid).length, auto);
});

test("moving the line renumbers the laps, so the reference and overlays are chosen again", () => {
  const log = new Log();
  // 1 degree of latitude is about 111 km, so this is the same circle as above in degrees.
  for (const p of circuit(LAP_TIMES)) {
    log.putNumber("gps/latitude", p.t, -37 + p.y / 111195);
    log.putNumber("gps/longitude", p.t, 145 + p.x / 88800);
  }
  (globalThis as any).window = { log };
  const service = new LapService();
  service.settings.config.manual = [120];
  service.update();
  service.reference = 99;
  service.overlays = [98, 99];
  const samples = service.result.samples;
  service.setStartLine(gateAt(samples, samples[100].t));
  assert.equal(service.settings.config.manual, undefined);
  service.update();
  const valid = service.result.laps.filter((l) => l.valid);
  assert.equal(valid.length, 4);
  assert.ok(valid.every((l) => l.source === "gps"));
  assert.equal(service.reference, service.result.best);
  assert.deepEqual(
    service.overlays,
    valid.map((l) => l.index)
  );
  service.setStartLine(undefined);
  assert.equal(service.settings.config.gate, undefined);
});

test("going back to the automatic gate leaves manual splits alone", () => {
  (globalThis as any).window = { log: new Log() };
  const service = new LapService();
  service.settings.config.manual = [120];
  service.setStartLine({ a: { x: 0, y: 0 }, b: { x: 1, y: 1 } });
  assert.equal(service.settings.config.manual, undefined);
  service.settings.config.manual = [120];
  service.setStartLine();
  assert.deepEqual(service.settings.config.manual, [120]);
});

test("live overlays take in new laps until the user chooses some", () => {
  const log = new Log();
  const samples = circuit(LAP_TIMES);
  const feed = (from: number, to: number) => {
    for (const p of samples.slice(from, to)) {
      log.putNumber("gps/latitude", p.t, -37 + p.y / 111195);
      log.putNumber("gps/longitude", p.t, 145 + p.x / 88800);
    }
  };
  (globalThis as any).window = { log };
  const service = new LapService();
  const gate = gateAt(samples, samples[100].t)!;
  service.settings.config.gate = { a: gate.a, b: gate.b };
  feed(0, 700);
  service.update();
  assert.deepEqual(service.overlays, [1, 2]);
  feed(700, 1000);
  service.invalidate();
  service.update();
  assert.deepEqual(service.overlays, [1, 2, 3]);
  // Unchecking a lap and checking it again is still the user's choice.
  service.setOverlays([1, 2]);
  service.setOverlays([1, 2, 3]);
  feed(1000, samples.length);
  service.invalidate();
  service.update();
  assert.deepEqual(service.overlays, [1, 2, 3]);
});

test("in live the overlay keeps taking the latest laps, and a log the first", () => {
  const log = new Log();
  for (const p of circuit([30, 30, 30, 30, 30, 30, 30, 30])) {
    log.putNumber("gps/latitude", p.t, -37 + p.y / 111195);
    log.putNumber("gps/longitude", p.t, 145 + p.x / 88800);
  }
  const gate = { a: { x: -150, y: 86 }, b: { x: -150, y: 87 } };
  for (const [live, expected] of [
    [null, [1, 2, 3, 4]],
    [5, [4, 5, 6, 7]]
  ] as const) {
    (globalThis as any).window = { log, selection: { getCurrentLiveTime: () => live } };
    const service = new LapService();
    service.update();
    const samples = service.result.samples;
    service.setStartLine(gateAt(samples, samples[100].t) ?? gate);
    service.update();
    assert.deepEqual(service.overlays, [...expected]);
  }
});

test("the map cursor follows timeline hover through the render time", () => {
  const log = new Log();
  log.putNumber("gps/latitude", 0, -37);
  let renderTime: number | null = 5;
  (globalThis as any).window = {
    log,
    selection: { getRenderTime: () => renderTime, getSelectedTime: () => 1, getCurrentLiveTime: () => null }
  };
  const controller: any = Object.create(LapController.prototype);
  controller.sources = LapSourceConfigs.map(() => ({ getState: () => [], setState() {} }));
  controller.sourceStates = [];
  controller.field = "";
  controller.map = true;
  lapService.invalidate();
  assert.equal(controller.getCommand().time, 5);
  renderTime = 7;
  assert.equal(controller.getCommand().time, 7);
  renderTime = null;
  assert.equal(controller.getCommand().time, null);
});

test("a saved geographic line follows the track when the log starts at a different fix", () => {
  const points = circuit([30, 30, 30, 30]);
  const logFor = (offset: number) => {
    const log = new Log();
    for (const p of points.slice(offset)) {
      log.putNumber("gps/latitude", p.t, -37 + p.y / 111195);
      log.putNumber("gps/longitude", p.t, 145 + p.x / 88800);
    }
    return log;
  };
  (globalThis as any).window = { log: logFor(0) };
  const service = new LapService();
  service.update();
  service.setStartLine(gateAt(service.result.samples, 110)!);
  service.update();
  const saved = JSON.parse(JSON.stringify(service.settings));
  assert.ok(saved.config.geographic.gate);
  assert.equal(saved.config.gate, undefined);
  assert.equal(service.result.laps.filter((l) => l.valid).length, 3);
  (globalThis as any).window.log = logFor(150);
  service.settings = saved;
  service.update();
  assert.equal(service.result.laps.filter((l) => l.valid).length, 2);
});

test("old metre gates keep their results and convert only on an edit", () => {
  const log = new Log();
  for (const p of circuit(LAP_TIMES)) {
    log.putNumber("gps/latitude", p.t, -37 + p.y / 111195);
    log.putNumber("gps/longitude", p.t, 145 + p.x / 88800);
  }
  (globalThis as any).window = { log };
  const service = new LapService();
  service.update();
  const gate = gateAt(service.result.samples, 110)!;
  const config = { gate, sectors: [gate], finish: gate };
  const expected = analyze(service.result.samples, config);
  service.settings.config = config;
  service.invalidate();
  service.update();
  assert.deepEqual(
    service.result.laps.map((l) => [+l.start.toFixed(7), +l.end.toFixed(7)]),
    expected.laps.map((l) => [+l.start.toFixed(7), +l.end.toFixed(7)])
  );
  assert.deepEqual(service.settings.config, config);
  const version = service.version;
  service.update();
  assert.equal(service.version, version);
  service.setGate(0, gate);
  assert.equal(service.settings.config.sectors, undefined);
  assert.ok(service.settings.config.geographic?.sectors?.length);
  service.setGate(-1, gate);
  service.setGate(-2, gate);
  assert.equal(service.settings.config.gate, undefined);
  assert.equal(service.settings.config.finish, undefined);
  assert.ok(service.settings.config.geographic?.finish);
});

test("map replay interpolates position by time and clamps at the finish", async () => {
  const { default: LapRenderer } = await import("../src/shared/renderers/LapRenderer");
  const renderer = Object.create(LapRenderer.prototype) as any;
  renderer.command = {
    result: {
      samples: [
        { t: 10, x: 0, y: 0, distance: 100 },
        { t: 12, x: 20, y: 10, distance: 130 },
        { t: 15, x: 25, y: 20, distance: 150 }
      ]
    }
  };
  assert.deepEqual(renderer.sampleAt(11), { x: 10, y: 5, distance: 115 });
  assert.deepEqual(renderer.sampleAt(30), { x: 25, y: 20, distance: 150 });
  assert.deepEqual(renderer.sampleAt(0), { x: 0, y: 0, distance: 100 });
  const lap = {
    grid: [
      { distance: 0, time: 0 },
      { distance: 20, time: 4 },
      { distance: 50, time: 5 }
    ]
  };
  assert.equal(renderer.gridTimeAt(lap, 10), 2);
  assert.equal(renderer.gridTimeAt(lap, 100), 5);
});

const gpsLog = (points: Sample[]) => {
  const log = new Log();
  for (const p of points) {
    log.putNumber("gps/latitude", p.t, -37 + p.y / 111195);
    log.putNumber("gps/longitude", p.t, 145 + p.x / 88800);
  }
  return log;
};
const lapTimes = (s: LapService) => s.result.laps.filter((l) => l.valid).map((l) => +(l.end - l.start).toFixed(2));

// A metre gate saved by an old layout on the synthetic circuit.
function legacyGate() {
  (globalThis as any).window = { log: gpsLog(circuit(LAP_TIMES)) };
  const s = new LapService();
  s.update();
  return { gate: gateAt(s.result.samples, 110)!, samples: s.result.samples };
}

test("an old metre gate survives a log with no GPS fix", () => {
  const { gate, samples } = legacyGate();
  const expected = analyze(samples, { gate })
    .laps.filter((l) => l.valid)
    .map((l) => +(l.end - l.start).toFixed(2));
  // A log where the GPS reports 0,0 (no fix), e.g. the first seconds of a live session.
  const noFix = new Log();
  for (let t = 0; t < 5; t += 0.1) {
    noFix.putNumber("gps/latitude", t, 0);
    noFix.putNumber("gps/longitude", t, 0);
  }
  (globalThis as any).window = { log: noFix };
  const service = new LapService();
  service.settings.config = { gate: structuredClone(gate) };
  service.update();
  assert.equal(service.origin, undefined);
  // Then the real log of the track opens with the same layout.
  (globalThis as any).window = { log: gpsLog(circuit(LAP_TIMES)) };
  service.invalidate();
  service.update();
  assert.deepEqual(lapTimes(service), expected);
});

test("loading a metre gate does not repeat analysis on an unchanged log", () => {
  const { gate } = legacyGate();
  (globalThis as any).window = { log: gpsLog(circuit(LAP_TIMES)) };
  const service = new LapService();
  service.update();
  service.settings.config = { gate };
  service.invalidate();
  service.update();
  const v = service.version;
  service.update(); // within 500 ms and nothing changed in the log
  assert.equal(service.version, v);
});

test("a sector added in the old build preserves saved geographic sectors", () => {
  (globalThis as any).window = { log: gpsLog(circuit(LAP_TIMES)) };
  const service = new LapService();
  service.update();
  const g = (t: number) => gateAt(service.result.samples, t)!;
  service.setGate(0, g(105));
  service.setGate(1, g(115));
  service.update();
  const saved = JSON.parse(JSON.stringify(service.settings));
  // The old build ignores config.geographic, so its "Add sector at cursor" writes sectors[0].
  saved.config.sectors = [g(125)];
  const first = JSON.stringify(saved.config.geographic.sectors[0]);
  service.settings = saved;
  service.invalidate();
  service.update();
  const sectors = service.localConfig().sectors!;
  assert.equal(sectors.length, 3);
  assert.equal(JSON.stringify(service.settings.config.geographic!.sectors![0]), first);
  service.setGate(2, g(120));
  assert.equal(service.settings.config.sectors, undefined);
  assert.equal(service.settings.config.geographic!.sectors!.length, 3);
  assert.equal(JSON.stringify(service.settings.config.geographic!.sectors![0]), first);
});

test("a live metre gate survives rejection of the initial GPS fix", () => {
  const { gate, samples } = legacyGate();
  const expected = analyze(samples, { gate })
    .laps.filter((l) => l.valid)
    .map((l) => +(l.end - l.start).toFixed(2));
  const log = new Log();
  // The receiver's first fix is 2 km off; it is the only fix at the first update.
  log.putNumber("gps/latitude", 99.9, -37 + 2000 / 111195);
  log.putNumber("gps/longitude", 99.9, 145 + 100 / 88800);
  let live = 99.9;
  (globalThis as any).window = { log, selection: { getCurrentLiveTime: () => live } };
  const service = new LapService();
  service.settings.config = { gate: structuredClone(gate) };
  service.update();
  for (const p of circuit(LAP_TIMES)) {
    log.putNumber("gps/latitude", p.t, -37 + p.y / 111195);
    log.putNumber("gps/longitude", p.t, 145 + p.x / 88800);
  }
  live = 300;
  service.invalidate();
  service.update();
  assert.deepEqual(lapTimes(service), expected);
});
