// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { strict as assert } from "node:assert";
import { test } from "node:test";
import LapRenderer from "../src/shared/renderers/LapRenderer";

class Element extends EventTarget {
  classList = { add() {}, toggle() {} };
  style = {};
  className = "";
  tabIndex = 0;
  title = "";
  append() {}
  setAttribute() {}
  contains(element: unknown) {
    return element === this;
  }
  matches() {
    return true;
  }
}

test("a setup press holds rebuilds through field blur and button click", async () => {
  const document = Object.assign(new EventTarget(), {
    createElement: () => new Element(),
    activeElement: null as Element | null
  });
  (globalThis as any).document = document;
  (globalThis as any).window ??= new EventTarget();
  const renderer: any = new LapRenderer(new Element() as any);
  const panel = new Element();
  renderer.setup = panel;
  renderer.holdRebuildDuringPress(panel);
  renderer.scrollSensor = { periodic() {} };
  let builds = 0;
  renderer.build = () => builds++;
  const command = { field: "", view: "laps", split: 0.55, version: 1, settings: {} };
  renderer.render(command);
  assert.equal(builds, 1);
  document.activeElement = panel;
  renderer.render({ ...command, version: 2 });
  assert.equal(builds, 1, "a focused input holds rebuilds");
  panel.dispatchEvent(new Event("pointerdown"));
  document.activeElement = null;
  renderer.render({ ...command, version: 3 });
  assert.equal(builds, 1, "the change on blur must leave the pressed button attached");
  document.dispatchEvent(new Event("pointerup"));
  renderer.render({ ...command, version: 4 });
  assert.equal(builds, 1, "the button must survive until click fires");
  await new Promise((resolve) => setTimeout(resolve, 10));
  renderer.render({ ...command, version: 4 });
  assert.equal(builds, 2);
  panel.dispatchEvent(new Event("pointerdown"));
  document.dispatchEvent(new Event("pointercancel"));
  await new Promise((resolve) => setTimeout(resolve, 10));
  renderer.render({ ...command, version: 5 });
  assert.equal(builds, 3, "a cancelled press releases the rebuild hold");
});

test("layout save drops a sector fit and keeps a later manual view", () => {
  const renderer: any = Object.create(LapRenderer.prototype);
  renderer.zoom = 2.1;
  renderer.pan = [-147, -23];
  renderer.viewBeforeSector = { zoom: 1, pan: [0, 0] };
  renderer.scope = "session";
  renderer.colorMode = "laps";
  const state = renderer.saveState();
  assert.equal(state.zoom, 1);
  assert.deepEqual(state.pan, [0, 0]);
  assert.equal(renderer.zoom, 2.1);
  renderer.restoreState(state);
  assert.equal(renderer.zoom, 1);
  assert.deepEqual(renderer.pan, [0, 0]);
  assert.equal(renderer.viewBeforeSector, undefined);
  renderer.zoom = 3;
  renderer.pan = [10, 10];
  assert.equal(renderer.saveState().zoom, 3);
  assert.deepEqual(renderer.saveState().pan, [10, 10]);
});
