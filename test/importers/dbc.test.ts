// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import { BUNDLED_DBCS } from "../../src/hub/dataSources/can/BundledDBCs";
import { getSignalKey } from "../../src/hub/dataSources/can/CANKeys";
import { DBCSet, decodeSignal, extractRaw, parseDBC, sortDBCFiles } from "../../src/hub/dataSources/can/DBC";

const TEST_DBC = `VERSION ""

BU_: ECU DASH

BO_ 256 Intel_Msg: 8 ECU
 SG_ Unsigned8 : 0|8@1+ (1,0) [0|255] "" DASH
 SG_ Nibbles : 12|8@1+ (1,0) [0|255] "" DASH
 SG_ Signed16 : 16|16@1- (0.1,0) [-3276.8|3276.7] "degC" DASH
 SG_ Scaled : 32|10@1+ (0.5,-40) [-40|471.5] "V" DASH
 SG_ Flag : 42|1@1+ (1,0) [0|1] "" DASH

BO_ 512 Motorola_Msg: 8 DASH
 SG_ Word : 7|16@0+ (1,0) [0|65535] "" ECU
 SG_ Twelve : 23|12@0+ (1,0) [0|4095] "" ECU
 SG_ Straddle : 43|8@0+ (1,0) [0|255] "" ECU
 SG_ SignedWord : 55|16@0- (0.01,0) [-327.68|327.67] "m" ECU

BO_ 768 Enum_Msg: 2 ECU
 SG_ State : 0|8@1+ (1,0) [0|255] "" DASH
 SG_ WheelSpeed : 8|16@1+ (0.1,0) [0|6553.4] "rpm" DASH

BO_ 769 Mux_Msg: 8 ECU
 SG_ Selector M : 0|8@1+ (1,0) [0|255] "" DASH
 SG_ PageA m0 : 8|16@1+ (1,0) [0|65535] "" DASH
 SG_ PageB m1 : 8|16@1+ (2,0) [0|131070] "" DASH

BO_ 2147493386 Extended_Msg: 8 ECU
 SG_ Voltage : 0|16@1+ (0.01,0) [0|655.35] "V" DASH

CM_ SG_ 768 WheelSpeed "Wheel rpm. 0xFFFF (6553.5) = invalid: encoder not calibrated";
CM_ SG_ 256 Signed16 "A multi-line
comment";
VAL_ 768 State 0 "Init" 1 "Standby" 2 "Ready To Drive" 255 "Invalid/Init" ;
`;

function signal(message: string, name: string) {
  const db = parseDBC(TEST_DBC, "test.dbc");
  const found = db.messages.find((m) => m.name === message)?.signals.find((s) => s.name === name);
  assert.ok(found, `${message}.${name} not found`);
  return found!;
}

test("parses messages, signals, comments and value tables", () => {
  const db = parseDBC(TEST_DBC, "test.dbc");
  assert.equal(db.messages.length, 5);
  const intel = db.messages[0];
  assert.equal(intel.id, 0x100);
  assert.equal(intel.transmitter, "ECU");
  assert.equal(intel.signals.length, 5);
  assert.equal(signal("Intel_Msg", "Signed16").comment, "A multi-line\ncomment");
  assert.equal(signal("Intel_Msg", "Signed16").unit, "degC");
  assert.equal(signal("Enum_Msg", "State").valueTable?.get(2), "Ready To Drive");
});

test("extended IDs have the flag stripped", () => {
  const message = parseDBC(TEST_DBC).messages.find((m) => m.name === "Extended_Msg")!;
  assert.equal(message.extended, true);
  assert.equal(message.id, 0x260a);
});

test("decodes Intel (little-endian) signals", () => {
  const data = Uint8Array.from([0xab, 0xa0, 0x38, 0xff, 0x64, 0x04, 0, 0]);
  assert.equal(decodeSignal(signal("Intel_Msg", "Unsigned8"), data), 0xab);
  // Bits 12..19: high nibble of byte 1 (0xA) then low nibble of byte 2 (0x8)
  assert.equal(extractRaw(signal("Intel_Msg", "Nibbles"), data), 0x8a);
  // 0xFF38 = -200 → × 0.1
  assert.ok(Math.abs(decodeSignal(signal("Intel_Msg", "Signed16"), data)! - -20) < 1e-9);
  // 10 bits from bit 32: 0x064 = 100 → 100 × 0.5 − 40
  assert.equal(decodeSignal(signal("Intel_Msg", "Scaled"), data), 10);
  assert.equal(decodeSignal(signal("Intel_Msg", "Flag"), data), 1);
});

