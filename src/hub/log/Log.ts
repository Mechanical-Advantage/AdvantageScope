import LogField from "./LogField";
import LogFieldTree from "./LogFieldTree";
import LoggableType from "./LoggableType";
import {
  LogValueSetBoolean,
  LogValueSetBooleanArray,
  LogValueSetNumber,
  LogValueSetNumberArray,
  LogValueSetRaw,
  LogValueSetString,
  LogValueSetStringArray
} from "./LogValueSets";

/** Represents a collection of log fields. */
export default class Log {
  private DEFAULT_TIMESTAMP_RANGE: [number, number] = [0, 10];

  private fields: { [id: string]: LogField } = {};
  private arrayLengths: { [id: string]: number } = {}; // Used to detect when length increases
  private arrayItemFields: string[] = []; // Readonly fields
  private timestampRange: [number, number] | null = null;

  /** Checks if the field exists and registers it if necessary. */
  private checkField(key: string, type: LoggableType) {
    if (key in this.fields) return;
    this.fields[key] = new LogField(type);
    if (type == LoggableType.BooleanArray || type == LoggableType.NumberArray || type == LoggableType.StringArray) {
      this.arrayLengths[key] = 0;
    }
  }

  /** Updates the timestamp range if necessary. */
  private updateRange(timestamp: number) {
    if (this.timestampRange == null) {
      this.timestampRange = [timestamp, timestamp];
    } else if (timestamp < this.timestampRange[0]) {
      this.timestampRange[0] = timestamp;
    } else if (timestamp > this.timestampRange[1]) {
      this.timestampRange[1] = timestamp;
    }
  }

  /** Returns an array of registered field keys. */
  getFieldKeys(): string[] {
    return Object.keys(this.fields);
  }

  /** Returns the count of fields (excluding array item fields). */
  getFieldCount(): number {
    return Object.keys(this.fields).filter((field) => !this.arrayItemFields.includes(field)).length;
  }

  /** Returns the constant field type. */
  getType(key: string): LoggableType | undefined {
    return this.fields[key].getType();
  }

  /** Returns the combined timestamps from a set of fields. */
  getTimestamps(keys: string[]): number[] {
    const output: number[] = [];
    keys.forEach((key) => {
      this.fields[key].getTimestamps().forEach((timestamp) => {
        if (!output.includes(timestamp)) {
          output.push(timestamp);
        }
      });
    });
    output.sort();
    return output;
  }

  /** Returns the range of timestamps across all fields. */
  getTimestampRange(): [number, number] {
    if (this.timestampRange == null) {
      return this.DEFAULT_TIMESTAMP_RANGE;
    } else {
      return this.timestampRange;
    }
  }

  /** Returns the most recent timestamp across all fields. */
  getLastTimestamp(): number {
    let timestamps = this.getTimestamps(this.getFieldKeys());
    return timestamps[timestamps.length - 1];
  }

  /** Organizes the fields into a tree structure. */
  getFieldTree(): { [id: string]: LogFieldTree } {
    let root: { [id: string]: LogFieldTree } = {};
    Object.keys(this.fields).forEach((key) => {
      let position: LogFieldTree = { fullKey: null, children: root };
      key
        .slice(1)
        .split("/")
        .forEach((table) => {
          if (!(table in position.children)) {
            position.children[table] = { fullKey: null, children: {} };
          }
          position = position.children[table];
        });
      position.fullKey = key;
    });
    return root;
  }

  /** Reads a set of Raw values from the field. */
  getRaw(key: string, start: number, end: number): LogValueSetRaw | undefined {
    if (key in this.fields) return this.fields[key].getRaw(start, end);
  }

  /** Reads a set of Boolean values from the field. */
  getBoolean(key: string, start: number, end: number): LogValueSetBoolean | undefined {
    if (key in this.fields) return this.fields[key].getBoolean(start, end);
  }

  /** Reads a set of Number values from the field. */
  getNumber(key: string, start: number, end: number): LogValueSetNumber | undefined {
    if (key in this.fields) return this.fields[key].getNumber(start, end);
  }

  /** Reads a set of String values from the field. */
  getString(key: string, start: number, end: number): LogValueSetString | undefined {
    if (key in this.fields) return this.fields[key].getString(start, end);
  }

  /** Reads a set of BooleanArray values from the field. */
  getBooleanArray(key: string, start: number, end: number): LogValueSetBooleanArray | undefined {
    if (key in this.fields) return this.fields[key].getBooleanArray(start, end);
  }

  /** Reads a set of NumberArray values from the field. */
  getNumberArray(key: string, start: number, end: number): LogValueSetNumberArray | undefined {
    if (key in this.fields) return this.fields[key].getNumberArray(start, end);
  }

