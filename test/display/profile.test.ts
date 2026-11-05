// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import test from "node:test";
import { parseDBC } from "../../src/hub/dataSources/can/DBC";
import { csvChannelMetadata, matchDBCChannel } from "../../src/hub/dataSources/csv/CSVChannelMetadata";
import {
  axisDisplayUnit,
  canonicalChannelPath,
  channelProfile,
  formatChannelValue,
  rawChannelValue
} from "../../src/shared/display/ChannelProfile";
import Log from "../../src/shared/log/Log";
import { Units } from "../../src/shared/units";

const fmt = (value: unknown, unit: string, name = "x", extra = {}) =>
  formatChannelValue(value, channelProfile({ name, unit, ...extra }));
test("engineering units and precision", () => {
  assert.equal(fmt(309.65, "K"), "36.5 °C");
  assert.equal(fmt(120000, "Pa"), "120.0 kPa");
  assert.equal(fmt(0.737, "1", "accumulator/state_of_charge", { min: 0, max: 1 }), "73.7 %");
  assert.equal(fmt(0.737, "ratio", "SoC"), "73.7 %");
  assert.equal(fmt(0.25, "1", "ThrottlePosition"), "25.0 %");
  assert.equal(fmt(0.25, "1", "duty_cycle"), "25.0 %");
  assert.equal(fmt(0.737, "1", "ratio"), "0.7370");
  assert.equal(fmt(0.033, "m", "shock_fl"), "33.0 mm");
  assert.equal(fmt(72.125, "rad/s", "wheel_speed"), "72.1250 rad/s");
  assert.equal(fmt(1234.8, "rpm"), "1235 rpm");
  assert.equal(fmt(3.14159, "V"), "3.14 V");
  assert.equal(fmt(3.14159, "A"), "3.1 A");
  assert.equal(fmt(3.14159, "deg"), "3.1 °");
  assert.equal(fmt(0.0007, "rad/s"), "0.0007 rad/s");
  assert.equal(fmt(0.0007, "rad/s", "yaw", { precision: 3 }), "0.001 rad/s");
  assert.equal(fmt(-0.00001, "V"), "0.00 V");
  assert.equal(fmt(12.3, "N*m"), "12.3 Nm");
  assert.equal(fmt(123456, "W"), "123456 W");
});
test("booleans, enums and raw tooltips", () => {
  const profile = channelProfile({ name: "state", enumLabels: { 1: "Driving" } });
  assert.equal(formatChannelValue(1, profile), "Driving");
  assert.equal(formatChannelValue(3, profile), "Unknown (3)");
  assert.equal(rawChannelValue("Unknown (3)", profile), "Raw: 3");
  assert.equal(rawChannelValue("Driving", profile), "Raw: 1");
  assert.equal(fmt(true, ""), "true");
  assert.equal(fmt(false, ""), "false");
  assert.equal(rawChannelValue(309.65, channelProfile({ name: "temp", unit: "K" })), "Raw: 309.65 K");
});
test("legacy display overrides load without changing channel profiles", () => {
  const log = new Log();
  log.displayOverrides = { [canonicalChannelPath("bus.temp")]: { unit: "K", precision: 2 } };
  const saved = JSON.stringify({ channelProfiles: log.displayOverrides });
  const next = new Log();
  assert.deepEqual(next.displayOverrides, log.displayOverrides);
  next.displayOverrides = JSON.parse(saved).channelProfiles;
  next.putNumber("bus/temp", 0, 300);
  next.setMetadataString("bus/temp", JSON.stringify({ unit: "K" }));
  assert.equal(formatChannelValue(300, next.getChannelProfile("bus/temp")), "26.9 °C");
  next.displayOverrides = {};
});
test("CSV matches qualified or unique signal names; sidecar wins", () => {
  const db = parseDBC(
    'BO_ 1 Dashboard_Dynamics: 8 DASH\n SG_ DASH_State : 0|8@1+ (1,0) [0|3] "" DASH\nVAL_ 1 DASH_State 1 "Driving";'
  );
  assert.ok(matchDBCChannel("bus1.Dashboard_Dynamics.DASH_State", [db]));
  assert.ok(matchDBCChannel("DASH_State", [db]));
  assert.equal(matchDBCChannel("absent", [db]), undefined);
  assert.equal(matchDBCChannel("DASH_State", [db, db]), undefined);
  const metadata = csvChannelMetadata("bus1.Dashboard_Dynamics.DASH_State", "", [db]);
  assert.deepEqual(metadata.enumLabels, { 1: "Driving" });
  const unitsDB = parseDBC('BO_ 2 Thermal: 8 ECU\n SG_ Temperature : 0|16@1+ (0.1,0) [0|400] "K" ECU');
  const enriched = csvChannelMetadata("bus0.Thermal.Temperature", "", [unitsDB]);
  assert.equal(enriched.unit, "K");
  assert.equal(fmt(300, enriched.unit!, "Temperature", enriched), "26.9 °C");
  assert.equal(csvChannelMetadata("Temperature", "degC", [unitsDB]).unit, "degC");
  assert.deepEqual(csvChannelMetadata("DASH_State", "", [db], { DASH_State: { 1: "Override" } }).enumLabels, {
    1: "Override"
  });
});

