// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import * as THREE from "three";
import { Pose3d } from "../../geometry";

export default class ResizableInstancedMesh {
  private parent: THREE.Object3D;
  private sources: { geometry: THREE.BufferGeometry; material: THREE.Material | THREE.Material[] }[] = [];
  private castShadow: boolean[];

  private count = 0;
  private meshes: (THREE.InstancedMesh | null)[] = [];

  private static readonly _scratchQ = new THREE.Quaternion();
  private static readonly _unitScale = new THREE.Vector3(1, 1, 1);
  private readonly _scratchPos = new THREE.Vector3();
  private readonly _scratchMat = new THREE.Matrix4();

  constructor(
    parent: THREE.Object3D,
    sources: (THREE.Mesh | { geometry: THREE.BufferGeometry; material: THREE.Material | THREE.Material[] })[],
    castShadow?: boolean[]
  ) {
    this.parent = parent;
    this.castShadow = [];
    sources.forEach((source, index) => {
      this.sources.push({ geometry: source.geometry, material: source.material });
      this.meshes.push(null);
      this.castShadow.push(castShadow !== undefined && index < castShadow.length ? castShadow[index] : true);
    });
  }

  dispose(disposeGeometries = true, disposeMaterials = true): void {
    this.meshes.forEach((mesh) => {
      if (mesh !== null) {
        this.parent.remove(mesh);
        mesh.dispose();
      }
    });

    this.sources.forEach((source) => {
      if (disposeGeometries) {
        source.geometry.dispose();
      }
      if (disposeMaterials) {
        if (Array.isArray(source.material)) {
          source.material.forEach((material) => material.dispose());
        } else {
          source.material.dispose();
        }
      }
    });
  }

  setPoses(poses: Pose3d[], count = poses.length): void {
    // Resize instanced mesh
    if (count > this.count) {
      if (this.count === 0) this.count = 1;
      while (this.count < count) this.count *= 2;

      this.meshes.forEach((mesh, i) => {
        if (mesh !== null) {
          this.parent.remove(mesh);
          mesh.dispose();
        }
        const newMesh = new THREE.InstancedMesh(this.sources[i].geometry, this.sources[i].material, this.count);
        newMesh.castShadow = this.castShadow[i];
        newMesh.frustumCulled = false;
        newMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.parent.add(newMesh);
        this.meshes[i] = newMesh;
      });
    }

    // Update poses
    if (count > 0) {
      const scratchQ = ResizableInstancedMesh._scratchQ;
      const unitScale = ResizableInstancedMesh._unitScale;
      const scratchPos = this._scratchPos;
      const scratchMat = this._scratchMat;
      const meshCount = this.meshes.length;

      for (let i = 0; i < count; i++) {
        const t = poses[i].translation;
        const r = poses[i].rotation; // layout: [w, x, y, z]
        scratchPos.set(t[0], t[1], t[2]);
        scratchQ.set(r[1], r[2], r[3], r[0]); // (x, y, z, w) expected
        scratchMat.compose(scratchPos, scratchQ, unitScale);
        for (let m = 0; m < meshCount; m++) {
          this.meshes[m]!.setMatrixAt(i, scratchMat);
        }
      }
    }

    // Trigger instanced mesh update
    for (let m = 0; m < this.meshes.length; m++) {
      const mesh = this.meshes[m];
      if (mesh !== null) {
        mesh.count = count;
        mesh.instanceMatrix.needsUpdate = true;
      }
    }
  }
}
