// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { renderMermaidSVGAsync } from "beautiful-mermaid";
import svgPanZoom from "svg-pan-zoom";
import { parse } from "yaml";
import TabRenderer from "./TabRenderer";

export default class StateDiagramRenderer implements TabRenderer {
  private CONTAINER: HTMLElement;
  private lastCmd: StateDiagramRendererCommand = {
    diagram: null,
    historyLength: 1,
    colorHex: "#000000"
  };
  private wasDarkTheme = false;
  private isRunning = false;

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

  async render(command: StateDiagramRendererCommand) {
    const isDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (
      this.lastCmd.colorHex === command.colorHex &&
      this.lastCmd.diagram === command.diagram &&
      this.lastCmd.historyLength === command.historyLength &&
      this.wasDarkTheme === isDarkTheme
    ) {
      return;
    }
    this.lastCmd = command;
    this.wasDarkTheme = isDarkTheme;
    if (command.diagram === null || command.diagram.trim() === "") {
      this.lastCmd.diagram = null;
      this.CONTAINER.innerHTML = "";
      return;
    }
    const renderOptions = isDarkTheme ? { bg: "#222", fg: "white" } : {};
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastCmd.diagram = command.diagram;
    let diagram = command.diagram;
    const dataStart = diagram.indexOf("---");
    const dataEnd = diagram.lastIndexOf("---");
    try {
      let data: Frontmatter | null = null;
      if (dataStart !== -1) {
        data = parse(diagram.substring(dataStart + 3, dataEnd)) as Frontmatter;
        diagram = diagram.substring(dataEnd + 3);
      }
      const svg = await renderMermaidSVGAsync(
        `%%{init: {"state": {"defaultRenderer": "elk"}}}%%\n` + diagram,
        renderOptions
      );
      this.CONTAINER.innerHTML = stripFontImport(svg);
      if (data != null) {
        const history = data.history.slice(Math.max(0, data.history.length - command.historyLength));
        this.displayHistory(history, command.colorHex);
      }
      svgPanZoom(this.CONTAINER.querySelector("svg")!);
      this.isRunning = false;
    } catch (e) {
      this.CONTAINER.innerHTML = "Error rendering Mermaid diagram: " + (e as Error).message;
      throw e;
    }
  }

  private displayHistory(history: string[], colorHex: string) {
    for (const node of this.CONTAINER.querySelectorAll(".node")) {
      const textEl = node.querySelector("text");
      const rectEl = node.querySelector("rect");
      if (textEl == null || rectEl == null) continue;
      const historyPos = history.lastIndexOf(textEl.innerHTML);
      if (historyPos === -1) continue;
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
        textEl.setAttribute("fill", "#222222");
      }
    }
  }
}

export interface StateDiagramRendererCommand {
  diagram: string | null;
  historyLength: number;
  colorHex: string;
}

interface Frontmatter {
  history: string[];
}

function stripFontImport(svgString: string): string {
  return svgString.replace(/@import\s+url\(.*?\);/, ``)
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
