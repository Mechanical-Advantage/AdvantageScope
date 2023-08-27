import Visualizer from "./Visualizer";

export default class VideoVisualizer implements Visualizer {
  private IMAGE: HTMLImageElement;

  constructor(image: HTMLImageElement) {
    this.IMAGE = image;
  }

  render(command: any): number | null {
    this.IMAGE.hidden = command === "";
    this.IMAGE.src = command;
    let width = this.IMAGE.naturalWidth;
    let height = this.IMAGE.naturalHeight;
    if (width > 0 && height > 0) {
      return width / height;
    }
    return null;
  }
}
