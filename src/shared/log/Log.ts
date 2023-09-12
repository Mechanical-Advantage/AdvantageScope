import { Decoder } from "@msgpack/msgpack";
import { arraysEqual, checkArrayType } from "../util";
import LogField from "./LogField";
import LogFieldTree from "./LogFieldTree";
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
import LoggableType from "./LoggableType";

/** Represents a collection of log fields. */
export default class Log {
  private DEFAULT_TIMESTAMP_RANGE: [number, number] = [0, 10];
  private msgpackDecoder = new Decoder();

  private fields: { [id: string]: LogField } = {};
  private readOnlyFields: Set<string> = new Set(); // Used for arrays and structured data
  private timestampRange: [number, number] | null = null;
  private enableTimestampSetCache: boolean;
  private timestampSetCache: { [id: string]: { keys: string[]; timestamps: number[] } } = {};

  constructor(enableTimestampSetCache = true) {
    this.enableTimestampSetCache = enableTimestampSetCache;
  }

  /** Checks if the field exists and registers it if necessary. */
  public createBlankField(key: string, type: LoggableType) {
    if (key in this.fields) return;
    this.fields[key] = new LogField(type);
  }

  /** Clears all data before the provided timestamp. */
  clearBeforeTime(timestamp: number) {
    if (this.timestampRange !== null && this.timestampRange[0] < timestamp) {
      this.timestampRange[0] = timestamp;
    }
    Object.values(this.timestampSetCache).forEach((cache) => {
      while (cache.timestamps.length >= 2 && cache.timestamps[1] <= timestamp) {
        cache.timestamps.shift();
      }
    });
    Object.values(this.fields).forEach((field) => {
      field.clearBeforeTime(timestamp);
    });
  }

  /** Updates the timestamp range and set caches if necessary. */
  private processTimestamp(key: string, timestamp: number) {
    // Update timestamp range
    if (this.timestampRange === null) {
      this.timestampRange = [timestamp, timestamp];
    } else if (timestamp < this.timestampRange[0]) {
      this.timestampRange[0] = timestamp;
    } else if (timestamp > this.timestampRange[1]) {
      this.timestampRange[1] = timestamp;
    }

    // Update timestamp set caches
    if (this.enableTimestampSetCache) {
      Object.values(this.timestampSetCache).forEach((cache) => {
        if (cache.keys.includes(key) && !cache.timestamps.includes(timestamp)) {
          let insertIndex = cache.timestamps.findIndex((x) => x > timestamp);
          if (insertIndex === -1) {
            insertIndex = cache.timestamps.length;
          }
          cache.timestamps.splice(insertIndex, 0, timestamp);
        }
      });
    }
  }

  /** Returns an array of registered field keys. */
  getFieldKeys(): string[] {
    return Object.keys(this.fields);
  }

  /** Returns the count of fields (excluding array item fields). */
  getFieldCount(): number {
    return Object.keys(this.fields).filter((field) => !this.isReadOnly(field)).length;
  }

  /** Returns the constant field type. */
  getType(key: string): LoggableType | undefined {
    if (key in this.fields) {
      return this.fields[key].getType();
    } else {
      return undefined;
    }
  }

  /** Returns a boolean that toggles when a value is removed from the field. */
  getStripingReference(key: string): boolean {
    if (key in this.fields) {
      return this.fields[key].getStripingReference();
    } else {
      return false;
    }
  }

  /** Returns whether the key is read only. */
  isReadOnly(key: string) {
    return this.readOnlyFields.has(key);
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
      if (uuid !== null && this.enableTimestampSetCache) {
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
    } else if (keys.length === 1) {
      // Single field
      output = [...this.fields[keys[0]].getTimestamps()];
    }
    return output;
  }

