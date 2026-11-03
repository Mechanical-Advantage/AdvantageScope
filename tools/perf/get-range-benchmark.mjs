// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Run with: node tools/perf/get-range-benchmark.mjs
// Bundles into a temporary directory; never enters the application bundle.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { rolldown } from "rolldown";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "get-range-benchmark-"));
try {
  const bundle = await rolldown({ input: "tools/perf/get-range-benchmark.ts", platform: "node", external: [/^node:/] });
  await bundle.write({ file: path.join(dir, "bench.mjs"), format: "esm" });
  const result = spawnSync(process.execPath, ["--expose-gc", path.join(dir, "bench.mjs")], { stdio: "inherit" });
  process.exitCode = result.status ?? 1;
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
