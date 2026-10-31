// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Bundles test/**/*.test.ts with rolldown (so app sources can be imported without .ts
// extensions) and runs them with the Node test runner.
//   npm test                 run all tests
//   npm test -- csv          run test files whose path contains "csv"

import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { rolldown } from "rolldown";

const filter = process.argv[2] ?? "";
const testFiles = fs
  .readdirSync("test", { recursive: true })
  .map((file) => path.join("test", file.toString()))
  .filter((file) => file.endsWith(".test.ts") && file.includes(filter));
if (testFiles.length === 0) {
  console.error("No test files found");
  process.exit(1);
}

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "mur-voir-tests-"));
const bundle = await rolldown({
  input: testFiles,
  platform: "node",
  moduleTypes: { ".dbc": "text" },
  external: [/^node:/]
});
await bundle.write({ dir: outDir, format: "esm", entryFileNames: "[name].mjs" });
const outputs = fs
  .readdirSync(outDir)
  .filter((file) => file.endsWith(".test.mjs"))
  .map((file) => path.join(outDir, file));
const result = spawnSync(process.execPath, ["--test", ...outputs], { stdio: "inherit" });
fs.rmSync(outDir, { recursive: true, force: true });
process.exit(result.status ?? 1);
