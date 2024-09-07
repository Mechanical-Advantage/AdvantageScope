import { getRobotStateRanges } from "../shared/log/LogUtil";
import { calcAxisStepSize, clampValue, cleanFloat, scaleValue } from "../shared/util";
import ScrollSensor from "./ScrollSensor";

export default class Timeline {
  private STEP_TARGET_PX = 125;

  private CONTAINER: HTMLElement;
  private CANVAS: HTMLCanvasElement;
  private SCROLL_OVERLAY: HTMLElement;

  private scrollSensor: ScrollSensor;
  private mouseDownX = 0;
  private grabZoomActive = false;
  private grabZoomStartTime = 0;
  private lastCursorX: number | null = null;

  constructor(container: HTMLElement) {
    this.CONTAINER = container;
    this.CANVAS = container.getElementsByClassName("timeline-canvas")[0] as HTMLCanvasElement;
    this.SCROLL_OVERLAY = container.getElementsByClassName("timeline-scroll")[0] as HTMLCanvasElement;

    // Hover handling
    this.SCROLL_OVERLAY.addEventListener("mousemove", (event) => {
      this.lastCursorX = event.clientX - this.SCROLL_OVERLAY.getBoundingClientRect().x;
    });
    this.SCROLL_OVERLAY.addEventListener("mouseleave", () => {
      this.lastCursorX = null;
      window.selection.setHoveredTime(null);
    });

    // Selection handling
    this.SCROLL_OVERLAY.addEventListener("mousedown", (event) => {
      this.mouseDownX = event.clientX - this.SCROLL_OVERLAY.getBoundingClientRect().x;
      let hoveredTime = window.selection.getHoveredTime();
      if (event.shiftKey && hoveredTime !== null) {
        this.grabZoomActive = true;
        this.grabZoomStartTime = hoveredTime;
      }
    });
    this.SCROLL_OVERLAY.addEventListener("mousemove", () => {
      let hoveredTime = window.selection.getHoveredTime();
      if (this.grabZoomActive && hoveredTime !== null) {
        window.selection.setGrabZoomRange([this.grabZoomStartTime, hoveredTime]);
      }
    });
    this.SCROLL_OVERLAY.addEventListener("mouseup", () => {
      if (this.grabZoomActive) {
        window.selection.finishGrabZoom();
        this.grabZoomActive = false;
      }
    });
    this.SCROLL_OVERLAY.addEventListener("click", (event) => {
      if (Math.abs(event.clientX - this.SCROLL_OVERLAY.getBoundingClientRect().x - this.mouseDownX) <= 5) {
        let hoveredTime = window.selection.getHoveredTime();
        if (hoveredTime) {
          window.selection.setSelectedTime(hoveredTime);
        }
      }
    });
    this.SCROLL_OVERLAY.addEventListener("contextmenu", () => {
      window.selection.goIdle();
    });

    // Scroll handling
    this.scrollSensor = new ScrollSensor(this.SCROLL_OVERLAY, (dx: number, dy: number) => {
      if (this.isHidden()) return;
      window.selection.applyTimelineScroll(dx, dy, this.SCROLL_OVERLAY.clientWidth);
    });
  }

  private isHidden() {
    return this.CONTAINER.clientHeight === 0;
  }

