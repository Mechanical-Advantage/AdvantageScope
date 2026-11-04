// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import ScrollSensor from "../../hub/ScrollSensor";
import { ensureThemeContrast } from "../Colors";
import LineGraphFilter from "../LineGraphFilter";
import { inlineStatus } from "../RenderGuard";
import { SelectionMode } from "../Selection";
import { Units } from "../units";
import { calcAxisStepSize, clampValue, cleanFloat, scaleValue, shiftColor, ValueScaler } from "../util";
import TabRenderer from "./TabRenderer";

import { prepareTrace, TraceGap } from "../TraceGaps";
import { niceTicks } from "../laps/LapAnalysis";
import { interpolate } from "../laps/LapEngine";
import { LapViewport } from "../laps/LapViewport";

export default class LineGraphRenderer implements TabRenderer {
  private events = new AbortController();
  dispose() {
    this.events.abort();
  }

  private Y_STEP_TARGET_PX = 50;
  private X_STEP_TARGET_PX = 100;
  private MAX_DECIMAL_VALUE = 1e9; // After this, stop trying to display fractional values

  private ROOT: HTMLElement;
  private CANVAS: HTMLCanvasElement;
  private SCROLL_OVERLAY: HTMLElement;
  private HELP_OVERLAY: HTMLElement;

  private hasController: boolean;
  private isFadingOut = false;
  private zoomInAccumulator = 0;
  private scrollSensor: ScrollSensor;
  private lastRenderState = "";
  private lapViewport = new LapViewport();
  private mouseDownX = 0;
  private grabZoomActive = false;
  private grabZoomStartTime = 0;
  private lastCursorX: number | null = null;
  private lastHoveredTime: number | null = null;
  private lastCursorInRect = false;
  private didClearHoveredTime = false;

  constructor(root: HTMLElement, hasController: boolean) {
    this.hasController = hasController;
    this.ROOT = root;
    this.CANVAS = root.getElementsByClassName("line-graph-canvas")[0] as HTMLCanvasElement;
    this.SCROLL_OVERLAY = root.getElementsByClassName("line-graph-scroll")[0] as HTMLCanvasElement;

    // Hover handling
    window.addEventListener(
      "mousemove",
      (event) => {
        if (this.ROOT.hidden || !this.grabZoomActive) return;
        this.lastCursorX = event.clientX - this.ROOT.getBoundingClientRect().x;
      },
      { signal: this.events.signal }
    );
    this.SCROLL_OVERLAY.addEventListener("mousemove", (event) => {
      this.lastCursorX = event.clientX - this.ROOT.getBoundingClientRect().x;
      this.lastCursorInRect = true;
    });
    this.SCROLL_OVERLAY.addEventListener("mouseleave", () => {
      this.lastCursorX = null;
      this.lastCursorInRect = false;
      window.selection.setHoveredTime(null);
    });

    // Selection handling
    this.SCROLL_OVERLAY.addEventListener("mousedown", (event) => {
      this.mouseDownX = event.clientX - this.SCROLL_OVERLAY.getBoundingClientRect().x;
      if (!this.lapViewport.active && event.shiftKey && this.lastHoveredTime !== null) {
        this.grabZoomActive = true;
        this.grabZoomStartTime = this.lastHoveredTime;
      }
    });
    window.addEventListener(
      "mousemove",
      () => {
        if (this.ROOT.hidden) return;
        if (this.grabZoomActive && this.lastHoveredTime !== null) {
          window.selection.setGrabZoomRange([this.grabZoomStartTime, this.lastHoveredTime]);
        }
      },
      { signal: this.events.signal }
    );
    window.addEventListener(
      "mouseup",
      () => {
        if (this.ROOT.hidden) return;
        if (this.grabZoomActive) {
          window.selection.finishGrabZoom();
          this.grabZoomActive = false;
          if (!this.lastCursorInRect) {
            this.lastCursorX = null;
            window.selection.setHoveredTime(null);
          }
        }
      },
      { signal: this.events.signal }
    );
    this.SCROLL_OVERLAY.addEventListener("click", (event) => {
      if (Math.abs(event.clientX - this.SCROLL_OVERLAY.getBoundingClientRect().x - this.mouseDownX) <= 5) {
        let hoveredTime = this.lastHoveredTime;
        if (hoveredTime !== null) {
          window.selection.setSelectedTime(hoveredTime);
        }
      }
    });
    this.SCROLL_OVERLAY.addEventListener("contextmenu", () => {
      window.selection.goIdle();
    });

    this.HELP_OVERLAY = root.getElementsByClassName("line-graph-help")[0] as HTMLElement;

    // Scroll handling
    this.scrollSensor = new ScrollSensor(
      this.SCROLL_OVERLAY,
      (dx: number, dy: number, isPan: boolean, _cursorX: number, _cursorY: number) => {
        if (root.hidden) return;
        const width = this.SCROLL_OVERLAY.clientWidth;
        if (this.lapViewport.active) {
          this.lapViewport.scroll(dx, isPan ? 0 : dy, width, _cursorX / width);
        } else {
          window.selection.applyTimelineScroll(dx, isPan ? 0 : dy, width);
        }

        if (window.preferences && !window.preferences.hasScrolledLineGraph && !this.isFadingOut) {
          if (dy < 0) {
            this.zoomInAccumulator += dy;
            if (this.zoomInAccumulator <= -200) {
              this.isFadingOut = true;
              this.HELP_OVERLAY.classList.add("fading-out");
              setTimeout(() => {
                window.sendMainMessage("update-preferences", { hasScrolledLineGraph: true });
              }, 1000);
            }
          }
        }
      }
    );
  }

