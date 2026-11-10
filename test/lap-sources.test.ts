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
import { geographicGate } from "../src/shared/laps/LapEngine";
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
    refreshLastFields: new Set(),
    refreshLastStructTypes: {},
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
    refreshLastFields: new Set(),
    refreshLastStructTypes: {},
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

for (const kind of ["wheel", "rpm"] as const) {
  test(`compressed constant ${kind} speed integrates through the log end`, () => {
    const log = new Log();
    for (let i = 0; i <= 600; i++) {
      const t = i / 2;
      log.putNumber("lap_counter", t, Math.floor(t / 60));
      if (kind === "wheel") {
        for (const key of ["WheelSpeedFL", "WheelSpeedFR"]) {
          log.putNumber(key, t, 10);
          log.setMetadataString(key, JSON.stringify({ unit: "rad/s" }));
        }
      } else log.putNumber("MotorSpeedRPM", t, 6000);
    }
    (globalThis as any).window = { log };
    const service = new LapService();
    service.settings.radius = 0.2;
    service.update();
    const distance = service.result.samples.at(-1)!.distance;
    const expected = kind === "wheel" ? 600 : ((((6000 * Math.PI) / 30) * 0.2) / service.settings.ratio) * 300;
    assert.ok(Math.abs(distance - expected) < 1e-6, `${distance} should equal ${expected}`);
    service.settings.radius = 0.4;
    service.invalidate();
    service.update();
    assert.ok(Math.abs(service.result.samples.at(-1)!.distance - 2 * distance) < 1e-6);
  });
}

test("a constant wheel speed advances distance when only the log end advances", () => {
  const log = new Log();
  const write = (time: number) => {
    for (const key of ["WheelSpeedFL", "WheelSpeedFR"]) {
      log.putNumber(key, time, 10);
      log.setMetadataString(key, JSON.stringify({ unit: "rad/s" }));
    }
  };
  write(0);
  write(10);
  (globalThis as any).window = { log };
  const service = new LapService();
  service.settings.radius = 0.2;
  service.update();
  assert.equal(service.result.samples.at(-1)!.distance, 20);
  write(20);
  (service as any).nextUpdate = 0;
  service.update();
  assert.equal(service.result.samples.at(-1)!.distance, 40);
});

test("changing the event does not rewrite live slip history", () => {
  const log = new Log();
  for (let i = 0; i < 100; i++) {
    for (const [key, value] of [
      ["WheelSpeedFL", 10 + i / 100],
      ["WheelSpeedFR", 10 + i / 100],
      ["ground_speed", 10]
    ] as const) {
      log.putNumber(key, i / 10, value);
      log.setMetadataString(key, JSON.stringify({ unit: "m/s" }));
    }
  }
  (globalThis as any).window = { log, selection: { getCurrentLiveTime: () => 10 } };
  const service = new LapService();
  service.update();
  const before = log.getNumber("Laps/SlipRatio", -Infinity, Infinity);
  const putNumber = log.putNumber.bind(log);
  let writes = 0;
  log.putNumber = (key, time, value) => {
    if (key === "Laps/SlipRatio") writes++;
    putNumber(key, time, value);
  };
  for (const mode of ["skidpad", "accel", "autocross", "endurance", "circuit"] as const) {
    service.settings.config.mode = mode;
    service.invalidate();
    service.update();
    assert.deepEqual(log.getNumber("Laps/SlipRatio", -Infinity, Infinity), before);
  }
  assert.equal(writes, 0);
  service.settings.radius *= 2;
  service.invalidate();
  service.update();
  assert.ok(writes > 0, "wheel calibration still rebuilds slip history");
});

test("a legacy sector stays on the track when live retention moves the GPS origin", () => {
  const log = new Log();
  for (let i = 0; i <= 100; i++) {
    log.putNumber("latitude", i / 10, -37 + i * 0.000001);
    log.putNumber("longitude", i / 10, 145 + i * 0.000001);
  }
  (globalThis as any).window = { log, selection: { getCurrentLiveTime: () => 10 } };
  const service = new LapService();
  service.settings.config.sectors = [{ a: { x: 2, y: 3 }, b: { x: 4, y: 5 } }];
  service.update();
  const before = geographicGate(service.localConfig().sectors![0], service.origin!);
  log.clearBeforeTime(5, false);
  service.invalidate();
  service.update();
  const after = geographicGate(service.localConfig().sectors![0], service.origin!);
  assert.deepEqual(after, before);
});

test("a legacy sector stays on the track when a log of the same track replaces the current one", () => {
  const track = (from: number) => {
    const log = new Log();
    for (let i = from; i <= 100; i++) {
      log.putNumber("latitude", i / 10, -37 + i * 0.000001);
      log.putNumber("longitude", i / 10, 145 + i * 0.000001);
    }
    return log;
  };
  (globalThis as any).window = { log: track(0), selection: { getCurrentLiveTime: () => 10 } };
  const service = new LapService();
  service.settings.config.sectors = [{ a: { x: 2, y: 3 }, b: { x: 4, y: 5 } }];
  service.update();
  const before = geographicGate(service.localConfig().sectors![0], service.origin!);
  // The second log starts five seconds later, so its first GPS fix is elsewhere on the track.
  (globalThis as any).window.log = track(50);
  service.update();
  const after = geographicGate(service.localConfig().sectors![0], service.origin!);
  assert.notDeepEqual(service.origin, undefined);
  assert.ok(Math.hypot(after.a.lat - before.a.lat, after.a.lon - before.a.lon) < 1e-9);
  assert.ok(Math.hypot(after.b.lat - before.b.lat, after.b.lon - before.b.lon) < 1e-9);
});
