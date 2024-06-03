import { re } from "mathjs";
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
type LogRecord = {
  timestamp: number;
  value: any;
};
/** A full log field that contains data. */
export default class LogField {
  private type: LoggableType;
  private data: LogValueSetAny = { timestamps: [], values: [] };
  public structuredType: string | null = null;
  public wpilibType: string | null = null; // Original type from WPILOG & NT4
  public metadataString = "";
  public typeWarning = false; // Flag that there was an attempt to write a conflicting type
  private enableLiveSorting: boolean;
  // Toggles when first value is removed, useful for creating striping effects that persist as data is updated
  private stripingReference = false;
  private rawData: LogRecord[] = [];
  constructor(type: LoggableType, enableLiveSorting = true) {
    this.type = type;
    this.enableLiveSorting = enableLiveSorting;
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
    return this.data.timestamps;
  }

  /** Clears all data before the provided timestamp. */
  clearBeforeTime(timestamp: number) {
    while (this.data.timestamps.length >= 2 && this.data.timestamps[1] < timestamp) {
      this.data.timestamps.shift();
      this.data.values.shift();
      this.stripingReference = !this.stripingReference;
    }
    if (this.data.timestamps.length > 0 && this.data.timestamps[0] < timestamp) {
      this.data.timestamps[0] = timestamp;
    }
  }

  /** Returns the values in the specified timestamp range. */
  getRange(start: number, end: number): LogValueSetAny {
    let timestamps: number[];
    let values: any[];

    let startValueIndex = this.data.timestamps.findIndex((x) => x > start);
    if (startValueIndex === -1) {
      startValueIndex = this.data.timestamps.length - 1;
    } else if (startValueIndex !== 0) {
      startValueIndex -= 1;
    }

    let endValueIndex = this.data.timestamps.findIndex((x) => x >= end);
    if (endValueIndex === -1 || endValueIndex === this.data.timestamps.length - 1) {
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

  /** Inserts a new value at the correct index. */
  private putData(timestamp: number, value: any) {
    if (this.enableLiveSorting) {
      if (value === null) return;

      // Find position to insert based on timestamp
      let insertIndex: number;
      if (this.data.timestamps.length > 0 && timestamp > this.data.timestamps[this.data.timestamps.length - 1]) {
        // There's a good chance this data is at the end of the log, so check that first
        insertIndex = this.data.timestamps.length;
      } else {
        // Adding in the middle, find where to insert it
        let alreadyExists = false;
        insertIndex =
          this.data.timestamps.findLastIndex((x) => {
            if (alreadyExists) return;
            if (x === timestamp) alreadyExists = true;
            return x < timestamp;
          }) + 1;
        if (alreadyExists) {
          this.data.values[this.data.timestamps.indexOf(timestamp)] = value;
          return;
        }
      }

      // Compare to adjacent values
      if (insertIndex > 0 && logValuesEqual(this.type, value, this.data.values[insertIndex - 1])) {
        // Same as the previous value
      } else if (
        insertIndex < this.data.values.length &&
        logValuesEqual(this.type, value, this.data.values[insertIndex])
      ) {
        // Same as the next value
        this.data.timestamps[insertIndex] = timestamp;
      } else {
        // New value
        this.data.timestamps.splice(insertIndex, 0, timestamp);
        this.data.values.splice(insertIndex, 0, value);
      }
    } else {
      // this.data.timestamps.push(timestamp);
      // this.data.values.push(value);
      this.rawData.push({ timestamp: timestamp, value: value });
    }
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
    if (!this.enableLiveSorting) {
      this.sortAndProcess();
    }
    return {
      type: this.type,
      timestamps: this.data.timestamps,
      values: this.data.values,
      structuredType: this.structuredType,
      wpilibType: this.wpilibType,
      metadataString: this.metadataString,
      stripingReference: this.stripingReference,
      typeWarning: this.typeWarning
    };
  }

  /** Creates a new field based on the data from `toSerialized()` */
  static fromSerialized(serializedData: any) {
    let field = new LogField(serializedData.type);
    field.data = {
      timestamps: serializedData.timestamps,
      values: serializedData.values
    };
    field.structuredType = serializedData.structuredType;
    field.wpilibType = serializedData.wpilibType;
    field.metadataString = serializedData.metadataString;
    field.stripingReference = serializedData.stripingReference;
    field.typeWarning = serializedData.typeWarning;
    return field;
  }
  private sortAndProcess() {
    this.rawData.sort((a: LogRecord, b: LogRecord) => {
      return a.timestamp - b.timestamp;
    });
    // this.rawData.reverse();
    // let record = this.rawData.pop();
    // // Bootstrap first value
    // if (record) {
    //   this.data.timestamps.push(record.timestamp);
    //   this.data.values.push(record.value);
    // }
    // record = this.rawData.pop();
    // while (record) {
    //   // Check if the timestamp is the same as the last one
    //   if (record.timestamp == this.data.timestamps[this.data.values.length - 1]) {
    //     // Overwrite the last value
    //     this.data.values[this.data.values.length - 1] = record.value;
    //     // If the values are equal do not add the value
    //   } else if (
    //     !logValuesEqual(this.type, this.data.values[this.data.values.length - 1], record.value) ||
    //     this.rawData.length <= 0
    //   ) {
    //     // add the value if the prevous value is different or it is the last value in the rawData (make sure final data point is added)
    //     this.data.timestamps.push(record.timestamp);
    //     this.data.values.push(record.value);
    //   }
    //   record = this.rawData.pop();
    // }

    if (this.rawData.length > 0) {
      // Bootstrap first value
      this.data.timestamps.push(this.rawData[0].timestamp);
      this.data.values.push(this.rawData[0].value);
    }
    for (let i = 1; i < this.rawData.length; i++) {
      // Check if the timestamp is the same as the last one
      if (this.rawData[i].timestamp == this.data.timestamps[this.data.values.length - 1]) {
        // Overwrite the last value
        this.data.values[this.data.values.length - 1] = this.rawData[i].value;
        // If the values are equal do not add the value
      } else if (
        logValuesEqual(this.type, this.data.values[this.data.values.length - 1], this.rawData[i].value) &&
        i < this.rawData.length
      ) {
      } else {
        // add the value
        this.data.timestamps.push(this.rawData[i].timestamp);
        this.data.values.push(this.rawData[i].value);
      }
    }
    this.rawData = [];
    this.enableLiveSorting = true;
  }
}
