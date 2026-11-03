// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Log from "../../../shared/log/Log";
import LoggableType from "../../../shared/log/LoggableType";
import { sendProgress, setMetadata } from "../ImporterUtil";
import { decodeCSVText, detectDelimiter, readRows } from "../csv/CSVParser";
import { BUNDLED_DBCS } from "./BundledDBCs";
import { CANDUMP_ENUM_RAW_SUFFIX, getSignalKey, getUnknownFrameKey } from "./CANKeys";
import { CandumpIndex, DATA_STRIDE, FLAG_ERROR, FLAG_EXTENDED, FLAG_REMOTE, indexCandump } from "./Candump";
import { DBCMessage, DBCSet, DBCSignal, decodeSignal, extractRaw, parseDBC, sortDBCFiles } from "./DBC";

/**
 * candump -L importer.
 *
 * Files from the main process: [log, <stem>.json sidecar | null, <stem>.markers.csv | null,
 * DBC pack | null]. The DBC pack is UTF-8 JSON `{ "<relative path>": "<dbc text>" }` read from
 * the DBC folder in Preferences; without it the bundled mur-msgs DBCs are used.
 *
 * Frames are indexed once; each signal is decoded only when requested, from that message's
 * frames only. Decoding uses the merged DBC set by ID, so both bus-naming schemes work.
 */

