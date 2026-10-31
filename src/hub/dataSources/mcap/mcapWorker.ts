// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { parse as parseRosMsg } from "@foxglove/rosmsg";
import { MessageReader } from "@foxglove/rosmsg2-serialization";
import { McapIndexedReader, McapTypes } from "@mcap/core";
import { decompress as zstdDecompress } from "fzstd";
import descriptor from "protobufjs/ext/descriptor";
import Log from "../../../shared/log/Log";
import LoggableType from "../../../shared/log/LoggableType";
import ProtoDecoder from "../../../shared/log/ProtoDecoder";
import { writeSpatialMessage } from "../../../shared/spatial/SpatialLog";
import { runLazyWorker, sendProgress, setMetadata } from "../ImporterUtil";
import {
  RAW_ONLY_TYPES,
  RosSchema,
  buildSchema,
  createFieldsFromSchema,
  extractPose,
  getHeaderStamp,
  normalizeRosType,
  putPose3d,
  putPose3dArray,
  writeRosMessage,
  writeUnknown
} from "./RosMessages";

/**
 * MCAP importer using the indexed reader. Opening reads only the summary (schemas, channels,
 * statistics); a topic's messages are read and decoded when one of its fields is requested.
 *
 * Encodings: ros2msg/cdr (@foxglove/rosmsg2-serialization), protobuf (FileDescriptorSet
 * schemas, via ProtoDecoder) and json. Others are kept as raw bytes.
 *
 * Timestamps: the message's header.stamp when it has a non-zero one, otherwise the MCAP log time.
 * See RosMessages.ts for the field-path conventions.
 */

interface ChannelInfo {
  key: string;
  channel: McapTypes.Channel;
  schemaName: string;
  rosType: string;
  decode: ((data: Uint8Array) => any) | null;
  rosSchema: RosSchema | null;
}

let log = new Log(false);
let reader: McapIndexedReader;
const channels = new Map<number, ChannelInfo>();
const topicKeys: string[] = []; // Sorted longest first, for prefix matching
const channelByKey = new Map<string, ChannelInfo>();
const decodedChannels = new Set<number>();
const protoDecoder = new ProtoDecoder();

// Decompressed chunk cache: each topic read touches most chunks, so keep them for later topics
const CHUNK_CACHE_LIMIT = 512 * 1024 * 1024;
// Keyed by the underlying buffer (the file) and offset, so copies never alias
const chunkCache = new WeakMap<ArrayBufferLike, Map<number, Uint8Array>>();
let chunkCacheSize = 0;

runLazyWorker(start, decode, () => log);

