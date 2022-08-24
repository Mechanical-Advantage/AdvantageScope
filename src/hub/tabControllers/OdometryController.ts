import TabType from "../../lib/TabType";
import { MetadataState, OdometryState } from "../HubState";
import TabController from "../TabController";

export default class OdometryController implements TabController {
  constructor(content: HTMLElement) {}
  saveState(): OdometryState {
    return {
      type: TabType.Odometry,
      fields: {
        robotPose: null,
        ghostPose: null,
        visionCoordinates: null
      },
      options: {
        game: "2022",
        unitDistance: "meters",
        unitRotation: "radians",
        origin: "right",
        size: 0.5,
        alliance: "red",
        orientation: "red, blue"
      }
    };
  }
  restoreState(state: OdometryState): void {}
  refresh(): void {}
  periodic(): void {}
}
