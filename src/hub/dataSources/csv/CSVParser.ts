// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/**
 * Pure CSV helpers used by the CSV importer: tokenising (RFC 4180 quoting), delimiter detection,
 * header/unit parsing, time-column detection and layout detection. No Log dependencies, so
 * they can be unit tested directly.
 */

export type Delimiter = "," | ";" | "\t" | "|";
const DELIMITERS: Delimiter[] = [",", ";", "\t", "|"];

/** Decodes bytes to text, removing a UTF-8 (or UTF-16) BOM. */
export function decodeCSVText(bytes: Uint8Array): string {
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(bytes.subarray(2));
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(bytes.subarray(2));
  }
  let text = new TextDecoder("utf-8").decode(bytes);
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  return text;
}

/**
 * Reads one row starting at `pos`. Handles quoted fields with doubled quotes and embedded
 * delimiters/newlines. Returns the fields and the position after the row's line ending.
 */
export function readRow(text: string, pos: number, delimiter: string): { fields: string[]; next: number } {
  const fields: string[] = [];
  const length = text.length;

  // Fast path: no quote before the end of the line
  let lineEnd = text.indexOf("\n", pos);
  if (lineEnd === -1) lineEnd = length;
  const quote = text.indexOf('"', pos);
  if (quote === -1 || quote > lineEnd) {
    let end = lineEnd;
    if (end > pos && text.charCodeAt(end - 1) === 13) end--;
    const line = text.slice(pos, end);
    return { fields: line.length === 0 ? [] : line.split(delimiter), next: lineEnd + 1 };
  }

  // Slow path: full state machine
  let field = "";
  let i = pos;
  let inQuotes = false;
  let fieldStart = true;
  while (i < length) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += char;
      i++;
      continue;
    }
    if (char === '"' && fieldStart) {
      inQuotes = true;
      fieldStart = false;
      i++;
      continue;
    }
    if (char === delimiter) {
      fields.push(field);
      field = "";
      fieldStart = true;
      i++;
      continue;
    }
    if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      i++;
      fields.push(field);
      return { fields, next: i };
    }
    field += char;
    fieldStart = false;
    i++;
  }
  fields.push(field);
  return { fields, next: length + 1 };
}

/** Reads up to `maxRows` rows from the start of the text. */
export function readRows(text: string, delimiter: string, maxRows: number, start = 0): string[][] {
  const rows: string[][] = [];
  let pos = start;
  while (pos < text.length && rows.length < maxRows) {
    const row = readRow(text, pos, delimiter);
    rows.push(row.fields);
    pos = row.next;
  }
  return rows;
}

/** Counts delimiters outside quotes in a line. */
function countOutsideQuotes(line: string, delimiter: string): number {
  let count = 0;
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === delimiter && !inQuotes) count++;
  }
  return count;
}

/**
 * Picks the delimiter that splits the first lines most consistently. Semicolon CSVs (European
 * locales) often use "," as the decimal separator, so consistency matters more than count.
 */
export function detectDelimiter(text: string): Delimiter {
  const lines = text
    .slice(0, 64 * 1024)
    .split(/\r?\n/)
    .slice(0, 30)
    .filter((line) => line.trim().length > 0);
  if (lines.length > 1) lines.pop(); // May be truncated
  let best: Delimiter = ",";
  let bestScore = -1;
  DELIMITERS.forEach((delimiter) => {
    const counts = lines.map((line) => countOutsideQuotes(line, delimiter));
    if (counts.length === 0) return;
    // Mode of the counts, ignoring preamble lines
    const frequency = new Map<number, number>();
    counts.forEach((count) => frequency.set(count, (frequency.get(count) ?? 0) + 1));
    let modeCount = 0;
    let modeFrequency = 0;
    frequency.forEach((freq, count) => {
      if (count > 0 && (freq > modeFrequency || (freq === modeFrequency && count > modeCount))) {
        modeCount = count;
        modeFrequency = freq;
      }
    });
    if (modeCount === 0) return;
    const score = (modeFrequency / counts.length) * 1000 + Math.min(modeCount, 999);
    if (score > bestScore) {
      bestScore = score;
      best = delimiter;
    }
  });
  return best;
}