export function createCandumpImporter() {
  let log = new Log(false);
  let index: CandumpIndex;
  const dbcSet = new DBCSet();
  const framesByMessage = new Map<string, number[]>(); // "<ext>:<id>" → frame indices
  const signalsByKey = new Map<string, { message: DBCMessage; signal: DBCSignal; enumRaw: boolean }>();
  const decoded = new Set<string>();

  function messageKey(id: number, extended: boolean) {
    return (extended ? "x" : "s") + id.toString();
  }

  function loadDBCs(pack: Uint8Array | null) {
    let files: { [path: string]: string } = BUNDLED_DBCS;
    if (pack !== null && pack.length > 0) {
      try {
        const parsed = JSON.parse(new TextDecoder().decode(pack));
        if (typeof parsed === "object" && Object.keys(parsed).length > 0) files = parsed;
      } catch (error) {
        console.error("Failed to read the DBC folder, using the bundled DBCs", error);
      }
    }
    sortDBCFiles(Object.keys(files)).forEach((path) => {
      dbcSet.add(parseDBC(files[path], path));
    });
    if (dbcSet.duplicates.length > 0) console.warn("Duplicate DBC message IDs (first wins):", dbcSet.duplicates);
  }

  function start(files: (Uint8Array | null)[], frameIndex?: CandumpIndex): Log {
    loadDBCs(files[3] ?? null);
    index = frameIndex ?? indexCandump(files[0]!, (fraction) => sendProgress(fraction * 0.9));
    if (index.count === 0) throw new Error("No candump frames found");

    // Group frames by message and collect bus statistics
    let minTime = Infinity;
    let maxTime = -Infinity;
    const errorFrames: number[] = [];
    const remoteCounts = new Map<string, number>();
    for (let i = 0; i < index.count; i++) {
      const timestamp = index.timestamps[i];
      if (timestamp < minTime) minTime = timestamp;
      if (timestamp > maxTime) maxTime = timestamp;
      const flags = index.flags[i];
      if (flags & FLAG_ERROR) {
        errorFrames.push(i);
        continue;
      }
      const key = messageKey(index.ids[i], (flags & FLAG_EXTENDED) !== 0);
      if (flags & FLAG_REMOTE) {
        remoteCounts.set(key, (remoteCounts.get(key) ?? 0) + 1);
        continue;
      }
      let frames = framesByMessage.get(key);
      if (frames === undefined) {
        frames = [];
        framesByMessage.set(key, frames);
      }
      frames.push(i);
    }
    log.updateRangeWithTimestamp(minTime);
    log.updateRangeWithTimestamp(maxTime);

    // Create a field for every signal of every message that appears in the log
    const busesById = new Map<string, Set<string>>();
    framesByMessage.forEach((frames, key) => {
      const ifaces = new Set<string>();
      for (let i = 0; i < frames.length && ifaces.size < index.ifaces.length; i++) {
        ifaces.add(index.ifaces[index.ifaceIndex[frames[i]]]);
      }
      busesById.set(key, ifaces);
    });
    const unknownIds: string[] = [];
    framesByMessage.forEach((frames, key) => {
      const firstFrame = frames[0];
      const extended = (index.flags[firstFrame] & FLAG_EXTENDED) !== 0;
      const id = index.ids[firstFrame];
      const message = dbcSet.get(id, extended);
      if (message === undefined) {
        const fieldKey = getUnknownFrameKey(id, extended);
        unknownIds.push(fieldKey);
        log.createBlankField(fieldKey, LoggableType.Raw);
        setMetadata(log, fieldKey, {
          description: "Frames with no DBC definition (raw data bytes)",
          frames: frames.length,
          buses: [...busesById.get(key)!].join(", ")
        });
        return;
      }
      message.signals.forEach((signal) => {
        const fieldKey = getSignalKey(message, signal, (candidate) => signalsByKey.has(candidate));
        const enumRaw = signal.valueTable !== null;
        signalsByKey.set(fieldKey, { message, signal, enumRaw: false });
        const metadata = {
          dbcSignal: signal.name,
          unit: enumRaw ? undefined : signal.unit,
          message: message.name,
          id: "0x" + message.id.toString(16).toUpperCase() + (message.extended ? " (extended)" : ""),
          node: message.transmitter,
          dbc: message.source,
          buses: [...busesById.get(key)!].join(", "),
          comment: signal.comment,
          values: signal.valueTable ? Object.fromEntries(signal.valueTable) : undefined,
          sentinels:
            signal.sentinels.size > 0
              ? [...signal.sentinels].map((value) => "0x" + value.toString(16).toUpperCase())
              : undefined
        };
        if (enumRaw) {
          // Enum: the label as a string (discrete in graphs), with the number as a child
          log.createBlankField(fieldKey, LoggableType.String);
          setMetadata(log, fieldKey, metadata);
          const rawKey = fieldKey + CANDUMP_ENUM_RAW_SUFFIX;
          log.createBlankField(rawKey, LoggableType.Number);
          setMetadata(log, rawKey, { ...metadata, unit: signal.unit });
          signalsByKey.set(rawKey, { message, signal, enumRaw: true });
        } else {
          log.createBlankField(fieldKey, LoggableType.Number);
          setMetadata(log, fieldKey, metadata);
        }
      });
    });

    // Error frames, per interface (value = error class bits from the CAN ID)
    errorFrames.forEach((frame) => {
      const key = "CAN/" + index.ifaces[index.ifaceIndex[frame]] + "/ErrorFrame";
      log.putNumber(key, index.timestamps[frame], index.ids[frame]);
    });

    // Sidecars
    if (files[1]) readJsonSidecar(files[1], minTime);
    if (files[2]) readMarkers(files[2]);

    // Import summary
    log.putJSON(
      "Metadata/Import",
      minTime,
      JSON.stringify({
        frames: index.count,
        interfaces: index.ifaces,
        messages: framesByMessage.size,
        unknownMessages: unknownIds.length,
        errorFrames: errorFrames.length,
        remoteFrames: [...remoteCounts.values()].reduce((a, b) => a + b, 0),
        malformedLines: index.malformedLines,
        dbcFiles: [...new Set(dbcSet.getAll().map((message) => message.source))]
      })
    );
    return log;
  }

  function readJsonSidecar(bytes: Uint8Array, timestamp: number) {
    try {
      const text = new TextDecoder().decode(bytes);
      JSON.parse(text); // Validate
      log.putJSON("Metadata/Run", timestamp, text);
    } catch (error) {
      console.warn("Could not read the .json sidecar", error);
    }
  }

  /** `<stem>.markers.csv`: columns t_epoch, t_rel_s, text. */
  function readMarkers(bytes: Uint8Array) {
    const text = decodeCSVText(bytes);
    const rows = readRows(text, detectDelimiter(text), Infinity);
    if (rows.length === 0) return;
    const header = rows[0].map((cell) => cell.trim().toLowerCase());
    let timeColumn = header.indexOf("t_epoch");
    let textColumn = header.indexOf("text");
    const hasHeader = timeColumn !== -1 || textColumn !== -1;
    if (timeColumn === -1) timeColumn = 0;
    if (textColumn === -1) textColumn = header.length - 1;
    rows.slice(hasHeader ? 1 : 0).forEach((row) => {
      const timestamp = Number(row[timeColumn]);
      if (!isFinite(timestamp) || row.length <= textColumn) return;
      log.putString("Markers", timestamp, row[textColumn]);
    });
  }

  function decode(keys: string[]): string[] {
    const sendKeys: string[] = [];
    keys.forEach((key) => {
      if (decoded.has(key)) return;
      decoded.add(key);
      const target = signalsByKey.get(key);
      if (target !== undefined) {
        decodeSignalField(key, target.message, target.signal, target.enumRaw);
        sendKeys.push(key);
        return;
      }
      if (key.startsWith("CAN/Unknown/")) {
        decodeUnknown(key);
        sendKeys.push(key);
      }
    });
    return sendKeys;
  }

  function decodeSignalField(key: string, message: DBCMessage, signal: DBCSignal, enumRaw: boolean) {
    const frames = framesByMessage.get(messageKey(message.id, message.extended));
    if (frames === undefined) return;
    const multiplexor = signal.multiplexValue === null ? null : message.signals.find((other) => other.isMultiplexor);
    const isEnumLabel = signal.valueTable !== null && !enumRaw;
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      const offset = frame * DATA_STRIDE;
      const length = index.dataLength[frame];
      if (multiplexor) {
        const muxValue = extractRaw(multiplexor, index.data, offset, length);
        if (muxValue !== signal.multiplexValue) continue;
      }
      const timestamp = index.timestamps[frame];
      if (isEnumLabel) {
        const raw = extractRaw(signal, index.data, offset, length);
        if (raw === null) continue;
        const signedRaw = signal.signed && raw >= 2 ** (signal.length - 1) ? raw - 2 ** signal.length : raw;
        log.putString(key, timestamp, signal.valueTable!.get(signedRaw) ?? signedRaw.toString());
      } else {
        const value = decodeSignal(signal, index.data, offset, length);
        if (value === null) continue;
        log.putNumber(key, timestamp, value);
      }
    }
  }

  function decodeUnknown(key: string) {
    const match = key.match(/^CAN\/Unknown\/0x([0-9A-F]+)$/);
    if (!match) return;
    const extended = match[1].length > 3;
    const frames = framesByMessage.get(messageKey(parseInt(match[1], 16), extended));
    if (frames === undefined) return;
    frames.forEach((frame) => {
      const offset = frame * DATA_STRIDE;
      log.putRaw(key, index.timestamps[frame], index.data.slice(offset, offset + index.dataLength[frame]));
    });
  }

  return { start, decode, getLog: () => log };
}
