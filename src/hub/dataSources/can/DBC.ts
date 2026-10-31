// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/**
 * A small DBC parser and signal decoder.
 *
 * Supported: BO_, SG_ (Intel and Motorola byte order, signed/unsigned, factor/offset,
 * simple multiplexing with M/mN), VAL_ value tables, CM_ comments, SIG_VALTYPE_ (IEEE float/double)
 * and extended (29-bit) message IDs (bit 31 set in the DBC ID).
 *
 * Not supported: extended multiplexing (SG_MUL_VAL_), environment variables, signal groups.
 */

export interface DBCSignal {
  name: string;
  startBit: number;
  length: number;
  littleEndian: boolean; // "@1" = Intel, "@0" = Motorola
  signed: boolean;
  factor: number;
  offset: number;
  min: number;
  max: number;
  unit: string;
  /** True if this signal is the multiplexor ("M"). */
  isMultiplexor: boolean;
  /** Multiplexer value for which this signal is present ("mN"), or null if always present. */
  multiplexValue: number | null;
  /** 0 = integer, 1 = IEEE float32, 2 = IEEE float64 (from SIG_VALTYPE_). */
  valueType: 0 | 1 | 2;
  /** Value table (raw value to label). */
  valueTable: Map<number, string> | null;
  comment: string;
  /** Raw values that mean "no data" and should be shown as gaps. */
  sentinels: Set<number>;
}

export interface DBCMessage {
  /** CAN ID without the extended flag. */
  id: number;
  extended: boolean;
  name: string;
  dlc: number;
  transmitter: string;
  signals: DBCSignal[];
  comment: string;
  /** The DBC file the message came from. */
  source: string;
}

export interface DBCDatabase {
  messages: DBCMessage[];
}

const EXTENDED_FLAG = 0x80000000;

/** Parses a DBC file. Unknown statements are ignored. */
export function parseDBC(text: string, source = ""): DBCDatabase {
  const messages: DBCMessage[] = [];
  const byRawId = new Map<number, DBCMessage>();
  let current: DBCMessage | null = null;

  // Join multi-line statements (comments and value tables can span lines)
  const statements = splitStatements(text.replace(/^﻿/, ""));
  for (const statement of statements) {
    const trimmed = statement.trim();
    if (trimmed.length === 0) continue;

    if (trimmed.startsWith("BO_ ")) {
      const match = trimmed.match(/^BO_\s+(\d+)\s+(\w+)\s*:\s*(\d+)\s+(\w+)/);
      if (!match) {
        current = null;
        continue;
      }
      const rawId = Number(match[1]);
      const extended = rawId >= EXTENDED_FLAG;
      current = {
        id: extended ? rawId - EXTENDED_FLAG : rawId,
        extended: extended,
        name: match[2],
        dlc: Number(match[3]),
        transmitter: match[4],
        signals: [],
        comment: "",
        source: source
      };
      messages.push(current);
      byRawId.set(rawId, current);
    } else if (trimmed.startsWith("SG_ ")) {
      if (current === null) continue;
      const match = trimmed.match(
        /^SG_\s+(\w+)\s*(M|m\d+M?)?\s*:\s*(\d+)\|(\d+)@([01])([+-])\s*\(\s*([^,]+)\s*,\s*([^)]+)\)\s*\[\s*([^|]*)\|([^\]]*)\]\s*"((?:[^"\\]|\\.)*)"/
      );
      if (!match) continue;
      const mux = match[2] ?? "";
      current.signals.push({
        name: match[1],
        startBit: Number(match[3]),
        length: Number(match[4]),
        littleEndian: match[5] === "1",
        signed: match[6] === "-",
        factor: Number(match[7]),
        offset: Number(match[8]),
        min: Number(match[9]),
        max: Number(match[10]),
        unit: match[11],
        isMultiplexor: mux === "M" || mux.endsWith("M"),
        multiplexValue: mux.startsWith("m") ? parseInt(mux.slice(1)) : null,
        valueType: 0,
        valueTable: null,
        comment: "",
        sentinels: new Set()
      });
    } else if (trimmed.startsWith("VAL_ ")) {
      const match = trimmed.match(/^VAL_\s+(\d+)\s+(\w+)\s+([\s\S]*?);?$/);
      if (!match) continue;
      const signal = findSignal(byRawId, Number(match[1]), match[2]);
      if (!signal) continue;
      const table = new Map<number, string>();
      const pairRegex = /(-?\d+(?:\.\d+)?)\s+"((?:[^"\\]|\\.)*)"/g;
      let pair: RegExpExecArray | null;
      while ((pair = pairRegex.exec(match[3])) !== null) {
        table.set(Number(pair[1]), pair[2]);
      }
      if (table.size > 0) signal.valueTable = table;
    } else if (trimmed.startsWith("CM_ ")) {
      let match = trimmed.match(/^CM_\s+SG_\s+(\d+)\s+(\w+)\s+"((?:[^"\\]|\\.)*)"/);
      if (match) {
        const signal = findSignal(byRawId, Number(match[1]), match[2]);
        if (signal) signal.comment = match[3];
        continue;
      }
      match = trimmed.match(/^CM_\s+BO_\s+(\d+)\s+"((?:[^"\\]|\\.)*)"/);
      if (match) {
        const message = byRawId.get(Number(match[1]));
        if (message) message.comment = match[2];
      }
    } else if (trimmed.startsWith("SIG_VALTYPE_ ")) {
      const match = trimmed.match(/^SIG_VALTYPE_\s+(\d+)\s+(\w+)\s*:?\s*([012])/);
      if (!match) continue;
      const signal = findSignal(byRawId, Number(match[1]), match[2]);
      if (signal) signal.valueType = Number(match[3]) as 0 | 1 | 2;
    }
  }

  messages.forEach((message) => message.signals.forEach((signal) => computeSentinels(signal)));
  return { messages: messages };
}

