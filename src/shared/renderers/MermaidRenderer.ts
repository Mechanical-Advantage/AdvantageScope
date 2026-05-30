// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { renderMermaidSVGAsync, type RenderOptions } from "beautiful-mermaid";
import TabRenderer from "./TabRenderer";

export default class MermaidRenderer implements TabRenderer {
  private CONTAINER: HTMLElement;
  private lastRenderedDiagram: string | null = null;
  private isRunning: boolean = false;
  private renderOptions: RenderOptions = {};

  constructor(root: HTMLElement) {
    this.CONTAINER = root.getElementsByClassName("mermaid-container")[0] as HTMLElement;
    if (window.matchMedia("(prefers-color-scheme: dark)")) {
      this.renderOptions = {
        bg: "#222",
        fg: "white"
      }
    }
  }

  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {}

  getAspectRatio(): number | null {
    return null;
  }

  async render(command: MermaidRendererCommand) {
    if (command.diagram === this.lastRenderedDiagram) return;
    if (command.diagram === null || command.diagram.trim() === "") {
      this.lastRenderedDiagram = null;
    } else {
      console.log("Rendering!")
      this.lastRenderedDiagram = command.diagram;
      try {
        if (this.isRunning) return;
        this.isRunning = true;
        let diagram = command.diagram;
        const frontmatterPos = command.diagram.lastIndexOf("---");
        if (frontmatterPos !== -1 ) diagram = diagram.substring(frontmatterPos + 3);
        diagram = `%%{init: {"state": {"defaultRenderer": "elk"}}}%%\n` + diagram;
        const svg = await renderMermaidSVGAsync(diagram, this.renderOptions);
        this.CONTAINER.innerHTML = svg;
        this.isRunning = false;
      } catch (e) {
        this.CONTAINER.innerHTML = "Error rendering Mermaid diagram: " + (e as Error).message;
        throw e
      }
    }
  }
}

export type MermaidRendererCommand = {
  diagram: string | null;
  historyLength: number;
  color: string;
};