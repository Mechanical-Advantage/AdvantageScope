export default class ScrollSensor {
  private SIZE_PX = 100000;
  private RESET_MS = 1000;

  private container: HTMLElement;
  private callback: (x: number, y: number) => void;

  private lastScrollUpdate = 0;
  private resetOnNextUpdate = false;
  private lastScrollLeft: number = 0;
  private lastScrollTop: number = 0;

  /**
   * Creates a new ScrollSensor.
   * @param element The container element. The overflow should be "scroll" and the scrollbar should be hidden. It does not need a child element.
   * @param callback A function to be called after each scroll event, with the relative change in x and y.
   */
  constructor(container: HTMLElement, callback: (dx: number, dy: number) => void) {
    this.container = container;
    this.callback = callback;

    let content = document.createElement("div");
    this.container.appendChild(content);
    content.style.width = this.SIZE_PX.toString() + "px";
    content.style.height = this.SIZE_PX.toString() + "px";
    setTimeout(() => this.reset(), 100); // Wait to load

    this.container.addEventListener("scroll", () => {
      this.update();
    });
  }

  /** Measure the scroll and update if necessary. */
  private update() {
    let currentTime = new Date().getTime();

    // Exit if not visible (cannot get scroll position)
    if (this.container.offsetWidth == 0 && this.container.offsetHeight == 0) {
      this.resetOnNextUpdate = true;
      return;
    }

    // Reset if necessary
    if (this.resetOnNextUpdate || currentTime - this.lastScrollUpdate > this.RESET_MS) {
      this.resetOnNextUpdate = false;
      this.reset();
    }
    this.lastScrollUpdate = currentTime;

    // Measure scroll movement
    let dx = this.container.scrollLeft - this.lastScrollLeft;
    let dy = this.container.scrollTop - this.lastScrollTop;
    this.lastScrollLeft = this.container.scrollLeft;
    this.lastScrollTop = this.container.scrollTop;
    this.callback(dx, dy);
  }

  /** Moves the scroll position to the center. */
  private reset() {
    let middle = this.SIZE_PX / 2;
    this.container.scrollLeft = middle;
    this.container.scrollTop = middle;
    this.lastScrollLeft = middle;
    this.lastScrollTop = middle;
  }
}
