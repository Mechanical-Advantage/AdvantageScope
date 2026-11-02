// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { parse } from "@foxglove/rosmsg";
import { MessageReader } from "@foxglove/rosmsg2-serialization";
import type { Channel } from "@foxglove/ws-protocol";
import Log from "../../../shared/log/Log";
import LoggableType from "../../../shared/log/LoggableType";
import { writeSpatialMessage } from "../../../shared/spatial/SpatialLog";
import {
  RAW_ONLY_TYPES,
  buildSchema,
  createFieldsFromSchema,
  extractPose,
  normalizeRosType,
  putPose3d,
  putPose3dArray,
  writeRosMessage,
  writeUnknown
} from "../mcap/RosMessages";
export function registerChannel(log: Log, channel: Channel) {
  const type = normalizeRosType(channel.schemaName);
  const definitions = channel.encoding === "cdr" ? parse(channel.schema, { ros2: true }) : null;
  const schema = definitions ? buildSchema(definitions) : null;
  const reader = definitions ? new MessageReader(definitions) : null;
  if (channel.encoding !== "cdr" && channel.encoding !== "json")
    throw new Error("Unsupported encoding: " + channel.encoding);
  log.createBlankField(channel.topic, LoggableType.Raw);
  log.setStructuredType(channel.topic, type);
  log.setMetadataString(
    channel.topic,
    JSON.stringify({
      topic: channel.topic,
      schema: channel.schemaName,
      encoding: channel.encoding,
      definition: channel.schema,
      time_basis: "server Time op (/clock)"
    })
  );
  if (schema && !RAW_ONLY_TYPES.has(type)) createFieldsFromSchema(log, channel.topic, schema);
  return {
    channel,
    lastTime: null as number | null,
    type,
    schema,
    decode: (bytes: Uint8Array): any =>
      reader ? reader.readMessage(bytes) : JSON.parse(new TextDecoder().decode(bytes))
  };
}
export type MappedChannel = ReturnType<typeof registerChannel>;
export function mapMessage(log: Log, mapped: MappedChannel, time: number, bytes: Uint8Array): any {
  const key = mapped.channel.topic;
  log.putRaw(key, time, bytes);
  const metadata = JSON.parse(log.getMetadataString(key) || "{}");
  metadata.messages = String(Number(metadata.messages ?? 0) + 1);
  metadata.time_basis = "Foxglove message timestamp / server clock";
  if (mapped.lastTime !== null && time > mapped.lastTime)
    metadata.observed_hz = Number((1 / (time - mapped.lastTime)).toFixed(1));
  mapped.lastTime = time;
  log.setMetadataString(key, JSON.stringify(metadata));
  if (RAW_ONLY_TYPES.has(mapped.type)) return null;
  const value = mapped.decode(bytes);
  const frame =
    value.header?.frame_id ?? value.transforms?.[0]?.header?.frame_id ?? value.markers?.[0]?.header?.frame_id;
  if (frame) log.setMetadataString(key, JSON.stringify({ ...metadata, frame_id: frame }));
  if (mapped.schema) writeRosMessage(log, key, time, value, mapped.schema);
  else writeUnknown(log, key, time, value);
  writeSpatialMessage(log, key, time, mapped.type, value);
  if (key === "/robot_description" && typeof value.data === "string") log.putString(key + "/xml", time, value.data);
  const pose = extractPose(mapped.type, value);
  if (pose?.position && pose?.orientation) putPose3d(log, key + "/pose3d", time, pose);
  if (mapped.type === "nav_msgs/Path")
    putPose3dArray(
      log,
      key + "/poses3d",
      time,
      (value.poses ?? []).map((p: any) => p.pose)
    );
  return value;
}
