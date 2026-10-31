// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// In-page live connection UI (works the same in Electron and Lite):
import Log from "../shared/log/Log";
import { metadata, spatialSnapshot } from "../shared/spatial/SpatialLog";

/** ROS names for the AdvantageScope structured types MUR adapters produce, so the tree speaks ROS. */
const ROS_NAMES: { [key: string]: string } = {
  Pose3d: "geometry_msgs/Pose",
  "Pose3d[]": "geometry_msgs/Pose[]",
  Pose2d: "geometry_msgs/Pose2D",
  Translation3d: "geometry_msgs/Point",
  "Translation3d[]": "geometry_msgs/Point[]",
  Rotation3d: "geometry_msgs/Quaternion",
  Transform3d: "geometry_msgs/Transform"
};

export function rosTypeName(structuredType: string): string {
  return ROS_NAMES[structuredType] ?? structuredType;
}

/** Rows for the topic inspector: full topic, type, frame_id, rate, message count and QoS where known. */
export function topicInspectorRows(log: Log, key: string): [string, string][] {
  const type = log.getStructuredType(key);
  const stamps = log.getTimestamps([key]);
  const count = stamps.length;
  let rate = "n/a";
  if (count > 1 && stamps[count - 1] > stamps[0])
    rate = ((count - 1) / (stamps[count - 1] - stamps[0])).toFixed(2) + " Hz";
  const meta = metadata(log, key);
  let frame: string = meta.frame_id ?? "";
  if (!frame) {
    const snap = spatialSnapshot(log, key, Infinity);
    frame = snap?.value?.header?.frame_id ?? "";
  }
  const rows: [string, string][] = [["Topic", key]];
  if (type) rows.push(["Type", type + (ROS_NAMES[type] ? " (" + ROS_NAMES[type] + ")" : "")]);
  rows.push(["frame_id", frame || "n/a"], ["Rate", rate], ["Messages", String(count)]);
  rows.push(["QoS", meta.qos ? (typeof meta.qos === "string" ? meta.qos : JSON.stringify(meta.qos)) : "not reported"]);
  return rows;
}

let panel: HTMLElement | null = null;
export function showTopicInspector(log: Log, key: string, anchor: HTMLElement) {
  hideTopicInspector();
  panel = document.createElement("div");
  panel.className = "topic-inspector";
  for (const [k, v] of topicInspectorRows(log, key)) {
    const row = document.createElement("div");
    const name = document.createElement("b");
    name.textContent = k + " ";
    row.append(name, v);
    panel.append(row);
  }
  document.body.append(panel);
  const rect = anchor.getBoundingClientRect();
  panel.style.left = Math.min(rect.left + 24, window.innerWidth - 320) + "px";
  panel.style.top = Math.min(rect.bottom + 2, window.innerHeight - 140) + "px";
}
export function hideTopicInspector() {
  panel?.remove();
  panel = null;
}
