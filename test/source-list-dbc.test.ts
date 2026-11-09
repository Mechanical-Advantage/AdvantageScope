// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import test from "node:test";
import SourceList from "../src/hub/SourceList";
import { SourceListItemState } from "../src/shared/SourceListConfig";
import Log from "../src/shared/log/Log";
import LoggableType from "../src/shared/log/LoggableType";

const liveKey = "vehicles/test/powertrain/inverter/motor_temperature";
const signal = "INV_MotorTemp";

function item(logType = "Number", dbcSignal: string | undefined = signal): SourceListItemState {
  return { type: "test", logKey: liveKey, logType, dbcSignal, visible: true, options: {} };
}

function field(log: Log, key: string, type = LoggableType.Number, dbcSignal = signal) {
  log.createBlankField(key, type);
  log.setMetadataString(key, JSON.stringify({ dbcSignal }));
}

function sourceList(log: Log, state: SourceListItemState[]) {
  (globalThis as any).window = { log, typeMemory: {} };
  const list = Object.create(SourceList.prototype) as any;
  list.state = state;
  list.config = { types: [{ key: "test", sourceTypes: ["Number", "String"], options: [] }] };
  list.supplementalStateSuppliers = [];
  list.refreshLastFields = new Set();
  list.refreshLastStructTypes = {};
  list.LIST = { children: state.map(() => ({})), childElementCount: state.length };
  const updated: string[] = [];
  const previews: string[] = [];
  list.updateItem = (_: unknown, state: SourceListItemState) => updated.push(state.logKey);
  list.updatePreview = (_: unknown, state: SourceListItemState) => previews.push(state.logKey);
  return { list, updated, previews };
}

test("refresh resolves a saved live key and exposes the resolved key in state and subscriptions", () => {
  const log = new Log();
  field(log, "INVERTER/INV_MotorTemp");
  const { list, updated, previews } = sourceList(log, [item()]);
  list.refresh();
  assert.equal(list.getState()[0].logKey, "INVERTER/INV_MotorTemp");
  assert.equal(list.getState(true).length, 1);
  assert.equal(JSON.parse(JSON.stringify(list.getState()))[0].dbcSignal, signal);
  assert.deepEqual(list.getActiveFields(), ["INVERTER/INV_MotorTemp"]);
  assert.ok(updated.includes("INVERTER/INV_MotorTemp"));
  assert.deepEqual(previews, ["INVERTER/INV_MotorTemp"]);
});

test("refresh distinguishes enum labels and raw values and scans once for several missing items", () => {
  const log = new Log();
  field(log, "INVERTER/INV_MotorTemp", LoggableType.String);
  field(log, "INVERTER/INV_MotorTemp/raw");
  let scans = 0;
  const getFieldKeys = log.getFieldKeys.bind(log);
  log.getFieldKeys = () => {
    scans++;
    return getFieldKeys();
  };
  const { list } = sourceList(log, [item("String"), item()]);
  list.refresh();
  assert.deepEqual(list.getActiveFields(), ["INVERTER/INV_MotorTemp", "INVERTER/INV_MotorTemp/raw"]);
  assert.equal(scans, 1);
  list.refresh();
  assert.equal(scans, 1);
});

test("refresh caches unresolved DBC lookups until fields or the log change", () => {
  const log = new Log();
  log.createBlankField("OTHER/Temperature", LoggableType.Number);
  let scans = 0;
  const getFieldKeys = log.getFieldKeys.bind(log);
  log.getFieldKeys = () => {
    scans++;
    return getFieldKeys();
  };
  const { list } = sourceList(log, [item()]);
  list.refresh();
  assert.equal(scans, 1);
  for (let i = 0; i < 20; i++) list.refresh();
  assert.equal(scans, 1);
  assert.deepEqual(list.getActiveFields(), [liveKey]);
  log.deleteField("OTHER/Temperature");
  field(log, "INVERTER/INV_MotorTemp");
  list.refresh();
  assert.equal(scans, 2);
  assert.deepEqual(list.getActiveFields(), ["INVERTER/INV_MotorTemp"]);

  const replacement = new Log();
  field(replacement, "NEW/Temperature");
  (globalThis as any).window.log = replacement;
  list.refresh();
  assert.deepEqual(list.getActiveFields(), ["NEW/Temperature"]);
});

test("refresh releases the previous log when all replacement fields are available directly", () => {
  const log = new Log();
  field(log, "INVERTER/INV_MotorTemp");
  const { list } = sourceList(log, [item()]);
  list.refresh();
  assert.equal(list.dbcLookup.log, log);
  assert.deepEqual(list.getActiveFields(), ["INVERTER/INV_MotorTemp"]);

  const replacement = new Log();
  field(replacement, "INVERTER/INV_MotorTemp");
  (globalThis as any).window.log = replacement;
  list.refresh();
  assert.equal(list.dbcLookup, undefined);
  assert.deepEqual(list.getActiveFields(), ["INVERTER/INV_MotorTemp"]);
});

test("refresh leaves absent, ambiguous, and wrong-type matches missing and retries on later refresh", () => {
  const log = new Log();
  field(log, "OTHER/Temperature", LoggableType.Number, "OtherSignal");
  log.setMetadataString("OTHER/Temperature", "not JSON");
  const { list } = sourceList(log, [item()]);
  list.refresh();
  assert.equal(list.getState(true).length, 0);
  field(log, "A/Temperature");
  field(log, "B/Temperature");
  list.refresh();
  assert.deepEqual(list.getActiveFields(), [liveKey]);
  assert.equal(list.getState(true).length, 0);
  const { list: wrongType } = sourceList(log, [item("String")]);
  wrongType.refresh();
  assert.deepEqual(wrongType.getActiveFields(), [liveKey]);
  log.setMetadataString("B/Temperature", "{}");
  list.refresh();
  assert.deepEqual(list.getActiveFields(), ["A/Temperature"]);
});

test("refresh does not scan for available fields or missing derived and legacy fields", () => {
  const log = new Log();
  field(log, liveKey);
  const derived = item();
  derived.logKey = "derived/temperature";
  delete derived.dbcSignal;
  log.getFieldKeys = () => {
    throw new Error("unnecessary scan");
  };
  const { list } = sourceList(log, [item(), derived]);
  list.refresh();
  assert.deepEqual(list.getActiveFields(), [liveKey, derived.logKey]);
});

test("addField saves only a present DBC signal name and tolerates invalid metadata", () => {
  const log = new Log();
  field(log, liveKey);
  const { list } = sourceList(log, []);
  list.addListItem = (state: SourceListItemState) => list.state.push(state);
  for (const metadata of [JSON.stringify({ dbcSignal: signal }), "{}", "not JSON", "null", '{"dbcSignal":42}']) {
    log.setMetadataString(liveKey, metadata);
    list.addField(liveKey);
  }
  assert.equal(list.getState()[0].dbcSignal, signal);
  for (const saved of list.getState().slice(1)) assert.equal(Object.hasOwn(saved, "dbcSignal"), false);
});

test("setState resolves a layout loaded onto a log that is already open", () => {
  const log = new Log();
  field(log, "INVERTER/INV_MotorTemp");
  const { list } = sourceList(log, []);
  list.clear = () => (list.state = []);
  list.addListItem = (state: SourceListItemState) => list.state.push(state);
  list.setState([item()]);
  assert.deepEqual(list.getActiveFields(), ["INVERTER/INV_MotorTemp"]);
});