/** Parses a number cell. Returns NaN if the cell isn't a plain number. */
export function parseNumberCell(cell: string, decimalComma = false): number {
  let text = cell.trim();
  if (text.length === 0) return NaN;
  if (decimalComma) text = text.replace(",", ".");
  const value = Number(text);
  if (!isNaN(value)) return value;
  const lower = text.toLowerCase();
  if (lower === "nan" || lower === "-nan") return NaN;
  if (lower === "inf" || lower === "+inf" || lower === "infinity") return Infinity;
  if (lower === "-inf" || lower === "-infinity") return -Infinity;
  return NaN;
}

/** Returns true if the cell is a common spelling of "no value", which must not make a numeric column text. */
export function isMissingCell(cell: string): boolean {
  return /^(null|none|n\/?a|-+|\?)$/i.test(cell.trim());
}

/** Returns true if the cell is a number (including nan/inf spellings). */
export function isNumberCell(cell: string, decimalComma = false): boolean {
  const text = cell.trim();
  if (text.length === 0) return false;
  if (!isNaN(parseNumberCell(text, decimalComma))) return true;
  return /^[+-]?(nan|inf|infinity)$/i.test(text);
}

export interface ParsedHeader {
  /** Name without the unit. */
  name: string;
  unit: string | null;
}

/** Splits a header cell into name and unit: `name [unit]`, `name (unit)` or `name in unit`. */
export function parseHeaderCell(cell: string): ParsedHeader {
  const text = cell.trim();
  let match = text.match(/^(.*?)\s*\[([^\]]*)\]$/);
  if (match && match[1].length > 0) return { name: match[1], unit: match[2].trim() || null };
  match = text.match(/^(.*?)\s*\(([^()]*)\)$/);
  if (match && match[1].length > 0 && looksLikeUnit(match[2])) return { name: match[1], unit: match[2].trim() };
  return { name: text, unit: null };
}

/** Rough check for whether a short string is a unit (used for "(...)" headers and unit rows). */
export function looksLikeUnit(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0 || trimmed.length > 16) return false;
  if (isNumberCell(trimmed)) return false;
  return /^[A-Za-zµ°%Ω/^*·.\-\s\d²³]+$/.test(trimmed) && !/\s{2,}/.test(trimmed);
}

/**
 * Converts a column name to a log key. Dotted identifier paths (`Car.Data.Motor.MotorRPM`,
 * `can0.Pedal_Status.PEDAL_Position1`) become tree hierarchy (`Car/Data/Motor/MotorRPM`).
 * Names that already contain "/" are kept as they are.
 */
export function columnNameToKey(name: string): string {
  let key = name.trim();
  if (/^[A-Za-z_][\w \-]*(\.[A-Za-z_][\w \-]*)+$/.test(key)) {
    key = key.replaceAll(".", "/");
  }
  if (key.length === 0) key = "Column";
  return key;
}

export type TimeUnit = "s" | "ms" | "us" | "ns" | "iso" | "clock";

const TIME_NAME_REGEX =
  /^(t|ts|time|timestamp|datetime|date ?time|date\/time|elapsed(?: ?time)?|seconds|secs|epoch|unix(?: ?time)?|t_epoch|t_rel|log ?time|time ?stamp|utc|gps ?time|sample ?time)(?:[ _\-]?(s|sec|secs|seconds|ms|msec|millis|milliseconds|us|usec|micros|microseconds|µs|ns|nsec|nanos|nanoseconds|utc|epoch|rel|abs|unix))?$/i;

/** Maps a unit (or name suffix) to a time unit, or null if it isn't a time unit. */
export function timeUnitFromText(text: string | null): TimeUnit | null {
  if (text === null) return null;
  switch (text.trim().toLowerCase()) {
    case "s":
    case "sec":
    case "secs":
    case "second":
    case "seconds":
      return "s";
    case "ms":
    case "msec":
    case "millis":
    case "millisecond":
    case "milliseconds":
      return "ms";
    case "us":
    case "µs":
    case "usec":
    case "micros":
    case "microsecond":
    case "microseconds":
      return "us";
    case "ns":
    case "nsec":
    case "nanos":
    case "nanosecond":
    case "nanoseconds":
      return "ns";
  }
  return null;
}

