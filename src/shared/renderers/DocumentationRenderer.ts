import TabRenderer from "./TabRenderer";

export default class DocumentationRenderer implements TabRenderer {
  private CONTAINER: HTMLElement;
  private IFRAME: HTMLIFrameElement;

  private stateQueue: string | null = null;
  private loaded = false;

  constructor(content: HTMLElement) {
    this.CONTAINER = content.getElementsByClassName("documentation-container")[0] as HTMLElement;
    this.IFRAME = this.CONTAINER.firstElementChild as HTMLIFrameElement;
    this.IFRAME.addEventListener("load", () => {
      this.loaded = true;
    });
  }

  saveState(): unknown {
    return this.IFRAME.contentWindow?.location.hash;
  }

  restoreState(state: unknown): void {
    if (typeof state === "string") {
      this.IFRAME.contentWindow!.location.hash = state;
      this.stateQueue = state;
    }
  }

  getAspectRatio(): number | null {
    return null;
  }

  render(_: unknown): void {
    if (this.stateQueue !== null && this.loaded) {
      this.IFRAME.contentWindow!.location.hash = this.stateQueue;
      this.stateQueue = null;
    }
  }
}
