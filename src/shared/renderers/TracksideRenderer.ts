// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { TracksideTile } from "../Trackside";
import TabRenderer from "./TabRenderer";

export type TracksideRendererCommand = { tiles: TracksideTile[]; message: string };

export default class TracksideRenderer implements TabRenderer {
  private grid: HTMLElement;
  constructor(root: HTMLElement) {
    this.grid = root.firstElementChild as HTMLElement;
  }
  saveState() {
    return null;
  }
  restoreState(_state: unknown) {}
  getAspectRatio() {
    return null;
  }
  render(command: TracksideRendererCommand) {
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