/** Returns a score for how much a column name looks like a time column (0 = not at all). */
export function timeColumnNameScore(name: string): number {
  const trimmed = name.trim();
  const match = trimmed.match(TIME_NAME_REGEX);
  if (match) return match[1].toLowerCase() === "t" && match[2] === undefined ? 2 : 3;
  if (/^(time|timestamp)/i.test(trimmed)) return 1;
  return 0;
}

const CLOCK_REGEX = /^(\d{1,3}):(\d{2}):(\d{2}(?:\.\d+)?)$/;

/** Parses a non-numeric time cell (ISO date or HH:MM:SS) to seconds, or NaN. */
export function parseTimeString(cell: string): number {
  const text = cell.trim();
  const clock = text.match(CLOCK_REGEX);
  if (clock) return Number(clock[1]) * 3600 + Number(clock[2]) * 60 + Number(clock[3]);
  if (!/^\d{4}-\d{2}-\d{2}/.test(text) && !/^\d{4}\/\d{2}\/\d{2}/.test(text)) return NaN;
  // Keep sub-millisecond precision, which Date.parse drops
  let fractionExtra = 0;
  const fraction = text.match(/[T ]\d{2}:\d{2}:\d{2}\.(\d+)/);
  let normalized = text.replace(" ", "T").replaceAll("/", "-");
  if (fraction && fraction[1].length > 3) {
    fractionExtra = Number("0." + fraction[1]) - Number("0." + fraction[1].slice(0, 3));
    normalized = normalized.replace("." + fraction[1], "." + fraction[1].slice(0, 3));
  }
  const ms = Date.parse(normalized);
  if (isNaN(ms)) return NaN;
  return ms / 1000 + fractionExtra;
}

/**
 * Picks a unit for a numeric time column from its name hint and values:
 * epoch-sized values are ns (> 1e17), µs (> 1e14) or ms (> 1e11); otherwise seconds.
 */
export function inferNumericTimeUnit(hint: TimeUnit | null, samples: number[]): "s" | "ms" | "us" | "ns" {
  if (hint === "s" || hint === "ms" || hint === "us" || hint === "ns") return hint;
  const finite = samples.filter((value) => isFinite(value));
  if (finite.length === 0) return "s";
  const max = Math.max(...finite.map((value) => Math.abs(value)));
  if (max > 1e17) return "ns";
  if (max > 1e14) return "us";
  if (max > 1e11) return "ms";
  return "s";
}

export function timeScale(unit: "s" | "ms" | "us" | "ns"): number {
  switch (unit) {
    case "s":
      return 1;
    case "ms":
      return 1e-3;
    case "us":
      return 1e-6;
    case "ns":
      return 1e-9;
  }
}

/** Converts a time cell to seconds using the detected unit. */
export function parseTimeCell(cell: string, unit: TimeUnit, decimalComma = false): number {
  if (unit === "iso" || unit === "clock") return parseTimeString(cell);
  const text = cell.trim();
  if (unit === "ns" && /^\d{16,}$/.test(text)) {
    // Avoid float rounding of 19-digit nanosecond epochs: split seconds and fraction
    const seconds = Number(text.slice(0, -9));
    const nanos = Number(text.slice(-9));
    return seconds + nanos * 1e-9;
  }
  return parseNumberCell(text, decimalComma) * timeScale(unit);
}

export interface CSVLayout {
  delimiter: Delimiter;
  decimalComma: boolean;
  /** Text offset of the first data row. */
  dataStart: number;
  /** Rows before the header (MoTeC-style metadata preamble), as key → value. */
  preamble: { [key: string]: string };
  headers: ParsedHeader[];
  /** Index of the time column, or -1 to use row numbers. */
  timeColumn: number;
  timeUnit: TimeUnit;
  /** "wide" = one column per signal; "long" = time, key, value[, unit] rows. */
  kind: "wide" | "long";
  keyColumn: number;
  valueColumn: number;
  unitColumn: number;
}

