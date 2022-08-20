import Log from "../../lib/log/Log";

const supportedLogRevisions = [1];
const stringDecoder = new TextDecoder("UTF-8");
const minTimestampStep = 0.0001; // Step size less than this many seconds indicates corrupted data
const maxTimestampStep = 15.0; // Step size greater than this many seconds indicates corrupted data

self.onmessage = (event) => {
  var { id, payload } = event.data;
  function resolve(result: any) {
    self.postMessage({ id: id, payload: result });
  }
  function reject() {
    self.postMessage({ id: id });
  }

  // MAIN DECODE LOGIC

  if (!payload.success) reject();

  let log = new Log();
  let logRevision: number | null = null;
  let lastTimestamp: number | null = null;
  let lastTimestampCorrupted: number | null = null;
  let keyIDs: { [id: number]: string } = {};

  let dataArray: Buffer = payload.raw;
  let dataBuffer = new DataView(dataArray.buffer);
  let offset = 0;

  function shiftOffset(shift: number) {
    return (offset += shift) - shift;
  }

  try {
    // Check log reivison
    if (logRevision == null) {
      logRevision = dataArray[shiftOffset(1)];
      if (!supportedLogRevisions.includes(logRevision)) {
        reject();
        return;
      }
    }
    shiftOffset(1); // Skip second byte (timestamp)

    mainLoop: while (true) {
      if (offset >= dataArray.length) break mainLoop; // No more data, so we can't start a new entry
      var timestamp = dataBuffer.getFloat64(shiftOffset(8));
      if (
        lastTimestamp != null &&
        (isNaN(timestamp) ||
          timestamp == null ||
          timestamp < lastTimestamp + minTimestampStep ||
          timestamp > lastTimestamp + maxTimestampStep)
      ) {
        if (lastTimestamp != lastTimestampCorrupted) {
          console.warn(
            "Corrupted log data skipped near " +
              lastTimestamp.toFixed(2) +
              " seconds (byte " +
              (offset - 8).toString() +
              ")"
          );
        }
        lastTimestampCorrupted = lastTimestamp;
        offset -= 7; // Skip back to search for valid timestamp
        continue;
      }
      lastTimestamp = timestamp;

      readLoop: while (true) {
        var type = dataArray[shiftOffset(1)];
        if (type == undefined) break readLoop; // This was the last cycle, save the data

        switch (type) {
          case 0: // New timestamp
            break readLoop;
          case 1: // New key ID
            var keyID = dataBuffer.getInt16(shiftOffset(2));
            var length = dataBuffer.getInt16(shiftOffset(2));
            var key = stringDecoder.decode(dataArray.subarray(offset, offset + length));
            offset += length;
            keyIDs[keyID] = key;
            break;
          case 2: // Updated field
            var key = keyIDs[dataBuffer.getInt16(shiftOffset(2))];

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
                var string = stringDecoder.decode(dataArray.subarray(offset, offset + length));
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
                  stringArray.push(stringDecoder.decode(dataArray.subarray(offset, offset + stringLength)));
                  offset += stringLength;
                }
                log.putStringArray(key, timestamp, stringArray);
                break;
            }
            break;
        }
      }
    }
    resolve(log);
  } catch {
    reject();
  }
};
