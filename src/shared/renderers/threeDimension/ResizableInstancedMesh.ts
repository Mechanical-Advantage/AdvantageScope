import * as THREE from "three";
import { Pose3d } from "../../geometry";
import { rotation3dToQuaternion } from "../ThreeDimensionRendererImpl";

export default class ResizableInstancedMesh {
  private parent: THREE.Object3D;
  private sources: { geometry: THREE.BufferGeometry; material: THREE.Material | THREE.Material[] }[] = [];
  private castShadow: boolean[];

  private count = 0;
  private dummy = new THREE.Object3D();
  private meshes: (THREE.InstancedMesh | null)[] = [];

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
      if (castShadow !== undefined && index < castShadow.length) {
        this.castShadow.push(castShadow[index]);
      } else {
        this.castShadow.push(true);
      }
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

  setPoses(poses: Pose3d[]): void {
    // Resize instanced mesh
    if (poses.length > this.count) {
      if (this.count === 0) this.count = 1;
      while (this.count < poses.length) {
        this.count *= 2;
      }

      this.meshes.forEach((mesh, i) => {
        if (mesh !== null) {
          this.parent.remove(mesh);
          mesh.dispose();
        }

        this.meshes[i] = new THREE.InstancedMesh(this.sources[i].geometry, this.sources[i].material, this.count);
        this.meshes[i]!.castShadow = this.castShadow[i];
        this.meshes[i]!.frustumCulled = false;
        this.parent.add(this.meshes[i]!);
      });
    }

    // Update all poses
    for (let i = 0; i < this.count; i++) {
      if (i < poses.length) {
        this.dummy.position.set(...poses[i].translation);
        this.dummy.rotation.setFromQuaternion(rotation3dToQuaternion(poses[i].rotation));
      } else {
        this.dummy.position.set(1e6, 1e6, 1e6);
      }
      this.dummy.updateMatrix();
      this.meshes.forEach((mesh) => {
        mesh?.setMatrixAt(i, this.dummy.matrix);
      });
    }

    // Trigger instanced mesh update
    this.meshes.forEach((mesh) => {
      if (mesh !== null) {
        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingBox();
      }
    });
  }
}
