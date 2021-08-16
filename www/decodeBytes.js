// Decodes a series of bytes from an RLOG file and adds the data to a log
function decodeBytes(log, dataArray) {
  window.dataArray = dataArray
  window.dataBuffer = new DataView(dataArray.buffer)
  var decoder = new TextDecoder("UTF-8")
  var offset = 1 // Skip first byte (timestamp)
  var keyIDs = {}

  function shiftOffset(shift) {
    return (offset += shift) - shift
  }

  try {
    mainLoop:
    while (true) {
      var entry = { timestamp: dataBuffer.getFloat64(shiftOffset(8)), data: {} }

      readLoop:
      while (true) {
        var type = dataArray[shiftOffset(1)]
        if (type == undefined) {
          break mainLoop
        }

        switch (type) {
          case 0: // New timestamp
            break readLoop;
          case 1: // New key ID
            var keyID = dataBuffer.getInt16(shiftOffset(2))
            var length = dataBuffer.getInt16(shiftOffset(2))
            var key = decoder.decode(dataArray.slice(offset, offset + length))
            offset += length
            keyIDs[keyID] = key
            break;
          case 2: // Updated field
            var key = keyIDs[dataBuffer.getInt16(shiftOffset(2))]
            var value = null

            switch (dataArray[shiftOffset(1)]) {
              case 0: // null
                break;
              case 1: // Boolean
                value = dataArray[shiftOffset(1)] != 0
                break;
              case 9: // Byte
                value = dataArray[shiftOffset(1)]
                break;
              case 3: // Integer
                value = dataBuffer.getInt32(shiftOffset(4))
                break;
              case 5: // Double
                value = dataBuffer.getFloat64(shiftOffset(8))
                break;
              case 7: // String
                var length = dataBuffer.getInt16(shiftOffset(2))
                value = decoder.decode(dataArray.slice(offset, offset + length))
                offset += length
                break;
              case 2: // BooleanArray
                var length = dataBuffer.getInt16(shiftOffset(2))
                value = []
                for (i = 0; i < length; i++) {
                  value.push(dataArray[shiftOffset(1)] != 0)
                }
                break;
              case 10: // ByteArray
                var length = dataBuffer.getInt16(shiftOffset(2))
                value = []
                for (i = 0; i < length; i++) {
                  value.push(dataArray[shiftOffset(1)])
                }
                break;
              case 4: // IntegerArray
                var length = dataBuffer.getInt16(shiftOffset(2))
                value = []
                for (i = 0; i < length; i++) {
                  value.push(dataBuffer.getInt32(shiftOffset(4)))
                }
                break;
              case 6: // DoubleArray
                var length = dataBuffer.getInt16(shiftOffset(2))
                value = []
                for (i = 0; i < length; i++) {
                  value.push(dataBuffer.getFloat64(shiftOffset(8)))
                }
                break;
              case 8: // StringArray
                var length = dataBuffer.getInt16(shiftOffset(2))
                value = []
                for (i = 0; i < length; i++) {
                  var stringLength = dataBuffer.getInt16(shiftOffset(2))
                  value.push(decoder.decode(dataArray.slice(offset, offset + stringLength)))
                  offset += stringLength
                }
                break;
            }
            entry.data[key] = value
            break;
        }
      }
      log.add(entry)
    }
  } catch (error) {
    console.error(error.message)
  }
}