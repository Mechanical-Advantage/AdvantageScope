import { SourceListState } from "../../shared/SourceListConfig";
import SourceList from "../SourceList";
import StatisticsController_Config from "./StatisticsController_Config";
import TabController from "./TabController";

export default class StatisticsController implements TabController {
  private sourceList: SourceList;

  constructor(root: HTMLElement) {
    this.sourceList = new SourceList(root.firstElementChild as HTMLElement, StatisticsController_Config, []);
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
