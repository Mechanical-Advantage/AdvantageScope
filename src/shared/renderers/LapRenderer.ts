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
import { Gate, LapResult, Point } from "../laps/LapEngine";
import TabRenderer from "./TabRenderer";
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
  private command?: LapCommand;
  private last = "";
  private lastDraw = "";
  private transform = (p: Point) => p;
  private inverse = (p: Point) => p;
  private dragging?: { index: number; endpoint: "a" | "b"; gate: Gate };
  constructor(
    private root: HTMLElement,
    private interactive = true
  ) {
    root.classList.add("lap-view");
    this.toolbar = document.createElement("div");
    this.toolbar.className = "lap-toolbar";
    this.content = document.createElement("div");
    this.content.className = "lap-content";
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("aria-label", "Track map; click to seek, drag gate endpoints to edit");
    root.append(this.toolbar, this.content);
    this.canvas.addEventListener("pointerdown", (e) => {
      if (!this.command || !this.interactive) return;
      const rect = this.canvas.getBoundingClientRect(),
        p = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const gates = [
        this.command.result.gate,
        ...(this.command.settings.config.sectors ?? []),
        this.command.settings.config.finish
      ];
      gates.forEach((g, index) => {
        if (g)
          for (const endpoint of ["a", "b"] as const) {
            const q = this.transform(g[endpoint]);
            if (Math.hypot(p.x - q.x, p.y - q.y) < 14)
              this.dragging = {
                index: index === gates.length - 1 ? -2 : index - 1,
                endpoint,
                gate: structuredClone(g)
              };
          }
      });
      if (this.dragging) {
        this.canvas.setPointerCapture(e.pointerId);
        return;
      }
      let best = Infinity,
        time = 0;
      this.command.result.samples.forEach((s) => {
        const q = this.transform(s),
          d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < best) {
          best = d;
          time = s.t;
        }
      });
      if (best < 40) this.action({ type: "seek", time });
    });
    this.canvas.addEventListener("pointermove", (e) => {
      if (!this.dragging) return;
      const r = this.canvas.getBoundingClientRect();
      this.dragging.gate[this.dragging.endpoint] = this.inverse({ x: e.clientX - r.left, y: e.clientY - r.top });
      this.draw();
    });
    this.canvas.addEventListener("pointerup", () => {
      if (this.dragging) {
        this.action({ type: "gate", index: this.dragging.index, gate: this.dragging.gate });
        this.dragging = undefined;
      }
    });
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
    if (this.last !== key) {
      this.last = key;
      this.build();
    }
    if (command.map) this.draw();
  }
  private build() {
    this.lastDraw = "";
    const c = this.command!;
    this.toolbar.replaceChildren();
    this.content.replaceChildren();
    const label = document.createElement("span");
    label.textContent =
      (c.map ? "Colour: " : "Metrics: ") +
      (c.field.split("/").at(-1) || "drag a numeric field") +
      (c.unit ? ` [${c.unit}]` : "");
    label.title = c.field;
    this.toolbar.append(label);
    this.button(this.toolbar, "Clear field", () => this.action({ type: "field", field: "" }));
    const details = document.createElement("details"),
      summary = document.createElement("summary");
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
    for (const key of [
      "latitude",
      "longitude",
      "frontLeft",
      "frontRight",
      "speed",
      "rpm",
      "yaw",
      "counter",
      "beacon"
    ] as const)
      setting(key, key, c.settings[key]);
    setting("radius", "Wheel radius [m]", c.settings.radius);
    setting("ratio", "Motor / wheel ratio", c.settings.ratio);
    setting("minTime", "Minimum lap [s]", c.settings.config.minTime ?? 20);
    setting("length", "Reference length [m]", c.settings.config.length);
    setting("fractions", "Sector fractions", (c.settings.config.fractions ?? [1 / 3, 2 / 3]).join(","));
    setting("manual", "Manual splits [log seconds]", c.settings.config.manual?.join(","));
    this.button(panel, "Split at cursor", () => this.action({ type: "marker" }));
    this.button(panel, "Auto start gate", () => this.action({ type: "auto" }));
    const addGate = (finish: boolean) => {
      const ss = c.result.samples;
      if (!ss.length) return;
      const i = ss.reduce(
          (best, p, j) => (Math.abs(p.t - (c.time ?? 0)) < Math.abs(ss[best].t - (c.time ?? 0)) ? j : best),
          0
        ),
        p = ss[i],
        q = ss[Math.min(i + 1, ss.length - 1)],
        dx = q.x - p.x,
        dy = q.y - p.y,
        n = Math.hypot(dx, dy) || 1;
      this.action({
        type: "gate",
        index: finish ? -2 : c.settings.config.sectors?.length ?? 0,
        gate: {
          a: { x: p.x - (dy / n) * 12, y: p.y + (dx / n) * 12 },
          b: { x: p.x + (dy / n) * 12, y: p.y - (dx / n) * 12 }
        }
      });
    };
    this.button(panel, "Add sector at cursor", () => addGate(false));
    this.button(panel, "Set finish at cursor", () => addGate(true));
    if (c.map) {
      this.content.append(this.canvas);
      if (!c.result.samples.length) {
        const p = document.createElement("p");
        p.className = "lap-empty";
        p.textContent = "Open a log or connect to telemetry with GPS. Set latitude and longitude in Lap setup.";
        this.content.append(p);
      }
      return;
    }
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
      "Δ to best",
      "Source / status",
      "Min",
      "Max",
      "Avg"
    ]);
    head.className = "lap-heading";
    const best = c.result.laps.find((l) => l.index === c.result.best),
      bestTime = best ? best.end - best.start : NaN;
    let previousBest = Infinity;
    c.result.laps.forEach((lap, i) => {
      const time = lap.end - lap.start;
      const r = row([
        "",
        "",
        `${lap.index} / ${lap.stint}`,
        duration(time),
        ...Array.from({ length: sectors }, (_, j) => duration(lap.sectors[j])),
        lap.valid ? (time - bestTime).toFixed(3) : "—",
        `${lap.source} · ${lap.label}${lap.valid ? "" : " (excluded)"}`,
        ...c.metrics[i].map((v) => (Number.isFinite(v) ? v.toFixed(2) : "—"))
      ]);
      r.onclick = () => this.action({ type: "lap", index: lap.index });
      r.tabIndex = 0;
      r.onkeydown = (e) => {
        if (e.key === "Enter") r.click();
      };
      if (lap.index === c.selected) r.classList.add("lap-selected");
      if (lap.valid && time < previousBest) {
        r.cells[3].className = "lap-personal";
        previousBest = time;
      }
      if (lap.index === c.result.best) r.cells[3].className = "lap-best";
      lap.sectors.forEach((t, j) => {
        if (lap.valid && t === c.result.theoretical[j]) r.cells[4 + j].className = "lap-best";
      });
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
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
  }
  private draw() {
    const c = this.command!,
      ss = c.result.samples;
    if (!ss.length) return;
    const drawKey = JSON.stringify([
      c.version,
      c.field,
      c.selected,
      c.time,
      this.content.clientWidth,
      this.content.clientHeight,
      this.dragging
    ]);
    if (drawKey === this.lastDraw) return;
    this.lastDraw = drawKey;
    const rect = this.content.getBoundingClientRect(),
      w = Math.max(1, rect.width),
      h = Math.max(1, rect.height),
      ratio = window.devicePixelRatio;
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.canvas.width = w * ratio;
    this.canvas.height = h * ratio;
    const ctx = this.canvas.getContext("2d")!;
    ctx.scale(ratio, ratio);
    const xs = ss.map((p) => p.x),
      ys = ss.map((p) => p.y),
      xmin = Math.min(...xs),
      xmax = Math.max(...xs),
      ymin = Math.min(...ys),
      ymax = Math.max(...ys),
      scale = Math.min((w - 100) / (xmax - xmin || 1), (h - 110) / (ymax - ymin || 1));
    this.transform = (p) => ({
      x: w / 2 + (p.x - (xmin + xmax) / 2) * scale,
      y: h / 2 - (p.y - (ymin + ymax) / 2) * scale
    });
    this.inverse = (p) => ({
      x: (p.x - w / 2) / scale + (xmin + xmax) / 2,
      y: -(p.y - h / 2) / scale + (ymin + ymax) / 2
    });
    const values = c.values.filter(Number.isFinite),
      min = Math.min(...values),
      max = Math.max(...values);
    const stride = Math.max(1, Math.floor(ss.length / 15000));
    for (let i = stride; i < ss.length; i += stride) {
      const a = this.transform(ss[i - stride]),
        b = this.transform(ss[i]);
      const lap = c.result.laps.find((l) => ss[i].t >= l.start && ss[i].t < l.end);
      ctx.lineWidth = lap?.index === c.selected ? 4 : 2;
      ctx.globalAlpha = c.selected === null || lap?.index === c.selected ? 1 : 0.3;
      ctx.strokeStyle = Number.isFinite(c.values[i])
        ? `hsl(${230 - (230 * (c.values[i] - min)) / (max - min || 1)},75%,62%)`
        : colors[0];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.font = "12px system-ui";
    ctx.fillStyle = matchMedia("(prefers-color-scheme: dark)").matches ? "#eee" : "#222";
    ctx.fillText(
      `${Number.isFinite(min) ? min.toFixed(2) : "—"} → ${Number.isFinite(max) ? max.toFixed(2) : "—"} ${
        c.unit
      } · blue → red`,
      16,
      24
    );
    const gates = [c.result.gate, ...(c.settings.config.sectors ?? []), c.settings.config.finish];
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
      ctx.fillText(finish ? "Finish" : index ? `S${index}` : "Start / finish", a.x + 8, a.y - 8);
    });
    if (c.time !== null) {
      const p = ss.reduce((a, b) => (Math.abs(b.t - c.time!) < Math.abs(a.t - c.time!) ? b : a)),
        q = this.transform(p);
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(q.x, q.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillText("Click trace to seek · drag gate endpoints · drag numeric field to colour", 16, h - 16);
  }
  saveState() {
    return null;
  }
  restoreState() {}
  getAspectRatio() {
    return null;
  }
}
