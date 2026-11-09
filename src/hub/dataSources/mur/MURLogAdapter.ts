// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// The single place where MUR signal types (spec 01 §3.2, §4.2) are mapped onto AdvantageScope Log fields.
//
// | MUR type     | Log field                                                  | structuredType   |
// | ------------ | ---------------------------------------------------------- | ---------------- |
// | float64      | Number                                                     |                  |
// | int64        | Number (values beyond 2^53 lose precision)                 |                  |
// | bool         | Boolean                                                    |                  |
// | string       | String                                                     |                  |
// | enum         | String holding the label from `enum_values` (else the int) |                  |
// | vector3      | children x/y/z                                             | Translation3d    |
// | quaternion   | children q/w, q/x, q/y, q/z                                | Rotation3d       |
// | pose3        | children translation/{x,y,z}, rotation/q/{w,x,y,z}         | Pose3d           |
// | trajectory   | children length, <i>/<Pose3d>                              | Pose3d[]         |
// | cone_array   | children length, <i>/{x,y,z,class,confidence,id}           | Translation3d[]  |
// | other        | String holding the raw JSON, decoded into children         | JSON             |
//
// Quaternions are (x, y, z, w) on the wire and (w, x, y, z) in AdvantageScope; the children are named, so
// only the grab functions in geometry.ts care about the order.
//
// Cones use Translation3d[] so the 2D Field can show them as points. Class values use sibling child fields.

import Log from "../../../shared/log/Log";
import LoggableType from "../../../shared/log/LoggableType";
import type { ConeArray, Pose3, Quaternion, SignalDescriptor, Trajectory, Vector3 } from "../../../shared/mur/contract";

/** Converts a catalogue path to a Log key. */
export function pathToKey(path: string): string {
  return "/" + path;
}

/** Converts a Log key (or a child key of a structured field) to its catalogue path, if it is one. */
export function keyToPath(key: string, isKnownPath: (path: string) => boolean): string | null {
  let candidate = key.startsWith("/") ? key.slice(1) : key;
  while (candidate.length > 0) {
    if (isKnownPath(candidate)) return candidate;
    const slash = candidate.lastIndexOf("/");
    if (slash === -1) break;
    candidate = candidate.slice(0, slash);
  }
  return null;
}

/** Unit spellings that AdvantageScope's unit table spells differently. */
const UNIT_ALIASES: { [unit: string]: string } = {
  "m/s^2": "m/s/s",
  "m/s2": "m/s/s",
  "rad/s^2": "rad/s/s"
};

const STRUCTURED_TYPES: { [type: string]: string } = {
  vector3: "Translation3d",
  quaternion: "Rotation3d",
  pose3: "Pose3d",
  trajectory: "Pose3d[]",
  cone_array: "Translation3d[]"
};

/** Returns the AdvantageScope structured type used for a MUR type, or null for scalars. */
export function getStructuredType(type: string): string | null {
  if (type in STRUCTURED_TYPES) return STRUCTURED_TYPES[type];
  if (!isScalarType(type)) return "JSON";
  return null;
}

function isScalarType(type: string): boolean {
  return ["float64", "int64", "bool", "string", "enum"].includes(type);
}

function getLoggableType(type: string): LoggableType {
  switch (type) {
    case "float64":
    case "int64":
      return LoggableType.Number;
    case "bool":
      return LoggableType.Boolean;
    case "string":
    case "enum":
      return LoggableType.String;
    default:
      return type in STRUCTURED_TYPES ? LoggableType.Empty : LoggableType.String;
  }
}

