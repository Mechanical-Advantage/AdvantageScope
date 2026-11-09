// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import { test } from "node:test";
import LineGraphFilter from "../src/shared/LineGraphFilter";
import { SelectionMode } from "../src/shared/Selection";
import { analyze, interpolate, Sample, sectorBlocks, sectorBounds } from "../src/shared/laps/LapEngine";
import LineGraphRenderer, { LineGraphRendererCommand } from "../src/shared/renderers/LineGraphRenderer";

/** Records every canvas call and property write, with numbers rounded so the log is stable. */
function recordingContext(calls: string[]) {
  const round = (v: unknown) => (typeof v === "number" ? Number(v.toFixed(3)) : v);
  const target: Record<string, unknown> = {};
  return new Proxy(target, {
    get(_, key: string) {
      if (key in target) return target[key];
      return (...args: unknown[]) => {
        calls.push(`${key}(${JSON.stringify(args.map(round))})`);
        if (key === "measureText") {
          const width = String(args[0]).length * 6;
          return { width, actualBoundingBoxLeft: width / 2, actualBoundingBoxDescent: 3 };
        }
      };
    },
    set(_, key: string, value) {
      calls.push(`${key}=${JSON.stringify(round(value))}`);
      target[key] = value;
      return true;
    }
  });
}

class FakeElement extends EventTarget {
  style: Record<string, string> = {};
  clientWidth = 800;
  clientHeight = 400;
  width = 0;
  height = 0;
  hidden = false;
  classList = { add() {}, remove() {}, contains: () => false };
  constructor(private context?: unknown) {
    super();
  }
  getContext() {
    return this.context;
  }
  getBoundingClientRect() {
    return { x: 0, y: 0, left: 0, top: 0, right: this.clientWidth, bottom: this.clientHeight };
  }
}

/** A renderer on fake DOM elements. Returns the renderer, its canvas and the call log. */
function fakeLineGraph() {
  const calls: string[] = [];
  const canvas = new FakeElement(recordingContext(calls));
  const scroll = new FakeElement();
  const help = new FakeElement();
  const root = Object.assign(new FakeElement(), {
    getElementsByClassName: (name: string) =>
      [name === "line-graph-canvas" ? canvas : name === "line-graph-scroll" ? scroll : help] as unknown[],
    querySelector: () => null
  });
  const g = globalThis as any;
  g.window = Object.assign(g.window ?? new EventTarget(), {
    devicePixelRatio: 1,
    matchMedia: () => ({ matches: false }),
    preferences: { hasScrolledLineGraph: true },
    selection: { setHoveredTime() {}, getCurrentLiveTime: () => null }
  });
  g.document ??= { body: { classList: { contains: () => false } } };
  const renderer = new LineGraphRenderer(root as unknown as HTMLElement, true);
  return { renderer, canvas, root, calls };
}

const field = (color: string, offset: number) => ({
  timestamps: Array.from({ length: 200 }, (_, i) => i * 0.5),
  values: Array.from({ length: 200 }, (_, i) => 50 + 30 * Math.sin(i / 9 + offset)),
  color,
  type: "stepped" as const,
  size: "normal" as const,
  gaps: [{ t0: 40, t1: 42, v0: 60, v1: 55 }]
});

function sampleCommand(mode: "time" | "lapTime" | "distance"): LineGraphRendererCommand {
  const base: LineGraphRendererCommand = {
    timeRange: [0, 100],
    displayOffset: 0,
    selectionMode: SelectionMode.Static,
    selectedTime: 30,
    hoveredTime: 55,
    grabZoomRange: null,
    leftRange: [0, 100],
    rightRange: [0, 1],
    showLeftAxis: true,
    showRightAxis: false,
    leftTitle: "Speed [km/h]",
    rightTitle: "",
    leftUnits: null,
    rightUnits: null,
    leftFilter: LineGraphFilter.None,
    rightFilter: LineGraphFilter.None,
    priorityAxis: "left",
    leftFields: [field("#58a7ff", 0), field("#f4b860", 1)],
    rightFields: [],
    discreteFields: [],
    alerts: []
  };
  if (mode === "time") return base;
  return {
    ...base,
    lapMode: mode,
    xUnit: mode === "distance" ? "m" : "s",
    lapLabels: [
      { text: "Lap 1 (ref)  50.00 s  S1 16.00 s · S2 17.00 s · S3 17.00 s", color: "#58a7ff" },
      { text: "Lap 2  51.00 s  S1 +0.20 s · S2 +0.30 s · S3 +0.50 s", color: "#f4b860" }
    ],
    lapValues: ["61.2", "58.9"],
    sectorMarks: [
      { x: 33, label: "S2" },
      { x: 66, label: "S3" }
    ],
    deltaStrip: {
      fields: [
        {
          timestamps: [0, 50, 100],
          values: [0, 0.4, 1],
          color: "#f4b860",
          type: "smooth",
          size: "normal"
        }
      ],
      range: [-0.1, 1.1],
      title: "ΔT vs Lap 1 [s], + = slower",
      referenceLabel: "Lap 1 (ref)",
      readout: [{ text: "+0.40 s", color: "#f4b860" }]
    }
  };
}

