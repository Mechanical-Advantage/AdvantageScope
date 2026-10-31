// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { Aedes } from "aedes";
import { createServer } from "node:http";
import websocketStream from "websocket-stream";

const port = Number(process.argv[process.argv.indexOf("--port") + 1]) || 1884;
const timestampPrefix = process.argv.includes("--timestamp-prefix");
const broker = await Aedes.createBroker();
const server = createServer();
const sockets = websocketStream.createServer({ server }, broker.handle);
let tick = 0;
const publish = (topic, payload) =>
  broker.publish({
    topic,
    payload: Buffer.isBuffer(payload) ? payload : Buffer.from(payload),
    qos: 0,
    retain: false,
    cmd: "publish"
  });
function frame(id, data, t) {
  const offset = timestampPrefix ? 8 : 0;
  const out = Buffer.alloc(offset + 13);
  if (timestampPrefix) out.writeBigUInt64BE(BigInt(t));
  out.writeUInt32BE(id, offset);
  out[offset + 4] = 8;
  data.copy(out, offset + 5);
  publish("mur/raw/can", out);
}
const timer = setInterval(() => {
  const t = (BigInt(Date.now()) * 1000000n).toString();
  const rpm = Math.round(3000 + 1800 * Math.sin(tick / 30));
  const soc = 75 - (tick % 1000) / 100;
  const temp = 35 + 3 * Math.sin(tick / 70);
  const state = Math.floor(tick / 30) % 4;
  const values = {
    INVERTER: { INV_MotorSpeedRPM: rpm },
    ENNOID: { ENNOID_SoC: soc, ENNOID_TempCellMax: temp },
    DASH: { DASH_WheelSpeedFL: rpm / 6, DASH_WheelSpeedFR: rpm / 6 + 5 },
    ECU: { ECU_ECUState: state }
  };
  const ascii = [];
  for (const [node, signals] of Object.entries(values)) {
    publish("mur/object/" + node, JSON.stringify({ t, ...signals }));
    for (const [name, v] of Object.entries(signals)) {
      publish("mur/signal/" + node + "/" + name, JSON.stringify({ t, v }));
      ascii.push(node + "/" + name + "=" + v);
    }
  }
  publish("mur/ascii/signals", ascii.join("\n"));
  const motor = Buffer.alloc(8);
  motor.writeInt16LE(rpm, 2);
  frame(0xa5, motor, t);
  const bms = Buffer.alloc(8);
  bms[4] = Math.round(soc / 0.392157);
  bms.writeInt8(Math.round(temp), 6);
  frame(0x80002d0a, bms, t);
  const wheels = Buffer.alloc(8);
  wheels.writeUInt16LE(Math.round((rpm / 6) * 10), 0);
  wheels.writeUInt16LE(Math.round((rpm / 6 + 5) * 10), 2);
  frame(515, wheels, t);
  const ecu = Buffer.alloc(8);
  ecu[4] = state;
  frame(290, ecu, t);
  tick++;
}, 100);
server.listen(port, "127.0.0.1", () =>
  console.log(
    `MQTT debug broker ws://localhost:${port} · mur/signal/#, mur/object/#, mur/raw/#, mur/ascii/# · timestamp prefix ${timestampPrefix}`
  )
);
async function stop() {
  clearInterval(timer);
  await broker.close();
  sockets.close();
  server.close();
}
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
