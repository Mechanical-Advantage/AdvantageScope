// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import * as THREE from "three";
import { Field3dRendererCommand_AnyObj } from "../Field3dRenderer";

export default abstract class ObjectManager<ObjectType extends Field3dRendererCommand_AnyObj> {
  protected root: THREE.Object3D;
  protected materialSpecular: THREE.Color;
  protected materialShininess: number;
  protected mode: "low-power" | "standard" | "cinematic";
  protected isXR: boolean;
  protected requestRender: () => void;
  protected resolution = new THREE.Vector2();

  constructor(
    root: THREE.Object3D,
    materialSpecular: THREE.Color,
    materialShininess: number,
    mode: "low-power" | "standard" | "cinematic",
    isXR: boolean,
    requestRender: () => void
  ) {
    this.root = root;
    this.materialSpecular = materialSpecular;
    this.materialShininess = materialShininess;
    this.mode = mode;
    this.isXR = isXR;
    this.requestRender = requestRender;
  }

  /** Removes the objects from the scene and disposes of all resources. */
  abstract dispose(): void;

  /** Updates the canvas resolution. */
  setResolution(resolution: THREE.Vector2): void {
    this.resolution = resolution;
  }

  /** Updates the state of the objects based on a command. */
  abstract setObjectData(object: ObjectType): void;
}
