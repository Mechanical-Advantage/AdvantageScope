// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

const uint32_t CONTROL_ENTRY = 0;
const uint8_t CONTROL_START = 0;
const uint32_t FAST_SCHEMA_ENTRY_LIMIT = 65536;
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

/** Checks if a start record's entry name matches /(?:^|\/)\.schema\/(.*)/ */
uint8_t isSchemaName(const char* name, uint32_t nameLength) {
  if (nameLength >= 8 && memcmp(name, ".schema/", 8) == 0) {
    return 1;
  }
  if (nameLength >= 9) {
    for (uint32_t i = 0; i <= nameLength - 9; i++) {
      if (memcmp(name + i, "/.schema/", 9) == 0) {
        return 1;
      }
    }
  }
  return 0;
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
  uint8_t* fastSchemaEntries = calloc(FAST_SCHEMA_ENTRY_LIMIT, sizeof(uint8_t));
  uint32_t slowSchemaEntriesCapacity = 16;
  uint32_t slowSchemaEntriesCount = 0;
  uint32_t* slowSchemaEntries = NULL;

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

    // Update schema entry tracking and timestamp range
    if (entry == CONTROL_ENTRY) {
      int payloadOffset = offset + headerLength;
      if (dataSize >= 17 &&
          *(uint8_t*)(buffer + payloadOffset) == CONTROL_START) {
        uint32_t startEntry =
            (uint32_t)readVarInt(buffer, payloadOffset + 1, 4);
        uint32_t nameLength =
            (uint32_t)readVarInt(buffer, payloadOffset + 5, 4);
        if (nameLength <= dataSize - 9) {
          const char* name = (const char*)(buffer + payloadOffset + 9);
          uint8_t isSchema = isSchemaName(name, nameLength);
          if (startEntry < FAST_SCHEMA_ENTRY_LIMIT &&
              fastSchemaEntries != NULL) {
            fastSchemaEntries[startEntry] = isSchema;
          } else {
            int existingIndex = -1;
            for (uint32_t i = 0; i < slowSchemaEntriesCount; i++) {
              if (slowSchemaEntries[i] == startEntry) {
                existingIndex = (int)i;
                break;
              }
            }
            if (isSchema && existingIndex == -1) {
              if (slowSchemaEntries == NULL) {
                slowSchemaEntries =
                    malloc(sizeof(uint32_t) * slowSchemaEntriesCapacity);
              } else if (slowSchemaEntriesCount >= slowSchemaEntriesCapacity) {
                uint32_t newCapacity = slowSchemaEntriesCapacity * 2;
                uint32_t* newEntries = realloc(
                    slowSchemaEntries, sizeof(uint32_t) * newCapacity);
                if (newEntries != NULL) {
                  slowSchemaEntries = newEntries;
                  slowSchemaEntriesCapacity = newCapacity;
                }
              }
              if (slowSchemaEntries != NULL &&
                  slowSchemaEntriesCount < slowSchemaEntriesCapacity) {
                slowSchemaEntries[slowSchemaEntriesCount++] = startEntry;
              }
            } else if (!isSchema && existingIndex != -1) {
              slowSchemaEntries[existingIndex] =
                  slowSchemaEntries[--slowSchemaEntriesCount];
            }
          }
        }
      }
    } else {
      uint8_t isSchema = 0;
      if (entry < FAST_SCHEMA_ENTRY_LIMIT && fastSchemaEntries != NULL) {
        isSchema = fastSchemaEntries[entry];
      } else {
        for (uint32_t i = 0; i < slowSchemaEntriesCount; i++) {
          if (slowSchemaEntries[i] == entry) {
            isSchema = 1;
            break;
          }
        }
      }
      if (!isSchema) {
        if (!hasInitialTimestamp || timestamp < minTimestamp) {
          minTimestamp = timestamp;
        }
        if (!hasInitialTimestamp || timestamp > maxTimestamp) {
          maxTimestamp = timestamp;
        }
        hasInitialTimestamp = 1;
      }
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
  free(fastSchemaEntries);
  free(slowSchemaEntries);
  ((double*)output)[0] = minTimestamp * 1.0e-6;
  ((double*)output)[1] = maxTimestamp * 1.0e-6;
  *(uint32_t*)(output + sizeof(double) * 2) = recordCount;

  return output;
}