async function start(files: (Uint8Array | null)[]): Promise<Log> {
  const data = files[0]!;
  const readable = {
    size: async () => BigInt(data.byteLength),
    read: async (offset: bigint, length: bigint) => data.subarray(Number(offset), Number(offset + length))
  };
  reader = await McapIndexedReader.Initialize({
    readable,
    decompressHandlers: {
      zstd: (buffer, decompressedSize) => {
        let cacheForBuffer = chunkCache.get(buffer.buffer);
        if (cacheForBuffer === undefined) {
          cacheForBuffer = new Map();
          chunkCache.set(buffer.buffer, cacheForBuffer);
        }
        const cached = cacheForBuffer.get(buffer.byteOffset);
        if (cached && cached.byteLength === Number(decompressedSize)) return cached;
        const output = zstdDecompress(buffer, new Uint8Array(Number(decompressedSize)));
        if (chunkCacheSize + output.byteLength <= CHUNK_CACHE_LIMIT) {
          cacheForBuffer.set(buffer.byteOffset, output);
          chunkCacheSize += output.byteLength;
        }
        return output;
      }
    }
  });
  sendProgress(0.5);

  const counts = reader.statistics?.channelMessageCounts;
  const usedKeys = new Set<string>();
  for (const [id, channel] of reader.channelsById) {
    const schema = channel.schemaId === 0 ? undefined : reader.schemasById.get(channel.schemaId);
    let key = channel.topic.length > 0 ? channel.topic : "/channel" + id.toString();
    if (usedKeys.has(key)) key += "#" + id.toString();
    usedKeys.add(key);
    const schemaName = schema?.name ?? "";
    const rosType = normalizeRosType(schemaName);
    const info: ChannelInfo = { key, channel, schemaName, rosType, decode: null, rosSchema: null };
    let definitionText: string | undefined;
    try {
      if (schema?.encoding === "ros2msg" && channel.messageEncoding === "cdr") {
        definitionText = new TextDecoder().decode(schema.data);
        const definitions = parseRosMsg(definitionText, { ros2: true });
        info.rosSchema = buildSchema(definitions);
        const messageReader = new MessageReader(definitions);
        info.decode = (bytes) => messageReader.readMessage(bytes);
      } else if (schema?.encoding === "protobuf" && channel.messageEncoding === "protobuf") {
        const descriptorSet: any = descriptor.FileDescriptorSet.decode(schema.data);
        (descriptorSet.file ?? []).forEach((file: any) => {
          protoDecoder.addDescriptor(descriptor.FileDescriptorProto.encode(file).finish());
        });
        info.decode = (bytes) => protoDecoder.decode(schemaName, bytes).data;
      } else if (channel.messageEncoding === "json") {
        const textDecoder = new TextDecoder();
        info.decode = (bytes) => JSON.parse(textDecoder.decode(bytes));
      }
    } catch (error) {
      console.warn(`Cannot decode ${channel.topic} (${schemaName}), keeping raw bytes`, error);
    }
    if (RAW_ONLY_TYPES.has(rosType)) info.decode = null;

    channels.set(id, info);
    channelByKey.set(key, info);
    topicKeys.push(key);
    log.createBlankField(key, LoggableType.Raw);
    if (rosType.length > 0) log.setStructuredType(key, rosType);
    log.setWpilibType(key, channel.messageEncoding + ":" + schemaName);
    setMetadata(log, key, {
      topic: channel.topic,
      encoding: channel.messageEncoding,
      schema: schemaName,
      schemaEncoding: schema?.encoding,
      messages: counts?.get(id)?.toString(),
      // The 3D workstream needs the definition to decode raw-only types
      definition: RAW_ONLY_TYPES.has(rosType) ? definitionText : undefined
    });
    if (info.rosSchema) createFieldsFromSchema(log, key, info.rosSchema);
    if (isPoseType(rosType)) {
      log.createBlankField(key + "/pose3d", LoggableType.Empty);
      log.setStructuredType(key + "/pose3d", "Pose3d");
    }
    if (rosType === "nav_msgs/Path") {
      log.createBlankField(key + "/poses3d", LoggableType.Raw);
      log.setStructuredType(key + "/poses3d", "Pose3d[]");
    }
  }
  topicKeys.sort((a, b) => b.length - a.length);

  const start = reader.statistics?.messageStartTime;
  const end = reader.statistics?.messageEndTime;
  if (start !== undefined && end !== undefined) {
    log.updateRangeWithTimestamp(Number(start) / 1e9);
    log.updateRangeWithTimestamp(Number(end) / 1e9);
  } else if (reader.chunkIndexes.length > 0) {
    log.updateRangeWithTimestamp(Number(reader.chunkIndexes[0].messageStartTime) / 1e9);
    log.updateRangeWithTimestamp(Number(reader.chunkIndexes[reader.chunkIndexes.length - 1].messageEndTime) / 1e9);
  }
  return log;
}

function isPoseType(rosType: string): boolean {
  return [
    "geometry_msgs/Pose",
    "geometry_msgs/PoseStamped",
    "geometry_msgs/PoseWithCovariance",
    "geometry_msgs/PoseWithCovarianceStamped",
    "nav_msgs/Odometry",
    "geometry_msgs/TransformStamped"
  ].includes(rosType);
}

function findChannel(key: string): ChannelInfo | undefined {
  for (const topicKey of topicKeys) {
    if (key === topicKey || key.startsWith(topicKey + "/")) return channelByKey.get(topicKey);
  }
  return undefined;
}

async function decode(keys: string[]): Promise<string[]> {
  const targets = new Map<number, ChannelInfo>();
  keys.forEach((key) => {
    const info = findChannel(key);
    if (info !== undefined && !decodedChannels.has(info.channel.id)) targets.set(info.channel.id, info);
  });
  if (targets.size === 0) return [];
  const topics = [...new Set([...targets.values()].map((info) => info.channel.topic))];
  for await (const message of reader.readMessages({ topics })) {
    const info = targets.get(message.channelId);
    if (info === undefined) continue;
    const logTime = Number(message.logTime) / 1e9;
    let decoded: any = null;
    if (info.decode !== null) {
      try {
        decoded = info.decode(message.data);
      } catch (error) {
        decoded = null;
      }
    }
    const timestamp = getHeaderStamp(decoded) ?? logTime;
    log.putRaw(info.key, timestamp, message.data.slice());
    if (decoded === null) continue;
    writeSpatialMessage(log, info.key, timestamp, info.rosType, decoded);
    if (info.rosSchema) {
      writeRosMessage(log, info.key, timestamp, decoded, info.rosSchema);
    } else {
      writeUnknown(log, info.key, timestamp, decoded);
    }
    if (isPoseType(info.rosType)) {
      const pose = extractPose(info.rosType, decoded);
      if (pose?.position && pose?.orientation) putPose3d(log, info.key + "/pose3d", timestamp, pose);
    } else if (info.rosType === "nav_msgs/Path" && Array.isArray(decoded.poses)) {
      putPose3dArray(
        log,
        info.key + "/poses3d",
        timestamp,
        decoded.poses.map((pose: any) => pose.pose).filter((pose: any) => pose?.position && pose?.orientation)
      );
    }
  }
  targets.forEach((_, id) => decodedChannels.add(id));
  return [...log.getChangedFields()];
}
