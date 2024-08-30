import TabRenderer from "./TabRenderer";

export default class VideoRenderer implements TabRenderer {
  private IMAGE: HTMLImageElement;

  constructor(root: HTMLElement) {
    this.IMAGE = root.getElementsByTagName("img")[0] as HTMLImageElement;
  }

  render(command: unknown): void {
    if (typeof command !== "string") return;
    this.IMAGE.hidden = command === "";
    this.IMAGE.src = command;
  }

  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {}
}
