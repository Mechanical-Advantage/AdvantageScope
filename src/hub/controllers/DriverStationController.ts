// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import LineGraphFilter from "../../shared/LineGraphFilter";
import TabType from "../../shared/TabType";
import {
  getDriverStationNumericValue,
  getDriverStationValueColor,
  getDriverStationValueText
} from "../../shared/log/DriverStationStatus";
import { getEnabledPeriods } from "../../shared/log/RobotState";
import {
  DRIVER_STATION_CONSOLE_VIEW,
  DRIVER_STATION_FOLLOW_MODES,
  DriverStationFollowMode,
  DriverStationRendererCommand
} from "../../shared/renderers/DriverStationRenderer";
import { Units } from "../../shared/units";
import { createUUID } from "../../shared/util";
import ConsoleController from "./ConsoleController";
import {
  DriverStationController_ConsoleKey,
  DriverStationController_DefaultGraphs,
  DriverStationController_EmptyGraph
} from "./DriverStationController_Config";
import LineGraphController from "./LineGraphController";
import TabController from "./TabController";

export default class DriverStationController implements TabController {
  UUID = createUUID();

  private ENABLED_PERIODS_UPDATE_MS = 500;
  private ENABLED_PERIOD_BUFFER_SECS = 2; // Extra time displayed before and after each enabled period
  private CONSOLE_TITLE = "Console";
  private CONTROLS_ROOT: HTMLElement;

  private graphs: {
    id: string;
    title: string;
    removable: boolean;
    controls: HTMLElement;
    controller: LineGraphController;
  }[] = [];
  private consoleController: ConsoleController;
  private view: string = DriverStationController_DefaultGraphs[0].id;
  private enabledPeriods: [number, number][] = []; // Includes buffer
  private enabledPeriodsUpdateTime = 0;
  private lastEnabledPeriodIndex = -1;
  private consoleFollowMode: DriverStationFollowMode = "filter";

  /**
   * @param controlsRoot The root element for the controls pane
   * @param rendererRoot The root element of the renderer, which must already be populated by the renderer
   */
  constructor(controlsRoot: HTMLElement, rendererRoot: HTMLElement) {
    this.CONTROLS_ROOT = controlsRoot;
    DriverStationController_DefaultGraphs.forEach((graph) => {
      this.addGraph(graph.id, graph.title, false, graph.state);
    });

    // Console
    this.consoleController = new ConsoleController(
      rendererRoot.getElementsByClassName("driver-station-console")[0] as HTMLElement
    );
    this.consoleController.restoreState(DriverStationController_ConsoleKey);

    // View selection (the buttons are managed by the renderer)
    rendererRoot.getElementsByClassName("driver-station-view-buttons")[0].addEventListener("click", (event) => {
      let button = (event.target as HTMLElement).closest("button");
      if (button === null) return;
      if (button.classList.contains("driver-station-add-button")) {
        this.view = this.addGraph(createUUID(), this.getNewGraphTitle(), true, DriverStationController_EmptyGraph);
      } else if (button.classList.contains("driver-station-remove-button")) {
        this.removeGraph(this.view);
      } else if (button.dataset.view !== undefined) {
        this.view = button.dataset.view;
      }
      this.updateControls();
    });
    let followButtons = rendererRoot
      .getElementsByClassName("driver-station-follow-buttons")[0]
      .getElementsByTagName("button");
    DRIVER_STATION_FOLLOW_MODES.forEach((mode, index) => {
      followButtons[index].addEventListener("click", () => {
        this.consoleFollowMode = mode;
      });
    });
    rendererRoot
      .getElementsByClassName("driver-station-enabled-button")[0]
      .getElementsByTagName("button")[0]
      .addEventListener("click", () => this.showNextEnabledPeriod());
    this.updateControls();
  }

