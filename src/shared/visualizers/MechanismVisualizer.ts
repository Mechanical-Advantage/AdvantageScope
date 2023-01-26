import { Translation2d } from "../geometry";
import { MechanismState } from "../log/LogUtil";
import Visualizer from "./Visualizer";

export default class MechanismVisualizer implements Visualizer {
  private CONTAINER: HTMLElement;
  private SVG: HTMLElement;

  constructor(container: HTMLElement) {
    this.CONTAINER = container;
    this.SVG = container.firstElementChild as HTMLElement;
  }

  render(command: MechanismState[]): number | null {
    this.SVG.style.display = command.length == 0 ? "none" : "initial";
    if (command.length == 0) return null;

    // Get max dimensions
    let dimensions = [0, 0];
    command.forEach((state) => {
      if (state.dimensions[0] > dimensions[0]) {
        dimensions[0] = state.dimensions[0];
      }
      if (state.dimensions[1] > dimensions[1]) {
        dimensions[1] = state.dimensions[1];
      }
    });

    // Update svg size and background
    let renderWidth = 0;
    let renderHeight = 0;
    if (this.CONTAINER.clientWidth / this.CONTAINER.clientHeight > dimensions[0] / dimensions[1]) {
      renderHeight = this.CONTAINER.clientHeight;
      renderWidth = renderHeight * (dimensions[0] / dimensions[1]);
    } else {
      renderWidth = this.CONTAINER.clientWidth;
      renderHeight = renderWidth * (dimensions[1] / dimensions[0]);
    }
    this.SVG.setAttribute("width", renderWidth.toString());
    this.SVG.setAttribute("height", renderHeight.toString());
    this.SVG.style.backgroundColor = command[0].backgroundColor;

    // Remove old elements
    while (this.SVG.firstChild) {
      this.SVG.removeChild(this.SVG.firstChild);
    }

    // Add lines
    command.forEach((state) => {
      state.lines.forEach((lineData) => {
        let startCoordinates: Translation2d = [
          (lineData.start[0] / dimensions[0]) * renderWidth,
          renderHeight - (lineData.start[1] / dimensions[1]) * renderHeight
        ];
        let endCoordinates: Translation2d = [
          (lineData.end[0] / dimensions[0]) * renderWidth,
          renderHeight - (lineData.end[1] / dimensions[1]) * renderHeight
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
    });

    return dimensions[0] / dimensions[1];
  }
}
