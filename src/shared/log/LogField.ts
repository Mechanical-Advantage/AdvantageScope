// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import LoggableType from "./LoggableType";
import { isChildLog } from "./LogKeyUtils";
import { logValuesEqual } from "./LogUtil";
import {
  LogValueSetAny,
  LogValueSetBoolean,
  LogValueSetBooleanArray,
  LogValueSetNumber,
  LogValueSetNumberArray,
  LogValueSetRaw,
  LogValueSetString,
  LogValueSetStringArray
} from "./LogValueSets";

/** A full log field that contains data. */
export default class LogField {
  private type: LoggableType;
  private data: LogValueSetAny = { timestamps: [], values: [] };
  private dataStart = 0;
  private retainedTimestamps: number[] | null = null;
  private discardTimestamp = -Infinity;
  private retainSamples = false;
  public structuredType: string | null = null;
  public wpilibType: string | null = null; // Original type from WPILOG & NT4
  public metadataString = "";
  public typeWarning = false; // Flag that there was an attempt to write a conflicting type

  // Toggles when first value is removed, useful for creating striping effects that persist as data is updated
  private stripingReference = false;

  private lazyStrings = new Map<() => string, string>();

  // Indexes are relative to the retained window, independent of physical compaction.
  private getRangeCache: { [id: string]: number } = {};

  constructor(type: LoggableType) {
    this.type = type;
  }

  /** Returns the constant field type. */
  getType(): LoggableType {
    return this.type;
  }

  /** Returns the value of the striping reference. */
  getStripingReference(): boolean {
    return this.stripingReference;
  }

  /** Returns the full set of ordered timestamps. */
  getTimestamps(): number[] {
    return this.dataStart === 0
      ? this.data.timestamps
      : (this.retainedTimestamps ??= this.data.timestamps.slice(this.dataStart));
  }

  /** Access retained timestamps without materializing the retained window in frame loops. */
  getTimestamp(index: number): number | undefined {
    return index < 0 ? undefined : this.data.timestamps[this.dataStart + index];
  }

  getTimestampCount(): number {
    return this.data.timestamps.length - this.dataStart;
  }

  private discardVersion = 0;
  private firstSampleTimestamp: number | undefined;

  getDiscardVersion(): number {
    return this.discardVersion;
  }

  /** Original time of the held sample, before retention moved it forward. */
  getFirstSampleTimestamp(): number | undefined {
    return this.firstSampleTimestamp ?? this.getTimestamp(0);
  }

  /** Clears all data before the provided timestamp. */
  clearBeforeTime(clearTimestamp: number) {
    if (this.dataStart === this.data.timestamps.length || this.data.timestamps[this.dataStart] >= clearTimestamp)
      return;
    const timestamps = this.data.timestamps;
    const start = this.dataStart;
    while (this.dataStart + 1 < timestamps.length && timestamps[this.dataStart + 1] < clearTimestamp) {
      this.data.values[this.dataStart++] = undefined;
    }
    const removed = this.dataStart - start;
    if (removed > 0 || this.firstSampleTimestamp === undefined) {
      this.firstSampleTimestamp = timestamps[this.dataStart];
    }
    if (removed % 2) this.stripingReference = !this.stripingReference;
    timestamps[this.dataStart] = clearTimestamp;
    this.retainedTimestamps = null;
    if (removed > 0) {
      this.lazyStrings.clear();
      if (this.dataStart * 2 >= timestamps.length) this.compactDiscarded();
    }
    this.discardVersion++;
  }

  /** Bounded message histories preserve receipt times, including identical payloads. */
  retainAllSamples() {
    this.retainSamples = true;
  }

