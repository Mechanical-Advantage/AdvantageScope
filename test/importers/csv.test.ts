// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  columnNameToKey,
  decodeCSVText,
  detectDelimiter,
  detectLayout,
  parseHeaderCell,
  parseTimeCell,
  readRow,
  readRows
} from "../../src/hub/dataSources/csv/CSVParser";

test("quoted fields with delimiters, doubled quotes and newlines", () => {
  const text = 'a,"b,c","say ""hi""","multi\nline",e\r\nnext,row\n';
  const rows = readRows(text, ",", 10);
  assert.deepEqual(rows[0], ["a", "b,c", 'say "hi"', "multi\nline", "e"]);
  assert.deepEqual(rows[1], ["next", "row"]);
  assert.deepEqual(readRow("x;y;z\n", 0, ";").fields, ["x", "y", "z"]);
});

test("BOM is removed", () => {
  const bytes = new Uint8Array([0xef, 0xbb, 0xbf, ...new TextEncoder().encode("Time,a\n0,1\n")]);
  assert.equal(decodeCSVText(bytes).slice(0, 4), "Time");
});

test("delimiter detection", () => {
  assert.equal(detectDelimiter("t,a,b\n0,1,2\n1,2,3\n"), ",");
  assert.equal(detectDelimiter("t;a;b\n0;1,5;2\n1;2,5;3\n"), ";");
  assert.equal(detectDelimiter("t\ta\tb\n0\t1\t2\n1\t2\t3\n"), "\t");
  assert.equal(detectDelimiter('t,"a;b",c\n0,1,2\n1,2,3\n'), ",");
});

test("header units", () => {
  assert.deepEqual(parseHeaderCell("INV_MotorSpeedRPM [rpm]"), { name: "INV_MotorSpeedRPM", unit: "rpm" });
  assert.deepEqual(parseHeaderCell("Axle Torque (Nm)"), { name: "Axle Torque", unit: "Nm" });
  assert.deepEqual(parseHeaderCell("SBG_FRONT_AccelX [m/s^2]"), { name: "SBG_FRONT_AccelX", unit: "m/s^2" });
  assert.deepEqual(parseHeaderCell("Car.Data.Motor.MotorRPM"), { name: "Car.Data.Motor.MotorRPM", unit: null });
  // Parentheses that aren't a unit stay in the name
  assert.equal(parseHeaderCell("Temp (sensor 1 at the rear wing)").unit, null);
});

test("dotted names become hierarchy", () => {
  assert.equal(columnNameToKey("Car.Data.Motor.MotorRPM"), "Car/Data/Motor/MotorRPM");
  assert.equal(columnNameToKey("can0.Pedal_Status.PEDAL_Position1"), "can0/Pedal_Status/PEDAL_Position1");
  assert.equal(columnNameToKey("Speed 1.5"), "Speed 1.5");
  assert.equal(columnNameToKey("INV_MotorSpeedRPM"), "INV_MotorSpeedRPM");
});

test("can_plot export: t_s with [unit] headers", () => {
  const layout = detectLayout("t_s,INV_MotorSpeedRPM [rpm],ECU_ECUState\n0.000,,\n0.020,10.5,1\n");
  assert.equal(layout.kind, "wide");
  assert.equal(layout.timeColumn, 0);
  assert.equal(layout.timeUnit, "s");
  assert.equal(layout.headers[1].unit, "rpm");
});

test("MoTeC style: preamble and units row under the header", () => {
  const text = [
    '"Format","MoTeC CSV File"',
    '"Venue","Calder"',
    "",
    '"Time","Engine RPM","Throttle Pos"',
    '"s","rpm","%"',
    "",
    '"0.000","1000","5.5"',
    '"0.010","1010","5.6"'
  ].join("\n");
  const layout = detectLayout(text);
  assert.equal(layout.preamble["Venue"], "Calder");
  assert.equal(layout.headers[1].name, "Engine RPM");
  assert.equal(layout.headers[1].unit, "rpm");
  assert.equal(layout.timeColumn, 0);
  assert.equal(layout.timeUnit, "s");
  assert.ok(text.slice(layout.dataStart).startsWith('"0.000"'));
});

test("time column detection and units", () => {
  assert.equal(detectLayout("timestamp,a\n1792040000123,1\n1792040000133,2\n").timeUnit, "ms");
  assert.equal(detectLayout("time_ns,a\n1000,1\n2000,2\n").timeUnit, "ns");
  assert.equal(detectLayout("Time [ms],a\n0,1\n10,2\n").timeUnit, "ms");
  assert.equal(detectLayout("t,a\n1793337911758980000,1\n1793337911768980000,2\n").timeUnit, "ns");
  const iso = detectLayout("a,timestamp\n1,2026-10-30T14:31:35.250Z\n2,2026-10-30T14:31:35.260Z\n");
  assert.equal(iso.timeColumn, 1);
  assert.equal(iso.timeUnit, "iso");
  // No time-like name: first column is monotonic, so it is used
  assert.equal(detectLayout("x,a\n0,1\n0.5,2\n").timeColumn, 0);
});

test("time cell parsing", () => {
  assert.equal(parseTimeCell("1500", "ms"), 1.5);
  assert.equal(parseTimeCell("1793337911758980000", "ns"), 1793337911 + 0.75898);
  assert.equal(parseTimeCell("2026-10-30T03:31:35.250Z", "iso"), Date.UTC(2026, 9, 30, 3, 31, 35, 250) / 1000);
  assert.equal(parseTimeCell("01:02:03.5", "clock"), 3723.5);
});

test("long layout", () => {
  const layout = detectLayout("Timestamp,Key,Value\n0.1,/a,1\n0.2,/b,hello\n");
  assert.equal(layout.kind, "long");
  assert.equal(layout.keyColumn, 1);
  assert.equal(layout.valueColumn, 2);
});

test("semicolon with decimal commas", () => {
  const layout = detectLayout("Zeit;Wert\n0,5;1,25\n1,0;2,5\n");
  assert.equal(layout.delimiter, ";");
  assert.equal(layout.decimalComma, true);
});
