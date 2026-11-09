// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import Log from "../../src/shared/log/Log";
import LoggableType from "../../src/shared/log/LoggableType";
import { getOrDefault } from "../../src/shared/log/LogUtil";

function channel(log: Log, topic: string, type: string) {
  log.createBlankField(topic, LoggableType.Raw);
  if (type !== "static") log.setLiveRetention(topic, 60);
  if (type === "message") log.setLiveRetention(topic + "/history", 60);
  if (type.startsWith("bounded-children")) log.setLiveChildRetention(topic, 60);
  return { topic, type };
}
function mapMessage(log: Log, mapped: ReturnType<typeof channel>, time: number, data: Uint8Array) {
  log.putRaw(mapped.topic, time, data);
  if (mapped.type === "message")
    log.putLazyString(mapped.topic + "/history", time, () => new TextDecoder().decode(data));
  if (mapped.type.startsWith("bounded-children") || mapped.type === "message") {
    const value = JSON.parse(new TextDecoder().decode(data));
    for (const key of ["child", "late"])
      if (value[key]) log.putNumber(mapped.topic + "/" + key + "/x", time, value[key].x);
  }
}
const bytes = (value: unknown) => new TextEncoder().encode(JSON.stringify(value));

test("bounded histories expire, scalar telemetry and unbounded fields keep liveDiscard", () => {
  const log = new Log();
  const cloud = channel(log, "/binary", "binary");
  const image = channel(log, "/image", "binary");
  const pose = channel(log, "/message", "message");
  const tf = channel(log, "/static", "static");
  for (const time of [1, 41, 61, 100]) {
    for (const mapped of [cloud, image, pose, tf]) mapMessage(log, mapped, time, bytes({ value: time }));
    log.putNumber("/scalar", time, time);
  }
  const identity = log.getField("/binary");
  const version = log.getHistoryVersion("/binary");
  log.getTimestamps(["/binary", "/message/history"], "union");
  log.getRaw("/binary", 100, 100, "reader");
  log.discardLiveData(101, 1200);
  assert.deepEqual(log.getRaw("/binary", -Infinity, Infinity)?.timestamps, [41, 61, 100]);
  assert.deepEqual(log.getRaw("/image", -Infinity, Infinity)?.timestamps, [41, 61, 100]);
  assert.deepEqual(log.getString("/message/history", -Infinity, Infinity)?.timestamps, [41, 61, 100]);
  assert.deepEqual(log.getNumber("/scalar", -Infinity, Infinity)?.timestamps, [1, 41, 61, 100]);
  assert.equal(log.getRaw("/static", -Infinity, Infinity)?.timestamps[0], 1);
  assert.equal(log.getField("/binary"), identity);
  assert.equal(log.getHistoryVersion("/binary"), version);
  assert.deepEqual(log.getTimestamps(["/binary", "/message/history"], "union"), [41, 61, 100]);
  assert.equal(getOrDefault(log, "/binary", LoggableType.Raw, 20, null), null);
  assert.deepEqual(log.getRaw("/binary", 80, 80, "reader")?.values[0], bytes({ value: 61 }));
  log.discardLiveData(200, 1200);
  assert.equal(getOrDefault(log, "/binary", LoggableType.Raw, 200, null), null);
  assert.ok(log.getFieldKeys().includes("/binary"));
  assert.equal(log.getString("/message/history", 200, 200)?.values.length, 0);
});

test("bounded histories still expire with unlimited liveDiscard", () => {
  const log = new Log();
  mapMessage(log, channel(log, "/image", "binary"), 1, bytes({ data: [1] }));
  log.putNumber("/scalar", 1, 3);
  log.discardLiveData(100, -1);
  assert.deepEqual(log.getRaw("/image", 100, 100)?.values, []);
  assert.equal(log.getNumber("/scalar", 100, 100)?.values[0], 3);
});

test("file logs retain all samples and lazy strings serialize as ordinary strings", () => {
  const log = new Log();
  const pose = channel(log, "/message", "message");
  for (const time of [1, 2000]) mapMessage(log, pose, time, bytes({ value: time }));
  assert.deepEqual(log.getRaw("/message", -Infinity, Infinity)?.timestamps, [1, 2000]);
  const restored = Log.fromSerialized(log.toSerialized());
  assert.deepEqual(restored.getString("/message/history", -Infinity, Infinity)?.values, [
    '{"value":1}',
    '{"value":2000}'
  ]);
});

