import ScrollSensor from "../../hub/ScrollSensor";
import { SelectionMode } from "../Selection";
import { ValueScaler, calcAxisStepSize, clampValue, cleanFloat, scaleValue, shiftColor } from "../util";
import TabRenderer from "./TabRenderer";

export default class LineGraphRenderer implements TabRenderer {
  private Y_STEP_TARGET_PX = 50;
  private X_STEP_TARGET_PX = 100;
  private MAX_DECIMAL_VALUE = 1e9; // After this, stop trying to display fractional values

  private ROOT: HTMLElement;
  private CANVAS: HTMLCanvasElement;
  private SCROLL_OVERLAY: HTMLElement;

  private hasController: boolean;
  private scrollSensor: ScrollSensor;
  private mouseDownX = 0;
  private grabZoomActive = false;
  private grabZoomStartTime = 0;
  private lastCursorX: number | null = null;
  private lastHoveredTime: number | null = null;
  private didClearHoveredTime = false;

  constructor(root: HTMLElement, hasController: boolean) {
    this.hasController = hasController;
    this.ROOT = root;
    this.CANVAS = root.getElementsByClassName("line-graph-canvas")[0] as HTMLCanvasElement;
    this.SCROLL_OVERLAY = root.getElementsByClassName("line-graph-scroll")[0] as HTMLCanvasElement;

    // Hover handling
    this.SCROLL_OVERLAY.addEventListener("mousemove", (event) => {
      this.lastCursorX = event.clientX - this.ROOT.getBoundingClientRect().x;
    });
    this.SCROLL_OVERLAY.addEventListener("mouseleave", () => {
      this.lastCursorX = null;
      window.selection.setHoveredTime(null);
    });

    // Selection handling
    this.SCROLL_OVERLAY.addEventListener("mousedown", (event) => {
      this.mouseDownX = event.clientX - this.SCROLL_OVERLAY.getBoundingClientRect().x;
      if (event.shiftKey && this.lastHoveredTime !== null) {
        this.grabZoomActive = true;
        this.grabZoomStartTime = this.lastHoveredTime;
      }
    });
    this.SCROLL_OVERLAY.addEventListener("mousemove", () => {
      if (this.grabZoomActive && this.lastHoveredTime !== null) {
        window.selection.setGrabZoomRange([this.grabZoomStartTime, this.lastHoveredTime]);
      }
    });
    this.SCROLL_OVERLAY.addEventListener("mouseup", () => {
      if (this.grabZoomActive) {
        window.selection.finishGrabZoom();
        this.grabZoomActive = false;
      }
    });
    this.SCROLL_OVERLAY.addEventListener("mouseleave", () => {
      if (this.grabZoomActive) {
        window.selection.setGrabZoomRange(null);
        this.grabZoomActive = false;
      }
    });
    this.SCROLL_OVERLAY.addEventListener("click", (event) => {
      if (Math.abs(event.clientX - this.SCROLL_OVERLAY.getBoundingClientRect().x - this.mouseDownX) <= 5) {
        let hoveredTime = this.lastHoveredTime;
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
      if (root.hidden) return;
      window.selection.applyTimelineScroll(dx, dy, this.SCROLL_OVERLAY.clientWidth);
    });
  }

  getAspectRatio(): number | null {
    return null;
  }

  render(command: LineGraphRendererCommand): void {
    this.scrollSensor.periodic();

    // Initial setup and scaling
    const timeRange = command.timeRange;
    const devicePixelRatio = window.devicePixelRatio;
    let context = this.CANVAS.getContext("2d") as CanvasRenderingContext2D;
    let width = this.CANVAS.clientWidth;
    let height = this.CANVAS.clientHeight;
    let light = !window.matchMedia("(prefers-color-scheme: dark)").matches;
    this.CANVAS.width = width * devicePixelRatio;
    this.CANVAS.height = height * devicePixelRatio;
    context.scale(devicePixelRatio, devicePixelRatio);
    context.clearRect(0, 0, width, height);
    context.font = "12px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont";

    // Calculate vertical layout (based on discrete fields)
    let graphTop = this.hasController ? 8 : 20;
    this.SCROLL_OVERLAY.style.top = graphTop.toString() + "px";
    let graphHeight = height - graphTop - 35;
    if (graphHeight < 1) graphHeight = 1;
    let graphHeightOpen =
      graphHeight - command.discreteFields.length * 20 - (command.discreteFields.length > 0 ? 5 : 0);
    if (graphHeightOpen < 1) graphHeightOpen = 1;

    // Calculate Y step sizes
    let leftStepSize = calcAxisStepSize(command.leftRange, graphHeightOpen, this.Y_STEP_TARGET_PX);
    let rightStepSize = calcAxisStepSize(command.rightRange, graphHeightOpen, this.Y_STEP_TARGET_PX);

    // Calculate horizontal layout
    let getTextWidth = (range: [number, number], stepSize: number): number => {
      let length = 0;
      let value = Math.floor(range[1] / stepSize) * stepSize;
      while (value > range[0]) {
        length = Math.max(length, context.measureText(cleanFloat(value).toString()).width);
        value -= stepSize;
      }
      return Math.ceil(length / 10) * 10;
    };
    let graphLeft = 25 + (command.showLeftAxis ? getTextWidth(command.leftRange, leftStepSize) : 0);
    let graphRight = 25 + (command.showRightAxis ? getTextWidth(command.rightRange, rightStepSize) : 0);
    let graphWidth = width - graphLeft - graphRight;
    if (graphWidth < 1) graphWidth = 1;

    // Calculate X step size
    let timeStepSize = calcAxisStepSize(command.timeRange, graphWidth, this.X_STEP_TARGET_PX);

    // Update scroll layout
    this.SCROLL_OVERLAY.style.left = graphLeft.toString() + "px";
    this.SCROLL_OVERLAY.style.right = graphRight.toString() + "px";

    // Render discrete data
    let discreteBorders: number[] = [];
    context.globalAlpha = 1;
    context.textAlign = "left";
    context.textBaseline = "middle";
    context.lineWidth = 1;
    context.lineCap = "round";
    command.discreteFields.forEach((field, renderIndex) => {
      context.beginPath();
      let toggle = field.toggleReference;
      let skippedSamples = 0;
      discreteBorders = discreteBorders.concat(field.timestamps);
      for (let i = 0; i < field.timestamps.length; i++) {
        i += skippedSamples;
        if (i >= field.timestamps.length) break;

        let startX = scaleValue(field.timestamps[i], timeRange, [graphLeft, graphLeft + graphWidth]);
        let endX: number;
        skippedSamples = 0;
        while (
          (endX = scaleValue(field.timestamps[i + skippedSamples + 1], timeRange, [
            graphLeft,
            graphLeft + graphWidth
          ])) -
            startX <
            1 / devicePixelRatio &&
          i + skippedSamples + 1 < field.timestamps.length
        ) {
          skippedSamples++;
          toggle = !toggle;
        }
        if (i + skippedSamples === field.timestamps.length - 1) {
          endX = graphLeft + graphWidth;
        }
        if (endX > graphLeft + graphWidth) endX = graphLeft + graphWidth;
        let topY = graphTop + graphHeight - 20 - renderIndex * 20;

        // Draw shape
        toggle = !toggle;
        if (field.type === "stripes") {
          context.fillStyle = toggle ? shiftColor(field.color, -30) : shiftColor(field.color, 30);
          context.fillRect(startX, topY, endX - startX, 15);
        } else {
          let startY = toggle ? topY + 15 : topY;
          let endY = toggle ? topY : topY + 15;
          context.moveTo(startX, startY);
          context.lineTo(startX, endY);
          context.lineTo(endX, endY);
        }

        // Draw text
        let adjustedStartX = startX < graphLeft ? graphLeft : startX;
        if (endX - adjustedStartX > 10) {
          if (field.type === "stripes") {
            context.fillStyle = toggle ? shiftColor(field.color, 130) : shiftColor(field.color, -130);
          } else {
            context.fillStyle = field.color;
          }
          context.fillText(
            field.values[i + skippedSamples],
            adjustedStartX + 5,
            topY + 15 / 2,
            endX - adjustedStartX - 10
          );
        }
      }
      if (field.type === "graph") {
        context.strokeStyle = field.color;
        context.stroke();
      }
    });

    // Render continuous data
    const xScaler = new ValueScaler(timeRange, [graphLeft, graphLeft + graphWidth]);
    let drawNumericFields = (fields: LineGraphRendererCommand_NumericField[], yRange: [number, number]) => {
      const yScaler = new ValueScaler(yRange, [graphTop + graphHeightOpen, graphTop]);
      fields.forEach((field) => {
        context.strokeStyle = field.color;
        context.fillStyle = field.color;
        context.lineCap = "round";
        switch (field.size) {
          case "normal":
            context.lineWidth = 1;
            break;
          case "bold":
            context.lineWidth = 3;
            break;
          case "verybold":
            context.lineWidth = 6;
            break;
        }

        switch (field.type) {
          case "stepped":
            context.beginPath();
            context.moveTo(graphLeft + graphWidth, yScaler.calculate(field.values[field.values.length - 1]));
            let i = field.values.length - 1;
            while (true) {
              let x = xScaler.calculate(field.timestamps[i]);

              // Render start of current data point
              let value = field.values[i];
              context.lineTo(x, yScaler.calculate(value));

              // Find previous data point and vertical range
              let currentX = Math.floor(x * devicePixelRatio);
              let newX = currentX;
              let vertRange = [value, value];
              do {
                i--;
                let value = field.values[i];
                if (value < vertRange[0]) vertRange[0] = value;
                if (value > vertRange[1]) vertRange[1] = value;
                newX = Math.floor(xScaler.calculate(field.timestamps[i]) * devicePixelRatio);
              } while (i >= 0 && newX >= currentX); // Compile values to vertical range until the pixel changes
              if (i < 0) break;

              // Render vertical range
              context.moveTo(x, yScaler.calculate(vertRange[0]));
              context.lineTo(x, yScaler.calculate(vertRange[1]));

              // Move to end of previous data point
              context.moveTo(x, yScaler.calculate(field.values[i]));
            }
            context.stroke();
            break;

          case "smooth":
            context.beginPath();
            for (let i = 0; i < field.timestamps.length; i++) {
              let x = xScaler.calculate(field.timestamps[i]);
              let y = yScaler.calculate(field.values[i]);
              if (i === 0) {
                context.moveTo(x, y);
              } else {
                context.lineTo(x, y);
              }
            }
            context.stroke();
            break;

          case "points":
            let radius = field.size === "normal" ? 1 : 2;
            for (let i = 0; i < field.timestamps.length; i++) {
              let x = xScaler.calculate(field.timestamps[i]);
              let y = yScaler.calculate(field.values[i]);
              context.beginPath();
              context.arc(x, y, radius, 0, Math.PI * 2);
              context.fill();
            }
            break;
        }
      });
    };
    if (command.priorityAxis === "left") {
      drawNumericFields(command.rightFields, command.rightRange);
      drawNumericFields(command.leftFields, command.leftRange);
    } else {
      drawNumericFields(command.leftFields, command.leftRange);
      drawNumericFields(command.rightFields, command.rightRange);
    }

    // Update hovered time based on graph layout
    if (this.lastCursorX === null || this.lastCursorX < graphLeft || this.lastCursorX > graphLeft + graphWidth) {
      if (!this.didClearHoveredTime) {
        window.selection.setHoveredTime(null);
        this.didClearHoveredTime = true;
      }
    } else {
      let hoveredTime = scaleValue(this.lastCursorX, [graphLeft, graphLeft + graphWidth], command.timeRange);
      let nearestDiscreteBorder = discreteBorders.reduce((prev, border) => {
        if (Math.abs(hoveredTime - border) < Math.abs(hoveredTime - prev)) {
          return border;
        } else {
          return prev;
        }
      }, Infinity);
      if (isFinite(nearestDiscreteBorder)) {
        let nearestDiscreteBorderX = scaleValue(nearestDiscreteBorder, command.timeRange, [
          graphLeft,
          graphLeft + graphWidth
        ]);
        if (Math.abs(nearestDiscreteBorderX - this.lastCursorX) < 5) {
          hoveredTime = nearestDiscreteBorder;
        }
      }
      window.selection.setHoveredTime(hoveredTime);
      this.didClearHoveredTime = false;
      command.hoveredTime = hoveredTime;
    }

    // Draw grab zoom range
    if (command.grabZoomRange !== null) {
      let startX = scaleValue(command.grabZoomRange[0], command.timeRange, [graphLeft, graphLeft + graphWidth]);
      let endX = scaleValue(command.grabZoomRange[1], command.timeRange, [graphLeft, graphLeft + graphWidth]);

      context.globalAlpha = 0.25;
      context.fillStyle = "yellow";
      context.fillRect(startX, graphTop, endX - startX, graphHeight);
      context.globalAlpha = 1;
    }

    // Use similar logic as main axes but with an extra decimal point of precision to format the popup timestamps
    let formatMarkedTimestampText = (time: number): string => {
      let fractionDigits = Math.max(0, -Math.floor(Math.log10(timeStepSize / 10)));
      return time.toFixed(fractionDigits) + "s";
    };

    // Write formatted timestamp popups to graph view
    let writeCenteredTime = (text: string, x: number, alpha: number, drawRect: boolean) => {
      context.globalAlpha = alpha;
      context.strokeStyle = light ? "#222" : "#eee";
      context.fillStyle = light ? "#222" : "#eee";
      let textSize = context.measureText(text);
      context.clearRect(
        x - textSize.actualBoundingBoxLeft - 5,
        graphTop,
        textSize.width + 10,
        textSize.actualBoundingBoxDescent + 10
      );
      if (drawRect) {
        context.strokeRect(
          x - textSize.actualBoundingBoxLeft - 5,
          graphTop,
          textSize.width + 10,
          textSize.actualBoundingBoxDescent + 10
        );
      }

      context.fillText(text, x, graphTop + 5);
      context.globalAlpha = 1;
    };

    // Draw a vertical dotted line at the time
    let markTime = (time: number, alpha: number) => {
      if (time >= timeRange[0] && time <= timeRange[1]) {
        context.globalAlpha = alpha;
        context.lineWidth = 1;
        context.setLineDash([5, 5]);
        context.strokeStyle = light ? "#222" : "#eee";
        context.fillStyle = light ? "#222" : "#eee";

        let x = scaleValue(time, timeRange, [graphLeft, graphLeft + graphWidth]);
        context.beginPath();
        context.moveTo(x, graphTop);
        context.lineTo(x, graphTop + graphHeight);
        context.stroke();
        context.setLineDash([]);
        context.globalAlpha = 1;
      }
    };

    // Render selected times
    context.textBaseline = "top";
    context.textAlign = "center";
    let selectedX =
      command.selectedTime === null
        ? null
        : scaleValue(command.selectedTime, timeRange, [graphLeft, graphLeft + graphWidth]);
    let hoveredX =
      command.hoveredTime === null
        ? null
        : scaleValue(command.hoveredTime, timeRange, [graphLeft, graphLeft + graphWidth]);
    let selectedText = command.selectedTime === null ? null : formatMarkedTimestampText(command.selectedTime);
    let hoveredText = command.hoveredTime === null ? null : formatMarkedTimestampText(command.hoveredTime);
    if (command.hoveredTime !== null) markTime(command.hoveredTime!, 0.35);
    if (command.selectionMode === SelectionMode.Static || command.selectionMode === SelectionMode.Playback) {
      // There is a valid selected time
      command.selectedTime = command.selectedTime as number;
      selectedX = selectedX as number;
      selectedText = selectedText as string;
      markTime(command.selectedTime!, 1);
      if (command.hoveredTime !== null && command.hoveredTime !== command.selectedTime) {
        // Write both selected and hovered time, figure out layout
        command.hoveredTime = command.hoveredTime as number;
        hoveredX = hoveredX as number;
        hoveredText = hoveredText as string;

        let deltaText = "\u0394" + formatMarkedTimestampText(command.hoveredTime - command.selectedTime);
        let xSpace = clampValue(selectedX, graphLeft, graphLeft + graphWidth) - hoveredX;
        let textHalfWidths =
          (context.measureText(selectedText).width + 10) / 2 + (context.measureText(hoveredText).width + 10) / 2 + 4;
        let deltaTextMetrics = context.measureText(deltaText);
        let deltaWidth = deltaTextMetrics.width + 10 + 4;
        let offsetAmount = textHalfWidths - Math.abs(xSpace);
        let doesDeltaFit = deltaWidth <= Math.abs(xSpace);
        if (doesDeltaFit) {
          // Enough space for delta text
          offsetAmount = textHalfWidths + deltaWidth - Math.abs(xSpace);

          // Draw connecting line between two cursors, overlapping parts will be automatically cleared
          let centerY = (deltaTextMetrics.actualBoundingBoxDescent + 10) / 2 + graphTop;
          context.globalAlpha = 0.35;
          context.lineWidth = 1;
          context.setLineDash([]);
          context.strokeStyle = light ? "#222" : "#eee";
          context.beginPath();
          context.moveTo(selectedX, centerY);
          context.lineTo(hoveredX, centerY);
          context.stroke();
          context.globalAlpha = 1;

          // Draw delta text
          let deltaX = (selectedX + hoveredX) / 2;
          if (command.selectedTime < timeRange[0]) {
            deltaX = Math.max(deltaX, graphLeft + deltaWidth / 2 - 2);
          } else if (command.selectedTime > timeRange[1]) {
            deltaX = Math.min(deltaX, graphLeft + graphWidth - deltaWidth / 2 + 2);
          }
          writeCenteredTime(deltaText, deltaX, 0.35, false);
        }
        if (offsetAmount > 0) {
          selectedX = selectedX + (offsetAmount / 2) * (selectedX < hoveredX ? -1 : 1);
          hoveredX = hoveredX - (offsetAmount / 2) * (selectedX < hoveredX ? -1 : 1);
        }
        writeCenteredTime(selectedText, selectedX, 1, true);
        writeCenteredTime(hoveredText, hoveredX, 0.35, true);
      } else {
        // No valid hovered time, only write selected time
        writeCenteredTime(selectedText, selectedX, 1, true);
      }
    } else if (command.hoveredTime !== null) {
      // No valid selected time, only write hovered time
      writeCenteredTime(hoveredText!, hoveredX!, 0.35, true);
    }
    this.lastHoveredTime = command.hoveredTime;

    // Clear overflow & draw graph outline
    context.lineWidth = 1;
    context.strokeStyle = light ? "#222" : "#eee";
    context.clearRect(0, 0, width, graphTop);
    context.clearRect(0, graphTop + graphHeight, width, height - graphTop - graphHeight);
    context.clearRect(0, graphTop, graphLeft, graphHeight);
    context.clearRect(graphLeft + graphWidth, graphTop, width - graphLeft - graphWidth, graphHeight);
    context.strokeRect(graphLeft, graphTop, graphWidth, graphHeight);

    // Render Y axes
    context.lineWidth = 1;
    context.strokeStyle = light ? "#222" : "#eee";
    context.fillStyle = light ? "#222" : "#eee";
    context.textBaseline = "middle";

    if (command.showLeftAxis) {
      context.textAlign = "right";
      let stepPos = Math.floor(command.leftRange[1] / leftStepSize) * leftStepSize;
      while (true) {
        let y = scaleValue(stepPos, command.leftRange, [graphTop + graphHeightOpen, graphTop]);
        if (y > graphTop + graphHeight) break;

        context.globalAlpha = 1;
        if (Math.abs(stepPos) < this.MAX_DECIMAL_VALUE || stepPos % 1 === 0) {
          let value = Math.abs(stepPos) < this.MAX_DECIMAL_VALUE ? cleanFloat(stepPos) : Math.round(stepPos);
          context.fillText(value.toString(), graphLeft - 15, y);
          context.beginPath();
          context.moveTo(graphLeft, y);
          context.lineTo(graphLeft - 5, y);
          context.stroke();
        }

        if (command.priorityAxis === "left") {
          context.globalAlpha = 0.1;
          context.beginPath();
          context.moveTo(graphLeft, y);
          context.lineTo(graphLeft + graphWidth, y);
          context.stroke();
        }

        stepPos -= leftStepSize;
      }
    }

    if (command.showRightAxis) {
      context.textAlign = "left";
      let stepPos = Math.floor(command.rightRange[1] / rightStepSize) * rightStepSize;
      while (true) {
        let y = scaleValue(stepPos, command.rightRange, [graphTop + graphHeightOpen, graphTop]);
        if (y > graphTop + graphHeight) break;

        context.globalAlpha = 1;
        if (Math.abs(stepPos) < this.MAX_DECIMAL_VALUE || stepPos % 1 === 0) {
          let value = Math.abs(stepPos) < this.MAX_DECIMAL_VALUE ? cleanFloat(stepPos) : Math.round(stepPos);
          context.fillText(value.toString(), graphLeft + graphWidth + 15, y);
          context.beginPath();
          context.moveTo(graphLeft + graphWidth, y);
          context.lineTo(graphLeft + graphWidth + 5, y);
          context.stroke();
        }

        if (command.priorityAxis === "right") {
          context.globalAlpha = 0.1;
          context.beginPath();
          context.moveTo(graphLeft, y);
          context.lineTo(graphLeft + graphWidth, y);
          context.stroke();
        }

        stepPos -= rightStepSize;
      }
    }

    // Render x axis
    context.textAlign = "center";
    let stepPos = Math.ceil(cleanFloat(timeRange[0] / timeStepSize)) * timeStepSize;
    while (true) {
      let x = scaleValue(stepPos, timeRange, [graphLeft, graphLeft + graphWidth]);

      // Clean up final x (scroll can cause rounding problems)
      if (x - graphLeft - graphWidth > 1) {
        break;
      } else if (x - graphLeft - graphWidth > 0) {
        x = graphLeft + graphWidth;
      }

      let text = cleanFloat(stepPos).toString() + "s";

      context.globalAlpha = 1;
      context.fillText(text, x, graphTop + graphHeight + 15);
      context.beginPath();
      context.moveTo(x, graphTop + graphHeight);
      context.lineTo(x, graphTop + graphHeight + 5);
      context.stroke();

      context.globalAlpha = 0.1;
      context.beginPath();
      context.moveTo(x, graphTop);
      context.lineTo(x, graphTop + graphHeight);
      context.stroke();

      stepPos += timeStepSize;
    }
  }

  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {}
}

export type LineGraphRendererCommand = {
  timeRange: [number, number];
  selectionMode: SelectionMode;
  selectedTime: number | null;
  hoveredTime: number | null;
  grabZoomRange: [number, number] | null;

  leftRange: [number, number];
  rightRange: [number, number];
  showLeftAxis: boolean;
  showRightAxis: boolean;
  priorityAxis: "left" | "right";
  leftFields: LineGraphRendererCommand_NumericField[];
  rightFields: LineGraphRendererCommand_NumericField[];
  discreteFields: LineGraphRendererCommand_DiscreteField[];
};

export type LineGraphRendererCommand_NumericField = {
  timestamps: number[];
  values: number[];
  color: string;
  type: "smooth" | "stepped" | "points";
  size: "normal" | "bold" | "verybold";
};

export type LineGraphRendererCommand_DiscreteField = {
  timestamps: number[];
  values: string[];
  color: string;
  type: "stripes" | "graph";
  toggleReference: boolean;
};
