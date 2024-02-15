import PointCloudVisualizer from "./PointCloudVisualizer";
import Visualizer from "./Visualizer";

/** Wrapper around PointCloudVisualizer to automatically switch rendering modes. */
export default class PointCloudVisualizerSwitching implements Visualizer {
  private content: HTMLElement;
  private canvas: HTMLCanvasElement;
  private annotationsDiv: HTMLElement;
  private alert: HTMLElement;
  private visualizer: PointCloudVisualizer | null = null;

  private lastMode: "cinematic" | "standard" | "low-power" | null = null;

  constructor(content: HTMLElement, canvas: HTMLCanvasElement, annotationsDiv: HTMLElement, alert: HTMLElement) {
    this.content = content;
    this.canvas = canvas;
    this.annotationsDiv = annotationsDiv;
    this.alert = alert;
    this.render(null);
  }

  saveState() {
    if (this.visualizer !== null) {
      return this.visualizer.saveState();
    }
    return null;
  }

  restoreState(state: any): void {
    if (this.visualizer !== null && state !== null) {
      this.visualizer.restoreState(state);
    }
  }

  /** Switches the selected camera. */
  set3DCamera(index: number) {

  }

  /** Updates the orbit FOV. */
  setFov(fov: number) {
    this.visualizer?.setFov(fov);
  }

  render(command: any): number | null {
    // Get current mode
    let mode: "cinematic" | "standard" | "low-power" = "standard";
    if (window.preferences) {
      if (window.isBattery && window.preferences.threeDimensionModeBattery !== "") {
        mode = window.preferences.threeDimensionModeBattery;
      } else {
        mode = window.preferences.threeDimensionModeAc;
      }
    }

    // Recreate visualizer if necessary
    if (mode !== this.lastMode) {   // this starts as null so this runs on startup as well
      this.lastMode = mode;
      let state: any = null;
      if (this.visualizer !== null) {   // save current state if any
        state = this.visualizer.saveState();
        this.visualizer.stop();
      }
      {   // create a new canvas
        let newCanvas = document.createElement("canvas");
        this.canvas.classList.forEach((className) => {    // copy all the CSS classes/properties?
          newCanvas.classList.add(className);
        });
        newCanvas.id = this.canvas.id;
        this.canvas.replaceWith(newCanvas);
        this.canvas = newCanvas;
      }
      {
        let newDiv = document.createElement("div");
        this.annotationsDiv.classList.forEach((className) => {
          newDiv.classList.add(className);
        });
        newDiv.id = this.annotationsDiv.id;
        this.annotationsDiv.replaceWith(newDiv);
        this.annotationsDiv = newDiv;
      }
      this.visualizer = new PointCloudVisualizer(mode, this.content, this.canvas, this.annotationsDiv, this.alert);
      if (state !== null) {
        this.visualizer.restoreState(state);
      }
    }

    // Send command
    if (this.visualizer === null || command === null) {
      return null;
    } else {
      return this.visualizer.render(command);
    }
  }
}
