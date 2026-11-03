// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { AnnotatedPose3d } from "../../shared/geometry";
import HistoryCursor from "../../shared/log/HistoryCursor";
import Log from "../../shared/log/Log";
import { Field3dRendererCommand_AnyObj } from "../../shared/renderers/Field3dRenderer";
import { coneStyle } from "../../shared/spatial/ConeStyle";
import { metadata, rosPose, spatialSnapshot } from "../../shared/spatial/SpatialLog";
import { TFTree, normalizeFrameId } from "../../shared/spatial/TFTree";
import { Transform, compose, identity } from "../../shared/spatial/Transform";
import { URDFRobot, computeLinkPoses } from "../../shared/spatial/URDF";
import WorkerManager from "../WorkerManager";

export class SpatialLayers {
  tree = new TFTree();
  robot: URDFRobot | null = null;
  assets: Record<string, string> = {};
  private log: Log | null = null;
  private time = -Infinity;
  private processed = new Map<string, number>();
  private markers = new Map<string, { cursor: HistoryCursor; active: Map<string, { marker: any; stamp: number }> }>();
  private trails = new Map<string, { cursor: HistoryCursor; samples: { stamp: number; value: any }[] }>();
  private clouds = new Map<string, any>();
  private pending = new Set<string>();
  private generation = 0;
  joints: Record<string, number> = {};
  begin(log: Log, time: number) {
    if (log !== this.log || time < this.time) {
      this.markers.clear();
      this.trails.clear();
      this.generation++;
      this.clouds.clear();
      this.pending.clear();
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
    if (normalizeFrameId(frame) === normalizeFrameId(fixed)) return identity();
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
    fixed: string,
    options: Record<string, string> = {}
  ): { objects: Field3dRendererCommand_AnyObj[]; frame: string; stamp: number } {
    if (log.getStructuredType(key) === "sensor_msgs/PointCloud2") return this.cloud(log, key, time, fixed, options);
    const snapshot = spatialSnapshot(log, key, time);
    if (!snapshot) throw new Error("waiting for spatial sample");
    const msg = snapshot.value;
    const type = log.getStructuredType(key);
    const murType = metadata(log, key).type;
    const frame =
      msg.header?.frame_id ??
      (["tf2_msgs/TFMessage", "visualization_msgs/MarkerArray"].includes(type ?? "") ? fixed : "");
    const transform = this.resolve(frame, fixed, time);
    const pose = (value: any, tf = transform): AnnotatedPose3d => ({
      pose: compose(tf, rosPose(value)),
      annotation: { is2DSource: false }
    });
    let objects: Field3dRendererCommand_AnyObj[] = [];
    if (murType === "trajectory") {
      objects.push({ type: "trajectory", color: "#eeeeee", size: "normal", poses: msg.poses.map((p: any) => pose(p)) });
    } else if (murType === "cone_array") {
      for (const cone of msg.cones) {
        const style = coneStyle(cone);
        const large = style?.large ?? false;
        objects.push({
          type: "marker",
          frameTransform: transform,
          marker: {
            type: 3,
            shape: "cone",
            pose: compose(transform, {
              translation: [cone.position.x, cone.position.y, cone.position.z + (large ? 0.25 : 0.16)],
              rotation: [1, 0, 0, 0]
            }),
            scale: { x: large ? 0.4 : 0.25, y: large ? 0.4 : 0.25, z: large ? 0.5 : 0.32 },
            color: style?.color ?? { r: 0.5, g: 0.5, b: 0.5, a: 1 }
          }
        });
      }
    } else if (murType === "pose3") {
      objects.push(...this.vehicle(log, key, time, fixed, pose(msg).pose));
    } else if (type === "nav_msgs/Path")
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
      if (this.robot && this.tree.hasFrame(this.robot.rootLink)) {
        objects.push(...this.vehicle(log, key, time, fixed, this.resolve(this.robot.rootLink, fixed, time)));
      }
    } else if (type === "visualization_msgs/MarkerArray") {
      let cache = this.markers.get(key);
      if (!cache) this.markers.set(key, (cache = { cursor: new HistoryCursor(), active: new Map() }));
      const { cursor, active } = cache;
      const start = cursor.update(log, key + "/spatial", time, () => active.clear());
      const history = log.getString(key + "/spatial", start, time);
      history?.timestamps.forEach((stamp, i) => {
        if (stamp > time || stamp <= start || (i === 0 && stamp === cursor.heldTimestamp)) return;
        for (const marker of JSON.parse(history.values[i]).markers ?? []) {
          const id = (marker.ns ?? "") + ":" + marker.id;
          if (marker.action === 3) active.clear();
          else if (marker.action === 2) active.delete(id);
          else active.set(id, { marker, stamp });
        }
        cursor.stamp = stamp;
      });
      for (const { marker, stamp } of active.values()) {
        const lifetime = Number(marker.lifetime?.sec ?? 0) + Number(marker.lifetime?.nanosec ?? 0) * 1e-9;
        if (lifetime > 0 && time > stamp + lifetime) continue;
        const tf = this.resolve(marker.header?.frame_id, fixed, time);
        const style = coneStyle(marker);
        objects.push({
          type: "marker",
          marker: {
            ...marker,
            ...(style ? { shape: "cone", color: style.color } : {}),
            pose: pose(marker.pose, tf).pose
          },
          frameTransform: tf
        });
      }
    } else if (type === "geometry_msgs/PoseStamped" || type === "nav_msgs/Odometry") {
      const p = type === "nav_msgs/Odometry" ? msg.pose.pose : msg.pose;
      objects.push(...this.vehicle(log, key, time, fixed, pose(p).pose));
    }
    return { objects, frame, stamp: snapshot.time };
  }
  private vehicle(
    log: Log,
    key: string,
    time: number,
    fixed: string,
    root: Transform
  ): Field3dRendererCommand_AnyObj[] {
    const objects: Field3dRendererCommand_AnyObj[] = [];
    if (this.robot)
      objects.push({
        type: "urdf",
        robot: this.robot,
        assets: this.assets,
        links: computeLinkPoses(this.robot, this.joints, root, (link) => {
          const result = this.tree.lookup(fixed, link, time);
          return result.status === "ok" ? result.transform : null;
        }).links
      });
    let trail = this.trails.get(key);
    if (!trail) this.trails.set(key, (trail = { cursor: new HistoryCursor(), samples: [] }));
    const start = trail.cursor.update(log, key + "/spatial", time, () => {
      trail!.samples = [];
    });
    const history = log.getString(key + "/spatial", Math.max(start, log.getTimestampRange()[0], time - 10), time);
    history?.timestamps.forEach((stamp, i) => {
      if (stamp > time || stamp <= start || (i === 0 && stamp === trail!.cursor.heldTimestamp)) return;
      trail!.samples.push({ stamp, value: JSON.parse(history.values[i]) });
      trail!.cursor.stamp = stamp;
    });
    const cutoff = Math.max(log.getTimestampRange()[0], time - 10);
    while (trail.samples.length > 1 && trail.samples[1].stamp <= cutoff) trail.samples.shift();
    const poses: AnnotatedPose3d[] = [];
    trail.samples.forEach(({ stamp, value: msg }) => {
      const p = msg.pose?.pose ?? msg.pose ?? msg;
      try {
        poses.push({
          pose:
            log.getStructuredType(key) === "tf2_msgs/TFMessage" && this.robot
              ? this.resolve(this.robot.rootLink, fixed, stamp)
              : compose(this.resolve(msg.header?.frame_id, fixed, stamp), rosPose(p)),
          annotation: { is2DSource: false }
        });
      } catch {
        /* A trail never invents a missing transform. */
      }
    });
    objects.push({ type: "trajectory", color: "#aaa", size: "normal", poses });
    return objects;
  }
  private cloud(log: Log, key: string, time: number, fixed: string, options: Record<string, string>) {
    const decay = Math.max(1, Math.min(20, Number(options.decay ?? 1)));
    const timestamps = log.getField(key)?.getTimestamps() ?? [];
    let lo = 0,
      hi = timestamps.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (timestamps[mid] <= time) lo = mid + 1;
      else hi = mid;
    }
    if (lo === 0) throw new Error("waiting for cloud");
    const newest = new Set(timestamps.slice(Math.max(0, lo - decay), lo));
    const field = options.field ?? "intensity";
    const decoded = [...this.clouds.keys()]
      .filter((cacheKey) => cacheKey.startsWith(key + ":") && cacheKey.endsWith(":" + field))
      .map((cacheKey) => Number(cacheKey.slice(key.length + 1, -(field.length + 1))))
      .filter((stamp) => stamp >= timestamps[0] && stamp <= time)
      .sort((a, b) => a - b)
      .slice(-decay);
    const indexes = [...new Set([...newest, ...decoded])].sort((a, b) => a - b).map((t) => ({ t }));
    const objects: Field3dRendererCommand_AnyObj[] = [];
    let frame = "",
      stamp = 0;
    // Only resolve the retained decoded scans. Older scans may no longer have TF history.
    for (const { t } of indexes) {
      const cacheKey = key + ":" + t + ":" + (options.field ?? "intensity");
      const result = this.clouds.get(cacheKey);
      if (!result && !newest.has(t)) continue;
      if (!result && !this.pending.has(cacheKey)) {
        this.pending.add(cacheKey);
        const generation = this.generation;
        const meta = metadata(log, key);
        WorkerManager.request("../bundles/pointCloudWorker.js", {
          encoding: meta.encoding,
          definition: meta.definition,
          bytes: log.getRaw(key, t, t)!.values[0],
          field: options.field ?? "intensity"
        })
          .then((result) => {
            if (generation !== this.generation) return;
            this.pending.delete(cacheKey);
            this.clouds.set(cacheKey, result);
            if (this.clouds.size > 60) this.clouds.delete(this.clouds.keys().next().value!);
          })
          .catch(() => {
            if (generation !== this.generation) return;
            this.pending.delete(cacheKey);
            this.clouds.set(cacheKey, { error: "cloud worker failed" });
          });
      }
      if (!result) continue;
      if (result.error) throw new Error(result.error);
      frame = result.frame;
      stamp = t;
      objects.push({
        type: "cloud",
        ...result,
        transform: this.resolve(frame, fixed, t),
        size: Number(options.size ?? 3),
        map: options.map ?? "viridis"
      });
    }
    if (!objects.length) throw new Error("decoding cloud…");
    return { objects: objects.slice(-decay), frame, stamp };
  }
}
