// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  analyze,
  gateAt,
  LapAnalysisCache,
  LapResult,
  Sample,
  sectorBlocks,
  sectorBounds
} from "../src/shared/laps/LapEngine";
import LapRenderer, { fitTrackView, trackView } from "../src/shared/renderers/LapRenderer";

/** Three laps of a 40 m circle, with a gate a quarter of the way round and another half way. */
function circleLaps(): LapResult {
  const samples: Sample[] = [];
  for (let t = 0; t <= 65; t += 0.05) {
    const angle = (2 * Math.PI * t) / 20;
    samples.push({ t, x: 40 * Math.sin(angle), y: 40 * Math.cos(angle) - 40, speed: (2 * Math.PI * 40) / 20 });
  }
  return analyze(samples, {
    sectors: [
      { a: { x: 30, y: -40 }, b: { x: 50, y: -40 } },
      { a: { x: 0, y: -70 }, b: { x: 0, y: -90 } }
    ]
  });
}

test("the Track Map fits a double-clicked sector's stretch of the reference lap", () => {
  const result = circleLaps();
  const lap = result.laps.find((l) => l.valid)!;
  const bounds = [-40, 40, -80, 0];
  const [, s2] = sectorBlocks(lap);
  const box = sectorBounds(lap, result.samples, [s2.start, s2.end])!;
  for (const [w, h] of [
    [600, 400],
    [300, 700]
  ]) {
    const fit = fitTrackView(bounds, box, w, h);
    assert.ok(fit.zoom > 1.5, `${fit.zoom}`);
    const pan: [number, number] = [...fit.pan];
    const view = trackView(bounds, w, h, fit.zoom, pan);
    assert.deepEqual(pan, fit.pan, "the map can pan as far as the fit needs");
    const corners = [view.transform({ x: box[0], y: box[2] }), view.transform({ x: box[1], y: box[3] })];
    for (const p of corners) assert.ok(p.x >= 0 && p.x <= w && p.y >= 0 && p.y <= h, JSON.stringify(p));
    // The sector fills the map's narrower side, less the same 8% margin the whole track gets.
    const filled = Math.max((corners[1].x - corners[0].x) / w, (corners[0].y - corners[1].y) / h);
    assert.ok(Math.abs(filled - 1 / 1.16) < 0.01, `${filled}`);
    const centre = view.transform({ x: (box[0] + box[1]) / 2, y: (box[2] + box[3]) / 2 });
    assert.ok(Math.abs(centre.x - w / 2) < 1e-6 && Math.abs(centre.y - h / 2) < 1e-6);
  }
  // The whole track at zoom 1 is the stock view.
  assert.deepEqual(fitTrackView(bounds, bounds, 600, 400), { zoom: 1, pan: [0, 0] });
});

class Element extends EventTarget {
  classList = { add() {}, toggle() {} };
  style = {};
  className = "";
  tabIndex = 0;
  title = "";
  clientWidth = 600;
  clientHeight = 400;
  width = 0;
  height = 0;
  append() {}
  setAttribute() {}
  contains() {
    return false;
  }
  getContext() {
    return new Proxy({}, { get: () => () => ({ width: 0 }), set: () => true });
  }
}

