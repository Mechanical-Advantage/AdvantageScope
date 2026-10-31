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
import TabController from "./TabController";

export default class LapController implements TabController {
  UUID = createUUID();
  private field = "";
  private cached?: LapCommand;
  private cacheKey = "";
  constructor(
    root: HTMLElement,
    private map: boolean
  ) {
    root.addEventListener("lap-action", (event) => {
      const a = (event as CustomEvent).detail;
      if (a.type === "seek") window.selection.setSelectedTime(a.time);
      if (a.type === "lap") {
        lapService.selected = a.index;
        const lap = lapService.result.laps.find((l) => l.index === a.index);
        if (lap) window.selection.setSelectedTime(lap.start);
      }
      if (a.type === "reference") {
        lapService.reference = a.index;
        lapService.invalidate();
      }
      if (a.type === "overlay") {
        lapService.overlays = a.indices;
      }
      if (a.type === "gate") {
        if (a.index === -2) lapService.settings.config.finish = a.gate;
        else if (a.index < 0) lapService.settings.config.gate = a.gate;
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
      if (a.type === "auto") {
        delete lapService.settings.config.gate;
        lapService.invalidate();
      }
      if (a.type === "field") this.field = a.field;
    });
    window.addEventListener("drag-update", (event) => {
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
    });
  }
  saveState() {
    return {
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
    if (s.settings) lapService.settings = { ...lapService.settings, ...s.settings };
    if (s.reference !== undefined) lapService.reference = s.reference;
    if (s.overlays) lapService.overlays = s.overlays;
    lapService.invalidate();
  }
  refresh() {
    lapService.invalidate();
  }
  newAssets() {}
  getActiveFields() {
    return [...lapService.fields(), ...(this.field ? [this.field] : [])];
  }
  showTimeline() {
    return true;
  }
  getCommand(): LapCommand {
    lapService.update();
    this.field ||= lapService.settings.speed || lapService.settings.frontLeft;
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
    if (this.cached && cacheKey === this.cacheKey) return { ...this.cached, time: window.selection.getSelectedTime() };
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
      time: window.selection.getSelectedTime(),
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
