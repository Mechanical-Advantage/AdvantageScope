// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { compile } from "json-schema-to-typescript";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { format, resolveConfig } from "prettier";

const root = fileURLToPath(new URL("../", import.meta.url));
const vendor = path.join(root, "src/shared/mur/api");
const output = path.join(root, "src/shared/mur/live-types.ts");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const option = (flag) => {
  const i = process.argv.indexOf(flag);
  return i === -1 ? undefined : process.argv[i + 1];
};
const source = option("--source");
const commit = option("--commit");
const command = process.argv[2] ?? "check";
const upstreamDir = "api/live/v1/schema";
const git = (...args) => execFileSync("git", ["-C", source, ...args]);

if (command === "vendor") {
  assert.ok(source && /^[a-f0-9]{40}$/.test(commit ?? ""), "vendor needs --source and full --commit");
  const files = git("ls-tree", "-r", "--name-only", commit, upstreamDir).toString().trim().split("\n");
  assert.ok(files.length && files.every((f) => f.startsWith(upstreamDir + "/") && f.endsWith(".json")));
  await fs.rm(path.join(vendor, "schema"), { recursive: true, force: true });
  const hashes = {};
  for (const file of files) {
    const relative = "schema/" + file.slice(upstreamDir.length + 1);
    const bytes = git("show", `${commit}:${file}`);
    await fs.mkdir(path.dirname(path.join(vendor, relative)), { recursive: true });
    await fs.writeFile(path.join(vendor, relative), bytes);
    hashes[relative] = hash(bytes);
  }
  await fs.writeFile(
    path.join(vendor, "SOURCE.json"),
    JSON.stringify(
      {
        repository: "Melbourne-University-Motorsports/mur-msgs",
        commit,
        directory: "api/live/v1",
        files: hashes
      },
      null,
      2
    ) + "\n"
  );
}
assert.ok(["vendor", "generate", "check"].includes(command), "Use vendor, generate or check");
const pin = JSON.parse(await fs.readFile(path.join(vendor, "SOURCE.json"), "utf8"));
assert.match(pin.commit, /^[a-f0-9]{40}$/);
assert.equal(pin.repository, "Melbourne-University-Motorsports/mur-msgs");
assert.equal(pin.directory, "api/live/v1");
const localFiles = (await fs.readdir(path.join(vendor, "schema"), { recursive: true }))
  .filter((f) => f.endsWith(".json"))
  .map((f) => "schema/" + f)
  .sort();
assert.deepEqual(localFiles, Object.keys(pin.files).sort(), "Vendored schema file set drifted");
for (const [file, digest] of Object.entries(pin.files)) {
  const bytes = await fs.readFile(path.join(vendor, file));
  assert.equal(hash(bytes), digest, `${file} differs from pinned content`);
  if (source)
    assert.deepEqual(
      bytes,
      git("show", `${pin.commit}:${pin.directory}/${file}`),
      `${file} differs from upstream commit`
    );
}
if (source) {
  const upstream = git("ls-tree", "-r", "--name-only", pin.commit, upstreamDir)
    .toString()
    .trim()
    .split("\n")
    .map((f) => f.slice(pin.directory.length + 1))
    .sort();
  assert.deepEqual(localFiles, upstream, "Pinned upstream file set differs");
}
const schema = JSON.parse(await fs.readFile(path.join(vendor, "schema/live.schema.json"), "utf8"));
// The generator mishandles boolean schemas behind $ref. `true` means unknown.
assert.equal(schema.definitions.SampleValue, true);
schema.definitions.SampleValue = { tsType: "unknown" };
// Reference every definition to emit named types even when the root union cannot reach them.
const wrapper = {
  ...schema,
  title: "LiveAPIExports",
  type: "object",
  properties: Object.fromEntries(
    Object.keys(schema.definitions).map((name) => [name, { $ref: "#/definitions/" + name }])
  )
};
delete wrapper.anyOf;
const generatedRaw = await compile(wrapper, "LiveAPIExports", {
  unknownAny: true,
  bannerComment: `// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Generated from mur-msgs ${pin.commit}. Do not edit.\n// Run npm run live-api:generate.`,
  style: { printWidth: 120, tabWidth: 2, semi: true, singleQuote: false, trailingComma: "none" }
});
const generated = await format(generatedRaw, { ...(await resolveConfig(output)), filepath: output });
if (command === "check") {
  assert.equal(
    await fs.readFile(output, "utf8"),
    generated,
    "Generated live types drifted; run npm run live-api:generate"
  );
} else await fs.writeFile(output, generated);
console.log(
  `Live API ${command} passed: ${pin.commit}${source ? " (upstream verified)" : " (offline hashes verified)"}`
);