test("legend retains ratio range metadata when the axis unit has an empty suffix", () => {
  const log = new Log();
  log.putNumber("soc", 0, 0.737);
  log.setMetadataString("soc", JSON.stringify({ unit: "1", min: 0, max: 1 }));
  assert.equal(formatChannelValue(0.737, log.getChannelProfile("soc", "")), "73.7 %");
});

test("dimension precision is stable across magnitudes and supports explicit overrides", () => {
  assert.equal(fmt(0.001, "m", "shock"), "1.0 mm");
  assert.equal(fmt(0.1, "m", "shock"), "100.0 mm");
  assert.equal(fmt(1.2345, "m/s"), "1.23 m/s");
  assert.equal(fmt(123.456, "m/s"), "123.46 m/s");
  const metadata = { name: "temp", unit: "K" };
  assert.equal(formatChannelValue(300, channelProfile(metadata, { unit: "V" })), "26.9 °C");
  assert.equal(formatChannelValue(10, channelProfile(metadata), false, true), "10.0 °C");
  assert.equal(formatChannelValue(300, channelProfile(metadata, { precision: 3 })), "26.850 °C");
});
test("axis unit matches the legend display profile for every dimension", () => {
  const cases: [string, string, string, string][] = [
    ["K", "motor/temperature", "kelvin", "°C"],
    ["Pa", "pack/pressure", "pascals", "kPa"],
    ["V", "pack/voltage", "volts", "V"],
    ["rpm", "motor/rpm", "rotations/minute", "rpm"]
  ];
  for (const [rawUnit, name, axisBase, legendSuffix] of cases) {
    const profile = channelProfile({ name, unit: rawUnit });
    const unit = axisDisplayUnit(axisBase, profile);
    assert.equal(Units.ALL_UNITS[unit].suffix, profile.unit, name);
    assert.equal(profile.unit, legendSuffix, name);
  }
});

test("axis display unit follows every registered unit profile and compatible override", () => {
  for (const rawUnit of Object.keys(Units.ALL_UNITS)) {
    const profile = channelProfile({ name: "signal", unit: rawUnit });
    assert.equal(Units.ALL_UNITS[axisDisplayUnit(rawUnit, profile)].suffix, profile.unit, rawUnit);
    const override = channelProfile({ name: "signal", unit: rawUnit }, { unit: rawUnit });
    assert.equal(axisDisplayUnit(rawUnit, override), rawUnit);
  }
  assert.equal(axisDisplayUnit("kelvin", channelProfile({ name: "unknown" })), "kelvin");
});

test("empty catalogue values retain engineering units", () => {
  assert.equal(fmt(null, "m/s", "vehicle_speed"), "— m/s");
  assert.equal(fmt(undefined, "K", "temperature"), "— °C");
});

test("huge values are capped to four significant figures", () => {
  assert.equal(fmt(1793600405900000000, "ns"), "1.794e+18 ns");
  assert.equal(fmt(123456, "m"), "123456.000 m");
});
