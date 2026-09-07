// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export default class ScrollSensor {
  private SIZE_PX = 1000000;
  private RESET_MS = 1000;

  private container: HTMLElement;
  private callback: (dx: number, dy: number, isPan: boolean, cursorX: number, cursorY: number) => void;

  private lastScrollUpdate = 0;
  private resetNext = false;
  private lastScrollLeft: number = 0;
  private lastScrollTop: number = 0;

  private panActive = false;
  private panLastCursorX = 0;
  private panLastCursorY = 0;

  private lastCursorX = 0;
  private lastCursorY = 0;

  /**
   * Creates a new ScrollSensor.
   * @param container The container element. The overflow should be "scroll" and the scrollbar should be hidden. The child element should have the dimensions 1000000x1000000px.
   * @param callback A function to be called after each scroll event, with the relative change in x and y.
   * @param mouseControl The mouse control mode for drag-panning.
   */
  constructor(
    container: HTMLElement,
    callback: (dx: number, dy: number, isPan: boolean, cursorX: number, cursorY: number) => void,
    mouseControl: ScrollSensorMouseControl = ScrollSensorMouseControl.PanX
  ) {
    this.container = container;
    this.callback = callback;

    // Scroll events
    this.resetNext = true;
    this.container.addEventListener("scroll", () => {
      this.update();
    });

    // Prevent capturing spacebar
    this.container.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        event.preventDefault();
      }
    });

    // Mouse controls
    if (mouseControl !== ScrollSensorMouseControl.None) {
      container.addEventListener("mousedown", (event) => {
        if (event.shiftKey) return;
        this.panActive = true;
        let x = event.clientX - container.getBoundingClientRect().x;
        let y = event.clientY - container.getBoundingClientRect().y;
        this.panLastCursorX = x;
        this.panLastCursorY = y;
      });
      container.addEventListener("mouseleave", () => {
        this.panActive = false;
      });
      container.addEventListener("mouseup", () => {
        this.panActive = false;
      });
      container.addEventListener("mousemove", (event) => {
        let cursorX = event.clientX - container.getBoundingClientRect().x;
        let cursorY = event.clientY - container.getBoundingClientRect().y;
        this.lastCursorX = cursorX;
        this.lastCursorY = cursorY;

        if (this.panActive) {
          let dx = this.panLastCursorX - cursorX;
          let dy = mouseControl === ScrollSensorMouseControl.PanXY ? this.panLastCursorY - cursorY : 0;
          callback(dx, dy, true, cursorX, cursorY);
          this.panLastCursorX = cursorX;
          this.panLastCursorY = cursorY;
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
    this.callback(dx, dy, false, this.lastCursorX, this.lastCursorY);
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

export enum ScrollSensorMouseControl {
  None,
  PanX,
  PanXY
}
