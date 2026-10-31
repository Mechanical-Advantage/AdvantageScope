// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Log from "../../../shared/log/Log";
import LoggableType from "../../../shared/log/LoggableType";
import { runLazyWorker, sendProgress, setMetadata } from "../ImporterUtil";
import { BUNDLED_DBCS } from "../can/BundledDBCs";
import { CANDUMP_ENUM_RAW_SUFFIX, getNodeName } from "../can/CANKeys";
import { DBCMessage, DBCSignal, parseDBC, sortDBCFiles } from "../can/DBC";

/**
 * Base-station JSONL importer. Each line is one radio packet:
 *   {"run_id", "sequence", "samples": [{"time": <unix ns>, "signal", "value", "unit"}]}
 *
 * CAN signals (`can<bus>.<Message>.<Signal>`) are mapped to the same `<NODE>/<Signal>` paths as
 * the candump importer, using the bundled DBCs to find the node, so layouts work with both.
 * Other signals (e.g. `lvb0.voltage`) become tree paths (`lvb0/voltage`).
 */

let log = new Log(false);
const samples = new Map<string, { times: number[]; values: (number | string | boolean)[] }>();
const enumSignals = new Map<string, DBCSignal>(); // Label key → signal
const decoded = new Set<string>();

runLazyWorker(start, decode, () => log);

function buildSignalLookup(): Map<string, { message: DBCMessage; signal: DBCSignal }> {
  const lookup = new Map<string, { message: DBCMessage; signal: DBCSignal }>();
  sortDBCFiles(Object.keys(BUNDLED_DBCS)).forEach((path) => {
    parseDBC(BUNDLED_DBCS[path], path).messages.forEach((message) => {
      message.signals.forEach((signal) => {
        if (!lookup.has(signal.name)) lookup.set(signal.name, { message, signal });
      });
    });
  });
  return lookup;
}

function start(files: (Uint8Array | null)[]): Log {
  const text = new TextDecoder().decode(files[0]!);
  const lookup = buildSignalLookup();
  const keyCache = new Map<string, string>();
  const runIds = new Set<string>();
  let packets = 0;
  let badLines = 0;
  let minTime = Infinity;
  let maxTime = -Infinity;
  let lastProgress = 0;

  let pos = 0;
  while (pos < text.length) {
    let end = text.indexOf("\n", pos);
    if (end === -1) end = text.length;
    const line = text.slice(pos, end).trim();
    pos = end + 1;
    if (line.length === 0) continue;
    let packet: any;
    try {
      packet = JSON.parse(line);
    } catch {
      badLines++;
      continue;
    }
    packets++;
    if (typeof packet.run_id === "string") runIds.add(packet.run_id);
    const packetSamples = Array.isArray(packet.samples) ? packet.samples : [packet];
    packetSamples.forEach((sample: any) => {
      if (typeof sample !== "object" || sample === null || typeof sample.signal !== "string") return;
      const time = Number(sample.time) / 1e9;
      if (!isFinite(time)) return;
      let key = keyCache.get(sample.signal);
      if (key === undefined) {
        key = createField(sample.signal, typeof sample.unit === "string" ? sample.unit : "", sample.value, lookup);
        keyCache.set(sample.signal, key);
      }
      let series = samples.get(key);
      if (series === undefined) {
        series = { times: [], values: [] };
        samples.set(key, series);
      }
      series.times.push(time);
      series.values.push(sample.value);
      if (time < minTime) minTime = time;
      if (time > maxTime) maxTime = time;
    });
    if (pos / text.length - lastProgress > 0.02) {
      lastProgress = pos / text.length;
      sendProgress(lastProgress * 0.9);
    }
  }
  if (!isFinite(minTime)) throw new Error("No samples found in JSONL");
  log.updateRangeWithTimestamp(minTime);
  log.updateRangeWithTimestamp(maxTime);
  log.putJSON(
    "Metadata/Import",
    minTime,
    JSON.stringify({ runIds: [...runIds], packets: packets, signals: samples.size, badLines: badLines })
  );
  return log;
}

/** Creates the field for a signal name and returns its key. */
function createField(
  signal: string,
  unit: string,
  firstValue: unknown,
  lookup: Map<string, { message: DBCMessage; signal: DBCSignal }>
): string {
  const parts = signal.split(".");
  const dbc = lookup.get(parts[parts.length - 1]);
  if (dbc !== undefined && /^can\d+$/.test(parts[0])) {
    const key = getNodeName(dbc.message) + "/" + dbc.signal.name;
    const metadata = { unit: unit || dbc.signal.unit, message: dbc.message.name, bus: parts[0], signal: signal };
    if (dbc.signal.valueTable !== null) {
      log.createBlankField(key, LoggableType.String);
      setMetadata(log, key, { ...metadata, unit: undefined });
      log.createBlankField(key + CANDUMP_ENUM_RAW_SUFFIX, LoggableType.Number);
      setMetadata(log, key + CANDUMP_ENUM_RAW_SUFFIX, metadata);
      enumSignals.set(key, dbc.signal);
      samples.set(key + CANDUMP_ENUM_RAW_SUFFIX, { times: [], values: [] }); // Filled at decode time
    } else {
      log.createBlankField(key, LoggableType.Number);
      setMetadata(log, key, metadata);
    }
    return key;
  }
  const key = parts.join("/");
  const type =
    typeof firstValue === "string"
      ? LoggableType.String
      : typeof firstValue === "boolean"
        ? LoggableType.Boolean
        : LoggableType.Number;
  log.createBlankField(key, type);
  setMetadata(log, key, { unit: unit, signal: signal });
  return key;
}

function decode(keys: string[]): string[] {
  const sendKeys: string[] = [];
  keys.forEach((requested) => {
    // Enum raw children are decoded with their label field
    const key = requested.endsWith(CANDUMP_ENUM_RAW_SUFFIX) && enumSignals.has(requested.slice(0, -4))
      ? requested.slice(0, -4)
      : requested;
    if (decoded.has(key)) return;
    decoded.add(key);
    const series = samples.get(key);
    if (series === undefined) return;
    const enumSignal = enumSignals.get(key);
    const type = log.getType(key);
    for (let i = 0; i < series.times.length; i++) {
      const value = series.values[i];
      const time = series.times[i];
      if (enumSignal !== undefined) {
        const raw = Number(value);
        log.putString(key, time, enumSignal.valueTable!.get(raw) ?? String(value));
        log.putNumber(key + CANDUMP_ENUM_RAW_SUFFIX, time, raw);
      } else if (type === LoggableType.Number) {
        log.putNumber(key, time, value === null ? NaN : Number(value));
      } else if (type === LoggableType.Boolean) {
        log.putBoolean(key, time, Boolean(value));
      } else {
        log.putString(key, time, String(value));
      }
    }
    samples.delete(key);
    sendKeys.push(key);
    if (enumSignal !== undefined) sendKeys.push(key + CANDUMP_ENUM_RAW_SUFFIX);
  });
  return sendKeys;
}
