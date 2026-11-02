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
      restoreState: (next: any) => (state = structuredClone(next)),
      addTab: () => {
        state.tabs.push({ type: TabType.LineGraph, controllerUUID: String(state.tabs.length) });
        state.selected = state.tabs.length - 1;
      },
      setSelected: (index: number) => (state.selected = index)
    },
    healthStrip: { state: {}, render() {} },
    selection: { getCurrentLiveTime: () => null, setTimelineRange() {}, lock() {} }
  };
  trackside.applyTracksideLayout();
  state.tabs[0].controller.rightSources = [{ logKey: "user/rpm" }];
  keys = ["vehicles/mur27/dynamics/vehicle_speed", "vehicles/mur27/powertrain/motor_speed"];
  (trackside as any).updateTracksideLayout?.();
  assert.equal(state.tabs[0].controller.leftSources[0]?.logKey, keys[0]);
  assert.equal(state.tabs[0].controller.rightSources[0]?.logKey, "user/rpm");
});
