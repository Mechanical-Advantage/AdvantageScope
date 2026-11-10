// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { analyze, LapResult, Sample, sectorBlocks, sectorBounds } from "../src/shared/laps/LapEngine";
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
  const context = new Proxy(
    {},
    {
      get: (_, key) => (key === "arc" ? (...args: number[]) => arcs.push(args) : () => ({ width: 0 })),
      set: () => true
    }
  );
  renderer.canvas.getContext = () => context;
  for (const scope of ["selected", "overlaid"]) {
    renderer.scope = scope;
    arcs.length = 0;
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
    const point = renderer.transform(renderer.sampleAt(1));
    assert.ok(
      arcs.some(([x, y, radius]) => radius === 6 && Math.abs(x - point.x) < 1e-6 && Math.abs(y - point.y) < 1e-6),
      scope
    );
  }
});