test("a new focus refits the map once, and a map keeps the view the user scrolls to", () => {
  const g = globalThis as any;
  g.document = Object.assign(new EventTarget(), { createElement: () => new Element(), activeElement: null });
  g.window = Object.assign(g.window ?? new EventTarget(), { devicePixelRatio: 1 });
  g.matchMedia = () => ({ matches: false });
  const renderer: any = new LapRenderer(new Element() as any, false);
  renderer.build = () => {};
  renderer.drawTrace = () => {};
  const result = circleLaps();
  const lap = result.laps.find((l) => l.valid)!;
  const [, s2, s3] = sectorBlocks(lap);
  const command: any = {
    view: "map",
    split: 0.55,
    result,
    settings: { config: {} },
    field: "",
    values: [],
    overlays: [],
    reference: lap.index,
    selected: null,
    time: null,
    version: 1
  };
  renderer.render(command);
  assert.equal(renderer.zoom, 1);
  const focus = { lap: lap.index, range: [s2.start, s2.end], id: 7 };
  renderer.render({ ...command, focus });
  const expected = fitTrackView(renderer.bounds, sectorBounds(lap, result.samples, focus.range as any)!, 600, 400);
  assert.equal(renderer.zoom, expected.zoom);
  assert.deepEqual(renderer.pan, expected.pan);
  assert.deepEqual(renderer.saveState().pan, [0, 0], "the layout keeps the view before the sector fit");
  assert.equal(renderer.saveState().zoom, 1);
  // Scrolling after the fit keeps the user's view while the same focus is still in the command.
  renderer.zoom = 3;
  renderer.render({ ...command, focus, time: 1 });
  assert.equal(renderer.zoom, 3);
  renderer.render({ ...command, focus: { ...focus, range: [s3.start, s3.end], id: 8 } });
  assert.notEqual(renderer.zoom, 3);
});

test("cursor draws outside selected and overlaid lap ranges", () => {
  const g = globalThis as any;
  g.document = Object.assign(new EventTarget(), { createElement: () => new Element(), activeElement: null });
  g.window = Object.assign(g.window ?? new EventTarget(), { devicePixelRatio: 1 });
  g.matchMedia = () => ({ matches: false });
  const renderer: any = new LapRenderer(new Element() as any, false);
  renderer.build = () => {};
  renderer.drawTrace = () => {};
  const result = circleLaps();
  const lap = result.laps.find((l) => l.valid)!;
  const arcs: number[][] = [];
  const fills: string[] = [];
  let fillStyle = "";
  const context = new Proxy(
    {},
    {
      get: (_, key) =>
        key === "arc"
          ? (...args: number[]) => arcs.push(args)
          : key === "fill"
          ? () => fills.push(fillStyle)
          : () => ({ width: 0 }),
      set: (_, key, value) => {
        if (key === "fillStyle") fillStyle = value;
        return true;
      }
    }
  );
  renderer.canvas.getContext = () => context;
  for (const scope of ["selected", "overlaid"]) {
    renderer.scope = scope;
    arcs.length = 0;
    fills.length = 0;
    renderer.lastDraw = "";
    renderer.render({
      view: "map",
      split: 0.55,
      result,
      settings: { config: {} },
      field: "",
      values: [],
      overlays: [lap.index],
      reference: lap.index,
      selected: lap.index,
      time: 1,
      version: 1
    });
    assert.equal(fills.at(-1), "#222", "the cursor contrasts with a light map");
    const point = renderer.transform(renderer.sampleAt(1));
    assert.ok(
      arcs.some(([x, y, radius]) => radius === 6 && Math.abs(x - point.x) < 1e-6 && Math.abs(y - point.y) < 1e-6),
      scope
    );
  }
});

test("endpoint and Shift drags commit once on release without recalculating during movement", () => {
  const g = globalThis as any;
  g.document = Object.assign(new EventTarget(), { createElement: () => new Element(), activeElement: null });
  g.window = new EventTarget();
  const renderer: any = new LapRenderer(new Element() as any);
  renderer.command = { result: { samples: [{ t: 0, x: 0, y: 0 }] } };
  renderer.scroll.getBoundingClientRect = () => ({ left: 0, top: 0 });
  renderer.scroll.setPointerCapture = () => {};
  renderer.scroll.releasePointerCapture = () => {};
  renderer.scroll.hasPointerCapture = () => false;
  renderer.inverse = (p: unknown) => p;
  renderer.draw = () => {};
  renderer.endpointAt = () => ({ index: 0, endpoint: "a", gate: { a: { x: 0, y: 0 }, b: { x: 0, y: 10 } } });
  const actions: any[] = [];
  renderer.action = (action: unknown) => actions.push(action);
  for (const shiftKey of [false, true]) {
    actions.length = 0;
    const send = (type: string, x: number) =>
      renderer.scroll.dispatchEvent(
        Object.assign(new Event(type), { clientX: x, clientY: 0, button: 0, pointerId: 1, shiftKey })
      );
    send("pointerdown", 0);
    for (let x = 1; x <= 100; x++) send("pointermove", x);
    assert.equal(actions.length, 0);
    send("pointerup", 100);
    assert.equal(actions.length, 1);
    assert.equal(actions[0].type, "gate");
    assert.equal(actions[0].index, shiftKey ? -1 : 0);
  }
});

