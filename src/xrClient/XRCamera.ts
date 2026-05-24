// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import * as THREE from "three";

export default class XRCamera extends THREE.Camera {
  type = "Camera";
  matrixWorldInverse = new THREE.Matrix4();
  projectionMatrix = new THREE.Matrix4();

  getWorldDirection(target: THREE.Vector3): THREE.Vector3 {
    return target.set(0, 0, -1).applyQuaternion(this.getWorldQuaternion(new THREE.Quaternion()));
  }

  updateMatrixWorld(_: boolean): void {}

  copy(object: THREE.Camera, recursive?: boolean) {
    super.copy(object, recursive);
    this.matrixWorldInverse.copy(object.matrixWorldInverse);
    this.projectionMatrix.copy(object.projectionMatrix);
    return this;
  }

  clone(): any {
    return new XRCamera().copy(this);
  }
}
