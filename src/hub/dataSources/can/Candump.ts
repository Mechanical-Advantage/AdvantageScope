// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/** Parsing for `candump -L` logs: `(<epoch s>.<µs>) <iface> <ID>#<DATA>`. */

export const CAN_ERR_FLAG = 0x20000000;
export const CAN_EFF_MASK = 0x1fffffff;

export enum CandumpFrameKind {
  Data,
  Remote,
  Error
}

export interface CandumpFrame {
  /** Seconds (normally since the Unix epoch). */
  timestamp: number;
  iface: string;
  /** ID without the error flag. */
  id: number;
  extended: boolean;
  kind: CandumpFrameKind;
  fd: boolean;
  /** CAN FD flags nibble (BRS = 1, ESI = 2), 0 for classic frames. */
  fdFlags: number;
  data: Uint8Array;
}

/** Parses one candump line. Returns null for blank lines, comments and malformed lines. */
export function parseCandumpLine(line: string): CandumpFrame | null {
  const match = line.match(/^\s*\((\d+(?:\.\d+)?)\)\s+(\S+)\s+([0-9A-Fa-f]{1,8})#(#?)([0-9A-Fa-f.]*|R\d*)\s*$/);
  if (match === null) return null;
  const timestamp = Number(match[1]);
  const idText = match[3];
  let id = parseInt(idText, 16);
  const extended = idText.length > 3;
  let kind = CandumpFrameKind.Data;
  if (extended && (id & CAN_ERR_FLAG) !== 0) {
    kind = CandumpFrameKind.Error;
    id = id & ~CAN_ERR_FLAG & CAN_EFF_MASK;
  } else if (extended) {
    id = id & CAN_EFF_MASK;
  }
  const fd = match[4] === "#";
  let payload = match[5].replaceAll(".", "");
  let fdFlags = 0;
  if (payload.startsWith("R")) {
    if (kind !== CandumpFrameKind.Error) kind = CandumpFrameKind.Remote;
    payload = "";
  } else if (fd) {
    if (payload.length === 0) return null;
    fdFlags = parseInt(payload[0], 16);
    payload = payload.slice(1);
  }
  if (payload.length % 2 !== 0) return null;
  const data = new Uint8Array(payload.length / 2);
  for (let i = 0; i < data.length; i++) {
    data[i] = parseInt(payload.slice(i * 2, i * 2 + 2), 16);
  }
  return { timestamp, iface: match[2], id, extended, kind, fd, fdFlags, data };
}

/** Returns true if the start of a file looks like a candump -L log. */
export function isCandump(head: Uint8Array): boolean {
  const text = new TextDecoder().decode(head.subarray(0, 4096));
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length > 1) lines.pop(); // Last line may be cut off
  return lines.length > 0 && lines.slice(0, 5).every((line) => parseCandumpLine(line) !== null);
}

const HEX_VALUES = (() => {
  const table = new Int8Array(256).fill(-1);
  for (let i = 0; i < 10; i++) table[48 + i] = i;
  for (let i = 0; i < 6; i++) {
    table[65 + i] = 10 + i;
    table[97 + i] = 10 + i;
  }
  return table;
})();

/** A compact, columnar index of every frame in a candump log. */
export interface CandumpIndex {
  count: number;
  timestamps: Float64Array;
  /** Index into `ifaces`. */
  ifaceIndex: Uint8Array;
  ifaces: string[];
  ids: Uint32Array;
  /** Bit 0 = extended, bit 1 = remote, bit 2 = error, bit 3 = FD. */
  flags: Uint8Array;
  dataLength: Uint8Array;
  /** Frame data, 64 bytes per frame slot. */
  data: Uint8Array;
  malformedLines: number;
}

export const FLAG_EXTENDED = 1;
export const FLAG_REMOTE = 2;
export const FLAG_ERROR = 4;
export const FLAG_FD = 8;
export const DATA_STRIDE = 64;

/**
 * Indexes a whole candump log directly from its bytes (no string decoding), which is much faster
 * than parsing line by line. Malformed lines are skipped and counted.
 */
