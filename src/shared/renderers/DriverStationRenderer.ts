// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import TabType from "../TabType";
import ConsoleRenderer, { ConsoleRendererCommand } from "./ConsoleRenderer";
import LineGraphRenderer, { LineGraphRendererCommand } from "./LineGraphRenderer";
import TabRenderer from "./TabRenderer";

/** The ID of the console view, all other views are graphs. */
export const DRIVER_STATION_CONSOLE_VIEW = "console";

/**
 * How the console follows the time range displayed on the timeline:
 *
 * - off: Show all messages
 * - filter: Only show messages within the range
 * - scroll: Show all messages, scroll to the start of the range and fade the messages outside of it
 */
export const DRIVER_STATION_FOLLOW_MODES = ["off", "filter", "scroll"] as const;
export type DriverStationFollowMode = (typeof DRIVER_STATION_FOLLOW_MODES)[number];

export default class DriverStationRenderer implements TabRenderer {
  private GRAPH_TEMPLATE: HTMLElement;
  private VIEW_GROUP: HTMLElement;
  private ADD_BUTTON: HTMLButtonElement;
  private REMOVE_BUTTON: HTMLButtonElement;
  private FOLLOW_BUTTONS: HTMLButtonElement[];
  private BODY: HTMLElement;
  private CONSOLE_PANE: HTMLElement;
  private ENABLED_BUTTON: HTMLButtonElement;
  private ENABLED_BUTTON_TEXT = "Show Enabled Time";

  private hasController: boolean;
  private graphs: { [id: string]: { pane: HTMLElement; renderer: LineGraphRenderer } } = {};
  private consoleRenderer: ConsoleRenderer;
  private lastViewsStr = "";

  constructor(root: HTMLElement, hasController: boolean) {
    this.hasController = hasController;

    // The graph and console elements are copied from the templates for those tabs
    this.GRAPH_TEMPLATE = document.getElementById("renderer" + TabType.LineGraph.toString()) as HTMLElement;
    let consoleTemplate = document.getElementById("renderer" + TabType.Console.toString()) as HTMLElement;

    let container = document.createElement("div");
    container.classList.add("driver-station-container");
    root.appendChild(container);

    // Toolbar
    let toolbar = document.createElement("div");
    toolbar.classList.add("driver-station-toolbar");
    toolbar.hidden = !hasController;
    container.appendChild(toolbar);
    this.VIEW_GROUP = document.createElement("div");
    this.VIEW_GROUP.classList.add("driver-station-button-group", "driver-station-view-buttons");
    toolbar.appendChild(this.VIEW_GROUP);
    this.ADD_BUTTON = document.createElement("button");
    this.ADD_BUTTON.classList.add("driver-station-icon-button", "driver-station-add-button");
    this.ADD_BUTTON.appendChild(this.createIcon("symbols/add.svg"));
    this.ADD_BUTTON.title = "Add a graph";
    this.REMOVE_BUTTON = document.createElement("button");
    this.REMOVE_BUTTON.classList.add("driver-station-icon-button", "driver-station-remove-button");
    this.REMOVE_BUTTON.appendChild(this.createIcon("symbols/delete.svg"));
    this.REMOVE_BUTTON.title = "Remove this graph";

    let followGroup = document.createElement("div");
    followGroup.classList.add("driver-station-button-group", "driver-station-follow-buttons");
    followGroup.title = "Choose how the console follows the time range displayed on the timeline";
    toolbar.appendChild(followGroup);
    this.FOLLOW_BUTTONS = DRIVER_STATION_FOLLOW_MODES.map((mode, index) => {
      let button = document.createElement("button");
      button.classList.add("driver-station-segment");
      button.classList.toggle("first", index === 0);
      button.classList.toggle("last", index === DRIVER_STATION_FOLLOW_MODES.length - 1);
      // The first button also serves as the title for the group
      button.innerText = (index === 0 ? "Follow Timeline " : "") + mode.charAt(0).toUpperCase() + mode.slice(1);
      followGroup.appendChild(button);
      return button;
    });

    let enabledGroup = document.createElement("div");
    enabledGroup.classList.add("driver-station-button-group", "driver-station-enabled-button");
    toolbar.appendChild(enabledGroup);
    this.ENABLED_BUTTON = document.createElement("button");
    this.ENABLED_BUTTON.classList.add("driver-station-segment", "first", "last");
    this.ENABLED_BUTTON.innerText = this.ENABLED_BUTTON_TEXT;
    this.ENABLED_BUTTON.title = "Zoom the timeline to the next period when the robot was enabled";
    enabledGroup.appendChild(this.ENABLED_BUTTON);

    // Graphs are added when they are first displayed
    this.BODY = document.createElement("div");
    this.BODY.classList.add("driver-station-body");
    container.appendChild(this.BODY);

    // Console
    this.CONSOLE_PANE = document.createElement("div");
    this.CONSOLE_PANE.classList.add("driver-station-pane", "driver-station-console");
    Array.from(consoleTemplate.children).forEach((child) => this.CONSOLE_PANE.appendChild(child.cloneNode(true)));
    this.BODY.appendChild(this.CONSOLE_PANE);
    this.consoleRenderer = new ConsoleRenderer(this.CONSOLE_PANE, hasController);
  }