/** Builds the metadata JSON shown in the sidebar tooltip; its `unit` drives `Log.getUnit`. */
export function getMetadataString(descriptor: SignalDescriptor): string {
  const metadata: { [key: string]: unknown } = {
    type: descriptor.type,
    description: descriptor.description,
    source: descriptor.source
  };
  if (descriptor.unit !== null && descriptor.unit !== "") {
    metadata.unit = UNIT_ALIASES[descriptor.unit] ?? descriptor.unit;
  }
  if (descriptor.dbc?.signal) metadata.dbcSignal = descriptor.dbc.signal;
  metadata.precision = descriptor.display?.precision;
  metadata.scale = descriptor.display?.scale;
  metadata.min = descriptor.min;
  metadata.max = descriptor.max;
  if (descriptor.display?.label) metadata.label = descriptor.display.label;
  if (descriptor.nominal_rate_hz !== null) metadata.nominal_rate_hz = descriptor.nominal_rate_hz;
  metadata.stale_after_ms = descriptor.stale_after_ms;
  if (descriptor.enum_values !== undefined) {
    metadata.enumLabels = descriptor.enum_values;
    metadata.enum_values = Object.entries(descriptor.enum_values)
      .map(([value, label]) => value + "=" + label)
      .join(", ");
  }
  if (descriptor.tags.length > 0) metadata.tags = descriptor.tags.join(", ");
  metadata.schema_version = descriptor.schema_version;
  return JSON.stringify(metadata);
}

/** Returns a stable identity for the parts of a descriptor that affect the Log field layout. */
export function getLayoutSignature(descriptor: SignalDescriptor): string {
  return descriptor.type + "@" + descriptor.schema_version.toString();
}

/** Creates the (empty) field for a descriptor so it appears in the sidebar before any data arrives. */
export function createField(log: Log, descriptor: SignalDescriptor) {
  const key = pathToKey(descriptor.path);
  log.createBlankField(key, getLoggableType(descriptor.type));
  const structuredType = getStructuredType(descriptor.type);
  if (structuredType !== null) {
    log.setStructuredType(key, structuredType);
    log.setGeneratedParent(key);
  }
  log.setMetadataString(key, getMetadataString(descriptor));
}

/** Deletes a field and all of its generated children. */
export function deleteField(log: Log, path: string) {
  const key = pathToKey(path);
  log.getFieldKeys().forEach((fieldKey) => {
    if (fieldKey === key || fieldKey.startsWith(key + "/")) log.deleteField(fieldKey);
  });
}

/** Writes one sample value. Returns false if the value doesn't match the descriptor type. */
export function writeValue(log: Log, descriptor: SignalDescriptor, timestamp: number, value: unknown): boolean {
  const key = pathToKey(descriptor.path);
  switch (descriptor.type) {
    case "float64":
      if (typeof value !== "number") return false;
      log.putNumber(key, timestamp, value);
      return true;
    case "int64": {
      const parsed = parseInt64Number(value);
      if (parsed === null) return false;
      log.putNumber(key, timestamp, parsed);
      return true;
    }
    case "bool":
      if (typeof value !== "boolean") return false;
      log.putBoolean(key, timestamp, value);
      return true;
    case "string":
      if (typeof value !== "string") return false;
      log.putString(key, timestamp, value);
      return true;
    case "enum": {
      if (typeof value !== "number" && typeof value !== "string") return false;
      const label = descriptor.enum_values?.[String(value)];
      log.putString(key, timestamp, label ?? `Unknown (${value})`);
      return true;
    }
    case "vector3":
      if (!isVector3(value)) return false;
      ensureStructField(log, key, "Translation3d");
      writeVector3(log, key, timestamp, value);
      return true;
    case "quaternion":
      if (!isQuaternion(value)) return false;
      ensureStructField(log, key, "Rotation3d");
      writeRotation3d(log, key, timestamp, value);
      return true;
    case "pose3":
      if (!isPose3(value)) return false;
      ensureStructField(log, key, "Pose3d");
      writePose3d(log, key, timestamp, value);
      return true;
    case "trajectory": {
      const poses = (value as Trajectory | null)?.poses;
      if (!Array.isArray(poses) || !poses.every(isPose3)) return false;
      ensureStructField(log, key, "Pose3d[]");
      log.putNumber(key + "/length", timestamp, poses.length);
      poses.forEach((pose, index) => {
        const itemKey = key + "/" + index.toString();
        ensureStructField(log, itemKey, "Pose3d", false);
        writePose3d(log, itemKey, timestamp, pose);
      });
      return true;
    }
    case "cone_array": {
      const cones = (value as ConeArray | null)?.cones;
      if (!Array.isArray(cones) || !cones.every((cone) => isVector3(cone?.position))) return false;
      ensureStructField(log, key, "Translation3d[]");
      log.putNumber(key + "/length", timestamp, cones.length);
      cones.forEach((cone, index) => {
        const itemKey = key + "/" + index.toString();
        ensureStructField(log, itemKey, "Translation3d", false);
        writeVector3(log, itemKey, timestamp, cone.position);
        log.putString(itemKey + "/class", timestamp, String(cone.class));
        if (typeof cone.confidence === "number") log.putNumber(itemKey + "/confidence", timestamp, cone.confidence);
        if (typeof cone.id === "string") log.putString(itemKey + "/id", timestamp, cone.id);
      });
      return true;
    }
    default:
      // Unknown type (spec 01 §3.2): keep the raw JSON so it can be inspected
      log.putJSON(key, timestamp, JSON.stringify(value));
      return true;
  }
}

