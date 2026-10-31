// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Log from "../../../shared/log/Log";
import LoggableType from "../../../shared/log/LoggableType";
import { BUNDLED_DBCS } from "../can/BundledDBCs";
import { parseDBC } from "../can/DBC";
import { runLazyWorker, sendProgress, setMetadata } from "../ImporterUtil";
import { csvChannelMetadata } from "./CSVChannelMetadata";
import { parseLegacyEntry } from "./CSVDecoder";
import {
  CSVLayout,
  columnNameToKey,
  decodeCSVText,
  detectLayout,
  isNumberCell,
  parseNumberCell,
  parseTimeCell,
  readRow
} from "./CSVParser";

/**
 * CSV importer (wide and long layouts). The file is indexed once (row offsets and the time
 * column); columns are only parsed when the hub asks for them. Requests that arrive together
 * share one pass over the file.
 */

const databases = Object.entries(BUNDLED_DBCS).map(([name, text]) => parseDBC(text, name));
let enumSidecar: Record<string, Record<string, string>> = {};
let log = new Log(false);
let text = "";
let layout: CSVLayout;
let rowStarts: number[] = [];
let rowTimes: Float64Array = new Float64Array(0);
let fastPath = true; // No quotes in the data, so rows are lines
const wideColumns = new Map<string, { column: number; type: LoggableType }>(); // Key → column
const longRows = new Map<string, number[]>(); // Key → row indices (long layout)
const longTypes = new Map<string, LoggableType>();
const decodedKeys = new Set<string>();

runLazyWorker(start, decode, () => log);

function start(files: (Uint8Array | null)[]): Log {
  if (files[1]) enumSidecar = JSON.parse(decodeCSVText(files[1]));
  text = decodeCSVText(files[0]!);
  layout = detectLayout(text);
  fastPath = text.indexOf('"', layout.dataStart) === -1;

  // Index rows and parse the time column
  const times: number[] = [];
  let pos = layout.dataStart;
  let lastProgress = 0;
  let rowIndex = 0;
  while (pos < text.length) {
    let next: number;
    let timeCell: string;
    if (fastPath) {
      next = text.indexOf("\n", pos);
      if (next === -1) next = text.length;
      next++;
      if (next - pos <= 2 && text.slice(pos, next).trim().length === 0) {
        pos = next;
        continue;
      }
      timeCell = layout.timeColumn === -1 ? "" : getCellFast(pos, next - 1, layout.timeColumn);
    } else {
      const row = readRow(text, pos, layout.delimiter);
      next = row.next;
      if (row.fields.length === 0 || (row.fields.length === 1 && row.fields[0].trim().length === 0)) {
        pos = next;
        continue;
      }
      timeCell = layout.timeColumn === -1 ? "" : row.fields[layout.timeColumn] ?? "";
    }
    const time = layout.timeColumn === -1 ? rowIndex : parseTimeCell(timeCell, layout.timeUnit, layout.decimalComma);
    if (isFinite(time)) {
      rowStarts.push(pos);
      times.push(time);
      rowIndex++;
    }
    pos = next;

    if (pos / text.length - lastProgress > 0.02) {
      lastProgress = pos / text.length;
      sendProgress(lastProgress * 0.9);
    }
  }
  rowTimes = Float64Array.from(times);
  if (rowTimes.length === 0) throw new Error("No data rows found in CSV");
  let minTime = Infinity;
  let maxTime = -Infinity;
  for (let i = 0; i < rowTimes.length; i++) {
    if (rowTimes[i] < minTime) minTime = rowTimes[i];
    if (rowTimes[i] > maxTime) maxTime = rowTimes[i];
  }
  log.updateRangeWithTimestamp(minTime);
  log.updateRangeWithTimestamp(maxTime);

  if (layout.kind === "wide") {
    indexWide();
  } else {
    indexLong();
  }

  // File-level metadata (MoTeC preamble etc.)
  const fileInfo: { [key: string]: string } = { ...layout.preamble };
  fileInfo.layout = layout.kind;
  fileInfo.delimiter = layout.delimiter === "\t" ? "tab" : layout.delimiter;
  fileInfo.timeColumn = layout.timeColumn === -1 ? "(row number)" : layout.headers[layout.timeColumn].name;
  fileInfo.timeUnit = layout.timeUnit;
  fileInfo.rows = rowTimes.length.toString();
  log.putJSON("Metadata", minTime, JSON.stringify(fileInfo));
  return log;
}

/** Gets one cell from a line with no quotes, by walking delimiters. */
function getCellFast(start: number, end: number, column: number): string {
  let cellStart = start;
  for (let i = 0; i < column; i++) {
    const index = text.indexOf(layout.delimiter, cellStart);
    if (index === -1 || index >= end) return "";
    cellStart = index + 1;
  }
  let cellEnd = text.indexOf(layout.delimiter, cellStart);
  if (cellEnd === -1 || cellEnd > end) cellEnd = end;
  if (cellEnd > cellStart && text.charCodeAt(cellEnd - 1) === 13) cellEnd--;
  return text.slice(cellStart, cellEnd);
}

