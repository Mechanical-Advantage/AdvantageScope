// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { compress } from "lz4js";
import assert from "node:assert/strict";
import { test } from "node:test";
import { createDecompressHandlers } from "../../src/hub/dataSources/mcap/Compression";

test("MCAP LZ4 frame and cached repeated reads", async () => {
  const source = new TextEncoder().encode("telemetry channel ".repeat(1000));
  const handlers = await createDecompressHandlers();
  const compressed = compress(source);
  const output = handlers.lz4(compressed, BigInt(source.length));
  assert.deepEqual(output, source);
  assert.equal(handlers.lz4(compressed, BigInt(source.length)), output);
  assert.throws(() => handlers.lz4(compressed, 1n));
});

test("indexed MCAP reads skip LZ4 chunks belonging to other topics", async () => {
  const { McapWriter, McapIndexedReader } = await import("@mcap/core");
  const parts: Uint8Array[] = [];
  let position = 0n;
  const writer = new McapWriter({
    writable: {
      position: () => position,
      write: async (data) => {
        parts.push(data.slice());
        position += BigInt(data.length);
      }
    },
    chunkSize: 1,
    compressChunk: (data) => ({ compression: "lz4", compressedData: compress(data) })
  });
  await writer.start({ profile: "", library: "mur-voir test" });
  for (const topic of ["wanted", "other"]) {
    const channelId = await writer.registerChannel({
      topic,
      messageEncoding: "json",
      schemaId: 0,
      metadata: new Map()
    });
    await writer.addMessage({
      channelId,
      sequence: 0,
      logTime: 1n,
      publishTime: 1n,
      data: new TextEncoder().encode('{"value":12}')
    });
  }
  await writer.end();
  const data = new Uint8Array(Number(position));
  let offset = 0;
  for (const part of parts) {
    data.set(part, offset);
    offset += part.length;
  }
  const handlers = await createDecompressHandlers();
  let chunks = 0;
  const reader = await McapIndexedReader.Initialize({
    readable: { size: async () => position, read: async (o, l) => data.subarray(Number(o), Number(o + l)) },
    decompressHandlers: {
      lz4: (bytes, size) => {
        chunks++;
        return handlers.lz4(bytes, size);
      }
    }
  });
  const values = [];
  for await (const message of reader.readMessages({ topics: ["wanted"] }))
    values.push(JSON.parse(new TextDecoder().decode(message.data)));
  assert.deepEqual(values, [{ value: 12 }]);
  assert.equal(chunks, 1);
});
