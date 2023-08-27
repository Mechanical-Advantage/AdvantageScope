import Log from "../../shared/log/Log";
import LoggableType from "../../shared/log/LoggableType";

export default class RLOGDecoder {
  private SUPPORTED_LOG_REVISIONS = [1];
  private STRING_DECODER = new TextDecoder("UTF-8");
  private MIN_TIMESTAMP_STEP = 0.0001; // Step size less than this many seconds indicates corrupted data
  private MAX_TIMESTAMP_STEP = 15.0; // Step size greater than this many seconds indicates corrupted data

  private logRevision: number | null = null;
  private lastTimestamp: number | null = null;
  private lastTimestampCorrupted: number | null = null;
  private lastProgressTimestamp = 0;
  private keyIDs: { [id: number]: string } = {};

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
        if (
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

          switch (type) {
            case 0: // New timestamp
              break readLoop;
            case 1: // New key ID
              let keyID = dataBuffer.getInt16(shiftOffset(2));
              let length = dataBuffer.getInt16(shiftOffset(2));
              let newKey = this.STRING_DECODER.decode(dataArray.subarray(offset, offset + length));
              offset += length;
              this.keyIDs[keyID] = newKey;
              break;
            case 2: // Updated field
              let key = this.keyIDs[dataBuffer.getInt16(shiftOffset(2))];

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