  /** Adds a graph with its own set of line graph controls, returning its ID. */
  private addGraph(id: string, title: string, removable: boolean, state: unknown): string {
    let controlsTemplate = document.getElementById("controller" + TabType.LineGraph.toString()) as HTMLElement;
    let controls = document.createElement("div");
    controls.classList.add("driver-station-controls");
    controls.hidden = true;
    Array.from(controlsTemplate.children).forEach((child) => controls.appendChild(child.cloneNode(true)));
    this.CONTROLS_ROOT.appendChild(controls);

    let controller = new LineGraphController(controls);
    controller.restoreState(state);
    controller.setNumericValueOverride(getDriverStationNumericValue);
    controller.setDiscreteTextOverride(getDriverStationValueText);
    controller.setDiscreteColorOverride(getDriverStationValueColor);
    this.graphs.push({ id: id, title: title, removable: removable, controls: controls, controller: controller });
    return id;
  }

  /** Removes a graph that was added by the user. */
  private removeGraph(id: string) {
    let index = this.graphs.findIndex((graph) => graph.id === id);
    if (index === -1 || !this.graphs[index].removable) return;
    this.CONTROLS_ROOT.removeChild(this.graphs[index].controls);
    this.graphs.splice(index, 1);
    if (this.view === id) {
      // Display the previous graph added by the user, or the console if this was the first
      this.view = this.graphs[index - 1].removable ? this.graphs[index - 1].id : DRIVER_STATION_CONSOLE_VIEW;
    }
  }

  /** Returns the first unused title for a new graph. */
  private getNewGraphTitle(): string {
    let number = 1;
    while (this.graphs.some((graph) => graph.title === "Graph " + number.toString())) {
      number++;
    }
    return "Graph " + number.toString();
  }

  /** Returns the displayed graph, or null if the console is displayed. */
  private getDisplayedGraph() {
    return this.graphs.find((graph) => graph.id === this.view) ?? null;
  }

  /** Updates the cached enabled periods if they are out of date. */
  private updateEnabledPeriods(force = false) {
    let now = new Date().getTime();
    if (force || now - this.enabledPeriodsUpdateTime > this.ENABLED_PERIODS_UPDATE_MS) {
      this.enabledPeriods = getEnabledPeriods(window.log).map((period) => [
        period[0] - this.ENABLED_PERIOD_BUFFER_SECS,
        period[1] + this.ENABLED_PERIOD_BUFFER_SECS
      ]);
      this.enabledPeriodsUpdateTime = now;
    }
  }

  /** Returns the index of the enabled period that matches the timeline range, or null if none. */
  private getDisplayedEnabledPeriod(): number | null {
    let timelineRange = window.selection.getTimelineRange();
    let index = this.enabledPeriods.findIndex(
      (period) => Math.abs(period[0] - timelineRange[0]) < 1e-3 && Math.abs(period[1] - timelineRange[1]) < 1e-3
    );
    return index === -1 ? null : index;
  }

  /** Zooms the timeline to the next enabled period, returning to the first after the last. */
  private showNextEnabledPeriod() {
    this.updateEnabledPeriods(true);
    if (this.enabledPeriods.length === 0) return;
    let displayedIndex = this.getDisplayedEnabledPeriod();
    let index = ((displayedIndex ?? this.lastEnabledPeriodIndex) + 1) % this.enabledPeriods.length;
    this.lastEnabledPeriodIndex = index;
    window.selection.unlock();
    window.selection.setTimelineRange([...this.enabledPeriods[index]], false);
  }

  /** Displays the controls for the current view. */
  private updateControls() {
    this.graphs.forEach((graph) => {
      graph.controls.hidden = graph.id !== this.view;
    });
  }

  saveState(): unknown {
    return {
      view: this.view,
      consoleFollowMode: this.consoleFollowMode,
      graphs: this.graphs.map((graph) => {
        return { id: graph.id, title: graph.title, state: graph.controller.saveState() };
      }),
      console: this.consoleController.saveState()
    };
  }

