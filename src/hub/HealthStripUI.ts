// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import {
  HealthStripState,
  HealthTile,
  LatchedHealth,
  defaultHealthTiles,
  evaluateThreshold,
  updateLatch
} from "../shared/HealthStrip";
import { SelectionMode } from "../shared/Selection";
import { channelProfile, convertChannelValue, formatChannelValue } from "../shared/display/ChannelProfile";
import LoggableType from "../shared/log/LoggableType";
import { htmlEncode } from "../shared/util";

export default class HealthStripUI {
  private element = document.createElement("section");
  private editor = document.createElement("dialog");
  private latched = new Map<HealthTile, LatchedHealth>();
  private log = window.log;
  state: HealthStripState = { visible: false, tiles: [], defaultsApplied: false };

  constructor() {
    this.element.className = "health-strip";
    this.element.setAttribute("aria-label", "Vehicle health");
    document.body.append(this.element, this.editor);
    this.editor.className = "health-editor";
    window.addEventListener("drag-update", (event) => {
      const drag = (event as CustomEvent).detail;
      const rect = this.element.getBoundingClientRect();
      const inside =
        this.state.visible &&
        drag.x >= rect.left &&
        drag.x <= rect.right &&
        drag.y >= rect.top &&
        drag.y <= rect.bottom;
      this.element.classList.toggle("drop-target", inside && !drag.end);
      if (inside && drag.end && Array.isArray(drag.data.fields)) {
        drag.data.fields.forEach((path: string) => {
          if (
            !this.state.tiles.some((tile) => tile.path === path) &&
            [LoggableType.Number, LoggableType.String, LoggableType.Boolean].includes(window.log.getType(path)!)
          )
            this.state.tiles.push({ path, label: path.split("/").pop() ?? path, direction: "high" });
        });
        this.render();
      }
    });
    window.setInterval(() => this.render(), 200);
    this.render();
  }
  restore(state?: HealthStripState) {
    this.state = state ? structuredClone(state) : { visible: false, tiles: [], defaultsApplied: false };
    this.latched.clear();
    this.element.replaceChildren();
    this.render();
  }
  toggle() {
    this.state.visible = !this.state.visible;
    this.render();
  }
  getActiveFields(): Set<string> {
    return new Set(this.state.visible ? this.state.tiles.map((tile) => tile.path) : []);
  }
  private edit(tile: HealthTile) {
    const e = htmlEncode;
    this.editor.innerHTML = `<form method="dialog"><strong>Edit health tile</strong>
      <label>Field <input name="path" required value="${e(tile.path)}"></label>
      <label>Label <input name="label" required value="${e(tile.label)}"></label>
      <label>Direction <select name="direction"><option value="high">Above limit</option><option value="low">Below limit</option></select></label>
      <label>Warning <input name="warn" type="number" step="any" value="${tile.warn ?? ""}"></label>
      <label>Critical <input name="critical" type="number" step="any" value="${tile.critical ?? ""}"></label>
      <label>Display unit <input name="unit" value="${e(tile.profile?.unit ?? "")}" placeholder="Automatic"></label>
      <label>Decimal places <input name="precision" type="number" min="0" max="12" value="${
        tile.profile?.precision ?? ""
      }"></label>
      <div>Limits use the displayed unit. Blank means no limit.</div>
      <label><input name="fault" type="checkbox" ${
        tile.fault ? "checked" : ""
      }> Fault enum / bitfield (zero or Normal clears)</label>
      <label><input name="latch" type="checkbox" ${tile.latch ? "checked" : ""}> Latch until acknowledged</label>
      <footer><button type="button" data-remove>Remove</button><button value="cancel" formnovalidate>Cancel</button><button value="save">Save</button></footer></form>`;
    const form = this.editor.querySelector("form")!;
    (form.elements.namedItem("direction") as HTMLSelectElement).value = tile.direction;
    form.querySelector("[data-remove]")!.addEventListener("click", () => {
      this.state.tiles = this.state.tiles.filter((t) => t !== tile);
      this.latched.delete(tile);
      this.editor.close();
      this.render();
    });
    form.addEventListener("submit", (event) => {
      if ((event as SubmitEvent).submitter?.getAttribute("value") !== "save") return;
      const data = new FormData(form);
      const number = (key: string) => (data.get(key) === "" ? undefined : Number(data.get(key)));
      Object.assign(tile, {
        path: String(data.get("path")),
        label: String(data.get("label")),
        direction: data.get("direction"),
        warn: number("warn"),
        critical: number("critical"),
        fault: data.has("fault"),
        latch: data.has("latch"),
        profile: { unit: String(data.get("unit")) || undefined, precision: number("precision") }
      });
      this.latched.delete(tile);
      this.render();
    });
    this.editor.showModal();
  }
  render() {
    if (this.log !== window.log) {
      this.log = window.log;
      this.latched.clear();
    }
    document.body.classList.toggle("health-visible", this.state.visible);
    document.body.classList.toggle("trackside-layout", this.state.trackside ?? false);
    this.element.hidden = !this.state.visible;
    if (!this.state.visible) return;
    if (this.state.trackside && window.selection.getMode() === SelectionMode.Locked) {
      const range = window.selection.getTimelineRange();
      if (range[1] - range[0] > 30) window.selection.setTimelineRange([range[1] - 30, range[1]], false);
    }
    if (!this.state.defaultsApplied) {
      const tiles = defaultHealthTiles(window.log.getFieldKeys());
      if (tiles.length) {
        this.state.tiles.push(...tiles);
        this.state.defaultsApplied = true;
      }
    }
    // Keep keyboard focus and pointer acknowledgement stable while values refresh.
    if (this.element.children.length !== this.state.tiles.length + 1) this.element.replaceChildren();
    if (!this.element.children.length) {
      const controls = document.createElement("div");
      controls.className = "health-controls";
      const follow = document.createElement("button");
      follow.className = "health-follow";
      follow.addEventListener("click", () => {
        if (window.selection.getMode() === SelectionMode.Locked) window.selection.unlock();
        else window.selection.lock();
        this.render();
      });
      const add = document.createElement("button");
      add.textContent = "Add tile…";
      add.addEventListener("click", () => {
        const tile: HealthTile = { path: "", label: "New tile", direction: "high" };
        this.state.tiles.push(tile);
        this.edit(tile);
      });
      controls.append(follow, add);
      this.element.append(controls);
      this.state.tiles.forEach((tile) => {
        const cell = document.createElement("div");
        cell.className = "health-tile";
        const value = document.createElement("button");
        value.className = "health-reading";
        value.innerHTML = `<span class="health-label"></span><span class="health-value"></span><span class="health-status"></span>`;
        value.title = "Click to acknowledge a latched fault";
        value.addEventListener("click", () => {
          this.latched.delete(tile);
          this.render();
        });
        const edit = document.createElement("button");
        edit.textContent = "⋯";
        edit.className = "health-edit";
        edit.title = "Edit or remove tile";
        edit.setAttribute("aria-label", `Edit ${tile.label}`);
        edit.addEventListener("click", () => this.edit(tile));
        cell.addEventListener("contextmenu", (event) => {
          event.preventDefault();
          this.edit(tile);
        });
        cell.append(value, edit);
        this.element.append(cell);
      });
    }
    const follow = this.element.querySelector(".health-follow") as HTMLButtonElement;
    follow.textContent = window.selection.getMode() === SelectionMode.Locked ? "LIVE" : "REVIEW";
    follow.disabled = window.selection.getCurrentLiveTime() === null;
    this.state.tiles.forEach((tile, i) => {
      const cell = this.element.children[i + 1] as HTMLElement;
      const time = window.selection.getRenderTime() ?? window.log.getTimestampRange()[0];
      const range = window.log.getRange(tile.path, time, time);
      const index = range?.timestamps.findLastIndex((t) => t <= time) ?? -1;
      const value = index >= 0 ? range?.values[index] : undefined;
      const provider = window.liveStatus;
      const summary = provider?.getLiveStatus();
      const liveRun = summary && summary.viewedRun === summary.runCount - 1;
      const freshness = liveRun ? provider?.getFieldFreshness(tile.path) : null;
      const unknown =
        value === undefined ||
        (typeof value === "number" && !Number.isFinite(value)) ||
        (liveRun && (summary.backend !== "connected" || freshness !== "online"));
      const base = window.log.getChannelProfile(tile.path);
      const profile = tile.profile
        ? channelProfile({ name: tile.path, unit: base.rawUnit, enumLabels: base.enumLabels }, tile.profile)
        : base;
      const text =
        tile.fault && typeof value === "number" && !profile.enumLabels
          ? value === 0
            ? "No faults"
            : `Fault bits 0x${value.toString(16)}`
          : formatChannelValue(value, { ...profile, unit: "" });
      const severity = unknown
        ? "ok"
        : evaluateThreshold(typeof value === "number" ? convertChannelValue(value, profile) : value, tile);
      const current: LatchedHealth = { severity, text };
      const held = updateLatch(this.latched.get(tile), current, tile.latch ?? false);
      if (tile.latch && held.severity !== "ok") this.latched.set(tile, held);
      const age = liveRun ? provider?.getFieldAge(tile.path) : null;
      cell.dataset.severity = held.severity;
      cell.title = tile.path;
      cell.querySelector(".health-label")!.textContent =
        tile.label + (profile.unit && profile.unit !== "1" ? ` · ${profile.unit}` : "");
      cell.querySelector(".health-value")!.textContent = unknown ? "UNKNOWN" : text;
      cell.querySelector(".health-status")!.textContent = [
        unknown ? `age ${age == null ? "unknown" : age.toFixed(1) + " s"}` : "",
        held.severity === "critical" ? "CRIT" : held.severity === "warn" ? "WARN" : unknown ? "" : "OK",
        tile.latch && held.severity !== "ok" ? `LATCHED ${held.text} · click to ack` : ""
      ]
        .filter(Boolean)
        .join(" · ");
    });
  }
}
