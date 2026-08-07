// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { getAssetName } from "../../shared/AdvantageScopeAssets";
import { BlankJoystickState, JOYSTICK_KEYS, getJoystickState } from "../../shared/log/LogUtil";
import { JoysticksRendererCommand } from "../../shared/renderers/JoysticksRenderer";
import { checkArrayType, createUUID } from "../../shared/util";
import TabController from "./TabController";

export default class JoysticksController implements TabController {
  UUID = createUUID();

  private SELECTS: HTMLSelectElement[];

  constructor(root: HTMLElement) {
    this.SELECTS = Array.from(root.getElementsByTagName("select"));
    this.resetLayoutOptions();
  }

  /** Clears all options for the layout selectors then updates them with the latest options. */
  private resetLayoutOptions() {
    let options: { title: string; value: string }[] = [
      { title: t("hub.joysticks.none"), value: "None" },
      { title: t("hub.joysticks.generic"), value: "Generic Joystick" }
    ];
    if (window.assets !== null) {
      options.push(
        ...window.assets.joysticks.map((joystick) => ({
          title: getAssetName(joystick, window.lang),
          value: joystick.name
        }))
      );
    }
    this.SELECTS.forEach((select) => {
      let value = select.value;
      while (select.firstChild) {
        select.removeChild(select.firstChild);
      }
      options.forEach((item) => {
        let option = document.createElement("option");
        option.innerText = item.title;
        option.value = item.value;
        select.appendChild(option);
      });
      if (options.some((item) => item.value === value)) {
        select.value = value;
      } else {
        select.value = options[0].value;
      }
    });
  }

  saveState(): unknown {
    return this.SELECTS.map((element) => element.value);
  }

  restoreState(state: unknown): void {
    if (!checkArrayType(state, "string")) return;
    (state as string[]).forEach((value, index) => {
      if (index < this.SELECTS.length) {
        let select = this.SELECTS[index];
        select.value = value;
        if (select.value === "") {
          select.selectedIndex = 0;
        }
      }
    });
  }

  refresh(): void {}

  newAssets(): void {
    this.resetLayoutOptions();
  }

  getActiveFields(): string[] {
    let activeFields: string[] = [];
    this.SELECTS.forEach((select, index) => {
      if (select.value !== "None") {
        activeFields = activeFields.concat(JOYSTICK_KEYS.map((key) => key + index.toString()));
      }
    });
    return activeFields;
  }

  showTimeline(): boolean {
    return true;
  }

  getCommand(): JoysticksRendererCommand {
    let command: JoysticksRendererCommand = [];
    let time = window.selection.getRenderTime();
    this.SELECTS.forEach((select, index) => {
      if (select.value !== "None") {
        command.push({
          layout: select.value,
          state: time === null ? BlankJoystickState : getJoystickState(window.log, index, time)
        });
      }
    });
    return command;
  }
}
