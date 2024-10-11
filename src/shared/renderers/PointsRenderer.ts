import { GraphColors } from "../Colors";
import TabRenderer from "./TabRenderer";

export default class PointsRenderer implements TabRenderer {
  private CONTAINER: HTMLElement;
  private BACKGROUND: HTMLElement;
  private TEMPLATES: HTMLElement;

  private aspectRatio = 1;

  constructor(root: HTMLElement) {
    this.CONTAINER = root.firstElementChild as HTMLElement;
    this.BACKGROUND = this.CONTAINER.children[0] as HTMLElement;
    this.TEMPLATES = this.CONTAINER.children[1] as HTMLElement;
  }

  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {}

  getAspectRatio(): number | null {
    return this.aspectRatio;
  }

  render(command: PointsRendererCommand): void {
    // Update background size
    let containerWidth = this.CONTAINER.getBoundingClientRect().width;
    let containerHeight = this.CONTAINER.getBoundingClientRect().height;
    let targetWidth = command.dimensions[0];
    let targetHeight = command.dimensions[1];
    if (targetWidth < 1) targetWidth = 1;
    if (targetHeight < 1) targetHeight = 1;
    this.aspectRatio = targetWidth / targetHeight;

    let finalWidth: number;
    let finalHeight: number;
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
    command.sets.forEach((set) => {
      set.points.forEach((positionSource, index) => {
        let position = [positionSource[0], positionSource[1]];
        if (
          position[0] < 0 ||
          position[0] > command.dimensions[0] ||
          position[1] < 0 ||
          position[1] > command.dimensions[1]
        ) {
          return;
        }
        position[0] = (position[0] / command.dimensions[0]) * finalWidth;
        position[1] = (position[1] / command.dimensions[1]) * finalHeight;

        // Create point
        let point: HTMLElement | null = null;
        switch (set.shape) {
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
        if (!point) return;
        switch (set.size) {
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
        if (set.groupSize < 1) {
          color = window.matchMedia("(prefers-color-scheme: dark)").matches ? "white" : "black";
        } else {
          color = GraphColors[Math.floor(index / set.groupSize) % GraphColors.length].key;
        }
        point.style.fill = color;
        point.style.stroke = color;

        // Set coordinates and append
        point.style.left = position[0].toString() + "px";
        point.style.top = position[1].toString() + "px";
        this.BACKGROUND.appendChild(point);
      });
    });
  }
}

export type PointsRendererCommand = {
  dimensions: [number, number];
  sets: {
    points: [number, number][];
    shape: "plus" | "cross" | "circle";
    size: "small" | "medium" | "large";
    groupSize: number;
  }[];
};
