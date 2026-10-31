// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { parse } from "@foxglove/rosmsg";
import { MessageWriter } from "@foxglove/rosmsg2-serialization";
import { FoxgloveServer } from "@foxglove/ws-protocol";
import { WebSocketServer } from "ws";

const defs = {
  "builtin_interfaces/Time": "int32 sec\nuint32 nanosec",
  "std_msgs/Header": "builtin_interfaces/Time stamp\nstring frame_id",
  "geometry_msgs/Point": "float64 x\nfloat64 y\nfloat64 z",
  "geometry_msgs/Vector3": "float64 x\nfloat64 y\nfloat64 z",
  "geometry_msgs/Quaternion": "float64 x\nfloat64 y\nfloat64 z\nfloat64 w",
  "geometry_msgs/Pose": "geometry_msgs/Point position\ngeometry_msgs/Quaternion orientation",
  "geometry_msgs/PoseStamped": "std_msgs/Header header\ngeometry_msgs/Pose pose",
  "geometry_msgs/Transform": "geometry_msgs/Vector3 translation\ngeometry_msgs/Quaternion rotation",
  "geometry_msgs/TransformStamped": "std_msgs/Header header\nstring child_frame_id\ngeometry_msgs/Transform transform",
  "tf2_msgs/TFMessage": "geometry_msgs/TransformStamped[] transforms",
  "nav_msgs/Path": "std_msgs/Header header\ngeometry_msgs/PoseStamped[] poses",
  "std_msgs/ColorRGBA": "float32 r\nfloat32 g\nfloat32 b\nfloat32 a",
  "visualization_msgs/Marker":
    "std_msgs/Header header\nstring ns\nint32 id\nint32 type\nint32 action\ngeometry_msgs/Pose pose\ngeometry_msgs/Vector3 scale\nstd_msgs/ColorRGBA color\nbuiltin_interfaces/Time lifetime\nbool frame_locked\ngeometry_msgs/Point[] points\nstd_msgs/ColorRGBA[] colors\nstring text\nstring mesh_resource\nbool mesh_use_embedded_materials",
  "visualization_msgs/MarkerArray": "visualization_msgs/Marker[] markers",
  "sensor_msgs/PointField": "string name\nuint32 offset\nuint8 datatype\nuint32 count",
  "sensor_msgs/PointCloud2":
    "std_msgs/Header header\nuint32 height\nuint32 width\nsensor_msgs/PointField[] fields\nbool is_bigendian\nuint32 point_step\nuint32 row_step\nuint8[] data\nbool is_dense",
  "rosgraph_msgs/Clock": "builtin_interfaces/Time clock"
};
function schema(type) {
  const seen = new Set([type]);
  function visit(t) {
    for (const line of defs[t].split("\n")) {
      const dep = line.split(" ")[0].replace("[]", "");
      if (defs[dep] && !seen.has(dep)) {
        seen.add(dep);
        visit(dep);
      }
    }
  }
  visit(type);
  return (
    defs[type] +
    [...seen]
      .slice(1)
      .map((t) => "\n" + "=".repeat(80) + "\nMSG: " + t + "\n" + defs[t])
      .join("")
  );
}
const server = new FoxgloveServer({ name: "MUR ROS mock", capabilities: ["time"] });
const ws = new WebSocketServer({
  port: Number(process.env.ROS_MOCK_PORT ?? 8765),
  handleProtocols: (protocols) => server.handleProtocols(protocols)
});
ws.on("connection", (conn) => server.handleConnection(conn, "mock client"));
server.on("error", console.error);
const channels = new Map();
for (const [topic, type] of [
  ["/clock", "rosgraph_msgs/Clock"],
  ["/tf", "tf2_msgs/TFMessage"],
  ["/tf_static", "tf2_msgs/TFMessage"],
  ["/vehicle/pose", "geometry_msgs/PoseStamped"],
  ["/planning/path", "nav_msgs/Path"],
  ["/perception/cones", "visualization_msgs/MarkerArray"],
  ["/lidar/points", "sensor_msgs/PointCloud2"]
]) {
  const definition = schema(type);
  channels.set(topic, {
    id: server.addChannel({ topic, encoding: "cdr", schemaName: type, schemaEncoding: "ros2msg", schema: definition }),
    writer: new MessageWriter(parse(definition, { ros2: true }))
  });
}
const active = new Set();
server.on("subscribe", (id) => active.add(id));
server.on("unsubscribe", (id) => active.delete(id));
let tick = 0;
const timer = setInterval(() => {
  // Optional rewind exercises the same reset path as /clock in a simulator.
  const t = process.env.ROS_MOCK_RESET ? (tick++ % 400) / 20 : tick++ / 20;
  const stamp = { sec: Math.floor(t), nanosec: Math.round((t % 1) * 1e9) };
  const header = { stamp, frame_id: "map" };
  const q = { x: 0, y: 0, z: Math.sin(t / 20), w: Math.cos(t / 20) };
  const pose = { position: { x: 8 * Math.sin(t / 10), y: 8 * (1 - Math.cos(t / 10)), z: 0 }, orientation: q };
  const data = new Uint8Array(2400 * 16),
    view = new DataView(data.buffer);
  for (let i = 0; i < 2400; i++) {
    const a = ((i % 240) / 240) * Math.PI * 2,
      r = 3 + Math.floor(i / 240) * 0.45 + 0.15 * Math.sin(5 * a + t);
    [
      r * Math.cos(a),
      r * Math.sin(a),
      -0.55 + 0.08 * Math.floor(i / 240) + 0.1 * Math.sin(3 * a),
      (i * 17) % 256
    ].forEach((v, j) => view.setFloat32(i * 16 + j * 4, v, true));
  }
  const messages = {
    "/clock": { clock: stamp },
    "/tf": {
      transforms: [{ header, child_frame_id: "base_link", transform: { translation: pose.position, rotation: q } }]
    },
    "/tf_static": {
      transforms: [
        {
          header: { ...header, frame_id: "base_link" },
          child_frame_id: "lidar",
          transform: { translation: { x: 0.5, y: 0, z: 0.7 }, rotation: { x: 0, y: 0, z: 0, w: 1 } }
        }
      ]
    },
    "/vehicle/pose": { header, pose },
    "/planning/path": {
      header,
      poses: Array.from({ length: 70 }, (_, i) => ({
        header,
        pose: {
          position: { x: 8 * Math.sin(t / 10 + i / 80), y: 8 * (1 - Math.cos(t / 10 + i / 80)), z: 0 },
          orientation: q
        }
      }))
    },
    "/perception/cones": {
      markers: Array.from({ length: 44 }, (_, i) => ({
        header,
        ns: i < 20 ? "cones_blue" : i < 40 ? "cones_yellow" : i < 42 ? "cones_small_orange" : "cones_big_orange",
        id: i,
        type: 3,
        action: 0,
        pose: {
          position: { x: i < 40 ? (i % 20) - 5 : -4 + (i - 40) * 0.7, y: i < 20 ? 2 : -2, z: i >= 42 ? 0.25 : 0.16 },
          orientation: { x: 0, y: 0, z: 0, w: 1 }
        },
        scale: { x: i >= 42 ? 0.4 : 0.25, y: i >= 42 ? 0.4 : 0.25, z: i >= 42 ? 0.5 : 0.32 },
        color: { r: i < 20 ? 0 : 1, g: i < 20 ? 0.3 : i < 40 ? 0.8 : 0.35, b: i < 20 ? 1 : 0, a: 1 },
        lifetime: { sec: 0, nanosec: 0 },
        frame_locked: false,
        points: [],
        colors: [],
        text: "",
        mesh_resource: "",
        mesh_use_embedded_materials: false
      }))
    },
    "/lidar/points": {
      header: { ...header, frame_id: "lidar" },
      height: 1,
      width: 2400,
      fields: ["x", "y", "z", "intensity"].map((name, i) => ({ name, offset: i * 4, datatype: 7, count: 1 })),
      is_bigendian: false,
      point_step: 16,
      row_step: data.length,
      data,
      is_dense: true
    }
  };
  const ns = BigInt(Math.round(t * 1e9));
  server.broadcastTime(ns);
  for (const [topic, channel] of channels)
    if (active.has(channel.id)) server.sendMessage(channel.id, ns, channel.writer.writeMessage(messages[topic]));
}, 50);
function close() {
  clearInterval(timer);
  for (const client of ws.clients) client.terminate();
  ws.close();
}
process.on("SIGINT", close);
process.on("SIGTERM", close);
console.log("ROS mock listening on", ws.address());
