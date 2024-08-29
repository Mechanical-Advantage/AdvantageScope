import * as THREE from "three";
import { Config3dField } from "../../../AdvantageScopeAssets";
import { translation3dTo2d } from "../../../geometry";
import { convert } from "../../../units";
import Heatmap from "../../Heatmap";
import { ThreeDimensionRendererCommand_HeatmapObj } from "../../ThreeDimensionRenderer";
import { disposeObject } from "../../ThreeDimensionRendererImpl";
import ObjectManager from "../ObjectManager";

export default class HeatmapManager extends ObjectManager<ThreeDimensionRendererCommand_HeatmapObj> {
  private HEIGHT_PIXELS = 800;

  private getFieldConfig: () => Config3dField | null;
  private container = document.createElement("div");
  private heatmap = new Heatmap(this.container);
  private canvas: HTMLCanvasElement | null = null;
  private mesh: THREE.Mesh | null = null;

  constructor(
    root: THREE.Object3D,
    materialSpecular: THREE.Color,
    materialShininess: number,
    mode: "low-power" | "standard" | "cinematic",
    requestRender: () => void,
    getFieldConfig: () => Config3dField | null
  ) {
    super(root, materialSpecular, materialShininess, mode, requestRender);
    this.getFieldConfig = getFieldConfig;
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

  setObjectData(object: ThreeDimensionRendererCommand_HeatmapObj): void {
    let fieldConfig = this.getFieldConfig();
    if (fieldConfig === null) return;

    // Update heatmap
    let fieldDimensions: [number, number] = [
      convert(fieldConfig.widthInches, "inches", "meters"),
      convert(fieldConfig.heightInches, "inches", "meters")
    ];
    let pixelDimensions: [number, number] = [
      Math.round(this.HEIGHT_PIXELS * (fieldDimensions[0] / fieldDimensions[1])),
      this.HEIGHT_PIXELS
    ];
    let translations = object.poses.map((x) => translation3dTo2d(x.pose.translation));
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
      this.mesh.position.set(fieldDimensions[0] / 2, fieldDimensions[1] / 2, 0.02);
      this.root.add(this.mesh);
    }
    if (this.mesh !== null) {
      (this.mesh.material as THREE.MeshPhongMaterial).map!.needsUpdate = true;
    }
  }
}
