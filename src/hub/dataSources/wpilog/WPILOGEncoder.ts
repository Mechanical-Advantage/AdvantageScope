import {
  CONTROL_ENTRY,
  CONTROL_FINISH,
  CONTROL_SET_METADATA,
  CONTROL_START,
  HEADER_STRING,
  HEADER_VERSION,
  MetadataRecordData,
  StartRecordData,
  TEXT_ENCODER
} from "./WPILOGShared";

/** A record in the data log. May represent either a control record or a data record. */
export class WPILOGEncoderRecord {
  private entry: number;
  private timestamp: number;
  private data: Uint8Array;

  /**
   * Creates a new WPILOGEncoderRecord.
   * @param entry The entry ID
   * @param timestamp The timestamp in microseconds
   * @param data The payload data
   */
  private constructor(entry: number, timestamp: number, data: Uint8Array) {
    this.entry = entry;
    this.timestamp = timestamp;
    this.data = data;
  }

  /** Encodes a start control record. */
  static makeControlStart(timestamp: number, startRecordData: StartRecordData): WPILOGEncoderRecord {
    let encodedName = TEXT_ENCODER.encode(startRecordData.name);
    let encodedType = TEXT_ENCODER.encode(startRecordData.type);
    let encodedMetadata = TEXT_ENCODER.encode(startRecordData.metadata);

    let data = new Uint8Array(1 + 4 + 4 + encodedName.length + 4 + encodedType.length + 4 + encodedMetadata.length);
    let dataView = new DataView(data.buffer);
    data[0] = CONTROL_START;
    dataView.setUint32(1, startRecordData.entry, true);
    dataView.setUint32(1 + 4, encodedName.length, true);
    data.set(encodedName, 1 + 4 + 4);
    dataView.setUint32(1 + 4 + 4 + encodedName.length, encodedType.length, true);
    data.set(encodedType, 1 + 4 + 4 + encodedName.length + 4);
    dataView.setUint32(1 + 4 + 4 + encodedName.length + 4 + encodedType.length, encodedMetadata.length, true);
    data.set(encodedMetadata, 1 + 4 + 4 + encodedName.length + 4 + encodedType.length + 4);
    return new WPILOGEncoderRecord(CONTROL_ENTRY, timestamp, data);
  }

  /** Encodes a finish control record. */
  static makeControlFinish(timestamp: number, entry: number): WPILOGEncoderRecord {
    let data = new Uint8Array(1 + 4);
    data[0] = CONTROL_FINISH;
    new DataView(data.buffer).setUint32(1, entry, true);
    return new WPILOGEncoderRecord(CONTROL_ENTRY, timestamp, data);
  }

  /** Encodes a set metadata record. */
  static makeControlSetMetadata(timestamp: number, metadataRecordData: MetadataRecordData): WPILOGEncoderRecord {
    let encodedMetadata = TEXT_ENCODER.encode(metadataRecordData.metadata);

    let data = new Uint8Array(1 + 4 + 4 + encodedMetadata.length);
    let dataView = new DataView(data.buffer);
    data[0] = CONTROL_SET_METADATA;
    dataView.setUint32(1, metadataRecordData.entry, true);
    data.set(encodedMetadata, 1 + 4);
    return new WPILOGEncoderRecord(CONTROL_ENTRY, timestamp, data);
  }

  /** Encodes a raw record. */
  static makeRaw(entry: number, timestamp: number, value: Uint8Array): WPILOGEncoderRecord {
    return new WPILOGEncoderRecord(entry, timestamp, value);
  }

  /** Encodes a boolean record. */
  static makeBoolean(entry: number, timestamp: number, value: boolean): WPILOGEncoderRecord {
    let data = new Uint8Array(1);
    data[0] = value ? 1 : 0;
    return new WPILOGEncoderRecord(entry, timestamp, data);
  }

  /** Encodes an integer record. */
  static makeInteger(entry: number, timestamp: number, value: number): WPILOGEncoderRecord {
    let data = new Uint8Array(8);
    new DataView(data.buffer).setBigInt64(0, BigInt(value), true);
    return new WPILOGEncoderRecord(entry, timestamp, data);
  }

  /** Encodes a float record. */
  static makeFloat(entry: number, timestamp: number, value: number): WPILOGEncoderRecord {
    let data = new Uint8Array(4);
    new DataView(data.buffer).setFloat32(0, value, true);
    return new WPILOGEncoderRecord(entry, timestamp, data);
  }

  /** Encodes a double record. */
  static makeDouble(entry: number, timestamp: number, value: number): WPILOGEncoderRecord {
    let data = new Uint8Array(8);
    new DataView(data.buffer).setFloat64(0, value, true);
    return new WPILOGEncoderRecord(entry, timestamp, data);
  }

  /** Encodes a string record. */
  static makeString(entry: number, timestamp: number, value: string): WPILOGEncoderRecord {
    return new WPILOGEncoderRecord(entry, timestamp, TEXT_ENCODER.encode(value));
  }

