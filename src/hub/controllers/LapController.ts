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

import { interpolate } from "../../shared/laps/LapEngine";
import { LapCommand } from "../../shared/renderers/LapRenderer";
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
  private field = "";
  private sources: SourceList[] = [];
  private sourceStates: string[] = [];
  private cached?: LapCommand;
  private cacheKey = "";
  constructor(
    root: HTMLElement,
    private map: boolean,
    controls: HTMLElement
  ) {
    this.sources = LapSourceConfigs.map((config, i) => new SourceList(controls.children[i] as HTMLElement, config, []));
    this.syncSources();
    root.addEventListener("lap-action", (event) => {
      const a = (event as CustomEvent).detail;
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
        if (a.index === -2) lapService.settings.config.finish = a.gate;
        else if (a.index < 0) lapService.setStartLine(a.gate);
        else {
          const gates = lapService.settings.config.sectors ?? [];
          gates[a.index] = a.gate;
          lapService.settings.config.sectors = gates;
        }
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
      if (a.type === "auto" && lapService.settings.config.gate) lapService.setStartLine();
      if (a.type === "field") this.field = a.field;
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
          if (window.log.getNumber(key, -Infinity, Infinity)) this.field = key;
        }
      },
      { signal: this.events.signal }
    );
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
      field: this.field,
      settings: lapService.settings,
      reference: lapService.reference,
      overlays: lapService.overlays
    };
  }
  restoreState(state: unknown) {
    if (!state || typeof state !== "object") return;
    const s = state as { field?: string; settings?: LapSettings; reference?: number; overlays?: number[] };
    if (s.field) this.field = s.field;
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
    return [...lapService.fields(), ...(this.field ? [this.field] : [])];
  }
  showTimeline() {
    return true;
  }
  getCommand(): LapCommand {
    this.syncSources();
    lapService.update();
    if (this.field && !window.log.getFieldKeys().includes(this.field)) this.field = "";
    // The map colours each lap until a field is dropped on it.
    if (!this.map) this.field ||= lapService.settings.speed || lapService.settings.frontLeft;
    const data = window.log.getNumber(this.field, -Infinity, Infinity);
    const cacheKey = JSON.stringify([
      data?.timestamps.length,
      data?.timestamps.at(-1),
      data?.values.at(-1),
      lapService.version,
      this.field,
      lapService.reference,
      lapService.overlays,
      lapService.selected
    ]);
    if (this.cached && cacheKey === this.cacheKey) return { ...this.cached, time: window.selection.getRenderTime() };
    this.cacheKey = cacheKey;
    const samples = lapService.result.samples;
    const values = samples.map((p) => (data ? interpolate(data.timestamps, data.values, p.t) : NaN));
    this.cached = {
      map: this.map,
      result: lapService.result,
      settings: lapService.settings,
      field: this.field,
      unit: window.log.getUnit(this.field) ?? "",
      values,
      selected: lapService.selected,
      reference: lapService.reference,
      overlays: lapService.overlays,
      time: window.selection.getRenderTime(),
      version: lapService.version,
      metrics: lapService.result.laps.map((l) => {
        const vs = values.filter((v, i) => samples[i].t >= l.start && samples[i].t < l.end && Number.isFinite(v));
        return vs.length
          ? [Math.min(...vs), Math.max(...vs), vs.reduce((a, b) => a + b, 0) / vs.length]
          : [NaN, NaN, NaN];
      })
    };
    return this.cached;
  }
}
