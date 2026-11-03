// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { Session } from "node:inspector";
import { performance } from "node:perf_hooks";
import LogField from "../../src/shared/log/LogField";
import LoggableType from "../../src/shared/log/LoggableType";
import { LegacyRange } from "../../test/log/LegacyRange";

const session = new Session();
session.connect();
const post = (method: string, params = {}): Promise<any> =>
  new Promise((resolve, reject) => {
    session.post(method as any, params, (error, result) => (error ? reject(error) : resolve(result)));
  });
let sink = 0;
console.log(`Node ${process.version}, ${process.platform}/${process.arch}; decimal timestamps, latest-value lookups`);
console.log(
  "Allocation is V8 sampling (32768-byte interval), including collected objects; bytes/lookup is an estimate."
);
for (const count of [40000, 456000]) {
  const field = new LogField(LoggableType.Number);
  for (let i = 0; i < count; i++) field.putNumber(i * 0.02, i);
  const old = new LegacyRange(field.toSerialized());
  for (const cached of [false, true]) {
    for (const [name, target, iterations] of [
      ["old", old, 300],
      ["new", field, 100000]
    ] as const) {
      const uuid = cached ? "benchmark" : undefined;
      const lookup = () => {
        const result = target.getRange(count * 0.02, count * 0.02, uuid);
        sink += result.values[0];
      };
      for (let i = 0; i < 100; i++) lookup();
      globalThis.gc?.();
      const start = performance.now();
      for (let i = 0; i < iterations; i++) lookup();
      const ms = performance.now() - start;
      globalThis.gc?.();
      await post("HeapProfiler.startSampling", {
        samplingInterval: 32768,
        includeObjectsCollectedByMajorGC: true,
        includeObjectsCollectedByMinorGC: true
      });
      for (let i = 0; i < iterations; i++) lookup();
      const { profile } = await post("HeapProfiler.stopSampling");
      const sum = (node: any): number =>
        node.selfSize + node.children.reduce((total: number, child: any) => total + sum(child), 0);
      const bytes = sum(profile.head);
      console.log(
        JSON.stringify({
          count,
          cached,
          name,
          iterations,
          nsPerLookup: Math.round((ms * 1e6) / iterations),
          sampledBytesPerLookup: Math.round(bytes / iterations)
        })
      );
    }
  }
}
console.log("checksum", sink);
session.disconnect();
