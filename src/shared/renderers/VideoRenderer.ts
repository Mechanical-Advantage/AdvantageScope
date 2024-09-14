import TabRenderer from "./TabRenderer";

export default class VideoRenderer implements TabRenderer {
  private IMAGE: HTMLImageElement;

  private aspectRatio: number | null = null;

  constructor(root: HTMLElement) {
    this.IMAGE = root.getElementsByTagName("img")[0] as HTMLImageElement;
  }

  getAspectRatio(): number | null {
    return this.aspectRatio;
  }

  render(command: unknown): void {
    if (typeof command !== "string") return;
    this.IMAGE.hidden = command === "";
    this.IMAGE.src = command;
    let width = this.IMAGE.naturalWidth;
    let height = this.IMAGE.naturalHeight;
    if (width > 0 && height > 0) {
      this.aspectRatio = width / height;
    } else {
      this.aspectRatio = null;
    }
  }

  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {}
}
