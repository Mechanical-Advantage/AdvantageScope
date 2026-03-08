// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import * as THREE from "three";
import { Config3dField } from "../../../AdvantageScopeAssets";
import { annotatedPose3dTo2d, convertFromCoordinateSystem } from "../../../geometry";
import { Units } from "../../../units";
import { Field3dRendererCommand_HeatmapObj } from "../../Field3dRenderer";
import { disposeObject } from "../../Field3dRendererImpl";
import Heatmap from "../../Heatmap";
import ObjectManager from "../ObjectManager";

export default class HeatmapManager extends ObjectManager<Field3dRendererCommand_HeatmapObj> {
  private HEIGHT_PIXELS: number;

  private getFieldConfig: () => Config3dField | null;
  private container = document.createElement("div");
  private heatmap = new Heatmap(this.container);
  private canvas: HTMLCanvasElement | null = null;
  private mesh: THREE.Mesh | null = null;
  private isRedAlliance = false;
  private lastPoseCount = -1;
  private lastPoseHash = 0;

  constructor(
    root: THREE.Object3D,
    materialSpecular: THREE.Color,
    materialShininess: number,
    mode: "low-power" | "standard" | "cinematic",
    isXR: boolean,
    requestRender: () => void,
    getFieldConfig: () => Config3dField | null
  ) {
    super(root, materialSpecular, materialShininess, mode, isXR, requestRender);
    this.getFieldConfig = getFieldConfig;
    this.isXR = isXR;
    this.HEIGHT_PIXELS = isXR ? 25 : 800; // Canvas texture updates are very slow in XR
    this.container.hidden = true;
    document.body.appendChild(this.container);
  }

  dispose(): void {
    if (this.mesh !== null) {
      this.root.remove(this.mesh);
      disposeObject(this.mesh);
    }
    document.body.removeChild(this.container);
  }

  setIsRedAlliance(isRedAlliance: boolean) {
    if (isRedAlliance !== this.isRedAlliance) {
      this.isRedAlliance = isRedAlliance;
      this.lastPoseCount = -1;
      this.lastPoseHash = 0;
    }
  }

  private static hashPoses(poses: Field3dRendererCommand_HeatmapObj["poses"]): number {
    let h = poses.length;
    for (let i = 0; i < poses.length; i++) {
      const t = poses[i].pose.translation;
      h = Math.imul(h, 31) ^ ((t[0] * 1000) | 0);
      h = Math.imul(h, 31) ^ ((t[1] * 1000) | 0);
      h = Math.imul(h, 31) ^ ((t[2] * 1000) | 0);
    }
    return h;
  }

  setObjectData(object: Field3dRendererCommand_HeatmapObj): void {
    const fieldConfig = this.getFieldConfig();
    if (fieldConfig === null) return;

    const newCount = object.poses.length;
    const newHash = HeatmapManager.hashPoses(object.poses);
    if (newCount === this.lastPoseCount && newHash === this.lastPoseHash && this.mesh !== null) return;
    this.lastPoseCount = newCount;
    this.lastPoseHash = newHash;

    // Update heatmap
    const fieldDimensions: [number, number] = [
      Units.convert(fieldConfig.widthInches, "inches", "meters"),
      Units.convert(fieldConfig.heightInches, "inches", "meters")
    ];
    const pixelDimensions: [number, number] = [
      Math.round(this.HEIGHT_PIXELS * (fieldDimensions[0] / fieldDimensions[1])),
      this.HEIGHT_PIXELS
    ];
    const coordinateSystem =
      (window.preferences?.coordinateSystem === "automatic"
        ? fieldConfig.coordinateSystem
        : window.preferences?.coordinateSystem) ?? "center-red";
    const translations = object.poses.map(
      (x) =>
        convertFromCoordinateSystem(
          annotatedPose3dTo2d(x),
          coordinateSystem,
          this.isRedAlliance ? "red" : "blue",
          fieldDimensions[0],
          fieldDimensions[1]
        ).pose.translation
    );
    this.heatmap.update(translations, pixelDimensions, fieldDimensions);

    // Update texture
    const newCanvas = this.heatmap.getCanvas();
    if (newCanvas !== this.canvas && newCanvas !== null) {
      this.canvas = newCanvas;

      if (this.mesh !== null) {
        this.root.remove(this.mesh);
        disposeObject(this.mesh);
      }
      this.mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(fieldDimensions[0], fieldDimensions[1]),
        new THREE.MeshPhongMaterial({
          map: new THREE.CanvasTexture(this.canvas),
          transparent: true
        })
      );
      this.mesh.position.set(0, 0, 0.02);
      this.root.add(this.mesh);
    }
    if (this.mesh !== null) {
      (this.mesh.material as THREE.MeshPhongMaterial).map!.needsUpdate = true;
    }
  }
}
