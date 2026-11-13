// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Ajv from "ajv";
import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { MockBackend } from "../../tools/mock-backend/src/backend";
import { startServer } from "../../tools/mock-backend/src/server";
import { Session } from "../../tools/mock-backend/src/session";

const schema = JSON.parse(fs.readFileSync("src/shared/mur/api/schema/live.schema.json", "utf8"));
const ajv = new Ajv({ strict: false, allErrors: true });
ajv.addSchema(schema);
function conforms(definition: string, value: unknown) {
  const validate = ajv.getSchema(`${schema.$id}#/definitions/${definition}`)!;
  assert.ok(validate(value), `${definition}: ${JSON.stringify(validate.errors)}`);
}
function values(catalogue: any[], samples: any[], historyPath?: string) {
  for (const sample of samples) {
    const descriptor = catalogue.find((d) => d.path === (historyPath ?? sample.path));
    assert.ok(descriptor);
    const definitions: Record<string, string> = {
      int64: "Int64Value",
      vector3: "Vector3",
      quaternion: "Quaternion",
      pose3: "Pose3",
      trajectory: "Trajectory",
      cone_array: "ConeArray"
    };
    if (definitions[descriptor.type]) conforms(definitions[descriptor.type], sample.value);
    else if (descriptor.type === "float64") assert.equal(typeof sample.value, "number");
    else if (descriptor.type === "enum") assert.ok(Number.isSafeInteger(sample.value));
    else if (descriptor.type === "bool") assert.equal(typeof sample.value, "boolean");
    else if (descriptor.type === "string") assert.equal(typeof sample.value, "string");
  }
}
const path = "vehicles/mur27/driver/throttle";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test("real mock output conforms: all values, catalogue changes and errors", () => {
  const backend = new MockBackend({ catalogueChurn: true, duplicate: true, lapCounter: true });
  const messages: any[] = [];
  const session = new Session(backend, { send: (text) => messages.push(JSON.parse(text)), bufferedAmount: () => 0 });
  try {
    session.handle(JSON.stringify({ op: "hello", api_version: 99 }));
    session.handle(JSON.stringify({ op: "hello", api_version: 1 }));
    session.handle(
      JSON.stringify({ op: "subscribe", subscription_id: "all", paths: [...backend.catalogue.keys(), "unknown"] })
    );
    backend.advance(1);
    session.flush(true);
    const snapshot = backend.snapshot();
    conforms("CatalogueSnapshotBody", snapshot);
    for (const sample of backend.latest.values()) {
      conforms("TelemetrySample", sample);
      values(snapshot.signals, [sample]);
    }
    for (const descriptor of snapshot.signals) {
      const response = backend.queryHistory(descriptor.path, null, null, 10)!;
      conforms("HistoryResponse", response);
      values(snapshot.signals, response.samples, descriptor.path);
    }
    backend.advance(3001); // actual upsert at 10 seconds and removal at 30 seconds
    session.flush(true);
    for (const message of messages) conforms("ServerOp", message);
    for (const op of [
      "error",
      "catalogue_snapshot",
      "subscription_ack",
      "samples",
      "availability",
      "catalogue_upsert",
      "catalogue_remove"
    ]) {
      assert.ok(
        messages.some((m) => m.op === op),
        `Missing coverage for ${op}`
      );
    }
  } finally {
    session.close();
    backend.stop();
  }
});