  saveState(): unknown {
    return { console: this.consoleRenderer.saveState() };
  }

  restoreState(state: unknown): void {
    if (state === null || typeof state !== "object") return;
    if ("console" in state) {
      this.consoleRenderer.restoreState(state.console);
    }
  }

  getAspectRatio(): number | null {
    return null;
  }

  /** Creates an icon for a button, using the same symbols as the rest of the app. */
  private createIcon(source: string): HTMLImageElement {
    let icon = document.createElement("img");
    icon.src = source;
    return icon;
  }

  /** Updates the view buttons and removes the graphs that no longer exist. */
  private updateViews(views: DriverStationRendererCommand_View[]) {
    while (this.VIEW_GROUP.firstChild) {
      this.VIEW_GROUP.removeChild(this.VIEW_GROUP.firstChild);
    }
    views.forEach((view, index) => {
      let button = document.createElement("button");
      button.classList.add("driver-station-segment");
      button.classList.toggle("first", index === 0);
      button.classList.toggle("last", index === views.length - 1);
      button.innerText = view.title;
      button.dataset.view = view.id;
      this.VIEW_GROUP.appendChild(button);
    });
    this.VIEW_GROUP.appendChild(this.ADD_BUTTON);
    this.VIEW_GROUP.appendChild(this.REMOVE_BUTTON);

    Object.keys(this.graphs).forEach((id) => {
      if (!views.some((view) => view.id === id)) {
        this.BODY.removeChild(this.graphs[id].pane);
        delete this.graphs[id];
      }
    });
  }

  render(command: DriverStationRendererCommand): void {
    // Update toolbar
    let viewsStr = JSON.stringify(command.views);
    if (viewsStr !== this.lastViewsStr) {
      this.lastViewsStr = viewsStr;
      this.updateViews(command.views);
    }
    let isConsole = command.view === DRIVER_STATION_CONSOLE_VIEW;
    Array.from(this.VIEW_GROUP.children).forEach((button) => {
      let viewId = (button as HTMLElement).dataset.view;
      button.classList.toggle("active", viewId !== undefined && viewId === command.view);
    });
    this.REMOVE_BUTTON.hidden = !command.views.some((view) => view.id === command.view && view.removable);
    (this.FOLLOW_BUTTONS[0].parentElement as HTMLElement).hidden = !isConsole;
    this.FOLLOW_BUTTONS.forEach((button, index) => {
      button.classList.toggle("active", DRIVER_STATION_FOLLOW_MODES[index] === command.consoleFollowMode);
    });

    this.ENABLED_BUTTON.disabled = command.enabledPeriodCount === 0;
    let enabledCountText =
      command.enabledPeriodIndex === null
        ? command.enabledPeriodCount.toString()
        : (command.enabledPeriodIndex + 1).toString() + "/" + command.enabledPeriodCount.toString();
    let enabledButtonText = this.ENABLED_BUTTON_TEXT + " [" + enabledCountText + "]";
    if (this.ENABLED_BUTTON.innerText !== enabledButtonText) {
      this.ENABLED_BUTTON.innerText = enabledButtonText;
    }

    // Render graph
    if (command.graph !== null && !(command.view in this.graphs)) {
      let pane = document.createElement("div");
      pane.classList.add("driver-station-pane", "driver-station-graph");
      Array.from(this.GRAPH_TEMPLATE.children).forEach((child) => pane.appendChild(child.cloneNode(true)));
      this.BODY.appendChild(pane);
      this.graphs[command.view] = { pane: pane, renderer: new LineGraphRenderer(pane, this.hasController) };
    }
    Object.entries(this.graphs).forEach(([id, graph]) => {
      let isActive = command.graph !== null && id === command.view;
      graph.pane.hidden = !isActive;
      if (isActive) {
        graph.renderer.render(command.graph!);
      }
    });

    // Render console
    this.CONSOLE_PANE.hidden = !isConsole;
    if (isConsole && command.console !== null) {
      this.consoleRenderer.render(command.console);
    }
  }
}

export type DriverStationRendererCommand_View = {
  id: string;
  title: string;
  /** Whether the view was added by the user. */
  removable: boolean;
};

export type DriverStationRendererCommand = {
  views: DriverStationRendererCommand_View[];
  /** ID of the displayed view. */
  view: string;
  /** Command for the displayed graph, null if the console is displayed. */
  graph: LineGraphRendererCommand | null;
  /** Command for the console, null if a graph is displayed. */
  console: ConsoleRendererCommand | null;
  consoleFollowMode: DriverStationFollowMode;
  /** The number of enabled periods that can be displayed. */
  enabledPeriodCount: number;
  /** Index of the enabled period displayed on the timeline, null if none. */
  enabledPeriodIndex: number | null;
};
