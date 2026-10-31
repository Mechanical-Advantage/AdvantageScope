// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import { validateLiveAddress } from "../src/hub/dataSources/LiveAddress";

test("Foxglove accepts browser WebSocket URLs and hostnames", () => {
  for (const address of ["ws://localhost:8765", "wss://base.example/ros", "localhost:8765"]) {
    assert.equal(validateLiveAddress("foxglove", address), null);
  }
  for (const address of ["http://localhost:8765", "ws://user:secret@base.example", "bad host"]) {
    assert.notEqual(validateLiveAddress("foxglove", address), null);
  }
});