/** Splits DBC text into statements, keeping quoted strings (which may contain newlines) intact. */
function splitStatements(text: string): string[] {
  const statements: string[] = [];
  let start = 0;
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' && text[i - 1] !== "\\") {
      inQuote = !inQuote;
    } else if (char === "\n" && !inQuote) {
      statements.push(text.slice(start, i));
      start = i + 1;
    }
  }
  statements.push(text.slice(start));
  return statements;
}

function findSignal(byRawId: Map<number, DBCMessage>, rawId: number, name: string): DBCSignal | undefined {
  return byRawId.get(rawId)?.signals.find((signal) => signal.name === name);
}

/**
 * Works out which raw values are "no data" markers:
 * - values written as "0xFFFF (6553.5) = invalid" (or "no reading"/"no data") in the signal comment;
 * - the all-ones value (unsigned) or the maximum positive value (signed) when its physical value
 *   is outside the declared [min|max] range, which is how the MUR DBCs mark invalid readings.
 */
function computeSentinels(signal: DBCSignal) {
  const commentRegex =
    /0x([0-9A-Fa-f]+)(?:\s*\([^)]*\))?\s*(?:=|means|is)?\s*(?:invalid|no reading|no data|not available|unavailable|uncalibrated)/gi;
  let match: RegExpExecArray | null;
  while ((match = commentRegex.exec(signal.comment)) !== null) {
    signal.sentinels.add(parseInt(match[1], 16));
  }
  if (signal.valueType !== 0 || signal.length < 8 || signal.length > 32 || signal.valueTable !== null) return;
  if (!(signal.max > signal.min)) return;
  const candidate = signal.signed ? 2 ** (signal.length - 1) - 1 : 2 ** signal.length - 1;
  const physical = candidate * signal.factor + signal.offset;
  const tolerance = Math.abs(signal.factor) * 0.5;
  if (physical > signal.max + tolerance || physical < signal.min - tolerance) {
    signal.sentinels.add(candidate);
  }
}

/**
 * Extracts the raw (unscaled) value of a signal from frame data.
 * Returns null if the signal does not fit in the data.
 */
