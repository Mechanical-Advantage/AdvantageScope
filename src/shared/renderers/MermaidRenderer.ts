// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { Graphviz } from "@hpcc-js/wasm-graphviz";
import TabRenderer from "./TabRenderer";
import { mermaidToDotGraph } from "./mermaid/mermaidToDotGraph";

let graphVizImpl: Graphviz | null = null;
async function loadGraphViz(): Promise<Graphviz> {
  if (graphVizImpl === null) {
    graphVizImpl = await Graphviz.load();
  }
  return graphVizImpl;
}

export default class MermaidRenderer implements TabRenderer {
  private CONTAINER: HTMLElement;
  private lastDiagram: string | null = null;
  private lastWidth: number | null = null;
  private lastHeight: number | null = null;
  private lastDarkMode: boolean | null = null;

  constructor(root: HTMLElement) {
    this.CONTAINER = root.getElementsByClassName("mermaid-container")[0] as HTMLElement;
    loadGraphViz()
  }

  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {}

  getAspectRatio(): number | null {
    return null;
  }

  async render(command: MermaidRendererCommand) {
    const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (
      command.diagram === this.lastDiagram &&
      this.lastWidth === this.CONTAINER.clientWidth &&
      this.lastHeight === this.CONTAINER.clientHeight &&
      this.lastDarkMode === darkMode
    ) return;
    this.lastDiagram = command.diagram;

    if (command.diagram === null || command.diagram.trim() === "") {
      this.CONTAINER.innerHTML = "";
    } else {
      console.log("WIDTH: " + this.CONTAINER.clientWidth + " HEIGHT: " + this.CONTAINER.clientHeight);
      try {
        const width = this.CONTAINER.clientWidth - 5;
        const height = this.CONTAINER.clientHeight - 5;
        const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const dotGraph = mermaidToDotGraph(width, height, command.diagram, darkMode);
        const svg = (await loadGraphViz()).dot(dotGraph, "svg");
        this.CONTAINER.innerHTML = svg;
        this.lastWidth = this.CONTAINER.clientWidth;
        this.lastHeight = this.CONTAINER.clientHeight;
        this.lastDarkMode = darkMode;
      } catch (e) {
        this.CONTAINER.innerText = "Error rendering Mermaid diagram: " + (e as Error).message;
      }
    }
  }
}

export type MermaidRendererCommand = {
  diagram: string | null;
};
