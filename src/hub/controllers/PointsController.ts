import { SourceListState } from "../../shared/SourceListConfig";
import SourceList from "../SourceList";
import PointsController_Config from "./PointsController_Config";
import TabController from "./TabController";

export default class PointsController implements TabController {
  private sourceList: SourceList;

  constructor(root: HTMLElement) {
    this.sourceList = new SourceList(root.firstElementChild as HTMLElement, PointsController_Config, []);
  }

  saveState(): unknown {
    return this.sourceList.getState();
  }

  restoreState(state: unknown): void {
    this.sourceList.setState(state as SourceListState);
  }

  refresh(): void {
    this.sourceList.refresh();
  }

  newAssets(): void {}

  getActiveFields(): string[] {
    return this.sourceList.getActiveFields();
  }

  getCommand(): unknown {
    return null;
  }
}
