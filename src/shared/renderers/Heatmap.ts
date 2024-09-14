import h337 from "heatmap.js";
import { Translation2d } from "../geometry";
import { scaleValue } from "../util";

export default class Heatmap {
  private static HEATMAP_GRID_SIZE = 0.1;
  private static HEATMAP_RADIUS = 0.1; // Fraction of field height

  private container: HTMLElement;
  private heatmap: h337.Heatmap<"value", "x", "y"> | null = null;
  private lastPixelDimensions: [number, number] = [0, 0];
  private lastFieldDimensions: [number, number] = [0, 0];
  private lastFlipped = false;
  private lastTranslationsStr = "";

  constructor(container: HTMLElement) {
    this.container = container;
  }

  getCanvas(): HTMLCanvasElement | null {
    let canvas = this.container.getElementsByTagName("canvas");
    if (canvas.length === 0) {
      return null;
    } else {
      return canvas[0];
    }
  }

  update(
    translations: Translation2d[],
    pixelDimensions: [number, number],
    fieldDimensions: [number, number],
    flipped = false
  ) {
    // Recreate heatmap canvas
    let newHeatmapInstance = false;
    if (
      pixelDimensions[0] !== this.lastPixelDimensions[0] ||
      pixelDimensions[1] !== this.lastPixelDimensions[1] ||
      fieldDimensions[0] !== this.lastFieldDimensions[0] ||
      fieldDimensions[1] !== this.lastFieldDimensions[1] ||
      flipped !== this.lastFlipped
    ) {
      newHeatmapInstance = true;
      this.lastPixelDimensions = pixelDimensions;
      this.lastFieldDimensions = fieldDimensions;
      this.lastFlipped = flipped;
      while (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild);
      }
      this.container.style.width = pixelDimensions[0].toString() + "px";
      this.container.style.height = pixelDimensions[1].toString() + "px";
      this.heatmap = h337.create({
        container: this.container,
        radius: pixelDimensions[1] * Heatmap.HEATMAP_RADIUS,
        maxOpacity: 0.75
      });
    }

    // Update heatmap data
    let translationsStr = JSON.stringify(translations);
    if (translationsStr !== this.lastTranslationsStr || newHeatmapInstance) {
      this.lastTranslationsStr = translationsStr;
      let grid: number[][] = [];
      for (let x = 0; x < fieldDimensions[0] + Heatmap.HEATMAP_GRID_SIZE; x += Heatmap.HEATMAP_GRID_SIZE) {
        let column: number[] = [];
        grid.push(column);
        for (let y = 0; y < fieldDimensions[1] + Heatmap.HEATMAP_GRID_SIZE; y += Heatmap.HEATMAP_GRID_SIZE) {
          column.push(0);
        }
      }

      translations.forEach((translation) => {
        let gridX = Math.floor(translation[0] / Heatmap.HEATMAP_GRID_SIZE);
        let gridY = Math.floor(translation[1] / Heatmap.HEATMAP_GRID_SIZE);
        if (gridX >= 0 && gridY >= 0 && gridX < grid.length && gridY < grid[0].length) {
          grid[gridX][gridY] += 1;
        }
      });

      let heatmapData: { x: number; y: number; value: number }[] = [];
      let x = Heatmap.HEATMAP_GRID_SIZE / 2;
      let y: number;
      let maxValue = 0;
      grid.forEach((column) => {
        x += Heatmap.HEATMAP_GRID_SIZE;
        y = Heatmap.HEATMAP_GRID_SIZE / 2;
        column.forEach((gridValue) => {
          y += Heatmap.HEATMAP_GRID_SIZE;
          let coordinates = [
            scaleValue(x, [0, fieldDimensions[0]], [0, pixelDimensions[0]]),
            scaleValue(y, [0, fieldDimensions[1]], [pixelDimensions[1], 0])
          ];
          if (flipped) {
            coordinates[0] = pixelDimensions[0] - coordinates[0];
            coordinates[1] = pixelDimensions[1] - coordinates[1];
          }
          coordinates[0] = Math.round(coordinates[0]);
          coordinates[1] = Math.round(coordinates[1]);
          maxValue = Math.max(maxValue, gridValue);
          if (gridValue > 0) {
            heatmapData.push({
              x: coordinates[0],
              y: coordinates[1],
              value: gridValue
            });
          }
        });
      });
      this.heatmap?.setData({
        min: 0,
        max: maxValue,
        data: heatmapData
      });
    }
  }
}
