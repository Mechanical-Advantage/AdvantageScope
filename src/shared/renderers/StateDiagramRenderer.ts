// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { renderMermaidSVGAsync, RenderOptions } from "beautiful-mermaid";
import svgPanZoom from "svg-pan-zoom";
import TabRenderer from "./TabRenderer";
import { StateMachineGraphState } from "../log/LogUtil";
import { arraysEqual } from "../util";

export default class StateDiagramRenderer implements TabRenderer {
  private CONTAINER: HTMLElement;
  private lastCmd: StateDiagramRendererCommand = {
    diagram: null,
    historyLengthToDisplay: 1,
    colorHex: "#000000"
  };
  private wasDarkTheme = false;
  private isRunning = false;
  private zoomHandler: SvgPanZoom.Instance | null = null;

  constructor(root: HTMLElement) {
    this.CONTAINER = root.getElementsByClassName("mermaid-container")[0] as HTMLElement;
    window.addEventListener('resize', () => {
      this.zoomHandler?.resize();
      this.zoomHandler?.fit(); 
      this.zoomHandler?.center(); 
    });
  }

  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {}

  getAspectRatio(): number | null {
    return null;
  }

  async render(command: StateDiagramRendererCommand) {
    const isDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;  
    const shouldRerenderDiagram =
      this.lastCmd.diagram?.graphJson !== command.diagram?.graphJson ||
      this.wasDarkTheme !== isDarkTheme;
    if (
      arraysEqual(this.lastCmd.diagram?.history ?? [], command.diagram?.history ?? []) &&
      this.lastCmd.historyLengthToDisplay === command.historyLengthToDisplay &&
      this.lastCmd.colorHex === command.colorHex &&
      !shouldRerenderDiagram
    ) {
      return;
    }
    this.lastCmd = command;
    this.wasDarkTheme = isDarkTheme;
    if (command.diagram == null) {
      this.lastCmd.diagram = null;
      this.CONTAINER.innerHTML = "Drag a state machine graph into the 'State Graph' section to get started.";
      this.zoomHandler = null;
      return;
    }
    if (this.isRunning) return;
    this.isRunning = true;
    if (shouldRerenderDiagram) {
      console.log("Rere rendering diagram with options:", { isDarkTheme });
      const renderOptions = isDarkTheme ? { bg: "#222", fg: "white" } : {};
      this.CONTAINER.innerHTML = await renderMermaidFromJson(command.diagram.graphJson, renderOptions);
    }
    let history = command.diagram.history;
    if (history.length > 0) {
      history = history.slice(Math.max(0, history.length - command.historyLengthToDisplay));
      this.displayHistory(history, command.colorHex);
    }
    const svgElement = this.CONTAINER.querySelector("svg");
    this.zoomHandler = svgElement == null ? null : svgPanZoom(svgElement);
    this.isRunning = false;
  }

  private displayHistory(history: string[], colorHex: string) {
    for (const node of this.CONTAINER.querySelectorAll(".node")) {
      const textEl = node.querySelector("text");
      const rectEl = node.querySelector("rect");
      if (textEl == null || rectEl == null) continue;
      const historyPos = history.lastIndexOf(textEl.innerHTML);
      if (historyPos === -1) {
        if (node.hasAttribute("data-ascope-modified")) {
          node.removeAttribute("data-ascope-modified");
          rectEl.setAttribute("fill", "var(--_node-fill)");
          rectEl.setAttribute("stroke", "var(--_inner-stroke)");
          rectEl.setAttribute("stroke-width", "1");
          textEl.setAttribute("fill", "var(--_text)");
        }
        continue;
      }
      node.setAttribute("data-ascope-modified", "true");
      const baseColor = scaleColor(colorHex, -0.1);
      rectEl.setAttribute("stroke-width", "2.5");
      rectEl.setAttribute("stroke", baseColor);
      const rank = history.length - historyPos - 1;
      if (rank === 0) {
        rectEl.setAttribute("fill", baseColor);
        textEl.setAttribute("fill", "white");
      } else if (rank === 1) {
        rectEl.setAttribute("fill", scaleColor(colorHex, 0.35));
        textEl.setAttribute("fill", "white");
      } else if (rank === 2) {
        rectEl.setAttribute("fill", scaleColor(colorHex, 0.8));
        textEl.setAttribute("fill", colorHex);
      } else {
        rectEl.setAttribute("fill", "#F1EFE8");
        textEl.setAttribute("fill", "#222");
      }
    }
  }
}

export type StateDiagramRendererCommand = {
  diagram: StateMachineGraphState | null;
  historyLengthToDisplay: number;
  colorHex: string;
}

async function renderMermaidFromJson(graphJsonStr: string, renderOptions?: RenderOptions): Promise<string> {
  try {
    const transitions = JSON.parse(graphJsonStr);
    if (!Array.isArray(transitions)) {
      return "Error: Invalid graph format for state machine";
    }
    let hasTransitions = false;
    let result = `%%{init: {"state": {"defaultRenderer": "elk"}}}%%\n`;
    result += `stateDiagram-v2\n  direction LR\n`;
    for (const transition of (transitions as any[])) {
      if ("condition" in transition && "target" in transition && "origin" in transition) {
        result += `  ${transition.origin} --> ${transition.target} : ${transition.condition}\n`;
        hasTransitions = true;
      }
    }
    if (!hasTransitions) {
      return "Your graph seems to have no nodes or edges.";
    }
    const svgString = await renderMermaidSVGAsync(result, renderOptions);
    // strips out font import to avoid CORS issues since the font won't load in the renderer's sandboxed iframe
    return svgString.replace(/@import\s+url\(.*?\);/, ``);
  } catch (error) {
    return "Error Rendering Mermaid Diagram: " + (error as Error).message;
  }
}

function scaleColor(colorHex: string, lightnessAdjustment: number): string {
  const { h, s, l } = hexToHsl(colorHex);
  const adjustedL = Math.max(0, l + (100 - l) * lightnessAdjustment);
  return hslToHex(h, s, adjustedL);
}

/**
 * Converts an RGB hex color string to HSL values.
 * @param {string} hex - e.g. "#ff5733" or "ff5733"
 * @returns {{ h: number, s: number, l: number }} h: 0–360, s: 0–100, l: 0–100
 */
function hexToHsl(hex: string) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3)
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");

  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return {
    h,
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Converts HSL values to an RGB hex color string.
 * @param {number} h - Hue, 0–360
 * @param {number} s - Saturation, 0–100
 * @param {number} l - Lightness, 0–100
 * @returns {string} e.g. "#ff5733"
 */
function hslToHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