test("real HTTP/WS catalogue, subscribe, samples, history and reconnect conform", async () => {
  const server = await startServer({ host: "127.0.0.1", port: 0 });
  const sockets: WebSocket[] = [];
  try {
    const base = `http://127.0.0.1:${server.port}`;
    const catalogue = await (await fetch(base + "/api/v1/catalogue")).json();
    conforms("CatalogueSnapshotBody", catalogue);
    for (let connection = 0; connection < 2; connection++) {
      const socket = new WebSocket(base.replace("http:", "ws:") + "/api/v1/live");
      sockets.push(socket);
      const messages: any[] = [];
      socket.onmessage = (event) => messages.push(JSON.parse(String(event.data)));
      await new Promise<void>((resolve, reject) => {
        socket.onopen = () => resolve();
        socket.onerror = reject;
      });
      const send = (message: unknown) => {
        conforms("ClientOp", message);
        socket.send(JSON.stringify(message));
      };
      send({ op: "hello", api_version: 1 });
      const until = async (predicate: () => boolean) => {
        const deadline = Date.now() + 5000;
        while (!predicate()) {
          assert.ok(Date.now() < deadline, "Timed out waiting for wire output");
          await delay(10);
        }
      };
      await until(() => messages.filter((m) => m.op === "availability").length === catalogue.signals.length);
      assert.equal(messages[0].op, "catalogue_snapshot");
      assert.ok(!messages.some((m) => m.op === "samples"), "reconnect does not retain subscriptions");
      send({ op: "subscribe", subscription_id: "graph", paths: [path], include_latest: true, max_rate_hz: 20 });
      await until(() => messages.some((m) => m.op === "samples" && !m.initial));
      assert.ok(messages.some((m) => m.op === "subscription_ack"));
      assert.ok(messages.some((m) => m.op === "samples" && m.initial));
      for (const message of messages) {
        conforms("CoreServerOp", message);
        if (message.op === "samples") values(catalogue.signals, message.samples);
      }
      const response = await (await fetch(base + `/api/v1/history?path=${path}&max_points=10`)).json();
      conforms("HistoryResponse", response);
      assert.ok(response.samples.length > 0 && response.samples.length <= 10);
      values(catalogue.signals, response.samples, path);
      send({ op: "unsubscribe", subscription_id: "graph" });
      await new Promise<void>((resolve) => {
        socket.onclose = () => resolve();
        socket.close();
      });
    }
    const unknown = await fetch(base + "/api/v1/history?path=unknown");
    assert.equal(unknown.status, 404);
    conforms("HttpError", await unknown.json());
  } finally {
    for (const socket of sockets) socket.close();
    await server.close();
  }
});

test("schema detects envelope corruption while allowing forward-compatible fields", () => {
  const validate = ajv.getSchema(`${schema.$id}#/definitions/TelemetrySample`)!;
  const sample = { path, stream_id: "test", seq: 0, t_ns: "0", received_ns: "0", time_quality: "estimated", value: 1 };
  assert.ok(validate({ ...sample, future_field: true }));
  assert.ok(!validate({ ...sample, t_ns: 123 }));
  assert.ok(!validate({ ...sample, seq: -1 }));
  const descriptor = ajv.getSchema(`${schema.$id}#/definitions/DBCProvenance`)!;
  assert.ok(!descriptor({ signal: "Example" }));
  assert.ok(descriptor({ signal: "Example", message: "Status" }));
});

test("mock DBC provenance names a signal in its declared database and message", async () => {
  const { buildSignals } = await import("../../tools/mock-backend/src/signals");
  const signals = buildSignals({ lapCounter: true });
  let mapped = 0;
  for (const { desc } of signals) {
    if (!desc.dbc) continue;
    mapped++;
    assert.ok(!desc.tags.includes("derived"), desc.path);
    const database = fs
      .readdirSync("src/hub/dataSources/can/dbc", { recursive: true })
      .find((file) => file.toString().split("/").pop() === desc.dbc!.database);
    assert.ok(database, desc.path);
    const text = fs.readFileSync("src/hub/dataSources/can/dbc/" + database, "utf8");
    const message = text
      .split("\n")
      .findIndex((line) => line.startsWith("BO_ ") && line.includes(" " + desc.dbc!.message + ":"));
    assert.ok(message >= 0, desc.path);
    const fields = text
      .split("\n")
      .slice(message + 1)
      .join("\n")
      .split("\nBO_ ")[0];
    assert.ok(fields.includes(" SG_ " + desc.dbc.signal + " :"), desc.path);
  }
  assert.equal(mapped, 46);
  for (const path of [
    "powertrain/inverter/dc_power",
    "powertrain/inverter/module_temperature",
    "accumulator/airs_closed",
    "dynamics/vehicle_speed",
    "dynamics/rear_axle_speed",
    "gps/heading",
    "gps/ground_speed"
  ]) {
    assert.equal(signals.find(({ desc }) => desc.path.endsWith("/" + path))!.desc.dbc, undefined, path);
  }
});
