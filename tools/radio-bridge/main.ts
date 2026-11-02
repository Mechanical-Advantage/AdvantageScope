// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { Aedes } from "aedes";
import { createServer } from "node:http";
import websocketStream from "websocket-stream";
import { LineFollower } from "./follow";
import { lineToPacket } from "./mapping";

const args = process.argv.slice(2);
const value = (name: string) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const input = value("--input");
if (!input || args.includes("--help")) {
  console.log("Usage: npm run radio-bridge -- --input <live.jsonl> [--port 1885] [--host 127.0.0.1] [--from-start]");
  process.exit(input ? 0 : 1);
}
const port = Number(value("--port") ?? 1885);
const host = value("--host") ?? "127.0.0.1";
const fromStart = args.includes("--from-start");

const log = (message: string) => console.log(new Date().toISOString().slice(11, 19) + " " + message);
const broker = await Aedes.createBroker();
const server = createServer();
const sockets = websocketStream.createServer({ server }, broker.handle);
let runId: string | null = null;
let packets = 0;
let samples = 0;
let badLines = 0;

const follower = new LineFollower({
  path: input,
  fromStart,
  onReset: (reason) => {
    runId = null;
    log(`input ${reason}; reading from the start`);
  },
  onLine: (line) => {
    const packet = lineToPacket(line);
    if (!packet) {
      badLines++;
      return;
    }
    if (packet.runId !== null && packet.runId !== runId) {
      runId = packet.runId;
      packets = 0;
      samples = 0;
      log(`run ${runId} (packet sequence restarts)`);
    }
    packets++;
    samples += packet.messages.length;
    for (const message of packet.messages)
      broker.publish({
        topic: message.topic,
        payload: Buffer.from(message.payload),
        qos: 0,
        retain: false,
        cmd: "publish",
        dup: false
      });
  }
});

server.listen(port, host, () => {
  log(
    `following ${input} (${fromStart ? "from start" : "from end"}) -> ws://${
      host === "0.0.0.0" ? "<this-host>" : host
    }:${port}, ` + `topic filter mur/signal/#, mapping JSON per signal`
  );
  follower.start();
});
async function stop() {
  follower.stop();
  if (badLines > 0) log(`${badLines} unparseable line(s) skipped`);
  await broker.close();
  sockets.close();
  server.close();
}
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
