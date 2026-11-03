// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import { LiveDataSource } from "../../src/hub/dataSources/LiveDataSource";
import MURSource from "../../src/hub/dataSources/mur/MURSource";
import Log from "../../src/shared/log/Log";

class Source extends LiveDataSource {
  publish(log: Log, time: () => number) {
    this.log = log;
    this.outputCallback!(log, time);
  }
}

test("live discard runs once per second and stops with the source", (t) => {
  t.mock.timers.enable({ apis: ["setInterval"] });
  const old = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { preferences: { liveDiscard: 90 } } });
  const source = new Source();
  const log = new Log();
  log.putNumber("/scalar", 1, 1);
  let calls = 0;
  const discard = log.discardLiveData.bind(log);
  log.discardLiveData = (time, seconds) => {
    calls++;
    discard(time, seconds);
  };
  try {
    source.connect(
      "test",
      () => {},
      () => {}
    );
    source.publish(log, () => 100);
    t.mock.timers.tick(999);
    assert.equal(calls, 0);
    t.mock.timers.tick(1);
    assert.equal(calls, 1);
    assert.equal(log.getField("/scalar")!.getTimestamp(0), 10);
    t.mock.timers.tick(1000);
    assert.equal(calls, 2);
    source.stop();
    t.mock.timers.tick(1000);
    assert.equal(calls, 2);
  } finally {
    source.stop();
    if (old) Object.defineProperty(globalThis, "window", old);
    else Reflect.deleteProperty(globalThis, "window");
  }
});

test("MUR updates share the one second discard cadence", (t) => {
  const old = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { preferences: { liveDiscard: 90 } } });
  let now = 100000;
  t.mock.method(Date, "now", () => now);
  const source = new MURSource() as unknown as { log: Log; clock: { now: () => number }; periodic: () => void };
  source.log = new Log();
  source.log.putNumber("/scalar", 1, 1);
  source.clock = { now: () => 100 };
  let calls = 0;
  const clear = source.log.clearBeforeTime.bind(source.log);
  source.log.clearBeforeTime = (...args) => {
    calls++;
    clear(...args);
  };
  try {
    source.periodic();
    assert.equal(calls, 1);
    for (let i = 0; i < 59; i++) {
      now += 16;
      source.periodic();
    }
    assert.equal(calls, 1);
    source.log.putNumber("/scalar", 101, 2);
    now += 1000;
    source.clock.now = () => 101;
    source.periodic();
    assert.equal(calls, 2);
  } finally {
    if (old) Object.defineProperty(globalThis, "window", old);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
