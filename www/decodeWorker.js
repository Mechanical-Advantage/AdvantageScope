import { Log } from "./modules/log.mjs";

const supportedLogRevisions = [1];
const stringDecoder = new TextDecoder("UTF-8");
const minTimestampStep = 0.0001; // Step size less than this many seconds indicates corrupted data
const maxTimestampStep = 15.0; // Step size greater than this many seconds indicates corrupted data

var log = new Log();
var logRevision = null;
var lastTimestamp = null;
var lastTimestampCorrupted = null;
var keyIDs = {};

/*
Event data format:
{
  type: "reset" | "file-data" | "live-data",
  bytes: byte array
}
*/

// Decodes a series of bytes from an RLOG file and returns serializable data for a Log()
onmessage = function (event) {
  // Reset persistent data
  if (event.data.type == "reset") {
    log = new Log();
    logRevision = null;
    lastTimestamp = null;
    lastTimestampCorrupted = null;
    keyIDs = {};
    return;
  }

  var dataArray = event.data.bytes;
  var dataBuffer = new DataView(dataArray.buffer);
  var offset = 0;

  function shiftOffset(shift) {
    return (offset += shift) - shift;
  }

  try {
    // Check log reivison
    if (logRevision == null) {
      logRevision = dataArray[shiftOffset(1)];
      if (!supportedLogRevisions.includes(logRevision)) {
        this.postMessage({
          status: "incompatible",
          message:
            "The detected format of the log is incompatible with the current app version. (Revision " +
            logRevision.toString() +
            ")"
        });
        return;
      }
    }
    shiftOffset(1); // Skip second byte (timestamp)

    mainLoop: while (true) {
      if (offset >= dataArray.length) break mainLoop; // No more data, so we can't start a new entry
      var entry = { timestamp: dataBuffer.getFloat64(shiftOffset(8)), data: [] };
      if (
        lastTimestamp != null &&
        (isNaN(entry.timestamp) ||
          entry.timestamp == null ||
          entry.timestamp < lastTimestamp + minTimestampStep ||
          entry.timestamp > lastTimestamp + maxTimestampStep)
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
      lastTimestamp = entry.timestamp;

      readLoop: while (true) {
        var type = dataArray[shiftOffset(1)];
        if (type == undefined) break readLoop; // This was the last cycle, save the data

        switch (type) {
          case 0: // New timestamp
            break readLoop;
          case 1: // New key ID
            var keyID = dataBuffer.getInt16(shiftOffset(2));
            var length = dataBuffer.getInt16(shiftOffset(2));
            var key = stringDecoder.decode(dataArray.slice(offset, offset + length));
            offset += length;
            keyIDs[keyID] = key;
            break;
          case 2: // Updated field
            var key = keyIDs[dataBuffer.getInt16(shiftOffset(2))];
            var value = null;
            var type = null;

            switch (dataArray[shiftOffset(1)]) {
              case 0: // null
                type = "null";
                break;
              case 1: // Boolean
                type = "Boolean";
                value = dataArray[shiftOffset(1)] != 0;
                break;
              case 9: // Byte
                type = "Byte";
                value = dataArray[shiftOffset(1)];
                break;
              case 3: // Integer
                type = "Integer";
                value = dataBuffer.getInt32(shiftOffset(4));
                break;
              case 5: // Double
                type = "Double";
                value = dataBuffer.getFloat64(shiftOffset(8));
                break;
              case 7: // String
                type = "String";
                var length = dataBuffer.getInt16(shiftOffset(2));
                value = stringDecoder.decode(dataArray.slice(offset, offset + length));
                offset += length;
                break;
              case 2: // BooleanArray
                type = "BooleanArray";
                var length = dataBuffer.getInt16(shiftOffset(2));
                value = [];
                for (let i = 0; i < length; i++) {
                  value.push(dataArray[shiftOffset(1)] != 0);
                }
                break;
              case 10: // ByteArray
                type = "ByteArray";
                var length = dataBuffer.getInt16(shiftOffset(2));
                value = [];
                for (let i = 0; i < length; i++) {
                  value.push(dataArray[shiftOffset(1)]);
                }
                break;
              case 4: // IntegerArray
                type = "IntegerArray";
                var length = dataBuffer.getInt16(shiftOffset(2));
                value = [];
                for (let i = 0; i < length; i++) {
                  value.push(dataBuffer.getInt32(shiftOffset(4)));
                }
                break;
              case 6: // DoubleArray
                type = "DoubleArray";
                var length = dataBuffer.getInt16(shiftOffset(2));
                value = [];
                for (let i = 0; i < length; i++) {
                  value.push(dataBuffer.getFloat64(shiftOffset(8)));
                }
                break;
              case 8: // StringArray
                type = "StringArray";
                var length = dataBuffer.getInt16(shiftOffset(2));
                value = [];
                for (let i = 0; i < length; i++) {
                  var stringLength = dataBuffer.getInt16(shiftOffset(2));
                  value.push(stringDecoder.decode(dataArray.slice(offset, offset + stringLength)));
                  offset += stringLength;
                }
                break;
            }
            entry.data.push({
              key: key,
              type: type,
              value: value
            });
            break;
        }
      }
      if (event.data.type == "live-data") {
        // If live, stop after one entry and send data back to index.js
        this.postMessage({
          status: "newLiveData",
          data: entry
        });
      } else {
        // If not live, read all data and process log here
        log.add(entry);
      }
    }
  } catch (error) {
    console.error(error);
  }
  log.updateDisplayKeys();
  this.postMessage({
    status: "newLog",
    data: log.rawData
  });
};
