import * as THREE from "three";
import { ThreeDimensionRendererCommand_AnyObj } from "../ThreeDimensionRenderer";

export default abstract class ObjectManager<ObjectType extends ThreeDimensionRendererCommand_AnyObj> {
  protected root: THREE.Object3D;
  protected materialSpecular: THREE.Color;
  protected materialShininess: number;
  protected mode: "low-power" | "standard" | "cinematic";
  protected requestRender: () => void;
  protected resolution = new THREE.Vector2();

  constructor(
    root: THREE.Object3D,
    materialSpecular: THREE.Color,
    materialShininess: number,
    mode: "low-power" | "standard" | "cinematic",
    requestRender: () => void
  ) {
    this.root = root;
    this.materialSpecular = materialSpecular;
    this.materialShininess = materialShininess;
    this.mode = mode;
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
