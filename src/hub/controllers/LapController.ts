// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Manages sources, settings and the view choice for the Track and laps tab, and builds its render commands.

import { indexAt, interpolate } from "../../shared/laps/LapEngine";
import { LapCommand, LapView } from "../../shared/renderers/LapRenderer";
import { createUUID } from "../../shared/util";
import { lapService, LapSettings } from "../LapService";
import SourceList from "../SourceList";
import { LapSourceConfigs, LapSourceGroups } from "./LapController_Config";
import TabController from "./TabController";

export default class LapController implements TabController {
  private events = new AbortController();
  dispose() {
    this.events.abort();
    this.sources.forEach((source) => source.stop());
  }

  UUID = createUUID();
  /** Map, Laps or both. An old Laps tab (type 14) opens in Laps, and every other tab opens in Map. */
  private view: LapView;
  /** The map colours by one field and the table's metric columns use another, so a drop on one leaves the other. */
  private mapField = "";
  private tableField = "";
  /** The table's share of the width, or of the height when the split view stacks. */
  private split = 0.55;
  private display?: LapCommand["display"];
  private sources: SourceList[] = [];
  private sourceStates: string[] = [];
  private cached?: LapCommand;
  private cacheKey = "";
  /** A map made after a sector was double-clicked keeps its own view until the next double-click. */
  private focusAtStart = lapService.focus?.id;
  constructor(
    root: HTMLElement,
    private legacyMap: boolean,
    controls: HTMLElement
  ) {
    this.view = legacyMap ? "map" : "laps";
    this.sources = LapSourceConfigs.map(
      (config, i) => new SourceList(controls.querySelectorAll<HTMLElement>(".lap-sources")[i], config, [])
    );
    this.syncSources();
    root.addEventListener("lap-action", (event) => {
      const a = (event as CustomEvent).detail;
      const settings = controls.querySelector<HTMLElement>(".field-2d-settings");
      if (a.type === "setup") {
        if (settings) {
          const scrollTop = settings.scrollTop;
          settings.replaceChildren(a.panel);
          settings.scrollTop = scrollTop;
        }
        return;
      }
      if (a.type === "show-setup") {
        // The tab manager toggles the controls, then the column scrolls to the timing controls.
        window.dispatchEvent(new CustomEvent("toggle-tab-controls"));
        window.requestAnimationFrame(() => {
          const timing = settings?.querySelector("[data-lap-timing]");
          if (settings && timing)
            settings.scrollTop += timing.getBoundingClientRect().top - settings.getBoundingClientRect().top;
        });
        return;
      }
      if (a.type === "view") this.view = a.view;
      if (a.type === "split") this.split = a.split;
      // Selection ignores a new time while locked to live, so a deliberate seek unlocks it first.
      const seek = (time: number) => {
        window.selection.unlock();
        window.selection.setSelectedTime(time);
      };
      if (a.type === "seek") seek(a.time);
      if (a.type === "lap") {
        lapService.selected = a.index;
        const lap = lapService.result.laps.find((l) => l.index === a.index);
        if (lap) seek(lap.start);
      }
      if (a.type === "reference") {
        lapService.reference = a.index;
        lapService.invalidate();
      }
      if (a.type === "overlay") lapService.setOverlays(a.indices);
      if (a.type === "gate") {
        if (a.index === -1) lapService.setStartLine(a.gate);
        else lapService.setGate(a.index, a.gate);
        lapService.invalidate();
      }
      if (a.type === "setting") {
        if (a.key === "mode") lapService.settings.config.mode = a.value;
        else if (a.key === "minTime" || a.key === "length")
          lapService.settings.config[a.key as "minTime" | "length"] = Number(a.value) || undefined;
        else if (a.key === "fractions") lapService.settings.config.fractions = a.value.split(",").map(Number);
        else if (a.key === "manual")
          lapService.settings.config.manual = a.value.split(",").map(Number).filter(Number.isFinite);
        else
          (lapService.settings as unknown as Record<string, unknown>)[a.key] = ["radius", "ratio"].includes(a.key)
            ? Number(a.value)
            : a.value;
        lapService.invalidate();
      }
      if (a.type === "marker") {
        const time = window.selection.getSelectedTime();
        if (time !== null) {
          (lapService.settings.config.manual ??= []).push(time);
          lapService.invalidate();
        }
      }
      if (a.type === "auto" && (lapService.settings.config.gate || lapService.settings.config.geographic?.gate))
        lapService.setStartLine();
      if (a.type === "display") this.display = { colorMode: a.colorMode, scope: a.scope };
      if (a.type === "field") {
        if (a.target === "table") this.tableField = a.field;
        else this.mapField = a.field;
      }
    });
    window.addEventListener(
      "drag-update",
      (event) => {
        const d = (event as CustomEvent).detail,
          rect = root.getBoundingClientRect();
        if (
          d.end &&
          d.x >= rect.left &&
          d.x <= rect.right &&
          d.y >= rect.top &&
          d.y <= rect.bottom &&
          d.data.fields?.length
        ) {
          const key = d.data.fields[0];
          const target = this.dropTarget(root, d.x, d.y);
          if (target && window.log.getNumber(key, -Infinity, Infinity)) {
            if (target === "table") this.tableField = key;
            else this.mapField = key;
          }
        }
      },
      { signal: this.events.signal }
    );
  }
  /** Which pane a field dropped at a point colours. Split view asks which pane holds the point. */
  private dropTarget(root: HTMLElement, x: number, y: number): "map" | "table" | undefined {
    if (this.view !== "split") return this.view === "map" ? "map" : "table";
    for (const target of ["map", "table"] as const) {
      const rect = root.querySelector(`.lap-${target}-pane`)?.getBoundingClientRect();
      if (rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return target;
    }
  }
  private syncSources(readEdits = true) {
    lapService.fields();
    this.sources.forEach((source, i) => {
      const state = source.getState();
      if (readEdits && this.sourceStates[i] !== undefined && JSON.stringify(state) !== this.sourceStates[i]) {
        const previous = JSON.parse(this.sourceStates[i]) as ReturnType<SourceList["getState"]>;
        for (const [role] of LapSourceGroups[i].roles) {
          const key = state.find((item) => item.type === role)?.logKey ?? "";
          if (key !== (previous.find((item) => item.type === role)?.logKey ?? "")) lapService.setSource(role, key);
        }
      }
    });
    this.sources.forEach((source, i) => {
      const state = LapSourceGroups[i].roles.flatMap(([role]) => {
        const key = lapService.settings[role];
        return key ? [{ type: role, logKey: key, logType: "Number", visible: true, options: {} }] : [];
      });
      const serialized = JSON.stringify(state);
      if (JSON.stringify(source.getState()) !== serialized) source.setState(state);
      this.sourceStates[i] = serialized;
    });
  }
  saveState() {
    this.syncSources();
    return {
      sourceLists: true,
      view: this.view,
      split: this.split,
      mapField: this.mapField,
      tableField: this.tableField,
      // Older versions read one field, which meant the map colour on type 13 and the metric on type 14.
      field: this.legacyMap ? this.mapField : this.tableField,
      settings: lapService.settings,
      reference: lapService.reference,
      overlays: lapService.overlays
    };
  }
  restoreState(state: unknown) {
    if (!state || typeof state !== "object") return;
    const s = state as {
      view?: unknown;
      split?: unknown;
      field?: string;
      mapField?: unknown;
      tableField?: unknown;
      settings?: LapSettings;
      reference?: number;
      overlays?: number[];
    };
    if (s.view === "map" || s.view === "laps" || s.view === "split") this.view = s.view;
    if (typeof s.split === "number" && Number.isFinite(s.split)) this.split = Math.max(0.1, Math.min(0.9, s.split));
    // A save from before the merge has one field, which belongs to the view its tab type had.
    if (typeof s.mapField === "string") this.mapField = s.mapField;
    else if (this.legacyMap && s.field) this.mapField = s.field;
    if (typeof s.tableField === "string") this.tableField = s.tableField;
    else if (!this.legacyMap && s.field) this.tableField = s.field;
    if (s.settings) {
      // Roles saved empty, as an old layout with no log has them, are left to auto-detection.
      const settings = { ...s.settings };
      for (const { roles } of LapSourceGroups)
        for (const [role] of roles) if (typeof settings[role] !== "string") delete settings[role];
      lapService.settings = { ...lapService.settings, ...settings };
      for (const { roles } of LapSourceGroups)
        for (const [role] of roles) if (settings[role]) lapService.setSource(role, settings[role]);
      lapService.recheckSources();
    }
    this.syncSources(false);
    if (s.reference !== undefined) lapService.reference = s.reference;
    if (s.overlays) lapService.setOverlays(s.overlays);
    lapService.invalidate();
  }
  refresh() {
    // Live refreshes every frame. LapService picks up new data on its own 500 ms cycle.
    this.syncSources();
    this.sources.forEach((source) => source.refresh());
  }
  newAssets() {}
  getActiveFields() {
    // Both fields stay subscribed, so switching view in live shows a colour scale and metrics with their history.
    return [...lapService.fields(), ...[this.mapField, this.tableField].filter((field) => field)];
  }
  showTimeline() {
    return true;
  }
  getCommand(): LapCommand {
    this.syncSources();
    lapService.update();
    const keys = window.log.getFieldKeys();
    if (this.mapField && !keys.includes(this.mapField)) this.mapField = "";
    if (this.tableField && !keys.includes(this.tableField)) this.tableField = "";
    const setupVisible = window.tabs?.getControlsVisible?.() ?? true;
    const showsMap = this.view !== "laps",
      showsTable = this.view !== "map";
    // The map colours each lap until a field is dropped on it. The table shows speed until then.
    if (showsTable) this.tableField ||= lapService.settings.speed || lapService.settings.frontLeft;
    const mapData = showsMap ? window.log.getNumber(this.mapField, Infinity, Infinity) : undefined,
      tableData = showsTable ? window.log.getNumber(this.tableField, Infinity, Infinity) : undefined;
    const cacheKey = JSON.stringify([
      this.display,
      this.view,
      window.log.getTimestampRange()[0],
      window.log.getHistoryVersion(this.mapField),
      window.log.getHistoryVersion(this.tableField),
      ...[mapData, tableData].flatMap((data) => [
        data?.timestamps.length,
        data?.timestamps.at(-1),
        data?.values.at(-1)
      ]),
      lapService.version,
      this.mapField,
      this.tableField,
      lapService.reference,
      lapService.overlays,
      lapService.selected,
      lapService.focus?.id
    ]);
    // Dragging the split moves no data, so it doesn't recalculate the colours or metrics.
    if (this.cached && cacheKey === this.cacheKey)
      return { ...this.cached, split: this.split, setupVisible, time: window.selection.getRenderTime() };
    this.cacheKey = cacheKey;
    const samples = lapService.result.samples;
    const valuesOf = (data: typeof mapData) =>
      samples.map((p) => (data ? interpolate(data.timestamps, data.values, p.t) : NaN));
    // Read full histories only when the command changes, rather than copying them every frame.
    const values = showsMap ? valuesOf(window.log.getNumber(this.mapField, -Infinity, Infinity)) : [],
      tableValues = !showsTable
        ? []
        : this.tableField === this.mapField && showsMap
        ? values
        : valuesOf(window.log.getNumber(this.tableField, -Infinity, Infinity));
    this.cached = {
      view: this.view,
      split: this.split,
      display: this.display,
      setupVisible,
      origin: lapService.origin,
      result: lapService.result,
      settings: { ...lapService.settings, config: lapService.localConfig() },
      field: this.mapField,
      unit: window.log.getUnit(this.mapField) ?? "",
      values,
      tableField: this.tableField,
      tableUnit: window.log.getUnit(this.tableField) ?? "",
      selected: lapService.selected,
      reference: lapService.reference,
      overlays: lapService.overlays,
      time: window.selection.getRenderTime(),
      version: lapService.version,
      focus: lapService.focus?.id !== this.focusAtStart ? lapService.focus : undefined,
      metrics: !showsTable
        ? []
        : lapService.result.laps.map((l) => {
            const vs = tableValues.slice(indexAt(samples, l.start), indexAt(samples, l.end)).filter(Number.isFinite);
            return vs.length
              ? [Math.min(...vs), Math.max(...vs), vs.reduce((a, b) => a + b, 0) / vs.length]
              : [NaN, NaN, NaN];
          })
    };
    return this.cached;
  }
}
