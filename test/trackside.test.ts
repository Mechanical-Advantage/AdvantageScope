// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import TracksideController, { reorderTiles, tracksideGraphSources } from "../src/hub/controllers/TracksideController";
import SourceList from "../src/hub/SourceList";
import { channelProfile } from "../src/shared/display/ChannelProfile";
import {
  alertLine,
  dbcDefinition,
  isTracksideLive,
  limitUnit,
  parseLimitInputs,
  tileState
} from "../src/shared/Trackside";

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

test("limit prompt units match the tile's display unit, even before data arrives", () => {
  assert.equal(limitUnit(channelProfile({ name: "temperature", unit: "kelvin" })), "°C");
  assert.equal(limitUnit(channelProfile({ name: "pack_voltage", unit: "V" })), "V");
  assert.equal(limitUnit(channelProfile({ name: "ratio", unit: "1" })), "");
  assert.equal(limitUnit(channelProfile({ name: "IMD_State", enumLabels: { 0: "Normal" } })), "");
  assert.equal(limitUnit(channelProfile({ name: "mystery" })), "");
});

test("limit prompt treats blank as no limit, keeps zero and rejects bad ranges", () => {
  assert.deepEqual(parseLimitInputs("", "4.2"), { range: [null, 4.2] });
  assert.deepEqual(parseLimitInputs("2.8", " "), { range: [2.8, null] });
  assert.deepEqual(parseLimitInputs("", ""), { range: [null, null] });
  assert.deepEqual(parseLimitInputs("0", "90"), { range: [0, 90] });
  const order = { error: "The below limit must be lower than the above limit." };
  assert.deepEqual(parseLimitInputs("5", "5"), order);
  assert.deepEqual(parseLimitInputs("6", "5"), order);
  assert.ok("error" in parseLimitInputs("1e999", ""));
  assert.ok("error" in parseLimitInputs("", "invalid"));
});

test("limit input parsing preserves finite extremes on either side", () => {
  for (const value of [1e-7, 1e303, Number.MIN_VALUE, Number.MAX_VALUE, -1e-7, -1e303]) {
    assert.deepEqual(parseLimitInputs("", String(value)), { range: [null, value] });
    assert.deepEqual(parseLimitInputs(String(value), ""), { range: [value, null] });
  }
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

test("latest live runs retain status after disconnect and across reconnects", () => {
  const summary = { backend: "error" as const, hasFreshData: false, backendDetail: "", viewedRun: 0, runCount: 1 };
  assert.equal(isTracksideLive(summary, null, 100), true);
  const tile = tileState(
    "/Motor temp",
    112,
    profile,
    { high: 110 },
    null,
    isTracksideLive(summary, null, 100) ? { summary, freshness: "offline", age: 1 } : undefined
  );
  assert.equal(tile.severity, "ok");
  assert.equal(tile.state, "⊘ link lost");
  assert.equal(tile.freshness, "offline");
  assert.equal(alertLine([{ tile, value: 112, profile, limits: { high: 110 } }]).text, "");
  const connected = { ...summary, backend: "connected" as const, hasFreshData: true };
  assert.equal(isTracksideLive(connected, 100, 100), true);
  assert.equal(isTracksideLive(connected, 100, 90), false);
  assert.equal(isTracksideLive(connected, 100), true);
  assert.equal(isTracksideLive({ ...connected, runCount: 2 }, null), false);
  assert.equal(isTracksideLive({ ...connected, runCount: 2, viewedRun: 1 }, null), true);
  assert.equal(isTracksideLive(undefined, null, 100), false);
});

test("tile reorder uses insertion boundaries and retains hidden entries and source configuration", () => {
  const sources = ["a", "hidden", "b", "c", "d"].map((logKey) => ({
    type: "tile",
    logKey,
    logType: "Number",
    visible: logKey !== "hidden",
    options: { unit: "original" }
  }));
  const keys = (state: typeof sources) => state.map((source) => source.logKey);
  const moved = reorderTiles(sources, 3, 0);
  assert.deepEqual(keys(moved), ["d", "a", "hidden", "b", "c"]);
  assert.equal(moved[0], sources[4]);
  assert.deepEqual(keys(reorderTiles(sources, 0, 4)), ["hidden", "b", "c", "d", "a"]);
  assert.deepEqual(keys(reorderTiles(sources, 1, 3)), ["a", "hidden", "c", "b", "d"]);
  for (const [from, to] of [
    [1, 1],
    [1, 2],
    [-1, 0],
    [4, 0],
    [0, 5]
  ]) {
    assert.deepEqual(reorderTiles(sources, from, to), sources);
  }
  assert.deepEqual(reorderTiles([], 0, 0), []);
  const beforeHidden = ["a", "b", "hidden", "c"].map((logKey) => ({
    ...sources[0],
    logKey,
    visible: logKey !== "hidden"
  }));
  assert.deepEqual(reorderTiles(beforeHidden, 1, 1), beforeHidden);
  assert.deepEqual(reorderTiles(beforeHidden, 1, 2), beforeHidden);
  assert.deepEqual(keys(sources), ["a", "hidden", "b", "c", "d"]);
});

test("graph sources opt in independently of tile visibility and use stock styles", () => {
  const sources = ["Number", "Boolean", "String", "Number"].map((logType, index) => ({
    type: "tile",
    logKey: String(index),
    logType,
    visible: false,
    options: index < 3 ? { showInGraph: "true" } : {}
  }));
  const result = tracksideGraphSources(sources);
  assert.deepEqual(
    result.leftSources.map((s) => s.logKey),
    ["0"]
  );
  assert.deepEqual(
    result.discreteSources.map((s) => s.logKey),
    ["1", "2"]
  );
  assert.equal(result.leftSources[0].type, "stepped");
  assert.equal(result.leftSources[0].options.size, "normal");
  assert.equal(result.leftSources[0].visible, true);
  assert.equal(sources[0].visible, false);
  assert.deepEqual(tracksideGraphSources([sources[3]]), { leftSources: [], discreteSources: [] });
});

test("Trackside saves and restores graph toggles alongside tile options", () => {
  let sources = [{ type: "tile", logKey: "/temp", logType: "Number", visible: true, options: { showInGraph: "true" } }];
  const controller: TracksideController = Object.assign(Object.create(TracksideController.prototype), {
    sourceList: {
      getState: () => sources,
      setState: (state: typeof sources) => {
        sources = state;
      }
    },
    limits: {}
  });
  const saved = JSON.parse(JSON.stringify(controller.saveState()));
  sources = [];
  controller.restoreState(saved);
  assert.equal(sources[0].options.showInGraph, "true");
  assert.equal(tracksideGraphSources(sources).leftSources.length, 1);
  assert.equal(reorderTiles(sources, 0, 1)[0].options.showInGraph, "true");
});

test("graph opt-in rejects false and missing options without changing the source list", () => {
  const sources = [undefined, "false", "true"].map((showInGraph, index) => ({
    type: "tile",
    logKey: String(index),
    logType: "Number",
    visible: true,
    options: showInGraph === undefined ? {} : { showInGraph }
  }));
  const before = structuredClone(sources);
  assert.deepEqual(
    tracksideGraphSources(sources).leftSources.map((source) => source.logKey),
    ["2"]
  );
  assert.deepEqual(sources, before);
  assert.deepEqual(tracksideGraphSources([]), { leftSources: [], discreteSources: [] });
});
