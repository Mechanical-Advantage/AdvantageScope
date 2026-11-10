// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { TracksideTile } from "../Trackside";
import LineGraphRenderer, { LineGraphRendererCommand } from "./LineGraphRenderer";
import TabRenderer from "./TabRenderer";

export type TracksideRendererCommand = {
  tiles: TracksideTile[];
  message: string;
  graph: LineGraphRendererCommand | null;
};

export default class TracksideRenderer implements TabRenderer {
  private grid: HTMLElement;
  private graphRoot: HTMLElement;
  private graph: LineGraphRenderer;
  constructor(root: HTMLElement, reorder?: (from: number, to: number) => void) {
    this.grid = root.firstElementChild as HTMLElement;
    this.graphRoot = document.createElement("div");
    this.graphRoot.className = "trackside-graph";
    this.graphRoot.innerHTML = document.getElementById("renderer1")!.innerHTML;
    root.append(this.graphRoot);
    this.graph = new LineGraphRenderer(this.graphRoot, !!reorder);
    if (!reorder) return;
    let pressed: { x: number; y: number; cell: HTMLElement } | null = null;
    let cancelled: AbortController;
    let finish = () => {};
    let clearDrag = () => {};
    this.grid.addEventListener("mousedown", (event) => {
      if (event.button !== 0) return;
      const cell = (event.target as HTMLElement).closest<HTMLElement>(".trackside-tile");
      if (!cell) return;
      finish();
      cancelled = new AbortController();
      pressed = { x: event.clientX, y: event.clientY, cell };
      finish = () => {
        pressed = null;
        cancelled.abort();
        clearDrag();
        clearDrag = () => {};
        document.getElementById("dragItem")!.hidden = true;
        document.body.style.cursor = "";
      };
      window.addEventListener("mouseup", finish, { signal: cancelled.signal });
      window.addEventListener("keydown", (event) => event.key === "Escape" && finish(), { signal: cancelled.signal });
      window.addEventListener("pointercancel", finish, { signal: cancelled.signal });
      window.addEventListener("blur", finish, { signal: cancelled.signal });
    });
    this.grid.addEventListener("mousemove", (event) => {
      if (!pressed || (Math.abs(event.clientX - pressed.x) < 5 && Math.abs(event.clientY - pressed.y) < 5)) return;
      const { cell } = pressed;
      pressed = null;
      const from = Array.from(this.grid.children).indexOf(cell);
      if (from < 0) {
        finish();
        return;
      }
      const rect = cell.getBoundingClientRect();
      const ghost = cell.cloneNode(true) as HTMLElement;
      ghost.style.width = rect.width + "px";
      ghost.style.height = rect.height + "px";
      ghost.style.boxSizing = "border-box";
      document.getElementById("dragItem")!.replaceChildren(ghost);
      const highlight = document.createElement("div");
      highlight.className = "trackside-drag-highlight";
      root.append(highlight);
      const data = { trackside: this };
      const update = (event: Event) => {
        const drag = (event as CustomEvent).detail;
        if (drag.data !== data) return;
        const gridRect = this.grid.getBoundingClientRect();
        const inside =
          this.grid.offsetParent !== null &&
          drag.x >= gridRect.left &&
          drag.x <= gridRect.right &&
          drag.y >= gridRect.top &&
          drag.y <= gridRect.bottom;
        highlight.hidden = !inside;
        let to = 0;
        let distance = Infinity;
        let target: DOMRect = rect;
        let edge = rect.left;
        Array.from(this.grid.children).forEach((element, index) => {
          const bounds = element.getBoundingClientRect();
          for (const after of [false, true]) {
            const x = after ? bounds.right : bounds.left;
            const d = Math.hypot(drag.x - x, drag.y - Math.max(bounds.top, Math.min(bounds.bottom, drag.y)));
            if (d < distance) {
              distance = d;
              to = index + Number(after);
              target = bounds;
              edge = x;
            }
          }
        });
        if (drag.end) {
          finish();
          if (inside) reorder(from, to);
        } else {
          const rootRect = root.getBoundingClientRect();
          highlight.style.left = edge - rootRect.left - 6 + "px";
          highlight.style.top = target.top - rootRect.top + "px";
          highlight.style.height = target.height + "px";
        }
      };
      clearDrag = () => highlight.remove();
      window.addEventListener("drag-update", update, { signal: cancelled.signal });
      window.startDrag(event.clientX, event.clientY, event.clientX - rect.left, event.clientY - rect.top, data);
    });
  }
  dispose() {
    this.graph.dispose();
  }
  saveState() {
    return this.graph.saveState();
  }
  restoreState(state: unknown) {
    this.graph.restoreState(state);
  }
  getAspectRatio() {
    return null;
  }
  render(command: TracksideRendererCommand) {
    this.graphRoot.hidden = !command.graph;
    this.grid.classList.toggle("with-graph", !!command.graph);
    if (command.graph) this.graph.render(command.graph);
    if (command.message || !command.tiles.length) {
      this.grid.replaceChildren();
      const message = document.createElement("div");
      message.className = "tab-centered";
      message.textContent = command.message || "Drag fields into the tile list below.";
      this.grid.append(message);
      return;
    }
    if (
      this.grid.children.length !== command.tiles.length ||
      !this.grid.firstElementChild?.classList.contains("trackside-tile")
    ) {
      this.grid.replaceChildren(
        ...command.tiles.map(() => {
          const cell = document.createElement("div");
          cell.className = "trackside-tile";
          for (const name of ["label", "reading", "state"]) {
            const element = document.createElement("div");
            element.className = "trackside-" + name;
            cell.append(element);
          }
          const unit = document.createElement("span");
          unit.className = "trackside-unit";
          cell.children[1].append(document.createElement("span"), unit);
          return cell;
        })
      );
    }
    command.tiles.forEach((tile, index) => {
      const cell = this.grid.children[index] as HTMLElement;
      cell.dataset.severity = tile.severity;
      cell.dataset.freshness = tile.state.includes("link lost") ? "offline" : tile.freshness ?? "";
      cell.children[0].textContent = tile.label;
      cell.children[1].children[0].textContent = tile.text;
      cell.children[1].children[1].textContent = tile.unit ? " " + tile.unit : "";
      cell.children[2].textContent = tile.state;
      cell.title = `${tile.label}: ${tile.text} ${tile.unit} ${tile.state}`;
    });
  }
}