  restoreState(state: unknown): void {
    if (typeof state !== "object" || state === null) return;

    if (
      "consoleFollowMode" in state &&
      DRIVER_STATION_FOLLOW_MODES.includes(state.consoleFollowMode as DriverStationFollowMode)
    ) {
      this.consoleFollowMode = state.consoleFollowMode as DriverStationFollowMode;
    }
    if ("graphs" in state && Array.isArray(state.graphs)) {
      // Remove graphs added by the user
      this.graphs
        .filter((graph) => graph.removable)
        .forEach((graph) => {
          this.removeGraph(graph.id);
        });

      state.graphs.forEach((graphState: unknown) => {
        if (
          typeof graphState !== "object" ||
          graphState === null ||
          !("id" in graphState) ||
          typeof graphState.id !== "string" ||
          !("title" in graphState) ||
          typeof graphState.title !== "string" ||
          !("state" in graphState)
        ) {
          return;
        }
        let existing = this.graphs.find((graph) => graph.id === graphState.id);
        if (existing !== undefined) {
          existing.controller.restoreState(graphState.state);
        } else if (graphState.id !== DRIVER_STATION_CONSOLE_VIEW) {
          this.addGraph(graphState.id, graphState.title, true, graphState.state);
        }
      });
    }
    if (
      "view" in state &&
      typeof state.view === "string" &&
      (state.view === DRIVER_STATION_CONSOLE_VIEW || this.graphs.some((graph) => graph.id === state.view))
    ) {
      this.view = state.view;
    }
    if ("console" in state) {
      this.consoleController.restoreState(state.console);
    }
    this.updateControls();
  }

  refresh(): void {
    this.graphs.forEach((graph) => graph.controller.refresh());
    this.consoleController.refresh();
  }

  newAssets(): void {}

  getActiveFields(): string[] {
    let activeFields = this.consoleController.getActiveFields();
    this.graphs.forEach((graph) => {
      activeFields = activeFields.concat(graph.controller.getActiveFields());
    });
    return activeFields;
  }

  /** Returns whether the displayed view has controls, which is only true for graphs. */
  hasControls(): boolean {
    return this.getDisplayedGraph() !== null;
  }

  showTimeline(): boolean {
    return true;
  }

  /** Adjusts the locked range and unit conversion for an axis on the displayed graph. */
  editAxis(
    legend: string,
    lockedRange: [number, number] | null,
    unitConversion: Units.UIUnitOptions,
    filter: LineGraphFilter
  ) {
    this.getDisplayedGraph()?.controller.editAxis(legend, lockedRange, unitConversion, filter);
  }

  /** Clears the fields for an axis on the displayed graph. */
  clearAxis(legend: string) {
    this.getDisplayedGraph()?.controller.clearAxis(legend);
  }

  /** Sets the state of the robot mode visualization on the displayed graph. */
  setRobotModeVisible(showRobotMode: boolean) {
    this.getDisplayedGraph()?.controller.setRobotModeVisible(showRobotMode);
  }

  getCommand(): DriverStationRendererCommand {
    this.updateEnabledPeriods();
    let graph = this.getDisplayedGraph();
    let consoleCommand = graph === null ? this.consoleController.getCommand() : null;
    if (consoleCommand !== null && this.consoleFollowMode !== "off") {
      let timeRange = window.selection.getTimelineRange();
      if (this.consoleFollowMode === "filter") {
        consoleCommand.lines = consoleCommand.lines.filter(
          (line) => line.timestamp >= timeRange[0] && line.timestamp <= timeRange[1]
        );
      } else {
        consoleCommand.followRange = timeRange;
      }
    }
    return {
      views: [
        ...this.graphs.filter((graph) => !graph.removable),
        { id: DRIVER_STATION_CONSOLE_VIEW, title: this.CONSOLE_TITLE, removable: false },
        ...this.graphs.filter((graph) => graph.removable)
      ].map((view) => {
        return { id: view.id, title: view.title, removable: view.removable };
      }),
      view: this.view,
      graph: graph === null ? null : graph.controller.getCommand(),
      console: consoleCommand,
      consoleFollowMode: this.consoleFollowMode,
      enabledPeriodCount: this.enabledPeriods.length,
      enabledPeriodIndex: this.getDisplayedEnabledPeriod()
    };
  }
}
