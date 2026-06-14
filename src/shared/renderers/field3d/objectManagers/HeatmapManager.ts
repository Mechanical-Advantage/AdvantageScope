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
    this.isRedAlliance = isRedAlliance;
  }

  setObjectData(object: Field3dRendererCommand_HeatmapObj): void {
    let fieldConfig = this.getFieldConfig();
    if (fieldConfig === null) return;

    // Update heatmap
    let fieldDimensions: [number, number] = [
      Units.convert(fieldConfig.widthInches, "inches", "meters"),
      Units.convert(fieldConfig.heightInches, "inches", "meters")
    ];
    let pixelDimensions: [number, number] = [
      Math.round(this.HEIGHT_PIXELS * (fieldDimensions[0] / fieldDimensions[1])),
      this.HEIGHT_PIXELS
    ];
    let coordinateSystem =
      (window.preferences?.coordinateSystem === "automatic"
        ? fieldConfig.coordinateSystem
        : window.preferences?.coordinateSystem) ?? "center-red";
    let translations = object.poses.map(
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
    let newCanvas = this.heatmap.getCanvas();
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
