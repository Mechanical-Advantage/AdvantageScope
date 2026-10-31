// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import { SampleDeduplicator } from "../../src/hub/dataSources/mur/MURDedup.ts";

const PATH = "vehicles/mur27/dynamics/vehicle_speed";

test("RF and cellular copies of the same (path, stream_id, seq) are accepted once", () => {
  const dedup = new SampleDeduplicator();
  for (let seq = 0; seq < 100; seq++) {
    assert.equal(dedup.accept(PATH, "s1", seq), true, "rf copy " + seq);
    assert.equal(dedup.accept(PATH, "s1", seq), false, "cellular copy " + seq);
  }
});

test("the same seq on a different stream or path is not a duplicate", () => {
  const dedup = new SampleDeduplicator();
  assert.equal(dedup.accept(PATH, "s1", 5), true);
  assert.equal(dedup.accept(PATH, "s2", 5), true);
  assert.equal(dedup.accept("vehicles/mur27/other", "s1", 5), true);
  assert.equal(dedup.accept(PATH, "s1", 5), false);
});

test("seq gaps (drops, throttling) and out-of-order samples within the window are accepted", () => {
  const dedup = new SampleDeduplicator();
  assert.equal(dedup.accept(PATH, "s1", 10), true);
  assert.equal(dedup.accept(PATH, "s1", 13), true);
  assert.equal(dedup.accept(PATH, "s1", 11), true);
  assert.equal(dedup.accept(PATH, "s1", 11), false);
  assert.equal(dedup.accept(PATH, "s1", 13), false);
});

test("history overlapping live data only adds the missing older samples", () => {
  const dedup = new SampleDeduplicator();
  // Live subscription started at seq 1000 (throttled: every 2nd sample)
  for (let seq = 1000; seq <= 1100; seq += 2) dedup.accept(PATH, "s1", seq);

  // History returns every sample from 0 to 1050
  const history = [];
  for (let seq = 0; seq <= 1050; seq++) history.push({ stream_id: "s1", seq: seq });
  const accepted = dedup.filterHistory(PATH, history);

  const acceptedSeqs = accepted.map((sample) => sample.seq);
  // Everything before live started, plus the odd seqs live skipped, and none of the live seqs
  assert.equal(acceptedSeqs.includes(1000), false);
  assert.equal(acceptedSeqs.includes(1050), false);
  assert.equal(acceptedSeqs.includes(1001), true);
  assert.equal(acceptedSeqs.includes(0), true);
  assert.equal(acceptedSeqs.length, 1000 + 25);
  // Returned in ascending order for insertion
  assert.deepEqual(
    acceptedSeqs,
    [...acceptedSeqs].sort((a, b) => a - b)
  );

  // Fetching the same history again adds nothing
  assert.equal(dedup.filterHistory(PATH, history).length, 0);
});

test("old duplicates outside the window are still rejected", () => {
  const dedup = new SampleDeduplicator();
  for (let seq = 0; seq < SampleDeduplicator.WINDOW * 3; seq++) dedup.accept(PATH, "s1", seq);
  assert.equal(dedup.accept(PATH, "s1", 5), false);
  assert.equal(dedup.accept(PATH, "s1", SampleDeduplicator.WINDOW * 3 - 1), false);
  assert.equal(dedup.accept(PATH, "s1", SampleDeduplicator.WINDOW * 3), true);
});

test("clear forgets all streams", () => {
  const dedup = new SampleDeduplicator();
  dedup.accept(PATH, "s1", 0);
  dedup.clear();
  assert.equal(dedup.accept(PATH, "s1", 0), true);
});
