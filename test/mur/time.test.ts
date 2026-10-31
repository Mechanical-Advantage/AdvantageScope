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
  const base = new SessionTimeBase("unix");
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

test("sim domain: t_ns is used directly (epoch 0)", () => {
  const base = new SessionTimeBase("sim");
  const t = base.sampleTime({ t_ns: "2500000000", received_ns: "1793328600000000000", time_quality: "synchronised" })!;
  assert.equal(t.seconds, 2.5);
  assert.equal(base.getEpochNs(), 0n);
});

test("unsynchronised samples fall back to receive time, flagged approximate", () => {
  const base = new SessionTimeBase("unix");
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

test("sim domain unsynchronised samples map receive time onto the sim clock", () => {
  const base = new SessionTimeBase("sim");
  // Trusted sample: sim t = 10 s received at unix R
  base.sampleTime({ t_ns: "10000000000", received_ns: "1793328600000000000", time_quality: "synchronised" });
  // Unsynchronised sample received 0.5 s later (wall) -> ~10.5 s sim
  const t = base.sampleTime({
    t_ns: "99000000000",
    received_ns: "1793328600500000000",
    time_quality: "unsynchronised"
  })!;
  assert.equal(t.approximate, true);
  assert.equal(t.seconds, 10.5);
});

test("resetSegment re-derives the unix epoch and forgets the receive offset", () => {
  const base = new SessionTimeBase("sim");
  base.sampleTime({ t_ns: "10000000000", received_ns: "1793328600000000000", time_quality: "synchronised" });
  base.resetSegment();
  const t = base.sampleTime({
    t_ns: "3000000000",
    received_ns: "1793328700000000000",
    time_quality: "unsynchronised"
  })!;
  // No offset known yet: the source clock is used
  assert.equal(t.seconds, 3);
});

test("LiveClock extrapolates at 1x in the unix domain and never goes backwards", () => {
  const clock = new LiveClock("unix");
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

test("LiveClock freezes while the sim is paused and resumes continuously", () => {
  const clock = new LiveClock("sim");
  clock.setRunning(true, 3, 0);
  clock.observe(10, 0);
  assert.equal(clock.now(100), 10.3);
  clock.setRunning(false, 3, 100);
  assert.equal(clock.now(100), 10.3);
  assert.equal(clock.now(60000), 10.3, "paused: frozen however long it lasts");
  clock.setRunning(true, 3, 60000);
  assert.equal(clock.now(60100), 10.5, "extrapolation is capped just past the newest data");
  clock.observe(10.4, 60100);
  clock.observe(11, 60200);
  assert.equal(clock.now(60200), 11);
});

test("LiveClock.reset allows the edge to restart at an earlier time (new segment)", () => {
  const clock = new LiveClock("sim");
  clock.observe(500, 0);
  clock.reset();
  clock.observe(0.1, 10);
  assert.equal(clock.now(10), 0.1);
});
