// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { decompress as fallback } from "fzstd";
import { decompress as lz4 } from "lz4js";
import { ZSTDDecoder } from "zstddec";

/** Each worker owns a bounded cache. WASM is embedded by zstddec, including in Lite. */
export async function createDecompressHandlers(useWasm = true) {
  const decoder = new ZSTDDecoder();
  let ready = false;
  if (useWasm) {
    try {
      await decoder.init();
      ready = true;
    } catch (error) {
      console.warn("WASM zstd unavailable, using fzstd", error);
    }
  }
  const cache = new WeakMap<ArrayBufferLike, Map<number, Uint8Array>>();
  let size = 0;
  function cached(decode: (bytes: Uint8Array, size: number) => Uint8Array) {
    return (bytes: Uint8Array, expected: bigint) => {
      let entries = cache.get(bytes.buffer);
      const hit = entries?.get(bytes.byteOffset);
      if (hit?.length === Number(expected)) return hit;
      const output = decode(bytes, Number(expected));
      if (output.length !== Number(expected)) throw new Error("Invalid MCAP decompressed chunk size");
      if (size + output.length <= 512 * 1024 * 1024) {
        if (!entries) {
          entries = new Map();
          cache.set(bytes.buffer, entries);
        }
        entries.set(bytes.byteOffset, output);
        size += output.length;
      }
      return output;
    };
  }
  return {
    zstd: cached((bytes, size) => (ready ? decoder.decode(bytes, size) : fallback(bytes, new Uint8Array(size)))),
    lz4: cached((bytes, size) => lz4(bytes, size))
  };
}
