import TreeMap from "ts-treemap";
import LoggableType from "./LoggableType";

/** Represents a single field in a log. */
export default interface LogField {
  /** Returns the constant field type. */
  getType(): LoggableType;

  /** Returns the full set of ordered timestamps. */
  getTimestamps(): number[];

  /** Reads a set of Raw values from the field. */
  getRaw(start: number, end: number): TreeMap<number, Uint8Array> | undefined;

  /** Reads a set of Boolean values from the field. */
  getBoolean(start: number, end: number): TreeMap<number, boolean> | undefined;

  /** Reads a set of Number values from the field. */
  getNumber(start: number, end: number): TreeMap<number, number> | undefined;

  /** Reads a set of String values from the field. */
  getString(start: number, end: number): TreeMap<number, string> | undefined;

  /** Reads a set of BooleanArray values from the field. */
  getBooleanArray(start: number, end: number): TreeMap<number, boolean[]> | undefined;

  /** Reads a set of NumberArray values from the field. */
  getNumberArray(start: number, end: number): TreeMap<number, number[]> | undefined;

  /** Reads a set of StringArray values from the field. */
  getStringArray(start: number, end: number): TreeMap<number, string[]> | undefined;

  /** Writes a new Raw value to the field. */
  putRaw(timestamp: number, value: Uint8Array): void;

  /** Writes a new Boolean value to the field. */
  putBoolean(timestamp: number, value: boolean): void;

  /** Writes a new Number value to the field. */
  putNumber(timestamp: number, value: number): void;

  /** Writes a new String value to the field. */
  putString(timestamp: number, value: string): void;

  /** Writes a new BooleanArray value to the field. */
  putBooleanArray(timestamp: number, value: boolean[]): void;

  /** Writes a new NumberArray value to the field. */
  putNumberArray(timestamp: number, value: number[]): void;

  /** Writes a new StringArray value to the field. */
  putStringArray(timestamp: number, value: string[]): void;
}
