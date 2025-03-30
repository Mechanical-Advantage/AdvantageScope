import TabRenderer from "./TabRenderer";

export default class DocumentationRenderer implements TabRenderer {
  private CONTAINER: HTMLElement;
  private IFRAME: HTMLIFrameElement;

  private stateQueue: string | null = null;
  private loaded = false;
  private scrollPosition = 0;
  private shouldResetScroll = false;

  constructor(content: HTMLElement) {
    this.CONTAINER = content.getElementsByClassName("documentation-container")[0] as HTMLElement;
    this.IFRAME = this.CONTAINER.firstElementChild as HTMLIFrameElement;
    this.IFRAME.addEventListener("load", () => {
      this.loaded = true;
    });

    // Periodic function to record when tab is hidden
    let periodic = () => {
      if (this.CONTAINER.getBoundingClientRect().height === 0) {
        this.shouldResetScroll = true;
      }
      window.requestAnimationFrame(periodic);
    };
    window.requestAnimationFrame(periodic);
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
    // Navigate to initial page when loaded
    if (this.stateQueue !== null && this.loaded) {
      this.IFRAME.contentWindow!.location.hash = this.stateQueue;
      this.stateQueue = null;
    }

    // Update scroll location
    if (this.loaded && this.IFRAME.contentWindow !== null) {
      if (this.shouldResetScroll) {
        this.IFRAME.contentWindow.scrollTo(0, this.scrollPosition);
        this.shouldResetScroll = false;
      } else {
        this.scrollPosition = this.IFRAME.contentWindow.scrollY;
      }
    }
  }
}
