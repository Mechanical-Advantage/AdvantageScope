import { ThreeDimensionRendererCommand_GamePieceObj } from "../ThreeDimensionRenderer";
import ObjectManager from "./ObjectManager";

export default class GamePieceManager extends ObjectManager<ThreeDimensionRendererCommand_GamePieceObj> {
  setObjectData(object: ThreeDimensionRendererCommand_GamePieceObj): void {}
  dispose(): void {}
}
