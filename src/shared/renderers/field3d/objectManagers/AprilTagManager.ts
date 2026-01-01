// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import * as THREE from "three";
import { Units } from "../../../units";
import { zfill } from "../../../util";
import { Field3dRendererCommand_AprilTagObj } from "../../Field3dRenderer";
import { rotation3dToQuaternion } from "../../Field3dRendererImpl";
import ObjectManager from "../ObjectManager";

export default class AprilTagManager extends ObjectManager<Field3dRendererCommand_AprilTagObj> {
  private tags: { idStr: string; active: boolean; object: THREE.Mesh }[] = [];

  private textureLoader = new THREE.TextureLoader();
  private geometry: Map<string, THREE.BoxGeometry> = new Map();

  private whiteMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: this.materialSpecular,
    shininess: this.materialShininess
  });
  private idTextures: THREE.Texture[] = [];

  constructor(
    root: THREE.Object3D,
    materialSpecular: THREE.Color,
    materialShininess: number,
    mode: "low-power" | "standard" | "cinematic",
    isXR: boolean,
    requestRender: () => void
  ) {
    super(root, materialSpecular, materialShininess, mode, isXR, requestRender);
  }

  dispose(): void {
    this.tags.forEach((tag) => {
      this.root.remove(tag.object);
    });
    this.geometry.values().forEach((geometry) => geometry.dispose());
    this.whiteMaterial.dispose();
    this.idTextures.forEach((texture) => texture.dispose());
  }

  setObjectData(object: Field3dRendererCommand_AprilTagObj): void {
    this.tags.forEach((entry) => (entry.active = false));

    const geometryKey = object.variant.family + "_" + object.variant.inches.toString();
    if (!this.geometry.has(geometryKey)) {
      const aprilTagThickness = 0.01;
      const aprilTagOffset = -0.005 + 1e-6; // Align to front face with small shift to ensure visibility when overlapping with the field
      let size = Units.convert(object.variant.inches, "inches", "meters");
      if (object.variant.family === "36h11") {
        size *= 10 / 8;
      } else {
        size *= 8 / 6;
      }
      this.geometry.set(
        geometryKey,
        new THREE.BoxGeometry(aprilTagThickness, size, size).translate(aprilTagOffset, 0, 0).rotateX(Math.PI / 2)
      );
    }

    object.poses.forEach((annotatedPose) => {
      let idStr =
        geometryKey +
        "_" +
        (annotatedPose.annotation.aprilTagId === undefined ? "" : annotatedPose.annotation.aprilTagId.toString());

      // Find tag object
      let entry = this.tags.find((x) => !x.active && x.idStr === idStr);
      if (entry === undefined) {
        // Make new object
        entry = {
          idStr: idStr,
          active: true,
          object: new THREE.Mesh(this.geometry.get(geometryKey), [
            this.whiteMaterial, // Front face, temporary until texture is loaded
            this.whiteMaterial,
            this.whiteMaterial,
            this.whiteMaterial,
            this.whiteMaterial,
            this.whiteMaterial
          ])
        };
        entry.object.castShadow = true;
        this.root.add(entry.object);
        const textureName =
          annotatedPose.annotation.aprilTagId === undefined
            ? "smile"
            : zfill(annotatedPose.annotation.aprilTagId.toString(), 3);
        this.textureLoader.load(
          this.isXR
            ? `/apriltag?family=${object.variant.family}&name=${textureName}`
            : `../www/textures/apriltag-${object.variant.family}/${textureName}.png`,
          (texture) => {
            texture.minFilter = THREE.NearestFilter;
            texture.magFilter = THREE.NearestFilter;
            this.idTextures.push(texture);
            this.requestRender();
            if (entry !== undefined && Array.isArray(entry.object.material)) {
              entry.object.material[0] = new THREE.MeshPhongMaterial({
                map: texture,
                specular: this.materialSpecular,
                shininess: this.materialShininess
              });
            }
          }
        );
        this.tags.push(entry);
      } else {
        entry.active = true;
      }

      // Update object pose
      entry.object.rotation.setFromQuaternion(rotation3dToQuaternion(annotatedPose.pose.rotation));
      entry.object.position.set(...annotatedPose.pose.translation);
    });

    this.tags.forEach((entry) => {
      entry.object.visible = entry.active;
    });
  }
}
