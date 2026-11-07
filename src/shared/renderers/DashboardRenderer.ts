// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import TabType from "../TabType";
import TabRenderer from "./TabRenderer";

export type DashboardRendererFactory = (type: TabType, rendererElement: HTMLElement) => TabRenderer;

export type DashboardRendererCommand = {
  panes: { type: TabType; command: unknown }[];
};

type DashboardRendererState = { type: TabType; renderer: unknown }[];

/** Renders the views for each pane of a dashboard. */
export default class DashboardRenderer implements TabRenderer {
  private PANE_BODIES: HTMLElement[];

  private createRenderer: DashboardRendererFactory;
  private panes: { type: TabType; renderer: TabRenderer }[] = [];
  private pendingStates: DashboardRendererState = [];

  constructor(root: HTMLElement, createRenderer: DashboardRendererFactory) {
    this.PANE_BODIES = Array.from(root.getElementsByClassName("dashboard-pane-body")) as HTMLElement[];
    this.createRenderer = createRenderer;
  }

  /** Returns the renderer for a pane, if it has been created. */
  getPaneRenderer(index: number): TabRenderer | null {
    return this.panes[index]?.renderer ?? null;
  }

  saveState(): DashboardRendererState {
    let count = Math.max(this.panes.length, this.pendingStates.length);
    return Array.from({ length: count }, (_, index) => {
      let pane = this.panes[index];
      return pane ? { type: pane.type, renderer: pane.renderer.saveState() } : this.pendingStates[index];
    });
  }

  restoreState(state: unknown): void {
    if (!Array.isArray(state)) return;
    (state as DashboardRendererState).forEach((paneState, index) => {
      if (!paneState) return;
      let pane = this.panes[index];
      if (pane && pane.type === paneState.type) {
        pane.renderer.restoreState(paneState.renderer);
      } else {
        // Apply once the renderer is created
        this.pendingStates[index] = paneState;
      }
    });
  }

  getAspectRatio(): number | null {
    return null;
  }

  render(command: DashboardRendererCommand): void {
    command.panes.forEach((paneCommand, index) => {
      if (index >= this.PANE_BODIES.length) return;
      let pane = this.panes[index];

      // Create renderer when the pane type changes
      if (!pane || pane.type !== paneCommand.type) {
        let body = this.PANE_BODIES[index];
        while (body.firstChild) {
          body.removeChild(body.firstChild);
        }
        let rendererElement = document
          .getElementById("renderer" + paneCommand.type.toString())
          ?.cloneNode(true) as HTMLElement;
        rendererElement.removeAttribute("id");
        body.appendChild(rendererElement);
        pane = { type: paneCommand.type, renderer: this.createRenderer(paneCommand.type, rendererElement) };
        this.panes[index] = pane;

        let pendingState = this.pendingStates[index];
        if (pendingState && pendingState.type === pane.type) {
          pane.renderer.restoreState(pendingState.renderer);
        }
        delete this.pendingStates[index];
      }

      pane.renderer.render(paneCommand.command);
    });
  }
}
