// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { AnnotatedPose3d } from "../../shared/geometry";
import Log from "../../shared/log/Log";
import { Field3dRendererCommand_AnyObj } from "../../shared/renderers/Field3dRenderer";
import { metadata, rosPose, spatialSnapshot } from "../../shared/spatial/SpatialLog";
import { TFTree } from "../../shared/spatial/TFTree";
import { Transform, compose, identity } from "../../shared/spatial/Transform";

export class SpatialLayers {
  tree = new TFTree(0);
  private log: Log | null = null;
  private time = -Infinity;
  private processed = new Map<string, number>();
  joints: Record<string, number> = {};
  begin(log: Log, time: number) {
    if (log !== this.log || time < this.time) {
      this.tree.clear();
      this.processed.clear();
      this.joints = {};
    }
    this.log = log;
    this.time = time;
    for (const key of log.getFieldKeys()) {
      const type = log.getStructuredType(key);
      if (type === "tf2_msgs/TFMessage") {
        const data = log.getString(key + "/spatial", this.processed.get(key) ?? -Infinity, time);
        if (!data) continue;
        data.timestamps.forEach((stamp, i) => {
          if (stamp > time || stamp <= (this.processed.get(key) ?? -Infinity)) return;
          const msg = JSON.parse(data.values[i]);
          for (const tf of msg.transforms ?? []) {
            this.tree.addTransform(
              tf.header.frame_id,
              tf.child_frame_id,
              stamp,
              rosPose(tf.transform),
              key.endsWith("tf_static")
            );
          }
          this.processed.set(key, stamp);
        });
      } else if (type === "sensor_msgs/JointState") {
        const msg = spatialSnapshot(log, key, time)?.value;
        msg?.name?.forEach((name: string, i: number) => {
          if (Number.isFinite(msg.position[i])) this.joints[name] = msg.position[i];
        });
      }
    }
  }
  resolve(frame: string, fixed: string, time: number): Transform {
    if (!frame) throw new Error("missing frame");
    if (frame === fixed) return identity();
    const result = this.tree.lookup(fixed, frame, time);
    if (result.status !== "ok") throw new Error(result.status + ": " + frame + " → " + fixed);
    return result.transform;
  }
  frameFor(log: Log, key: string, time: number): string {
    return spatialSnapshot(log, key, time)?.value?.header?.frame_id ?? metadata(log, key).frame_id ?? "";
  }
  objects(
    log: Log,
    key: string,
    time: number,
    fixed: string
  ): { objects: Field3dRendererCommand_AnyObj[]; frame: string; stamp: number } {
    const snapshot = spatialSnapshot(log, key, time);
    if (!snapshot) throw new Error("waiting for spatial sample");
    const msg = snapshot.value;
    const type = log.getStructuredType(key);
    const frame =
      msg.header?.frame_id ??
      (["tf2_msgs/TFMessage", "visualization_msgs/MarkerArray"].includes(type ?? "") ? fixed : "");
    const transform = this.resolve(frame, fixed, time);
    const pose = (value: any, tf = transform): AnnotatedPose3d => ({
      pose: compose(tf, rosPose(value)),
      annotation: { is2DSource: false }
    });
    let objects: Field3dRendererCommand_AnyObj[] = [];
    if (type === "nav_msgs/Path")
      objects.push({
        type: "trajectory",
        color: "#eeeeee",
        size: "normal",
        poses: (msg.poses ?? []).map((p: any) => pose(p.pose, this.resolve(p.header?.frame_id || frame, fixed, time)))
      });
    else if (type === "tf2_msgs/TFMessage") {
      objects.push({
        type: "axes",
        poses: this.tree
          .getFrames()
          .map((name) => ({ pose: this.resolve(name, fixed, time), annotation: { is2DSource: false } }))
      });
    } else if (type === "visualization_msgs/MarkerArray") {
      for (const marker of msg.markers ?? []) {
        if (marker.action === 2 || marker.action === 3) continue;
        const tf = this.resolve(marker.header?.frame_id, fixed, time);
        objects.push({ type: "marker", marker: { ...marker, pose: pose(marker.pose, tf).pose }, frameTransform: tf });
      }
    } else if (type === "geometry_msgs/PoseStamped" || type === "nav_msgs/Odometry") {
      const p = type === "nav_msgs/Odometry" ? msg.pose.pose : msg.pose;
      objects.push({ type: "axes", poses: [pose(p)] });
    }
    return { objects, frame, stamp: snapshot.time };
  }
}
