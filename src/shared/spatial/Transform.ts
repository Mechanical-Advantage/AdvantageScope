// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Rigid transforms for the 3D tab (TF, URDF kinematics). Pure and dependency-free so it runs in workers,
// the hub, satellites and node tests. A transform uses AdvantageScope's Pose3d layout: translation (x, y, z)
// in metres and rotation as a (w, x, y, z) quaternion. `compose(a, b)` is a · b: apply b, then a.

import type { Pose3d, Rotation3d, Translation3d } from "../geometry";

export type Transform = Pose3d;

export function identity(): Transform {
  return { translation: [0, 0, 0], rotation: [1, 0, 0, 0] };
}

export function quatMultiply(a: Rotation3d, b: Rotation3d): Rotation3d {
  const [aw, ax, ay, az] = a;
  const [bw, bx, by, bz] = b;
  return [
    aw * bw - ax * bx - ay * by - az * bz,
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw
  ];
}

export function quatConjugate(q: Rotation3d): Rotation3d {
  return [q[0], -q[1], -q[2], -q[3]];
}

export function quatNormalize(q: Rotation3d): Rotation3d {
  const norm = Math.hypot(q[0], q[1], q[2], q[3]);
  if (!isFinite(norm) || norm < 1e-12) return [1, 0, 0, 0];
  return [q[0] / norm, q[1] / norm, q[2] / norm, q[3] / norm];
}

/** Rotates a vector by a unit quaternion. */
export function rotateVector(q: Rotation3d, v: Translation3d): Translation3d {
  const [w, x, y, z] = q;
  // t = 2 * cross(q.xyz, v)
  const tx = 2 * (y * v[2] - z * v[1]);
  const ty = 2 * (z * v[0] - x * v[2]);
  const tz = 2 * (x * v[1] - y * v[0]);
  return [v[0] + w * tx + (y * tz - z * ty), v[1] + w * ty + (z * tx - x * tz), v[2] + w * tz + (x * ty - y * tx)];
}

/** a · b (b expressed in a's frame). */
export function compose(a: Transform, b: Transform): Transform {
  const rotated = rotateVector(a.rotation, b.translation);
  return {
    translation: [a.translation[0] + rotated[0], a.translation[1] + rotated[1], a.translation[2] + rotated[2]],
    rotation: quatNormalize(quatMultiply(a.rotation, b.rotation))
  };
}

export function invert(a: Transform): Transform {
  const inverseRotation = quatConjugate(a.rotation);
  const t = rotateVector(inverseRotation, a.translation);
  return { translation: [-t[0], -t[1], -t[2]], rotation: inverseRotation };
}

export function transformPoint(a: Transform, point: Translation3d): Translation3d {
  const rotated = rotateVector(a.rotation, point);
  return [rotated[0] + a.translation[0], rotated[1] + a.translation[1], rotated[2] + a.translation[2]];
}

/** URDF/ROS roll-pitch-yaw (fixed axes X, then Y, then Z) to a quaternion. */
export function quatFromRPY(roll: number, pitch: number, yaw: number): Rotation3d {
  const cr = Math.cos(roll / 2),
    sr = Math.sin(roll / 2);
  const cp = Math.cos(pitch / 2),
    sp = Math.sin(pitch / 2);
  const cy = Math.cos(yaw / 2),
    sy = Math.sin(yaw / 2);
  return [
    cr * cp * cy + sr * sp * sy,
    sr * cp * cy - cr * sp * sy,
    cr * sp * cy + sr * cp * sy,
    cr * cp * sy - sr * sp * cy
  ];
}

export function quatFromAxisAngle(axis: Translation3d, angle: number): Rotation3d {
  const norm = Math.hypot(axis[0], axis[1], axis[2]);
  if (norm < 1e-12) return [1, 0, 0, 0];
  const s = Math.sin(angle / 2) / norm;
  return [Math.cos(angle / 2), axis[0] * s, axis[1] * s, axis[2] * s];
}

export function quatSlerp(a: Rotation3d, b: Rotation3d, t: number): Rotation3d {
  let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  let end = b;
  if (dot < 0) {
    dot = -dot;
    end = [-b[0], -b[1], -b[2], -b[3]];
  }
  if (dot > 0.9995) {
    return quatNormalize([
      a[0] + (end[0] - a[0]) * t,
      a[1] + (end[1] - a[1]) * t,
      a[2] + (end[2] - a[2]) * t,
      a[3] + (end[3] - a[3]) * t
    ]);
  }
  const theta = Math.acos(dot);
  const sinTheta = Math.sin(theta);
  const wa = Math.sin((1 - t) * theta) / sinTheta;
  const wb = Math.sin(t * theta) / sinTheta;
  return [a[0] * wa + end[0] * wb, a[1] * wa + end[1] * wb, a[2] * wa + end[2] * wb, a[3] * wa + end[3] * wb];
}

export function interpolate(a: Transform, b: Transform, t: number): Transform {
  return {
    translation: [
      a.translation[0] + (b.translation[0] - a.translation[0]) * t,
      a.translation[1] + (b.translation[1] - a.translation[1]) * t,
      a.translation[2] + (b.translation[2] - a.translation[2]) * t
    ],
    rotation: quatSlerp(a.rotation, b.rotation, t)
  };
}

/** Builds a transform from ROS-style {x,y,z} / {x,y,z,w} objects (geometry_msgs, MUR pose3). */
export function fromRosPose(
  position: { x: number; y: number; z: number },
  orientation: { x: number; y: number; z: number; w: number }
): Transform {
  return {
    translation: [Number(position.x), Number(position.y), Number(position.z)],
    rotation: quatNormalize([
      Number(orientation.w),
      Number(orientation.x),
      Number(orientation.y),
      Number(orientation.z)
    ])
  };
}

export function isFiniteTransform(a: Transform): boolean {
  return a.translation.every((x) => isFinite(x)) && a.rotation.every((x) => isFinite(x));
}
