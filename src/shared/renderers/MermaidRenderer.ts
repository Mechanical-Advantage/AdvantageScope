// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import mermaid from "mermaid";
import TabRenderer from "./TabRenderer";

export default class MermaidRenderer implements TabRenderer {
  private CONTAINER: HTMLElement;
  private lastDiagram: string | null = null;
  private lastRenderedDiagram: string | null = null;

  constructor(root: HTMLElement) {
    this.CONTAINER = root.getElementsByClassName("mermaid-container")[0] as HTMLElement;
    mermaid.initialize({
      startOnLoad: false,
      theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "default"
    });
  }

  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {}

  getAspectRatio(): number | null {
    return null;
  }

  async render(command: MermaidRendererCommand) {
    if (command.diagram === this.lastDiagram) return;
    this.lastDiagram = command.diagram;

    if (command.diagram === null || command.diagram.trim() === "") {
      this.CONTAINER.innerHTML = "";
      this.lastRenderedDiagram = null;
    } else {
      if (command.diagram === this.lastRenderedDiagram) return;
      try {
        const { svg } = await mermaid.render("mermaid-" + Math.random().toString(36).substring(7), command.diagram);
        this.CONTAINER.innerHTML = svg;
        this.lastRenderedDiagram = command.diagram;
      } catch (e) {
        this.CONTAINER.innerText = "Error rendering Mermaid diagram: " + (e as Error).message;
      }
    }
  }
}

export type MermaidRendererCommand = {
  diagram: string | null;
};