  /** Reads a set of StringArray values from the field. */
  getStringArray(key: string, start: number, end: number): LogValueSetStringArray | undefined {
    if (key in this.fields) return this.fields[key].getStringArray(start, end);
  }

  /** Writes a new Raw value to the field. */
  putRaw(key: string, timestamp: number, value: Uint8Array) {
    this.checkField(key, LoggableType.Raw);
    this.updateRange(timestamp);
    this.fields[key].putRaw(timestamp, value);
  }

  /** Writes a new Boolean value to the field. */
  putBoolean(key: string, timestamp: number, value: boolean) {
    if (this.arrayItemFields.includes(key)) return;
    this.checkField(key, LoggableType.Boolean);
    this.updateRange(timestamp);
    this.fields[key].putBoolean(timestamp, value);
  }

  /** Writes a new Number value to the field. */
  putNumber(key: string, timestamp: number, value: number) {
    if (this.arrayItemFields.includes(key)) return;
    this.checkField(key, LoggableType.Number);
    this.updateRange(timestamp);
    this.fields[key].putNumber(timestamp, value);
  }

  /** Writes a new String value to the field. */
  putString(key: string, timestamp: number, value: string) {
    if (this.arrayItemFields.includes(key)) return;
    this.checkField(key, LoggableType.String);
    this.updateRange(timestamp);
    this.fields[key].putString(timestamp, value);
  }

  /** Writes a new BooleanArray value to the field. */
  putBooleanArray(key: string, timestamp: number, value: boolean[]) {
    this.checkField(key, LoggableType.BooleanArray);
    this.updateRange(timestamp);
    if (this.fields[key].getType() == LoggableType.BooleanArray) {
      this.fields[key].putBooleanArray(timestamp, value);
      if (value.length > this.arrayLengths[key]) {
        for (let i = this.arrayLengths[key]; i < value.length; i++) {
          this.fields[key + "/" + i.toString()] = new LogField(LoggableType.Boolean);
          this.arrayItemFields.push(key + "/" + i.toString());
        }
        this.arrayLengths[key] = value.length;
      }
      for (let i = 0; i < value.length; i++) {
        this.fields[key + "/" + i.toString()].putBoolean(timestamp, value[i]);
      }
    }
  }

  /** Writes a new NumberArray value to the field. */
  putNumberArray(key: string, timestamp: number, value: number[]) {
    this.checkField(key, LoggableType.NumberArray);
    this.updateRange(timestamp);
    if (this.fields[key].getType() == LoggableType.NumberArray) {
      this.fields[key].putNumberArray(timestamp, value);
      if (value.length > this.arrayLengths[key]) {
        for (let i = this.arrayLengths[key]; i < value.length; i++) {
          this.fields[key + "/" + i.toString()] = new LogField(LoggableType.Number);
          this.arrayItemFields.push(key + "/" + i.toString());
        }
        this.arrayLengths[key] = value.length;
      }
      for (let i = 0; i < value.length; i++) {
        this.fields[key + "/" + i.toString()].putNumber(timestamp, value[i]);
      }
    }
  }

  /** Writes a new StringArray value to the field. */
  putStringArray(key: string, timestamp: number, value: string[]) {
    this.checkField(key, LoggableType.StringArray);
    this.updateRange(timestamp);
    if (this.fields[key].getType() == LoggableType.StringArray) {
      this.fields[key].putStringArray(timestamp, value);
      if (value.length > this.arrayLengths[key]) {
        for (let i = this.arrayLengths[key]; i < value.length; i++) {
          this.fields[key + "/" + i.toString()] = new LogField(LoggableType.String);
          this.arrayItemFields.push(key + "/" + i.toString());
        }
        this.arrayLengths[key] = value.length;
      }
      for (let i = 0; i < value.length; i++) {
        this.fields[key + "/" + i.toString()].putString(timestamp, value[i]);
      }
    }
  }

  /** Returns a serialized version of the data from this log. */
  toSerialized(): any {
    let result: any = {
      fields: {},
      arrayLengths: this.arrayLengths,
      arrayItemFields: this.arrayItemFields,
      timestampRange: this.timestampRange
    };
    Object.entries(this.fields).forEach(([key, value]) => {
      result.fields[key] = value.toSerialized();
    });
    return result;
  }

  /** Creates a new log based on the data from `toSerialized()` */
  static fromSerialized(serializedData: any) {
    let log = new Log();
    Object.entries(serializedData.fields).forEach(([key, value]) => {
      log.fields[key] = LogField.fromSerialized(value);
    });
    log.arrayLengths = serializedData.arrayLengths;
    log.arrayItemFields = serializedData.arrayItemFields;
    log.timestampRange = serializedData.timestampRange;
    return log;
  }
}
