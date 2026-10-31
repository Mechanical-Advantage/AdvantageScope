// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { MessageDefinition, MessageDefinitionField } from "@foxglove/message-definition";
import Log from "../../../shared/log/Log";
import LoggableType from "../../../shared/log/LoggableType";

/**
 * Writes decoded ROS 2 (or JSON/protobuf) messages into a Log as child fields so numeric leaves
 * can be graphed, plus mappings of common geometry types to the built-in Pose3d types.
 *
 * Conventions (keep stable, layouts depend on them):
 *   <topic>                    Raw: the encoded message; structuredType = ROS type
 *                              ("sensor_msgs/Imu"), wpilibType = "<encoding>:<schema name>"
 *   <topic>/<field>/<sub>      decoded fields
 *   <topic>/<field>            for ROS enum fields (integer field with matching constants in the
 *                              .msg): the constant name as a string; <topic>/<field>/raw = number
 *   <topic>/pose3d             Pose3d for PoseStamped, Pose, PoseWithCovariance(Stamped), Odometry
 *                              and TransformStamped
 *   <topic>/poses3d            Pose3d[] for nav_msgs/Path (packed WPILib Pose3d structs)
 * Primitive arrays longer than MAX_PRIMITIVE_ARRAY and message arrays longer than
 * MAX_COMPLEX_ARRAY are cut off (their "length" child still gives the true length).
 */

export const MAX_PRIMITIVE_ARRAY = 64;
export const MAX_COMPLEX_ARRAY = 64;
const MAX_DEPTH = 8;
export const ENUM_RAW_SUFFIX = "/raw";

/** Types kept as raw blobs only (rendered by the 3D workstream, not exploded). */
export const RAW_ONLY_TYPES = new Set([
  "sensor_msgs/PointCloud2",
  "sensor_msgs/PointCloud",
  "sensor_msgs/Image",
  "sensor_msgs/CompressedImage",
  "sensor_msgs/LaserScan",
  "nav_msgs/OccupancyGrid"
]);

/** "sensor_msgs/msg/Imu" → "sensor_msgs/Imu" */
export function normalizeRosType(name: string): string {
  return name.replace("/msg/", "/");
}

export interface RosSchema {
  root: MessageDefinition;
  byName: Map<string, MessageDefinition>;
}

export function buildSchema(definitions: MessageDefinition[]): RosSchema {
  const byName = new Map<string, MessageDefinition>();
  definitions.forEach((definition) => {
    if (definition.name) byName.set(normalizeRosType(definition.name), definition);
  });
  return { root: definitions[0], byName };
}

const NUMBER_TYPES = new Set([
  "int8",
  "uint8",
  "int16",
  "uint16",
  "int32",
  "uint32",
  "int64",
  "uint64",
  "float32",
  "float64",
  "byte",
  "char"
]);

/** Maps integer fields to their enum constants: field name → (value → constant name). */
export function getEnumTables(definition: MessageDefinition): Map<string, Map<number, string>> {
  const tables = new Map<string, Map<number, string>>();
  const constants = definition.definitions.filter((field) => field.isConstant && NUMBER_TYPES.has(field.type));
  if (constants.length === 0) return tables;
  const fields = definition.definitions.filter(
    (field) => !field.isConstant && !field.isComplex && !field.isArray && NUMBER_TYPES.has(field.type)
  );
  const unmatched = new Set(constants);
  fields.forEach((field) => {
    // ROS convention: constants for field "state" are named STATE_*
    const prefix = field.name.toUpperCase() + "_";
    const matching = constants.filter((constant) => constant.name.startsWith(prefix));
    if (matching.length > 0) {
      tables.set(field.name, new Map(matching.map((constant) => [Number(constant.value), constant.name])));
      matching.forEach((constant) => unmatched.delete(constant));
    }
  });
  // Otherwise, if exactly one field has the constants' type, assume they belong to it
  if (unmatched.size > 0) {
    const type = [...unmatched][0].type;
    const candidates = fields.filter((field) => field.type === type && !tables.has(field.name));
    if (candidates.length === 1 && [...unmatched].every((constant) => constant.type === type)) {
      tables.set(
        candidates[0].name,
        new Map([...unmatched].map((constant) => [Number(constant.value), constant.name]))
      );
    }
  }
  return tables;
}

