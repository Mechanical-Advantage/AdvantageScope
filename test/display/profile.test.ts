// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// In-page live connection UI (works the same in Electron and Lite):
// - ConnectDialog: File -> Connect... (Cmd/Ctrl+K). Pick a registered source, enter an address, or pick a
//   recent server. Styled like the Preferences prompt.
// - LiveStatusPill: title-bar pill with three separate indicators (backend, car, sim), plus a popover with
//   details, sim controls (only when the backend has sim endpoints) and connect/disconnect.

import assert from "node:assert/strict";
import test from "node:test";
import { parseDBC } from "../../src/hub/dataSources/can/DBC";
import { csvChannelMetadata, matchDBCChannel } from "../../src/hub/dataSources/csv/CSVChannelMetadata";
import {
  canonicalChannelPath,
  channelProfile,
  formatChannelValue,
  rawChannelValue
} from "../../src/shared/display/ChannelProfile";
import Log from "../../src/shared/log/Log";

const fmt = (value: unknown, unit: string, name = "x", extra = {}) =>
  formatChannelValue(value, channelProfile({ name, unit, ...extra }));
test("engineering units and precision", () => {
  assert.equal(fmt(309.65, "K"), "36.5 °C");
  assert.equal(fmt(120000, "Pa"), "120.0 kPa");
  assert.equal(fmt(0.737, "1", "accumulator/state_of_charge", { min: 0, max: 1 }), "73.7 %");
  assert.equal(fmt(0.737, "1", "ratio"), "0.7370");
  assert.equal(fmt(0.033, "m", "shock_fl"), "33.00 mm");
  assert.equal(fmt(72.125, "rad/s", "wheel_speed"), "72.13 rad/s");
  assert.equal(fmt(1234.8, "rpm"), "1235 rpm");
  assert.equal(fmt(3.14159, "V"), "3.14 V");
  assert.equal(fmt(3.14159, "A"), "3.1 A");
  assert.equal(fmt(3.14159, "deg"), "3.1 °");
  assert.equal(fmt(0.0007, "rad/s"), "0.0007000 rad/s");
  assert.equal(fmt(0.0007, "rad/s", "yaw", { precision: 3 }), "0.001 rad/s");
  assert.equal(fmt(-0.00001, "V"), "0.00 V");
  assert.equal(fmt(12.3, "N*m"), "12.30 Nm");
});
test("booleans, enums and raw tooltips", () => {
  const profile = channelProfile({ name: "state", enumLabels: { 1: "Driving" } });
  assert.equal(formatChannelValue(1, profile), "Driving");
  assert.equal(formatChannelValue(3, profile), "Unknown (3)");
  assert.equal(fmt(true, ""), "true");
  assert.equal(fmt(false, ""), "false");
  assert.equal(rawChannelValue(309.65, channelProfile({ name: "temp", unit: "K" })), "Raw: 309.65 K");
});
test("overrides survive layout serialization and replacement logs by canonical path", () => {
  const log = new Log();
  log.displayOverrides = { [canonicalChannelPath("bus.temp")]: { unit: "K", precision: 2 } };
  const saved = JSON.stringify({ channelProfiles: log.displayOverrides });
  const next = new Log();
  next.displayOverrides = JSON.parse(saved).channelProfiles;
  next.putNumber("bus/temp", 0, 300);
  next.setMetadataString("bus/temp", JSON.stringify({ unit: "K" }));
  assert.equal(formatChannelValue(300, next.getChannelProfile("bus/temp")), "300.00 K");
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
  assert.deepEqual(csvChannelMetadata("DASH_State", "", [db], { DASH_State: { 1: "Override" } }).enumLabels, {
    1: "Override"
  });
});
