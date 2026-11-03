// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Log from "../../shared/log/Log";
import { Units } from "../../shared/units";
import {
  HistoricalDataSource_WorkerFieldResponse,
  HistoricalDataSource_WorkerRequest,
  HistoricalDataSource_WorkerResponse
} from "./HistoricalDataSource";

/** Shared plumbing for the mur-voir historical importers (CSV, candump, MCAP, JSONL). */

export function sendResponse(response: HistoricalDataSource_WorkerResponse) {
  self.postMessage(response);
}

export function sendProgress(value: number) {
  sendResponse({ type: "progress", value: value });
}

/** Unit spellings seen in MUR files that `Units` doesn't recognise directly. */
const UNIT_ALIASES: { [key: string]: string } = {
  degc: "°C",
  "deg c": "°C",
  "°c": "°C",
  degf: "°F",
  "km/h": "kph",
  kmh: "kph",
  "m/s^2": "m/s/s",
  "m/s2": "m/s/s",
  "m/s²": "m/s/s",
  "rad/s^2": "rad/s/s",
  "deg/s": "dps",
  "°/s": "dps",
  sec: "s",
  volts: "V",
  amps: "A"
};

/**
 * Normalises a unit string from a file to one the unit-conversion system understands where
 * possible. Unknown units are returned unchanged (they are still shown in metadata).
 */
export function normalizeUnit(unit: string): string {
  const trimmed = unit.trim();
  const alias = UNIT_ALIASES[trimmed.toLowerCase()];
  if (alias !== undefined) return alias;
  return trimmed;
}

/** Returns true if the unit maps to a known unit-conversion unit. */
export function isKnownUnit(unit: string): boolean {
  return normalizeUnit(unit).toLowerCase() in Units.UNIT_SUFFIXES;
}

/** Sets the field metadata (JSON) used for units and the sidebar tooltip. */
export function setMetadata(log: Log, key: string, metadata: { [key: string]: unknown }) {
  const cleaned: { [key: string]: unknown } = {};
  Object.entries(metadata).forEach(([name, value]) => {
    if (value !== undefined && value !== null && value !== "") cleaned[name] = value;
  });
  if (typeof cleaned.unit === "string") cleaned.unit = normalizeUnit(cleaned.unit);
  if (Object.keys(cleaned).length > 0) log.setMetadataString(key, JSON.stringify(cleaned));
}

/** Serialises the given keys (skipping missing ones) for a "fields" response. */
export function serializeFields(log: Log, keys: Iterable<string>): HistoricalDataSource_WorkerFieldResponse[] {
  const output: HistoricalDataSource_WorkerFieldResponse[] = [];
  const seen = new Set<string>();
  for (const key of keys) {
    if (seen.has(key)) continue;
    seen.add(key);
    const field = log.getField(key);
    if (field === null) continue;
    output.push({ key: key, data: field.toSerialized(), generatedParent: log.isGeneratedParent(key) });
  }
  return output;
}

/**
 * Normalises a key requested by the hub: a key prefix can leave a leading slash on it.
 * Returns the key that exists in the log, or null.
 */
export function resolveRequestedKey(log: Log, key: string): string | null {
  if (log.getField(key) !== null) return key;
  if (key.startsWith("/") && log.getField(key.slice(1)) !== null) return key.slice(1);
  return null;
}

/**
 * Wires up a lazy worker: `start` is called once with the file contents; `decode` is called
 * with batches of requested keys (requests arriving together are batched) and returns the
 * keys whose data should be sent back.
 */
export function runLazyWorker(
  start: (files: (Uint8Array | null)[]) => Promise<Log> | Log,
  decode: (keys: string[]) => string[] | Promise<string[]>,
  log: () => Log,
  configure?: (request: Extract<HistoricalDataSource_WorkerRequest, { type: "start" }>) => void
) {
  let pending: string[] = [];
  let scheduled = false;
  let started = false;
  let busy: Promise<void> = Promise.resolve();
  const flush = async () => {
    scheduled = false;
    const keys = pending;
    pending = [];
    const requested = keys.map((key) => resolveRequestedKey(log(), key) ?? key);
    let sendKeys: string[] = [];
    try {
      sendKeys = await decode(requested);
    } catch (error) {
      console.error("Failed to decode fields", error);
      sendResponse({ type: "failed", error: error instanceof Error ? error.message : String(error) });
      return;
    }
    // Always answer every requested key (even if empty) so the hub doesn't wait forever
    sendResponse({ type: "fields", fields: serializeFields(log(), [...sendKeys, ...requested]) });
  };

  self.onmessage = async (event) => {
    const request: HistoricalDataSource_WorkerRequest = event.data;
    switch (request.type) {
      case "start":
        if (started) return;
        started = true;
        try {
          configure?.(request);
          const result = await start(request.data);
          result.getChangedFields(); // Reset
          sendProgress(1);
          sendResponse({ type: "initial", log: result.toSerialized(), isPartial: true });
        } catch (error) {
          console.error(error);
          sendResponse({ type: "failed", error: error instanceof Error ? error.message : String(error) });
        }
        break;
      case "parseField":
        pending.push(request.key);
        if (!scheduled) {
          scheduled = true;
          // Batches run one at a time, in order
          setTimeout(() => (busy = busy.then(flush)), 0);
        }
        break;
    }
  };
}