function primitiveType(field: MessageDefinitionField): LoggableType {
  if (field.type === "bool") return field.isArray ? LoggableType.BooleanArray : LoggableType.Boolean;
  if (field.type === "string" || field.type === "wstring")
    return field.isArray ? LoggableType.StringArray : LoggableType.String;
  return field.isArray ? LoggableType.NumberArray : LoggableType.Number;
}

/** Creates (empty) child fields from a definition so the tree is browsable before decoding. */
export function createFieldsFromSchema(log: Log, key: string, schema: RosSchema, definition = schema.root, depth = 0) {
  if (depth > MAX_DEPTH) return;
  const enums = getEnumTables(definition);
  definition.definitions.forEach((field) => {
    if (field.isConstant) return;
    const childKey = key + "/" + field.name;
    if (field.isComplex) {
      if (field.isArray) return; // Items are created on decode
      const child = schema.byName.get(normalizeRosType(field.type));
      if (child) createFieldsFromSchema(log, childKey, schema, child, depth + 1);
      return;
    }
    if (enums.has(field.name)) {
      log.createBlankField(childKey, LoggableType.String);
      log.createBlankField(childKey + ENUM_RAW_SUFFIX, LoggableType.Number);
      return;
    }
    if (field.isArray && field.arrayLength !== undefined && field.arrayLength <= MAX_PRIMITIVE_ARRAY) {
      log.createBlankField(childKey, primitiveType(field));
    } else if (!field.isArray) {
      log.createBlankField(childKey, primitiveType(field));
    }
  });
}

function toNumber(value: unknown): number {
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value ? 1 : 0;
  return NaN;
}

/** Writes a decoded ROS message using its definition (enum labels, array caps). */
export function writeRosMessage(
  log: Log,
  key: string,
  timestamp: number,
  value: any,
  schema: RosSchema,
  definition = schema.root,
  depth = 0
) {
  if (depth > MAX_DEPTH || value === null || typeof value !== "object") return;
  const enums = getEnumTables(definition);
  definition.definitions.forEach((field) => {
    if (field.isConstant) return;
    const childKey = key + "/" + field.name;
    const fieldValue = value[field.name];
    if (fieldValue === undefined) return;
    if (field.isComplex) {
      const child = schema.byName.get(normalizeRosType(field.type));
      if (!child) return;
      if (field.isArray) {
        const items = fieldValue as any[];
        log.putNumber(childKey + "/length", timestamp, items.length);
        for (let i = 0; i < Math.min(items.length, MAX_COMPLEX_ARRAY); i++) {
          writeRosMessage(log, childKey + "/" + i.toString(), timestamp, items[i], schema, child, depth + 1);
        }
      } else {
        writeRosMessage(log, childKey, timestamp, fieldValue, schema, child, depth + 1);
      }
      return;
    }
    const enumTable = enums.get(field.name);
    if (enumTable !== undefined) {
      const raw = toNumber(fieldValue);
      log.putString(childKey, timestamp, enumTable.get(raw) ?? raw.toString());
      log.putNumber(childKey + ENUM_RAW_SUFFIX, timestamp, raw);
      return;
    }
    writePrimitive(log, childKey, timestamp, fieldValue, field.isArray === true);
  });
}

function writePrimitive(log: Log, key: string, timestamp: number, value: unknown, isArray: boolean) {
  if (isArray) {
    const length = (value as ArrayLike<unknown>).length;
    if (length > MAX_PRIMITIVE_ARRAY) {
      log.putNumber(key + "/length", timestamp, length);
      return;
    }
    const items = Array.from(value as ArrayLike<unknown>);
    if (items.length > 0 && typeof items[0] === "string") {
      log.putStringArray(key, timestamp, items as string[]);
    } else if (items.length > 0 && typeof items[0] === "boolean") {
      log.putBooleanArray(key, timestamp, items as boolean[]);
    } else {
      log.putNumberArray(key, timestamp, items.map(toNumber));
    }
    return;
  }
  if (typeof value === "string") log.putString(key, timestamp, value);
  else if (typeof value === "boolean") log.putBoolean(key, timestamp, value);
  else log.putNumber(key, timestamp, toNumber(value));
}