const digest = (calls: string[]) => createHash("sha256").update(calls.join("\n")).digest("hex").slice(0, 16);

// Recorded from the renderer on mur-voir/main (0b9ae435), before the sector bar existed.
const STOCK = {
  time: "71a8911c8a12fce3",
  lapTime: "61ce5e552ed04ed3",
  distance: "29444ac18903a1ac"
};

test("without a sector bar the graph makes the same drawing calls as mur-voir/main", () => {
  for (const mode of ["time", "lapTime", "distance"] as const) {
    const { renderer, calls } = fakeLineGraph();
    renderer.render(sampleCommand(mode));
    assert.ok(calls.length > 100, mode);
    assert.equal(digest(calls), STOCK[mode], mode);
  }
  // A reference lap with one sector gives an empty bar, which draws nothing.
  const { renderer, calls } = fakeLineGraph();
  renderer.render({ ...sampleCommand("distance"), sectorBar: { lap: 1, blocks: [] } });
  assert.equal(digest(calls), STOCK.distance);
});

const bar = {
  lap: 1,
  blocks: [
    { start: 0, end: 33, label: "S1" },
    { start: 33, end: 66, label: "S2" },
    { start: 66, end: 100, label: "S3" }
  ]
};

test("the split bar labels each sector and shades every other one", () => {
  const { renderer, calls } = fakeLineGraph();
  renderer.render({ ...sampleCommand("distance"), sectorBar: bar });
  for (const label of ["S1", "S2", "S3"])
    assert.ok(
      calls.some((c) => c.startsWith(`fillText(["${label}"`)),
      label
    );
  const hits = (renderer as any).sectorBarHits;
  assert.deepEqual(
    hits.blocks.map((b: any) => b.label),
    ["S1", "S2", "S3"]
  );
  // Only S2 is shaded. Its band starts where its block starts and runs the plot's full height.
  const s2 = hits.blocks[1];
  const shading = calls.filter((c) => c.startsWith("fillRect(") && c.includes(`[${s2.x0},${hits.bottom + 2},`));
  assert.equal(shading.length, 1);
  assert.equal(calls.filter((c) => c.startsWith("fillRect(") && c.includes(`,${hits.bottom + 2},`)).length, 1);
});

test("double-clicking a block zooms the graph to that sector and tells the Track Map", () => {
  const { renderer, canvas, root } = fakeLineGraph();
  renderer.render({ ...sampleCommand("distance"), sectorBar: bar });
  const hits = (renderer as any).sectorBarHits;
  let detail: unknown;
  root.addEventListener("sector-zoom", (event) => (detail = (event as CustomEvent).detail));
  const click = (x: number, y: number) =>
    canvas.dispatchEvent(Object.assign(new Event("dblclick"), { clientX: x, clientY: y }));
  // Below the bar, in the plot, a double-click does nothing.
  click((hits.blocks[1].x0 + hits.blocks[1].x1) / 2, hits.bottom + 20);
  assert.equal(detail, undefined);
  click((hits.blocks[1].x0 + hits.blocks[1].x1) / 2, (hits.top + hits.bottom) / 2);
  assert.deepEqual(detail, { lap: 1, range: [33, 66] });
  assert.deepEqual((renderer as any).lapViewport.update("distance", [0, 100]), [33, 66]);
});