export function extractRaw(signal: DBCSignal, data: Uint8Array, offset = 0, length = data.length): number | null {
  const bitCount = signal.length;
  if (bitCount <= 0) return null;
  let value = 0;
  if (signal.littleEndian) {
    // Intel: start bit is the LSB, bits increase through the frame
    const lastBit = signal.startBit + bitCount - 1;
    if (lastBit >> 3 >= length) return null;
    if ((signal.startBit & 7) === 0 && (bitCount & 7) === 0 && bitCount <= 48) {
      // Byte-aligned fast path
      let multiplier = 1;
      for (let i = 0; i < bitCount >> 3; i++) {
        value += data[offset + (signal.startBit >> 3) + i] * multiplier;
        multiplier *= 256;
      }
    } else {
      let multiplier = 1;
      for (let i = 0; i < bitCount; i++) {
        const bit = signal.startBit + i;
        if ((data[offset + (bit >> 3)] >> (bit & 7)) & 1) value += multiplier;
        multiplier *= 2;
      }
    }
  } else {
    // Motorola: start bit is the MSB in "sawtooth" numbering
    let bit = signal.startBit;
    for (let i = 0; i < bitCount; i++) {
      if (bit >> 3 >= length || bit < 0) return null;
      value = value * 2 + ((data[offset + (bit >> 3)] >> (bit & 7)) & 1);
      if ((bit & 7) === 0) {
        bit += 15;
      } else {
        bit -= 1;
      }
    }
  }
  return value;
}

const floatView = new DataView(new ArrayBuffer(8));

/**
 * Decodes the physical value of a signal (raw × factor + offset).
 * Returns NaN for sentinel ("no data") values and null if the signal is absent.
 */
export function decodeSignal(signal: DBCSignal, data: Uint8Array, offset = 0, length = data.length): number | null {
  let raw = extractRaw(signal, data, offset, length);
  if (raw === null) return null;
  if (signal.sentinels.has(raw)) return NaN;
  if (signal.valueType === 1 && signal.length === 32) {
    floatView.setUint32(0, raw);
    raw = floatView.getFloat32(0);
  } else if (signal.valueType === 2 && signal.length === 64) {
    // 64-bit doubles don't fit in a JS number losslessly; read the bytes directly (Intel only)
    if (!signal.littleEndian || signal.startBit % 8 !== 0) return null;
    const start = offset + signal.startBit / 8;
    if (start + 8 > offset + length) return null;
    for (let i = 0; i < 8; i++) floatView.setUint8(7 - i, data[start + i]);
    raw = floatView.getFloat64(0);
  } else if (signal.signed && raw >= 2 ** (signal.length - 1)) {
    raw -= 2 ** signal.length;
  }
  return raw * signal.factor + signal.offset;
}

/** Returns the label for a raw value, or null if there is no value table. */
export function getValueLabel(signal: DBCSignal, rawValue: number): string | null {
  if (signal.valueTable === null) return null;
  return signal.valueTable.get(rawValue) ?? rawValue.toString();
}

/** A merged set of DBCs, decoding by CAN ID. */
export class DBCSet {
  private standard = new Map<number, DBCMessage>();
  private extended = new Map<number, DBCMessage>();
  readonly duplicates: string[] = [];

  /** Adds a database; messages whose IDs are already defined are skipped (first definition wins). */
  add(database: DBCDatabase) {
    database.messages.forEach((message) => {
      const map = message.extended ? this.extended : this.standard;
      const existing = map.get(message.id);
      if (existing !== undefined) {
        if (existing.name !== message.name) {
          this.duplicates.push(
            `0x${message.id.toString(16)} ${message.name} (${message.source}) shadowed by ${existing.name} (${
              existing.source
            })`
          );
        }
        return;
      }
      map.set(message.id, message);
    });
  }

  get(id: number, extended: boolean): DBCMessage | undefined {
    return extended ? this.extended.get(id) : this.standard.get(id);
  }

  getAll(): DBCMessage[] {
    return [...this.standard.values(), ...this.extended.values()];
  }
}

/**
 * Orders DBC files so the canonical MUR DBCs win ID collisions: control, telemetry, then vendor
 * files, with the dashboard DBC last (its IDs intentionally mirror the telemetry bus).
 */
export function sortDBCFiles(names: string[]): string[] {
  const rank = (name: string): number => {
    const lower = name.toLowerCase();
    if (lower.includes("dashboard")) return 4;
    if (lower.includes("control")) return 0;
    if (lower.includes("telemetry")) return 1;
    if (lower.includes("vendor/") || lower.includes("vendor\\")) return 2;
    return 3;
  };
  return [...names].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}