  /** Shades link outages grey with their duration, plus backfill progress after reconnecting. */
  private drawOutages(
    context: CanvasRenderingContext2D,
    timeRange: [number, number],
    xScaler: ValueScaler,
    graphTop: number,
    graphHeight: number,
    graphLeft: number,
    graphWidth: number
  ) {
    const outages = window.liveStatus?.getOutages?.() ?? [];
    if (outages.length === 0) return;
    const backfill = window.liveStatus?.getBackfill?.() ?? null;
    const edge = window.selection?.getCurrentLiveTime?.() ?? timeRange[1];
    outages.forEach((outage) => {
      const end = outage.end ?? Math.max(outage.start, edge);
      if (end < timeRange[0] || outage.start > timeRange[1]) return;
      const x0 = Math.max(graphLeft, xScaler.calculate(outage.start));
      const x1 = Math.min(graphLeft + graphWidth, xScaler.calculate(end));
      if (x1 - x0 < 1) return;
      context.save();
      context.fillStyle = "rgba(128, 128, 128, 0.3)";
      context.fillRect(x0, graphTop, x1 - x0, graphHeight);
      context.strokeStyle = "rgba(128, 128, 128, 0.8)";
      context.lineWidth = 1;
      context.strokeRect(x0, graphTop, x1 - x0, graphHeight);
      const lines = [`offline ${Math.round(end - outage.start)} s`];
      context.fillStyle = window.matchMedia("(prefers-color-scheme: dark)").matches ? "#ddd" : "#333";
      context.font = "bold 14px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont";
      context.textAlign = "center";
      context.textBaseline = "top";
      lines.forEach((line, i) => {
        if (context.measureText(line).width < x1 - x0 || i === 0)
          context.fillText(line, (x0 + x1) / 2, graphTop + 8 + i * 18);
      });
      context.restore();
    });
    // Progress stays readable even when the outage occupies only a few pixels.
    // In Trackside the banner carries backfill progress, so it never collides with the axis title.
    if (backfill && !document.body.classList.contains("has-severity-banner")) {
      context.save();
      context.font = "bold 14px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont";
      context.textAlign = "right";
      context.textBaseline = "top";
      context.fillStyle = window.matchMedia("(prefers-color-scheme: dark)").matches ? "#ddd" : "#333";
      context.fillText(`backfilling… ${backfill.done}/${backfill.total}`, graphLeft + graphWidth - 8, graphTop + 8);
      context.restore();
    }
  }

  getAspectRatio(): number | null {
    return null;
  }

  private getAxisValueText(value: number, units: Units.UnitConfig | null, filter: LineGraphFilter): string {
    let valueClean = Math.abs(value) < this.MAX_DECIMAL_VALUE ? cleanFloat(value) : Math.round(value);
    let output = valueClean.toString();
    return output;
  }

