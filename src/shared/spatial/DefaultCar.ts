// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Primitive FSAE fallback: +X forward, +Y left, dimensions in metres.
export const DEFAULT_CAR_URDF = `<robot name="MUR car">
<material name="chassis"><color rgba="0.08 0.095 0.12 1"/></material>
<material name="tyre"><color rgba="0.035 0.035 0.04 1"/></material>
<material name="metal"><color rgba="0.45 0.48 0.52 1"/></material>
<material name="accent"><color rgba="0.65 0.08 0.06 1"/></material>
<link name="base_link">
<visual><origin xyz="-0.25 0 0.24" rpy="0 0 0"/><geometry><box size="1.15 0.46 0.26"/></geometry><material name="chassis"/></visual>
<visual><origin xyz="0.5 0 0.23" rpy="0 0 0"/><geometry><box size="0.5 0.3 0.2"/></geometry><material name="chassis"/></visual>
<visual><origin xyz="0.91 0 0.18" rpy="0 0 0"/><geometry><box size="0.35 0.19 0.13"/></geometry><material name="chassis"/></visual>
<visual><origin xyz="-0.44 0 0.43" rpy="0 0 0"/><geometry><box size="0.42 0.38 0.18"/></geometry><material name="chassis"/></visual>
<visual><origin xyz="0.06 0 0.34" rpy="0 0 0"/><geometry><box size="0.23 0.34 0.23"/></geometry><material name="accent"/></visual>
<visual><origin xyz="1.08 0 0.10" rpy="0 0 0"/><geometry><box size="0.24 1.28 0.055"/></geometry><material name="chassis"/></visual>
<visual><origin xyz="-0.96 0 0.67" rpy="0 0 0"/><geometry><box size="0.25 1.12 0.055"/></geometry><material name="chassis"/></visual>
<visual><origin xyz="-0.96 -0.53 0.61" rpy="0 0 0"/><geometry><box size="0.27 0.035 0.23"/></geometry><material name="accent"/></visual>
<visual><origin xyz="-0.96 0.53 0.61" rpy="0 0 0"/><geometry><box size="0.27 0.035 0.23"/></geometry><material name="accent"/></visual>
<visual><origin xyz="-0.86 -0.22 0.43" rpy="0 0 0"/><geometry><box size="0.035 0.035 0.46"/></geometry><material name="metal"/></visual>
<visual><origin xyz="-0.86 0.22 0.43" rpy="0 0 0"/><geometry><box size="0.035 0.035 0.46"/></geometry><material name="metal"/></visual>
<visual><origin xyz="-0.35 -0.23 0.60" rpy="0 0 0"/><geometry><cylinder radius="0.022" length="0.54"/></geometry><material name="metal"/></visual>
<visual><origin xyz="-0.04 -0.23 0.79" rpy="0 1.57079632679 0"/><geometry><cylinder radius="0.018" length="0.64"/></geometry><material name="metal"/></visual>
<visual><origin xyz="-0.35 0.23 0.60" rpy="0 0 0"/><geometry><cylinder radius="0.022" length="0.54"/></geometry><material name="metal"/></visual>
<visual><origin xyz="-0.04 0.23 0.79" rpy="0 1.57079632679 0"/><geometry><cylinder radius="0.018" length="0.64"/></geometry><material name="metal"/></visual>
<visual><origin xyz="-0.35 0 0.87" rpy="1.57079632679 0 0"/><geometry><cylinder radius="0.022" length="0.46"/></geometry><material name="metal"/></visual>
<visual><origin xyz="0.27 0 0.79" rpy="1.57079632679 0 0"/><geometry><cylinder radius="0.018" length="0.46"/></geometry><material name="metal"/></visual>
<visual><origin xyz="-0.775 0 0.23" rpy="1.57079632679 0 0"/><geometry><cylinder radius="0.024" length="1.2"/></geometry><material name="metal"/></visual>
<visual><origin xyz="0.775 0 0.23" rpy="1.57079632679 0 0"/><geometry><cylinder radius="0.024" length="1.2"/></geometry><material name="metal"/></visual>
</link>
<link name="wheel_fl"><visual><origin xyz="0 0 0" rpy="1.57079632679 0 0"/><geometry><cylinder radius="0.23" length="0.18"/></geometry><material name="tyre"/></visual>
<visual><origin xyz="0 0 0" rpy="1.57079632679 0 0"/><geometry><cylinder radius="0.115" length="0.185"/></geometry><material name="metal"/></visual>
</link><joint name="wheel_fl_joint" type="continuous"><parent link="base_link"/><child link="wheel_fl"/><origin xyz="0.775 0.6 0.23"/><axis xyz="0 1 0"/></joint>
<link name="wheel_fr"><visual><origin xyz="0 0 0" rpy="1.57079632679 0 0"/><geometry><cylinder radius="0.23" length="0.18"/></geometry><material name="tyre"/></visual>
<visual><origin xyz="0 0 0" rpy="1.57079632679 0 0"/><geometry><cylinder radius="0.115" length="0.185"/></geometry><material name="metal"/></visual>
</link><joint name="wheel_fr_joint" type="continuous"><parent link="base_link"/><child link="wheel_fr"/><origin xyz="0.775 -0.6 0.23"/><axis xyz="0 1 0"/></joint>
<link name="wheel_rl"><visual><origin xyz="0 0 0" rpy="1.57079632679 0 0"/><geometry><cylinder radius="0.23" length="0.18"/></geometry><material name="tyre"/></visual>
<visual><origin xyz="0 0 0" rpy="1.57079632679 0 0"/><geometry><cylinder radius="0.115" length="0.185"/></geometry><material name="metal"/></visual>
</link><joint name="wheel_rl_joint" type="continuous"><parent link="base_link"/><child link="wheel_rl"/><origin xyz="-0.775 0.6 0.23"/><axis xyz="0 1 0"/></joint>
<link name="wheel_rr"><visual><origin xyz="0 0 0" rpy="1.57079632679 0 0"/><geometry><cylinder radius="0.23" length="0.18"/></geometry><material name="tyre"/></visual>
<visual><origin xyz="0 0 0" rpy="1.57079632679 0 0"/><geometry><cylinder radius="0.115" length="0.185"/></geometry><material name="metal"/></visual>
</link><joint name="wheel_rr_joint" type="continuous"><parent link="base_link"/><child link="wheel_rr"/><origin xyz="-0.775 -0.6 0.23"/><axis xyz="0 1 0"/></joint>
<link name="lidar"><visual><origin xyz="0 0 0" rpy="0 0 0"/><geometry><cylinder radius="0.065" length="0.09"/></geometry><material name="accent"/></visual>
</link><joint name="lidar_mount" type="fixed"><parent link="base_link"/><child link="lidar"/><origin xyz="0.5 0 0.7"/></joint>
<link name="imu"/><joint name="imu_mount" type="fixed"><parent link="base_link"/><child link="imu"/><origin xyz="0 0 0.3"/></joint></robot>`;
