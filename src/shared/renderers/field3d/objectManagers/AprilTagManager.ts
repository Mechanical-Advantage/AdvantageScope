// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import * as THREE from "three";
import { APRIL_TAG_FRC_16H5_SIZE, APRIL_TAG_FRC_36H11_SIZE, APRIL_TAG_FTC_SIZES } from "../../../geometry";
import { zfill } from "../../../util";
import { Field3dRendererCommand_AprilTagObj, Field3dRendererCommand_AprilTagVariant } from "../../Field3dRenderer";
import { rotation3dToQuaternion } from "../../Field3dRendererImpl";
import ObjectManager from "../ObjectManager";

export default class AprilTagManager extends ObjectManager<Field3dRendererCommand_AprilTagObj> {
  private tags: { idStr: string; active: boolean; object: THREE.Mesh }[] = [];

  private textureLoader = new THREE.TextureLoader();
  private geometry: Map<Field3dRendererCommand_AprilTagVariant, THREE.BoxGeometry> = new Map();

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
    const aprilTagThickness = 0.01;
    const aprilTagOffset = -0.005 + 1e-6; // Align to front face with small shift to ensure visibility when overlapping with the field
    this.geometry.set(
      "frc-36h11",
      new THREE.BoxGeometry(aprilTagThickness, APRIL_TAG_FRC_36H11_SIZE, APRIL_TAG_FRC_36H11_SIZE)
        .translate(aprilTagOffset, 0, 0)
        .rotateX(Math.PI / 2)
    );
    this.geometry.set(
      "frc-16h5",
      new THREE.BoxGeometry(aprilTagThickness, APRIL_TAG_FRC_16H5_SIZE, APRIL_TAG_FRC_16H5_SIZE)
        .translate(aprilTagOffset, 0, 0)
        .rotateX(Math.PI / 2)
    );
    Object.entries(APRIL_TAG_FTC_SIZES).forEach(([variant, size]) => {
      this.geometry.set(
        variant as Field3dRendererCommand_AprilTagVariant,
        new THREE.BoxGeometry(aprilTagThickness, size, size).translate(aprilTagOffset, 0, 0).rotateX(Math.PI / 2)
      );
    });
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

    object.poses.forEach((annotatedPose) => {
      let idStr =
        object.variant +
        (annotatedPose.annotation.aprilTagId === undefined ? "" : annotatedPose.annotation.aprilTagId.toString());

      // Find tag object
      let entry = this.tags.find((x) => !x.active && x.idStr === idStr);
      if (entry === undefined) {
        // Make new object
        entry = {
          idStr: idStr,
          active: true,
          object: new THREE.Mesh(this.geometry.get(object.variant), [
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
            ? `/apriltag?family=${object.variant === "frc-16h5" ? "16h5" : "36h11"}&name=${textureName}`
            : `../www/textures/apriltag-${object.variant === "frc-16h5" ? "16h5" : "36h11"}/${textureName}.png`,
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
