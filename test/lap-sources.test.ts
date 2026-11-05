// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { LapService, lapService } from "../src/hub/LapService";
import SourceList from "../src/hub/SourceList";
import LapController from "../src/hub/controllers/LapController";
import { LapSourceConfigs } from "../src/hub/controllers/LapController_Config";
import Log from "../src/shared/log/Log";

function node(list?: any): any {
  return {
    children: [],
    classList: { add() {} },
    firstElementChild: {},
    addEventListener(type: string, callback: () => void) {
      (this.listeners ??= {})[type] = callback;
    },
    getBoundingClientRect: () => ({ x: 0, y: 0, width: 10, height: 10 }),
    getElementsByTagName: () => [],
    getElementsByClassName(name: string) {
      return [((this.controls ??= {})[name] ??= node())];
    },
    cloneNode: () => node(list),
    appendChild(item: any) {
      this.children.push(item);
    },
    remove() {
      list.children.splice(list.children.indexOf(this), 1);
    }
  };
}

test("stock source lists auto-advance, replace occupied roles and reject non-numbers", () => {
  const log = new Log();
  for (const key of ["a", "b", "c", "d"]) log.putNumber(key, 0, 1);
  log.putBoolean("flag", 0, true);
  (globalThis as any).window = { log, sendMainMessage() {} };
  const list: any = Object.create(SourceList.prototype);
  Object.assign(list, {
    UUID: "lap-sources-test",
    config: LapSourceConfigs[0],
    state: [],
    supplementalStateSuppliers: [],
    LIST: node(),
    events: new AbortController(),
    updateItem() {},
    updateHandIcon() {}
  });
  list.ITEM_TEMPLATE = node(list.LIST);
  list.addField("a");
  list.addField("b");
  list.addField("c");
  list.addField("d");
  list.addField("flag");
  assert.deepEqual(
    list.getState().map((item: any) => [item.type, item.logKey]),
    [
      ["longitude", "b"],
      ["yaw", "c"],
      ["latitude", "d"]
    ]
  );
  list.LIST.children.at(-1).getElementsByClassName("type")[0].listeners.click();
  SourceList.typePromptCallbacks[list.UUID]({ ...list.getState().at(-1), type: "longitude" });
  assert.deepEqual(
    list.getState().map((item: any) => [item.type, item.logKey]),
    [
      ["yaw", "c"],
      ["longitude", "d"]
    ]
  );
});

test("cleared auto-detected roles stay empty until a new log, missing paths survive lazy loading", () => {
  const log = new Log();
  log.putNumber("latitude", 0, -37);
  (globalThis as any).window = { log };
  const service = new LapService();
  service.fields();
  assert.equal(service.settings.latitude, "latitude");
  service.setSource("latitude", "");
  service.fields();
  service.fields();
  assert.equal(service.settings.latitude, "");
  service.setSource("longitude", "later/longitude");
  service.fields();
  assert.equal(service.settings.longitude, "later/longitude");
  (globalThis as any).window.log = new Log();
  (globalThis as any).window.log.putNumber("latitude", 0, -38);
  service.fields();
  assert.equal(service.settings.latitude, "latitude");
});

test("old layout strings and empty roles restore into both tabs' source lists", () => {
  const log = new Log();
  log.putNumber("latitude", 0, -37);
  log.putNumber("old/gps", 0, -37);
  (globalThis as any).window = { log };
  const make = () => {
    const controller: any = Object.create(LapController.prototype);
    controller.sources = LapSourceConfigs.map(() => {
      let state: any[] = [];
      return {
        getState: () => state,
        setState: (next: any[]) => {
          state = next;
        }
      };
    });
    controller.sourceStates = [];
    return controller;
  };
  const first = make(),
    second = make();
  first.restoreState({ settings: { latitude: "old/gps", longitude: "" } });
  second.syncSources();
  assert.equal(second.sources[0].getState()[0].logKey, "old/gps");
  assert.equal(lapService.settings.longitude, "");
  first.sources[0].setState([]);
  first.syncSources();
  second.syncSources();
  assert.deepEqual(second.sources[0].getState(), []);
  lapService.fields();
  assert.equal(lapService.settings.latitude, "");
});

