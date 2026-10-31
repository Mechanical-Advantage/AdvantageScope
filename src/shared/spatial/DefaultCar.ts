// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// refs/mura contains only xacro. This deliberately simple fallback needs no ROS build tools.
export const DEFAULT_CAR_URDF = `<robot name="MUR car">
<material name="chassis"><color rgba="0.75 0.12 0.12 1"/></material>
<material name="tyre"><color rgba="0.12 0.12 0.12 1"/></material>
<link name="base_link"><visual><origin xyz="0 0 0.35"/><geometry><box size="2.4 0.8 0.35"/></geometry><material name="chassis"/></visual></link>
${["fl", "fr", "rl", "rr"]
  .map(
    (name, i) =>
      `<link name="wheel_${name}"><visual><origin rpy="1.57079632679 0 0"/><geometry><cylinder radius="0.23" length="0.18"/></geometry><material name="tyre"/></visual></link><joint name="wheel_${name}_joint" type="continuous"><parent link="base_link"/><child link="wheel_${name}"/><origin xyz="${
        i < 2 ? 0.8 : -0.8
      } ${i % 2 === 0 ? 0.65 : -0.65} 0.23"/><axis xyz="0 1 0"/></joint>`
  )
  .join("")}
<link name="lidar"><visual><geometry><cylinder radius="0.09" length="0.12"/></geometry></visual></link><joint name="lidar_mount" type="fixed"><parent link="base_link"/><child link="lidar"/><origin xyz="0.5 0 0.65"/></joint>
<link name="imu"/><joint name="imu_mount" type="fixed"><parent link="base_link"/><child link="imu"/><origin xyz="0 0 0.3"/></joint></robot>`;
