// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Prevent TypeScript and Rolldown from trying to analyze this import
const indexerName = "./wpilogIndexer.js";
export async function run(
  data: Uint8Array,
  timestampRangeCallback: (min: number, max: number) => void,
  recordCallback: (entry: number, position: number) => void
) {
  if (!(data instanceof Uint8Array)) {
    throw new TypeError("Expected Uint8Array for data parameter");
  }
  const { default: init } = await import(indexerName);
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
