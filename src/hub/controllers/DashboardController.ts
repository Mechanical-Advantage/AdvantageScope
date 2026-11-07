// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import TabType, { getDefaultTabTitle, getTabIcon } from "../../shared/TabType";
import { DashboardRendererCommand } from "../../shared/renderers/DashboardRenderer";
import { createUUID } from "../../shared/util";
import TabController from "./TabController";

export type DashboardControllerFactory = (
  type: TabType,
  controlsElement: HTMLElement,
  rendererElement: HTMLElement
) => TabController;

/** Available pane arrangements. Pane count is the number of positions. */
const LAYOUTS = {
  rows: { label: "Top / Bottom", positions: ["top", "bottom"] },
  columns: { label: "Side by Side", positions: ["left", "right"] },
  grid: { label: "2 × 2", positions: ["top left", "top right", "bottom left", "bottom right"] }
};
type DashboardLayout = keyof typeof LAYOUTS;

type DashboardControllerState = {
  layout?: DashboardLayout;
  focused: number;
  panes: { type: TabType; controller: unknown }[];
};

type DashboardPane = {
  type: TabType;
  controller: TabController;
  controlsElement: HTMLElement;
};

/** Displays multiple tab types in a single tab, each in its own pane. */
export default class DashboardController implements TabController {
  UUID = createUUID();

  /** Tab types which can be shown in a pane. Tabs whose controller
   * operates on the renderer element (e.g. table) are not supported. */
  static PANE_TYPES = [
    TabType.LineGraph,
    TabType.Field2d,
    TabType.Field3d,
    TabType.Statistics,
    TabType.Video,
    TabType.Joysticks,
    TabType.Swerve,
    TabType.Mechanism,
    TabType.Points
  ];
  private static DEFAULT_PANE_TYPES = [TabType.Video, TabType.Field2d, TabType.LineGraph, TabType.Field3d];

  private CONTROLS_ROOT: HTMLElement;
  private CONTROLS_BODY: HTMLElement;
  private LAYOUT_SELECT: HTMLSelectElement;
  private SWITCHER_BUTTONS: HTMLButtonElement[] = [];
  private RENDERER_ROOT: HTMLElement;
  private PANE_ELEMENTS: HTMLElement[];
  private PANE_SELECTS: HTMLSelectElement[];

  private createController: DashboardControllerFactory;
  private layout: DashboardLayout = "rows";
  private panes: DashboardPane[] = [];
  private focused = 0;

  constructor(controlsRoot: HTMLElement, rendererRoot: HTMLElement, createController: DashboardControllerFactory) {
    this.CONTROLS_ROOT = controlsRoot;
    this.CONTROLS_BODY = controlsRoot.getElementsByClassName("dashboard-controls-body")[0] as HTMLElement;
    this.RENDERER_ROOT = rendererRoot;
    this.PANE_ELEMENTS = Array.from(rendererRoot.getElementsByClassName("dashboard-pane")) as HTMLElement[];
    this.PANE_SELECTS = this.PANE_ELEMENTS.map((pane) => pane.getElementsByTagName("select")[0] as HTMLSelectElement);
    this.createController = createController;

    // Layout selection
    let switcher = controlsRoot.getElementsByClassName("dashboard-controls-switcher")[0] as HTMLElement;
    let layoutLabel = document.createElement("span");
    layoutLabel.innerText = "Layout:";
    switcher.appendChild(layoutLabel);
    this.LAYOUT_SELECT = document.createElement("select");
    Object.entries(LAYOUTS).forEach(([layout, config]) => {
      let option = document.createElement("option");
      option.value = layout;
      option.innerText = config.label;
      this.LAYOUT_SELECT.appendChild(option);
    });
    this.LAYOUT_SELECT.addEventListener("change", () => this.setLayout(this.LAYOUT_SELECT.value as DashboardLayout));
    switcher.appendChild(this.LAYOUT_SELECT);

    // Controls switcher, shows which pane the controls belong to
    let switcherLabel = document.createElement("span");
    switcherLabel.innerText = "Controls for:";
    switcher.appendChild(switcherLabel);
    this.PANE_ELEMENTS.forEach((_, index) => {
      let button = document.createElement("button");
      button.addEventListener("click", () => this.setFocused(index));
      switcher.appendChild(button);
      this.SWITCHER_BUTTONS.push(button);
    });

    this.PANE_ELEMENTS.forEach((paneElement, index) => {
      // Type selection
      let select = this.PANE_SELECTS[index];
      DashboardController.PANE_TYPES.forEach((type) => {
        let option = document.createElement("option");
        option.value = type.toString();
        option.innerText = getTabIcon(type) + " " + getDefaultTabTitle(type);
        select.appendChild(option);
      });
      select.addEventListener("change", () => {
        this.setPaneType(index, Number(select.value) as TabType);
        this.setFocused(index);
      });

      // Focus on click
      paneElement.addEventListener("mousedown", () => this.setFocused(index), true);
    });
    this.setLayout("rows");

    // Hide child controls when this tab is hidden (some controllers check
    // their own root visibility, e.g. for keyboard shortcuts)
    new MutationObserver(() => this.updateControlsVisibility()).observe(this.CONTROLS_ROOT, {
      attributes: true,
      attributeFilter: ["hidden"]
    });
  }

