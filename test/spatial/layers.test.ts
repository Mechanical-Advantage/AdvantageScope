// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import { SpatialLayers } from "../../src/hub/controllers/SpatialLayers";
import WorkerManager from "../../src/hub/WorkerManager";
import Log from "../../src/shared/log/Log";
import { identity } from "../../src/shared/spatial/Transform";

test("retained scans use TF at acquisition time and reset clears decoded scans", async () => {
  const layers = new SpatialLayers();
  const log = new Log();
  log.putRaw("/cloud", 1, new Uint8Array([1]));
  log.setStructuredType("/cloud", "sensor_msgs/PointCloud2");
  layers.begin(log, 1);
  layers.tree.addTransform("map", "lidar", 1, { ...identity(), translation: [1, 0, 0] });
  layers.tree.addTransform("map", "lidar", 2, { ...identity(), translation: [2, 0, 0] });
  const request = WorkerManager.request;
  WorkerManager.request = async () => ({ frame: "lidar", positions: new Float32Array([0, 0, 0]) });
  try {
    assert.throws(() => layers.objects(log, "/cloud", 2, "map"), /decoding/);
    await Promise.resolve();
    const result = layers.objects(log, "/cloud", 2, "map");
    assert.equal(result.objects[0].type, "cloud");
    if (result.objects[0].type === "cloud") assert.deepEqual(result.objects[0].transform.translation, [1, 0, 0]);
    layers.begin(new Log(), 0);
    assert.deepEqual(layers.tree.getFrames(), []);
    assert.throws(() => layers.objects(log, "/cloud", 2, "map"), /decoding/);
  } finally {
    WorkerManager.request = request;
  }
});
