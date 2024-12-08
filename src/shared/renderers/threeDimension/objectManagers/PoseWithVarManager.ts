import * as THREE from "three";
import { ThreeDimensionRendererCommand_AxesObj, ThreeDimensionRendererCommand_AxesWithVarianceObj } from "../../ThreeDimensionRenderer";
import ObjectManager from "../ObjectManager";
import optimizeGeometries from "../OptimizeGeometries";
import ResizableInstancedMesh from "../ResizableInstancedMesh";
import { makeAxesTemplate, makeCovarianceEllipseTemplate } from "../AxesTemplate";

export default class PoseWithVarManagerManager extends ObjectManager<ThreeDimensionRendererCommand_AxesWithVarianceObj> {
  private instances: ResizableInstancedMesh | null = null;
  private ballUuid: string | undefined = undefined;

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
      let sources: THREE.Mesh[] = []

      let axesMerged = result.normal[0];
      if (axesMerged !== null) {
        sources.push(axesMerged)
      }

      let covBall = makeCovarianceEllipseTemplate(this.materialSpecular, this.materialShininess);
      optimizeGeometries(covBall, this.mode, this.materialSpecular, this.materialShininess, false).then((result) => {
        let axesMerged = result.transparent[0];
        if (axesMerged !== null) {
          sources.push(axesMerged)
          this.ballUuid = axesMerged.geometry.uuid;
        }

        this.instances = new ResizableInstancedMesh(root, sources);
      });

    });

  }

  dispose(): void {
    this.instances?.dispose();
  }

  setObjectData(object: ThreeDimensionRendererCommand_AxesWithVarianceObj): void {
    const variance = object.poses[0].pose.variance;
    this.instances?.setScale(this.ballUuid || "", 
      new THREE.Vector3(
        variance.tx,
        variance.ty,
        variance.tz
      )
    );

    this.instances?.setPoses(object.poses.map((x) => x.pose));
  }
}