  render(command: LineGraphRendererCommand): void {
    inlineStatus(this.ROOT, command.message ?? "");
    // Commands carry the full lap extent; navigation belongs to this graph, including satellites.
    command = { ...command, timeRange: this.lapViewport.update(command.lapMode ?? "time", command.timeRange) };
    this.scrollSensor.periodic();

    // Update help overlay
    if (this.HELP_OVERLAY) {
      const hasScrolled = (window.preferences?.hasScrolledLineGraph ?? false) || this.scrollSensor.shouldHideHint();
      this.HELP_OVERLAY.style.display = hasScrolled || command.message ? "none" : "flex";
      if (hasScrolled) {
        this.isFadingOut = false;
        this.zoomInAccumulator = 0;
        this.HELP_OVERLAY.classList.remove("fading-out");
      }
    }

    // Initial setup and scaling
    const timeRange = command.timeRange;
    const devicePixelRatio = window.devicePixelRatio;
    let context = this.CANVAS.getContext("2d") as CanvasRenderingContext2D;
    let width = this.CANVAS.clientWidth;
    let height = this.CANVAS.clientHeight;
    let light = !window.matchMedia("(prefers-color-scheme: dark)").matches;

    // Exit if render state unchanged
    let renderState: any[] = [
      width,
      height,
      light,
      devicePixelRatio,
      command.timeRange,
      command.selectionMode,
      command.selectedTime,
      command.hoveredTime,
      command.grabZoomRange,
      command.leftRange,
      command.rightRange,
      command.showLeftAxis,
      command.showRightAxis,
      command.leftTitle,
      command.rightTitle,
      command.leftUnits,
      command.rightUnits,
      command.priorityAxis,
      this.lastCursorX,
      window.preferences?.timestamps,
      command.displayOffset,
      command.xUnit,
      command.lapLabels,
      command.lapValues,
      command.deltaStrip?.readout,
      command.sectorMarks,
      command.deltaStrip?.range,
      command.deltaStrip?.fields.map((f) => [f.values.length, f.color, f.size]),
      command.thresholds,
      command.leftFields.map((field) => [
        field.values.length,
        field.color,
        field.type,
        field.size,
        field.dim,
        field.gaps
      ]),
      command.discreteFields.map((field) => [
        field.values.length,
        field.color,
        field.type,
        field.toggleReference,
        field.colorMap ? field.values : null // Specific values affect color-mapped fields so serialize full state
      ]),
      command.rightFields.map((field) => [
        field.values.length,
        field.color,
        field.type,
        field.size,
        field.dim,
        field.gaps
      ]),
      command.alerts.map((row) => row.map((alert) => [alert.type, alert.text, alert.range]))
    ];
    let renderStateString = JSON.stringify(renderState);
    if (renderStateString === this.lastRenderState) {
      return;
    }
    this.lastRenderState = renderStateString;

    // Apply setup and scaling
    this.CANVAS.width = width * devicePixelRatio;
    this.CANVAS.height = height * devicePixelRatio;
    context.scale(devicePixelRatio, devicePixelRatio);
    context.clearRect(0, 0, width, height);
    const trackside = document.body.classList.contains("trackside-layout");
    context.font = `${trackside ? 14 : 12}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont`;

    // Calculate vertical layout (based on discrete fields)
    // Lap legend: one opaque row per lap above the plot, so it can never sit on traces
    const LEGEND_ROW = 15;
    const legendRows = command.lapLabels?.length ?? 0;
    let graphTop = 32 + (legendRows ? legendRows * LEGEND_ROW + 4 : 0);
    this.SCROLL_OVERLAY.style.top = graphTop.toString() + "px";
    let graphHeight = height - graphTop - 35;
    if (graphHeight < 1) graphHeight = 1;
    let discreteRowCount = command.discreteFields.length + command.alerts.length;
    let graphHeightOpen = graphHeight - discreteRowCount * 20 - (discreteRowCount > 0 ? 5 : 0);
    // Lap mode: a short strip for ΔT under the overlay, sharing the distance axis
    const stripHeight = command.deltaStrip ? Math.max(44, Math.round(graphHeight * 0.22)) : 0;
    const stripGap = stripHeight ? 14 : 0;
    graphHeightOpen -= stripHeight + stripGap;
    if (graphHeightOpen < 1) graphHeightOpen = 1;

    // Calculate Y step sizes
    let leftStepSize = calcAxisStepSize(command.leftRange, graphHeightOpen, this.Y_STEP_TARGET_PX);
    let rightStepSize = calcAxisStepSize(command.rightRange, graphHeightOpen, this.Y_STEP_TARGET_PX);

    // Calculate horizontal layout
    let getTextWidth = (
      range: [number, number],
      stepSize: number,
      units: Units.UnitConfig | null,
      filter: LineGraphFilter
    ): number => {
      let length = 0;
      let value = Math.floor(range[1] / stepSize) * stepSize;
      for (let ticks = 0; value > range[0] && ticks < 100; ticks++) {
        length = Math.max(length, context.measureText(this.getAxisValueText(value, units, filter)).width);
        value -= stepSize;
      }
      return Math.ceil(length / 10) * 10;
    };
    let graphLeft =
      25 +
      (command.showLeftAxis ? getTextWidth(command.leftRange, leftStepSize, command.leftUnits, command.leftFilter) : 0);
    let graphRight =
      25 +
      (command.showRightAxis
        ? getTextWidth(command.rightRange, rightStepSize, command.rightUnits, command.rightFilter)
        : 0);
    let graphWidth = width - graphLeft - graphRight;
    if (graphWidth < 1) graphWidth = 1;

    // Calculate X step size
    let displayOffset = command.displayOffset;
    let displayTimeRange: [number, number] = [
      command.timeRange[0] + displayOffset,
      command.timeRange[1] + displayOffset
    ];
    let maxTime = Math.max(Math.abs(displayTimeRange[0]), Math.abs(displayTimeRange[1]));
    let intDigits = maxTime > 0 ? Math.log10(maxTime) + 1 : 1;
    let timeSpan = displayTimeRange[1] - displayTimeRange[0];
    let decDigits = timeSpan < 1 && timeSpan > 0 ? -Math.log10(timeSpan) : 0;
    let extraDigits = Math.max(0, intDigits + decDigits - 3);
    let timeStepSize = calcAxisStepSize(displayTimeRange, graphWidth, this.X_STEP_TARGET_PX + extraDigits * 12);

    // Update scroll layout
    this.SCROLL_OVERLAY.style.left = graphLeft.toString() + "px";
    this.SCROLL_OVERLAY.style.right = graphRight.toString() + "px";

    // Keep any message over the plot, clear of the axes (the scroll overlay itself scrolls)
    const status = this.ROOT.querySelector<HTMLElement>(":scope > .telemetry-status");
    if (status) {
      status.style.left = graphLeft.toString() + "px";
      status.style.right = graphRight.toString() + "px";
    }

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
          let baseColor =
            field.colorMap && field.colorMap[field.values[i + skippedSamples]]
              ? field.colorMap[field.values[i + skippedSamples]]
              : field.color;
          context.fillStyle = field.colorMap
            ? baseColor
            : toggle
            ? shiftColor(baseColor, -30)
            : shiftColor(baseColor, 30);
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
          let baseColor =
            field.colorMap && field.colorMap[field.values[i + skippedSamples]]
              ? field.colorMap[field.values[i + skippedSamples]]
              : field.color;
          if (field.type === "stripes") {
            context.fillStyle = field.colorMap
              ? shiftColor(baseColor, light ? -130 : 130)
              : toggle
              ? shiftColor(baseColor, 130)
              : shiftColor(baseColor, -130);
          } else {
            context.fillStyle = baseColor;
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

    // Render alerts
    command.alerts.forEach((alertsRow, rowIndex) => {
      let topY = graphTop + graphHeight - 20 - (command.discreteFields.length + rowIndex) * 20;
      alertsRow.forEach((alert) => {
        let startX = scaleValue(alert.range[0], timeRange, [graphLeft, graphLeft + graphWidth]);
        let endX = scaleValue(alert.range[1], timeRange, [graphLeft, graphLeft + graphWidth]);

        // Draw shape
        let baseColor = "#ffffff";
        let textColor = "#000000";
        switch (alert.type) {
          case "error":
            baseColor = ensureThemeContrast("#ff0000");
            textColor = "#ffeeee";
            break;
          case "warning":
            baseColor = ensureThemeContrast("#ffaa00");
            textColor = "#331100";
            break;
          case "info":
            baseColor = ensureThemeContrast("#0000ff");
            textColor = "#eeeeff";
            break;
        }
        context.fillStyle = baseColor;
        context.fillRect(startX, topY, endX - startX, 15);

        // Draw text
        let adjustedStartX = startX < graphLeft ? graphLeft : startX;
        if (endX - adjustedStartX > 10) {
          context.fillStyle = textColor;
          context.fillText(alert.text, adjustedStartX + 5, topY + 15 / 2, endX - adjustedStartX - 10);
        }
      });
    });

    // Render continuous data
    const xScaler = new ValueScaler(timeRange, [graphLeft, graphLeft + graphWidth]);
    this.drawOutages(context, timeRange, xScaler, graphTop, graphHeight, graphLeft, graphWidth);
    let drawNumericFields = (fields: LineGraphRendererCommand_NumericField[], yRange: [number, number]) => {
      const yScaler = new ValueScaler(yRange, [graphTop + graphHeightOpen, graphTop]);
      fields.forEach((original) => {
        const prepared = prepareTrace(original.timestamps, original.values, original.gaps ?? []);
        const runs: { timestamps: number[]; values: number[]; hold: boolean }[] = [];
        let start = 0;
        for (let i = 0; i < prepared.timestamps.length; i++) {
          if (prepared.gapAfter[i] || i === prepared.timestamps.length - 1) {
            runs.push({
              timestamps: prepared.timestamps.slice(start, i + 1),
              values: prepared.values.slice(start, i + 1),
              hold: i === prepared.timestamps.length - 1 && !original.gaps?.some((g) => g.t1 > prepared.timestamps[i])
            });
            start = i + 1;
          }
        }
        // Points retain stock samples (including missing-value breaks).
        if (original.type === "points" || original.gaps === undefined) {
          runs.splice(0, runs.length, { timestamps: original.timestamps, values: original.values, hold: true });
        }
        runs.forEach((run) => {
          const field = { ...original, ...run };
          if (!field.timestamps.length) return;
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

          context.globalAlpha = field.dim ? 0.25 : 1;
          switch (field.type) {
            case "stepped":
              context.beginPath();
              context.moveTo(
                field.hold ? graphLeft + graphWidth : xScaler.calculate(field.timestamps[field.timestamps.length - 1]),
                yScaler.calculate(field.values[field.values.length - 1])
              );
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
                if (i === 0 || isNaN(field.values[i - 1])) {
                  // NaN marks "no data" (e.g. CAN sentinels): leave a gap instead of bridging it
                  context.moveTo(x, y);
                } else {
                  context.lineTo(x, y);
                }
              }
              context.stroke();
              break;

            case "points":
              let deltaX = graphWidth / Math.max(1, field.timestamps.length - 1);
              let radius = clampValue(Math.log(deltaX * 3.0), 1.0, 5.0);
              context.beginPath();
              for (let i = 0; i < field.timestamps.length; i++) {
                let x = xScaler.calculate(field.timestamps[i]);
                let y = yScaler.calculate(field.values[i]);
                context.moveTo(x + radius, y);
                context.arc(x, y, radius, 0, Math.PI * 2);
              }
              context.fill();
              break;
          }
        });
        if (original.type !== "points" && original.gaps?.length) {
          context.save();
          context.strokeStyle = original.color;
          context.lineWidth = 1;
          context.globalAlpha = (original.dim ? 0.25 : 1) * 0.45;
          context.setLineDash([2, 3]);
          context.beginPath();
          original.gaps.forEach((gap) => {
            if (!Number.isFinite(gap.t1)) return;
            context.moveTo(xScaler.calculate(gap.t0), yScaler.calculate(gap.v0));
            context.lineTo(xScaler.calculate(gap.t1), yScaler.calculate(gap.v1));
          });
          context.stroke();
          context.restore();
        }
      });
    };
    context.save();
    context.beginPath();
    context.rect(graphLeft, graphTop, graphWidth, graphHeightOpen);
    context.clip();
    if (command.priorityAxis === "left") {
      drawNumericFields(command.rightFields, command.rightRange);
      drawNumericFields(command.leftFields, command.leftRange);
    } else {
      drawNumericFields(command.leftFields, command.leftRange);
      drawNumericFields(command.rightFields, command.rightRange);
    }

    context.restore();
    context.setLineDash([]);
    context.globalAlpha = 1;

    // Sector gates on the distance axis (dotted verticals through plot and strip)
    if (command.sectorMarks?.length) {
      context.lineWidth = 1;
      context.textAlign = "center";
      context.setLineDash([2, 3]);
      for (const mark of command.sectorMarks) {
        const x = xScaler.calculate(mark.x);
        if (x < graphLeft || x > graphLeft + graphWidth) continue;
        context.globalAlpha = 0.7;
        context.strokeStyle = light ? "#555" : "#bbb";
        context.beginPath();
        context.moveTo(x, graphTop);
        context.lineTo(x, graphTop + graphHeight);
        context.stroke();
        context.globalAlpha = 1;
        context.fillStyle = light ? "#222" : "#eee";
        context.fillText(mark.label, x, graphTop + graphHeight + 28);
      }
      context.setLineDash([]);
    }
    if (command.deltaStrip) {
      const top = graphTop + graphHeightOpen + stripGap;
      const bottom = top + stripHeight;
      const strip = command.deltaStrip;
      const yScaler = new ValueScaler(strip.range, [bottom, top]);
      context.globalAlpha = 1;
      context.lineWidth = 1;
      context.strokeStyle = light ? "#8886" : "#8888";
      context.strokeRect(graphLeft + 0.5, top + 0.5, graphWidth - 1, bottom - top - 1);
      const zero = yScaler.calculate(0);
      if (zero > top && zero < bottom) {
        context.setLineDash([4, 3]);
        context.beginPath();
        context.moveTo(graphLeft, zero);
        context.lineTo(graphLeft + graphWidth, zero);
        context.stroke();
        context.setLineDash([]);
      }
      context.save();
      context.beginPath();
      context.rect(graphLeft, top, graphWidth, bottom - top);
      context.clip();
      strip.fields.forEach((field) => {
        context.strokeStyle = field.color;
        context.lineWidth = 1;
        context.beginPath();
        for (let i = 0; i < field.timestamps.length; i++) {
          const x = xScaler.calculate(field.timestamps[i]),
            y = yScaler.calculate(field.values[i]);
          if (i === 0 || isNaN(field.values[i - 1])) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.stroke();
      });
      context.restore();
      context.fillStyle = light ? "#222" : "#eee";
      context.textAlign = "left";
      context.fillText(strip.title, graphLeft + 6, top - 6);
      if (strip.readout?.length) {
        // Per-lap ΔT at the cursor, right-aligned on the title row above the strip
        context.textAlign = "right";
        let rx = graphLeft + graphWidth - 2;
        for (let i = strip.readout.length - 1; i >= 0; i--) {
          context.fillStyle = strip.readout[i].color;
          context.fillText(strip.readout[i].text, rx, top - 6);
          rx -= context.measureText(strip.readout[i].text).width + 12;
        }
      }
    }

    for (const threshold of command.thresholds ?? []) {
      const range = threshold.axis === "left" ? command.leftRange : command.rightRange;
      const y = scaleValue(threshold.value, range, [graphTop + graphHeightOpen, graphTop]);
      if (y < graphTop || y > graphTop + graphHeight) continue;
      context.strokeStyle = threshold.critical ? "#e66" : "#dba957";
      context.fillStyle = context.strokeStyle;
      context.lineWidth = 1;
      context.setLineDash([6, 4]);
      context.beginPath();
      context.moveTo(graphLeft, y);
      context.lineTo(graphLeft + graphWidth, y);
      context.stroke();
      context.textAlign = "left";
      context.fillText(threshold.label, graphLeft + 6, y - 5);
    }
    context.setLineDash([]);
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
      window.selection.setHoveredTime(
        command.lapTimeline ? interpolate(command.lapTimeline.x, command.lapTimeline.time, hoveredTime) : hoveredTime
      );
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
    let formatMarkedTimestampText = (time: number, isDelta: boolean = false): string => {
      let displayTime = isDelta ? time : time + displayOffset;
      let fractionDigits = Math.max(0, -Math.floor(Math.log10(timeStepSize / 10)));
      let text = displayTime.toFixed(fractionDigits) + (command.xUnit ?? "s");
      return text;
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

        let deltaText = "\u0394" + formatMarkedTimestampText(command.hoveredTime - command.selectedTime, true);
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
    this.lastHoveredTime =
      command.hoveredTime === null
        ? null
        : command.lapTimeline
        ? interpolate(command.lapTimeline.x, command.lapTimeline.time, command.hoveredTime)
        : command.hoveredTime;

    // Clear overflow & draw graph outline
    context.lineWidth = 1;
    context.strokeStyle = light ? "#222" : "#eee";
    context.clearRect(0, 0, width, graphTop);
    context.clearRect(0, graphTop + graphHeight, width, height - graphTop - graphHeight);
    context.clearRect(0, graphTop, graphLeft, graphHeight);
    context.clearRect(graphLeft + graphWidth, graphTop, width - graphLeft - graphWidth, graphHeight);
    context.strokeRect(graphLeft, graphTop, graphWidth, graphHeight);

    // Labels outside the plot must be painted after clearing overflow.
    if (command.deltaStrip) {
      const top = graphTop + graphHeightOpen + stripGap;
      const strip = command.deltaStrip;
      context.globalAlpha = 1;
      context.fillStyle = light ? "#222" : "#eee";
      context.strokeStyle = light ? "#222" : "#eee";
      context.textAlign = "right";
      context.textBaseline = "middle";
      let lastY = -Infinity;
      const ticks = niceTicks(strip.range[0], strip.range[1], Math.max(2, Math.floor(stripHeight / 16)));
      for (const tick of ticks) {
        const y = scaleValue(tick, strip.range, [top + stripHeight, top]);
        if (y < top + 5 || y > top + stripHeight - 5 || Math.abs(y - lastY) < 12) continue;
        lastY = y;
        context.fillText(cleanFloat(tick).toString(), graphLeft - 10, y);
        context.beginPath();
        context.moveTo(graphLeft, y);
        context.lineTo(graphLeft - 5, y);
        context.stroke();
        if (tick !== 0) {
          context.globalAlpha = 0.1;
          context.beginPath();
          context.moveTo(graphLeft, y);
          context.lineTo(graphLeft + graphWidth, y);
          context.stroke();
          context.globalAlpha = 1;
        }
      }
      // Zero line label inside the strip, at the right end
      const zeroY = scaleValue(0, strip.range, [top + stripHeight, top]);
      if (strip.referenceLabel && zeroY > top && zeroY < top + stripHeight) {
        context.textAlign = "right";
        context.textBaseline = "bottom";
        context.globalAlpha = 0.8;
        context.fillText("0 = " + strip.referenceLabel, graphLeft + graphWidth - 4, zeroY - 2);
        context.globalAlpha = 1;
        context.textBaseline = "middle";
      }
    }

    // Render Y axes
    context.lineWidth = 1;
    context.strokeStyle = light ? "#222" : "#eee";
    context.fillStyle = light ? "#222" : "#eee";
    context.textBaseline = "middle";

    if (command.showLeftAxis) {
      context.textAlign = "right";
      let stepPos = Math.floor(command.leftRange[1] / leftStepSize) * leftStepSize;
      let iterCount = 0;
      while (iterCount++ < 100) {
        let y = scaleValue(stepPos, command.leftRange, [graphTop + graphHeightOpen, graphTop]);
        if (y > graphTop + graphHeightOpen) break;

        context.globalAlpha = 1;
        if (Math.abs(stepPos) < this.MAX_DECIMAL_VALUE || stepPos % 1 === 0) {
          context.fillText(this.getAxisValueText(stepPos, command.leftUnits, command.leftFilter), graphLeft - 15, y);
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
      let iterCount = 0;
      while (iterCount++ < 100) {
        let y = scaleValue(stepPos, command.rightRange, [graphTop + graphHeightOpen, graphTop]);
        if (y > graphTop + graphHeightOpen) break;

        context.globalAlpha = 1;
        if (Math.abs(stepPos) < this.MAX_DECIMAL_VALUE || stepPos % 1 === 0) {
          context.fillText(
            this.getAxisValueText(stepPos, command.rightUnits, command.rightFilter),
            graphLeft + graphWidth + 15,
            y
          );
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

    context.globalAlpha = 1;
    context.fillStyle = light ? "#222" : "#eee";
    context.textAlign = "center";
    for (const mark of command.sectorMarks ?? []) {
      const x = xScaler.calculate(mark.x);
      if (x >= graphLeft && x <= graphLeft + graphWidth) context.fillText(mark.label, x, graphTop + graphHeight + 29);
    }
    context.textAlign = "left";
    context.fillText(command.leftTitle ?? "", graphLeft, 15);
    context.textAlign = "right";
    context.fillText(command.rightTitle ?? "", graphLeft + graphWidth, 15);
    if (command.lapLabels?.length) {
      // One row per lap above the plot: label on the left, value at the cursor on the right
      context.textBaseline = "middle";
      command.lapLabels.forEach((label, i) => {
        const y = 32 + LEGEND_ROW * i + LEGEND_ROW / 2;
        context.fillStyle = label.color;
        context.textAlign = "left";
        context.fillText(label.text, graphLeft, y);
        const value = command.lapValues?.[i];
        if (value) {
          context.textAlign = "right";
          context.fillText(value, graphLeft + graphWidth, y);
        }
      });
      context.fillStyle = light ? "#222" : "#eee";
    }
    // Render x axis
    context.textAlign = "center";
    let stepPos = Math.ceil(cleanFloat(displayTimeRange[0] / timeStepSize)) * timeStepSize;
    let iterCount = 0;
    while (iterCount++ < 100) {
      let x = scaleValue(stepPos, displayTimeRange, [graphLeft, graphLeft + graphWidth]);

      // Clean up final x (scroll can cause rounding problems)
      if (x - graphLeft - graphWidth > 1) {
        break;
      } else if (x - graphLeft - graphWidth > 0) {
        x = graphLeft + graphWidth;
      }

      let text = cleanFloat(stepPos).toString() + (command.xUnit ?? "s");

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
  message?: string;
  lapMode?: string;
  thresholds?: { axis: "left" | "right"; value: number; label: string; critical: boolean }[];
  leftTitle?: string;
  rightTitle?: string;
  xUnit?: "s" | "m";
  lapTimeline?: { x: number[]; time: number[] };
  lapLabels?: { text: string; color: string }[];
  /** Sector gate markers on the x axis (x in axis units). */
  sectorMarks?: { x: number; label: string }[];
  /** Lap mode: ΔT drawn in its own strip under the overlay. */
  deltaStrip?: {
    fields: LineGraphRendererCommand_NumericField[];
    range: [number, number];
    title: string;
    referenceLabel?: string;
    /** ΔT of each lap at the cursor. */
    readout?: { text: string; color: string }[];
  };
  /** Per-lap value(s) at the cursor, aligned with lapLabels. */
  lapValues?: string[];
  timeRange: [number, number];
  displayOffset: number;
  selectionMode: SelectionMode;
  selectedTime: number | null;
  hoveredTime: number | null;
  grabZoomRange: [number, number] | null;

  leftRange: [number, number];
  rightRange: [number, number];
  showLeftAxis: boolean;
  showRightAxis: boolean;
  leftUnits: Units.UnitConfig | null;
  rightUnits: Units.UnitConfig | null;
  leftFilter: LineGraphFilter;
  rightFilter: LineGraphFilter;
  priorityAxis: "left" | "right";
  leftFields: LineGraphRendererCommand_NumericField[];
  rightFields: LineGraphRendererCommand_NumericField[];
  discreteFields: LineGraphRendererCommand_DiscreteField[];
  alerts: LineGraphRendererCommand_AlertSet;
};

export type LineGraphRendererCommand_NumericField = {
  gaps?: TraceGap[];
  dim?: boolean;
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
  colorMap?: { [key: string]: string };
  type: "stripes" | "graph";
  toggleReference: boolean;
};

export type LineGraphRendererCommand_AlertSet = LineGraphRendererCommand_Alert[][];

export type LineGraphRendererCommand_Alert = {
  type: "error" | "warning" | "info";
  text: string;
  range: [number, number];
};
