import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { ThreeDimensionRendererCommand_ZebraMarkerObj } from "../../ThreeDimensionRenderer";
import ObjectManager from "../ObjectManager";

export default class ZebraManager extends ObjectManager<ThreeDimensionRendererCommand_ZebraMarkerObj> {
  private mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 1).rotateX(Math.PI / 2).translate(0, 0, 0.5),
    new THREE.MeshPhongMaterial({
      specular: this.materialSpecular,
      shininess: this.materialShininess
    })
  );
  private labelDiv = document.createElement("div");
  private label = new CSS2DObject(this.labelDiv);

  constructor(
    root: THREE.Object3D,
    materialSpecular: THREE.Color,
    materialShininess: number,
    mode: "low-power" | "standard" | "cinematic",
    requestRender: () => void
  ) {
    super(root, materialSpecular, materialShininess, mode, requestRender);
    this.mesh.castShadow = true;
    this.root.add(this.mesh, this.label);
  }

  dispose(): void {
    this.root.remove(this.mesh, this.label);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }

  setObjectData(object: ThreeDimensionRendererCommand_ZebraMarkerObj): void {
    let visible = object.poses.length > 0;
    this.mesh.visible = visible;
    this.labelDiv.hidden = !visible;
    if (visible) {
      let annotatedPose = object.poses[0];
      this.mesh.material.color = new THREE.Color(annotatedPose.annotation.zebraAlliance === "red" ? "red" : "blue");
      this.mesh.position.set(...annotatedPose.pose.translation);
      this.labelDiv.innerText =
        annotatedPose.annotation.zebraTeam === undefined ? "???" : annotatedPose.annotation.zebraTeam.toString();
      this.label.position.set(annotatedPose.pose.translation[0], annotatedPose.pose.translation[1], 1.25);
    }
  }
}