/** Gets the given cells of a row. */
function getCells(row: number, columns: number[]): string[] {
  const start = rowStarts[row];
  if (fastPath) {
    let end = text.indexOf("\n", start);
    if (end === -1) end = text.length;
    const line = text.slice(start, end);
    const maxColumn = Math.max(...columns);
    const fields = line.split(layout.delimiter, maxColumn + 1);
    return columns.map((column) => {
      const cell = fields[column] ?? "";
      return cell.endsWith("\r") ? cell.slice(0, -1) : cell;
    });
  } else {
    const fields = readRow(text, start, layout.delimiter).fields;
    return columns.map((column) => fields[column] ?? "");
  }
}

/** Picks a field type from sample cells. */
function inferType(cells: string[]): LoggableType {
  const nonEmpty = cells.map((cell) => cell.trim()).filter((cell) => cell.length > 0);
  if (nonEmpty.length === 0) return LoggableType.Number;
  if (nonEmpty.every((cell) => isNumberCell(cell, layout.decimalComma))) return LoggableType.Number;
  if (nonEmpty.every((cell) => /^(true|false)$/i.test(cell))) return LoggableType.Boolean;
  // Use the legacy parser (AdvantageScope exports) on a scratch log to see what it produces
  const scratch = new Log(false);
  nonEmpty.slice(0, 20).forEach((cell, index) => parseLegacyEntry(scratch, index, "x", cell));
  return scratch.getType("x") ?? LoggableType.String;
}

function sampleRowIndices(count: number): number[] {
  const indices: number[] = [];
  const step = Math.max(1, Math.floor(rowStarts.length / count));
  for (let i = 0; i < rowStarts.length; i += step) indices.push(i);
  return indices;
}

function indexWide() {
  const columns = layout.headers.map((_, index) => index).filter((index) => index !== layout.timeColumn);
  // Sample cells across the file for type inference
  const sampleRows = sampleRowIndices(400).map((row) => getCells(row, columns));
  const usedKeys = new Set<string>();
  columns.forEach((column, columnIndex) => {
    const header = layout.headers[column];
    let key = columnNameToKey(header.name);
    while (usedKeys.has(key)) key += "_";
    usedKeys.add(key);
    const type = inferType(sampleRows.map((row) => row[columnIndex]));
    wideColumns.set(key, { column, type });
    log.createBlankField(key, type);
    setMetadata(log, key, csvChannelMetadata(header.name, header.unit, databases, enumSidecar));
  });
}

function indexLong() {
  for (let row = 0; row < rowStarts.length; row++) {
    const [key] = getCells(row, [layout.keyColumn]);
    const trimmed = key.trim();
    if (trimmed.length === 0) continue;
    let rows = longRows.get(trimmed);
    if (rows === undefined) {
      rows = [];
      longRows.set(trimmed, rows);
    }
    rows.push(row);
  }
  longRows.forEach((rows, rawKey) => {
    const key = columnNameToKey(rawKey);
    const step = Math.max(1, Math.floor(rows.length / 100));
    const samples: string[] = [];
    for (let i = 0; i < rows.length; i += step) samples.push(getCells(rows[i], [layout.valueColumn])[0]);
    const type = inferType(samples);
    longTypes.set(key, type);
    if (key !== rawKey) {
      longRows.set(key, rows);
      longRows.delete(rawKey);
    }
    log.createBlankField(key, type);
    const unit = layout.unitColumn === -1 ? "" : getCells(rows[0], [layout.unitColumn])[0].trim();
    setMetadata(log, key, csvChannelMetadata(rawKey, unit, databases, enumSidecar));
  });
}

function putCell(key: string, type: LoggableType, timestamp: number, cell: string) {
  const trimmed = cell.trim();
  if (trimmed.length === 0) return;
  switch (type) {
    case LoggableType.Number:
      const value = parseNumberCell(trimmed, layout.decimalComma);
      if (!isNaN(value) || /^[+-]?nan$/i.test(trimmed)) log.putNumber(key, timestamp, value);
      break;
    case LoggableType.Boolean:
      log.putBoolean(key, timestamp, trimmed.toLowerCase() === "true");
      break;
    case LoggableType.String:
      log.putString(key, timestamp, cell);
      break;
    default:
      try {
        parseLegacyEntry(log, timestamp, key, trimmed);
      } catch {}
      break;
  }
}

function decode(keys: string[]): string[] {
  const sendKeys: string[] = [];
  const wanted = keys.filter((key) => !decodedKeys.has(key));
  if (layout.kind === "wide") {
    const targets = wanted
      .map((key) => ({ key, info: wideColumns.get(key) }))
      .filter((target) => target.info !== undefined) as {
      key: string;
      info: { column: number; type: LoggableType };
    }[];
    if (targets.length > 0) {
      const columns = targets.map((target) => target.info.column);
      for (let row = 0; row < rowStarts.length; row++) {
        const cells = getCells(row, columns);
        const timestamp = rowTimes[row];
        for (let i = 0; i < targets.length; i++) {
          putCell(targets[i].key, targets[i].info.type, timestamp, cells[i]);
        }
      }
    }
    targets.forEach((target) => decodedKeys.add(target.key));
  } else {
    wanted.forEach((key) => {
      const rows = longRows.get(key);
      const type = longTypes.get(key);
      if (rows === undefined || type === undefined) return;
      rows.forEach((row) => {
        putCell(key, type, rowTimes[row], getCells(row, [layout.valueColumn])[0]);
      });
      decodedKeys.add(key);
    });
  }
  log.getChangedFields().forEach((key) => sendKeys.push(key));
  return sendKeys;
}