  /** Encodes a boolean array record. */
  static makeBooleanArray(entry: number, timestamp: number, value: boolean[]): WPILOGEncoderRecord {
    let data = new Uint8Array(value.length);
    value.forEach((item, index) => {
      data[index] = item ? 1 : 0;
    });
    return new WPILOGEncoderRecord(entry, timestamp, data);
  }

  /** Encodes an integer array record. */
  static makeIntegerArray(entry: number, timestamp: number, value: number[]): WPILOGEncoderRecord {
    let data = new Uint8Array(value.length * 8);
    value.forEach((item, index) => {
      new DataView(data.buffer, index * 8).setBigInt64(0, BigInt(item), true);
    });
    return new WPILOGEncoderRecord(entry, timestamp, data);
  }

  /** Encodes a float array record. */
  static makeFloatArray(entry: number, timestamp: number, value: number[]): WPILOGEncoderRecord {
    let data = new Uint8Array(value.length * 4);
    value.forEach((item, index) => {
      new DataView(data.buffer, index * 4).setFloat32(0, item, true);
    });
    return new WPILOGEncoderRecord(entry, timestamp, data);
  }

  /** Encodes a double array record. */
  static makeDoubleArray(entry: number, timestamp: number, value: number[]): WPILOGEncoderRecord {
    let data = new Uint8Array(value.length * 8);
    value.forEach((item, index) => {
      new DataView(data.buffer, index * 8).setFloat64(0, item, true);
    });
    return new WPILOGEncoderRecord(entry, timestamp, data);
  }

  /** Encodes a string array record. */
  static makeStringArray(entry: number, timestamp: number, value: string[]): WPILOGEncoderRecord {
    let encodedStrings = value.map((item) => TEXT_ENCODER.encode(item));
    let data = new Uint8Array(
      4 + value.length * 4 + encodedStrings.reduce((previous, current) => previous + current.length, 0)
    );
    new DataView(data.buffer).setUint32(0, encodedStrings.length, true);
    let position = 4;
    encodedStrings.forEach((item) => {
      new DataView(data.buffer, position).setUint32(0, item.length, true);
      data.set(item, position + 4);
      position += 4 + item.length;
    });
    return new WPILOGEncoderRecord(entry, timestamp, data);
  }

  /** Encodes an integer using the fewest necessary bytes. */
  private encodeInteger(int: number): Uint8Array {
    int = Math.floor(int);
    if (int === 0) return new Uint8Array(1);
    let length = Math.floor(Math.log(int) / Math.log(256)) + 1;
    let array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      array[i] = (int >> (i * 8)) & 0xff;
    }
    return array;
  }

  /** Encodes the full contents of this record and returns the result. */
  getEncoded(): Uint8Array {
    // Generate length bitfield
    let entryData = this.encodeInteger(this.entry);
    let payloadSizeData = this.encodeInteger(this.data.length);
    let timestampData = this.encodeInteger(this.timestamp);
    let lengthBitfield = 0;
    lengthBitfield |= entryData.length - 1;
    lengthBitfield |= (payloadSizeData.length - 1) << 2;
    lengthBitfield |= (timestampData.length - 1) << 4;

    // Combine to single array
    let array = new Uint8Array(1 + entryData.length + payloadSizeData.length + timestampData.length + this.data.length);
    array[0] = lengthBitfield;
    array.set(entryData, 1);
    array.set(payloadSizeData, 1 + entryData.length);
    array.set(timestampData, 1 + entryData.length + payloadSizeData.length);
    array.set(this.data, 1 + entryData.length + payloadSizeData.length + timestampData.length);
    return array;
  }
}

/** WPILOG encoder. */
export class WPILOGEncoder {
  private extraHeader: string;
  private records: WPILOGEncoderRecord[] = [];

  /** Creates a new data log with the provided header. */
  constructor(extraHeader: string) {
    this.extraHeader = extraHeader;
  }

  /** Adds a new record to the data log. */
  add(record: WPILOGEncoderRecord) {
    this.records.push(record);
  }

  /** Encodes the full data log. */
  getEncoded(): Uint8Array {
    // Encode all records and header data
    let encodedRecords = this.records.map((record) => record.getEncoded());
    let totalRecordLength = encodedRecords.reduce((previous, current) => previous + current.length, 0);
    let encodedHeader = TEXT_ENCODER.encode(HEADER_STRING);
    let encodedExtraHeader = TEXT_ENCODER.encode(this.extraHeader);

    // Write header
    let data = new Uint8Array(encodedHeader.length + 2 + 4 + encodedExtraHeader.length + totalRecordLength);
    let dataView = new DataView(data.buffer, 0);
    data.set(encodedHeader, 0);
    dataView.setUint16(encodedHeader.length, HEADER_VERSION, true);
    dataView.setUint32(encodedHeader.length + 2, encodedExtraHeader.length, true);
    data.set(encodedExtraHeader, encodedHeader.length + 2 + 4);

    // Write records
    let position = encodedHeader.length + 2 + 4 + encodedExtraHeader.length;
    encodedRecords.forEach((encodedRecord) => {
      data.set(encodedRecord, position);
      position += encodedRecord.length;
    });
    return data;
  }
}
