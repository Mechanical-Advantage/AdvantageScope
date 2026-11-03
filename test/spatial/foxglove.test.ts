// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import { mapMessage, registerChannel } from "../../src/hub/dataSources/foxglove/FoxgloveMapping";
import Log from "../../src/shared/log/Log";
import { spatialSnapshot } from "../../src/shared/spatial/SpatialLog";
test("Foxglove maps whole topics, numeric leaves and shared spatial snapshots", () => {
  const log = new Log();
  const channel = registerChannel(log, {
    id: 1,
    topic: "/pose",
    encoding: "json",
    schemaName: "geometry_msgs/msg/PoseStamped",
    schema: "{}"
  });
  const value = {
    header: { frame_id: "map" },
    pose: { position: { x: 2, y: 3, z: 0 }, orientation: { w: 1, x: 0, y: 0, z: 0 } }
  };
  mapMessage(log, channel, 4, new TextEncoder().encode(JSON.stringify(value)));
  mapMessage(log, channel, 4.1, new TextEncoder().encode(JSON.stringify(value)));
  const metadata = JSON.parse(log.getMetadataString("/pose"));
  assert.equal(metadata.frame_id, "map");
  assert.equal(metadata.observed_hz, 10);
  assert.equal(log.getStructuredType("/pose"), "geometry_msgs/PoseStamped");
  assert.equal(log.getNumber("/pose/pose/position/x", 4, 4)?.values[0], 2);
  assert.equal(log.getStructuredType("/pose/pose3d"), "Pose3d");
  assert.equal(spatialSnapshot(log, "/pose", 4)?.value.header.frame_id, "map");
});

test("spatial snapshots reuse parsed values until the sample changes, including same-time replacement", () => {
  const log = new Log();
  log.putString("/pose/spatial", 1, '{"x":1}');
  const first = spatialSnapshot(log, "/pose", 1)!;
  assert.equal(spatialSnapshot(log, "/pose", 2)!.value, first.value);
  log.putString("/pose/spatial", 1, '{"x":2}');
  assert.equal(spatialSnapshot(log, "/pose", 2)!.value.x, 2);
  log.putString("/pose/spatial", 3, '{"x":3}');
  assert.equal(spatialSnapshot(log, "/pose", 3)!.value.x, 3);
  assert.equal(spatialSnapshot(log, "/pose", 1)!.value.x, 2);
});
