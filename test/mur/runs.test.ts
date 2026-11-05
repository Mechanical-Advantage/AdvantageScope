// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import test from "node:test";
import { validateLiveAddress } from "../../src/hub/dataSources/LiveAddress";

test("connection address validation follows the source protocol", () => {
  for (const address of ["localhost:8090", "https://example.org", "ws://127.0.0.1:8090/api/v1/live"])
    assert.equal(validateLiveAddress("mur", address), null);
  for (const address of ["ftp://example.org", "bad address", "http://", "http://user:password@host"])
    assert.notEqual(validateLiveAddress("mur", address), null);
  for (const address of ["127.0.0.1", "robot.local", "localhost:5810"])
    assert.equal(validateLiveAddress("nt4", address), null);
  assert.notEqual(validateLiveAddress("nt4", "http://localhost"), null);
});
