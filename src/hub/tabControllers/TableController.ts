import TabType from "../../lib/TabType";
import { LineGraphState, TableState, OdometryState, PointsState, MetadataState } from "../HubState";
import TabController from "../TabController";

export default class TableController implements TabController {
  constructor(content: HTMLElement) {}
  saveState(): TableState {
    return { type: TabType.Table, fields: [] };
  }
  restoreState(state: MetadataState): void {}
  refresh(): void {}
  periodic(): void {}
}
