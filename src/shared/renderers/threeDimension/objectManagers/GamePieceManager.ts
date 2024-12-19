import * as THREE from "three";
import { ThreeDimensionRendererCommand_GamePieceObj } from "../../ThreeDimensionRenderer";
import ObjectManager from "../ObjectManager";
import ResizableInstancedMesh from "../ResizableInstancedMesh";

export default class GamePieceManager extends ObjectManager<ThreeDimensionRendererCommand_GamePieceObj> {
  private gamePieces: { [key: string]: THREE.Mesh };
  private instances: ResizableInstancedMesh | null = null;
  private lastVariant = "";

  constructor(
    root: THREE.Object3D,
    materialSpecular: THREE.Color,
    materialShininess: number,
    mode: "low-power" | "standard" | "cinematic",
    requestRender: () => void,
    gamePieces: { [key: string]: THREE.Mesh }
  ) {
    super(root, materialSpecular, materialShininess, mode, requestRender);
    this.gamePieces = gamePieces;
  }

  dispose(): void {
    // Don't dispose game piece geometries/materials
    // (owned by main renderer and disposed there)
    this.instances?.dispose(false, false);
  }

  setObjectData(object: ThreeDimensionRendererCommand_GamePieceObj): void {
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