test("JSON is lazy, bounded caching preserves reader values", () => {
  const log = new Log();
  let reads = 0;
  for (let i = 0; i < 4; i++)
    log.putLazyString("/history", i, () => {
      reads++;
      return String(i);
    });
  assert.equal(reads, 0);
  assert.equal(log.getString("/history", 3, 3)?.values[0], "3");
  assert.equal(log.getString("/history", 3, 3)?.values[0], "3");
  assert.equal(reads, 1);
  assert.deepEqual(log.getString("/history", -Infinity, Infinity)?.values, ["0", "1", "2", "3"]);
});

test("logical front discard hides expired samples before compaction and rejects late samples", () => {
  const log = new Log();
  const cloud = channel(log, "/binary", "binary");
  for (let i = 0; i < 10; i++) mapMessage(log, cloud, i, bytes({ i }));
  log.getRaw("/binary", 0, 0, "reader");
  log.discardLiveData(62, 1200);
  assert.deepEqual(log.getField("/binary")?.getTimestamps(), [2, 3, 4, 5, 6, 7, 8, 9]);
  assert.equal(getOrDefault(log, "/binary", LoggableType.Raw, 1, null, "reader"), null);
  assert.deepEqual(log.getRaw("/binary", 3.5, 3.5, "reader")?.values, [bytes({ i: 3 }), bytes({ i: 4 })]);
  mapMessage(log, cloud, 0, bytes({ i: 99 }));
  assert.equal(log.getRaw("/binary", -Infinity, Infinity)?.values.length, 8);
  assert.equal(Log.fromSerialized(log.toSerialized()).getRaw("/binary", -Infinity, Infinity)?.values.length, 8);
});

test("identical bounded messages keep receipt times and remain current until their last receipt expires", () => {
  const log = new Log();
  const image = channel(log, "/image", "binary");
  for (const time of [1, 30, 70]) mapMessage(log, image, time, bytes({ data: [1] }));
  log.discardLiveData(100, 1200);
  assert.deepEqual(log.getRaw("/image", -Infinity, Infinity)?.timestamps, [70]);
  assert.deepEqual(getOrDefault(log, "/image", LoggableType.Raw, 100, null), bytes({ data: [1] }));
  log.discardLiveData(131, 1200);
  assert.equal(getOrDefault(log, "/image", LoggableType.Raw, 131, null), null);
});

test("bounded children expire, including children created after registration", () => {
  const log = new Log();
  for (const type of ["bounded-children", "bounded-children-2", "message"]) {
    const mapped = channel(log, "/" + type, type);
    for (const time of [1, 50, 100]) mapMessage(log, mapped, time, bytes({ child: { x: time } }));
    mapMessage(log, mapped, 100, bytes({ late: { x: 7 } }));
  }
  log.discardLiveData(101, 1200);
  for (const type of ["bounded-children", "bounded-children-2"]) {
    assert.deepEqual(log.getNumber("/" + type + "/child/x", -Infinity, Infinity)?.timestamps, [50, 100]);
    assert.equal(log.getNumber("/" + type + "/late/x", 101, 101)?.values[0], 7);
  }
  assert.deepEqual(log.getNumber("/message/child/x", -Infinity, Infinity)?.timestamps, [1, 50, 100]);
  log.discardLiveData(200, -1);
  assert.equal(log.getNumber("/bounded-children/late/x", 200, 200)?.values.length, 0);
  assert.ok(log.getFieldKeys().includes("/bounded-children/late/x"));
});

test("lazy ranges resolve only consumed entries and memoize each entry for that use", () => {
  const log = new Log();
  let reads = 0;
  for (let i = 0; i < 10; i++)
    log.putLazyString("/lazy", i, () => {
      reads++;
      return String(i);
    });
  const data = log.getString("/lazy", -Infinity, Infinity)!;
  assert.equal(reads, 0);
  assert.equal(data.values[0], "0");
  for (let i = 1; i < 10; i++) assert.equal(data.values[i], String(i));
  assert.equal(data.values[0], "0");
  assert.equal(reads, 10);
});
