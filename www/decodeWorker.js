import { Log } from "./modules/log.mjs";

const supportedLogRevisions = [1];
var log = new Log();
var logRevision = null;
var keyIDs = {};

var isLive = false;
var dataArray = null;
var dataBuffer = null;
var decoder = new TextDecoder("UTF-8");
var offset = null;

// Decodes a series of bytes from an RLOG file and returns serializable data for a Log()
onmessage = function (event) {
  isLive = event.data.isLive;
  dataArray = event.data.bytes;
  dataBuffer = new DataView(dataArray.buffer);
  offset = 0;

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

      readLoop: while (true) {
        var type = dataArray[shiftOffset(1)];
        if (type == undefined) break readLoop; // This was the last cycle, save the data

        switch (type) {
          case 0: // New timestamp
            break readLoop;
          case 1: // New key ID
            var keyID = dataBuffer.getInt16(shiftOffset(2));
            var length = dataBuffer.getInt16(shiftOffset(2));
            var key = decoder.decode(dataArray.slice(offset, offset + length));
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
                value = decoder.decode(dataArray.slice(offset, offset + length));
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
                  value.push(decoder.decode(dataArray.slice(offset, offset + stringLength)));
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
      if (isLive) {
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
    console.error(error.message);
  }
  log.updateDisplayKeys();
  this.postMessage({
    status: "newLog",
    data: log.rawData
  });
};
