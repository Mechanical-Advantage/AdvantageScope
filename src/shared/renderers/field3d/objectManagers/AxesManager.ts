// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import * as THREE from "three";
import { Field3dRendererCommand_AxesObj } from "../../Field3dRenderer";
import makeAxesTemplate from "../AxesTemplate";
import ObjectManager from "../ObjectManager";
import optimizeGeometries from "../OptimizeGeometries";
import ResizableInstancedMesh from "../ResizableInstancedMesh";

export default class AxesManager extends ObjectManager<Field3dRendererCommand_AxesObj> {
  private instances: ResizableInstancedMesh | null = null;

  constructor(
    root: THREE.Object3D,
    materialSpecular: THREE.Color,
    materialShininess: number,
    mode: "low-power" | "standard" | "cinematic",
    isXR: boolean,
    requestRender: () => void
  ) {
    super(root, materialSpecular, materialShininess, mode, isXR, requestRender);

    let axes = makeAxesTemplate(this.materialSpecular, this.materialShininess);
    axes.scale.set(0.25, 0.25, 0.25);
    optimizeGeometries(axes, this.mode, this.materialSpecular, this.materialShininess, false).then((result) => {
      let axesMerged = result.normal[0];
      if (axesMerged !== null) {
        this.instances = new ResizableInstancedMesh(root, [axesMerged]);
      }
    });
  }

  dispose(): void {
    this.instances?.dispose();
  }

  setObjectData(object: Field3dRendererCommand_AxesObj): void {
    this.instances?.setPoses(object.poses.map((x) => x.pose));
  }
}
