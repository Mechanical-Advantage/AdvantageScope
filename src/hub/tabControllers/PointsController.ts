import TabType from "../../lib/TabType";
import { LineGraphState, TableState, OdometryState, PointsState, MetadataState } from "../HubState";
import TabController from "../TabController";

export default class PointsController implements TabController {
  constructor(content: HTMLElement) {}
  saveState(): PointsState {
    return {
      type: TabType.Points,
      fields: {
        x: null,
        y: null
      },
      options: {
        width: 1280,
        height: 720,
        group: 4,
        pointShape: "plus",
        pointSize: "medium"
      }
    };
  }
  restoreState(state: PointsState): void {}
  refresh(): void {}
  periodic(): void {}
}