export function indexCandump(bytes: Uint8Array, progress?: (fraction: number) => void): CandumpIndex {
  // Upper bound on the frame count: number of newlines + 1
  let lineCount = 1;
  for (let i = 0; i < bytes.length; i++) if (bytes[i] === 10) lineCount++;

  const timestamps = new Float64Array(lineCount);
  const ifaceIndex = new Uint8Array(lineCount);
  const ids = new Uint32Array(lineCount);
  const flags = new Uint8Array(lineCount);
  const dataLength = new Uint8Array(lineCount);
  let data = new Uint8Array(Math.min(lineCount, 1 << 16) * DATA_STRIDE);
  const ifaces: string[] = [];
  const ifaceLookup = new Map<string, number>();
  let count = 0;
  let malformed = 0;
  let lastProgress = 0;

  let pos = 0;
  const length = bytes.length;
  while (pos < length) {
    let lineEnd = bytes.indexOf(10, pos);
    if (lineEnd === -1) lineEnd = length;
    const parsed = parseLineBytes(bytes, pos, lineEnd);
    pos = lineEnd + 1;
    if (parsed === null) continue;
    if (parsed === false) {
      malformed++;
      continue;
    }

    // Store frame
    if ((count + 1) * DATA_STRIDE > data.length) {
      const grown = new Uint8Array(Math.min(lineCount, (count + 1) * 2) * DATA_STRIDE);
      grown.set(data);
      data = grown;
    }
    timestamps[count] = parsed.timestamp;
    let iface = ifaceLookup.get(parsed.iface);
    if (iface === undefined) {
      iface = ifaces.length;
      ifaces.push(parsed.iface);
      ifaceLookup.set(parsed.iface, iface);
    }
    ifaceIndex[count] = iface;
    ids[count] = parsed.id;
    flags[count] = parsed.flags;
    const dataStart = count * DATA_STRIDE;
    let dataBytes = 0;
    for (let i = parsed.dataStart; i + 1 < parsed.dataEnd && dataBytes < DATA_STRIDE; ) {
      if (bytes[i] === 46) {
        // "." separators (candump -L uses them for FD data in some versions)
        i++;
        continue;
      }
      const high = HEX_VALUES[bytes[i]];
      const low = HEX_VALUES[bytes[i + 1]];
      if (high < 0 || low < 0) break;
      data[dataStart + dataBytes] = high * 16 + low;
      dataBytes++;
      i += 2;
    }
    dataLength[count] = dataBytes;
    count++;

    if (progress && pos / length - lastProgress > 0.02) {
      lastProgress = pos / length;
      progress(lastProgress);
    }
  }

  return {
    count,
    timestamps: timestamps.subarray(0, count),
    ifaceIndex: ifaceIndex.subarray(0, count),
    ifaces,
    ids: ids.subarray(0, count),
    flags: flags.subarray(0, count),
    dataLength: dataLength.subarray(0, count),
    data: data.subarray(0, count * DATA_STRIDE),
    malformedLines: malformed
  };
}

const ifaceDecoder = new TextDecoder();

/** Returns null for blank lines, false for malformed lines. */
function parseLineBytes(
  bytes: Uint8Array,
  start: number,
  end: number
): null | false | { timestamp: number; iface: string; id: number; flags: number; dataStart: number; dataEnd: number } {
  let i = start;
  while (i < end && (bytes[i] === 32 || bytes[i] === 9)) i++;
  while (end > i && (bytes[end - 1] === 13 || bytes[end - 1] === 32 || bytes[end - 1] === 9)) end--;
  if (i >= end) return null;
  if (bytes[i] === 35) return null; // "#" comment
  if (bytes[i] !== 40) return false; // "("
  i++;

  // Timestamp: integer seconds plus fraction
  let seconds = 0;
  let digits = 0;
  while (i < end && bytes[i] >= 48 && bytes[i] <= 57) {
    seconds = seconds * 10 + (bytes[i] - 48);
    i++;
    digits++;
  }
  if (digits === 0) return false;
  let fraction = 0;
  let scale = 1;
  if (bytes[i] === 46) {
    i++;
    while (i < end && bytes[i] >= 48 && bytes[i] <= 57) {
      fraction = fraction * 10 + (bytes[i] - 48);
      scale *= 10;
      i++;
    }
  }
  if (bytes[i] !== 41) return false; // ")"
  i++;
  const timestamp = seconds + fraction / scale;

  // Interface
  while (i < end && bytes[i] === 32) i++;
  const ifaceStart = i;
  while (i < end && bytes[i] !== 32) i++;
  if (i === ifaceStart) return false;
  const iface = ifaceDecoder.decode(bytes.subarray(ifaceStart, i));
  while (i < end && bytes[i] === 32) i++;

  // ID
  let id = 0;
  const idStart = i;
  while (i < end && bytes[i] !== 35) {
    const value = HEX_VALUES[bytes[i]];
    if (value < 0) return false;
    id = id * 16 + value;
    i++;
  }
  const idDigits = i - idStart;
  if (idDigits === 0 || idDigits > 8 || bytes[i] !== 35) return false;
  i++;
  let flags = 0;
  if (idDigits > 3) {
    flags |= FLAG_EXTENDED;
    if (id & CAN_ERR_FLAG) {
      flags |= FLAG_ERROR;
    }
    id = id & CAN_EFF_MASK;
    if (flags & FLAG_ERROR) id = id & ~CAN_ERR_FLAG;
  }

  // Data
  if (bytes[i] === 35) {
    // A second "#" then <flags><data> = CAN FD
    flags |= FLAG_FD;
    i += 2; // Skip second "#" and the flags nibble
  } else if (bytes[i] === 82) {
    // "R" = remote frame
    flags |= FLAG_REMOTE;
    return { timestamp, iface, id: id >>> 0, flags, dataStart: end, dataEnd: end };
  }
  return { timestamp, iface, id: id >>> 0, flags, dataStart: i, dataEnd: end };
}
