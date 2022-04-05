import { Colors } from "./colors.mjs";

// Renders point data onto a background div
export class PointsRenderer {
  #container = null;
  #background = null;
  #templates = null;

  constructor(container) {
    this.#container = container;
    this.#background = container.children[0];
    this.#templates = container.children[1];
  }

  // Renders new data
  render(command) {
    // Update background size
    var containerWidth = this.#container.getBoundingClientRect().width;
    var containerHeight = this.#container.getBoundingClientRect().height;
    var targetWidth = command.options.width;
    var targetHeight = command.options.height;
    if (targetWidth < 1) targetWidth = 1;
    if (targetHeight < 1) targetHeight = 1;

    var finalWidth, finalHeight;
    if (targetWidth / targetHeight < containerWidth / containerHeight) {
      finalHeight = containerHeight;
      finalWidth = containerHeight * (targetWidth / targetHeight);
    } else {
      finalWidth = containerWidth;
      finalHeight = containerWidth * (targetHeight / targetWidth);
    }

    this.#background.style.width = Math.ceil(finalWidth + 1).toString() + "px";
    this.#background.style.height = Math.ceil(finalHeight + 1).toString() + "px";

    // Clear old points
    while (this.#background.firstChild) {
      this.#background.removeChild(this.#background.firstChild);
    }

    // Render new points
    for (let i = 0; i < Math.min(command.data.x.length, command.data.y.length); i++) {
      var position = [command.data.x[i], command.data.y[i]];
      var dimensions = [command.options.width, command.options.height];
      if (position[0] < 0 || position[0] > dimensions[0] || position[1] < 0 || position[1] > dimensions[1]) {
        continue;
      }
      position[0] = (position[0] / dimensions[0]) * finalWidth;
      position[1] = (position[1] / dimensions[1]) * finalHeight;

      // Create point
      switch (command.options.pointShape) {
        case "plus":
          var point = this.#templates.children[0].cloneNode(true);
          break;
        case "cross":
          var point = this.#templates.children[1].cloneNode(true);
          break;
        case "circle":
          var point = this.#templates.children[2].cloneNode(true);
          break;
      }
      switch (command.options.pointSize) {
        case "large":
          point.style["transform"] = "translate(-50%,-50%) scale(1, 1)";
          break;
        case "medium":
          point.style["transform"] = "translate(-50%,-50%) scale(0.5, 0.5)";
          break;
        case "small":
          point.style["transform"] = "translate(-50%,-50%) scale(0.25, 0.25)";
          break;
      }

      // Set color
      if (command.options.group < 1) {
        var color = window.matchMedia("(prefers-color-scheme: dark)").matches ? "white" : "black";
      } else {
        var color = Colors[Math.floor(i / command.options.group) % Colors.length];
      }
      point.style.fill = color;
      point.style.stroke = color;

      // Set coordinates and append
      point.style.left = position[0].toString() + "px";
      point.style.top = position[1].toString() + "px";
      this.#background.appendChild(point);
    }

    // Return target aspect ratio
    return targetWidth / targetHeight;
  }
}