function parseInt64Number(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && /^-?\d+$/.test(value)) return Number(BigInt(value));
  return null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isVector3(value: unknown): value is Vector3 {
  const v = value as Vector3 | null;
  return typeof v === "object" && v !== null && isFiniteNumber(v.x) && isFiniteNumber(v.y) && isFiniteNumber(v.z);
}

function isQuaternion(value: unknown): value is Quaternion {
  return isVector3(value) && isFiniteNumber((value as Quaternion).w);
}

function isPose3(value: unknown): value is Pose3 {
  const v = value as Pose3 | null;
  return typeof v === "object" && v !== null && isVector3(v.position) && isQuaternion(v.orientation);
}

function ensureStructField(log: Log, key: string, structuredType: string, generatedParent = true) {
  if (log.getField(key) === null) log.createBlankField(key, LoggableType.Empty);
  if (log.getStructuredType(key) !== structuredType) log.setStructuredType(key, structuredType);
  if (generatedParent && !log.isGeneratedParent(key)) log.setGeneratedParent(key);
}

function writeVector3(log: Log, key: string, timestamp: number, value: Vector3) {
  log.putNumber(key + "/x", timestamp, value.x);
  log.putNumber(key + "/y", timestamp, value.y);
  log.putNumber(key + "/z", timestamp, value.z);
}

/** Writes Rotation3d children. Wire order is xyzw; the Log stores named components (read back as wxyz). */
function writeRotation3d(log: Log, key: string, timestamp: number, value: Quaternion) {
  const quaternionKey = key + "/q";
  if (log.getField(quaternionKey) === null) {
    log.createBlankField(quaternionKey, LoggableType.Empty);
    log.setStructuredType(quaternionKey, "Quaternion");
  }
  log.putNumber(quaternionKey + "/w", timestamp, value.w);
  log.putNumber(quaternionKey + "/x", timestamp, value.x);
  log.putNumber(quaternionKey + "/y", timestamp, value.y);
  log.putNumber(quaternionKey + "/z", timestamp, value.z);
}

function writePose3d(log: Log, key: string, timestamp: number, value: Pose3) {
  const translationKey = key + "/translation";
  const rotationKey = key + "/rotation";
  if (log.getField(translationKey) === null) {
    log.createBlankField(translationKey, LoggableType.Empty);
    log.setStructuredType(translationKey, "Translation3d");
  }
  if (log.getField(rotationKey) === null) {
    log.createBlankField(rotationKey, LoggableType.Empty);
    log.setStructuredType(rotationKey, "Rotation3d");
  }
  writeVector3(log, translationKey, timestamp, value.position);
  writeRotation3d(log, rotationKey, timestamp, value.orientation);
}
