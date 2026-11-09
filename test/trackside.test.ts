// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import TracksideController from "../src/hub/controllers/TracksideController";
import SourceList from "../src/hub/SourceList";
import { channelProfile } from "../src/shared/display/ChannelProfile";
import { alertLine, dbcDefinition, tileState } from "../src/shared/Trackside";

const profile = channelProfile({ name: "Motor temp", unit: "degC" });
const definition = { name: "IMD_State", values: { 0: "Normal", 4: "Earth Fault", 5: "Ground Fault Warning" } };

test("tiles use display units for limits and do not ship numeric alarms", () => {
  const kelvin = channelProfile({ name: "temperature", unit: "kelvin" });
  assert.equal(tileState("/Motor temp", 385.15, kelvin).severity, "ok");
  assert.equal(tileState("/Motor temp", 385.15, kelvin, { high: 110 }).severity, "critical");
  assert.equal(tileState("/Motor temp", 110, profile, { high: 110 }).severity, "ok");
  assert.equal(tileState("/Motor temp", -1, profile, { low: 0 }).severity, "critical");
  assert.equal(tileState("/missing", undefined, profile).text, "—");
  assert.equal(tileState("/bool", false, profile).text, "false");
});

test("DBC classification controls tile severity and rejects non-DBC metadata", () => {
  assert.equal(tileState("/IMD_State", 4, profile, {}, definition).severity, "critical");
  assert.equal(tileState("/IMD_State", 5, profile, {}, definition).severity, "warn");
  assert.equal(tileState("/IMD_State", 0, profile, {}, definition).severity, "ok");
  assert.equal(dbcDefinition(JSON.stringify({ name: "Fault" }), "/Fault"), null);
  assert.equal(dbcDefinition(JSON.stringify({ dbcSignal: "FaultFlags" }), "/raw"), null);
});

test("live freshness suppresses alarms and distinguishes stale, offline and lost link", () => {
  const summary = { backend: "connected" as const, hasFreshData: true, backendDetail: "", viewedRun: 0, runCount: 1 };
  const stale = tileState("/Motor temp", 112, profile, { high: 110 }, null, { summary, freshness: "stale", age: 2.1 });
  assert.equal(stale.state, "◇ 2.1 s");
  assert.equal(stale.severity, "ok");
  assert.match(stale.text, /112/);
  assert.equal(
    tileState("/x", 1, profile, {}, null, { summary, freshness: "offline", age: 7 }).state,
    "⊘ offline 7.0 s"
  );
  assert.equal(
    tileState("/x", 1, profile, {}, null, { summary: { ...summary, backend: "error" }, freshness: "online", age: 1 })
      .state,
    "⊘ link lost"
  );
});

test("alert line names current faults and limit violations and clears on recovery", () => {
  const fault = { tile: tileState("/IMD_State", 4, profile, {}, definition), value: 4, profile, fault: true };
  const limits = { high: 110 };
  const high = { tile: tileState("/Motor temp", 112, profile, limits), value: 112, profile, limits };
  assert.match(alertLine([fault, high]).text, /^Earth Fault · IMD_State   ·   Motor temp 112/);
  assert.match(alertLine([high]).text, /above 110$/);
  assert.equal(alertLine([fault, high]).severity, "critical");
  assert.equal(alertLine([{ ...high, tile: tileState("/Motor temp", 90, profile, limits) }]).text, "");
});

test("warning-only alerts remain amber and unknown live fields do not alert", () => {
  const warning = tileState("/IMD_State", 5, profile, {}, definition);
  assert.equal(alertLine([{ tile: warning, value: 5, profile, fault: true }]).severity, "warn");
  assert.equal(alertLine([{ tile: warning, value: 5, profile, fault: true }]).text, "Ground Fault Warning · IMD_State");
  const summary = { backend: "connected" as const, hasFreshData: false, backendDetail: "", viewedRun: 0, runCount: 1 };
  assert.equal(
    tileState("/IMD_State", 4, profile, {}, definition, { summary, freshness: "unknown", age: null }).severity,
    "ok"
  );
});

test("removed tiles stop contributing limits and active subscriptions", () => {
  const source = { type: "tile", logKey: "/Motor temp", logType: "Number", visible: true, options: {} };
  const sourceList = Object.assign(Object.create(SourceList.prototype), { state: [source] });
  const controller: TracksideController = Object.assign(Object.create(TracksideController.prototype), {
    sourceList,
    limits: { "/Motor temp": { high: 110 }, "/removed": { high: 0 } }
  });
  assert.deepEqual(controller.getLimits(), { "/Motor temp": { high: 110 } });
  assert.deepEqual(controller.getActiveFields(), ["/Motor temp"]);
  sourceList.state = [];
  assert.deepEqual(controller.getLimits(), {});
  assert.deepEqual(controller.getActiveFields(), []);
});

test("healthy live tiles have no status dot and keep alarm text", () => {
  const summary = { backend: "connected" as const, hasFreshData: true, backendDetail: "", viewedRun: 0, runCount: 1 };
  const live = { summary, freshness: "online" as const, age: 0.1 };
  assert.equal(tileState("/Motor temp", 90, profile, { high: 110 }, null, live).state, "");
  assert.equal(tileState("/Motor temp", 112, profile, { high: 110 }, null, live).state, "Alarm");
});
