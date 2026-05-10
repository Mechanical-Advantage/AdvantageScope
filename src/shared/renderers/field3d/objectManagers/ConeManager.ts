// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import * as THREE from "three";
import { Rotation3d } from "../../../geometry";
import { Field3dRendererCommand_ConeObj } from "../../Field3dRenderer";
import ObjectManager from "../ObjectManager";
import ResizableInstancedMesh from "../ResizableInstancedMesh";

export default class ConeManager extends ObjectManager<Field3dRendererCommand_ConeObj> {
  private instances: ResizableInstancedMesh;

  private coneGroup: THREE.Group;
  private geometry: THREE.ConeGeometry;
  private mainMaterial: THREE.MeshPhongMaterial;
  private baseMaterial: THREE.MeshPhongMaterial;
  private mainContext: CanvasRenderingContext2D = document.createElement("canvas").getContext("2d")!;
  private baseContext: CanvasRenderingContext2D = document.createElement("canvas").getContext("2d")!;
  private mainTexture = new THREE.CanvasTexture(this.mainContext.canvas);
  private baseTexture = new THREE.CanvasTexture(this.baseContext.canvas);

  private lastPosition: "center" | "back" | "front" = "center";
  private lastColor = "";

  private cachedColor = new THREE.Color();
  private poseBuffer: { translation: [number, number, number]; rotation: Rotation3d }[] = [];
  private poseActiveCount = 0;

  constructor(
    root: THREE.Object3D,
    materialSpecular: THREE.Color,
    materialShininess: number,
    mode: "low-power" | "standard" | "cinematic",
    isXR: boolean,
    requestRender: () => void
  ) {
    super(root, materialSpecular, materialShininess, mode, isXR, requestRender);

    this.geometry = new THREE.ConeGeometry(0.06, 0.25, 16, 32);
    this.geometry.rotateZ(-Math.PI / 2);
    this.geometry.rotateX(-Math.PI / 2);

    this.mainContext.canvas.width = 100;
    this.mainContext.canvas.height = 100;
    this.baseContext.canvas.width = 100;
    this.baseContext.canvas.height = 100;

    this.mainMaterial = new THREE.MeshPhongMaterial({
      map: this.mainTexture,
      specular: materialSpecular,
      shininess: materialShininess
    });
    let secondMaterial = new THREE.MeshPhongMaterial({
      specular: materialSpecular,
      shininess: materialShininess
    });
    this.baseMaterial = new THREE.MeshPhongMaterial({
      map: this.baseTexture,
      specular: materialSpecular,
      shininess: materialShininess
    });

    this.instances = new ResizableInstancedMesh(root, [
      {
        geometry: this.geometry,
        material: [this.mainMaterial, secondMaterial, this.baseMaterial]
      }
    ]);

    this.coneGroup = new THREE.Group();
  }

  dispose(): void {
    this.mainTexture.dispose();
    this.baseTexture.dispose();
    this.instances.dispose();
  }

  setObjectData(object: Field3dRendererCommand_ConeObj): void {
    if (object.color !== this.lastColor) {
      this.lastColor = object.color;
      this.mainContext.fillStyle = object.color;
      this.baseContext.fillStyle = object.color;
      this.mainContext.fillRect(0, 0, 100, 100);
      this.baseContext.fillRect(0, 0, 100, 100);
      this.mainContext.fillStyle = "black";
      this.mainContext.fillRect(20, 0, 10, 100);
      this.mainTexture.needsUpdate = true;
      this.baseTexture.needsUpdate = true;
    }

    const offset = this.getOffset(object.position);
    const n = object.poses.length;

    while (this.poseBuffer.length < n) {
      this.poseBuffer.push({ translation: [0, 0, 0], rotation: [1, 0, 0, 0] });
    }
    this.poseActiveCount = n;

    for (let i = 0; i < n; i++) {
      const t = object.poses[i].pose.translation;
      this.poseBuffer[i].translation[0] = t[0] + offset;
      this.poseBuffer[i].translation[1] = t[1];
      this.poseBuffer[i].translation[2] = t[2];
      this.poseBuffer[i].rotation = object.poses[i].pose.rotation;
    }

    this.instances.setPoses(this.poseBuffer as any, this.poseActiveCount);
  }

  private getOffset(position: "center" | "front" | "back"): number {
    switch (position) {
      case "center":
        return 0.0;
      case "front":
        return -0.125;
      case "back":
        return 0.125;
    }
  }
}
