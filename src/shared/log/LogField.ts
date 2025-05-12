// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import LoggableType from "./LoggableType";
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
  public structuredType: string | null = null;
  public wpilibType: string | null = null; // Original type from WPILOG & NT4
  public metadataString = "";
  public typeWarning = false; // Flag that there was an attempt to write a conflicting type

  // Toggles when first value is removed, useful for creating striping effects that persist as data is updated
  private stripingReference = false;

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
    return this.data.timestamps;
  }

  /** Clears all data before the provided timestamp. */
  clearBeforeTime(clearTimestamp: number) {
    const newTimestamps = [];
    const newValues = [];

    for (let i = 0; i < this.data.timestamps.length; i++) {
      const timestamp = this.data.timestamps[i];
      const value = this.data.values[i];

      // If there is more than 1 timestamps and if it occurs before the given timestamp, remove it (don't include it in the new array).
      if (this.data.timestamps.length >= 2 && this.data.timestamps[i + 1] < clearTimestamp) {
        this.stripingReference = !this.stripingReference;
        continue;
      }

      newTimestamps.push(timestamp);
      newValues.push(value);
    }

    // If there are any left over timestamps, reassign the first timestamp to the given timestamp?
    if (newTimestamps.length > 0 && newTimestamps[0] < clearTimestamp) {
      newTimestamps[0] = clearTimestamp;
    }

    this.data.timestamps = newTimestamps;
    this.data.values = newValues;
  }

  /** Returns the values in the specified timestamp range.
   *
   * If a UUID is provided, requests for single timestamps will cache
   * the timestamp index to make searches of chronological data faster.
   */
  getRange(start: number, end: number, uuid?: string): LogValueSetAny {
    let timestamps: number[];
    let values: any[];

    let cacheIndex: number | null = null;
    if (start === end && uuid !== undefined && uuid in this.getRangeCache) {
      cacheIndex = this.getRangeCache[uuid];
    }

    let startValueIndex = -1;
    if (
      cacheIndex !== null &&
      cacheIndex < this.data.timestamps.length &&
      !(this.data.timestamps[cacheIndex] > start)
    ) {
      // Search from previous location
      let rawIndex = this.data.timestamps.slice(cacheIndex).findIndex((x) => x > start);
      if (rawIndex !== -1) startValueIndex = rawIndex + cacheIndex;
    }
    if (startValueIndex === -1) {
      // Search from start
      startValueIndex = this.data.timestamps.findIndex((x) => x > start);
    }
    if (startValueIndex === -1) {
      startValueIndex = this.data.timestamps.length - 1;
    } else if (startValueIndex !== 0) {
      startValueIndex -= 1;
    }

    let endValueIndex = -1;
    if (cacheIndex !== null && cacheIndex < this.data.timestamps.length && !(this.data.timestamps[cacheIndex] >= end)) {
      // Search from previous location
      let rawIndex = this.data.timestamps.slice(cacheIndex).findIndex((x) => x >= end);
      if (rawIndex !== -1) endValueIndex = rawIndex + cacheIndex;
    }
    if (endValueIndex === -1) {
      // Search from start
      endValueIndex = this.data.timestamps.findIndex((x) => x >= end);
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
      this.getRangeCache[uuid] = startValueIndex;
    }

    return { timestamps: timestamps, values: values };
  }

  /** Reads a set of Raw values from the field. */
  getRaw(start: number, end: number, uuid?: string): LogValueSetRaw | undefined {
    if (this.type === LoggableType.Raw) return this.getRange(start, end);
  }

  /** Reads a set of Boolean values from the field. */
  getBoolean(start: number, end: number, uuid?: string): LogValueSetBoolean | undefined {
    if (this.type === LoggableType.Boolean) return this.getRange(start, end);
  }

  /** Reads a set of Number values from the field. */
  getNumber(start: number, end: number, uuid?: string): LogValueSetNumber | undefined {
    if (this.type === LoggableType.Number) return this.getRange(start, end);
  }

  /** Reads a set of String values from the field. */
  getString(start: number, end: number, uuid?: string): LogValueSetString | undefined {
    if (this.type === LoggableType.String) return this.getRange(start, end);
  }

  /** Reads a set of BooleanArray values from the field. */
  getBooleanArray(start: number, end: number, uuid?: string): LogValueSetBooleanArray | undefined {
    if (this.type === LoggableType.BooleanArray) return this.getRange(start, end);
  }

  /** Reads a set of NumberArray values from the field. */
  getNumberArray(start: number, end: number, uuid?: string): LogValueSetNumberArray | undefined {
    if (this.type === LoggableType.NumberArray) return this.getRange(start, end);
  }

  /** Reads a set of StringArray values from the field. */
  getStringArray(start: number, end: number, uuid?: string): LogValueSetStringArray | undefined {
    if (this.type === LoggableType.StringArray) return this.getRange(start, end);
  }

  /** Inserts a new value at the correct index. */
  private putData(timestamp: number, value: any) {
    if (value === null) return;

    // Find position to insert based on timestamp
    let insertIndex: number;
    if (this.data.timestamps.length > 0 && timestamp > this.data.timestamps[this.data.timestamps.length - 1]) {
      // There's a good chance this data is at the end of the log, so check that first
      insertIndex = this.data.timestamps.length;
    } else {
      // Adding in the middle, find where to insert it
      let alreadyExists = false;
      insertIndex =
        this.data.timestamps.findLastIndex((x) => {
          if (alreadyExists) return;
          if (x === timestamp) alreadyExists = true;
          return x < timestamp;
        }) + 1;
      if (alreadyExists) {
        this.data.values[this.data.timestamps.indexOf(timestamp)] = value;
        return;
      }
    }

    // Compare to adjacent values
    if (insertIndex > 0 && logValuesEqual(this.type, value, this.data.values[insertIndex - 1])) {
      // Same as the previous value
    } else if (
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
      timestamps: this.data.timestamps,
      values: this.data.values,
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
