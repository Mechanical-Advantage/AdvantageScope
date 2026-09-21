// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Fuse from "fuse.js";
import { arraysEqual } from "../util";
import Log from "./Log";
import LoggableType from "./LoggableType";

export const ARRAY_TEXT_SIZE_LIMIT = 500;
export const TYPE_KEY = ".type";
export const MAX_SEARCH_RESULTS = 128;

/** Returns a human-readable string representation of a log value. */
export function getLogValueText(value: any, type: LoggableType): string {
  if (value === null) {
    return "null";
  } else if (type === LoggableType.Raw) {
    let array: Uint8Array = value;
    if (array.length === 0) return "(empty)";
    let textArray: string[] = [];
    array.slice(0, ARRAY_TEXT_SIZE_LIMIT).forEach((byte: number) => {
      textArray.push((byte & 0xff).toString(16).padStart(2, "0"));
    });
    if (array.length > ARRAY_TEXT_SIZE_LIMIT) textArray.push("...");
    return textArray.join("-");
  } else if (Array.isArray(value)) {
    let limitedArray = value.slice(0, ARRAY_TEXT_SIZE_LIMIT);
    if (limitedArray.length < value.length) {
      limitedArray.push("...");
    }
    return "[" + limitedArray.map((x) => JSON.stringify(x)).join(", ") + "]";
  } else {
    return JSON.stringify(value);
  }
}

/** Retrieves a log value or returns a default if it is missing. */
export function getOrDefault(
  log: Log,
  key: string,
  type: LoggableType,
  timestamp: number,
  defaultValue: any,
  uuid?: string
): any {
  if (log.getType(key) === type) {
    let logData = log.getRange(key, timestamp, timestamp, uuid);
    if (logData !== undefined && logData.values.length > 0 && logData.timestamps[0] <= timestamp) {
      return logData.values[0];
    }
  }
  return defaultValue;
}

/** Checks if two log values are structurally equal. */
export function logValuesEqual(type: LoggableType, a: any, b: any): boolean {
  switch (type) {
    case LoggableType.Boolean:
    case LoggableType.Number:
    case LoggableType.String:
      return a === b;
    case LoggableType.BooleanArray:
    case LoggableType.NumberArray:
    case LoggableType.StringArray:
      return arraysEqual(a, b);
    case LoggableType.Raw:
      return arraysEqual(Array.from(a as Uint8Array), Array.from(b as Uint8Array));
    default:
      return false;
  }
}

export function getURCLKeys(log: Log): string[] {
  return log.getFieldKeys().filter((key) => {
    let wpilibType = log.getWpilibType(key);
    return wpilibType !== null && wpilibType.startsWith("URCL");
  });
}

const SEARCH_FUSE = new Fuse([] as string[], { findAllMatches: true, ignoreLocation: true });

/** Searches for log fields matching a given query string. */
export function searchFields(log: Log, query: string): string[] {
  if (query.length === 0) return [];
  SEARCH_FUSE.setCollection(log.getFieldKeys());
  return SEARCH_FUSE.search(query)
    .slice(0, MAX_SEARCH_RESULTS)
    .map((field) => field.item);
}

/**
 * Iterates over the values of a log field efficiently for monotonic time lookups.
 * Useful when sampling multiple subfields synchronously using a parent timeline.
 */
export class LogFieldIterator<T> {
  private idx = 0;
  constructor(private data: { timestamps: number[]; values: T[] } | undefined) {}

  getAtTime(time: number): T | undefined {
    if (!this.data) return undefined;
    while (this.idx + 1 < this.data.timestamps.length && this.data.timestamps[this.idx + 1] <= time) {
      this.idx++;
    }
    if (this.idx < this.data.timestamps.length && this.data.timestamps[this.idx] <= time) {
      return this.data.values[this.idx];
    }
    return undefined;
  }
}
