// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { StateDiagramRendererCommand } from "../../shared/renderers/StateDiagramRenderer";
import { getStateMachineGraph } from "../../shared/log/LogUtil";
import { createUUID } from "../../shared/util";
import SourceList from "../SourceList";
import StateDiagramController_Config from "./StateDiagramController_Config";
import TabController from "./TabController";

export default class StateDiagramController implements TabController {
  UUID = createUUID();

  private sourceList: SourceList;
  private historyInput: HTMLSelectElement;

  constructor(root: HTMLElement) {
    this.sourceList = new SourceList(
      root.getElementsByClassName("mermaid-sources")[0] as HTMLElement,
      StateDiagramController_Config,
      []
    );
    this.historyInput = root.getElementsByClassName("history-length")[0] as HTMLSelectElement;
  }

  saveState(): unknown {
    return {
      sources: this.sourceList.getState(),
      historyLength: Number(this.historyInput.value)
    };
  }

  restoreState(state: unknown): void {
    if (typeof state !== "object" || state === null) return;
    if ("sources" in state) {
      this.sourceList.setState(state.sources as any);
    }
    if ("historyLength" in state) {
      this.historyInput.value = (state.historyLength as number).toString();
    }
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

  getCommand(): StateDiagramRendererCommand {
    let time = window.selection.getRenderTime();
    if (time === null) time = window.log.getTimestampRange()[1];

    let historyLengthToDisplay = Number(this.historyInput.value);
    let colorHex = "blue";
    let sources = this.sourceList.getState(true);
    if (sources.length > 0 && "color" in sources[0].options) {
      colorHex = sources[0].options["color"];
    }
    let diagram = sources.length > 0
      ? getStateMachineGraph(window.log, sources[0].logKey, time)
      : null;
    
    return { diagram, historyLengthToDisplay, colorHex };
  }
}
