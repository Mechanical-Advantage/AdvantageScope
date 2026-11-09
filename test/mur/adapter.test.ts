// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import { createField } from "../../src/hub/dataSources/mur/MURLogAdapter";
import Log from "../../src/shared/log/Log";
import type { SignalDescriptor } from "../../src/shared/mur/contract";

const descriptor: SignalDescriptor = {
  path: "vehicles/mur27/powertrain/inverter/motor_speed",
  type: "float64",
  unit: "rad/s",
  description: "Motor shaft speed",
  source: "control-can",
  nominal_rate_hz: 100,
  stale_after_ms: 250,
  tags: [],
  schema_version: 1
};

test("live fields preserve the DBC signal name for saved layout lookup", () => {
  const log = new Log();
  createField(log, { ...descriptor, dbc: { signal: "INV_MotorSpeedRPM", message: "INV_Motor_Position_Info" } });
  const metadata = JSON.parse(log.getMetadataString("/" + descriptor.path)!);
  assert.equal(metadata.dbcSignal, "INV_MotorSpeedRPM");
  assert.equal(metadata.unit, "rad/s");
});

test("live fields without a DBC signal omit dbcSignal", () => {
  for (const dbc of [undefined, { signal: "", message: "INV_Motor_Position_Info" }]) {
    const log = new Log();
    createField(log, { ...descriptor, dbc });
    assert.equal(Object.hasOwn(JSON.parse(log.getMetadataString("/" + descriptor.path)!), "dbcSignal"), false);
  }
});
