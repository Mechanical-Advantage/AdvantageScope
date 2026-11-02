// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeRosPayload, imageRGBA, rosLogRows } from "../src/hub/controllers/RosTabData";
import { mapMessage, registerChannel } from "../src/hub/dataSources/foxglove/FoxgloveMapping";
import { rosTypeName, topicInspectorRows } from "../src/hub/TopicInspector";
import Log from "../src/shared/log/Log";

test("ROS images respect row padding, channel ordering, mono and alpha", () => {
  const image = (encoding: string, data: number[], step: number) => [
    ...imageRGBA({ width: 1, height: 2, encoding, step, data: new Uint8Array(data) })
  ];
  assert.deepEqual(image("bgr8", [1, 2, 3, 99, 4, 5, 6, 99], 4), [3, 2, 1, 255, 6, 5, 4, 255]);
  assert.deepEqual(image("rgba8", [1, 2, 3, 4, 5, 6, 7, 8], 4), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(image("mono8", [7, 99, 8, 99], 2), [7, 7, 7, 255, 8, 8, 8, 255]);
  assert.throws(() => image("rgb8", [1, 2], 3), /Truncated/);
  assert.throws(() => image("mono16", [], 2), /Unsupported/);
});

test("rosout filtering uses held severity and node name across deduplicated fields", () => {
  const log = new Log();
  for (let t = 1; t <= 3; t++) {
    log.putString("/rosout/msg", t, "message " + t);
    log.putString("/rosout/name", t, "planner");
    log.putNumber("/rosout/level", t, t === 3 ? 20 : 40);
  }
  const rows = rosLogRows(log, 2, 30);
  assert.equal(rows.length, 2);
  assert.deepEqual(
    rows.map((r) => [r.level, r.node]),
    [
      [40, "planner"],
      [40, "planner"]
    ]
  );
  assert.equal(rosLogRows(log, 3, 30).length, 2);
});

test("inspector reports received messages including identical payloads and MCAP totals", () => {
  const log = new Log();
  const mapped = registerChannel(log, {
    id: 1,
    topic: "/pose",
    encoding: "json",
    schemaName: "geometry_msgs/msg/PoseStamped",
    schema: "{}"
  });
  const bytes = new TextEncoder().encode(JSON.stringify({ header: { frame_id: "map" } }));
  for (let t = 1; t <= 3; t++) mapMessage(log, mapped, t, bytes);
  let rows = Object.fromEntries(topicInspectorRows(log, "/pose"));
  assert.equal(rows.Messages, "3");
  assert.equal(rows.frame_id, "map");
  log.setMetadataString("/pose", JSON.stringify({ messages: "2001", topic: "/original", qos: "reliable" }));
  rows = Object.fromEntries(topicInspectorRows(log, "/pose"));
  assert.equal(rows.Messages, "2001");
  assert.equal(rows.Topic, "/original");
  assert.equal(rows.QoS, "reliable");
  assert.equal(rosTypeName("Translation3d[]"), "geometry_msgs/Point[]");
});

test("raw payload inspection preserves nested JSON and reports unavailable schemas", () => {
  const value = { header: { frame_id: "camera" }, points: [1, 2, 3] };
  assert.deepEqual(decodeRosPayload(new TextEncoder().encode(JSON.stringify(value)), { encoding: "json" }), value);
  assert.throws(() => decodeRosPayload(new Uint8Array(), { encoding: "cdr" }), /No ROS/);
});
