import Log from "../../../shared/log/Log";
import { PROTO_PREFIX, STRUCT_PREFIX } from "../../../shared/log/LogUtil";
import LoggableType from "../../../shared/log/LoggableType";
import CustomSchemas from "../schema/CustomSchemas";
import { TEXT_DECODER } from "../wpilog/WPILOGShared";

export default class RLOGDecoder {
  private SUPPORTED_LOG_REVISIONS = [1, 2];
  private STRING_DECODER = new TextDecoder("UTF-8");
  private MIN_TIMESTAMP_STEP = 0.0001; // Step size less than this many seconds indicates corrupted data
  private MAX_TIMESTAMP_STEP = 60.0; // Step size greater than this many seconds indicates corrupted data

  private isFile;
  private logRevision: number | null = null;
  private lastTimestamp: number | null = null;
  private lastTimestampCorrupted: number | null = null;
  private lastProgressTimestamp = 0;
  private keyIDs: { [id: number]: string } = {};
  private keyTypes: { [id: number]: string } = {};

  constructor(isFile: boolean) {
    this.isFile = isFile;
  }

  decode(log: Log, dataArray: Buffer, progressCallback?: (progress: number) => void): boolean {
    let dataBuffer = new DataView(dataArray.buffer);
    let offset = 0;

    function shiftOffset(shift: number) {
      return (offset += shift) - shift;
    }

    try {
      // Check log revision
      if (this.logRevision === null) {
        this.logRevision = dataArray[shiftOffset(1)];
        if (!this.SUPPORTED_LOG_REVISIONS.includes(this.logRevision)) {
          return false;
        }
      }
      shiftOffset(1); // Skip second byte (timestamp)

      mainLoop: while (true) {
        if (offset >= dataArray.length) break mainLoop; // No more data, so we can't start a new entry
        let timestamp = dataBuffer.getFloat64(shiftOffset(8));
        if (timestamp < 0) timestamp = 0;
        if (
          this.isFile &&
          this.lastTimestamp !== null &&
          (isNaN(timestamp) ||
            timestamp === null ||
            timestamp < this.lastTimestamp + this.MIN_TIMESTAMP_STEP ||
            timestamp > this.lastTimestamp + this.MAX_TIMESTAMP_STEP)
        ) {
          if (this.lastTimestamp !== this.lastTimestampCorrupted) {
            console.warn(
              "Corrupted log data skipped near " +
                this.lastTimestamp.toFixed(2) +
                " seconds (byte " +
                (offset - 8).toString() +
                ")"
            );
          }
          this.lastTimestampCorrupted = this.lastTimestamp;
          offset -= 7; // Skip back to search for valid timestamp
          continue;
        }
        this.lastTimestamp = timestamp;

        readLoop: while (true) {
          let type = dataArray[shiftOffset(1)];
          if (type === undefined) break readLoop; // This was the last cycle, save the data

          let keyID: number;
          switch (type) {
            case 0: // New timestamp
              break readLoop;
            case 1: // New key ID
              keyID = dataBuffer.getInt16(shiftOffset(2));
              let keyLength = dataBuffer.getInt16(shiftOffset(2));
              let newKey = this.STRING_DECODER.decode(dataArray.subarray(offset, offset + keyLength));
              offset += keyLength;
              this.keyIDs[keyID] = newKey;
              if (this.logRevision === 2) {
                let typeLength = dataBuffer.getInt16(shiftOffset(2));
                let newType = this.STRING_DECODER.decode(dataArray.subarray(offset, offset + typeLength));
                offset += typeLength;
                this.keyTypes[keyID] = newType;
              }
              break;
            case 2: // Updated field
              keyID = dataBuffer.getInt16(shiftOffset(2));
              let key = this.keyIDs[keyID];

              if (this.logRevision === 2) {
                // RLOG R2, string name field types
                let valueLength = dataBuffer.getInt16(shiftOffset(2));
                let value = dataArray.subarray(offset, offset + valueLength);
                let type = this.keyTypes[keyID];
                switch (type) {
                  case "boolean":
                    if (value.length !== 1) throw "Not a boolean";
                    log.putBoolean(key, timestamp, value[0] !== 0);
                    break;
                  case "int":
                  case "int64":
                    if (value.length !== 8) throw "Not an integer";
                    log.putNumber(key, timestamp, Number(dataBuffer.getBigInt64(offset)));
                    break;
                  case "float":
                    if (value.length !== 4) throw "Not a float";
                    log.putNumber(key, timestamp, Number(dataBuffer.getFloat32(offset)));
                    break;
                  case "double":
                    if (value.length !== 8) throw "Not a double";
                    log.putNumber(key, timestamp, Number(dataBuffer.getFloat64(offset)));
                    break;
                  case "string":
                    log.putString(key, timestamp, TEXT_DECODER.decode(value));
                    break;
                  case "boolean[]":
                    {
                      let array: boolean[] = [];
                      value.forEach((x) => {
                        array.push(x !== 0);
                      });
                      log.putBooleanArray(key, timestamp, array);
                    }
                    break;
                  case "int[]":
                  case "int64[]":
                    {
                      if (value.length % 8 !== 0) throw "Not an integer array";
                      let array: number[] = [];
                      for (let position = 0; position < value.length; position += 8) {
                        array.push(Number(dataBuffer.getBigInt64(offset + position)));
                      }
                      log.putNumberArray(key, timestamp, array);
                    }
                    break;
                  case "float[]":
                    {
                      if (value.length % 4 !== 0) throw "Not a float array";
                      let array: number[] = [];
                      for (let position = 0; position < value.length; position += 4) {
                        array.push(dataBuffer.getFloat32(offset + position));
                      }
                      log.putNumberArray(key, timestamp, array);
                    }
                    break;
                  case "double[]":
                    {
                      if (value.length % 8 !== 0) throw "Not a double array";
                      let array: number[] = [];
                      for (let position = 0; position < value.length; position += 8) {
                        array.push(dataBuffer.getFloat64(offset + position));
                      }
                      log.putNumberArray(key, timestamp, array);
                    }
                    break;
                  case "string[]":
                    {
                      let size = dataBuffer.getUint32(offset);
                      if (size > (value.length - 4) / 4) throw "Not a string array";
                      let array: string[] = [];
                      let position = 4;
                      for (let i = 0; i < size; i++) {
                        let stringSize = dataBuffer.getUint32(offset + position);
                        array.push(TEXT_DECODER.decode(value.subarray(position + 4, position + 4 + stringSize)));
                        position += 4 + stringSize;
                      }
                      log.putStringArray(key, timestamp, array);
                    }
                    break;
                  case "json":
                    log.putJSON(key, timestamp, TEXT_DECODER.decode(value));
                    break;
                  case "msgpack":
                    log.putMsgpack(key, timestamp, value);
                    break;
                  default:
                    if (type.startsWith(STRUCT_PREFIX)) {
                      let schemaType = type.split(STRUCT_PREFIX)[1];
                      if (schemaType.endsWith("[]")) {
                        log.putStruct(key, timestamp, value, schemaType.slice(0, -2), true);
                      } else {
                        log.putStruct(key, timestamp, value, schemaType, false);
                      }
                    } else if (type.startsWith(PROTO_PREFIX)) {
                      let schemaType = type.split(PROTO_PREFIX)[1];
                      log.putProto(key, timestamp, value, schemaType);
                    } else {
                      log.putRaw(key, timestamp, value);
                      if (CustomSchemas.has(type)) {
                        try {
                          CustomSchemas.get(type)!(log, key, timestamp, value);
                        } catch {
                          console.error('Failed to decode custom schema "' + type + '"');
                        }
                        log.setGeneratedParent(key);
                      }
                    }
                    break;
                }
                offset += valueLength;
              } else if (this.logRevision === 1) {
                // RLOG R1, predefined set of field types
                switch (dataArray[shiftOffset(1)]) {
                  case 0: // null
                    // Null values are not supported, so go to a default value instead
                    let previousType = log.getType(key);
                    switch (previousType) {
                      case LoggableType.Raw:
                        log.putRaw(key, timestamp, new Uint8Array());
                        break;
                      case LoggableType.Boolean:
                        log.putBoolean(key, timestamp, false);
                        break;
                      case LoggableType.Number:
                        log.putNumber(key, timestamp, 0);
                        break;
                      case LoggableType.String:
                        log.putString(key, timestamp, "");
                        break;
                      case LoggableType.BooleanArray:
                        log.putBooleanArray(key, timestamp, []);
                        break;
                      case LoggableType.NumberArray:
                        log.putNumberArray(key, timestamp, []);
                        break;
                      case LoggableType.StringArray:
                        log.putStringArray(key, timestamp, []);
                        break;
                    }
                    break;
                  case 1: // Boolean
                    log.putBoolean(key, timestamp, dataArray[shiftOffset(1)] !== 0);
                    break;
                  case 9: // Byte
                    log.putRaw(key, timestamp, new Uint8Array([dataArray[shiftOffset(1)]]));
                    break;
                  case 3: // Integer
                    log.putNumber(key, timestamp, dataBuffer.getInt32(shiftOffset(4)));
                    break;
                  case 5: // Double
                    log.putNumber(key, timestamp, dataBuffer.getFloat64(shiftOffset(8)));
                    break;
                  case 7: // String
                    let stringLength = dataBuffer.getInt16(shiftOffset(2));
                    let string = this.STRING_DECODER.decode(dataArray.subarray(offset, offset + stringLength));
                    offset += stringLength;
                    log.putString(key, timestamp, string);
                    break;
                  case 2: // BooleanArray
                    let booleanArrayLength = dataBuffer.getInt16(shiftOffset(2));
                    let booleanArray: boolean[] = [];
                    for (let i = 0; i < booleanArrayLength; i++) {
                      booleanArray.push(dataArray[shiftOffset(1)] !== 0);
                    }
                    log.putBooleanArray(key, timestamp, booleanArray);
                    break;
                  case 10: // ByteArray
                    let byteArrayLength = dataBuffer.getInt16(shiftOffset(2));
                    let byteArray: number[] = [];
                    for (let i = 0; i < byteArrayLength; i++) {
                      byteArray.push(dataArray[shiftOffset(1)]);
                    }
                    log.putRaw(key, timestamp, new Uint8Array(byteArray));
                    break;
                  case 4: // IntegerArray
                    let integerArrayLength = dataBuffer.getInt16(shiftOffset(2));
                    let integerArray: number[] = [];
                    for (let i = 0; i < integerArrayLength; i++) {
                      integerArray.push(dataBuffer.getInt32(shiftOffset(4)));
                    }
                    log.putNumberArray(key, timestamp, integerArray);
                    break;
                  case 6: // DoubleArray
                    let doubleArrayLength = dataBuffer.getInt16(shiftOffset(2));
                    let doubleArray: number[] = [];
                    for (let i = 0; i < doubleArrayLength; i++) {
                      doubleArray.push(dataBuffer.getFloat64(shiftOffset(8)));
                    }
                    log.putNumberArray(key, timestamp, doubleArray);
                    break;
                  case 8: // StringArray
                    let stringArraylength = dataBuffer.getInt16(shiftOffset(2));
                    let stringArray: string[] = [];
                    for (let i = 0; i < stringArraylength; i++) {
                      let stringLength = dataBuffer.getInt16(shiftOffset(2));
                      stringArray.push(this.STRING_DECODER.decode(dataArray.subarray(offset, offset + stringLength)));
                      offset += stringLength;
                    }
                    log.putStringArray(key, timestamp, stringArray);
                    break;
                }
              }
              break;
          }

          // Send progress update
          if (progressCallback !== undefined) {
            let now = new Date().getTime();
            if (now - this.lastProgressTimestamp > 1000 / 60) {
              this.lastProgressTimestamp = now;
              progressCallback(offset / dataBuffer.byteLength);
            }
          }
        }
      }
      return true;
    } catch {
      return false;
    }
  }
}
