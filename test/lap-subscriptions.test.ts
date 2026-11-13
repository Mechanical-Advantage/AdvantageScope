// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import test from "node:test";
import { lapService } from "../src/hub/LapService";
import Tabs from "../src/hub/Tabs";
import LineGraphController from "../src/hub/controllers/LineGraphController";
import TabType from "../src/shared/TabType";
import Log from "../src/shared/log/Log";

test("lap inputs follow open lap views, including unselected satellite tabs", () => {
  const previousWindow = globalThis.window;
  const fields = lapService.fields;
  let calls = 0;
  const log = new Log();
  log.putNumber("imd", 0, 0);
  log.setMetadataString(
    "imd",
    JSON.stringify({ dbcSignal: "TTCS_IMDState", enumLabels: { "0": "Normal", "4": "Earth Fault" } })
  );
  (globalThis as any).window = { log };
  lapService.fields = () => {
    calls++;
    return ["latitude", "longitude", "lap_count"];
  };
  try {
    const tabs = Object.create(Tabs.prototype) as any;
    const plain = { type: TabType.Table, controller: { getActiveFields: () => ["table"] } };
    tabs.tabList = [plain];
    tabs.selectedTab = 0;
    const check = (lap: boolean) => {
      const before = calls;
      assert.deepEqual(
        [...tabs.getActiveFields()].sort(),
        ["imd", "table", ...(lap ? ["latitude", "longitude", "lap_count"] : [])].sort()
      );
      assert.equal(calls - before, lap ? 1 : 0);
    };
    check(false);
    for (const type of [TabType.TrackMap, TabType.Laps]) {
      tabs.tabList.push({ type, controller: { UUID: "satellite", getActiveFields: () => [] } });
      tabs.activeSatellites = ["satellite"];
      check(true);
      tabs.tabList.pop();
      check(false);
    }
    const graph = Object.create(LineGraphController.prototype) as any;
    graph.getActiveFields = () => [];
    graph.lapMode = "time";
    tabs.tabList.push({ type: TabType.LineGraph, controller: graph });
    check(false);
    for (const mode of ["lapTime", "distance"]) {
      graph.lapMode = mode;
      check(true);
      graph.lapMode = "time";
      check(false);
    }
    graph.lapMode = "lapTime";
    tabs.tabList.push({ type: TabType.TrackMap, controller: { getActiveFields: () => [] } });
    tabs.tabList.pop();
    check(true);
    tabs.tabList.pop();
    check(false);
  } finally {
    lapService.fields = fields;
    globalThis.window = previousWindow;
  }
});
