// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_MQTT_SETTINGS, validateTopicFilter } from "../src/hub/dataSources/mqtt/MQTTConfig";
import { decodeMQTTCAN, mqttDBC, mqttTimestamp, parseMQTTPayload } from "../src/hub/dataSources/mqtt/MQTTPayload";
const parse = (mode: typeof DEFAULT_MQTT_SETTINGS.mode, text: string) =>
  parseMQTTPayload("mur/INVERTER/RPM", new TextEncoder().encode(text), { ...DEFAULT_MQTT_SETTINGS, mode });
test("MQTT scalar, object, ASCII and malformed payloads", () => {
  assert.deepEqual(parse("json-per-signal", "42"), [{ path: "INVERTER/RPM", value: 42, tNs: null }]);
  assert.equal(parse("json-per-signal", '{"t":"1793400000000000001","v":true}')[0].tNs, "1793400000000000001");
  assert.deepEqual(parse("json-object", '{"t":1793400000,"speed":2,"nested":{}}'), [
    { path: "INVERTER/RPM/speed", value: 2, tNs: "1793400000000000000" }
  ]);
  assert.deepEqual(
    parse("ascii", "BMS/SoC=72.5\nECU/ready=true\ninvalid").map((v) => v.value),
    [72.5, true]
  );
  for (const text of ["null", "[]", "{}", "{", '{"v":null}']) assert.deepEqual(parse("json-per-signal", text), []);
  assert.equal(mqttTimestamp(1793400000.5), "1793400000500000000");
  assert.equal(mqttTimestamp(-1), null);
  assert.ok(validateTopicFilter("mur/+/rpm"));
  assert.ok(!validateTopicFilter("mur/#/rpm"));
});
test("MQTT bundled CAN uses the candump decoder, enum children, sentinels and timestamps", () => {
  const message = mqttDBC.getAll().find((m) => m.signals.some((s) => s.valueTable))!;
  const frame = new Uint8Array(21);
  const view = new DataView(frame.buffer);
  view.setBigUint64(0, 1793400000000000001n);
  view.setUint32(8, message.id + (message.extended ? 0x80000000 : 0));
  frame[12] = 8;
  const values = decodeMQTTCAN(frame, true);
  assert.ok(values.some((v) => v.path.endsWith("/raw")));
  assert.ok(values.every((v) => v.tNs === "1793400000000000001"));
  const sentinelMessage = mqttDBC
    .getAll()
    .find((m) =>
      m.signals.some((s) => s.sentinels.has(65535) && s.length === 16 && s.littleEndian && s.startBit % 8 === 0)
    )!;
  const signal = sentinelMessage.signals.find(
    (s) => s.sentinels.has(65535) && s.length === 16 && s.littleEndian && s.startBit % 8 === 0
  )!;
  const short = new Uint8Array(13);
  new DataView(short.buffer).setUint32(0, sentinelMessage.id + (sentinelMessage.extended ? 0x80000000 : 0));
  short[4] = 8;
  short[5 + signal.startBit / 8] = short[6 + signal.startBit / 8] = 255;
  assert.ok(decodeMQTTCAN(short, false).some((v) => v.path.endsWith("/" + signal.name) && Number.isNaN(v.value)));
  assert.deepEqual(decodeMQTTCAN(frame.subarray(0, 20), true), []);
  short[4] = 9;
  assert.deepEqual(decodeMQTTCAN(short, false), []);
});

test("MQTT filter prefixes and exact subscriptions preserve canonical paths", () => {
  const bytes = new TextEncoder().encode('{"v":3}');
  for (const topic of ["mur/#", "mur/+/INV_MotorSpeedRPM", "mur/INVERTER/INV_MotorSpeedRPM"]) {
    const result = parseMQTTPayload("mur/INVERTER/INV_MotorSpeedRPM", bytes, { ...DEFAULT_MQTT_SETTINGS, topic });
    assert.equal(
      result[0].path,
      topic.includes("#") || topic.includes("+") ? "INVERTER/INV_MotorSpeedRPM" : "INV_MotorSpeedRPM"
    );
  }
  assert.equal(mqttTimestamp("1793400000123456789"), "1793400000123456789");
  assert.equal(mqttTimestamp("invalid"), null);
});