  /** Removes expired samples without moving their timestamps or extending sample-and-hold. */
  discardBeforeTime(timestamp: number): boolean {
    this.discardTimestamp = Math.max(this.discardTimestamp, timestamp);
    const start = this.dataStart;
    while (this.dataStart < this.data.timestamps.length && this.data.timestamps[this.dataStart] < timestamp) {
      this.data.values[this.dataStart++] = undefined;
    }
    const count = this.dataStart - start;
    if (count === 0) return false;
    this.discardVersion++;
    this.firstSampleTimestamp = undefined;
    this.retainedTimestamps = null;
    this.lazyStrings.clear();
    if (count % 2) this.stripingReference = !this.stripingReference;
    // Compact only when the removed prefix pays for copying the retained suffix.
    if (this.dataStart * 2 >= this.data.timestamps.length) this.compactDiscarded();
    return true;
  }

  private compactDiscarded() {
    if (this.dataStart === 0) return;
    this.data.timestamps.splice(0, this.dataStart);
    this.data.values.splice(0, this.dataStart);
    this.dataStart = 0;
    this.retainedTimestamps = null;
  }

  /** Finds the first timestamp above the boundary (or equal, for an inclusive search). */
  private findTimestampIndex(timestamp: number, inclusive: boolean, from = 0): number {
    let first = Math.trunc(from);
    if (first < 0) first = Math.max(this.data.timestamps.length + first, 0);
    let low = Math.max(first, this.dataStart);
    let high = this.data.timestamps.length;
    while (low < high) {
      let middle = low + Math.floor((high - low) / 2);
      let value = this.data.timestamps[middle];
      if (inclusive ? value >= timestamp : value > timestamp) {
        high = middle;
      } else {
        low = middle + 1;
      }
    }
    // Return an index relative to the search start, like slice(from).findIndex().
    return low === this.data.timestamps.length ? -1 : low - first;
  }

  /** Returns the values in the specified timestamp range.
   *
   * If a UUID is provided, requests for single timestamps will cache
   * the timestamp index to make searches of chronological data faster.
   */
  getRange(start: number, end: number, uuid?: string, startOffset?: number): LogValueSetAny {
    if (this.dataStart === this.data.timestamps.length) return { timestamps: [], values: [] };
    // Preserve legacy slice semantics for unusual offsets and NaN cache lookups.
    if (
      Number.isNaN(start) ||
      Number.isNaN(end) ||
      (startOffset !== undefined && (!Number.isInteger(startOffset) || startOffset < 0))
    )
      this.compactDiscarded();
    let timestamps: number[];
    let values: any[];

    let cacheIndex: number | null = null;
    if (start === end && uuid !== undefined && uuid in this.getRangeCache) {
      cacheIndex = this.getRangeCache[uuid] + this.dataStart;
    }

    let startValueIndex = -1;
    if (
      cacheIndex !== null &&
      (this.dataStart === 0 || cacheIndex >= this.dataStart) &&
      cacheIndex < this.data.timestamps.length &&
      !(this.data.timestamps[cacheIndex] > start)
    ) {
      // Search from previous location
      let rawIndex = this.findTimestampIndex(start, false, cacheIndex);
      if (rawIndex !== -1) startValueIndex = rawIndex + cacheIndex;
    }
    if (startValueIndex === -1) {
      // Search from start
      startValueIndex = this.findTimestampIndex(start, false);
    }
    if (startValueIndex === -1) {
      startValueIndex = this.data.timestamps.length - 1;
    } else if (this.dataStart === 0 ? startValueIndex !== 0 : startValueIndex > this.dataStart) {
      startValueIndex -= 1;
    }
    if (startOffset !== undefined && startOffset >= this.dataStart - startValueIndex) {
      startValueIndex += startOffset;
    }

    let endValueIndex = -1;
    if (
      cacheIndex !== null &&
      (this.dataStart === 0 || cacheIndex >= this.dataStart) &&
      cacheIndex < this.data.timestamps.length &&
      !(this.data.timestamps[cacheIndex] >= end)
    ) {
      // Search from previous location
      let rawIndex = this.findTimestampIndex(end, true, cacheIndex);
      if (rawIndex !== -1) endValueIndex = rawIndex + cacheIndex;
    }
    if (endValueIndex === -1) {
      // Search from start
      endValueIndex = this.findTimestampIndex(end, true);
    }
    if (endValueIndex === -1 || endValueIndex === this.data.timestamps.length - 1) {
      // Extend to end of timestamps
      timestamps = this.data.timestamps.slice(startValueIndex);
      values = this.data.values.slice(startValueIndex);
    } else {
      timestamps = this.data.timestamps.slice(startValueIndex, endValueIndex + 1);
      values = this.data.values.slice(startValueIndex, endValueIndex + 1);
    }

    if (start === end && uuid !== undefined) {
      this.getRangeCache[uuid] = startValueIndex - this.dataStart;
    }

    if (this.type === LoggableType.String) {
      values.forEach((value, index) => {
        if (typeof value !== "function") return;
        // Resolve only consumed entries, once per returned range even if the field cache evicts them.
        Object.defineProperty(values, index, {
          configurable: true,
          enumerable: true,
          get: () => {
            const resolved = this.resolveValue(value);
            Object.defineProperty(values, index, { value: resolved, enumerable: true, configurable: true });
            return resolved;
          }
        });
      });
    }
    return { timestamps, values };
  }

