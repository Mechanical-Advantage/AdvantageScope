// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import { LiveConnection } from "../src/hub/dataSources/LiveConnection";
import { LiveDataSource, LiveDataSourceStatus as Status } from "../src/hub/dataSources/LiveDataSource";

class Source extends LiveDataSource {
  stopped = 0;
  retries = 0;
  retry: ReturnType<typeof setTimeout> | null = null;
  connect(_address: string, status: (status: Status) => void) {
    this.statusCallback = status;
    this.emit(Status.Connecting);
  }
  emit(status: Status) {
    this.setStatus(status);
  }
  late(status: Status) {
    this.statusCallback?.(status);
  }
  drop() {
    this.emit(Status.Connecting);
    this.retry = setTimeout(() => {
      this.retries++;
      this.emit(Status.Active);
    }, 1000);
  }
  stop() {
    super.stop();
    this.stopped++;
    if (this.retry !== null) clearTimeout(this.retry);
  }
}
function setup() {
  const source = new Source();
  const connection = new LiveConnection(source);
  const statuses: Status[] = [];
  const failures: string[] = [];
  connection.connect(
    "ws://127.0.0.1:19865",
    (s) => statuses.push(s),
    () => {},
    (s) => failures.push(s)
  );
  return { source, connection, statuses, failures };
}
test("a failed attempt stops the source and reports once without registration", async () => {
  const { source, statuses, failures } = setup();
  source.emit(Status.Error);
  source.emit(Status.Connecting);
  source.emit(Status.Error);
  source.emit(Status.Active);
  await Promise.resolve();
  assert.equal(source.stopped, 1);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /127.0.0.1:19865/);
  assert.ok(!statuses.includes(Status.Active));
  source.late(Status.Active);
  assert.ok(!statuses.includes(Status.Active));
});
test("an unresponsive handshake times out and stops", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { source, statuses, failures } = setup();
  t.mock.timers.tick(10000);
  assert.equal(source.stopped, 1);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /Timed out/);
  assert.ok(!statuses.includes(Status.Active));
});
test("success then drop then recovery retains retries without failure reports", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { source, connection, statuses, failures } = setup();
  source.emit(Status.Active);
  source.drop();
  t.mock.timers.tick(1000);
  assert.deepEqual(statuses, [Status.Connecting, Status.Active, Status.Connecting, Status.Active]);
  t.mock.timers.tick(20000);
  assert.deepEqual(failures, []);
  assert.equal(source.stopped, 0);
  connection.stop();
});
test("removing during retry cancels it and ignores late recovery", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { source, connection, statuses, failures } = setup();
  source.emit(Status.Active);
  source.drop();
  connection.stop();
  connection.stop();
  t.mock.timers.tick(20000);
  source.late(Status.Active);
  assert.equal(source.retries, 0);
  assert.equal(source.stopped, 1);
  assert.equal(statuses.filter((s) => s === Status.Active).length, 1);
  assert.deepEqual(failures, []);
});
test("repeated established failures do not produce attempt notifications", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { source, connection, failures } = setup();
  source.emit(Status.Active);
  for (let i = 0; i < 20; i++) {
    source.emit(Status.Error);
    source.drop();
    t.mock.timers.tick(1000);
  }
  assert.deepEqual(failures, []);
  assert.equal(source.retries, 20);
  connection.stop();
});

test("NT4 disconnect cancels a scheduled probe retry", async (t) => {
  const { NT4_Client } = await import("../src/hub/dataSources/nt4/NT4");
  t.mock.timers.enable({ apis: ["setTimeout", "setInterval"] });
  const probe = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("offline");
  });
  const noop = () => {};
  const client = new NT4_Client("127.0.0.2", [5810], "test", noop, noop, noop, noop, noop, noop);
  client.connect();
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(probe.mock.callCount(), 1);
  client.disconnect();
  t.mock.timers.tick(30000);
  assert.equal(probe.mock.callCount(), 1);
});

test("NT4 disconnect aborts an in-flight probe and rejects late success", async (t) => {
  const { NT4_Client } = await import("../src/hub/dataSources/nt4/NT4");
  t.mock.timers.enable({ apis: ["setTimeout", "setInterval"] });
  let complete: (response: Response) => void = () => {};
  let signal: AbortSignal | undefined;
  t.mock.method(globalThis, "fetch", (_url, options) => {
    signal = options?.signal ?? undefined;
    return new Promise<Response>((resolve) => {
      complete = resolve;
    });
  });
  const sockets = t.mock.method(globalThis, "WebSocket", () => {
    throw new Error("unexpected socket");
  });
  const noop = () => {};
  const client = new NT4_Client("127.0.0.2", [5810], "test", noop, noop, noop, noop, noop, noop);
  client.connect();
  client.disconnect();
  assert.equal(signal?.aborted, true);
  complete(new Response("mock"));
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(sockets.mock.callCount(), 0);
});
