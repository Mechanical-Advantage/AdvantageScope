// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import test from "node:test";
import { writeValue } from "../../src/hub/dataSources/mur/MURLogAdapter";
import MURSource from "../../src/hub/dataSources/mur/MURSource";
import Log from "../../src/shared/log/Log";

test("resubscribing requests history again and merges overlapping samples once", async (t) => {
  const path = "vehicles/mur27/gps/latitude";
  const descriptor = { path, type: "float64" } as any;
  const source = new MURSource() as any;
  source.log = new Log();
  source.catalogue = { epoch: "test", revision: 1 };
  source.descriptors.set(path, descriptor);
  let active = new Set(["/" + path]);
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { tabs: { getActiveFields: () => active }, sidebar: { getActiveFields: () => [] } }
  });
  t.after(() => {
    if (oldWindow) Object.defineProperty(globalThis, "window", oldWindow);
    else Reflect.deleteProperty(globalThis, "window");
  });
  const sample = (seq: number) => ({ stream_id: "test", seq, t_ns: String(seq * 1000000000), value: seq });
  let history = [sample(1), sample(2)];
  let requests = 0;
  t.mock.method(globalThis, "fetch", async () => {
    requests++;
    return { ok: true, status: 200, json: async () => ({ samples: history }) };
  });
  source.send = () => {};
  const fetchHistory = source.fetchHistory.bind(source);
  let pending: Promise<void>;
  source.fetchHistory = (path: string) => (pending = fetchHistory(path));
  const live = (seq: number) => {
    const s = sample(seq);
    if (source.dedup.accept(path, s.stream_id, seq)) {
      writeValue(source.log, descriptor, source.timeBase.sampleTime(s).seconds, s.value);
    }
  };
  live(2);
  source.periodic();
  await pending!;
  source.periodic();
  assert.equal(requests, 1);
  active = new Set();
  source.periodic();
  assert.equal(source.historyRequested.has(path), false);
  history = [sample(1), sample(2), sample(3), sample(4)];
  active = new Set(["/" + path]);
  live(4);
  source.periodic();
  await pending!;
  assert.equal(requests, 2);
  const data = source.log.getNumber("/" + path, -Infinity, Infinity);
  assert.deepEqual(data.values, [1, 2, 3, 4]);
  assert.equal(new Set(data.timestamps).size, 4);
});
