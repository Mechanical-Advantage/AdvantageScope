import { AllColors } from "../Colors";
import Visualizer from "./Visualizer";

export default class PointsVisualizer implements Visualizer {
  private CONTAINER: HTMLElement;
  private BACKGROUND: HTMLElement;
  private TEMPLATES: HTMLElement;

  constructor(container: HTMLElement) {
    this.CONTAINER = container;
    this.BACKGROUND = container.children[0] as HTMLElement;
    this.TEMPLATES = container.children[1] as HTMLElement;
  }

  saveState() {
    return null;
  }

  restoreState(): void {}

  render(command: any): number | null {
    // Update background size
    let containerWidth = this.CONTAINER.getBoundingClientRect().width;
    let containerHeight = this.CONTAINER.getBoundingClientRect().height;
    let targetWidth = command.options.width;
    let targetHeight = command.options.height;
    if (targetWidth < 1) targetWidth = 1;
    if (targetHeight < 1) targetHeight = 1;

    let finalWidth, finalHeight;
    if (targetWidth / targetHeight < containerWidth / containerHeight) {
      finalHeight = containerHeight;
      finalWidth = containerHeight * (targetWidth / targetHeight);
    } else {
      finalWidth = containerWidth;
      finalHeight = containerWidth * (targetHeight / targetWidth);
    }

    this.BACKGROUND.style.width = Math.ceil(finalWidth + 1).toString() + "px";
    this.BACKGROUND.style.height = Math.ceil(finalHeight + 1).toString() + "px";

    // Clear old points
    while (this.BACKGROUND.firstChild) {
      this.BACKGROUND.removeChild(this.BACKGROUND.firstChild);
    }

    // Render new points
    for (let i = 0; i < Math.min(command.data.x.length, command.data.y.length); i++) {
      let position = [command.data.x[i], command.data.y[i]];
      let dimensions = [command.options.width, command.options.height];
      switch (command.options.coordinates) {
        case "xr,yd":
          // Default, no changes
          break;
        case "xr,yu":
          position = [position[0], -position[1]];
          break;
        case "xu,yl":
          position = [-position[1], -position[0]];
          break;
      }
      switch (command.options.origin) {
        case "ul":
          // Default, no changes
          break;
        case "ur":
          position = [position[0] + dimensions[0], position[1]];
          break;
        case "ll":
          position = [position[0], position[1] + dimensions[1]];
          break;
        case "lr":
          position = [position[0] + dimensions[0], position[1] + dimensions[1]];
          break;
        case "c":
          position = [position[0] + dimensions[0] / 2, position[1] + dimensions[1] / 2];
          break;
      }
      if (position[0] < 0 || position[0] > dimensions[0] || position[1] < 0 || position[1] > dimensions[1]) {
        continue;
      }
      position[0] = (position[0] / dimensions[0]) * finalWidth;
      position[1] = (position[1] / dimensions[1]) * finalHeight;

      // Create point
      let point: HTMLElement | null = null;
      switch (command.options.pointShape) {
        case "plus":
          point = this.TEMPLATES.children[0].cloneNode(true) as HTMLElement;
          break;
        case "cross":
          point = this.TEMPLATES.children[1].cloneNode(true) as HTMLElement;
          break;
        case "circle":
          point = this.TEMPLATES.children[2].cloneNode(true) as HTMLElement;
          break;
      }
      if (!point) continue;
      switch (command.options.pointSize) {
        case "large":
          point.style.transform = "translate(-50%,-50%) scale(1, 1)";
          break;
        case "medium":
          point.style.transform = "translate(-50%,-50%) scale(0.5, 0.5)";
          break;
        case "small":
          point.style.transform = "translate(-50%,-50%) scale(0.25, 0.25)";
          break;
      }

      // Set color
      let color = "";
      if (command.options.groupSize < 1) {
        color = window.matchMedia("(prefers-color-scheme: dark)").matches ? "white" : "black";
      } else {
        color = AllColors[Math.floor(i / command.options.groupSize) % AllColors.length];
      }
      point.style.fill = color;
      point.style.stroke = color;

      // Set coordinates and append
      point.style.left = position[0].toString() + "px";
      point.style.top = position[1].toString() + "px";
      this.BACKGROUND.appendChild(point);
    }

    // Return target aspect ratio
    return targetWidth / targetHeight;
  }
}
