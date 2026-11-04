// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Minimal contract client: hello -> snapshot -> availability -> subscribe -> samples.
// Prints a compact transcript. Uses Node's built-in WebSocket (no dependencies).
//
//   [CLIP=0] node tools/mock-backend/scripts/client.ts [ws://localhost:8090/api/v1/live] [seconds] [path ...]

import type { ClientOp, ServerOp } from "../../../src/shared/mur/contract.ts";

const url = process.argv[2] ?? "ws://localhost:8090/api/v1/live";
const seconds = Number(process.argv[3] ?? 1);
const paths = process.argv.slice(4);
if (paths.length === 0)
  paths.push("vehicles/mur27/dynamics/vehicle_speed", "vehicles/mur27/driver/throttle", "vehicles/mur27/nope");

// CLIP=0 prints whole messages
const MAX_LEN = Number(process.env.CLIP ?? 260) || Infinity;
const clip = (s: string) => (s.length > MAX_LEN ? s.slice(0, MAX_LEN) + " …" : s);

const ws = new WebSocket(url);
let availCount = 0;
let samplesMsgs = 0;
const send = (op: ClientOp) => {
  console.log(`>> ${JSON.stringify(op)}`);
  ws.send(JSON.stringify(op));
};

ws.onopen = () => send({ op: "hello", api_version: 1 });
ws.onmessage = (ev) => {
  const msg = JSON.parse(String(ev.data)) as ServerOp;
  switch (msg.op) {
    case "catalogue_snapshot": {
      const { signals, ...rest } = msg;
      console.log(`<< ${JSON.stringify({ ...rest, signals: `[${signals.length} descriptors]` })}`);
      console.log(`   e.g. ${clip(JSON.stringify(signals.find((s) => s.path === paths[0]) ?? signals[0]))}`);
      break;
    }
    case "availability":
      availCount++;
      if (availCount <= 2) console.log(`<< ${JSON.stringify(msg)}`);
      else if (availCount === 3) console.log("<< … (one availability event per catalogue signal)");
      break;
    case "samples":
      samplesMsgs++;
      if (samplesMsgs <= 4) console.log(`<< ${clip(JSON.stringify(msg))}`);
      break;
    default:
      console.log(`<< ${clip(JSON.stringify(msg))}`);
  }
};
// subscribe once the snapshot + availability burst has arrived
setTimeout(() => {
  send({ op: "subscribe", subscription_id: "graph-main", paths, max_rate_hz: 10, include_latest: true });
}, 200);
setTimeout(
  () => {
    console.log(`(${samplesMsgs} samples messages in ${seconds} s)`);
    ws.close();
  },
  200 + seconds * 1000
);
