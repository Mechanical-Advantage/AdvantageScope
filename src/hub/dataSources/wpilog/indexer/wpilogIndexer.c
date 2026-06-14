// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

#include <stdio.h>
#include <stdlib.h>

const uint32_t CONTROL_ENTRY = 0;
const uint64_t OUTPUT_HEADER_SIZE = sizeof(double) * 2 + sizeof(uint32_t);
const uint64_t OUTPUT_RECORD_SIZE = sizeof(uint32_t) * 2;

/** Reads an integer with an arbitrary length (up to int64_t). */
int64_t readVarInt(void* buffer, int offset, int length) {
  int64_t value = 0;
  for (int i = 0; i < length; i++) {
    uint8_t byte = *(uint8_t*)(buffer + offset + i);
    value += (int64_t)byte << (8 * i);
  }
  return value;
}

void* run(void* buffer, int bufferSize) {
  // Read extra header size
  int32_t extraHeaderSize = readVarInt(buffer, 8, 4);
  int offset = 12 + extraHeaderSize;

  // Set up output
  uint8_t hasInitialTimestamp = 0;
  int64_t minTimestamp = 0;
  int64_t maxTimestamp = 0;
  uint32_t recordCount = 0;
  uint32_t recordCapacity = 10000;
  void* output =
      malloc(OUTPUT_HEADER_SIZE + OUTPUT_RECORD_SIZE * recordCapacity);

  // Iterate over records
  while (offset + 4 <= bufferSize) {
    // Read data from record
    uint8_t lengthBitfield = *((uint8_t*)(buffer + offset));
    uint8_t entryLength = (lengthBitfield & 0x3) + 1;
    uint8_t dataSizeLength = ((lengthBitfield >> 2) & 0x3) + 1;
    uint8_t timestampLength = ((lengthBitfield >> 4) & 0x7) + 1;
    uint8_t headerLength = 1 + entryLength + dataSizeLength + timestampLength;
    if (bufferSize < offset + headerLength) {
      break;
    }

    uint32_t entry = readVarInt(buffer, offset + 1, entryLength);
    uint32_t dataSize =
        readVarInt(buffer, offset + 1 + entryLength, dataSizeLength);
    int64_t timestamp = readVarInt(
        buffer, offset + 1 + entryLength + dataSizeLength, timestampLength);
    if (bufferSize < offset + headerLength + dataSize || entry < 0 ||
        dataSize < 0) {
      break;
    }

    // Update timestamp range
    if (entry != CONTROL_ENTRY) {
      if (!hasInitialTimestamp || timestamp < minTimestamp) {
        minTimestamp = timestamp;
      }
      if (!hasInitialTimestamp || timestamp > maxTimestamp) {
        maxTimestamp = timestamp;
      }
      hasInitialTimestamp = 1;
    }

    // Expand output if necessary
    if (recordCount >= recordCapacity) {
      recordCapacity *= 2;
      void* newOutput = realloc(
          output, OUTPUT_HEADER_SIZE + OUTPUT_RECORD_SIZE * recordCapacity);
      if (newOutput == NULL) {
        // Maximum heap size has been reached, exit early
        break;
      }
      output = newOutput;
    }

    // Write record to output
    uint32_t* recordOutput =
        output + OUTPUT_HEADER_SIZE + OUTPUT_RECORD_SIZE * recordCount;
    recordOutput[0] = entry;
    recordOutput[1] = offset;

    // Shift to next position
    offset += headerLength + dataSize;
    recordCount++;
  }

  // Write timestamp range and record count
  ((double*)output)[0] = minTimestamp * 1.0e-6;
  ((double*)output)[1] = maxTimestamp * 1.0e-6;
  *(uint32_t*)(output + sizeof(double) * 2) = recordCount;

  return output;
}