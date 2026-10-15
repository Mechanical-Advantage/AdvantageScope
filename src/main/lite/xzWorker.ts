// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { XzReadableStream } from "xz-decompress";

/**
 * Decompresses XZ data.
 */
self.onmessage = async (event: MessageEvent) => {
  const { id, payload } = event.data as { id: number; payload: Uint8Array<ArrayBuffer> };

  const chunks: Uint8Array[] = [];
  let totalLength = 0;
  try {
    const reader = new XzReadableStream(new Blob([payload]).stream()).getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      totalLength += value.length;
    }
  } catch {}

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  self.postMessage({ id: id, payload: result }, { transfer: [result.buffer] });
};
