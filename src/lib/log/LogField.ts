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
  private getRange(start: number, end: number): LogValueSetAny {
    let timestamps: number[] = [];
    let values: any[] = [];

    var startValueIndex = this.data.timestamps.findIndex((x) => x > start);
    if (startValueIndex == -1) {
      startValueIndex = this.data.timestamps.length - 1;
    } else if (startValueIndex != 0) {
      startValueIndex -= 1;
    }

    var endValueIndex = this.data.timestamps.findIndex((x) => x >= end);
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

  /** Inserts a new value at the correct index. */
  private putData(timestamp: number, value: any) {
    let insertIndex = this.data.timestamps.findIndex((x) => x > timestamp);
    if (insertIndex == -1) {
      insertIndex = this.data.timestamps.length;
    }
    this.data.timestamps.splice(insertIndex, 0, timestamp);
    this.data.values.splice(insertIndex, 0, value);
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
}
