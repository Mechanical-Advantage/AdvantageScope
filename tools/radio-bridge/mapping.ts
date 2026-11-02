// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { BUNDLED_DBCS } from "../../src/hub/dataSources/can/BundledDBCs";
import { getNodeName } from "../../src/hub/dataSources/can/CANKeys";
import { DBCSignal, parseDBC, sortDBCFiles } from "../../src/hub/dataSources/can/DBC";
import { mqttTimestamp } from "../../src/hub/dataSources/mqtt/MQTTPayload";

/**
 * Maps base-station JSONL samples to MQTT messages for mur-voir's "JSON per signal" mapping with
 * topic filter `mur/signal/#`. Paths match the JSONL importer: CAN signals found in the bundled
 * DBCs become `<NODE>/<Signal>` (enum signals publish the label, plus the number at `/raw`);
 * everything else becomes its dotted name with slashes. Units and enum tables come from the DBC
 * metadata mur-voir attaches to those canonical paths.
 */
export const TOPIC_PREFIX = "mur/signal/";

export interface BridgeMessage {
  topic: string;
  payload: string;
}
export interface PacketInfo {
  runId: string | null;
  messages: BridgeMessage[];
}

let lookup: Map<string, DBCSignal & { node: string }> | null = null;
function getLookup() {
  if (lookup) return lookup;
  lookup = new Map();
  sortDBCFiles(Object.keys(BUNDLED_DBCS)).forEach((file) =>
    parseDBC(BUNDLED_DBCS[file], file).messages.forEach((message) =>
      message.signals.forEach((signal) => {
        if (!lookup!.has(signal.name)) lookup!.set(signal.name, Object.assign(signal, { node: getNodeName(message) }));
      })
    )
  );
  return lookup;
}

/** Quotes integer `time` values before parsing: Unix nanoseconds exceed 2^53. */
export function parseLine(line: string): any | null {
  try {
    return JSON.parse(line.replace(/("time"\s*:\s*)(\d+)(?![\d.eE])/g, '$1"$2"'));
  } catch {
    return null;
  }
}

export function sampleToMessages(sample: any): BridgeMessage[] {
  if (typeof sample !== "object" || sample === null || typeof sample.signal !== "string") return [];
  const value = sample.value;
  if (typeof value !== "number" && typeof value !== "string" && typeof value !== "boolean") return [];
  if (typeof value === "number" && !Number.isFinite(value)) return [];
  const t = mqttTimestamp(sample.time);
  if (t === null) return [];
  const parts = sample.signal.split(".");
  const dbc = /^can\d+$/.test(parts[0]) ? getLookup().get(parts[parts.length - 1]) : undefined;
  const send = (path: string, v: number | string | boolean): BridgeMessage => ({
    topic: TOPIC_PREFIX + path,
    payload: JSON.stringify({ t, v })
  });
  if (!dbc) return [send(parts.join("/"), value)];
  const key = dbc.node + "/" + dbc.name;
  if (dbc.valueTable === null) return typeof value === "number" ? [send(key, value)] : [];
  const raw = Number(value);
  return [send(key, dbc.valueTable.get(raw) ?? String(value)), send(key + "/raw", raw)];
}

/** Converts one JSONL line (a radio packet) into messages. Returns null for an unparseable line. */
export function lineToPacket(line: string): PacketInfo | null {
  const packet = parseLine(line);
  if (typeof packet !== "object" || packet === null) return null;
  const samples = Array.isArray(packet.samples) ? packet.samples : [packet];
  return {
    runId: typeof packet.run_id === "string" ? packet.run_id : null,
    messages: samples.flatMap(sampleToMessages)
  };
}
