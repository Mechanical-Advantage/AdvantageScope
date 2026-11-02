// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import { decimateColumns, isDense } from "../src/shared/display/Decimate";

test("decimation keeps min/max per pixel column and a mean", () => {
  const xs = Array.from({ length: 1000 }, (_, i) => i / 100); // 0..10 s
  const vs = xs.map((_, i) => (i % 2 ? 5900 : 0));
  const cols = decimateColumns(xs, vs, (x) => x * 10, 0, 100);
  assert.ok(cols.length <= 101);
  assert.equal(cols[10].min, 0);
  assert.equal(cols[10].max, 5900);
  assert.equal(cols[10].mean, 2950);
});

test("decimation skips NaN and clips to the visible columns", () => {
  const cols = decimateColumns([0, 1, 2, 3, 4], [1, NaN, 3, 4, 5], (x) => x * 10, 15, 25);
  assert.deepEqual(
    cols.map((c) => c.x),
    [20]
  );
});

test("smoothing averages neighbouring column means", () => {
  const xs = [0, 1, 2, 3, 4];
  const cols = decimateColumns(xs, [0, 10, 0, 10, 0], (x) => x, 0, 4, 3);
  assert.ok(Math.abs(cols[2].mean - 20 / 3) < 1e-9);
});

test("density threshold is two samples per pixel", () => {
  assert.equal(isDense(1000, 600), false);
  assert.equal(isDense(1300, 600), true);
});

test("NaN outages separate dense segments and smoothing does not bridge them", () => {
  const cols = decimateColumns([0, 1, 2, 3, 4], [10, 10, NaN, 90, 90], (x) => x, 0, 4, 60);
  assert.deepEqual(
    cols.map((c) => c.mean),
    [10, 10, 90, 90]
  );
  assert.notEqual(cols[1].segment, cols[2].segment);
});
