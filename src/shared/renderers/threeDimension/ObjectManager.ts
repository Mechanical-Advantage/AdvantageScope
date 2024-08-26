import * as THREE from "three";
import { ThreeDimensionRendererCommand_AnyObj } from "../ThreeDimensionRenderer";

export default abstract class ObjectManager<ObjectType extends ThreeDimensionRendererCommand_AnyObj> {
  protected root: THREE.Object3D;

  constructor(root: THREE.Object3D) {
    this.root = root;
  }

  /** Updates the state of the objects based on a command. */
  abstract setObjectData(object: ObjectType): void;

  /** Removes the objects from the scene and disposes of all resources. */
  abstract dispose(): void;
}
