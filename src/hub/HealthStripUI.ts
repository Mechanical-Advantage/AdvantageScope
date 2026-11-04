// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { classifyDBCFault, DBCFaultDefinition } from "../shared/DBCFault";
import { channelProfile, convertChannelValue, formatChannelValue, resolveUnit } from "../shared/display/ChannelProfile";
import {
  evaluateThreshold,
  HealthStripState,
  HealthTile,
  healthTime,
  LatchedHealth,
  restoreHealthState,
  saveTile,
  thresholdOrder,
  updateLatch
} from "../shared/HealthStrip";
import LoggableType from "../shared/log/LoggableType";
import { RenderGuard } from "../shared/RenderGuard";
import { Units } from "../shared/units";
import { htmlEncode } from "../shared/util";

export default class HealthStripUI {
  private element = document.createElement("section");
  private editor = document.createElement("dialog");
  private banner = document.createElement("div");
  private latched = new Map<HealthTile, LatchedHealth>();
  private faults = new Map<string, LatchedHealth>();
  private acknowledged = new Map<string, string>();
  private sizeObserver: ResizeObserver | null = null;

  private log = window.log;
  state: HealthStripState = { visible: false, tiles: [] };

  constructor() {
    this.element.className = "health-strip";
    this.element.setAttribute("aria-label", "Signal thresholds");
    this.banner.className = "severity-banner";
    this.banner.setAttribute("role", "status");
    document.body.append(this.banner, this.element, this.editor);
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
    const guard = new RenderGuard();
    window.setInterval(() => guard.run(() => this.render()), 200);
    this.render();
  }
  restore(state?: HealthStripState) {
    this.state = restoreHealthState(state);
    this.faults.clear();
    this.acknowledged.clear();
    this.latched.clear();
    this.element.replaceChildren();
    this.render();
  }
  toggle() {
    this.state.visible = !this.state.visible;
    this.render();
  }
  getActiveFields(): Set<string> {
    return new Set([
      ...this.state.tiles.map((tile) => tile.path),
      ...window.log.getFieldKeys().filter((path) => this.definition(path))
    ]);
  }
  private edit(tile: HealthTile) {
    const e = htmlEncode;
    this.editor.innerHTML = `<form method="dialog"><strong id="tile-editor-title">Edit tile</strong>
      <label>Field <input name="path" required value="${e(tile.path)}"></label>
      <div class="health-picker" role="listbox" aria-label="Fields" hidden></div>
      <div data-field-note></div><div data-error role="alert"></div>
      <label>Label <input name="label" required value="${e(tile.label)}"></label>
      <label>Direction <select class="mv-select" name="direction"><option value="high">Above limit</option><option value="low">Below limit</option></select></label>
      <label>Warning <input name="warn" type="number" step="any" value="${tile.warn ?? ""}"></label>
      <label>Critical <input name="critical" type="number" step="any" value="${tile.critical ?? ""}"></label>
      <label>Display unit <input name="unit" value="${e(tile.profile?.unit ?? "")}" placeholder="Automatic"></label>
      <label>Decimal places <input name="precision" type="number" min="0" max="12" value="${
        tile.profile?.precision ?? ""
      }"></label>
      <div>Limits use the displayed unit. Blank means no limit.</div>
      <label><input class="mv-checkbox" name="fault" type="checkbox" ${
        tile.fault ? "checked" : ""
      }> Legacy fault fallback (no DBC definition)</label>
      <label><input class="mv-checkbox" name="latch" type="checkbox" ${
        tile.latch ? "checked" : ""
      }> Latch until acknowledged</label>
      <footer><button type="button" data-remove title="Remove tile" aria-label="Remove tile" ${
        this.state.tiles.includes(tile) ? "" : "hidden"
      }><img src="symbols/delete.svg" alt=""></button><button type="button" data-cancel title="Cancel" aria-label="Cancel"><img src="symbols/close.svg" alt=""></button><button value="save" title="Save tile" aria-label="Save tile"><img src="symbols/check.svg" alt=""></button></footer></form>`;
    this.editor.setAttribute("aria-labelledby", "tile-editor-title");
    const form = this.editor.querySelector("form")!;
    form.querySelector("[data-cancel]")!.addEventListener("click", () => this.editor.close());
    const pathInput = form.elements.namedItem("path") as HTMLInputElement;
    const refreshField = () => {
      const def = this.definition(pathInput.value);
      form.querySelector("[data-field-note]")!.textContent = def
        ? "Fault states defined by the DBC."
        : pathInput.value && !window.log.getFieldKeys().includes(pathInput.value)
        ? "Field not present yet. This tile will bind when data arrives."
        : "";
      for (const name of ["warn", "critical", "fault", "direction"]) {
        const input = form.elements.namedItem(name) as HTMLInputElement;
        input.disabled = !!def || (name === "fault" && !tile.fault);
        input.closest("label")!.hidden = input.disabled;
      }
    };
    const picker = form.querySelector(".health-picker") as HTMLElement;
    const showFields = () => {
      const paths = window.log
        .getFieldKeys()
        .filter(
          (path) =>
            path.toLowerCase().includes(pathInput.value.toLowerCase()) &&
            [LoggableType.Number, LoggableType.String, LoggableType.Boolean].includes(window.log.getType(path)!)
        );
      picker.replaceChildren(
        ...paths.slice(0, 50).map((path) => {
          const option = document.createElement("button");
          option.type = "button";
          option.setAttribute("role", "option");
          option.textContent = path;
          option.addEventListener("click", () => {
            pathInput.value = path;
            picker.hidden = true;
            refreshField();
            pathInput.focus();
          });
          return option;
        })
      );
      picker.hidden = !paths.length;
    };
    pathInput.addEventListener("input", () => {
      refreshField();
      showFields();
    });
    pathInput.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        showFields();
        (picker.firstElementChild as HTMLElement)?.focus();
      }
    });
    refreshField();
    let display = window.log.getChannelProfile(tile.path);
    if (tile.profile) display = channelProfile({ name: tile.path, unit: display.rawUnit }, tile.profile);
    const unitInput = form.elements.namedItem("unit") as HTMLInputElement;
    unitInput.addEventListener("change", () => {
      const target = unitInput.value
        ? resolveUnit(unitInput.value)
        : channelProfile({ name: tile.path, unit: display.rawUnit }).to;
      if (
        target &&
        !display.to &&
        ["warn", "critical"].every((name) => (form.elements.namedItem(name) as HTMLInputElement).value === "")
      ) {
        display = { ...display, to: target };
        unitInput.setCustomValidity("");
        return;
      }
      if (!target || !display.to || Units.GROUP_BY_UNIT[target] !== Units.GROUP_BY_UNIT[display.to]) {
        unitInput.setCustomValidity("Choose a compatible display unit.");
        return;
      }
      unitInput.setCustomValidity("");
      for (const name of ["warn", "critical"]) {
        const input = form.elements.namedItem(name) as HTMLInputElement;
        if (input.value !== "") input.value = String(Units.convert(Number(input.value), display.to, target));
      }
      display = { ...display, to: target };
    });
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
      const number = (key: string) =>
        data.get(key) === "" || data.get(key) === null ? undefined : Number(data.get(key));
      const changes: HealthTile = {
        path: String(data.get("path")),
        label: String(data.get("label")),
        direction: (data.get("direction") ?? tile.direction) as "high" | "low",
        warn: number("warn"),
        critical: number("critical"),
        fault: data.has("fault"),
        latch: data.has("latch"),
        profile: { unit: String(data.get("unit")) || undefined, precision: number("precision") }
      };
      if (!thresholdOrder(changes)) {
        event.preventDefault();
        form.querySelector("[data-error]")!.textContent = "Critical must be beyond warning in the selected direction.";
        return;
      }
      saveTile(this.state.tiles, tile, changes);
      this.latched.delete(tile);
      this.element.replaceChildren();
      this.render();
    });
    this.editor.showModal();
    this.editor.onkeydown = (event) => {
      if (event.key === "Enter" && event.target === pathInput) {
        event.preventDefault();
        form.requestSubmit(form.querySelector<HTMLButtonElement>('[value="save"]'));
      }
    };
  }
  render() {
    if (this.log !== window.log) {
      this.log = window.log;
      this.latched.clear();
      this.faults.clear();
      this.acknowledged.clear();
    }
    document.body.classList.toggle("health-visible", this.state.visible);
    this.element.hidden = !this.state.visible;
    this.banner.hidden = true;
    document.body.classList.remove("has-severity-banner");
    if (!this.state.visible) {
      document.documentElement.style.removeProperty("--health-h");
      return;
    }
    if (!this.sizeObserver) {
      this.sizeObserver = new ResizeObserver(() =>
        document.documentElement.style.setProperty("--health-h", this.element.offsetHeight + "px")
      );
      this.sizeObserver.observe(this.element);
      new ResizeObserver(() =>
        document.documentElement.style.setProperty("--severity-h", this.banner.offsetHeight + "px")
      ).observe(this.banner);
    }
    // Keep keyboard focus and pointer acknowledgement stable while values refresh.
    if (this.element.children.length !== this.state.tiles.length + 1) this.element.replaceChildren();
    if (!this.element.children.length) {
      const controls = document.createElement("div");
      controls.className = "health-controls";
      const add = document.createElement("button");
      add.textContent = "Add tile…";
      add.addEventListener("click", () => {
        const tile: HealthTile = { path: "", label: "New tile", direction: "high" };
        this.edit(tile);
      });
      controls.append(add);
      const hint = document.createElement("span");
      hint.textContent = "Drag fields here";
      controls.append(hint);
      this.element.append(controls);
      this.state.tiles.forEach((tile) => {
        const cell = document.createElement("div");
        cell.className = "health-tile";
        const value = document.createElement("div");
        value.className = "health-reading";
        value.innerHTML = `<span class="health-label"></span><span class="health-value"></span><span class="health-state"></span><span class="health-status"></span>`;
        cell.tabIndex = 0;
        cell.addEventListener("keydown", (event) => {
          if (event.code === "Space") event.stopPropagation();
        });
        const ack = document.createElement("button");
        ack.className = "health-ack";
        ack.textContent = "Ack";
        ack.addEventListener("click", () => {
          this.acknowledge(tile.path);
          this.render();
        });
        const edit = document.createElement("button");
        const icon = document.createElement("img");
        icon.src = "symbols/morehoriz.svg";
        icon.alt = "";
        edit.append(icon);
        edit.className = "health-edit";
        edit.title = "Edit or remove tile";
        edit.setAttribute("aria-label", `Edit ${tile.label}`);
        edit.addEventListener("click", () => this.edit(tile));
        cell.addEventListener("contextmenu", (event) => {
          event.preventDefault();
          this.edit(tile);
        });
        cell.append(value, edit, ack);
        this.element.append(cell);
      });
    }
    const alerts: string[] = [];
    const time = healthTime(window.selection.getCurrentLiveTime(), window.log.getTimestampRange()[1]);
    this.scanFaults(time, alerts);
    this.state.tiles.forEach((tile, i) => {
      const cell = this.element.children[i + 1] as HTMLElement;
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
      const fault = this.definition(tile.path);
      const classified = fault ? classifyDBCFault(fault, value) : null;
      const severity =
        unknown || classified?.severity === "unknown"
          ? "ok"
          : classified?.severity ??
            evaluateThreshold(typeof value === "number" ? convertChannelValue(value, profile) : value, tile);
      const current: LatchedHealth = { severity, text: classified?.label ?? text };
      if (severity === "ok" && !unknown) this.acknowledged.delete(tile.path);
      const shouldLatch =
        !!(tile.latch || classified || severity === "critical" || this.latched.has(tile)) &&
        !this.acknowledged.has(tile.path);
      const held = updateLatch(this.latched.get(tile), current, shouldLatch);
      if (shouldLatch && held.severity !== "ok") this.latched.set(tile, held);

      const age = liveRun ? provider?.getFieldAge(tile.path) : null;
      cell.dataset.severity = held.severity;
      cell.dataset.stale = String(unknown && liveRun === true);
      cell.title = tile.path;
      cell.querySelector(".health-label")!.textContent =
        tile.label + (profile.unit && profile.unit !== "1" ? ` · ${profile.unit}` : "");
      const latchedNow = this.latched.has(tile);
      (cell.querySelector(".health-ack") as HTMLElement).hidden = !latchedNow;
      const liveText = unknown ? (value === undefined ? "—" : text) : text;
      cell.dataset.latched = latchedNow ? "true" : "false";
      cell.dataset.unknown = unknown ? "true" : "false";
      cell.querySelector(".health-value")!.textContent = latchedNow ? held.text : liveText;
      const availability = unknown
        ? liveRun && (summary.backend !== "connected" || freshness === "offline")
          ? "OFFLINE"
          : liveRun && value !== undefined
          ? "STALE"
          : "NO DATA"
        : "";
      if (held.severity !== "ok" || (availability && availability !== "NO DATA"))
        alerts.push(
          `${held.severity === "critical" ? "CRIT" : held.severity === "warn" ? "WARN" : availability} · ${
            tile.label
          } ${held.text}${profile.unit && profile.unit !== "1" ? " " + profile.unit : ""}${
            latchedNow ? " · LATCHED" : ""
          }`
        );
      const severityText = held.severity === "critical" ? "CRIT" : held.severity === "warn" ? "WARN" : "";
      cell.querySelector(".health-state")!.textContent = [
        latchedNow ? "LATCHED" : "",
        !unknown || held.severity !== "ok" ? severityText : "",
        availability
      ]
        .filter(Boolean)
        .join(" · ");
      cell.querySelector(".health-status")!.textContent = [
        latchedNow ? `now ${liveText}` : "",
        unknown ? (age == null ? "no data yet" : `last received ${age.toFixed(1)} s ago`) : "",
        ""
      ]
        .filter(Boolean)
        .join(" · ");
    });
    this.updateSummary(alerts);
  }
  private definition(path: string): DBCFaultDefinition | null {
    if (path.endsWith("/raw")) return null;
    try {
      const metadata = JSON.parse(window.log.getMetadataString(path));
      if (!metadata.dbcSignal) return null;
      const def = {
        name: metadata.dbcSignal,
        values: metadata.values ?? metadata.enumLabels,
        comment: metadata.comment
      };
      return classifyDBCFault(def, 0) ? def : null;
    } catch {
      return null;
    }
  }
  private acknowledge(path: string) {
    const tile = this.state.tiles.find((t) => t.path === path);
    const held = (tile && this.latched.get(tile)) || this.faults.get(path);
    if (held) this.acknowledged.set(path, JSON.stringify(held));
    for (const match of this.state.tiles.filter((t) => t.path === path)) this.latched.delete(match);
    this.faults.delete(path);
  }
  private scanFaults(time: number, alerts: string[]) {
    for (const path of window.log.getFieldKeys()) {
      const def = this.definition(path);
      if (!def) continue;
      const range = window.log.getRange(path, time, time);
      const index = range?.timestamps.findLastIndex((t) => t <= time) ?? -1;
      const provider = window.liveStatus;
      const status = provider?.getLiveStatus();
      if (
        status &&
        status.viewedRun === status.runCount - 1 &&
        (status.backend !== "connected" || provider?.getFieldFreshness(path) !== "online")
      )
        continue;
      const result = classifyDBCFault(def, index < 0 ? undefined : range?.values[index]);
      if (!result || result.severity === "unknown") continue;
      const current: LatchedHealth = { severity: result.severity, text: result.label };
      if (current.severity === "ok") this.acknowledged.delete(path);
      const held = updateLatch(this.faults.get(path), current, !this.acknowledged.has(path));
      if (held.severity !== "ok" && !this.acknowledged.has(path)) this.faults.set(path, held);
      if (!this.state.tiles.some((t) => t.path === path)) {
        const shown = this.faults.get(path) ?? current;
        if (shown.severity !== "ok")
          alerts.push(
            `${shown.severity === "critical" ? "CRIT" : "WARN"} · ${def.name} ${shown.text}${
              this.faults.has(path) ? " · LATCHED" : ""
            }`
          );
      }
    }
  }
  private updateSummary(alerts: string[]) {
    const text = alerts.join("  ·  ");
    this.banner.hidden = !text;
    document.body.classList.toggle("has-severity-banner", !!text);
    if (this.banner.querySelector("span")?.textContent === text) return;
    const label = document.createElement("span");
    label.textContent = text;
    const ack = document.createElement("button");
    ack.textContent = "Ack all";
    ack.hidden = !this.latched.size && !this.faults.size;
    ack.addEventListener("click", () => {
      for (const tile of this.state.tiles) this.acknowledge(tile.path);
      for (const path of this.faults.keys()) this.acknowledge(path);
      this.render();
    });
    this.banner.replaceChildren(label, ack);
  }
}