  /** Returns the range of timestamps across all fields. */
  getTimestampRange(): [number, number] {
    if (this.timestampRange === null) {
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
  getFieldTree(includeReadOnly: boolean = true, prefix: string = ""): { [id: string]: LogFieldTree } {
    let root: { [id: string]: LogFieldTree } = {};
    Object.keys(this.fields).forEach((key) => {
      if (!includeReadOnly && this.isReadOnly(key)) return;
      if (!key.startsWith(prefix)) return;
      let position: LogFieldTree = { fullKey: null, children: root };
      key = key.slice(prefix.length);
      key
        .slice(key.startsWith("/") ? 1 : 0)
        .split(new RegExp(/\/|:/))
        .forEach((table) => {
          if (table === "") return;
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
  putRaw(key: string, timestamp: number, value: Uint8Array, allowReadOnly = false) {
    if (!allowReadOnly && this.isReadOnly(key)) return;
    this.createBlankField(key, LoggableType.Raw);
    this.fields[key].putRaw(timestamp, value);
    if (this.fields[key].getType() === LoggableType.Raw) {
      this.processTimestamp(key, timestamp); // Only update timestamp if type is correct
    }
  }

  /** Writes a new Boolean value to the field. */
  putBoolean(key: string, timestamp: number, value: boolean, allowReadOnly = false) {
    if (!allowReadOnly && this.isReadOnly(key)) return;
    this.createBlankField(key, LoggableType.Boolean);
    this.fields[key].putBoolean(timestamp, value);
    if (this.fields[key].getType() === LoggableType.Boolean) {
      this.processTimestamp(key, timestamp); // Only update timestamp if type is correct
    }
  }

  /** Writes a new Number value to the field. */
  putNumber(key: string, timestamp: number, value: number, allowReadOnly = false) {
    if (!allowReadOnly && this.isReadOnly(key)) return;
    this.createBlankField(key, LoggableType.Number);
    this.fields[key].putNumber(timestamp, value);
    if (this.fields[key].getType() === LoggableType.Number) {
      this.processTimestamp(key, timestamp); // Only update timestamp if type is correct
    }
  }

  /** Writes a new String value to the field. */
  putString(key: string, timestamp: number, value: string, allowReadOnly = false) {
    if (!allowReadOnly && this.isReadOnly(key)) return;
    this.createBlankField(key, LoggableType.String);
    this.fields[key].putString(timestamp, value);
    if (this.fields[key].getType() === LoggableType.String) {
      this.processTimestamp(key, timestamp); // Only update timestamp if type is correct
    }
  }

  /** Writes a new BooleanArray value to the field. */
  putBooleanArray(key: string, timestamp: number, value: boolean[], allowReadOnly = false) {
    if (!allowReadOnly && this.isReadOnly(key)) return;
    this.createBlankField(key, LoggableType.BooleanArray);
    this.fields[key].putBooleanArray(timestamp, value);
    if (this.fields[key].getType() === LoggableType.BooleanArray) {
      this.processTimestamp(key, timestamp);
      {
        let lengthKey = key + "/length";
        this.createBlankField(lengthKey, LoggableType.Number);
        this.processTimestamp(lengthKey, timestamp);
        this.readOnlyFields.add(lengthKey);
        this.fields[lengthKey].putNumber(timestamp, value.length);
      }
      for (let i = 0; i < value.length; i++) {
        if (this.enableTimestampSetCache) {
          // Only useful for timestamp set cache
          this.processTimestamp(key + "/" + i.toString(), timestamp);
        }
        let itemKey = key + "/" + i.toString();
        this.createBlankField(itemKey, LoggableType.Boolean);
        this.readOnlyFields.add(itemKey);
        this.fields[itemKey].putBoolean(timestamp, value[i]);
      }
    }
  }

  /** Writes a new NumberArray value to the field. */
  putNumberArray(key: string, timestamp: number, value: number[], allowReadOnly = false) {
    if (!allowReadOnly && this.isReadOnly(key)) return;
    this.createBlankField(key, LoggableType.NumberArray);
    this.fields[key].putNumberArray(timestamp, value);
    if (this.fields[key].getType() === LoggableType.NumberArray) {
      this.processTimestamp(key, timestamp);
      {
        let lengthKey = key + "/length";
        this.createBlankField(lengthKey, LoggableType.Number);
        this.processTimestamp(lengthKey, timestamp);
        this.readOnlyFields.add(lengthKey);
        this.fields[lengthKey].putNumber(timestamp, value.length);
      }
      for (let i = 0; i < value.length; i++) {
        if (this.enableTimestampSetCache) {
          // Only useful for timestamp set cache
          this.processTimestamp(key + "/" + i.toString(), timestamp);
        }
        let itemKey = key + "/" + i.toString();
        this.createBlankField(itemKey, LoggableType.Number);
        this.readOnlyFields.add(itemKey);
        this.fields[itemKey].putNumber(timestamp, value[i]);
      }
    }
  }

  /** Writes a new StringArray value to the field. */
  putStringArray(key: string, timestamp: number, value: string[], allowReadOnly = false) {
    if (!allowReadOnly && this.isReadOnly(key)) return;
    this.createBlankField(key, LoggableType.StringArray);
    this.fields[key].putStringArray(timestamp, value);
    if (this.fields[key].getType() === LoggableType.StringArray) {
      this.processTimestamp(key, timestamp);
      {
        let lengthKey = key + "/length";
        this.createBlankField(lengthKey, LoggableType.Number);
        this.processTimestamp(lengthKey, timestamp);
        this.readOnlyFields.add(lengthKey);
        this.fields[lengthKey].putNumber(timestamp, value.length);
      }
      for (let i = 0; i < value.length; i++) {
        if (this.enableTimestampSetCache) {
          // Only useful for timestamp set cache
          this.processTimestamp(key + "/" + i.toString(), timestamp);
        }
        let itemKey = key + "/" + i.toString();
        this.createBlankField(itemKey, LoggableType.String);
        this.readOnlyFields.add(itemKey);
        this.fields[itemKey].putString(timestamp, value[i]);
      }
    }
  }

  /** Writes an unknown array or object to the children of the field. */
  private putUnknownStruct(key: string, timestamp: number, value: unknown, allowRootWrite = false) {
    if (value === null) return;

    // Check for primitive types first (if first call, writing to the root is not allowed)
    switch (typeof value) {
      case "boolean":
        if (!allowRootWrite) return;
        this.readOnlyFields.add(key);
        this.putBoolean(key, timestamp, value, true);
        return;
      case "number":
        this.readOnlyFields.add(key);
        this.putNumber(key, timestamp, value, true);
        return;
      case "string":
        if (!allowRootWrite) return;
        this.readOnlyFields.add(key);
        this.putString(key, timestamp, value, true);
        return;
    }
    if (value instanceof Uint8Array) {
      if (!allowRootWrite) return;
      this.readOnlyFields.add(key);
      this.putRaw(key, timestamp, value, true);
      return;
    }

    // Not a primitive, call recursively
    if (Array.isArray(value)) {
      // If all items are the same type, add whole array
      if (allowRootWrite && checkArrayType(value, "boolean")) {
        this.readOnlyFields.add(key);
        this.putBooleanArray(key, timestamp, value, true);
      } else if (allowRootWrite && checkArrayType(value, "number")) {
        this.readOnlyFields.add(key);
        this.putNumberArray(key, timestamp, value, true);
      } else if (allowRootWrite && checkArrayType(value, "string")) {
        this.readOnlyFields.add(key);
        this.putStringArray(key, timestamp, value, true);
      } else {
        // Add array items as unknown structs
        {
          let lengthKey = key + "/length";
          this.createBlankField(lengthKey, LoggableType.Number);
          this.processTimestamp(lengthKey, timestamp);
          this.readOnlyFields.add(key);
          this.fields[lengthKey].putNumber(timestamp, value.length);
        }
        for (let i = 0; i < value.length; i++) {
          this.putUnknownStruct(key + "/" + i.toString(), timestamp, value[i], true);
        }
      }
    } else if (typeof value === "object") {
      // Add object entries
      for (const [objectKey, objectValue] of Object.entries(value)) {
        this.putUnknownStruct(key + "/" + objectKey, timestamp, objectValue, true);
      }
    }
  }

  /** Writes a JSON-encoded string value to the field. */
  putJSON(key: string, timestamp: number, value: string) {
    if (this.isReadOnly(key)) return;
    this.createBlankField(key, LoggableType.String);
    this.putString(key, timestamp, value);
    if (this.fields[key].getType() === LoggableType.String) {
      this.processTimestamp(key, timestamp);
      let decodedValue: unknown = null;
      try {
        decodedValue = JSON.parse(value) as unknown;
      } catch {}
      if (decodedValue !== null) {
        this.putUnknownStruct(key, timestamp, decodedValue);
      }
    }
  }

  /** Writes a msgpack-encoded raw value to the field. */
  putMsgpack(key: string, timestamp: number, value: Uint8Array) {
    if (this.isReadOnly(key)) return;
    this.createBlankField(key, LoggableType.Raw);
    this.putRaw(key, timestamp, value);
    if (this.fields[key].getType() === LoggableType.Raw) {
      this.processTimestamp(key, timestamp);
      let decodedValue: unknown = null;
      try {
        decodedValue = this.msgpackDecoder.decode(value);
      } catch {}
      if (decodedValue !== null) {
        this.putUnknownStruct(key, timestamp, decodedValue);
      }
    }
  }

  /** Returns a serialized version of the data from this log. */
  toSerialized(): any {
    let result: any = {
      fields: {},
      readOnlyFields: Array.from(this.readOnlyFields),
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
    log.readOnlyFields = new Set(serializedData.readOnlyFields);
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
    log.readOnlyFields = new Set([...firstSerialized.readOnlyFields, ...secondSerialized.readOnlyFields]);
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
