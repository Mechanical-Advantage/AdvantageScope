import Log from "../../lib/log/Log";

export default class RLOGDecoder {
  private SUPPORTED_LOG_REVISIONS = [1];
  private STRING_DECODER = new TextDecoder("UTF-8");
  private MIN_TIMESTAMP_STEP = 0.0001; // Step size less than this many seconds indicates corrupted data
  private MAX_TIMESTAMP_STEP = 15.0; // Step size greater than this many seconds indicates corrupted data

  private logRevision: number | null = null;
  private lastTimestamp: number | null = null;
  private lastTimestampCorrupted: number | null = null;
  private keyIDs: { [id: number]: string } = {};

  decode(log: Log, dataArray: Buffer): boolean {
    let dataBuffer = new DataView(dataArray.buffer);
    let offset = 0;

    function shiftOffset(shift: number) {
      return (offset += shift) - shift;
    }

    try {
      // Check log reivison
      if (this.logRevision == null) {
        this.logRevision = dataArray[shiftOffset(1)];
        if (!this.SUPPORTED_LOG_REVISIONS.includes(this.logRevision)) {
          return false;
        }
      }
      shiftOffset(1); // Skip second byte (timestamp)

      mainLoop: while (true) {
        if (offset >= dataArray.length) break mainLoop; // No more data, so we can't start a new entry
        var timestamp = dataBuffer.getFloat64(shiftOffset(8));
        if (
          this.lastTimestamp != null &&
          (isNaN(timestamp) ||
            timestamp == null ||
            timestamp < this.lastTimestamp + this.MIN_TIMESTAMP_STEP ||
            timestamp > this.lastTimestamp + this.MAX_TIMESTAMP_STEP)
        ) {
          if (this.lastTimestamp != this.lastTimestampCorrupted) {
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
          var type = dataArray[shiftOffset(1)];
          if (type == undefined) break readLoop; // This was the last cycle, save the data

          switch (type) {
            case 0: // New timestamp
              break readLoop;
            case 1: // New key ID
              var keyID = dataBuffer.getInt16(shiftOffset(2));
              var length = dataBuffer.getInt16(shiftOffset(2));
              var key = this.STRING_DECODER.decode(dataArray.subarray(offset, offset + length));
              offset += length;
              this.keyIDs[keyID] = key;
              break;
            case 2: // Updated field
              var key = this.keyIDs[dataBuffer.getInt16(shiftOffset(2))];

              switch (dataArray[shiftOffset(1)]) {
                case 0: // null, not supported
                  break;
                case 1: // Boolean
                  log.putBoolean(key, timestamp, dataArray[shiftOffset(1)] != 0);
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
                  var length = dataBuffer.getInt16(shiftOffset(2));
                  var string = this.STRING_DECODER.decode(dataArray.subarray(offset, offset + length));
                  offset += length;
                  log.putString(key, timestamp, string);
                  break;
                case 2: // BooleanArray
                  var length = dataBuffer.getInt16(shiftOffset(2));
                  var booleanArray: boolean[] = [];
                  for (let i = 0; i < length; i++) {
                    booleanArray.push(dataArray[shiftOffset(1)] != 0);
                  }
                  log.putBooleanArray(key, timestamp, booleanArray);
                  break;
                case 10: // ByteArray
                  var length = dataBuffer.getInt16(shiftOffset(2));
                  var byteArray: number[] = [];
                  for (let i = 0; i < length; i++) {
                    byteArray.push(dataArray[shiftOffset(1)]);
                  }
                  log.putRaw(key, timestamp, new Uint8Array(byteArray));
                  break;
                case 4: // IntegerArray
                  var length = dataBuffer.getInt16(shiftOffset(2));
                  var numberArray: number[] = [];
                  for (let i = 0; i < length; i++) {
                    numberArray.push(dataBuffer.getInt32(shiftOffset(4)));
                  }
                  log.putNumberArray(key, timestamp, numberArray);
                  break;
                case 6: // DoubleArray
                  var length = dataBuffer.getInt16(shiftOffset(2));
                  var numberArray: number[] = [];
                  for (let i = 0; i < length; i++) {
                    numberArray.push(dataBuffer.getFloat64(shiftOffset(8)));
                  }
                  log.putNumberArray(key, timestamp, numberArray);
                  break;
                case 8: // StringArray
                  var length = dataBuffer.getInt16(shiftOffset(2));
                  var stringArray: string[] = [];
                  for (let i = 0; i < length; i++) {
                    var stringLength = dataBuffer.getInt16(shiftOffset(2));
                    stringArray.push(this.STRING_DECODER.decode(dataArray.subarray(offset, offset + stringLength)));
                    offset += stringLength;
                  }
                  log.putStringArray(key, timestamp, stringArray);
                  break;
              }
              break;
          }
        }
      }
      return true;
    } catch {
      return false;
    }
  }
}
