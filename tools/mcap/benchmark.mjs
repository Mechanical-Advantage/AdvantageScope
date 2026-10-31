// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { McapIndexedReader } from "@mcap/core";
import { decompress } from "fzstd";
import fs from "node:fs";
import { ZSTDDecoder } from "zstddec";
const data = fs.readFileSync(process.argv[2] ?? "../../refs/foxglove-sample-data/mur_fsae_synthetic.mcap");
for (const mode of ["fzstd", "wasm"]) {
  const t = performance.now();
  const d = new ZSTDDecoder();
  if (mode === "wasm") await d.init();
  let chunks = 0;
  const reader = await McapIndexedReader.Initialize({
    readable: { size: async () => BigInt(data.length), read: async (o, l) => data.subarray(Number(o), Number(o + l)) },
    decompressHandlers: {
      zstd: (b, s) => {
        chunks++;
        return mode === "wasm" ? d.decode(b, Number(s)) : decompress(b, new Uint8Array(Number(s)));
      }
    }
  });
  const topic =
    [...reader.channelsById.values()].find((c) => c.topic === "/vehicle/state")?.topic ??
    [...reader.channelsById.values()][0].topic;
  let n = 0;
  for await (const m of reader.readMessages({ topics: [topic] })) n++;
  console.log({ mode, topic, messages: n, chunks, ms: performance.now() - t });
}
