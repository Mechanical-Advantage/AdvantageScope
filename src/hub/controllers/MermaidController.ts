// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { MermaidRendererCommand } from "../../shared/renderers/MermaidRenderer";
import { createUUID } from "../../shared/util";
import SourceList from "../SourceList";
import MermaidController_Config from "./MermaidController_Config";
import TabController from "./TabController";

export default class MermaidController implements TabController {
  UUID = createUUID();

  private sourceList: SourceList;

  constructor(root: HTMLElement) {
    this.sourceList = new SourceList(root.firstElementChild as HTMLElement, MermaidController_Config, []);
  }

  saveState(): unknown {
    return {
      sources: this.sourceList.getState()
    };
  }

  restoreState(state: unknown): void {
    if (typeof state !== "object" || state === null) return;
    if ("sources" in state) {
      this.sourceList.setState(state.sources as any);
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

  getCommand(): MermaidRendererCommand {
    let time = window.selection.getRenderTime();
    if (time === null) time = window.log.getTimestampRange()[1];

    let diagram: string | null = null;
    let sources = this.sourceList.getState(true);
    if (sources.length > 0) {
      let logData = window.log.getString(sources[0].logKey, time, time);
      if (logData && logData.values.length > 0) {
        diagram = logData.values[0];
      }
    }

    return {
      diagram: diagram
    };
  }
}
