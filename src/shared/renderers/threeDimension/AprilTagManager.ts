import { ThreeDimensionRendererCommand_AprilTagObj } from "../ThreeDimensionRenderer";
import ObjectManager from "./ObjectManager";

export default class AprilTagManager extends ObjectManager<ThreeDimensionRendererCommand_AprilTagObj> {
  setObjectData(object: ThreeDimensionRendererCommand_AprilTagObj): void {}
  dispose(): void {}
}
