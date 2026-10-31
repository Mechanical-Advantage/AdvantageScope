// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

const CONTROL_ENTRY = 0;

// Prevent TypeScript and Rolldown from trying to analyze this import
const indexerName = "./wpilogIndexer.js";

/**
 * Indexes the records in a WPILOG file. Uses the Emscripten-compiled indexer
 * when it is available (built by "npm run wasm:compile"), otherwise falls back
 * to an equivalent pure-JS implementation.
 */
export async function run(
  data: Uint8Array,
  timestampRangeCallback: (min: number, max: number) => void,
  recordCallback: (entry: number, position: number) => void
) {
  let init: (() => Promise<any>) | null = null;
  try {
    init = (await import(indexerName)).default;
  } catch {
    init = null;
  }
  if (init === null) {
    runJS(data, timestampRangeCallback, recordCallback);
    return;
  }

  const Module: {
    _malloc(size: number): number;
    _run(buffer: number, bufferSize: number): number;
    HEAPF64: Float64Array;
    HEAPU8: Uint8Array;
    HEAPU32: Uint32Array;
  } = await init();
  const bufferIn = Module._malloc(data.length);
  Module.HEAPU8.set(data, bufferIn);
  const bufferOut = Module._run(bufferIn, data.length);

  const minTimestamp = Module.HEAPF64[bufferOut / 8];
  const maxTimestamp = Module.HEAPF64[bufferOut / 8 + 1];
  timestampRangeCallback(minTimestamp, maxTimestamp);

  const recordCount = Module.HEAPU32[bufferOut / 4 + 4];
  for (let i = 0; i < recordCount; i++) {
    let entry = Module.HEAPU32[bufferOut / 4 + 5 + i * 2];
    let position = Module.HEAPU32[bufferOut / 4 + 5 + i * 2 + 1];
    recordCallback(entry, position);
  }
}

/** Reads a little-endian integer with an arbitrary length (up to 8 bytes). */
function readVarInt(data: Uint8Array, offset: number, length: number): number {
  let value = 0;
  for (let i = 0; i < length; i++) {
    value += data[offset + i] * 2 ** (8 * i);
  }
  return value;
}

/** Pure-JS port of wpilogIndexer.c, used when the WASM indexer is unavailable. */
function runJS(
  data: Uint8Array,
  timestampRangeCallback: (min: number, max: number) => void,
  recordCallback: (entry: number, position: number) => void
) {
  const bufferSize = data.length;
  let offset = 12 + readVarInt(data, 8, 4);

  let hasInitialTimestamp = false;
  let minTimestamp = 0;
  let maxTimestamp = 0;
  const entries: number[] = [];
  const positions: number[] = [];

  while (offset + 4 <= bufferSize) {
    const lengthBitfield = data[offset];
    const entryLength = (lengthBitfield & 0x3) + 1;
    const dataSizeLength = ((lengthBitfield >> 2) & 0x3) + 1;
    const timestampLength = ((lengthBitfield >> 4) & 0x7) + 1;
    const headerLength = 1 + entryLength + dataSizeLength + timestampLength;
    if (bufferSize < offset + headerLength) {
      break;
    }

    const entry = readVarInt(data, offset + 1, entryLength);
    const dataSize = readVarInt(data, offset + 1 + entryLength, dataSizeLength);
    const timestamp = readVarInt(data, offset + 1 + entryLength + dataSizeLength, timestampLength);
    if (bufferSize < offset + headerLength + dataSize) {
      break;
    }

    if (entry !== CONTROL_ENTRY) {
      if (!hasInitialTimestamp || timestamp < minTimestamp) {
        minTimestamp = timestamp;
      }
      if (!hasInitialTimestamp || timestamp > maxTimestamp) {
        maxTimestamp = timestamp;
      }
      hasInitialTimestamp = true;
    }

    entries.push(entry);
    positions.push(offset);
    offset += headerLength + dataSize;
  }

  timestampRangeCallback(minTimestamp * 1.0e-6, maxTimestamp * 1.0e-6);
  for (let i = 0; i < entries.length; i++) {
    recordCallback(entries[i], positions[i]);
  }
}