/** Five laps of a 40 m circle at about 12.6 m/s, each a little slower than the last. */
function circleSamples(): Sample[] {
  const samples: Sample[] = [];
  let angle = 0;
  for (let t = 0; t <= 105; t += 0.05) {
    const period = 20 + Math.floor(t / 20) * 0.2;
    angle += (2 * Math.PI * 0.05) / period;
    samples.push({ t, x: 40 * Math.sin(angle), y: 40 * Math.cos(angle) - 40, speed: (2 * Math.PI * 40) / period });
  }
  return samples;
}
const quarterGate = { a: { x: 30, y: -40 }, b: { x: 50, y: -40 } };
const halfGate = { a: { x: 0, y: -70 }, b: { x: 0, y: -90 } };

// Recorded from LapEngine on mur-voir/main (0b9ae435).
const STOCK_LAPS = {
  fractions: "3d4c29bc4abf7e88",
  gates: "504d89d76f06ea51"
};

test("lap results match mur-voir/main", () => {
  const configs = { fractions: { fractions: [0.25, 0.6] }, gates: { sectors: [quarterGate, halfGate] } };
  for (const [name, config] of Object.entries(configs)) {
    const result = analyze(circleSamples(), config);
    assert.ok(result.laps.length >= 4, name);
    assert.ok(
      result.laps.filter((l) => l.valid).every((l) => l.sectors.length === 3 && l.sectors.every(Number.isFinite)),
      name
    );
    assert.equal(
      createHash("sha256").update(JSON.stringify(result)).digest("hex").slice(0, 16),
      STOCK_LAPS[name as keyof typeof STOCK_LAPS],
      name
    );
  }
});

test("split bar edges sit where the Laps table's sector times end", () => {
  for (const config of [{ fractions: [0.25, 0.6] }, { sectors: [quarterGate, halfGate] }]) {
    const result = analyze(circleSamples(), config);
    for (const lap of result.laps.filter((l) => l.valid)) {
      const blocks = sectorBlocks(lap);
      assert.deepEqual(
        blocks.map((b) => b.label),
        ["S1", "S2", "S3"]
      );
      assert.equal(blocks[0].start, 0);
      assert.equal(blocks[2].end, lap.distance);
      const timeAt = (d: number) =>
        interpolate(
          lap.grid.map((p) => p.distance),
          lap.grid.map((p) => p.time),
          d
        );
      // Driving each block takes the time the Laps table shows for that sector.
      blocks.forEach((b, i) => assert.ok(Math.abs(timeAt(b.end) - timeAt(b.start) - lap.sectors[i]) < 0.01));
    }
  }
  // A quarter of the way round the circle is the quarter gate, and half way is the half gate.
  const lap = analyze(circleSamples(), { sectors: [quarterGate, halfGate] }).laps.find((l) => l.valid)!;
  const [s1, s2] = sectorBlocks(lap);
  assert.ok(Math.abs(s1.end / lap.distance - 0.25) < 0.01);
  assert.ok(Math.abs(s2.end / lap.distance - 0.5) < 0.01);
});

test("no split bar without sectors, and no block for a missed gate", () => {
  const one = analyze(circleSamples(), { fractions: [] }).laps.find((l) => l.valid)!;
  assert.equal(one.sectors.length, 1);
  assert.deepEqual(sectorBlocks(one), []);
  const missed = { a: { x: 500, y: 500 }, b: { x: 510, y: 500 } };
  const lap = analyze(circleSamples(), { sectors: [quarterGate, missed] }).laps.find((l) => l.valid)!;
  assert.deepEqual(
    sectorBlocks(lap).map((b) => b.label),
    ["S1"]
  );
});

test("a sector's box on the map holds only that stretch of the lap", () => {
  const result = analyze(circleSamples(), { sectors: [quarterGate, halfGate] });
  const lap = result.laps.find((l) => l.valid)!;
  const [, s2] = sectorBlocks(lap);
  // S2 runs from the circle's east point (40, -40) to its south point (0, -80).
  const [xmin, xmax, ymin, ymax] = sectorBounds(lap, result.samples, [s2.start, s2.end])!;
  assert.ok(Math.abs(xmin) < 1 && Math.abs(xmax - 40) < 1, `${xmin} ${xmax}`);
  assert.ok(Math.abs(ymin + 80) < 1 && Math.abs(ymax + 40) < 1, `${ymin} ${ymax}`);
});
