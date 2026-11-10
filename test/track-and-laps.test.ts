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
import { lapService } from "../src/hub/LapService";
import { analyze, Sample } from "../src/shared/laps/LapEngine";
import Log from "../src/shared/log/Log";
import LapRenderer, { lapSummary } from "../src/shared/renderers/LapRenderer";

function controllerFor(legacyMap: boolean, log = new Log()): any {
  (globalThis as any).window = {
    log,
    selection: { getRenderTime: () => null, getSelectedTime: () => null, getCurrentLiveTime: () => null }
  };
  const controller: any = Object.create(LapController.prototype);
  controller.sources = LapSourceConfigs.map(() => {
    let state: unknown[] = [];
    return { getState: () => state, setState: (next: unknown[]) => (state = next) };
  });
  controller.sourceStates = [];
  controller.legacyMap = legacyMap;
  controller.view = legacyMap ? "map" : "laps";
  controller.mapField = "";
  controller.tableField = "";
  controller.split = 0.55;
  return controller;
}

test("an old Track Map restores to Map with its field as the map colour", () => {
  const controller = controllerFor(true);
  controller.restoreState({ sourceLists: true, field: "inv/motor_temp" });
  assert.equal(controller.view, "map");
  assert.equal(controller.mapField, "inv/motor_temp");
  assert.equal(controller.tableField, "");
});

test("an old Laps tab restores to Laps with its field as the table metric", () => {
  const controller = controllerFor(false);
  controller.restoreState({ sourceLists: true, field: "gps/speed" });
  assert.equal(controller.view, "laps");
  assert.equal(controller.mapField, "");
  assert.equal(controller.tableField, "gps/speed");
});

test("the view, split and both fields survive a save, and an old Laps tab keeps its own field for older versions", () => {
  const controller = controllerFor(false);
  controller.view = "split";
  controller.split = 0.4;
  controller.mapField = "a";
  controller.tableField = "b";
  const state = controller.saveState();
  assert.equal(state.field, "b", "an older version reads the Laps metric from field");
  const restored = controllerFor(true);
  restored.restoreState(state);
  assert.equal(restored.view, "split");
  assert.equal(restored.split, 0.4);
  assert.equal(restored.mapField, "a");
  assert.equal(restored.tableField, "b");
  restored.restoreState({ split: 5 });
  assert.equal(restored.split, 0.9, "a saved split outside the panes' range is clamped");
});

test("a field dropped in Split goes to the pane under the pointer", () => {
  const controller = controllerFor(true);
  const rects: Record<string, DOMRect> = {
    ".lap-table-pane": { left: 0, right: 500, top: 50, bottom: 600 } as DOMRect,
    ".lap-map-pane": { left: 500, right: 900, top: 50, bottom: 600 } as DOMRect
  };
  const root = { querySelector: (selector: string) => ({ getBoundingClientRect: () => rects[selector] }) };
  controller.view = "split";
  assert.equal(controller.dropTarget(root, 600, 200), "map");
  assert.equal(controller.dropTarget(root, 100, 200), "table");
  assert.equal(controller.dropTarget(root, 100, 20), undefined, "the header takes no field");
  controller.view = "map";
  assert.equal(controller.dropTarget(root, 100, 20), "map");
  controller.view = "laps";
  assert.equal(controller.dropTarget(root, 600, 200), "table");
});

test("switching to Laps fills the table metric without changing the map colour", () => {
  const log = new Log();
  for (let t = 0; t < 10; t++) {
    log.putNumber("gps/latitude", t, -37 + t * 1e-5);
    log.putNumber("gps/longitude", t, 145);
    log.putNumber("gps/speed", t, 10);
  }
  const controller = controllerFor(true, log);
  lapService.invalidate();
  let command = controller.getCommand();
  assert.equal(command.field, "");
  assert.equal(controller.tableField, "", "the map view leaves the metric alone");
  controller.view = "laps";
  command = controller.getCommand();
  assert.equal(command.field, "", "the map colour stays on laps");
  assert.equal(command.tableField, "gps/speed", "the table falls back to speed");
  assert.equal(command.view, "laps");
  controller.view = "map";
  assert.equal(controller.getCommand().field, "");
});

test("the summary names the timing source and counts gates apart from sectors", () => {
  const samples: Sample[] = [];
  for (let t = 0; t < 100; t += 0.1) {
    const a = (2 * Math.PI * t) / 20;
    samples.push({ t, x: 100 * Math.cos(a), y: 100 * Math.sin(a) });
  }
  const settings: any = { config: {} };
  const result = analyze(samples, {});
  assert.equal(
    lapSummary(settings, result),
    "Start/finish automatic · Laps from the automatic GPS line · Fractions 0.333, 0.667 · Shared across lap views"
  );
  const gate = { a: { x: 90, y: 0 }, b: { x: 110, y: 0 } };
  const sectors = [{ a: { x: -90, y: 0 }, b: { x: -110, y: 0 } }];
  const drawn = analyze(samples, { gate, sectors });
  assert.match(
    lapSummary({ config: { gate, sectors } } as any, drawn),
    /^Start\/finish drawn · Laps from the drawn line · 1 gate, 2 sectors/
  );
  const counted = { ...drawn, laps: drawn.laps.map((lap) => ({ ...lap, source: "counter" })) };
  assert.match(
    lapSummary({ config: { gate } } as any, counted),
    /^Drawn line configured, not timing · Laps from the lap counter/
  );
  assert.match(lapSummary(settings, { ...result, laps: [] }), /No laps yet/);
  const partial = { ...result, laps: result.laps.map((lap) => ({ ...lap, valid: false })) };
  assert.match(lapSummary(settings, partial), /No complete laps yet/);
});

test("the map scope restores from old saves and saves a flag older versions read", () => {
  const renderer: any = Object.create(LapRenderer.prototype);
  renderer.zoom = 1;
  renderer.pan = [0, 0];
  renderer.colorMode = "laps";
  renderer.scope = "session";
  renderer.restoreState({ overlaysOnly: true });
  assert.equal(renderer.scope, "overlaid");
  renderer.restoreState({ scope: "selected", overlaysOnly: false });
  assert.equal(renderer.scope, "selected");
  assert.equal(renderer.saveState().overlaysOnly, false);
  renderer.command = { selected: 2, overlays: [], reference: null, result: { laps: [{ index: 1 }, { index: 2 }] } };
  assert.deepEqual(
    renderer.visibleLaps().map((lap: any) => lap.index),
    [2]
  );
  renderer.command.selected = null;
  assert.deepEqual(renderer.visibleLaps(), [], "no selected row shows the whole session");
});

test("a saved split keeps both minimum widths after the window shrinks", () => {
  const renderer: any = Object.create(LapRenderer.prototype);
  renderer.body = { clientWidth: 900, clientHeight: 500, classList: { toggle() {} } };
  renderer.mapPane = { hidden: false };
  renderer.tablePane = { hidden: false, style: {} };
  renderer.handle = { hidden: false };
  renderer.layout({ view: "split", split: 0.9 });
  assert.equal(renderer.tablePane.style.flex, "0 0 64.44%");
  renderer.layout({ view: "split", split: 0.1 });
  assert.equal(renderer.tablePane.style.flex, "0 0 53.33%");
  renderer.body.clientWidth = 600;
  renderer.layout({ view: "split", split: 0.9 });
  assert.equal(renderer.shown.stacked, true);
  assert.equal(renderer.tablePane.style.flex, "0 0 68.00%");
});
