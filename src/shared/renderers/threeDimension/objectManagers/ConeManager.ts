import * as THREE from "three";
import { ThreeDimensionRendererCommand_ConeObj } from "../../ThreeDimensionRenderer";
import ObjectManager from "../ObjectManager";
import ResizableInstancedMesh from "../ResizableInstancedMesh";

export default class ConeManager extends ObjectManager<ThreeDimensionRendererCommand_ConeObj> {
  private instances: ResizableInstancedMesh;

  private geometry: THREE.ConeGeometry;
  private mainMaterial: THREE.MeshPhongMaterial;
  private baseMaterial: THREE.MeshPhongMaterial;
  private mainContext: CanvasRenderingContext2D = document.createElement("canvas").getContext("2d")!;
  private baseContext: CanvasRenderingContext2D = document.createElement("canvas").getContext("2d")!;
  private mainTexture = new THREE.CanvasTexture(this.mainContext.canvas);
  private baseTexture = new THREE.CanvasTexture(this.baseContext.canvas);

  private lastPosition: "center" | "back" | "front" = "center";
  private lastColor = "";

  constructor(
    root: THREE.Object3D,
    materialSpecular: THREE.Color,
    materialShininess: number,
    mode: "low-power" | "standard" | "cinematic",
    requestRender: () => void
  ) {
    super(root, materialSpecular, materialShininess, mode, requestRender);

    this.geometry = new THREE.ConeGeometry(0.06, 0.25, 16, 32);
    this.geometry.rotateZ(-Math.PI / 2);
    this.geometry.rotateX(-Math.PI / 2);

    this.mainContext.canvas.width = 100;
    this.mainContext.canvas.height = 100;
    this.baseContext.canvas.width = 100;
    this.baseContext.canvas.height = 100;

    this.mainMaterial = new THREE.MeshPhongMaterial({
      map: this.mainTexture,
      specular: materialSpecular,
      shininess: materialShininess
    });
    let secondMaterial = new THREE.MeshPhongMaterial({
      specular: materialSpecular,
      shininess: materialShininess
    });
    this.baseMaterial = new THREE.MeshPhongMaterial({
      map: this.baseTexture,
      specular: materialSpecular,
      shininess: materialShininess
    });

    this.instances = new ResizableInstancedMesh(root, [
      {
        geometry: this.geometry,
        material: [this.mainMaterial, secondMaterial, this.baseMaterial]
      }
    ]);
  }

  dispose(): void {
    this.mainTexture.dispose();
    this.baseTexture.dispose();
    this.instances.dispose();
  }

  setObjectData(object: ThreeDimensionRendererCommand_ConeObj): void {
    if (object.position !== this.lastPosition) {
      let delta = this.getOffset(object.position) - this.getOffset(this.lastPosition);
      this.geometry.translate(delta, 0, 0);
      this.lastPosition = object.position;
    }

    if (object.color !== this.lastColor) {
      this.mainContext.fillStyle = object.color;
      this.baseContext.fillStyle = object.color;
      this.mainContext.fillRect(0, 0, 100, 100);
      this.baseContext.fillRect(0, 0, 100, 100);
      this.mainContext.fillStyle = "black";
      this.mainContext.fillRect(20, 0, 10, 100);
      this.mainTexture.needsUpdate = true;
      this.baseTexture.needsUpdate = true;
      this.lastColor = object.color;
    }

    this.instances.setPoses(object.poses.map((x) => x.pose));
  }

  private getOffset(position: "center" | "front" | "back"): number {
    switch (position) {
      case "center":
        return 0.0;
      case "front":
        return -0.125;
      case "back":
        return 0.125;
    }
  }
}
