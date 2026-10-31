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
  if (RAW_ONLY_TYPES.has(mapped.type)) return null;
  const value = mapped.decode(bytes);
  if (mapped.schema) writeRosMessage(log, key, time, value, mapped.schema);
  else writeUnknown(log, key, time, value);
  writeSpatialMessage(log, key, time, mapped.type, value);
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