test("double-click fits the track and an off-screen restored view recovers", () => {
  const g = globalThis as any;
  g.document = Object.assign(new EventTarget(), { createElement: () => new Element(), activeElement: null });
  g.window = Object.assign(new EventTarget(), { devicePixelRatio: 1 });
  g.matchMedia = () => ({ matches: false });
  const renderer: any = new LapRenderer(new Element() as any, false);
  renderer.build = () => {};
  renderer.drawTrace = () => {};
  const command: any = {
    view: "map",
    split: 0.55,
    result: circleLaps(),
    settings: { config: {} },
    field: "",
    values: [],
    overlays: [],
    reference: null,
    selected: null,
    time: null,
    version: 1
  };
  renderer.render(command);
  renderer.zoom = 20;
  renderer.pan = [10000, -10000];
  renderer.scroll.dispatchEvent(new Event("dblclick"));
  assert.equal(renderer.zoom, 1);
  assert.deepEqual(renderer.pan, [0, 0]);
  renderer.restoreState({ zoom: 10, pan: [10000, -10000] });
  renderer.render({ ...command, version: 2 });
  assert.equal(renderer.zoom, 1);
  assert.deepEqual(renderer.pan, [0, 0]);
});

test("sectors added in reverse lap order retain positive times and the final sector", () => {
  const samples = circleLaps().samples;
  const gates = [gateAt(samples, 5)!, gateAt(samples, 13)!];
  const config = { manual: [0, 20, 40, 60], sectors: gates };
  const ordered = analyze(samples, config);
  const reversed = analyze(samples, { ...config, sectors: [...gates].reverse() });
  assert.deepEqual(reversed, ordered);
  for (const lap of reversed.laps.filter((lap) => lap.complete)) {
    assert.equal(lap.sectors.length, 3);
    assert.ok(lap.sectors.every((time) => time > 0 && Number.isFinite(time)));
  }
});

test("cached analysis matches full results while revisiting only the appended tail", () => {
  const all = circleLaps().samples;
  for (const mode of ["circuit", "accel", "skidpad", "autocross", "endurance"] as const) {
    const cache = new LapAnalysisCache();
    const config = { mode, manual: [0, 20, 40, 60] };
    for (let count = 20; count < all.length; count += 20) {
      const input = all.slice(0, count);
      const from = all[Math.max(0, count - 22)].t;
      const before = cache.processed;
      assert.deepEqual(analyze(input, config, cache, from), analyze(input, config));
      assert.ok(cache.processed - before < 500);
    }
  }
});

test("cached analysis handles signal timing, gate edits, stops and revised tails", () => {
  const all = circleLaps().samples.map((p) => ({
    ...p,
    counter: Math.floor(p.t / 20),
    beacon: p.t % 20 < 0.2 ? 1 : 0,
    speed: p.t % 20 < 1 ? 0 : p.speed,
    yaw: Math.sin(p.t / 15)
  }));
  const gate = gateAt(all, 0)!;
  const finish = gateAt(all, 15)!;
  for (const mode of ["circuit", "accel", "skidpad", "autocross", "endurance"] as const) {
    for (const config of [{ mode }, { mode, gate }, { mode, gate: { ...gate, direction: undefined }, finish }]) {
      const cache = new LapAnalysisCache();
      for (let count = 20; count < all.length; count += 20) {
        const input = all.slice(0, count).map((p) => ({ ...p }));
        input.at(-1)!.speed = 0;
        const from = all[Math.max(0, count - 22)].t;
        assert.deepEqual(analyze(input, config, cache, from), analyze(input, config));
      }
      const edited = { ...config, sectors: [gateAt(all, 5)!, gateAt(all, 13)!] };
      assert.deepEqual(analyze(all, edited, cache), analyze(all, edited));
    }
  }
});

