// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// In-page live connection UI (works the same in Electron and Lite):
// - ConnectDialog: File -> Connect... (Cmd/Ctrl+K). Pick a registered source, enter an address, or pick a
//   recent server. Styled like the Preferences prompt.
// - LiveStatusPill: title-bar pill with three separate indicators (backend, car, sim), plus a popover with
//   details, sim controls (only when the backend has sim endpoints) and connect/disconnect.

import type { LapSettings } from "../../hub/LapService";
import ScrollSensor, { ScrollSensorMouseControl } from "../../hub/ScrollSensor";
import { Gate, gateAt, LapResult, Point } from "../laps/LapEngine";
import { Units } from "../units";
import { panMargin, scrollZoomPan } from "./FieldZoomPan";
import TabRenderer from "./TabRenderer";
function viridis(value: number): string {
  const stops = [
    [68, 1, 84],
    [59, 82, 139],
    [33, 145, 140],
    [94, 201, 98],
    [253, 231, 37]
  ];
  const x = Math.max(0, Math.min(1, value)) * 4,
    i = Math.min(3, Math.floor(x));
  return `rgb(${stops[i].map((v, j) => Math.round(v + (stops[i + 1][j] - v) * (x - i))).join(",")})`;
}
export type LapCommand = {
  map: boolean;
  result: LapResult;
  settings: LapSettings;
  field: string;
  unit: string;
  values: number[];
  selected: number | null;
  reference: number | null;
  overlays: number[];
  time: number | null;
  version: number;
  metrics: number[][];
};
const colors = ["#58a7ff", "#f4b860", "#72d6a0", "#d49bff", "#ff8c9c", "#70d6de"];
const duration = (t: number) =>
  Number.isFinite(t) ? `${Math.floor(t / 60)}:${(t % 60).toFixed(3).padStart(6, "0")}` : "—";
