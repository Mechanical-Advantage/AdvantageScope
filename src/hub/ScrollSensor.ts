export default class ScrollSensor {
  private SIZE_PX = 1000000;
  private RESET_MS = 1000;

  private container: HTMLElement;
  private callback: (x: number, y: number) => void;

  private lastScrollUpdate = 0;
  private resetNext = false;
  private lastScrollLeft: number = 0;
  private lastScrollTop: number = 0;

  private panActive = false;
  private panLastCursorX = 0;

  /**
   * Creates a new ScrollSensor.
   * @param container The container element. The overflow should be "scroll" and the scrollbar should be hidden. The child element should have the dimensions 1000000x1000000px.
   * @param callback A function to be called after each scroll event, with the relative change in x and y.
   */
  constructor(container: HTMLElement, callback: (dx: number, dy: number) => void, enableMouseControls = true) {
    this.container = container;
    this.callback = callback;

    // Scroll events
    this.resetNext = true;
    this.container.addEventListener("scroll", () => {
      this.update();
    });

    // Mouse controls
    if (enableMouseControls) {
      container.addEventListener("mousedown", (event) => {
        if (event.shiftKey) return;
        this.panActive = true;
        let x = event.clientX - container.getBoundingClientRect().x;
        this.panLastCursorX = x;
      });
      container.addEventListener("mouseleave", () => {
        this.panActive = false;
      });
      container.addEventListener("mouseup", () => {
        this.panActive = false;
      });
      container.addEventListener("mousemove", (event) => {
        if (this.panActive) {
          let cursorX = event.clientX - container.getBoundingClientRect().x;
          callback(this.panLastCursorX - cursorX, 0);
          this.panLastCursorX = cursorX;
        }
      });
    }
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
