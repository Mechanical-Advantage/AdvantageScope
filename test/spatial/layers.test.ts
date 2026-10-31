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
    log.putRaw("/cloud", 2, new Uint8Array([2]));
    const pending = layers.objects(log, "/cloud", 2, "map");
    assert.equal(pending.objects.length, 1, "keep the decoded scan visible while the newest scan decodes");
    layers.begin(new Log(), 0);
    assert.deepEqual(layers.tree.getFrames(), []);
    assert.throws(() => layers.objects(log, "/cloud", 2, "map"), /decoding/);
  } finally {
    WorkerManager.request = request;
  }
});

test("expired decoded scans cannot fail TF lookup for the current decay window", async () => {
  const layers = new SpatialLayers();
  const log = new Log();
  log.putRaw("/cloud", 1, new Uint8Array([1]));
  log.setStructuredType("/cloud", "sensor_msgs/PointCloud2");
  layers.begin(log, 1);
  layers.tree.addTransform("map", "retired_lidar", 1, identity());
  const request = WorkerManager.request;
  WorkerManager.request = async (_script, payload) => ({
    frame: payload.bytes[0] === 1 ? "retired_lidar" : "map",
    positions: new Float32Array([0, 0, 0])
  });
  try {
    assert.throws(() => layers.objects(log, "/cloud", 1, "map"), /decoding/);
    await Promise.resolve();
    layers.objects(log, "/cloud", 1, "map");
    log.putRaw("/cloud", 2, new Uint8Array([2]));
    layers.objects(log, "/cloud", 2, "map");
    await Promise.resolve();
    layers.tree.clear();
    const result = layers.objects(log, "/cloud", 2, "map");
    assert.equal(result.objects.length, 1);
    assert.equal(result.stamp, 2);
  } finally {
    WorkerManager.request = request;
  }
});
