// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { Field3dRendererCommand_TrajectoryObj } from "../../Field3dRenderer";
import ObjectManager from "../ObjectManager";

export default class TrajectoryManager extends ObjectManager<Field3dRendererCommand_TrajectoryObj> {
  private line: Line2;
  private length = 0;
  private positionBuffer = new Float32Array(0);
  private lastColorStr = "";

  constructor(
    root: THREE.Object3D,
    materialSpecular: THREE.Color,
    materialShininess: number,
    mode: "low-power" | "standard" | "cinematic",
    isXR: boolean,
    requestRender: () => void
  ) {
    super(root, materialSpecular, materialShininess, mode, isXR, requestRender);

    this.line = new Line2(
      new LineGeometry(),
      new LineMaterial({ color: 0xff8c00, linewidth: 2, resolution: this.resolution })
    );
    this.root.add(this.line);
  }

  dispose(): void {
    this.root.remove(this.line);
    this.line.geometry.dispose();
    this.line.material.dispose();
  }

  setResolution(resolution: THREE.Vector2) {
    super.setResolution(resolution);
    this.line.material.resolution = resolution;
  }

  setObjectData(object: Field3dRendererCommand_TrajectoryObj): void {
    if (object.poses.length <= 1) {
      this.line.visible = false;
      return;
    }

    this.line.visible = true;
    if (object.color !== this.lastColorStr) {
      this.lastColorStr = object.color;
      this.line.material.color.set(object.color);
    }
    this.line.material.linewidth = object.size === "bold" ? 6 : 2;

    if (object.poses.length !== this.length) {
      this.line.geometry.dispose();
      this.line.geometry = new LineGeometry();
      this.length = object.poses.length;
    }

    const required = object.poses.length * 3;
    if (this.positionBuffer.length < required) {
      this.positionBuffer = new Float32Array(required * 2);
    }

    const buf = this.positionBuffer;
    const poses = object.poses;
    for (let i = 0, off = 0; i < poses.length; i++, off += 3) {
      const t = poses[i].pose.translation;
      buf[off] = t[0];
      buf[off + 1] = t[1];
      // 2D trajectories should be moved just above the carpet for cleaner rendering
      buf[off + 2] = poses[i].annotation.is2DSource ? 0.02 : t[2];
    }

    this.line.geometry.setPositions(buf.subarray(0, required));
    this.line.geometry.attributes.position.needsUpdate = true;
  }
}