test("analysis checkpoints stay bounded and an older edit still matches full analysis", () => {
  const cache = new LapAnalysisCache();
  const input = Array.from({ length: 12000 }, (_, i) => ({
    t: i / 50,
    x: i / 5,
    y: 0,
    speed: 10,
    counter: Math.floor(i / 1000)
  }));
  for (let count = 500; count <= input.length; count += 500) {
    const samples = input.slice(0, count);
    assert.deepEqual(analyze(samples, {}, cache, Math.max(0, count - 502) / 50), analyze(samples));
    for (const scan of cache.scans.values()) assert.ok(scan.states.length <= 4096);
  }
  input[5].speed = 5;
  assert.deepEqual(analyze(input, {}, cache, input[5].t), analyze(input));
});

test("a missed gate keeps its unknown sector positions when gates already follow lap order", () => {
  const samples = circleLaps().samples;
  const result = analyze(samples, {
    manual: [0, 20, 40, 60],
    sectors: [{ a: { x: 1000, y: 1000 }, b: { x: 1001, y: 1000 } }, gateAt(samples, 13)!]
  });
  const lap = result.laps.find((lap) => lap.complete)!;
  assert.ok(Number.isNaN(lap.sectors[0]));
  assert.ok(Number.isNaN(lap.sectors[1]));
  assert.ok(lap.sectors[2] > 0);
});

test("appending samples does not traverse a completed lap's cached grid", () => {
  const all = circleLaps().samples;
  const cache = new LapAnalysisCache();
  const config = { manual: [0, 20, 40, 60] };
  const result = analyze(all.slice(0, 900), config, cache);
  let reads = 0;
  for (const lap of result.laps.filter((lap) => lap.complete)) {
    for (const point of lap.grid) {
      const { distance, time } = point;
      Object.defineProperties(point, {
        distance: {
          get: () => {
            reads++;
            return distance;
          }
        },
        time: {
          get: () => {
            reads++;
            return time;
          }
        }
      });
    }
  }
  analyze(all.slice(0, 920), config, cache, all[898].t);
  assert.equal(reads, 0);
});

test("Track Map sector labels follow lap crossing order when gates are added in reverse", () => {
  const g = globalThis as any;
  g.document = Object.assign(new EventTarget(), { createElement: () => new Element(), activeElement: null });
  g.window = Object.assign(g.window ?? new EventTarget(), { devicePixelRatio: 1 });
  g.matchMedia = () => ({ matches: false });
  const labels: string[] = [];
  const canvas = new Element();
  canvas.getContext = () =>
    new Proxy(
      {},
      {
        get: (_, key) => (key === "fillText" ? (text: string) => labels.push(text) : () => ({ width: 0 })),
        set: () => true
      }
    );
  g.document.createElement = () => canvas;
  const renderer: any = new LapRenderer(new Element() as any, false);
  renderer.build = () => {};
  renderer.drawTrace = () => {};
  const samples = circleLaps().samples;
  const sectors = [gateAt(samples, 13)!, gateAt(samples, 5)!];
  const result = analyze(samples, { manual: [0, 20, 40, 60], sectors });
  const lap = result.laps.find((l) => l.complete)!;
  renderer.render({
    view: "map",
    split: 0.55,
    result,
    settings: { config: { sectors } },
    field: "",
    values: [],
    overlays: [],
    reference: lap.index,
    selected: null,
    time: null,
    version: 1
  });
  assert.deepEqual(
    labels.filter((label) => /^S\d$/.test(label)),
    ["S2", "S1"]
  );
});
