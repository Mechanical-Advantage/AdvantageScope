import { SourceListState } from "../../shared/SourceListConfig";
import { MechanismState, getMechanismState, mergeMechanismStates } from "../../shared/log/LogUtil";
import { MechanismRendererCommand } from "../../shared/renderers/MechanismRenderer";
import { createUUID } from "../../shared/util";
import SourceList from "../SourceList";
import MechanismController_Config from "./MechanismController_Config";
import TabController from "./TabController";

export default class MechanismController implements TabController {
  UUID = createUUID();

  private sourceList: SourceList;

  constructor(root: HTMLElement) {
    this.sourceList = new SourceList(root.firstElementChild as HTMLElement, MechanismController_Config, []);
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

  showTimeline(): boolean {
    return true;
  }

  getCommand(): MechanismRendererCommand {
    let time = window.selection.getRenderTime();
    if (time === null) time = window.log.getTimestampRange()[1];

    let states: MechanismState[] = [];
    this.sourceList.getState(true).forEach((item) => {
      let state = getMechanismState(window.log, item.logKey, time!);
      if (state !== null) states.push(state);
    });
    states.reverse();

    if (states.length === 0) {
      return null;
    } else {
      return mergeMechanismStates(states);
    }
  }
}
