// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export async function run(
  data: Uint8Array,
  timestampRangeCallback: (min: number, max: number) => void,
  recordCallback: (entry: number, position: number) => void
) {
  let Module: any;

  // Detect environment
  const isNode =
    typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null;

  if (isNode) {
    // --- Node / Electron ---
    const path = await import('path');
    const { fileURLToPath, pathToFileURL } = await import('url');
    console.log("IsNode")

    // Dynamically import Emscripten glue JS (Node)
    const wasmModulePath = path.join('.', './bundles/hub$wpilogIndexerNode.js');
    const createModule = await import(pathToFileURL(wasmModulePath).href).then(
      (m) => m.default || m
    );

    Module = await createModule();
    await Module.ready; // ensure runtime initialized
  } else {
    console.log("Not Node")
    // --- Browser / Web Worker ---
    self.importScripts('./hub$wpilogIndexer.js');
    await new Promise((resolve) => {
      Module.onRuntimeInitialized = resolve;
    });
  }
  // await new Promise<void>((resolve) => {
  //   Module.onRuntimeInitialized = resolve;
  // });

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

var Module: {
  onRuntimeInitialized(): void;
  _malloc(size: number): number;
  _run(buffer: number, bufferSize: number): number;
  HEAPF64: Float64Array;
  HEAPU8: Uint8Array;
  HEAPU32: Uint32Array;
};