export default class LapRenderer implements TabRenderer {
  private toolbar: HTMLElement;
  private content: HTMLElement;
  private canvas: HTMLCanvasElement;
  private traceLayer = document.createElement("canvas");
  private mapView: HTMLElement;
  private scroll: HTMLElement;
  private scrollSensor: ScrollSensor;
  private message: HTMLElement;
  private command?: LapCommand;
  private last = "";
  private lastDraw = "";
  private lastTrace = "";
  private toolbarKey = "";
  private zoom = 1;
  private pan: [number, number] = [0, 0];
  private baseScale = 1;
  private range: [number, number] = [NaN, NaN];
  private transform = (p: Point) => p;
  private inverse = (p: Point) => p;
  private dragging?: { index: number; endpoint: "a" | "b"; gate: Gate };
  private dragMoved = false;
  private pressed?: Point;
  private pressing = false;
  constructor(
    private root: HTMLElement,
    private interactive = true
  ) {
    root.classList.add("lap-view");
    this.toolbar = document.createElement("div");
    this.toolbar.className = "lap-toolbar";
    if (!interactive) this.toolbar.style.display = "none";
    this.content = document.createElement("div");
    this.content.className = "lap-content";
    root.append(this.toolbar, this.content);

    // Same elements and scroll sensor as the 2D Field
    this.canvas = document.createElement("canvas");
    this.canvas.className = "field-2d-canvas";
    this.canvas.setAttribute("aria-label", "Track map; click to seek, drag gate endpoints to edit");
    const container = document.createElement("div");
    container.className = "field-2d-canvas-container";
    container.append(this.canvas);
    this.scroll = document.createElement("div");
    this.scroll.className = "field-2d-scroll";
    this.scroll.tabIndex = -1;
    const scrollContent = document.createElement("div");
    scrollContent.className = "field-2d-scroll-content";
    this.scroll.append(scrollContent);
    this.mapView = document.createElement("div");
    this.mapView.className = "lap-map";
    this.mapView.append(container, this.scroll);
    this.message = document.createElement("p");
    this.message.className = "lap-empty";
    this.scrollSensor = new ScrollSensor(
      this.scroll,
      (dx, dy, isPan, cursorX, cursorY) => {
        this.zoom = scrollZoomPan(
          this.zoom,
          this.pan,
          dx,
          dy,
          isPan,
          cursorX - this.scroll.clientWidth / 2,
          cursorY - this.scroll.clientHeight / 2,
          this.baseScale
        );
        window.requestAnimationFrame(() => {
          if (this.command?.map) this.draw();
        });
      },
      ScrollSensorMouseControl.PanXY
    );

    // Gate endpoints take the drag before the scroll sensor can pan. A click without a drag moves the cursor.
    const point = (e: PointerEvent) => {
      const rect = this.scroll.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    this.scroll.addEventListener(
      "pointerdown",
      (e) => {
        if (!this.command || !this.interactive || e.button !== 0) return;
        const p = point(e);
        this.pressed = p;
        this.dragMoved = false;
        this.dragging = this.endpointAt(p);
        if (this.dragging) {
          e.preventDefault();
          this.scroll.setPointerCapture(e.pointerId);
        }
      },
      { capture: true }
    );
    this.scroll.addEventListener("pointermove", (e) => {
      if (!this.command || !this.interactive) return;
      const p = point(e);
      if (this.dragging) {
        this.dragMoved ||= Math.hypot(p.x - this.pressed!.x, p.y - this.pressed!.y) >= 4;
        if (this.dragMoved) {
          this.dragging.gate[this.dragging.endpoint] = this.inverse(p);
          this.draw();
        }
      } else this.scroll.style.cursor = this.endpointAt(p) ? "move" : "";
    });
    this.scroll.addEventListener("pointerup", (e) => {
      const p = point(e),
        dragged = this.dragging && this.dragMoved;
      if (dragged) {
        // A moved line may now cross the track the other way, so its direction is worked out again.
        const { a, b } = this.dragging!.gate;
        this.action({ type: "gate", index: this.dragging!.index, gate: { a, b } });
      } else if (this.command && this.pressed && Math.hypot(p.x - this.pressed.x, p.y - this.pressed.y) < 4) {
        let best = Infinity,
          time = 0;
        for (const s of this.command.result.samples) {
          const q = this.transform(s),
            d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < best) {
            best = d;
            time = s.t;
          }
        }
        if (best < 40) this.action({ type: "seek", time });
      }
      this.dragging = undefined;
      this.pressed = undefined;
    });
    // A rebuild mid-click would take away the row or checkbox being clicked.
    this.content.addEventListener("pointerdown", () => (this.pressing = true));
    for (const end of ["pointerup", "pointercancel", "pointerleave"])
      this.content.addEventListener(end, () => (this.pressing = false));
  }
  /** Gates on the map: the start/finish line, sectors, and the finish line in autocross. */
  private gates(): (Gate | undefined)[] {
    const c = this.command!;
    return [
      c.result.gate,
      ...(c.settings.config.sectors ?? []),
      c.settings.config.mode === "autocross" ? c.settings.config.finish : undefined
    ];
  }
  private endpointAt(p: Point): LapRenderer["dragging"] {
    const gates = this.gates();
    for (let index = 0; index < gates.length; index++) {
      const g = gates[index];
      if (!g) continue;
      for (const endpoint of ["a", "b"] as const) {
        const q = this.transform(g[endpoint]);
        if (Math.hypot(p.x - q.x, p.y - q.y) < 14)
          return { index: index === gates.length - 1 ? -2 : index - 1, endpoint, gate: structuredClone(g) };
      }
    }
  }
  private action(detail: unknown) {
    if (this.interactive) this.root.dispatchEvent(new CustomEvent("lap-action", { detail, bubbles: true }));
  }
  private button(parent: HTMLElement, text: string, fn: () => void) {
    const b = document.createElement("button");
    b.textContent = text;
    b.onclick = fn;
    parent.append(b);
    return b;
  }
  render(command: LapCommand) {
    this.command = command;
    const key = JSON.stringify([
      command.version,
      command.field,
      command.reference,
      command.overlays,
      command.selected,
      command.map,
      command.settings
    ]);
    // Rebuilding would take the focus from a field being edited, but a clicked button shouldn't hold back the result.
    const editing = this.toolbar.contains(document.activeElement) && document.activeElement?.matches("input, select");
    if (this.last !== key && !editing && !this.pressing) {
      this.last = key;
      this.build();
    }
    this.scrollSensor.periodic();
    if (command.map) this.draw();
  }
  private build() {
    this.lastDraw = "";
    const setupOpen = this.toolbar.querySelector("details")?.open ?? false;
    const c = this.command!;
    const scrollTop = this.content.scrollTop,
      scrollLeft = this.content.scrollLeft;
    const toolbarKey = JSON.stringify([c.field, c.unit, c.map, c.settings]);
    if (toolbarKey !== this.toolbarKey) {
      this.toolbarKey = toolbarKey;
      this.toolbar.replaceChildren();
      const label = document.createElement("span");
      label.textContent =
        (c.map ? "Colour: " : "Metrics: ") +
        (c.field.split("/").at(-1) || (c.map ? "laps, or drag a numeric field here" : "drag a numeric field")) +
        (c.unit ? ` [${c.unit}]` : "");
      label.title = c.field;
      this.toolbar.append(label);
      if (c.field) this.button(this.toolbar, "Clear field", () => this.action({ type: "field", field: "" }));
      const details = document.createElement("details"),
        summary = document.createElement("summary");
      details.open = setupOpen;
      summary.textContent = "Lap setup";
      details.append(summary);
      const panel = document.createElement("div");
      panel.className = "lap-setup";
      details.append(panel);
      this.toolbar.append(details);
      const setting = (key: string, title: string, value: unknown, options?: string[]) => {
        const l = document.createElement("label");
        l.textContent = title;
        const input = options ? document.createElement("select") : document.createElement("input");
        if (input instanceof HTMLSelectElement) input.classList.add("mv-select");
        if (input instanceof HTMLSelectElement) options!.forEach((v) => input.add(new Option(v, v)));
        input.value = String(value ?? "");
        input.onchange = () => this.action({ type: "setting", key, value: input.value });
        l.append(input);
        panel.append(l);
      };
      setting("mode", "Event", c.settings.config.mode ?? "circuit", [
        "circuit",
        "accel",
        "skidpad",
        "autocross",
        "endurance"
      ]);
      setting("radius", "Wheel radius [m]", c.settings.radius);
      setting("ratio", "Motor / wheel ratio", c.settings.ratio);
      setting("minTime", "Minimum lap [s]", c.settings.config.minTime ?? 20);
      setting("length", "Reference length [m]", c.settings.config.length);
      setting("fractions", "Sector fractions", (c.settings.config.fractions ?? [1 / 3, 2 / 3]).join(","));
      setting("manual", "Manual splits [log seconds]", c.settings.config.manual?.join(","));
      this.button(panel, "Split at cursor", () => this.action({ type: "marker" }));
      this.button(panel, "Auto start gate", () => this.action({ type: "auto" }));
      const addGate = (index: number) => {
        const c = this.command!,
          gate = c.time === null ? undefined : gateAt(c.result.samples, c.time);
        if (gate) this.action({ type: "gate", index, gate });
      };
      this.button(panel, "Add sector at cursor", () => addGate(c.settings.config.sectors?.length ?? 0));
      this.button(panel, "Set start/finish at cursor", () => addGate(-1));
      // Only autocross ends a run on a separate line.
      if (c.settings.config.mode === "autocross") this.button(panel, "Set finish at cursor", () => addGate(-2));
    }
    if (c.map) {
      // The scroll sensor loses its position if the map leaves the page.
      if (this.mapView.parentElement !== this.content) this.content.replaceChildren(this.mapView, this.message);
      this.message.textContent =
        !c.result.samples.length || !c.settings.latitude || !c.settings.longitude
          ? "Open a log or connect to telemetry with GPS. Add latitude and longitude to the Position source list."
          : "";
      return;
    }
    this.content.replaceChildren();
    if (!c.result.laps.some((l) => l.valid)) {
      const p = document.createElement("p");
      p.className = "lap-empty";
      p.textContent = "No laps found from the lap counter, beacon or GPS. Add manual splits under Lap setup.";
      this.content.append(p);
    }
    const signed = (v: number) => (Number.isFinite(v) ? (v > 0 ? "+" : "") + v.toFixed(3) : "—");
    const table = document.createElement("table");
    table.className = "lap-table";
    this.content.append(table);
    const row = (texts: string[]) => {
      const r = table.insertRow();
      texts.forEach((t) => (r.insertCell().textContent = t));
      return r;
    };
    const sectors = Math.max(3, ...c.result.laps.map((l) => l.sectors.length));
    const head = row([
      "Overlay",
      "Ref",
      "Lap / stint",
      "Time",
      ...Array.from({ length: sectors }, (_, i) => `S${i + 1}`),
      c.reference === null ? "Δ to ref" : `Δ to L${c.reference}`,
      "Source / status",
      "Min",
      "Max",
      "Avg"
    ]);
    head.className = "lap-heading";
    const refLap = c.result.laps.find((l) => l.index === c.reference),
      refTime = refLap ? refLap.end - refLap.start : NaN;
    let previousBest = Infinity;
    c.result.laps.forEach((lap, i) => {
      const time = lap.end - lap.start;
      const r = row([
        "",
        "",
        `${lap.index} / ${lap.stint}`,
        duration(time),
        ...Array.from({ length: sectors }, (_, j) => duration(lap.sectors[j])),
        lap.valid && lap.index !== c.reference ? signed(time - refTime) : lap.index === c.reference ? "ref" : "—",
        `${lap.source} · ${lap.label}${lap.valid ? "" : " (excluded)"}`,
        ...c.metrics[i].map((v) => (Number.isFinite(v) ? v.toFixed(2) : "—"))
      ]);
      r.cells[sectors + 5].className = "lap-source";
      r.onclick = () => this.action({ type: "lap", index: lap.index });
      r.tabIndex = 0;
      r.onkeydown = (e) => {
        if (e.key === "Enter") r.click();
      };
      if (lap.index === c.selected) r.classList.add("lap-selected");
      if (lap.valid && time < previousBest) {
        r.cells[3].className = "lap-personal";
        r.cells[3].textContent += " PB";
        previousBest = time;
      }
      if (lap.index === c.result.best) {
        r.cells[3].className = "lap-best";
        if (!r.cells[3].textContent!.endsWith(" SB"))
          r.cells[3].textContent = r.cells[3].textContent!.replace(/ PB$/, "") + " SB";
      }
      lap.sectors.forEach((t, j) => {
        if (lap.valid && t === c.result.theoretical[j]) r.cells[4 + j].className = "lap-best";
      });
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "mv-checkbox";
      checkbox.checked = c.overlays.includes(lap.index);
      checkbox.setAttribute("aria-label", `Overlay lap ${lap.index}`);
      checkbox.onclick = (e) => e.stopPropagation();
      checkbox.onchange = () =>
        this.action({
          type: "overlay",
          indices: checkbox.checked ? [...c.overlays, lap.index] : c.overlays.filter((x) => x !== lap.index)
        });
      r.cells[0].append(checkbox);
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.className = "mv-radio";
      radio.name = "reference-lap";
      radio.checked = c.reference === lap.index;
      radio.setAttribute("aria-label", `Reference lap ${lap.index}`);
      radio.onclick = (e) => e.stopPropagation();
      radio.onchange = () => this.action({ type: "reference", index: lap.index });
      r.cells[1].append(radio);
      c.metrics[i].forEach((v, j) => {
        const all = c.metrics.map((m) => m[j]).filter(Number.isFinite),
          min = Math.min(...all),
          max = Math.max(...all);
        if (Number.isFinite(v) && max > min)
          r.cells[sectors + 6 + j].style.backgroundColor = `rgba(88,167,255,${0.05 + (0.2 * (v - min)) / (max - min)})`;
      });
    });
    row([
      "",
      "",
      "Theoretical",
      duration(c.result.theoretical.reduce((a, b) => a + b, 0)),
      ...c.result.theoretical.map(duration)
    ]).className = "lap-best";
    const hint = document.createElement("p");
    hint.className = "lap-hint";
    hint.textContent =
      "Select a row to seek · choose reference and overlays for Line Graph · purple: session best · green: improved personal best. Partial / invalid laps excluded from bests. Drag a numeric field here for metrics.";
    this.content.append(hint);
    this.content.scrollTop = scrollTop;
    this.content.scrollLeft = scrollLeft;
  }
  private draw() {
    const c = this.command!,
      ss = c.result.samples,
      ctx = this.canvas.getContext("2d")!;
    const w = Math.max(1, this.content.clientWidth),
      h = Math.max(1, this.content.clientHeight),
      ratio = window.devicePixelRatio,
      dark = matchMedia("(prefers-color-scheme: dark)").matches;
    const traceKey = JSON.stringify([
      c.version,
      c.field,
      c.selected,
      c.reference,
      c.overlays,
      c.values.length,
      w,
      h,
      ratio,
      this.zoom,
      this.pan,
      dark
    ]);
    // Satellites have no hint, and their selection can't answer the sensor's question about live time.
    const hint = this.interactive && !this.scrollSensor.shouldHideHint();
    const drawKey = JSON.stringify([traceKey, c.time, this.dragging, hint]);
    if (drawKey === this.lastDraw) return;
    this.lastDraw = drawKey;
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.canvas.width = w * ratio;
    this.canvas.height = h * ratio;
    if (!ss.length) return;
    ctx.scale(ratio, ratio);
    ctx.lineCap = "round";

    // Fit the track with a margin, then apply zoom and pan the same way as the 2D Field
    let xmin = Infinity,
      xmax = -Infinity,
      ymin = Infinity,
      ymax = -Infinity;
    for (const p of ss) {
      xmin = Math.min(xmin, p.x);
      xmax = Math.max(xmax, p.x);
      ymin = Math.min(ymin, p.y);
      ymax = Math.max(ymax, p.y);
    }
    const margin = Math.max(xmax - xmin, ymax - ymin, 1) * 0.08,
      trackWidth = xmax - xmin + margin * 2,
      trackHeight = ymax - ymin + margin * 2;
    this.baseScale = Math.min(w / trackWidth, h / trackHeight);
    // A track rarely has the canvas's shape, so the limits come from the canvas. Zooming in lets both axes pan.
    const scale = this.baseScale * this.zoom,
      marginX = panMargin(w * this.zoom, w, scale),
      marginY = panMargin(h * this.zoom, h, scale);
    this.pan[0] = Math.max(-marginX, Math.min(marginX, this.pan[0]));
    this.pan[1] = Math.max(-marginY, Math.min(marginY, this.pan[1]));
    const centerX = (xmin + xmax) / 2 + this.pan[0],
      centerY = (ymin + ymax) / 2 - this.pan[1];
    this.transform = (p) => ({ x: w / 2 + (p.x - centerX) * scale, y: h / 2 - (p.y - centerY) * scale });
    this.inverse = (p) => ({ x: (p.x - w / 2) / scale + centerX, y: -(p.y - h / 2) / scale + centerY });

    // Only the cursor moves on hover, so the trace is kept until it changes
    if (traceKey !== this.lastTrace) {
      this.lastTrace = traceKey;
      this.drawTrace(w, h, ratio, dark);
    }
    ctx.drawImage(this.traceLayer, 0, 0, w, h);

    const text = dark ? "#eee" : "#222";
    ctx.font = "12px system-ui";
    if (c.field) {
      const unit = Units.ALL_UNITS[c.unit]?.suffix ?? c.unit,
        [min, max] = this.range;
      ctx.fillStyle = text;
      ctx.textAlign = "left";
      ctx.fillText(c.field.split("/").at(-1)! + (unit ? ` [${unit}]` : ""), 16, 24);
      for (let i = 0; i < 160; i++) {
        ctx.fillStyle = viridis(i / 159);
        ctx.fillRect(16 + i, 32, 1, 10);
      }
      ctx.fillStyle = text;
      ctx.fillText(Number.isFinite(min) ? min.toFixed(1) : "—", 16, 56);
      ctx.textAlign = "right";
      ctx.fillText(Number.isFinite(max) ? max.toFixed(1) : "—", 176, 56);
    }
    ctx.textAlign = "left";
    const gates = this.gates();
    gates.forEach((g, index) => {
      if (!g) return;
      const finish = index === gates.length - 1,
        gate = this.dragging?.index === (finish ? -2 : index - 1) ? this.dragging.gate : g,
        a = this.transform(gate.a),
        b = this.transform(gate.b);
      ctx.strokeStyle = index ? "#f4b860" : "#72d6a0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      for (const p of [a, b]) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.stroke();
      }
      // The label sits past the end of the line, clear of the trace.
      const n = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      ctx.fillStyle = text;
      ctx.textAlign = a.x >= b.x ? "left" : "right";
      ctx.textBaseline = "middle";
      ctx.fillText(
        finish ? "Finish" : index ? `S${index}` : "Start / finish",
        a.x + ((a.x - b.x) / n) * 12,
        a.y + ((a.y - b.y) / n) * 12
      );
      ctx.textBaseline = "alphabetic";
    });
    if (c.time !== null) {
      let lo = 0,
        hi = ss.length - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >>> 1;
        if (ss[mid].t <= c.time) lo = mid;
        else hi = mid;
      }
      const q = this.transform(c.time - ss[lo].t < ss[hi].t - c.time ? ss[lo] : ss[hi]);
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(q.x, q.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    if (hint) {
      ctx.fillStyle = text;
      ctx.textAlign = "center";
      ctx.fillText("Scroll to zoom · Drag to pan · Click the trace to move the cursor", w / 2, h - 16);
    }
  }
  /** Laps in the Line Graph overlay share its colours. A dropped field colours the whole trace instead. */
  private drawTrace(w: number, h: number, ratio: number, dark: boolean) {
    const c = this.command!,
      ss = c.result.samples,
      laps = c.result.laps;
    this.traceLayer.width = w * ratio;
    this.traceLayer.height = h * ratio;
    const ctx = this.traceLayer.getContext("2d")!;
    ctx.scale(ratio, ratio);
    ctx.lineCap = "round";
    const overlaid = laps.filter((l) => l.valid && (c.overlays.includes(l.index) || l.index === c.reference));
    let min = Infinity,
      max = -Infinity;
    if (c.field)
      for (const v of c.values)
        if (Number.isFinite(v)) {
          min = Math.min(min, v);
          max = Math.max(max, v);
        }
    this.range = [min, max];
    const neutral = dark ? "#9a9a9a" : "#777";
    const paths = new Map<string, { alpha: number; color: string; width: number; path: Path2D }>();
    const stride = Math.max(1, Math.floor(ss.length / 60000));
    let lapCursor = 0;
    for (let i = stride; i < ss.length; i += stride) {
      const p0 = ss[i - stride],
        p1 = ss[i];
      if (p1.t - p0.t > 1 || Math.hypot(p1.x - p0.x, p1.y - p0.y) > 40) continue;
      while (lapCursor < laps.length - 1 && p1.t >= laps[lapCursor].end) lapCursor++;
      const lap = laps[lapCursor];
      let color = neutral,
        alpha = laps.length && !c.field ? 0.4 : 1;
      if (c.field && Number.isFinite(c.values[i])) {
        // Rounded to 64 steps so segments of a colour share a path
        color = viridis(Math.round(((c.values[i] - min) / (max - min || 1)) * 63) / 63);
      } else if (lap && overlaid.includes(lap)) {
        color = colors[overlaid.indexOf(lap) % colors.length];
        alpha = 1;
      }
      if (c.selected !== null && lap?.index !== c.selected) alpha = 0.3;
      const width = lap?.index === c.selected ? 4 : 2,
        key = `${alpha}|${width}|${color}`;
      let entry = paths.get(key);
      if (!entry) paths.set(key, (entry = { alpha, color, width, path: new Path2D() }));
      const a = this.transform(p0),
        b = this.transform(p1);
      entry.path.moveTo(a.x, a.y);
      entry.path.lineTo(b.x, b.y);
    }
    // Dim laps go underneath
    for (const e of [...paths.values()].sort((a, b) => a.alpha - b.alpha || a.width - b.width)) {
      ctx.globalAlpha = e.alpha;
      ctx.lineWidth = e.width;
      ctx.strokeStyle = e.color;
      ctx.stroke(e.path);
    }
  }
  saveState() {
    return { zoom: this.zoom, pan: this.pan };
  }
  restoreState(state: unknown) {
    if (typeof state !== "object" || state === null) return;
    if ("zoom" in state && typeof state.zoom === "number") this.zoom = state.zoom;
    if ("pan" in state && Array.isArray(state.pan) && state.pan.length === 2) this.pan = state.pan as [number, number];
  }
  getAspectRatio() {
    return null;
  }
}
