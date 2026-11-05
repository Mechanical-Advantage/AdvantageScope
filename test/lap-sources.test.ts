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
    addEventListener() {},
    getElementsByTagName: () => [],
    getElementsByClassName: () => [node()],
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
  (globalThis as any).window = { log };
  const list: any = Object.create(SourceList.prototype);
  Object.assign(list, {
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
