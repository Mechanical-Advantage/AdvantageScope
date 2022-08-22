import TabType from "../../lib/TabType";
import { MetadataState } from "../HubState";
import TabController from "../TabController";

export default class LineGraphController implements TabController {
  constructor(content: HTMLElement) {}
  saveState(): MetadataState {
    return { type: TabType.Metadata };
  }
  restoreState(state: MetadataState): void {}
  periodic(): void {}
  refresh(): void {}
}
