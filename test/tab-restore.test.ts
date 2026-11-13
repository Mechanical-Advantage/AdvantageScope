// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import test from "node:test";
import TabType, { filterRestorableTabs, getAllTabTypes, NEW_TAB_TYPES } from "../src/shared/TabType";

const tabs = (types: number[]) => types.map((type) => ({ type: type as TabType }));

test("restoring the pre-rollback layout selects the preceding surviving tab", () => {
  const restored = filterRestorableTabs(tabs([0, 1, 1, 2, 3, 20, 21, 22, 4, 14, 13, 2, 3]), 5);
  assert.deepEqual(
    restored.tabs.map((tab) => tab.type),
    [0, 1, 1, 2, 4, 14, 13, 2]
  );
  assert.equal(restored.selected, 3);
});

test("restoring keeps the same surviving tab selected after earlier removals", () => {
  assert.equal(filterRestorableTabs(tabs([0, 3, 8, 1, 9, 10, 4]), 6).selected, 2);
});

test("restoring clamps selection when no predecessor survives", () => {
  assert.equal(filterRestorableTabs(tabs([3, 20, 1]), 1).selected, 0);
  assert.deepEqual(filterRestorableTabs(tabs([3, 8, 9, 10, 20, 21, 22]), 5), { tabs: [], selected: 0 });
  assert.deepEqual(filterRestorableTabs([], -1), { tabs: [], selected: 0 });
  assert.equal(filterRestorableTabs(tabs([0, 1]), 99).selected, 1);
});

test("2D Field stays restorable while new tabs use the core menu order", () => {
  assert.ok(getAllTabTypes().includes(TabType.Field2d));
  assert.deepEqual(NEW_TAB_TYPES, [1, 13, 4, 6, 5, 7, 15, 11, 12]);
  assert.ok(getAllTabTypes().includes(TabType.Laps), "old Laps tabs stay restorable");
});
