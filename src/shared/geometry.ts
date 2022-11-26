import * as THREE from "three";

export type Translation2d = [number, number]; // meters (x, y)
export type Rotation2d = number; // radians
export type Pose2d = {
  translation: Translation2d;
  rotation: Rotation2d;
};

export type Translation3d = [number, number, number]; // meters (x, y, z)
export type Rotation3d = [number, number, number, number]; // radians (w, x, y, z)
export type Pose3d = {
  translation: Translation3d;
  rotation: Rotation3d;
};

export function translation2dTo3d(input: Translation2d): Translation3d {
  return [...input, 0];
}

export function rotation2dTo3d(input: Rotation2d): Rotation3d {
  let quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), input);
  return [quaternion.w, quaternion.x, quaternion.y, quaternion.z];
}

export function pose2dTo3d(input: Pose2d): Pose3d {
  return {
    translation: translation2dTo3d(input.translation),
    rotation: rotation2dTo3d(input.rotation)
  };
}
