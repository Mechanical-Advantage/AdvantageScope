// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { compress } from "lz4js";
import assert from "node:assert/strict";
import { test } from "node:test";
import { createDecompressHandlers } from "../../src/hub/dataSources/mcap/Compression";

test("MCAP LZ4 frame and cached repeated reads", async () => {
  const source = new TextEncoder().encode("telemetry channel ".repeat(1000));
  const handlers = await createDecompressHandlers();
  const compressed = compress(source);
  const output = handlers.lz4(compressed, BigInt(source.length));
  assert.deepEqual(output, source);
  assert.equal(handlers.lz4(compressed, BigInt(source.length)), output);
  assert.throws(() => handlers.lz4(compressed, 1n));
});