/**
 * Works out the structure of a CSV file from its first rows: delimiter, preamble, header row,
 * optional units row (MoTeC style), time column and unit, and wide vs long layout.
 */
export function detectLayout(text: string): CSVLayout {
  const delimiter = detectDelimiter(text);
  const sampleRows: { fields: string[]; start: number; next: number }[] = [];
  let pos = 0;
  while (pos < text.length && sampleRows.length < 200) {
    const row = readRow(text, pos, delimiter);
    sampleRows.push({ fields: row.fields, start: pos, next: row.next });
    pos = row.next;
  }

  // Modal column count among non-trivial rows
  const frequency = new Map<number, number>();
  sampleRows.forEach((row) => {
    if (row.fields.length > 1) frequency.set(row.fields.length, (frequency.get(row.fields.length) ?? 0) + 1);
  });
  let columnCount = 1;
  let best = 0;
  frequency.forEach((freq, count) => {
    if (freq > best || (freq === best && count > columnCount)) {
      columnCount = count;
      best = freq;
    }
  });

  // Decimal comma: semicolon files whose cells look like "1,23"
  const decimalComma =
    delimiter === ";" &&
    sampleRows.some((row) => row.fields.some((cell) => /^-?\d+,\d+$/.test(cell.trim()))) &&
    !sampleRows.some((row) => row.fields.some((cell) => /^-?\d+\.\d+$/.test(cell.trim())));

  const isNumericRow = (fields: string[]) =>
    fields.filter((cell) => isNumberCell(cell, decimalComma)).length >= Math.max(1, fields.length * 0.3);
  const isTextRow = (fields: string[]) => {
    const nonEmpty = fields.filter((cell) => cell.trim().length > 0);
    return (
      nonEmpty.length > 0 &&
      nonEmpty.filter((cell) => !isNumberCell(cell, decimalComma)).length >= nonEmpty.length * 0.6
    );
  };

  // Header: first row with (about) the modal column count that is mostly text,
  // followed by data. Rows before it are a preamble.
  let headerIndex = 0;
  for (let i = 0; i < sampleRows.length; i++) {
    const fields = sampleRows[i].fields;
    // (A trailing delimiter can drop one column on wide files, so allow one less there)
    const minColumns = Math.max(2, columnCount >= 5 ? columnCount - 1 : columnCount);
    if (fields.length >= minColumns && isTextRow(fields)) {
      headerIndex = i;
      break;
    }
    if (fields.length >= columnCount && isNumericRow(fields)) {
      // Data before any header: no header row
      headerIndex = -1;
      break;
    }
  }

  const preamble: { [key: string]: string } = {};
  for (let i = 0; i < Math.max(headerIndex, 0); i++) {
    const fields = sampleRows[i].fields.map((cell) => cell.trim());
    if (fields.length >= 2 && fields[0].length > 0)
      preamble[fields[0]] = fields
        .slice(1)
        .filter((x) => x)
        .join(" ");
  }

  let headers: ParsedHeader[];
  let dataRowIndex: number;
  if (headerIndex === -1) {
    headers = Array.from({ length: columnCount }, (_, i) => ({ name: i === 0 ? "Time" : "Column " + i, unit: null }));
    dataRowIndex = sampleRows.findIndex((row) => row.fields.length >= columnCount - 1);
  } else {
    headers = sampleRows[headerIndex].fields.map((cell) => parseHeaderCell(cell));
    dataRowIndex = headerIndex + 1;

    // Units row directly below the header (MoTeC i2 exports)
    const next = sampleRows[dataRowIndex];
    if (next !== undefined && next.fields.length >= headers.length - 1) {
      const nonEmpty = next.fields.filter((cell) => cell.trim().length > 0);
      if (nonEmpty.length > 0 && nonEmpty.every((cell) => looksLikeUnit(cell))) {
        next.fields.forEach((cell, index) => {
          if (index < headers.length && cell.trim().length > 0 && headers[index].unit === null) {
            headers[index].unit = cell.trim();
          }
        });
        dataRowIndex++;
      }
    }

    // Skip blank/text rows between the header and the data
    while (dataRowIndex < sampleRows.length && !isNumericRow(sampleRows[dataRowIndex].fields)) {
      const fields = sampleRows[dataRowIndex].fields;
      if (fields.some((cell) => cell.trim().length > 0) && fields.length >= headers.length - 1) {
        // Could be ISO times or long layout (key column is text); stop if it has any number
        if (fields.some((cell) => isNumberCell(cell, decimalComma) || !isNaN(parseTimeString(cell)))) break;
      }
      dataRowIndex++;
    }
  }
  if (dataRowIndex < 0) dataRowIndex = 0;
  const dataStart = dataRowIndex < sampleRows.length ? sampleRows[dataRowIndex].start : text.length;

  // Make header names unique and non-empty
  const seen = new Map<string, number>();
  headers.forEach((header, index) => {
    if (header.name.length === 0) header.name = index === 0 ? "Time" : "Column " + index;
    const count = seen.get(header.name) ?? 0;
    seen.set(header.name, count + 1);
    if (count > 0) header.name = `${header.name} (${count + 1})`;
  });

  // Time column
  const dataSample = sampleRows.slice(dataRowIndex).map((row) => row.fields);
  let timeColumn = -1;
  let bestScore = 0;
  headers.forEach((header, index) => {
    const score = timeColumnNameScore(header.name);
    if (score > bestScore) {
      bestScore = score;
      timeColumn = index;
    }
  });
  if (timeColumn === -1 && dataSample.length > 0) {
    // Fall back to the first column if it is monotonic numbers or date strings
    const cells = dataSample.map((row) => row[0] ?? "").filter((cell) => cell.trim().length > 0);
    const numbers = cells.map((cell) => parseNumberCell(cell, decimalComma));
    if (cells.length > 0 && numbers.every((value, i) => isFinite(value) && (i === 0 || value >= numbers[i - 1]))) {
      timeColumn = 0;
    } else if (cells.length > 0 && cells.every((cell) => !isNaN(parseTimeString(cell)))) {
      timeColumn = 0;
    }
  }
  let timeUnit: TimeUnit = "s";
  if (timeColumn !== -1) {
    const header = headers[timeColumn];
    const cells = dataSample.map((row) => row[timeColumn] ?? "").filter((cell) => cell.trim().length > 0);
    if (cells.length > 0 && cells.every((cell) => !isNumberCell(cell, decimalComma))) {
      timeUnit = cells.every((cell) => CLOCK_REGEX.test(cell.trim())) ? "clock" : "iso";
    } else {
      const suffix = header.name.match(TIME_NAME_REGEX)?.[2] ?? null;
      const hint = timeUnitFromText(header.unit) ?? timeUnitFromText(suffix);
      timeUnit = inferNumericTimeUnit(
        hint,
        cells.map((cell) => parseNumberCell(cell, decimalComma))
      );
    }
  }

  // Long layout: time, key, value[, unit]
  let kind: "wide" | "long" = "wide";
  let keyColumn = -1;
  let valueColumn = -1;
  let unitColumn = -1;
  const lowerNames = headers.map((header) => header.name.toLowerCase());
  const keyIndex = lowerNames.findIndex((name) =>
    ["key", "signal", "name", "field", "topic", "channel", "signal_name", "parameter"].includes(name)
  );
  const valueIndex = lowerNames.findIndex((name) => ["value", "val", "data", "reading"].includes(name));
  if (timeColumn !== -1 && keyIndex !== -1 && valueIndex !== -1 && headers.length <= 6) {
    kind = "long";
    keyColumn = keyIndex;
    valueColumn = valueIndex;
    unitColumn = lowerNames.findIndex((name) => ["unit", "units"].includes(name));
  }

  return {
    delimiter,
    decimalComma,
    dataStart,
    preamble,
    headers,
    timeColumn,
    timeUnit,
    kind,
    keyColumn,
    valueColumn,
    unitColumn
  };
}
