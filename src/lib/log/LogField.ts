import TreeMap from "ts-treemap";
import LoggableType from "./LoggableType";

/** A full log field that contains data. */
export default class LogField {
  private type: LoggableType;
  private data = new TreeMap<number, any>();

  constructor(type: LoggableType) {
    this.type = type;
  }

  /** Returns the constant field type. */
  getType(): LoggableType {
    return this.type;
  }

  /** Returns the full set of ordered timestamps. */
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

  /** Reads a set of Raw values from the field. */
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

  /** Reads a set of Boolean values from the field. */
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

  /** Reads a set of Number values from the field. */
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

  /** Reads a set of String values from the field. */
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

  /** Reads a set of BooleanArray values from the field. */
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

  /** Reads a set of NumberArray values from the field. */
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

  /** Reads a set of StringArray values from the field. */
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

  /** Writes a new Raw value to the field. */
  putRaw(timestamp: number, value: Uint8Array) {
    if (this.type == LoggableType.Raw) this.data.set(timestamp, value);
  }

  /** Writes a new Boolean value to the field. */
  putBoolean(timestamp: number, value: boolean) {
    if (this.type == LoggableType.Boolean) this.data.set(timestamp, value);
  }

  /** Writes a new Number value to the field. */
  putNumber(timestamp: number, value: number) {
    if (this.type == LoggableType.Number) this.data.set(timestamp, value);
  }

  /** Writes a new String value to the field. */
  putString(timestamp: number, value: string) {
    if (this.type == LoggableType.String) this.data.set(timestamp, value);
  }

  /** Writes a new BooleanArray value to the field. */
  putBooleanArray(timestamp: number, value: boolean[]) {
    if (this.type == LoggableType.BooleanArray) this.data.set(timestamp, value);
  }

  /** Writes a new NumberArray value to the field. */
  putNumberArray(timestamp: number, value: number[]) {
    if (this.type == LoggableType.NumberArray) this.data.set(timestamp, value);
  }

  /** Writes a new StringArray value to the field. */
  putStringArray(timestamp: number, value: string[]) {
    if (this.type == LoggableType.StringArray) this.data.set(timestamp, value);
  }
}