/** Writes schemaless data (JSON, protobuf) with the same caps. */
export function writeUnknown(log: Log, key: string, timestamp: number, value: unknown, depth = 0) {
  if (depth > MAX_DEPTH || value === null || value === undefined) return;
  if (
    typeof value === "number" ||
    typeof value === "bigint" ||
    typeof value === "boolean" ||
    typeof value === "string"
  ) {
    if (depth === 0) return;
    writePrimitive(log, key, timestamp, value, false);
    return;
  }
  if (ArrayBuffer.isView(value) || Array.isArray(value)) {
    const items = value as ArrayLike<unknown>;
    const allPrimitive =
      ArrayBuffer.isView(value) || Array.from(items).every((item) => typeof item !== "object" || item === null);
    if (allPrimitive) {
      writePrimitive(log, key, timestamp, value, true);
    } else {
      log.putNumber(key + "/length", timestamp, items.length);
      for (let i = 0; i < Math.min(items.length, MAX_COMPLEX_ARRAY); i++) {
        writeUnknown(log, key + "/" + i.toString(), timestamp, items[i], depth + 1);
      }
    }
    return;
  }
  if (typeof value === "object") {
    Object.entries(value as object).forEach(([childKey, child]) => {
      if (childKey.startsWith("$")) return;
      writeUnknown(log, key + "/" + childKey, timestamp, child, depth + 1);
    });
  }
}

/** Header stamp in seconds, or null if there is no (non-zero) header stamp. */
export function getHeaderStamp(message: any): number | null {
  const stamp = message?.header?.stamp;
  if (stamp === undefined || stamp === null) return null;
  const sec = toNumber(stamp.sec);
  const nanosec = toNumber(stamp.nanosec ?? stamp.nsec ?? 0);
  if (!isFinite(sec) || (sec === 0 && nanosec === 0)) return null;
  return sec + nanosec * 1e-9;
}

type Pose = {
  position: { x: number; y: number; z: number };
  orientation: { x: number; y: number; z: number; w: number };
};

/** Finds the pose in geometry messages, or null for other types. */
export function extractPose(type: string, message: any): Pose | null {
  switch (type) {
    case "geometry_msgs/Pose":
      return message;
    case "geometry_msgs/PoseStamped":
    case "geometry_msgs/PoseWithCovariance":
      return message.pose;
    case "geometry_msgs/PoseWithCovarianceStamped":
    case "nav_msgs/Odometry":
      return message.pose?.pose;
    case "geometry_msgs/TransformStamped": {
      const transform = message.transform;
      if (!transform) return null;
      return { position: transform.translation, orientation: transform.rotation };
    }
  }
  return null;
}

/** Writes a pose as the built-in Pose3d structured type (translation/x…, rotation/q/w…). */
export function putPose3d(log: Log, key: string, timestamp: number, pose: Pose) {
  if (log.getField(key) === null) {
    log.createBlankField(key, LoggableType.Empty);
    log.setStructuredType(key, "Pose3d");
    log.createBlankField(key + "/translation", LoggableType.Empty);
    log.setStructuredType(key + "/translation", "Translation3d");
    log.createBlankField(key + "/rotation", LoggableType.Empty);
    log.setStructuredType(key + "/rotation", "Rotation3d");
    log.createBlankField(key + "/rotation/q", LoggableType.Empty);
    log.setStructuredType(key + "/rotation/q", "Quaternion");
  }
  log.updateRangeWithTimestamp(timestamp);
  log.putNumber(key + "/translation/x", timestamp, toNumber(pose.position.x));
  log.putNumber(key + "/translation/y", timestamp, toNumber(pose.position.y));
  log.putNumber(key + "/translation/z", timestamp, toNumber(pose.position.z));
  log.putNumber(key + "/rotation/q/w", timestamp, toNumber(pose.orientation.w));
  log.putNumber(key + "/rotation/q/x", timestamp, toNumber(pose.orientation.x));
  log.putNumber(key + "/rotation/q/y", timestamp, toNumber(pose.orientation.y));
  log.putNumber(key + "/rotation/q/z", timestamp, toNumber(pose.orientation.z));
}

/** Writes nav_msgs/Path poses as Pose3d[] (raw WPILib Pose3d structs, read by grabPose3dArray). */
export function putPose3dArray(log: Log, key: string, timestamp: number, poses: Pose[]) {
  const bytes = new Uint8Array(poses.length * 56);
  const view = new DataView(bytes.buffer);
  poses.forEach((pose, i) => {
    const values = [
      pose.position.x,
      pose.position.y,
      pose.position.z,
      pose.orientation.w,
      pose.orientation.x,
      pose.orientation.y,
      pose.orientation.z
    ];
    values.forEach((value, j) => view.setFloat64(i * 56 + j * 8, toNumber(value), true));
  });
  log.putRaw(key, timestamp, bytes);
  log.setStructuredType(key, "Pose3d[]");
  log.putNumber(key + "/length", timestamp, poses.length);
}
