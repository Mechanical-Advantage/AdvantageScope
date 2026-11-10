// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { numberAt } from "../src/hub/controllers/DbcFields";
import Log from "../src/shared/log/Log";

function makeLog() {
  const log = new Log();
  const put = (key: string, metadata: object, value: number) => {
    log.putNumber(key, 1, value);
    log.setMetadataString(key, JSON.stringify(metadata));
  };
  put("/CAN/Dashboard_Dynamics/DASH_SteeringAngle", { dbcSignal: "DASH_SteeringAngle", unit: "deg" }, 90);
  put("/CAN/Pedal_Status/PEDAL_Position1", { dbcSignal: "PEDAL_Position1", unit: "%" }, 40);
  put("/live/driver/steering_angle", { unit: "rad" }, Math.PI / 2);
  put("/live/driver/throttle", { unit: "1" }, 0.25);
  put("/live/driver/brake_pressure_front", { unit: "Pa" }, 6894.757293168);
  put("/CAN/ECU_DashData2/ECU_BrakePressFront", { dbcSignal: "ECU_BrakePressFront", unit: "psi" }, NaN);
  (globalThis as any).window = { log };
  return log;
}

test("values convert from the field's unit to the DBC unit", () => {
  makeLog();
  assert.equal(numberAt("/CAN/Dashboard_Dynamics/DASH_SteeringAngle", 2, "degrees", "t"), 90);
  assert.ok(Math.abs(numberAt("/live/driver/steering_angle", 2, "degrees", "t")! - 90) < 1e-9);
  assert.ok(Math.abs(numberAt("/live/driver/throttle", 2, "percent", "t")! - 25) < 1e-9);
  assert.ok(Math.abs(numberAt("/live/driver/brake_pressure_front", 2, "psi", "t")! - 1) < 1e-9);
});

test("missing fields, samples before the first one and NaN sentinels read as no data", () => {
  makeLog();
  assert.equal(numberAt(undefined, 2, "degrees", "t"), null);
  assert.equal(numberAt("/missing", 2, "degrees", "t"), null);
  assert.equal(numberAt("/CAN/Dashboard_Dynamics/DASH_SteeringAngle", 0, "degrees", "t"), null);
  assert.equal(numberAt("/CAN/ECU_DashData2/ECU_BrakePressFront", 2, "psi", "t"), null);
});

test("known incompatible units are no data, while unknown units keep the raw value", () => {
  const log = makeLog();
  log.putNumber("/voltage", 1, 12);
  log.setMetadataString("/voltage", JSON.stringify({ unit: "V" }));
  log.putNumber("/raw", 1, 12);
  assert.equal(numberAt("/voltage", 2, "psi", "t"), null);
  assert.equal(numberAt("/raw", 2, "psi", "t"), 12);
});

for (const operation of ["setField", "mergeWith", "metadata"]) {
  test(`a unit change through ${operation} discards the cached unit`, () => {
    const log = makeLog();
    const key = "/live/driver/steering_angle";
    assert.equal(numberAt(key, 2, "degrees", "t"), 90);
    const metadata = JSON.stringify({ unit: "V" });
    const replacement = new Log();
    replacement.putNumber(key, 1, 12);
    replacement.setMetadataString(key, metadata);
    if (operation === "setField") log.setField(key, replacement.getField(key)!);
    else if (operation === "mergeWith") log.mergeWith(replacement);
    else log.setMetadataString(key, metadata);
    assert.equal(log.getUnit(key), "volts");
    assert.equal(numberAt(key, 2, "degrees", "t"), null);
  });
}