  periodic() {
    if (this.isHidden()) return;
    this.scrollSensor.periodic();

    // Initial setup and scaling
    const devicePixelRatio = window.devicePixelRatio;
    let context = this.CANVAS.getContext("2d") as CanvasRenderingContext2D;
    let width = this.CONTAINER.clientWidth;
    let height = this.CONTAINER.clientHeight;
    let light = !window.matchMedia("(prefers-color-scheme: dark)").matches;
    let timeRange = window.selection.getTimelineRange();
    this.CANVAS.width = width * devicePixelRatio;
    this.CANVAS.height = height * devicePixelRatio;
    context.scale(devicePixelRatio, devicePixelRatio);
    context.clearRect(0, 0, width, height);
    context.font = "200 12px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont";

    // Calculate step size
    let stepSize = calcAxisStepSize(timeRange, width, this.STEP_TARGET_PX);

    // Draw state ranges
    context.lineWidth = 1;
    let rangeBorders: number[] = [];
    getRobotStateRanges(window.log).forEach((range) => {
      if (range.mode === "disabled") return;
      let startTime = range.start;
      let endTime = range.end === undefined ? timeRange[1] : range.end;
      let isAuto = range.mode === "auto";

      if (isAuto) {
        context.fillStyle = light ? "#00cc00" : "#00bb00";
      } else {
        context.fillStyle = light ? "#00aaff" : "#0000bb";
      }
      let startX = clampValue(scaleValue(startTime, timeRange, [0, width]), 0, width);
      let endX = clampValue(scaleValue(endTime, timeRange, [0, width]), 0, width);
      context.fillRect(startX, 0, endX - startX, height);

      if (!rangeBorders.includes(range.start)) {
        rangeBorders.push(range.start);
      }
      if (range.end !== undefined && !rangeBorders.includes(range.end)) {
        rangeBorders.push(range.end);
      }
    });

    // Draw grab zoom range
    let grabZoomRange = window.selection.getGrabZoomRange();
    if (grabZoomRange !== null) {
      let startX = scaleValue(grabZoomRange[0], timeRange, [0, width]);
      let endX = scaleValue(grabZoomRange[1], timeRange, [0, width]);

      context.globalAlpha = 0.6;
      context.fillStyle = "yellow";
      context.fillRect(startX, 0, endX - startX, height);
      context.globalAlpha = 1;
    }

    // Update hovered time
    if (this.lastCursorX !== null && this.lastCursorX > 0 && this.lastCursorX < width) {
      let cursorTime = scaleValue(this.lastCursorX, [0, width], timeRange);
      let nearestRangeBorder = rangeBorders.reduce((prev, border) => {
        if (Math.abs(cursorTime - border) < Math.abs(cursorTime - prev)) {
          return border;
        } else {
          return prev;
        }
      }, Infinity);
      let nearestRangeBorderX = scaleValue(nearestRangeBorder, timeRange, [0, width]);
      window.selection.setHoveredTime(
        Math.abs(this.lastCursorX - nearestRangeBorderX) < 5 ? nearestRangeBorder : cursorTime
      );
    }

    // Draw a vertical marker line at the time
    let markedXs: number[] = [];
    let markTime = (time: number, alpha: number) => {
      if (time >= timeRange[0] && time <= timeRange[1]) {
        context.globalAlpha = alpha;
        context.lineWidth = 1;
        context.strokeStyle = light ? "#222" : "#eee";

        let x = scaleValue(time, timeRange, [0, width]);
        if (x > 1 && x < width - 1) {
          let triangleSideLength = 6;
          let triangleHeight = 0.5 * Math.sqrt(3) * triangleSideLength;

          markedXs.push(x);
          context.beginPath();
          context.moveTo(x, triangleHeight);
          for (let i = x - triangleSideLength / 2; i <= x + triangleSideLength / 2; i++) {
            context.lineTo(i, -1);
            context.moveTo(x, triangleHeight);
          }
          context.lineTo(x, height - triangleHeight);
          for (let i = x - triangleSideLength / 2; i <= x + triangleSideLength / 2; i++) {
            context.lineTo(i, height + 1);
            context.moveTo(x, height - triangleHeight);
          }
          context.stroke();
        }
        context.globalAlpha = 1;
      }
    };

    // Mark hovered and selected times
    let hoveredTime = window.selection.getHoveredTime();
    let selectedTime = window.selection.getSelectedTime();
    if (hoveredTime !== null) markTime(hoveredTime, 0.5);
    if (selectedTime !== null) markTime(selectedTime, 1);

    // Draw tick marks
    context.lineWidth = 0.5;
    context.strokeStyle = light ? "#222" : "#eee";
    context.fillStyle = light ? "#222" : "#eee";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.globalAlpha = 0.5;
    let stepPos = Math.ceil(cleanFloat(timeRange[0] / stepSize)) * stepSize;
    while (true) {
      let x = scaleValue(stepPos, timeRange, [0, width]);
      if (x > width + 1) {
        break;
      }

      let text = cleanFloat(stepPos).toString() + "s";
      let textWidth = context.measureText(text).width;
      let textX = clampValue(x, textWidth / 2 + 3, width - textWidth / 2 - 3);
      let textXRange = [textX - textWidth / 2, textX + textWidth / 2];
      let markDistance = markedXs.reduce((min, x) => {
        let dist = 0;
        if (x < textXRange[0]) dist = textXRange[0] - x;
        if (x > textXRange[1]) dist = x - textXRange[1];
        return dist < min ? dist : min;
      }, Infinity);
      context.globalAlpha = clampValue(scaleValue(markDistance, [0, 20], [0.2, 0.5]), 0, 1);
      context.fillText(text, textX, height / 2);

      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, 8);
      context.moveTo(x, height - 8);
      context.lineTo(x, height);
      context.stroke();
      context.globalAlpha = 0.5;

      stepPos += stepSize;
    }
    context.globalAlpha = 1;
  }
}
