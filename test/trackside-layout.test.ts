// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import * as trackside from "../src/hub/TracksideLayout";
import TabType from "../src/shared/TabType";

test("Trackside fills delayed signals without replacing user edits", () => {
  let keys: string[] = [];
  let state: any = { selected: 0, tabs: [] };
  (globalThis as any).window = {
    log: { getFieldKeys: () => keys, getTimestampRange: () => [0, 30] },
    tabs: {
      saveState: () => structuredClone(state),
      restoreState: (next: any) => {
        state = structuredClone(next);
        for (const tab of state.tabs) {
          for (const axis of ["leftSources", "rightSources"]) {
            for (const field of tab.controller?.[axis] ?? []) field.normalized = true;
          }
        }
      },
      addTab: () => {
        state.tabs.push({ type: TabType.LineGraph, controllerUUID: String(state.tabs.length) });
        state.selected = state.tabs.length - 1;
      },
      setSelected: (index: number) => (state.selected = index)
    },
    healthStrip: { state: { tiles: [] }, render() {} },
    selection: { getCurrentLiveTime: () => null, setTimelineRange() {}, lock() {} }
  };
  trackside.applyTracksideLayout();
  state.tabs[0].controller.rightSources = [{ logKey: "user/rpm" }];
  keys = ["vehicles/mur27/dynamics/vehicle_speed", "vehicles/mur27/powertrain/motor_speed"];
  trackside.updateTracksideLayout();
  assert.equal(state.tabs[0].controller.leftSources[0]?.logKey, keys[0]);
  assert.equal(state.tabs[0].controller.rightSources[0]?.logKey, "user/rpm");
  keys.push("vehicles/mur27/powertrain/torque_command");
  trackside.updateTracksideLayout();
  assert.equal(state.tabs[1].controller.leftSources.length, 1);
  state.selected = 0;
  state.tabs[1].controller.showThresholds = false;
  keys.push("vehicles/mur27/powertrain/torque_feedback");
  trackside.updateTracksideLayout();
  assert.equal(state.tabs[1].controller.leftSources.length, 2);
  assert.equal(state.tabs[1].controller.showThresholds, false);
  assert.equal(state.selected, 0);
  trackside.updateTracksideLayout();
  assert.equal(state.tabs[1].controller.leftSources.length, 2);
  // Removed preset tabs must never be recreated by a late catalogue update.
  keys = [];
  trackside.applyTracksideLayout();
  const tiles = (globalThis as any).window.healthStrip.state.tiles;
  tiles[0].warn = 123;
  trackside.applyTracksideLayout();
  assert.equal(tiles.length, 9);
  assert.equal(tiles[0].warn, 123);
  state.tabs = [];
  keys.push("vehicles/mur27/dynamics/vehicle_speed");
  trackside.updateTracksideLayout();
  assert.equal(state.tabs.length, 0);
});
