// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { SourceListState } from "../../shared/SourceListConfig";
import { DriverInputsRendererCommand } from "../../shared/renderers/DriverInputsRenderer";
import { createUUID } from "../../shared/util";
import SourceList from "../SourceList";
import { numberPreview, sourceNumberAt } from "./DbcFields";
import DriverInputsController_Config from "./DriverInputsController_Config";
import TabController from "./TabController";

export default class DriverInputsController implements TabController {
  UUID = createUUID();

  private BRAKE_SCALE: HTMLInputElement;

  private sourceList: SourceList;

  constructor(root: HTMLElement) {
    this.sourceList = new SourceList(
      root.firstElementChild as HTMLElement,
      DriverInputsController_Config,
      [],
      undefined,
      numberPreview
    );
    let settings = root.getElementsByClassName("driver-inputs-settings")[0] as HTMLElement;
    this.BRAKE_SCALE = settings.getElementsByClassName("brake-scale")[0] as HTMLInputElement;

    // Enforce ranges
    this.BRAKE_SCALE.addEventListener("change", () => {
      if (!Number.isFinite(Number(this.BRAKE_SCALE.value)) || Number(this.BRAKE_SCALE.value) <= 0)
        this.BRAKE_SCALE.value = "1000";
    });
  }

  dispose() {
    this.sourceList.stop();
  }

  saveState(): unknown {
    return {
      sources: this.sourceList.getState(),
      brakeScale: Number(this.BRAKE_SCALE.value)
    };
  }

  restoreState(state: unknown): void {
    if (typeof state !== "object" || state === null) return;

    if ("sources" in state) {
      this.sourceList.setState(state.sources as SourceListState);
    }
    if (
      "brakeScale" in state &&
      typeof state.brakeScale === "number" &&
      Number.isFinite(state.brakeScale) &&
      state.brakeScale > 0
    ) {
      this.BRAKE_SCALE.value = state.brakeScale.toString();
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

  getCommand(): DriverInputsRendererCommand {
    let time = window.selection.getRenderTime();
    if (time === null) time = window.log.getTimestampRange()[1];

    let sources = this.sourceList.getState();
    return {
      steering: sourceNumberAt(sources, "steering", time, "degrees", this.UUID),
      throttle: sourceNumberAt(sources, "throttle", time, "percent", this.UUID),
      brakeFront: sourceNumberAt(sources, "brakeFront", time, "psi", this.UUID),
      brakeRear: sourceNumberAt(sources, "brakeRear", time, "psi", this.UUID),
      brakeScale: Number(this.BRAKE_SCALE.value)
    };
  }
}
