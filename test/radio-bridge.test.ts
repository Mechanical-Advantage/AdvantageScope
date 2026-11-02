// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { LineFollower } from "../tools/radio-bridge/follow";
import { lineToPacket, sampleToMessages } from "../tools/radio-bridge/mapping";

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "radio-bridge-test-"));
function follow(file: string, fromStart = false) {
  const lines: string[] = [];
  const resets: string[] = [];
  const follower = new LineFollower({
    path: file,
    fromStart,
    onLine: (l) => lines.push(l),
    onReset: (r) => resets.push(r)
  });
  return { follower, lines, resets };
}

test("follower starts at the end, tolerates partial lines, and reads appended data", async () => {
  const file = path.join(tmp(), "live.jsonl");
  fs.writeFileSync(file, "old1\nold2\npart");
  const { follower, lines } = follow(file);
  await follower.poll();
  assert.deepEqual(lines, []);
  fs.appendFileSync(file, "ial\nnew1\nnew");
  await follower.poll();
  assert.deepEqual(lines, ["new1"]); // The fragment "part" is dropped; "new" is held back.
  fs.appendFileSync(file, "2\n");
  await follower.poll();
  assert.deepEqual(lines, ["new1", "new2"]);
});

test("follower --from-start replays existing content", async () => {
  const file = path.join(tmp(), "live.jsonl");
  fs.writeFileSync(file, "a\nb\n");
  const { follower, lines } = follow(file, true);
  await follower.poll();
  assert.deepEqual(lines, ["a", "b"]);
});

test("follower survives a missing file, truncation and replacement", async () => {
  const file = path.join(tmp(), "live.jsonl");
  const { follower, lines, resets } = follow(file);
  await follower.poll();
  fs.writeFileSync(file, "a\nb\n");
  await follower.poll();
  assert.deepEqual(lines, ["a", "b"]); // Created after start: read from the beginning.
  fs.writeFileSync(file, "c\n"); // Truncate (smaller than before)
  await follower.poll();
  assert.deepEqual(lines, ["a", "b", "c"]);
  fs.rmSync(file);
  await follower.poll();
  fs.writeFileSync(file, "d\ne\nf\n");
  await follower.poll();
  assert.deepEqual(lines.slice(3), ["d", "e", "f"]);
  const replacement = file + ".new";
  fs.writeFileSync(replacement, "g\n");
  fs.renameSync(replacement, file);
  await follower.poll();
  assert.equal(lines.at(-1), "g");
  assert.deepEqual(resets, ["appeared", "truncated", "missing", "appeared", "replaced"]);
});

const sample = (signal: string, value: unknown, time: unknown = "1793337911758980001") => ({ time, signal, value });

test("CAN samples map to NODE/Signal topics with exact nanoseconds", () => {
  const packet = lineToPacket(
    '{"run_id": "r1", "sequence": 3, "samples": [{"time": 1793337911758980001, "signal": "can0.Pedal_Status.PEDAL_Position1", "value": 50.0, "unit": "%"}]}'
  )!;
  assert.equal(packet.runId, "r1");
  assert.equal(packet.messages.length, 1);
  assert.match(packet.messages[0].topic, /^mur\/signal\/[A-Z0-9_]+\/PEDAL_Position1$/);
  assert.deepEqual(JSON.parse(packet.messages[0].payload), { t: "1793337911758980001", v: 50 });
});

test("bus name does not change the path, and non-CAN signals keep their dotted name", () => {
  const a = sampleToMessages(sample("can0.Dashboard_WheelSpeed.DASH_WheelSpeedFL", 1));
  const b = sampleToMessages(sample("can1.Dashboard_WheelSpeed.DASH_WheelSpeedFL", 1));
  assert.equal(a[0].topic, b[0].topic);
  assert.equal(sampleToMessages(sample("lvb0.voltage", 12.5))[0].topic, "mur/signal/lvb0/voltage");
});

test("enum signals publish the DBC label plus the raw number", () => {
  const messages = sampleToMessages(sample("can0.ECU_Status.ECU_ECUState", 1));
  assert.equal(messages.length, 2);
  assert.ok(messages[1].topic.endsWith("/ECU_ECUState/raw"));
  assert.equal(JSON.parse(messages[1].payload).v, 1);
  assert.equal(typeof JSON.parse(messages[0].payload).v, "string");
  assert.notEqual(JSON.parse(messages[0].payload).v, "1");
});

test("invalid samples and lines are dropped", () => {
  assert.deepEqual(sampleToMessages(sample("lvb0.voltage", null)), []);
  assert.deepEqual(sampleToMessages(sample("lvb0.voltage", 1, "nope")), []);
  assert.deepEqual(sampleToMessages({ value: 1 }), []);
  assert.equal(lineToPacket('{"run_id": "r1", "samples": [{"time"'), null);
});
