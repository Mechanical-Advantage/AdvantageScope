// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { DbcSlotFields, numberAt } from "../src/hub/controllers/DbcFields";
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

test("slots default to fields by DBC signal, trying names in order", () => {
  makeLog();
  const fields = new DbcSlotFields({
    steering: ["DASH_SteeringAngle"],
    throttle: ["ECU_ThrottlePos", "PEDAL_Position1"],
    brakeRear: ["ECU_BrakePressRear"]
  });
  assert.deepEqual(fields.resolve([]), {
    steering: "/CAN/Dashboard_Dynamics/DASH_SteeringAngle",
    throttle: "/CAN/Pedal_Status/PEDAL_Position1",
    brakeRear: undefined
  });
});

test("a dragged field overrides the default, and hiding it empties the slot", () => {
  makeLog();
  const fields = new DbcSlotFields({ steering: ["DASH_SteeringAngle"], throttle: ["PEDAL_Position1"] });
  const dragged = { type: "steering", logKey: "/live/driver/steering_angle", logType: "Number", options: {} };
  assert.equal(fields.resolve([{ ...dragged, visible: true }]).steering, "/live/driver/steering_angle");
  assert.equal(fields.resolve([{ ...dragged, visible: false }]).steering, undefined);
  assert.equal(fields.resolve([{ ...dragged, visible: false }]).throttle, "/CAN/Pedal_Status/PEDAL_Position1");
});

test("the signal lookup is rebuilt on refresh", () => {
  const log = makeLog();
  const fields = new DbcSlotFields({ brakeRear: ["ECU_BrakePressRear"] });
  assert.equal(fields.resolve([]).brakeRear, undefined);
  log.putNumber("/CAN/ECU_DashData2/ECU_BrakePressRear", 1, 100);
  log.setMetadataString("/CAN/ECU_DashData2/ECU_BrakePressRear", JSON.stringify({ dbcSignal: "ECU_BrakePressRear" }));
  fields.refresh();
  assert.equal(fields.resolve([]).brakeRear, "/CAN/ECU_DashData2/ECU_BrakePressRear");
});

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

test("a dropped field takes the slot of its DBC signal unless the tab remembers a type for it", () => {
  makeLog();
  (globalThis as any).window.typeMemory = {
    tab: { "/CAN/Pedal_Status/PEDAL_Position1": { type: "steering", options: {} } }
  };
  const fields = new DbcSlotFields({
    steering: ["DASH_SteeringAngle"],
    brakeFront: ["ECU_BrakePressFront"],
    throttle: ["PEDAL_Position1"]
  });
  const sourceList: { beforeAdd?: (key: string) => boolean } = {};
  fields.assignDroppedFields(sourceList as any, "tab");
  assert.equal(sourceList.beforeAdd!("/CAN/ECU_DashData2/ECU_BrakePressFront"), true);
  assert.equal(sourceList.beforeAdd!("/CAN/Pedal_Status/PEDAL_Position1"), true);
  assert.equal(sourceList.beforeAdd!("/live/driver/throttle"), true);
  assert.deepEqual((globalThis as any).window.typeMemory.tab, {
    "/CAN/ECU_DashData2/ECU_BrakePressFront": { type: "brakeFront", options: {} },
    "/CAN/Pedal_Status/PEDAL_Position1": { type: "steering", options: {} }
  });
});
