// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import * as THREE from "three";
import { Field3dRendererCommand_GamePieceObj } from "../../Field3dRenderer";
import ObjectManager from "../ObjectManager";
import ResizableInstancedMesh from "../ResizableInstancedMesh";

export default class GamePieceManager extends ObjectManager<Field3dRendererCommand_GamePieceObj> {
  private gamePieces: { [key: string]: THREE.Mesh };
  private instances: ResizableInstancedMesh | null = null;
  private lastVariant = "";

  constructor(
    root: THREE.Object3D,
    materialSpecular: THREE.Color,
    materialShininess: number,
    mode: "low-power" | "standard" | "cinematic",
    isXR: boolean,
    requestRender: () => void,
    gamePieces: { [key: string]: THREE.Mesh }
  ) {
    super(root, materialSpecular, materialShininess, mode, isXR, requestRender);
    this.gamePieces = gamePieces;
  }

  dispose(): void {
    // Don't dispose game piece geometries/materials
    // (owned by main renderer and disposed there)
    this.instances?.dispose(false, false);
  }

  setObjectData(object: Field3dRendererCommand_GamePieceObj): void {
    // Create new instances
    if (object.variant !== this.lastVariant || this.instances === null) {
      this.lastVariant = object.variant;
      this.instances?.dispose(false, false);
      if (object.variant in this.gamePieces) {
        this.instances = new ResizableInstancedMesh(this.root, [this.gamePieces[object.variant]]);
      }
    }

    // Update poses
    this.instances?.setPoses(object.poses.map((x) => x.pose));
  }
}
