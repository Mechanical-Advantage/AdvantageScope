// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LiveClock,
  SessionTimeBase,
  UNIX_EPOCH_MARGIN_NS,
  nsToSessionSeconds,
  parseNs,
  sessionSecondsToNs
} from "../../src/hub/dataSources/mur/MURTime.ts";

test("nsToSessionSeconds keeps nanosecond precision for Unix-epoch timestamps", () => {
  const epoch = 1793328600000000000n;
  assert.equal(nsToSessionSeconds(1793328600123456789n, epoch), 0.123456789);
  assert.equal(nsToSessionSeconds(1793328601000000001n, epoch), 1.000000001);
  // A float of the full epoch can't tell these apart; the session-relative values can
  const a = nsToSessionSeconds(1793328600000000010n, epoch);
  const b = nsToSessionSeconds(1793328600000000020n, epoch);
  assert.ok(b > a);
  assert.equal(Number(1793328600000000010n), Number(1793328600000000020n));
  // Negative deltas
  assert.equal(nsToSessionSeconds(epoch - 1500000000n, epoch), -1.5);
});

test("sessionSecondsToNs round-trips", () => {
  const epoch = 1793328600000000000n;
  assert.equal(sessionSecondsToNs(12.25, epoch), 1793328612250000000n);
  assert.equal(sessionSecondsToNs(0, epoch), epoch);
});

test("parseNs accepts decimal strings only", () => {
  assert.equal(parseNs("1793328600123456789"), 1793328600123456789n);
  assert.equal(parseNs("0"), 0n);
  assert.equal(parseNs("1.5"), null);
  assert.equal(parseNs(null), null);
  assert.equal(parseNs(undefined), null);
});

test("unix domain: the epoch is fixed from the first sample minus the history margin", () => {
  const base = new SessionTimeBase();
  const first = base.sampleTime({
    t_ns: "1793328600000000000",
    received_ns: "1793328600020000000",
    time_quality: "estimated"
  })!;
  assert.equal(base.getEpochNs(), 1793328600000000000n - UNIX_EPOCH_MARGIN_NS);
  assert.equal(first.seconds, Number(UNIX_EPOCH_MARGIN_NS / 1000000000n));
  assert.equal(first.approximate, false);

  // History from 5 minutes earlier is still positive
  const older = base.sampleTime({
    t_ns: "1793328300000000000",
    received_ns: "1793328300020000000",
    time_quality: "synchronised"
  })!;
  assert.ok(older.seconds > 0);
  assert.equal(first.seconds - older.seconds, 300);
});

test("unsynchronised samples fall back to receive time, flagged approximate", () => {
  const base = new SessionTimeBase();
  base.sampleTime({ t_ns: "1793328600000000000", received_ns: "1793328600010000000", time_quality: "estimated" });
  // Source clock is 1.734 s ahead; receive time is the trusted approximation
  const t = base.sampleTime({
    t_ns: "1793328601734000000",
    received_ns: "1793328600030000000",
    time_quality: "unsynchronised"
  })!;
  assert.equal(t.approximate, true);
  assert.equal(t.seconds, nsToSessionSeconds(1793328600030000000n, base.getEpochNs()!));
});

test("resetSegment re-derives the Unix epoch", () => {
  const base = new SessionTimeBase();
  base.observeReference(1793328600000000000n);
  base.resetSegment();
  assert.equal(base.getEpochNs(), null);
  const t = base.sampleTime({
    t_ns: "1793328701734000000",
    received_ns: "1793328700000000000",
    time_quality: "unsynchronised"
  })!;
  assert.equal(t.approximate, true);
  assert.equal(t.seconds, 3600);
  assert.equal(base.getEpochNs(), 1793328700000000000n - UNIX_EPOCH_MARGIN_NS);
});

test("LiveClock extrapolates at 1x in the unix domain and never goes backwards", () => {
  const clock = new LiveClock();
  assert.equal(clock.now(0), null);
  clock.observe(100, 1000);
  assert.equal(clock.now(1500), 100.5);
  // Older data does not pull the edge back
  clock.observe(99, 1600);
  assert.ok(clock.now(1600)! >= 100.5);
  // Newer data moves it forward
  clock.observe(105, 1700);
  assert.equal(clock.now(1700), 105);
});

test("LiveClock.reset allows the edge to restart at an earlier time (new segment)", () => {
  const clock = new LiveClock();
  clock.observe(500, 0);
  clock.reset();
  clock.observe(0.1, 10);
  assert.equal(clock.now(10), 0.1);
});