  private resolveValue(value: any): any {
    if (typeof value !== "function") return value;
    let string = this.lazyStrings.get(value);
    if (string === undefined) {
      string = value();
      this.lazyStrings.set(value, string!);
      if (this.lazyStrings.size > 2) this.lazyStrings.delete(this.lazyStrings.keys().next().value!);
    }
    return string;
  }

  /** A string derived on demand from an already retained payload. */
  putLazyString(timestamp: number, value: () => string) {
    if (this.type === LoggableType.String) this.putData(timestamp, value);
    else this.typeWarning = true;
  }

  /** Reads a set of Raw values from the field. */
  getRaw(start: number, end: number, uuid?: string, startOffset?: number): LogValueSetRaw | undefined {
    if (this.type === LoggableType.Raw) return this.getRange(start, end, uuid, startOffset);
  }

  /** Reads a set of Boolean values from the field. */
  getBoolean(start: number, end: number, uuid?: string, startOffset?: number): LogValueSetBoolean | undefined {
    if (this.type === LoggableType.Boolean) return this.getRange(start, end, uuid, startOffset);
  }

  /** Reads a set of Number values from the field. */
  getNumber(start: number, end: number, uuid?: string, startOffset?: number): LogValueSetNumber | undefined {
    if (this.type === LoggableType.Number) return this.getRange(start, end, uuid, startOffset);
  }

  /** Reads a set of String values from the field. */
  getString(start: number, end: number, uuid?: string, startOffset?: number): LogValueSetString | undefined {
    if (this.type === LoggableType.String) return this.getRange(start, end, uuid, startOffset);
  }

  /** Reads a set of BooleanArray values from the field. */
  getBooleanArray(
    start: number,
    end: number,
    uuid?: string,
    startOffset?: number
  ): LogValueSetBooleanArray | undefined {
    if (this.type === LoggableType.BooleanArray) return this.getRange(start, end, uuid, startOffset);
  }

  /** Reads a set of NumberArray values from the field. */
  getNumberArray(start: number, end: number, uuid?: string, startOffset?: number): LogValueSetNumberArray | undefined {
    if (this.type === LoggableType.NumberArray) return this.getRange(start, end, uuid, startOffset);
  }

  /** Reads a set of StringArray values from the field. */
  getStringArray(start: number, end: number, uuid?: string, startOffset?: number): LogValueSetStringArray | undefined {
    if (this.type === LoggableType.StringArray) return this.getRange(start, end, uuid, startOffset);
  }

