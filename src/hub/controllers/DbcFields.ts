// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import LoggableType from "../../shared/log/LoggableType";
import { getOrDefault } from "../../shared/log/LogUtil";
import { SourceListState, SourceListTypeConfig } from "../../shared/SourceListConfig";
import { Units } from "../../shared/units";
import SourceList from "../SourceList";

/** A source list type that takes one numeric field for a slot. */
export function numberSlot(key: string, display: string, symbol: string): SourceListTypeConfig {
  return {
    key: key,
    display: display,
    symbol: symbol,
    showInTypeName: true,
    color: "#000000",
    darkColor: "#ffffff",
    sourceTypes: ["Number"],
    showDocs: true,
    options: [],
    previewType: null
  };
}

/**
 * Picks a field for each slot of a tab. A field dragged into the source list wins, and hiding it leaves
 * the slot empty. Otherwise the slot takes the first numeric field whose `metadata.dbcSignal` matches one
 * of its DBC signal names, tried in order. The signal lookup is rebuilt after `refresh`, which the hub
 * calls when new fields arrive.
 */
export class DbcSlotFields {
  private defaults: { [slot: string]: string[] };
  private bySignal: Map<string, string> | null = null;

  constructor(defaults: { [slot: string]: string[] }) {
    this.defaults = defaults;
  }

  refresh() {
    this.bySignal = null;
  }

  /**
   * Makes a field dropped into the source list take the slot its DBC signal belongs to, unless this tab
   * already remembers a type for that field. The drop reads the source list's type memory.
   */
  assignDroppedFields(sourceList: SourceList, typeMemoryId: string) {
    sourceList.beforeAdd = (key) => {
      if (!(typeMemoryId in window.typeMemory)) window.typeMemory[typeMemoryId] = {};
      const memory = window.typeMemory[typeMemoryId];
      let signal: unknown;
      try {
        signal = JSON.parse(window.log.getMetadataString(key)).dbcSignal;
      } catch {}
      const slot = Object.keys(this.defaults).find((slot) => this.defaults[slot].includes(signal as string));
      if (slot !== undefined && !(key in memory)) memory[key] = { type: slot, options: {} };
      return true;
    };
  }

  /** The fields the slots read, so live sources subscribe to defaults as well as dragged fields. */
  keys(sources: SourceListState): string[] {
    return Object.values(this.resolve(sources)).filter((key): key is string => key !== undefined);
  }

  resolve(sources: SourceListState): { [slot: string]: string | undefined } {
    if (this.bySignal === null) {
      const bySignal = new Map<string, string>();
      window.log.getFieldKeys().forEach((key) => {
        if (window.log.getType(key) !== LoggableType.Number) return;
        try {
          const signal = JSON.parse(window.log.getMetadataString(key)).dbcSignal;
          if (typeof signal === "string" && !bySignal.has(signal)) bySignal.set(signal, key);
        } catch {}
      });
      this.bySignal = bySignal;
    }
    const fields: { [slot: string]: string | undefined } = {};
    Object.entries(this.defaults).forEach(([slot, signals]) => {
      const dragged = sources.find((source) => source.type === slot);
      if (dragged) fields[slot] = dragged.visible ? dragged.logKey : undefined;
      else fields[slot] = signals.map((signal) => this.bySignal!.get(signal)).find((key) => key);
    });
    return fields;
  }
}

/**
 * Reads a numeric field at `time` in `unit`, the unit its DBC signal uses. A field logged in another unit
 * of the same group, such as radians from the live API, is converted. Returns null without a finite value.
 */
export function numberAt(key: string | undefined, time: number, unit: string, uuid: string): number | null {
  if (key === undefined) return null;
  const value = getOrDefault(window.log, key, LoggableType.Number, time, null, uuid);
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const from = window.log.getUnit(key);
  if (from === null || Units.GROUP_BY_UNIT[from] === undefined || from === unit) return value;
  if (Units.GROUP_BY_UNIT[from] !== Units.GROUP_BY_UNIT[unit]) return null;
  return Units.convert(value, from, unit);
}