function positionList(fields: string[], state: any[]) {
  const log = new Log();
  for (const key of fields) log.putNumber(key, 0, 1);
  (globalThis as any).window = { log, sendMainMessage() {} };
  const list: any = Object.create(SourceList.prototype);
  Object.assign(list, {
    UUID: "lap-sources-test",
    config: LapSourceConfigs[0],
    state: [],
    supplementalStateSuppliers: [],
    LIST: node(),
    events: new AbortController(),
    updateItem() {},
    updateHandIcon() {}
  });
  list.ITEM_TEMPLATE = node(list.LIST);
  for (const item of state) list.addListItem(item);
  return list;
}
const roles = (list: any) => Object.fromEntries(list.getState().map((item: any) => [item.type, item.logKey]));
const row = (type: string, logKey: string) => ({ type, logKey, logType: "Number", visible: true, options: {} });

test("a dropped field goes to the role it is named after, even on an auto-filled list", () => {
  const list = positionList(["rear_lat", "rear_lon"], [row("latitude", "front_lat"), row("longitude", "front_lon")]);
  list.addField("rear_lat");
  list.addField("rear_lon");
  assert.deepEqual(roles(list), { latitude: "rear_lat", longitude: "rear_lon" });
});

test("fields with other names fill empty roles, then take a full list's roles in turn", () => {
  const list = positionList(["a", "b", "c"], [row("latitude", "x"), row("longitude", "y")]);
  list.addField("a");
  assert.deepEqual(roles(list), { latitude: "x", longitude: "y", yaw: "a" });
  list.addField("b");
  list.addField("c");
  assert.deepEqual(roles(list), { latitude: "b", longitude: "c", yaw: "a" });
});

test("a second log replaces the first log's paths, which stay missing only within one log", () => {
  const log = new Log();
  log.putNumber("first/lap_counter", 0, 1);
  (globalThis as any).window = { log };
  const service = new LapService();
  service.fields();
  assert.equal(service.settings.counter, "first/lap_counter");
  service.setSource("beacon", "first/not_loaded_yet");
  service.fields();
  assert.equal(service.settings.beacon, "first/not_loaded_yet");
  // An empty log is what the hub holds while the next file opens.
  (globalThis as any).window.log = new Log();
  service.fields();
  assert.equal(service.settings.counter, "first/lap_counter");
  (globalThis as any).window.log.putNumber("second/lap_counter", 0, 1);
  service.fields();
  assert.equal(service.settings.counter, "second/lap_counter");
  assert.equal(service.settings.beacon, "");
});

test("a layout's empty or malformed roles leave auto-detection on", () => {
  const log = new Log();
  log.putNumber("gps/latitude", 0, -37);
  (globalThis as any).window = { log };
  const controller: any = Object.create(LapController.prototype);
  controller.sources = LapSourceConfigs.map(() => ({ getState: () => [], setState() {} }));
  controller.sourceStates = [];
  lapService.setSource("latitude", "");
  (globalThis as any).window.log = new Log();
  (globalThis as any).window.log.putNumber("gps/latitude", 0, -37);
  controller.restoreState({ settings: { latitude: "", longitude: 5 } });
  lapService.fields();
  assert.equal(lapService.settings.latitude, "gps/latitude");
  assert.equal(lapService.settings.longitude, "");
});

test("a layout's paths that aren't in the open log give way to auto-detection", () => {
  const log = new Log();
  log.putNumber("gps/latitude", 0, -37);
  (globalThis as any).window = { log };
  const controller: any = Object.create(LapController.prototype);
  controller.sources = LapSourceConfigs.map(() => ({ getState: () => [], setState() {} }));
  controller.sourceStates = [];
  lapService.fields();
  controller.restoreState({ settings: { latitude: "other/car/latitude" } });
  lapService.fields();
  assert.equal(lapService.settings.latitude, "gps/latitude");
});

test("auto-detection skips fields that aren't numbers", () => {
  const log = new Log();
  log.putString("car/lap_counter", 0, "three");
  log.putBoolean("car/lap_beacon", 0, true);
  (globalThis as any).window = { log };
  const service = new LapService();
  service.fields();
  assert.equal(service.settings.counter, "");
  assert.equal(service.settings.beacon, "");
  log.putNumber("timing/lap_counter", 0, 3);
  service.fields();
  assert.equal(service.settings.counter, "timing/lap_counter");
});
