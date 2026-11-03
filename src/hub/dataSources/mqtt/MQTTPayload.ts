// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { BUNDLED_DBCS } from "../can/BundledDBCs";
import { getSignalKey, getUnknownFrameKey } from "../can/CANKeys";
import { DBCSet, DBCSignal, decodeSignal, extractRaw, parseDBC, sortDBCFiles } from "../can/DBC";
import { MQTTSettings } from "./MQTTConfig";

export interface MQTTValue {
  path: string;
  value: number | string | boolean | Uint8Array;
  tNs: string | null;
  metadata?: Record<string, unknown>;
}
export const mqttDBC = new DBCSet();
sortDBCFiles(Object.keys(BUNDLED_DBCS)).forEach((name) => mqttDBC.add(parseDBC(BUNDLED_DBCS[name], name)));
const keys = new Map<DBCSignal, string>();
const metadata = new Map<string, Record<string, unknown>>();
mqttDBC.getAll().forEach((message) =>
  message.signals.forEach((signal) => {
    const path = getSignalKey(message, signal, (key) => metadata.has(key));
    keys.set(signal, path);
    metadata.set(path, {
      dbcSignal: signal.name,
      unit: signal.unit,
      message: message.name,
      node: message.transmitter,
      comment: signal.comment,
      scale: signal.factor,
      min: signal.min,
      max: signal.max,
      values: signal.valueTable ? Object.fromEntries(signal.valueTable) : undefined
    });
  })
);
export function mqttMetadata(path: string): Record<string, unknown> | undefined {
  return metadata.get(path);
}
/** Integer strings preserve Unix nanoseconds exactly; numeric seconds may include a fraction. */
export function mqttTimestamp(value: unknown): string | null {
  if (typeof value === "string" && /^\d{15,}$/.test(value)) return BigInt(value).toString();
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+(?:\.\d+)?$/.test(value)
      ? Number(value)
      : NaN;
  if (!Number.isFinite(n) || n <= 0) return null;
  return BigInt(Math.round(n >= 1e14 ? n : n * 1e9)).toString();
}
const scalar = (v: unknown): v is number | string | boolean =>
  typeof v === "string" || typeof v === "boolean" || (typeof v === "number" && Number.isFinite(v));
const clean = (s: string) => s.replace(/^\/+|\/+$/g, "");
export function parseMQTTPayload(topic: string, bytes: Uint8Array, settings: MQTTSettings): MQTTValue[] {
  if (settings.mode === "raw-can") return decodeMQTTCAN(bytes, settings.timestampPrefix);
  const prefix = settings.topic
    .split("/")
    .slice(
      0,
      settings.topic.split("/").findIndex((p) => p === "+" || p === "#")
    )
    .join("/");
  // Exact filters have no wildcard; their final component is the message name.
  const base =
    settings.topic.includes("+") || settings.topic.includes("#")
      ? prefix
      : settings.topic.split("/").slice(0, -1).join("/");
  const path = clean(base && topic.startsWith(base + "/") ? topic.slice(base.length + 1) : topic);
  const text = new TextDecoder().decode(bytes);
  if (settings.mode === "ascii")
    return text.split(/\r?\n/).flatMap((line) => {
      const index = line.indexOf("=");
      if (index < 1) return [];
      const name = clean(line.slice(0, index).trim());
      const raw = line.slice(index + 1).trim();
      const value =
        raw === "true"
          ? true
          : raw === "false"
          ? false
          : raw !== "" && Number.isFinite(Number(raw))
          ? Number(raw)
          : raw;
      return name ? [{ path: name, value, tNs: null }] : [];
    });
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return [];
  }
  if (settings.mode === "json-per-signal") {
    if (typeof json === "number" && Number.isFinite(json)) return path ? [{ path, value: json, tNs: null }] : [];
    if (!json || typeof json !== "object" || !("v" in json) || !scalar(json.v)) return [];
    return path ? [{ path, value: json.v, tNs: mqttTimestamp("t" in json ? json.t : null) }] : [];
  }
  if (!json || typeof json !== "object" || Array.isArray(json)) return [];
  const obj = json as Record<string, unknown>;
  return Object.entries(obj).flatMap(([name, value]) =>
    name !== "t" && scalar(value) ? [{ path: clean(path + "/" + name), value, tNs: mqttTimestamp(obj.t) }] : []
  );
}
export function decodeMQTTCAN(bytes: Uint8Array, timestampPrefix: boolean): MQTTValue[] {
  const offset = timestampPrefix ? 8 : 0;
  if (bytes.length !== offset + 13) return [];
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tNs = timestampPrefix ? mqttTimestamp(view.getBigUint64(0).toString()) : null;
  const rawId = view.getUint32(offset);
  const extended = (rawId & 0x80000000) !== 0 || rawId > 0x7ff;
  if (rawId & 0x60000000) return []; // SocketCAN remote/error frames are not data frames.
  const id = rawId & 0x1fffffff;
  const dlc = bytes[offset + 4];
  if (dlc > 8) return [];
  const data = bytes.subarray(offset + 5, offset + 5 + dlc);
  const message = mqttDBC.get(id, extended);
  if (!message) return [{ path: getUnknownFrameKey(id, extended), value: data, tNs }];
  const mux = message.signals.find((signal) => signal.isMultiplexor);
  return message.signals.flatMap<MQTTValue>((signal) => {
    if (signal.multiplexValue !== null && mux && extractRaw(mux, data) !== signal.multiplexValue) return [];
    const value = decodeSignal(signal, data);
    if (value === null) return [];
    const path = keys.get(signal)!;
    if (signal.valueTable) {
      let raw = extractRaw(signal, data)!;
      if (signal.signed && raw >= 2 ** (signal.length - 1)) raw -= 2 ** signal.length;
      return [
        { path, value: signal.valueTable.get(raw) ?? raw.toString(), tNs, metadata: metadata.get(path) },
        { path: path + "/raw", value: raw, tNs }
      ];
    }
    return [{ path, value, tNs, metadata: metadata.get(path) }];
  });
}
