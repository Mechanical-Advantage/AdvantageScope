// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert";
import test from "node:test";
import { filterLogRows, filterTopics, fitScale, formatHz, topicRateHz } from "../src/hub/controllers/RosTabData";

test("filterTopics matches name and type terms", () => {
  const types: Record<string, string> = { "/a/pose": "geometry_msgs/Pose", "/b/img": "sensor_msgs/Image" };
  const typeOf = (t: string) => types[t];
  assert.deepStrictEqual(filterTopics(Object.keys(types), "", typeOf).length, 2);
  assert.deepStrictEqual(filterTopics(Object.keys(types), "POSE", typeOf), ["/a/pose"]);
  assert.deepStrictEqual(filterTopics(Object.keys(types), "sensor img", typeOf), ["/b/img"]);
});

test("topicRateHz uses the window before the cursor", () => {
  const ts = [0, 0.1, 0.2, 0.3, 5];
  assert.ok(Math.abs(topicRateHz(ts, 0.3)! - 10) < 1e-9);
  assert.strictEqual(topicRateHz(ts, 4), null);
  assert.strictEqual(formatHz(null), "—");
  assert.strictEqual(formatHz(49.6), "50 Hz");
  assert.strictEqual(formatHz(2.25), "2.3 Hz".replace("2.3", (2.25).toFixed(1)));
});

test("filterLogRows filters on text and node", () => {
  const rows = [
    { level: 20, node: "/a", message: "hello" },
    { level: 20, node: "/b", message: "world" }
  ];
  assert.strictEqual(filterLogRows(rows, "wor", "").length, 1);
  assert.strictEqual(filterLogRows(rows, "", "/a")[0].message, "hello");
  assert.strictEqual(filterLogRows(rows, "/b", "").length, 1);
});

test("fitScale fits the panel", () => {
  assert.strictEqual(fitScale(640, 480, 320, 480), 0.5);
  assert.strictEqual(fitScale(100, 100, 400, 400), 4);
  assert.strictEqual(fitScale(100, 100, 400, 400, 1), 1);
});
