import TreeMap from "ts-treemap";
import LogField from "./LogField";
import LoggableType from "./LoggableType";

/** A full log field that contains data. */
export default class LogFieldBase implements LogField {
  private type: LoggableType;
  private data = new TreeMap<number, any>();

  private arrayLength: number = 0;
  private arrayLengthCallbacks: ((oldLength: number, newLength: number) => void)[] = [];

  constructor(type: LoggableType) {
    this.type = type;
  }

  /** Registers a callback function to be triggered when the array length increases. */
  registerArrayLengthCallback(callback: (oldLength: number, newLength: number) => void) {
    this.arrayLengthCallbacks.push(callback);
  }

  getType(): LoggableType {
    return this.type;
  }

  getTimestamps(): number[] {
    const iterator = this.data.keys();
    const output: number[] = [];
    while (true) {
      const result = iterator.next();
      if (result.done) break;
      output.push(result.value);
    }
    return output;
  }

  /** Returns the values in the specified timestamp range. */
  private getRange(start: number, end: number): TreeMap<number, any> {
    let output = this.data;
    const floor = this.data.floorKey(start);
    if (floor != undefined) {
      output = output.splitHigher(floor);
    }
    const ceiling = this.data.ceilingKey(end);
    if (ceiling != undefined) {
      output = output.splitLower(ceiling);
    }
    return output;
  }

  getRaw(start: number, end: number): TreeMap<number, Uint8Array> | undefined {
    if (this.type == LoggableType.Raw) {
      const iterator = this.getRange(start, end).entries();
      const output = new TreeMap<number, Uint8Array>();
      while (true) {
        const result = iterator.next();
        if (result.done) break;
        const key = result.value[0];
        const value = result.value[1];
        output.set(key, value);
      }
      return output;
    }
  }

  getBoolean(start: number, end: number): TreeMap<number, boolean> | undefined {
    if (this.type == LoggableType.Boolean) {
      const iterator = this.getRange(start, end).entries();
      const output = new TreeMap<number, boolean>();
      while (true) {
        const result = iterator.next();
        if (result.done) break;
        const key = result.value[0];
        const value = result.value[1];
        output.set(key, value);
      }
      return output;
    }
  }

  getNumber(start: number, end: number): TreeMap<number, number> | undefined {
    if (this.type == LoggableType.Number) {
      const iterator = this.getRange(start, end).entries();
      const output = new TreeMap<number, number>();
      while (true) {
        const result = iterator.next();
        if (result.done) break;
        const key = result.value[0];
        const value = result.value[1];
        output.set(key, value);
      }
      return output;
    }
  }

  getString(start: number, end: number): TreeMap<number, string> | undefined {
    if (this.type == LoggableType.String) {
      const iterator = this.getRange(start, end).entries();
      const output = new TreeMap<number, string>();
      while (true) {
        const result = iterator.next();
        if (result.done) break;
        const key = result.value[0];
        const value = result.value[1];
        output.set(key, value);
      }
      return output;
    }
  }

  getBooleanArray(start: number, end: number): TreeMap<number, boolean[]> | undefined {
    if (this.type == LoggableType.BooleanArray) {
      const iterator = this.getRange(start, end).entries();
      const output = new TreeMap<number, boolean[]>();
      while (true) {
        const result = iterator.next();
        if (result.done) break;
        const key = result.value[0];
        const value = result.value[1];
        output.set(key, value);
      }
      return output;
    }
  }

  getNumberArray(start: number, end: number): TreeMap<number, number[]> | undefined {
    if (this.type == LoggableType.NumberArray) {
      const iterator = this.getRange(start, end).entries();
      const output = new TreeMap<number, number[]>();
      while (true) {
        const result = iterator.next();
        if (result.done) break;
        const key = result.value[0];
        const value = result.value[1];
        output.set(key, value);
      }
      return output;
    }
  }

  getStringArray(start: number, end: number): TreeMap<number, string[]> | undefined {
    if (this.type == LoggableType.StringArray) {
      const iterator = this.getRange(start, end).entries();
      const output = new TreeMap<number, string[]>();
      while (true) {
        const result = iterator.next();
        if (result.done) break;
        const key = result.value[0];
        const value = result.value[1];
        output.set(key, value);
      }
      return output;
    }
  }

  /** Writes a new Raw value to the field (if the type matches). */
  putRaw(timestamp: number, value: Uint8Array) {
    if (this.type == LoggableType.Raw) this.data.set(timestamp, value);
  }

  /** Writes a new Boolean value to the field (if the type matches). */
  putBoolean(timestamp: number, value: boolean) {
    if (this.type == LoggableType.Boolean) this.data.set(timestamp, value);
  }

  /** Writes a new Number value to the field (if the type matches). */
  putNumber(timestamp: number, value: number) {
    if (this.type == LoggableType.Number) this.data.set(timestamp, value);
  }

  /** Writes a new String value to the field (if the type matches). */
  putString(timestamp: number, value: string) {
    if (this.type == LoggableType.String) this.data.set(timestamp, value);
  }

  /** Writes a new BooleanArray value to the field (if the type matches). */
  putBooleanArray(timestamp: number, value: boolean[]) {
    if (this.type == LoggableType.BooleanArray) {
      this.data.set(timestamp, value);
      if (this.arrayLength < value.length) {
        const oldLength = this.arrayLength;
        this.arrayLength = value.length;
        this.arrayLengthCallbacks.forEach((callback) => callback(oldLength, this.arrayLength));
      }
    }
  }

  /** Writes a new NumberArray value to the field (if the type matches). */
  putNumberArray(timestamp: number, value: number[]) {
    if (this.type == LoggableType.NumberArray) {
      this.data.set(timestamp, value);
      if (this.arrayLength < value.length) {
        const oldLength = this.arrayLength;
        this.arrayLength = value.length;
        this.arrayLengthCallbacks.forEach((callback) => callback(oldLength, this.arrayLength));
      }
    }
  }

  /** Writes a new StringArray value to the field (if the type matches). */
  putStringArray(timestamp: number, value: string[]) {
    if (this.type == LoggableType.StringArray) {
      this.data.set(timestamp, value);
      if (this.arrayLength < value.length) {
        const oldLength = this.arrayLength;
        this.arrayLength = value.length;
        this.arrayLengthCallbacks.forEach((callback) => callback(oldLength, this.arrayLength));
      }
    }
  }
}