test("decodes Motorola (big-endian) signals", () => {
  const data = Uint8Array.from([0x12, 0x34, 0xab, 0xc0, 0x0d, 0xe0, 0xfc, 0x18]);
  assert.equal(decodeSignal(signal("Motorola_Msg", "Word"), data), 0x1234);
  // 12 bits from bit 23 (MSB of byte 2): 0xABC
  assert.equal(extractRaw(signal("Motorola_Msg", "Twelve"), data), 0xabc);
  // 8 bits from bit 43 (bit 3 of byte 5) spanning into byte 6: 0x0 (low nibble of 0xE0) then 0xF → 0x0F
  assert.equal(extractRaw(signal("Motorola_Msg", "Straddle"), data), 0x0f);
  // 0xFC18 = -1000 → × 0.01
  assert.ok(Math.abs(decodeSignal(signal("Motorola_Msg", "SignedWord"), data)! - -10) < 1e-9);
});

test("returns null when the frame is too short", () => {
  assert.equal(decodeSignal(signal("Intel_Msg", "Signed16"), Uint8Array.from([1, 2])), null);
  assert.equal(decodeSignal(signal("Motorola_Msg", "SignedWord"), Uint8Array.from([1, 2])), null);
});

test("treats sentinels as NaN", () => {
  const wheel = signal("Enum_Msg", "WheelSpeed");
  assert.ok(wheel.sentinels.has(0xffff));
  assert.ok(isNaN(decodeSignal(wheel, Uint8Array.from([0, 0xff, 0xff]))!));
  assert.ok(Math.abs(decodeSignal(wheel, Uint8Array.from([0, 0xfe, 0xff]))! - 6553.4) < 1e-9);
});

test("sentinels from out-of-range all-ones values (no comment needed)", () => {
  const db = parseDBC(`BO_ 1 M: 8 X
 SG_ Shock : 0|16@1+ (0.1,0) [0|500] "mm" Y
 SG_ Steer : 16|16@1- (0.1,0) [-1800|1800] "deg" Y
 SG_ Full : 32|16@1+ (0.1,0) [0|6553.5] "A" Y
`);
  const [shock, steer, full] = db.messages[0].signals;
  assert.ok(shock.sentinels.has(0xffff));
  assert.ok(steer.sentinels.has(0x7fff));
  assert.equal(full.sentinels.size, 0);
  assert.ok(isNaN(decodeSignal(steer, Uint8Array.from([0, 0, 0xff, 0x7f]))!));
});

test("multiplexed signals decode only on their page", () => {
  const db = parseDBC(TEST_DBC);
  const message = db.messages.find((m) => m.name === "Mux_Msg")!;
  const selector = message.signals.find((s) => s.isMultiplexor)!;
  const pageB = message.signals.find((s) => s.name === "PageB")!;
  assert.equal(pageB.multiplexValue, 1);
  const data = Uint8Array.from([1, 0x10, 0x00]);
  assert.equal(extractRaw(selector, data), 1);
  assert.equal(decodeSignal(pageB, data), 32);
});

test("bundled DBCs parse and merge by ID", () => {
  const set = new DBCSet();
  sortDBCFiles(Object.keys(BUNDLED_DBCS)).forEach((path) => set.add(parseDBC(BUNDLED_DBCS[path], path)));
  const pedal = set.get(0x100, false)!;
  assert.equal(pedal.name, "Pedal_Status");
  const position = pedal.signals.find((s) => s.name === "PEDAL_Position1")!;
  // 10 bits at 0, scale 0.1: 1000 → 100.0 %
  assert.equal(decodeSignal(position, Uint8Array.from([0xe8, 0x03, 0, 0, 0, 0, 0, 0])), 100);
  assert.equal(
    getSignalKey(pedal, position, () => false),
    "PEDALBOX/PEDAL_Position1"
  );
  // ENNOID uses 29-bit IDs
  assert.ok(set.getAll().some((m) => m.extended && m.name.startsWith("ENNOID_")));
  // Telemetry IDs win over the dashboard DBC that mirrors them
  assert.equal(set.get(0x240, false)?.source, "mur_control_can.dbc");
  // Motorola signals exist in the vendor DBCs
  assert.ok(set.getAll().some((m) => m.signals.some((s) => !s.littleEndian)));
  // Sentinel on ECU_MotorSpeed (0xFFFF, range 0..10000)
  const motorSpeed = set.get(0x240, false)!.signals.find((s) => s.name === "ECU_MotorSpeed")!;
  assert.ok(motorSpeed.sentinels.has(0xffff));
});
