// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import mermaid from "mermaid";
import TabRenderer from "./TabRenderer";
import { IntersectionResult, pathsIntersect, stripBezierCurves, type Segment } from "./diagrams/mermaidUtils";
import { deserializePath, serialisePath as serializePath, toSegments } from "./diagrams/mermaidUtils";

function initMermaid() {
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    theme: "base",
    themeVariables: {
      'fontSize': '50px',        // Increases text and node size globally
      'nodeSpacing': 100,       // Increases distance between nodes
      'rankSpacing': 100        // Increases distance between levels
    },
    state: {
      defaultRenderer: "elk"
    }
  });
}

export default class MermaidRenderer implements TabRenderer {
  private CONTAINER: HTMLElement;
  private lastRenderedDiagram: string | null = null;
  private lastId = 0;
  private isRunning: boolean = false;

  constructor(root: HTMLElement) {
    this.CONTAINER = root.getElementsByClassName("mermaid-container")[0] as HTMLElement;
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
    this.lastId++;
    if (command.diagram === null || command.diagram.trim() === "") {
      this.lastRenderedDiagram = null;
    } else {
      console.log(mermaid.mermaidAPI.getConfig());
      console.log("Rendering!")
      this.lastRenderedDiagram = command.diagram;
      try {
        if (this.isRunning) return;
        this.isRunning = true;
        initMermaid();
        const { svg, bindFunctions } = await mermaid.render(this.lastId.toString(), `%%{init: {"state": {"defaultRenderer": "elk"}}}%%\n` + command.diagram);
        this.CONTAINER.innerHTML = svg;
        bindFunctions?.(this.CONTAINER);
        this.correctStyles();
        this.isRunning = false;
      } catch (e) {
        this.CONTAINER.innerHTML = "Error rendering Mermaid diagram: " + (e as Error).message;
        throw e
      }
    }
  }

  private correctStyles() {
    const isDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    console.log("Dark theme: " + isDarkTheme);
    for (const node of this.CONTAINER.querySelectorAll(".nodes .node")) {
      node.querySelector(".label-container")?.setAttribute("fill", "white");
      const label = node.querySelector(".nodeLabel") as HTMLElement | null;
      if (label == null) continue
      if (label.parentElement?.style.color === "") {
        label.style.color = isDarkTheme ? "black" : "white"
      }
    }

    const paths: Segment[][] = []

    for (const edge of this.CONTAINER.querySelectorAll(".edgePaths path[data-edge=true]")) {
      edge.setAttribute("stroke", isDarkTheme ? "white" : "black")
      edge.setAttribute("stroke-width", "2px");
      const data = edge.getAttribute("d")
      if (data == null) return
      let path = deserializePath(data)
      path = stripBezierCurves(path)
      paths.push(toSegments(path))
      edge.setAttribute("d", serializePath(path));
    }

    const intersectCache = new Map<{ i: number, j: number }, IntersectionResult>()

    for (let i = 0; i < paths.length - 1; i++) {
      const invalidSegments = []
      inner: for (let j = i + 1; j < paths.length; j++) {
        let res = intersectCache.getOrInsertComputed({ i, j }, () => pathsIntersect(paths[i], paths[j]))
        if (!res.intersects) continue inner;
        for (const intersection of res.points) {
          for (const seg of paths[i]) {
            if (seg.x1 <= intersection.x && intersection.x <= seg.x2) invalidSegments.push(seg)
          }
        }
      }

      if (invalidSegments.length === paths.length) continue;
      
    }
  }
}

export type MermaidRendererCommand = {
  diagram: string | null;
};