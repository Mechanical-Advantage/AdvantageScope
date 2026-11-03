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
import LoggableType from "../../src/shared/log/LoggableType";
import { getOrDefault } from "../../src/shared/log/LogUtil";

function channel(log: Log, topic: string, schemaName: string) {
  return registerChannel(log, { id: 1, topic, schemaName, schema: "{}", encoding: "json" });
}
const bytes = (value: unknown) => new TextEncoder().encode(JSON.stringify(value));

test("live binary and spatial histories expire, scalar telemetry and static TF keep liveDiscard", () => {
  const log = new Log();
  const cloud = channel(log, "/cloud", "sensor_msgs/msg/PointCloud2");
  const image = channel(log, "/image", "sensor_msgs/msg/Image");
  const pose = channel(log, "/pose", "geometry_msgs/msg/PoseStamped");
  const tf = channel(log, "/tf_static", "tf2_msgs/msg/TFMessage");
  for (const time of [1, 41, 61, 100]) {
    for (const mapped of [cloud, image, pose, tf]) mapMessage(log, mapped, time, bytes({ value: time }));
    log.putNumber("/scalar", time, time);
  }
  const identity = log.getField("/cloud");
  const version = log.getHistoryVersion("/cloud");
  log.getTimestamps(["/cloud", "/pose/spatial"], "union");
  log.getRaw("/cloud", 100, 100, "reader");
  log.discardLiveData(101, 1200);
  assert.deepEqual(log.getRaw("/cloud", -Infinity, Infinity)?.timestamps, [41, 61, 100]);
  assert.deepEqual(log.getRaw("/image", -Infinity, Infinity)?.timestamps, [41, 61, 100]);
  assert.deepEqual(log.getString("/pose/spatial", -Infinity, Infinity)?.timestamps, [41, 61, 100]);
  assert.deepEqual(log.getNumber("/scalar", -Infinity, Infinity)?.timestamps, [1, 41, 61, 100]);
  assert.equal(log.getRaw("/tf_static", -Infinity, Infinity)?.timestamps[0], 1);
  assert.equal(log.getField("/cloud"), identity);
  assert.equal(log.getHistoryVersion("/cloud"), version);
  assert.deepEqual(log.getTimestamps(["/cloud", "/pose/spatial"], "union"), [41, 61, 100]);
  assert.equal(getOrDefault(log, "/cloud", LoggableType.Raw, 20, null), null);
  assert.deepEqual(log.getRaw("/cloud", 80, 80, "reader")?.values[0], bytes({ value: 61 }));
  log.discardLiveData(200, 1200);
  assert.equal(getOrDefault(log, "/cloud", LoggableType.Raw, 200, null), null);
  assert.ok(log.getFieldKeys().includes("/cloud"));
  assert.equal(log.getString("/pose/spatial", 200, 200)?.values.length, 0);
});

test("bounded histories still expire with unlimited liveDiscard", () => {
  const log = new Log();
  mapMessage(log, channel(log, "/image", "sensor_msgs/Image"), 1, bytes({ data: [1] }));
  log.putNumber("/scalar", 1, 3);
  log.discardLiveData(100, -1);
  assert.deepEqual(log.getRaw("/image", 100, 100)?.values, []);
  assert.equal(log.getNumber("/scalar", 100, 100)?.values[0], 3);
});

test("file logs retain all samples and lazy strings serialize as ordinary strings", () => {
  const log = new Log();
  const pose = channel(log, "/pose", "geometry_msgs/PoseStamped");
  for (const time of [1, 2000]) mapMessage(log, pose, time, bytes({ value: time }));
  assert.deepEqual(log.getRaw("/pose", -Infinity, Infinity)?.timestamps, [1, 2000]);
  const restored = Log.fromSerialized(log.toSerialized());
  assert.deepEqual(restored.getString("/pose/spatial", -Infinity, Infinity)?.values, ['{"value":1}', '{"value":2000}']);
});

test("spatial JSON is lazy, bounded caching preserves reader values", () => {
  const log = new Log();
  let reads = 0;
  for (let i = 0; i < 4; i++)
    log.putLazyString("/spatial", i, () => {
      reads++;
      return String(i);
    });
  assert.equal(reads, 0);
  assert.equal(log.getString("/spatial", 3, 3)?.values[0], "3");
  assert.equal(log.getString("/spatial", 3, 3)?.values[0], "3");
  assert.equal(reads, 1);
  assert.deepEqual(log.getString("/spatial", -Infinity, Infinity)?.values, ["0", "1", "2", "3"]);
});

test("logical front discard hides expired samples before compaction and rejects late samples", () => {
  const log = new Log();
  const cloud = channel(log, "/cloud", "sensor_msgs/PointCloud2");
  for (let i = 0; i < 10; i++) mapMessage(log, cloud, i, bytes({ i }));
  log.getRaw("/cloud", 0, 0, "reader");
  log.discardLiveData(62, 1200);
  assert.deepEqual(log.getField("/cloud")?.getTimestamps(), [2, 3, 4, 5, 6, 7, 8, 9]);
  assert.equal(getOrDefault(log, "/cloud", LoggableType.Raw, 1, null, "reader"), null);
  assert.deepEqual(log.getRaw("/cloud", 3.5, 3.5, "reader")?.values, [bytes({ i: 3 }), bytes({ i: 4 })]);
  mapMessage(log, cloud, 0, bytes({ i: 99 }));
  assert.equal(log.getRaw("/cloud", -Infinity, Infinity)?.values.length, 8);
  assert.equal(Log.fromSerialized(log.toSerialized()).getRaw("/cloud", -Infinity, Infinity)?.values.length, 8);
});

test("identical bounded messages keep receipt times and remain current until their last receipt expires", () => {
  const log = new Log();
  const image = channel(log, "/image", "sensor_msgs/Image");
  for (const time of [1, 30, 70]) mapMessage(log, image, time, bytes({ data: [1] }));
  log.discardLiveData(100, 1200);
  assert.deepEqual(log.getRaw("/image", -Infinity, Infinity)?.timestamps, [70]);
  assert.deepEqual(getOrDefault(log, "/image", LoggableType.Raw, 100, null), bytes({ data: [1] }));
  log.discardLiveData(131, 1200);
  assert.equal(getOrDefault(log, "/image", LoggableType.Raw, 131, null), null);
});
