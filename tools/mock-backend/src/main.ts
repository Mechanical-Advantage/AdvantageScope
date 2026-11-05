#!/usr/bin/env node
// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// CLI: node tools/mock-backend/src/main.ts [flags]

import { parseArgs } from "node:util";
import { startServer } from "./server.ts";
import { SOURCES, type Source } from "./signals.ts";

const HELP = `mur-voir mock telemetry backend (spec 01 §5)

Usage: node tools/mock-backend/src/main.ts [options]

  --port <n>              HTTP/WS port (default 8090)
  --host <addr>           bind address (default 0.0.0.0)
  --seed <n>              PRNG seed; same seed => same data (default 1)
  --speed <x>             simulation time multiplier (default 1)
  --drop-rate <f>         fraction of samples lost on the link, 0..1 (seq gaps remain)
  --duplicate             deliver every live sample twice (rf + cellular) to test dedup
  --fault-demo            health warning/critical pulse at 10–20 s, then recovery
  --stale-test            periodically stop a source (60 s cycle: 30 s on, 30 s off; offline after 4 s)
  --stale-source <src>    source for --stale-test (default sbg-ins)
  --catalogue-churn       register a probe signal every 40 s and remove it 20 s later
  --unsync                mark one source's samples unsynchronised (with clock offset + drift)
  --unsync-source <src>   source for --unsync (default ennoid-bms)
  --lap-counter           add vehicles/mur27/timing/{lap_count,last_lap_time} (beacon lap source)
  --no-history            GET /api/v1/history returns 501 not_implemented
  --history-seconds <n>   rolling history length (default 360)
  --start-time-ns <ns>    fix the Unix start time (makes output bit-reproducible)
  -h, --help

Sources: ${SOURCES.join(", ")}`;

const { values } = parseArgs({
  options: {
    port: { type: "string", default: "8090" },
    host: { type: "string", default: "0.0.0.0" },
    seed: { type: "string", default: "1" },
    speed: { type: "string", default: "1" },
    "drop-rate": { type: "string", default: "0" },
    duplicate: { type: "boolean", default: false },
    "fault-demo": { type: "boolean", default: false },
    "stale-test": { type: "boolean", default: false },
    "stale-source": { type: "string", default: "sbg-ins" },
    "catalogue-churn": { type: "boolean", default: false },
    unsync: { type: "boolean", default: false },
    "unsync-source": { type: "string", default: "ennoid-bms" },
    "lap-counter": { type: "boolean", default: false },
    "no-history": { type: "boolean", default: false },
    "history-seconds": { type: "string", default: "360" },
    "start-time-ns": { type: "string" },
    help: { type: "boolean", short: "h", default: false }
  }
});

if (values.help) {
  console.log(HELP);
  process.exit(0);
}

function num(name: string, v: string, min: number, max: number): number {
  const n = Number(v);
  if (!Number.isFinite(n) || n < min || n > max) {
    console.error(`--${name} must be a number in [${min}, ${max}]`);
    process.exit(2);
  }
  return n;
}
function source(name: string, v: string): Source {
  if (!(SOURCES as readonly string[]).includes(v)) {
    console.error(`--${name} must be one of: ${SOURCES.join(", ")}`);
    process.exit(2);
  }
  return v as Source;
}

const opts = {
  port: num("port", values.port!, 0, 65535),
  host: values.host!,
  seed: Math.trunc(num("seed", values.seed!, 0, 2 ** 32 - 1)),
  speed: num("speed", values.speed!, 0.01, 100),
  dropRate: num("drop-rate", values["drop-rate"]!, 0, 1),
  duplicate: values.duplicate!,
  faultDemo: values["fault-demo"]!,
  staleTest: values["stale-test"]!,
  staleSource: source("stale-source", values["stale-source"]!),
  catalogueChurn: values["catalogue-churn"]!,
  unsync: values.unsync!,
  unsyncSource: source("unsync-source", values["unsync-source"]!),
  lapCounter: values["lap-counter"]!,
  history: !values["no-history"],
  historySeconds: num("history-seconds", values["history-seconds"]!, 10, 3600),
  startTimeNs: values["start-time-ns"] ? BigInt(values["start-time-ns"]) : null
};

const h = await startServer(opts);
const flags = Object.entries(opts)
  .filter(([k, v]) => v !== false && v !== null && !["port", "host"].includes(k))
  .map(([k, v]) => `${k}=${v}`)
  .join(" ");
console.log(`mock backend: http://localhost:${h.port}/api/v1/catalogue  ws://localhost:${h.port}/api/v1/live`);
console.log(`  ${h.backend.catalogue.size} signals, epoch ${h.backend.epoch}; ${flags}`);

const shutdown = () => {
  void h.close().then(() => process.exit(0));
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