  /** Inserts a new value at the correct index. */
  private putData(timestamp: number, value: any) {
    if (value === null || timestamp < this.discardTimestamp) return;
    if (timestamp <= this.data.timestamps[this.dataStart]) this.firstSampleTimestamp = undefined;
    this.retainedTimestamps = null;

    if (timestamp <= this.data.timestamps[this.data.timestamps.length - 1]) this.compactDiscarded();
    // Find position to insert based on timestamp
    let insertIndex: number;
    if (this.data.timestamps.length > 0 && timestamp > this.data.timestamps[this.data.timestamps.length - 1]) {
      // There's a good chance this data is at the end of the log, so check that first
      insertIndex = this.data.timestamps.length;
    } else {
      // Adding in the middle. A linear scan here made rewriting a recent live range cost the whole history.
      insertIndex = this.findTimestampIndex(timestamp, true);
      if (insertIndex === -1) insertIndex = this.data.timestamps.length;
      if (this.data.timestamps[insertIndex] === timestamp) {
        this.data.values[insertIndex] = value;
        return;
      }
    }

    // Compare to adjacent values
    let childLog = this.retainSamples || isChildLog(this.wpilibType, this.structuredType);
    if (
      !childLog &&
      insertIndex > this.dataStart &&
      logValuesEqual(this.type, value, this.data.values[insertIndex - 1])
    ) {
      // Same as the previous value
    } else if (
      !childLog &&
      insertIndex < this.data.values.length &&
      logValuesEqual(this.type, value, this.data.values[insertIndex])
    ) {
      // Same as the next value
      this.data.timestamps[insertIndex] = timestamp;
    } else {
      // New value
      this.data.timestamps.splice(insertIndex, 0, timestamp);
      this.data.values.splice(insertIndex, 0, value);
    }
  }

  /** Writes a new Raw value to the field. */
  putRaw(timestamp: number, value: Uint8Array) {
    if (this.type === LoggableType.Raw) {
      this.putData(timestamp, value);
    } else this.typeWarning = true;
  }

  /** Writes a new Boolean value to the field. */
  putBoolean(timestamp: number, value: boolean) {
    if (this.type === LoggableType.Boolean) {
      this.putData(timestamp, value);
    } else this.typeWarning = true;
  }

  /** Writes a new Number value to the field. */
  putNumber(timestamp: number, value: number) {
    if (this.type === LoggableType.Number) {
      this.putData(timestamp, value);
    } else this.typeWarning = true;
  }

  /** Writes a new String value to the field. */
  putString(timestamp: number, value: string) {
    if (this.type === LoggableType.String) {
      this.putData(timestamp, value);
    } else this.typeWarning = true;
  }

  /** Writes a new BooleanArray value to the field. */
  putBooleanArray(timestamp: number, value: boolean[]) {
    if (this.type === LoggableType.BooleanArray) {
      this.putData(timestamp, value);
    } else this.typeWarning = true;
  }

  /** Writes a new NumberArray value to the field. */
  putNumberArray(timestamp: number, value: number[]) {
    if (this.type === LoggableType.NumberArray) {
      this.putData(timestamp, value);
    } else this.typeWarning = true;
  }

  /** Writes a new StringArray value to the field. */
  putStringArray(timestamp: number, value: string[]) {
    if (this.type === LoggableType.StringArray) {
      this.putData(timestamp, value);
    } else this.typeWarning = true;
  }

  /** Returns a serialized version of the data from this field. */
  toSerialized(): any {
    return {
      type: this.type,
      timestamps: this.data.timestamps.slice(this.dataStart),
      values: this.data.values.slice(this.dataStart).map((value) => this.resolveValue(value)),
      structuredType: this.structuredType,
      wpilibType: this.wpilibType,
      metadataString: this.metadataString,
      stripingReference: this.stripingReference,
      typeWarning: this.typeWarning
    };
  }

  /** Creates a new field based on the data from `toSerialized()` */
  static fromSerialized(serializedData: any) {
    let field = new LogField(serializedData.type);
    field.data = {
      timestamps: serializedData.timestamps,
      values: serializedData.values
    };
    field.structuredType = serializedData.structuredType;
    field.wpilibType = serializedData.wpilibType;
    field.metadataString = serializedData.metadataString;
    field.stripingReference = serializedData.stripingReference;
    field.typeWarning = serializedData.typeWarning;
    return field;
  }
}
