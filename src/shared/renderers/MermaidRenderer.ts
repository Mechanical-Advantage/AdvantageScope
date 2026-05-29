// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import mermaid from "mermaid";
import TabRenderer from "./TabRenderer";
import { createUUID } from "../util";

function initMermaid() {
  const isDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
  console.log("Dark theme: " + isDarkTheme);
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    theme: 'base', // You must set this to 'base' to allow overrides
    themeVariables: {
      // Node Background and Border Colors
      primaryColor: isDarkTheme ? '#ffffff' : '#000000',       // Default node fill
      primaryBorderColor: isDarkTheme ? '#ffffff' : '#000000', // Default node border
      primaryTextColor: isDarkTheme ? '#000000' : '#ffffff',   // Default node text

      // Edge / Line Colors
      lineColor: isDarkTheme ? '#ffffff' : '#000000',          // Changes color of connecting lines
      edgeLabelBackground: isDarkTheme ? '#ffffff' : '#000000',   // Changes color of edge labels
    },
    themeCSS: `
      /* Make all node text larger */
      .node .nodeLabel { 
        font-size: 22px !important; 
      }
      
      /* Make all edge label text smaller */
      .edgeLabel, .edgeLabel rect, .edgeLabel span { 
        font-size: 11px !important; 
      }
    `
  });
}

export default class MermaidRenderer implements TabRenderer {
  private CONTAINER: HTMLElement;
  private lastRenderedDiagram: string | null = null;
  private lastWidth: number | null = null;
  private lastHeight: number | null = null;
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
    this.lastWidth = this.CONTAINER.clientWidth;
    this.lastHeight = this.CONTAINER.clientHeight;
    if (command.diagram === null || command.diagram.trim() === "") {
      this.lastRenderedDiagram = null;
    } else {
      console.log("Rendering!")
      this.lastRenderedDiagram = command.diagram;
      try {
        if (this.isRunning) return;
        this.isRunning = true;
        initMermaid();
        const { svg, bindFunctions } = await mermaid.render(createUUID(), command.diagram);
        console.log("Rendered!  ")
        this.CONTAINER.innerHTML = svg;
        bindFunctions?.(this.CONTAINER);
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
};