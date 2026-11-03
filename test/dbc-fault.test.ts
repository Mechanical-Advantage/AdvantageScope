// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import { classifyDBCFault } from "../src/shared/DBCFault";
test("DBC enums distinguish faults, warnings, initialization and clear states", () => {
  const def = {
    name: "TTCS_IMDState",
    values: { 0: "Normal", 4: "Earth Fault", 5: "Ground Fault Warning", 255: "Invalid/Init" }
  };
  for (const [value, severity] of [
    [0, "ok"],
    [4, "critical"],
    [5, "warn"],
    [255, "unknown"],
    [9, "unknown"]
  ] as const)
    assert.equal(classifyDBCFault(def, value)?.severity, severity);
  assert.equal(classifyDBCFault(def, "Earth Fault")?.severity, "critical");
  assert.equal(classifyDBCFault({ name: "SBG_SolAidingFlags" }, 1), null);
});
test("DBC fault bits use comments when available", () => {
  const def = { name: "ECU_FaultFlags", comment: "bit 0: Motor; bit 1: Battery" };
  assert.equal(classifyDBCFault(def, 0)?.severity, "ok");
  assert.deepEqual(classifyDBCFault(def, 3), { severity: "critical", label: "Motor, Battery" });
});

test("fault bytes and timeout flags are active when nonzero", () => {
  for (const name of ["INV_FaultByte0", "TELEM_TimeoutFlags", "FAULT_Bitmask", "HB_CHG_FaultBits"]) {
    assert.equal(classifyDBCFault({ name }, 1)?.severity, "critical");
    assert.equal(classifyDBCFault({ name }, 0)?.severity, "ok");
  }
});
