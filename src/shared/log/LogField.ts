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
import { OrderedSet } from "js-sdsl";
function cmp(x: { timestamp: number; values: number }, y: { timestamp: number; values: number }): number {
  return x.timestamp - y.timestamp;
}
/** A full log field that contains data. */
export default class LogField {
  private type: LoggableType;
  private data: OrderedSet<{ timestamp: number; values: number }> = new OrderedSet([], cmp);
  public structuredType: string | null = null;
  public wpilibType: string | null = null; // Original type from WPILOG & NT4
  public metadataString = "";
  public typeWarning = false; // Flag that there was an attempt to write a conflicting type

  // Toggles when first value is removed, useful for creating striping effects that persist as data is updated
  private stripingReference = false;

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
    return Array.from(this.data, (elem) => elem.timestamp);
  }
  getValues(): number[] {
    return Array.from(this.data, (elem) => elem.values);
  }

  /** Clears all data before the provided timestamp. */
  clearBeforeTime(timestamp: number) {
    var itr = this.data.begin();
    while (itr.isAccessible) {
      if (itr.pointer.timestamp >= timestamp) {
        break;
      }
      this.data.eraseElementByIterator(itr);
      itr.next();
    }
  }

  /** Returns the values in the specified timestamp range. */
  getRange(start: number, end: number): LogValueSetAny {
    var timestamps = [];
    var values = [];

    var itr = this.data.reverseUpperBound({ timestamp: start, values: 0 });
    while (itr.isAccessible()) {
      if (itr.pointer.timestamp > end) {
        break;
      }
      timestamps.push(itr.pointer.timestamp);
      values.push(itr.pointer.values);
      itr.next();
    }

    return { timestamps: timestamps, values: values };
  }

  /** Reads a set of Raw values from the field. */
  getRaw(start: number, end: number): LogValueSetRaw | undefined {
    if (this.type === LoggableType.Raw) return this.getRange(start, end);
  }

  /** Reads a set of Boolean values from the field. */
  getBoolean(start: number, end: number): LogValueSetBoolean | undefined {
    if (this.type === LoggableType.Boolean) return this.getRange(start, end);
  }

  /** Reads a set of Number values from the field. */
  getNumber(start: number, end: number): LogValueSetNumber | undefined {
    if (this.type === LoggableType.Number) return this.getRange(start, end);
  }

  /** Reads a set of String values from the field. */
  getString(start: number, end: number): LogValueSetString | undefined {
    if (this.type === LoggableType.String) return this.getRange(start, end);
  }

  /** Reads a set of BooleanArray values from the field. */
  getBooleanArray(start: number, end: number): LogValueSetBooleanArray | undefined {
    if (this.type === LoggableType.BooleanArray) return this.getRange(start, end);
  }

  /** Reads a set of NumberArray values from the field. */
  getNumberArray(start: number, end: number): LogValueSetNumberArray | undefined {
    if (this.type === LoggableType.NumberArray) return this.getRange(start, end);
  }

  /** Reads a set of StringArray values from the field. */
  getStringArray(start: number, end: number): LogValueSetStringArray | undefined {
    if (this.type === LoggableType.StringArray) return this.getRange(start, end);
  }
  // private findIndex(func: any)

  /** Inserts a new value at the correct index. */
  private putData(timestamp: number, value: any) {
    // return
    if (value === null) return;

    // Find position to insert based on timestamp
    // let insertIndex: number;
    // // this.data.rEnd().
    // if (this.data.length > 0 && timestamp > this.data.timestamps[this.data.timestamps.length - 1]) {
    //   // There's a good chance this data is at the end of the log, so check that first
    //   insertIndex = this.data.timestamps.length;
    // } else {
    //   // Adding in the middle, find where to insert it
    //   let alreadyExists = false;
    //   insertIndex =
    //     this.data.timestamps.findLastIndex((x) => {
    //       if (alreadyExists) return;
    //       if (x === timestamp) alreadyExists = true;
    //       return x < timestamp;
    //     }) + 1;
    //   if (alreadyExists) {
    //     this.data.values[this.data.timestamps.indexOf(timestamp)] = value;
    //     return;
    //   }
    // }
    // if (insertIndex >= 0) {
    //   console.log("Looking for past:" + value);
    // }
    //find insert point if set overwrite it with new data
    // if not
    // check element behind
    // if that element is not equal set the value
    // else do nothing
    // this.data.end();
    var record = { timestamp: timestamp, values: value };
    this.data.insert(record);
    return;
    var needle = this.data.find(record);

    if (needle.isAccessible()) {
      this.data.insert(record);
    } else {
      var pastElem = this.data.reverseUpperBound(record);
      if (pastElem.isAccessible()) {
        if (logValuesEqual(this.type, value, pastElem.pointer)) {
          this.data.updateKeyByIterator(pastElem, record);
        } else {
          this.data.insert(record);
        }
      }
    }
    // // Compare to adjacent values
    // if (insertIndex > 0 && logValuesEqual(this.type, value, this.data.values[insertIndex - 1])) {
    //   // Same as the previous value
    // } else if (
    //   insertIndex < this.data.values.length &&
    //   logValuesEqual(this.type, value, this.data.values[insertIndex])
    // ) {
    //   // Same as the next value
    //   this.data.timestamps[insertIndex] = timestamp;
    // } else {
    //   // New value
    //   this.data.timestamps.splice(insertIndex, 0, timestamp);
    //   this.data.values.splice(insertIndex, 0, value);
    // }
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
    // console.log(this.getValues());
    // console.log(this.getTimestamps());
    return {
      type: this.type,
      timestamps: this.getTimestamps(),
      values: this.getValues(),
      structuredType: this.structuredType,
      wpilibType: this.wpilibType,
      metadataString: this.metadataString,
      stripingReference: this.stripingReference,
      typeWarning: this.typeWarning
    };
  }

  /** Creates a new field based on the data from `toSerialized()` */
  static fromSerialized(serializedData: any) {
    console.log("ASDFASDFASDFSDAFASD_A_SDF_ASD_FA_SD_F");
    let field = new LogField(serializedData.type);
    field.data = new OrderedSet<{ timestamp: number; values: number }>([], cmp);
    field.structuredType = serializedData.structuredType;
    field.wpilibType = serializedData.wpilibType;
    field.metadataString = serializedData.metadataString;
    field.stripingReference = serializedData.stripingReference;
    field.typeWarning = serializedData.typeWarning;
    return field;
  }
}
