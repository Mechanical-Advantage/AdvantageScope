import {
  ThreeDimensionRendererCommand_GhostObj,
  ThreeDimensionRendererCommand_RobotObj
} from "../ThreeDimensionRenderer";
import ObjectManager from "./ObjectManager";

export default class RobotManager extends ObjectManager<
  ThreeDimensionRendererCommand_RobotObj | ThreeDimensionRendererCommand_GhostObj
> {
  setObjectData(object: ThreeDimensionRendererCommand_RobotObj | ThreeDimensionRendererCommand_GhostObj): void {}
  dispose(): void {}
}
