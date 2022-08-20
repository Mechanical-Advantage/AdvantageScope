import TreeMap from "ts-treemap";
import LogField from "./LogField";
import LogFieldBase from "./LogFieldBase";
import LoggableType from "./LoggableType";

/** A minimal log field that represents a single item in an array field. */
export default class LogFieldArrayItem implements LogField {
  private type: LoggableType;
  private parent: LogFieldBase;
  private index: number;

  constructor(parent: LogFieldBase, index: number) {
    switch (parent.getType()) {
      case LoggableType.BooleanArray:
        this.type = LoggableType.Boolean;
        break;
      case LoggableType.NumberArray:
        this.type = LoggableType.Number;
        break;
      case LoggableType.StringArray:
        this.type = LoggableType.String;
        break;
      default:
        throw new Error("Parent field is not an array.");
    }
    this.parent = parent;
    this.index = index;
  }

  getType(): LoggableType {
    return this.type;
  }

  getTimestamps(): number[] {
    let iterator: IterableIterator<number> | undefined;
    switch (this.type) {
      case LoggableType.Boolean:
        iterator = this.getBoolean(-Infinity, Infinity)?.keys();
        break;
      case LoggableType.Number:
        iterator = this.getNumber(-Infinity, Infinity)?.keys();
        break;
      case LoggableType.String:
        iterator = this.getString(-Infinity, Infinity)?.keys();
        break;
    }
    if (iterator != undefined) {
      const output: number[] = [];
      while (true) {
        const result = iterator.next();
        if (result.done) break;
        output.push(result.value);
      }
    }
    return [];
  }

  getBoolean(start: number, end: number): TreeMap<number, boolean> | undefined {
    if (this.type == LoggableType.Boolean) {
      const iterator = this.parent.getBooleanArray(start, end)?.entries();
      if (iterator != null) {
        const output = new TreeMap<number, boolean>();
        while (true) {
          const result = iterator.next();
          if (result.done) break;
          const key = result.value[0];
          const value = result.value[1];
          if (value.length > this.index) output.set(key, value[this.index]);
        }
        return output;
      }
    }
  }

  getNumber(start: number, end: number): TreeMap<number, number> | undefined {
    if (this.type == LoggableType.Number) {
      const iterator = this.parent.getNumberArray(start, end)?.entries();
      if (iterator != null) {
        const output = new TreeMap<number, number>();
        while (true) {
          const result = iterator.next();
          if (result.done) break;
          const key = result.value[0];
          const value = result.value[1];
          if (value.length > this.index) output.set(key, value[this.index]);
        }
        return output;
      }
    }
  }

  getString(start: number, end: number): TreeMap<number, string> | undefined {
    if (this.type == LoggableType.String) {
      const iterator = this.parent.getStringArray(start, end)?.entries();
      if (iterator != null) {
        const output = new TreeMap<number, string>();
        while (true) {
          const result = iterator.next();
          if (result.done) break;
          const key = result.value[0];
          const value = result.value[1];
          if (value.length > this.index) output.set(key, value[this.index]);
        }
        return output;
      }
    }
  }

  // Unsupported methods:

  getRaw(start: number, end: number): TreeMap<number, Uint8Array> | undefined {
    return undefined;
  }
  getBooleanArray(start: number, end: number): TreeMap<number, boolean[]> | undefined {
    return undefined;
  }
  getNumberArray(start: number, end: number): TreeMap<number, number[]> | undefined {
    return undefined;
  }
  getStringArray(start: number, end: number): TreeMap<number, string[]> | undefined {
    return undefined;
  }
  putRaw(timestamp: number, value: Uint8Array): void {}
  putBoolean(timestamp: number, value: boolean): void {}
  putNumber(timestamp: number, value: number): void {}
  putString(timestamp: number, value: string): void {}
  putBooleanArray(timestamp: number, value: boolean[]): void {}
  putNumberArray(timestamp: number, value: number[]): void {}
  putStringArray(timestamp: number, value: string[]): void {}
}