  /** Returns the number of panes shown by the current layout. */
  private getPaneCount(): number {
    return LAYOUTS[this.layout].positions.length;
  }

  /** Switches the pane arrangement. Panes hidden by the layout keep their configuration. */
  private setLayout(layout: DashboardLayout) {
    this.layout = layout;
    this.LAYOUT_SELECT.value = layout;
    Object.keys(LAYOUTS).forEach((key) => {
      this.RENDERER_ROOT.classList.toggle("dashboard-layout-" + key, key === layout);
    });

    let count = this.getPaneCount();
    for (let index = 0; index < count; index++) {
      if (this.panes[index] === undefined) {
        this.setPaneType(index, DashboardController.DEFAULT_PANE_TYPES[index]);
      }
    }
    this.PANE_ELEMENTS.forEach((paneElement, index) => {
      paneElement.hidden = index >= count;
    });
    this.updateSwitcher();
    this.setFocused(Math.min(this.focused, count - 1));
  }

  /** Replaces the view shown in a pane. */
  private setPaneType(index: number, type: TabType) {
    let oldPane = this.panes[index];
    if (oldPane !== undefined) {
      if (oldPane.type === type) return;
      this.CONTROLS_BODY.removeChild(oldPane.controlsElement);
    }

    let controlsElement = document.getElementById("controller" + type.toString())?.cloneNode(true) as HTMLElement;
    let rendererElement = document.getElementById("renderer" + type.toString())?.cloneNode(true) as HTMLElement;
    controlsElement.removeAttribute("id");
    rendererElement.removeAttribute("id");
    this.panes[index] = {
      type: type,
      controller: this.createController(type, controlsElement, rendererElement),
      controlsElement: controlsElement
    };
    this.CONTROLS_BODY.appendChild(controlsElement);
    this.PANE_SELECTS[index].value = type.toString();
    this.updateSwitcher();
    this.updateControlsVisibility();
  }

  private setFocused(index: number) {
    this.focused = index;
    this.PANE_ELEMENTS.forEach((paneElement, i) => {
      paneElement.classList.toggle("dashboard-pane-focused", i === index);
    });
    this.SWITCHER_BUTTONS.forEach((button, i) => {
      button.classList.toggle("selected", i === index);
    });
    this.updateControlsVisibility();
  }

  private updateSwitcher() {
    let positions = LAYOUTS[this.layout].positions;
    this.SWITCHER_BUTTONS.forEach((button, index) => {
      let pane = this.panes[index];
      button.hidden = index >= positions.length || pane === undefined;
      if (!button.hidden) {
        button.innerText = getTabIcon(pane.type) + " " + getDefaultTabTitle(pane.type) + " (" + positions[index] + ")";
      }
    });
  }

  private updateControlsVisibility() {
    this.panes.forEach((pane, index) => {
      pane.controlsElement.hidden = this.CONTROLS_ROOT.hidden || index !== this.focused;
    });
  }

  /** Returns the index of the pane which receives controls and menu commands. */
  getFocusedIndex(): number {
    return this.focused;
  }

  /** Returns the type and controller for each pane, including those hidden by the layout. */
  getPanes(): { type: TabType; controller: TabController }[] {
    return this.panes;
  }

  saveState(): DashboardControllerState {
    return {
      layout: this.layout,
      focused: this.focused,
      panes: this.panes.map((pane) => ({ type: pane.type, controller: pane.controller.saveState() }))
    };
  }

  restoreState(state: unknown): void {
    if (typeof state !== "object" || state === null || !("panes" in state)) return;
    let dashboardState = state as DashboardControllerState;
    dashboardState.panes.forEach((paneState, index) => {
      if (index >= this.PANE_ELEMENTS.length || !DashboardController.PANE_TYPES.includes(paneState.type)) return;
      this.setPaneType(index, paneState.type);
      this.panes[index].controller.restoreState(paneState.controller);
    });
    this.focused = dashboardState.focused;
    this.setLayout(
      dashboardState.layout !== undefined && dashboardState.layout in LAYOUTS ? dashboardState.layout : "rows"
    );
  }

  refresh(): void {
    this.panes.forEach((pane) => pane.controller.refresh());
  }

  newAssets(): void {
    this.panes.forEach((pane) => pane.controller.newAssets());
  }

  getActiveFields(): string[] {
    return this.panes.slice(0, this.getPaneCount()).flatMap((pane) => pane.controller.getActiveFields());
  }

  showTimeline(): boolean {
    return true;
  }

  getCommand(): DashboardRendererCommand {
    return {
      panes: this.panes
        .slice(0, this.getPaneCount())
        .map((pane) => ({ type: pane.type, command: pane.controller.getCommand() }))
    };
  }
}
