// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Bundles main.ts (which imports app TypeScript and .dbc text) with rolldown, then runs it.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rolldown } from "rolldown";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const outDir = path.join(root, "node_modules", ".cache", "radio-bridge");
fs.rmSync(outDir, { recursive: true, force: true });
const bundle = await rolldown({
  input: path.join(root, "tools", "radio-bridge", "main.ts"),
  platform: "node",
  moduleTypes: { ".dbc": "text" },
  external: [/^node:/, "aedes", "websocket-stream"],
  logLevel: "silent"
});
await bundle.write({ dir: outDir, format: "esm", entryFileNames: "main.mjs" });
const child = spawn(process.execPath, [path.join(outDir, "main.mjs"), ...process.argv.slice(2)], { stdio: "inherit" });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 0));
