import * as THREE from "three";
import { ThreeDimensionRendererCommand_AxesObj } from "../../ThreeDimensionRenderer";
import makeAxesTemplate from "../AxesTemplate";
import ObjectManager from "../ObjectManager";
import optimizeGeometries from "../OptimizeGeometries";
import ResizableInstancedMesh from "../ResizableInstancedMesh";

export default class AxesManager extends ObjectManager<ThreeDimensionRendererCommand_AxesObj> {
  private instances: ResizableInstancedMesh | null = null;

  constructor(
    root: THREE.Object3D,
    materialSpecular: THREE.Color,
    materialShininess: number,
    mode: "low-power" | "standard" | "cinematic",
    requestRender: () => void
  ) {
    super(root, materialSpecular, materialShininess, mode, requestRender);

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

  setObjectData(object: ThreeDimensionRendererCommand_AxesObj): void {
    this.instances?.setPoses(object.poses.map((x) => x.pose));
  }
}
