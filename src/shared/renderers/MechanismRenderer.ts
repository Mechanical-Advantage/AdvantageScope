// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { Translation2d } from "../geometry";
import { MechanismState } from "../log/LogUtil";
import TabRenderer from "./TabRenderer";

export default class MechanismRenderer implements TabRenderer {
  private CONTAINER: HTMLElement;
  private SVG: HTMLElement;

  private aspectRatio = 1;

  constructor(root: HTMLElement) {
    this.CONTAINER = root.getElementsByClassName("mechanism-svg-container")[0] as HTMLElement;
    this.SVG = root.getElementsByClassName("mechanism-svg")[0] as HTMLElement;
  }

  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {}

  getAspectRatio(): number | null {
    return this.aspectRatio;
  }

  render(command: MechanismRendererCommand): void {
    this.SVG.style.display = command === null ? "none" : "initial";
    if (command === null) return;

    // Update svg size and background
    let renderWidth = 0;
    let renderHeight = 0;
    if (this.CONTAINER.clientWidth / this.CONTAINER.clientHeight > command.dimensions[0] / command.dimensions[1]) {
      renderHeight = this.CONTAINER.clientHeight;
      renderWidth = renderHeight * (command.dimensions[0] / command.dimensions[1]);
    } else {
      renderWidth = this.CONTAINER.clientWidth;
      renderHeight = renderWidth * (command.dimensions[1] / command.dimensions[0]);
    }
    this.SVG.setAttribute("width", renderWidth.toString());
    this.SVG.setAttribute("height", renderHeight.toString());
    this.SVG.style.backgroundColor = command.backgroundColor;
    this.aspectRatio = command.dimensions[0] / command.dimensions[1];

    // Remove old elements
    while (this.SVG.firstChild) {
      this.SVG.removeChild(this.SVG.firstChild);
    }

    // Add lines
    command.lines.forEach((lineData) => {
      let startCoordinates: Translation2d = [
        (lineData.start[0] / command.dimensions[0]) * renderWidth,
        renderHeight - (lineData.start[1] / command.dimensions[1]) * renderHeight
      ];
      let endCoordinates: Translation2d = [
        (lineData.end[0] / command.dimensions[0]) * renderWidth,
        renderHeight - (lineData.end[1] / command.dimensions[1]) * renderHeight
      ];

      let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      this.SVG.appendChild(line);
      line.setAttribute("x1", startCoordinates[0].toString());
      line.setAttribute("y1", startCoordinates[1].toString());
      line.setAttribute("x2", endCoordinates[0].toString());
      line.setAttribute("y2", endCoordinates[1].toString());
      line.style.stroke = lineData.color;
      line.style.strokeWidth = lineData.weight.toString();

      [startCoordinates, endCoordinates].forEach((coordinates) => {
        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.SVG.appendChild(circle);
        circle.setAttribute("cx", coordinates[0].toString());
        circle.setAttribute("cy", coordinates[1].toString());
        circle.setAttribute("r", (lineData.weight / 2).toString());
        circle.style.fill = lineData.color;
      });
    });
  }
}

export type MechanismRendererCommand = MechanismState | null;
