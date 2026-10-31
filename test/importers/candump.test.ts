// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CandumpFrameKind,
  DATA_STRIDE,
  FLAG_ERROR,
  FLAG_EXTENDED,
  FLAG_FD,
  FLAG_REMOTE,
  indexCandump,
  isCandump,
  parseCandumpLine
} from "../../src/hub/dataSources/can/Candump";

test("11-bit data frame", () => {
  const frame = parseCandumpLine("(1792000000.123456) can1 0A5#0000B80B00000000")!;
  assert.equal(frame.timestamp, 1792000000.123456);
  assert.equal(frame.iface, "can1");
  assert.equal(frame.id, 0x0a5);
  assert.equal(frame.extended, false);
  assert.equal(frame.kind, CandumpFrameKind.Data);
  assert.deepEqual([...frame.data], [0, 0, 0xb8, 0x0b, 0, 0, 0, 0]);
});

test("29-bit, remote, FD and error frames", () => {
  const extended = parseCandumpLine("(1792000000.130000) can1 0000290A#0003006C0E6E0E70")!;
  assert.equal(extended.extended, true);
  assert.equal(extended.id, 0x290a);
  const remote = parseCandumpLine("(1.5) can0 123#R")!;
  assert.equal(remote.kind, CandumpFrameKind.Remote);
  assert.equal(remote.data.length, 0);
  const fd = parseCandumpLine("(2.0) can0 123#" + "#1112233")!;
  assert.equal(fd.fd, true);
  assert.equal(fd.fdFlags, 1);
  assert.deepEqual([...fd.data], [0x11, 0x22, 0x33]);
  const error = parseCandumpLine("(3.0) can0 20000080#0000000000000000")!;
  assert.equal(error.kind, CandumpFrameKind.Error);
  assert.equal(error.id, 0x80);
  assert.equal(parseCandumpLine("garbage"), null);
  assert.equal(parseCandumpLine(""), null);
});

test("indexer matches the line parser", () => {
  const text = [
    "(1792040000.000292) can1 0A3#0102030405060708",
    "(1792040000.001093) can0 0000290A#AABB",
    "not a frame",
    "(1792040000.002000) can0 123#R",
    "(1792040000.003000) can0 20000004#0000000000000000",
    "(1792040000.004000) can1 7FF#" + "#3DEADBEEF",
    ""
  ].join("\r\n");
  const index = indexCandump(new TextEncoder().encode(text));
  assert.equal(index.count, 5);
  assert.equal(index.malformedLines, 1);
  assert.deepEqual(index.ifaces, ["can1", "can0"]);
  assert.equal(index.timestamps[0], 1792040000.000292);
  assert.equal(index.ids[0], 0xa3);
  assert.deepEqual([...index.data.subarray(0, 8)], [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(index.flags[1], FLAG_EXTENDED);
  assert.equal(index.ids[1], 0x290a);
  assert.equal(index.dataLength[1], 2);
  assert.equal(index.flags[2], FLAG_REMOTE);
  assert.equal(index.flags[3], FLAG_EXTENDED | FLAG_ERROR);
  assert.equal(index.ids[3], 4);
  assert.equal(index.flags[4], FLAG_FD);
  assert.deepEqual([...index.data.subarray(4 * DATA_STRIDE, 4 * DATA_STRIDE + 4)], [0xde, 0xad, 0xbe, 0xef]);
});

test("sniffs candump vs other .log files", () => {
  assert.equal(isCandump(new TextEncoder().encode("(1.0) can0 123#00\n(1.1) can0 123#01\n")), true);
  assert.equal(isCandump(new Uint8Array([0x52, 0x52, 0, 1, 2, 3])), false);
});
