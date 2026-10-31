// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Log from "../log/Log";
import { fromRosPose } from "./Transform";
export const SPATIAL_TYPES = [
  "geometry_msgs/PoseStamped",
  "nav_msgs/Odometry",
  "nav_msgs/Path",
  "visualization_msgs/MarkerArray",
  "tf2_msgs/TFMessage",
  "sensor_msgs/PointCloud2",
  "sensor_msgs/JointState"
];
/** A lossless spatial snapshot, shared by recordings and live sources; clouds remain binary. */
export function writeSpatialMessage(log: Log, key: string, time: number, type: string, message: any) {
  if (!SPATIAL_TYPES.includes(type) || type === "sensor_msgs/PointCloud2") return;
  const child = key + "/spatial";
  log.putString(
    child,
    time,
    JSON.stringify(message, (_, value) => (typeof value === "bigint" ? Number(value) : value))
  );
  log.setStructuredType(child, "SpatialSnapshot");
}
export function spatialSnapshot(log: Log, key: string, time: number): { time: number; value: any } | null {
  const data = log.getString(key + "/spatial", time, time);
  if (!data || !data.timestamps.length || data.timestamps[0] > time) return null;
  return { time: data.timestamps[0], value: JSON.parse(data.values[0]) };
}
export function metadata(log: Log, key: string): any {
  try {
    return JSON.parse(log.getMetadataString(key) || "{}");
  } catch {
    return {};
  }
}
export function rosPose(value: any) {
  return fromRosPose(value.position ?? value.translation, value.orientation ?? value.rotation);
}
