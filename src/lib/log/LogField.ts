import { arraysEqual } from "../util";
import LoggableType from "./LoggableType";
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

  constructor(type: LoggableType) {
    this.type = type;
  }

  /** Returns the constant field type. */
  getType(): LoggableType {
    return this.type;
  }

  /** Returns the full set of ordered timestamps. */
  getTimestamps(): number[] {
    return this.data.timestamps;
  }

  /** Returns the values in the specified timestamp range. */
  getRange(start: number, end: number): LogValueSetAny {
    let timestamps: number[] = [];
    let values: any[] = [];

    let startValueIndex = this.data.timestamps.findIndex((x) => x > start);
    if (startValueIndex == -1) {
      startValueIndex = this.data.timestamps.length - 1;
    } else if (startValueIndex != 0) {
      startValueIndex -= 1;
    }

    let endValueIndex = this.data.timestamps.findIndex((x) => x >= end);
    if (endValueIndex == -1 || endValueIndex == this.data.timestamps.length - 1) {
      // Extend to end of timestamps
      timestamps = this.data.timestamps.slice(startValueIndex);
      values = this.data.values.slice(startValueIndex);
    } else {
      timestamps = this.data.timestamps.slice(startValueIndex, endValueIndex + 1);
      values = this.data.values.slice(startValueIndex, endValueIndex + 1);
    }
    return { timestamps: timestamps, values: values };
  }

  /** Reads a set of Raw values from the field. */
  getRaw(start: number, end: number): LogValueSetRaw | undefined {
    if (this.type == LoggableType.Raw) return this.getRange(start, end);
  }

  /** Reads a set of Boolean values from the field. */
  getBoolean(start: number, end: number): LogValueSetBoolean | undefined {
    if (this.type == LoggableType.Boolean) return this.getRange(start, end);
  }

  /** Reads a set of Number values from the field. */
  getNumber(start: number, end: number): LogValueSetNumber | undefined {
    if (this.type == LoggableType.Number) return this.getRange(start, end);
  }

  /** Reads a set of String values from the field. */
  getString(start: number, end: number): LogValueSetString | undefined {
    if (this.type == LoggableType.String) return this.getRange(start, end);
  }

  /** Reads a set of BooleanArray values from the field. */
  getBooleanArray(start: number, end: number): LogValueSetBooleanArray | undefined {
    if (this.type == LoggableType.BooleanArray) return this.getRange(start, end);
  }

  /** Reads a set of NumberArray values from the field. */
  getNumberArray(start: number, end: number): LogValueSetNumberArray | undefined {
    if (this.type == LoggableType.NumberArray) return this.getRange(start, end);
  }

  /** Reads a set of StringArray values from the field. */
  getStringArray(start: number, end: number): LogValueSetStringArray | undefined {
    if (this.type == LoggableType.StringArray) return this.getRange(start, end);
  }

  /** Checks if two log values are equal. */
  private areEqual(type: LoggableType, a: any, b: any): boolean {
    switch (type) {
      case LoggableType.Boolean:
      case LoggableType.Number:
      case LoggableType.String:
        return a == b;
      case LoggableType.BooleanArray:
      case LoggableType.NumberArray:
      case LoggableType.StringArray:
        return arraysEqual(a, b);
      case LoggableType.Raw:
        return arraysEqual(Array.from(a as Uint8Array), Array.from(b as Uint8Array));
    }
  }

  /** Inserts a new value at the correct index. */
  private putData(timestamp: number, value: any) {
    let insertIndex = this.data.timestamps.findIndex((x) => x > timestamp);
    if (insertIndex == -1) {
      insertIndex = this.data.timestamps.length;
    }

    if (insertIndex > 0 && this.areEqual(this.type, value, this.data.values[insertIndex - 1])) {
      // Same as the previous value
    } else if (
      insertIndex < this.data.values.length &&
      this.areEqual(this.type, value, this.data.values[insertIndex])
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
    if (this.type == LoggableType.Raw) this.putData(timestamp, value);
  }

  /** Writes a new Boolean value to the field. */
  putBoolean(timestamp: number, value: boolean) {
    if (this.type == LoggableType.Boolean) this.putData(timestamp, value);
  }

  /** Writes a new Number value to the field. */
  putNumber(timestamp: number, value: number) {
    if (this.type == LoggableType.Number) this.putData(timestamp, value);
  }

  /** Writes a new String value to the field. */
  putString(timestamp: number, value: string) {
    if (this.type == LoggableType.String) this.putData(timestamp, value);
  }

  /** Writes a new BooleanArray value to the field. */
  putBooleanArray(timestamp: number, value: boolean[]) {
    if (this.type == LoggableType.BooleanArray) this.putData(timestamp, value);
  }

  /** Writes a new NumberArray value to the field. */
  putNumberArray(timestamp: number, value: number[]) {
    if (this.type == LoggableType.NumberArray) this.putData(timestamp, value);
  }

  /** Writes a new StringArray value to the field. */
  putStringArray(timestamp: number, value: string[]) {
    if (this.type == LoggableType.StringArray) this.putData(timestamp, value);
  }

  /** Returns a serialized version of the data from this field. */
  toSerialized(): any {
    return {
      type: this.type,
      timestamps: this.data.timestamps,
      values: this.data.values
    };
  }

  /** Creates a new field based on the data from `toSerialized()` */
  static fromSerialized(serializedData: any) {
    let field = new LogField(serializedData.type);
    field.data = {
      timestamps: serializedData.timestamps,
      values: serializedData.values
    };
    return field;
  }
}
