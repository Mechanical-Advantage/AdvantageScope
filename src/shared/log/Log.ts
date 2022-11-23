import { arraysEqual } from "../util";
import LogField from "./LogField";
import LogFieldTree from "./LogFieldTree";
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

/** Represents a collection of log fields. */
export default class Log {
  private DEFAULT_TIMESTAMP_RANGE: [number, number] = [0, 10];

  private fields: { [id: string]: LogField } = {};
  private arrayLengths: { [id: string]: number } = {}; // Used to detect when length increases
  private arrayItemFields: string[] = []; // Readonly fields
  private timestampRange: [number, number] | null = null;
  private timestampSetCache: { [id: string]: { keys: string[]; timestamps: number[] } } = {};

  /** Checks if the field exists and registers it if necessary. */
  public createBlankField(key: string, type: LoggableType) {
    if (key in this.fields) return;
    this.fields[key] = new LogField(type);
    if (type == LoggableType.BooleanArray || type == LoggableType.NumberArray || type == LoggableType.StringArray) {
      this.arrayLengths[key] = 0;
    }
  }

  /** Updates the timestamp range and set caches if necessary. */
  private processTimestamp(key: string, timestamp: number) {
    // Update timestamp range
    if (this.timestampRange == null) {
      this.timestampRange = [timestamp, timestamp];
    } else if (timestamp < this.timestampRange[0]) {
      this.timestampRange[0] = timestamp;
    } else if (timestamp > this.timestampRange[1]) {
      this.timestampRange[1] = timestamp;
    }

    // Update timestamp set caches
    Object.values(this.timestampSetCache).forEach((cache) => {
      if (cache.keys.includes(key) && !cache.timestamps.includes(timestamp)) {
        let insertIndex = cache.timestamps.findIndex((x) => x > timestamp);
        if (insertIndex == -1) {
          insertIndex = cache.timestamps.length;
        }
        cache.timestamps.splice(insertIndex, 0, timestamp);
      }
    });
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

  /** Returns the combined timestamps from a set of fields.
   *
   * If a UUID is provided, the last set of keys will be cached so
   * that data can be retrieved more quickly for subsequent calls. */
  getTimestamps(keys: string[], uuid: string | null = null): number[] {
    let output: number[] = [];
    keys = keys.filter((key) => key in this.fields);
    if (keys.length > 1) {
      // Multiple fields, read from cache if possible
      let saveCache = false;
      if (uuid != null) {
        if (uuid in this.timestampSetCache && arraysEqual(this.timestampSetCache[uuid].keys, keys)) {
          return [...this.timestampSetCache[uuid].timestamps];
        }
        this.timestampSetCache[uuid] = {
          keys: keys,
          timestamps: []
        };
        saveCache = true;
      }

      // Get new data
      output = [...new Set(keys.map((key) => this.fields[key].getTimestamps()).flat())];
      output.sort((a, b) => a - b);
      if (saveCache && uuid) this.timestampSetCache[uuid].timestamps = output;
    } else if (keys.length == 1) {
      // Single field
      output = [...this.fields[keys[0]].getTimestamps()];
    }
    return output;
  }

  /** Returns the range of timestamps across all fields. */
  getTimestampRange(): [number, number] {
    if (this.timestampRange == null) {
      return [...this.DEFAULT_TIMESTAMP_RANGE];
    } else {
      return [...this.timestampRange];
    }
  }

  /** Returns the most recent timestamp across all fields. */
  getLastTimestamp(): number {
    let timestamps = this.getTimestamps(this.getFieldKeys());
    return timestamps[timestamps.length - 1];
  }

  /** Organizes the fields into a tree structure. */
  getFieldTree(includeArrayItems: boolean = true): { [id: string]: LogFieldTree } {
    let root: { [id: string]: LogFieldTree } = {};
    Object.keys(this.fields).forEach((key) => {
      if (!includeArrayItems && this.arrayItemFields.includes(key)) return;
      let position: LogFieldTree = { fullKey: null, children: root };
      key
        .slice(key.startsWith("/") ? 1 : 0)
        .split(new RegExp(/\/|:/))
        .forEach((table) => {
          if (table == "") return;
          if (!(table in position.children)) {
            position.children[table] = { fullKey: null, children: {} };
          }
          position = position.children[table];
        });
      position.fullKey = key;
    });
    return root;
  }

  /** Reads a set of generic values from the field. */
  getRange(key: string, start: number, end: number): LogValueSetAny | undefined {
    if (key in this.fields) return this.fields[key].getRange(start, end);
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
    this.createBlankField(key, LoggableType.Raw);
    this.fields[key].putRaw(timestamp, value);
    if (this.fields[key].getType() == LoggableType.Raw) {
      this.processTimestamp(key, timestamp); // Only update timestamp if type is correct
    }
  }

  /** Writes a new Boolean value to the field. */
  putBoolean(key: string, timestamp: number, value: boolean) {
    if (this.arrayItemFields.includes(key)) return;
    this.createBlankField(key, LoggableType.Boolean);
    this.fields[key].putBoolean(timestamp, value);
    if (this.fields[key].getType() == LoggableType.Boolean) {
      this.processTimestamp(key, timestamp); // Only update timestamp if type is correct
    }
  }

  /** Writes a new Number value to the field. */
  putNumber(key: string, timestamp: number, value: number) {
    if (this.arrayItemFields.includes(key)) return;
    this.createBlankField(key, LoggableType.Number);
    this.fields[key].putNumber(timestamp, value);
    if (this.fields[key].getType() == LoggableType.Number) {
      this.processTimestamp(key, timestamp); // Only update timestamp if type is correct
    }
  }

  /** Writes a new String value to the field. */
  putString(key: string, timestamp: number, value: string) {
    if (this.arrayItemFields.includes(key)) return;
    this.createBlankField(key, LoggableType.String);
    this.fields[key].putString(timestamp, value);
    if (this.fields[key].getType() == LoggableType.String) {
      this.processTimestamp(key, timestamp); // Only update timestamp if type is correct
    }
  }

  /** Writes a new BooleanArray value to the field. */
  putBooleanArray(key: string, timestamp: number, value: boolean[]) {
    this.createBlankField(key, LoggableType.BooleanArray);
    if (this.fields[key].getType() == LoggableType.BooleanArray) {
      this.processTimestamp(key, timestamp);
      this.fields[key].putBooleanArray(timestamp, value);
      if (value.length > this.arrayLengths[key]) {
        for (let i = this.arrayLengths[key]; i < value.length; i++) {
          this.fields[key + "/" + i.toString()] = new LogField(LoggableType.Boolean);
          this.arrayItemFields.push(key + "/" + i.toString());
        }
        this.arrayLengths[key] = value.length;
      }
      for (let i = 0; i < value.length; i++) {
        this.processTimestamp(key + "/" + i.toString(), timestamp);
        this.fields[key + "/" + i.toString()].putBoolean(timestamp, value[i]);
      }
    }
  }

  /** Writes a new NumberArray value to the field. */
  putNumberArray(key: string, timestamp: number, value: number[]) {
    this.createBlankField(key, LoggableType.NumberArray);
    if (this.fields[key].getType() == LoggableType.NumberArray) {
      this.processTimestamp(key, timestamp);
      this.fields[key].putNumberArray(timestamp, value);
      if (value.length > this.arrayLengths[key]) {
        for (let i = this.arrayLengths[key]; i < value.length; i++) {
          this.fields[key + "/" + i.toString()] = new LogField(LoggableType.Number);
          this.arrayItemFields.push(key + "/" + i.toString());
        }
        this.arrayLengths[key] = value.length;
      }
      for (let i = 0; i < value.length; i++) {
        this.processTimestamp(key + "/" + i.toString(), timestamp);
        this.fields[key + "/" + i.toString()].putNumber(timestamp, value[i]);
      }
    }
  }

  /** Writes a new StringArray value to the field. */
  putStringArray(key: string, timestamp: number, value: string[]) {
    this.createBlankField(key, LoggableType.StringArray);
    if (this.fields[key].getType() == LoggableType.StringArray) {
      this.processTimestamp(key, timestamp);
      this.fields[key].putStringArray(timestamp, value);
      if (value.length > this.arrayLengths[key]) {
        for (let i = this.arrayLengths[key]; i < value.length; i++) {
          this.fields[key + "/" + i.toString()] = new LogField(LoggableType.String);
          this.arrayItemFields.push(key + "/" + i.toString());
        }
        this.arrayLengths[key] = value.length;
      }
      for (let i = 0; i < value.length; i++) {
        this.processTimestamp(key + "/" + i.toString(), timestamp);
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
  static fromSerialized(serializedData: any): Log {
    let log = new Log();
    Object.entries(serializedData.fields).forEach(([key, value]) => {
      log.fields[key] = LogField.fromSerialized(value);
    });
    log.arrayLengths = serializedData.arrayLengths;
    log.arrayItemFields = serializedData.arrayItemFields;
    log.timestampRange = serializedData.timestampRange;
    return log;
  }

  /** Merges two log objects with no overlapping fields. */
  static mergeLogs(firstLog: Log, secondLog: Log, timestampOffset: number): Log {
    // Serialize logs and adjust timestamps
    let firstSerialized = firstLog.toSerialized();
    let secondSerialized = secondLog.toSerialized();
    Object.values(secondSerialized.fields).forEach((field) => {
      let newField = field as { timestamps: number[]; values: number[] };
      newField.timestamps = newField.timestamps.map((timestamp) => timestamp + timestampOffset);
    });
    if (secondSerialized.timestampRange) {
      secondSerialized.timestampRange = (secondSerialized.timestampRange as number[]).map(
        (timestamp) => timestamp + timestampOffset
      );
    }

    // Merge logs
    let log = new Log();
    Object.entries(firstSerialized.fields).forEach(([key, value]) => {
      log.fields[key] = LogField.fromSerialized(value);
    });
    Object.entries(secondSerialized.fields).forEach(([key, value]) => {
      log.fields[key] = LogField.fromSerialized(value);
    });
    log.arrayLengths = { ...firstSerialized.arrayLengths, ...secondSerialized.arrayLengths };
    log.arrayItemFields = [...firstSerialized.arrayItemFields, ...secondSerialized.arrayItemFields];
    if (firstSerialized.timestampRange && secondSerialized.timestampRange) {
      log.timestampRange = [
        Math.min(firstSerialized.timestampRange[0], secondSerialized.timestampRange[0]),
        Math.max(firstSerialized.timestampRange[1], secondSerialized.timestampRange[1])
      ];
    } else if (firstSerialized.timestampRange) {
      log.timestampRange = firstSerialized.timestampRange;
    } else if (secondSerialized.timestampRange) {
      log.timestampRange = secondSerialized.timestampRange;
    }
    return log;
  }
}
