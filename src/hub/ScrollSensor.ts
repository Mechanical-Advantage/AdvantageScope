export default class ScrollSensor {
  private SIZE_PX = 1000000;
  private RESET_MS = 1000;

  private container: HTMLElement;
  private callback: (x: number, y: number) => void;

  private lastScrollUpdate = 0;
  private resetNext = false;
  private lastScrollLeft: number = 0;
  private lastScrollTop: number = 0;

  /**
   * Creates a new ScrollSensor.
   * @param container The container element. The overflow should be "scroll" and the scrollbar should be hidden. The child element should have the dimensions 1000000x1000000px.
   * @param callback A function to be called after each scroll event, with the relative change in x and y.
   */
  constructor(container: HTMLElement, callback: (dx: number, dy: number) => void) {
    this.container = container;
    this.callback = callback;

    this.resetNext = true;
    this.container.addEventListener("scroll", () => {
      this.update();
    });
  }

  /** Should be called periodically to trigger resets. */
  periodic() {
    let currentTime = new Date().getTime();
    if (this.resetNext || currentTime - this.lastScrollUpdate > this.RESET_MS) {
      this.resetNext = false;
      this.reset();
    }
  }

  /** Measure the scroll and update if necessary. */
  private update() {
    this.lastScrollUpdate = new Date().getTime();

    // Reset if necessary
    if (this.resetNext) {
      this.resetNext = false;
      this.reset();
    }

    // Exit if not visible (cannot get scroll position)
    if (this.container.offsetWidth === 0 && this.container.offsetHeight === 0) {
      this.resetNext = true;
      return;
    }

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
