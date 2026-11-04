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
import { CSVFile, CSVIndex } from "./CSVFile";
import {
  CSVLayout,
  columnNameToKey,
  decodeCSVText,
  detectDelimiter,
  detectLayout,
  isMissingCell,
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
let file: CSVFile;
let layout: CSVLayout;
let rowStarts = new CSVIndex();
let rowTimes = new CSVIndex();
const wideColumns = new Map<string, { column: number; type: LoggableType }>(); // Key → column
const longRows = new Map<string, CSVIndex>(); // Key → row indices (long layout)
const longTypes = new Map<string, LoggableType>();
const decodedKeys = new Set<string>();

let csvSize: number | undefined;
runLazyWorker(
  start,
  decode,
  () => log,
  (request) => {
    csvSize = request.csvSize;
  }
);

async function start(files: (Uint8Array | null)[]): Promise<Log> {
  if (files[1]) enumSidecar = JSON.parse(decodeCSVText(files[1]));
  const bytes = files[0]!;
  file = new CSVFile(
    csvSize ?? bytes.length,
    csvSize === undefined ? async (offset, length) => bytes.subarray(offset, offset + length) : readDisk
  );
  await file.init();
  // Layout detection has always sampled the first 200 logical rows.
  const sample: string[] = [];
  const starts: number[] = [];
  let pos = file.bom;
  let sampleLength = 0;
  // Determine the delimiter from the same initial text window as the old parser.
  const delimiter = detectDelimiter(await file.prefix());
  while (pos < file.size && sample.length < 200) {
    const row = await file.row(pos, delimiter);
    starts.push(pos);
    sample.push(row.text);
    sampleLength += row.next - pos;
    if (sampleLength > 32 * 1024 * 1024) throw new Error("CSV layout sample exceeds the supported limit of 32 MiB");
    pos = row.next;
  }
  if (sample.length === 0) throw new Error("No data rows found in CSV");
  const text = sample.join("");
  layout = detectLayout(text);
  let chars = 0;
  let firstData = sample.length;
  for (let i = 0; i < sample.length; i++) {
    if (chars === layout.dataStart) {
      firstData = i;
      break;
    }
    chars += sample[i].length;
  }
  pos = starts[firstData] ?? pos;
  let lastProgress = 0;
  while (pos < file.size) {
    const start = pos;
    const result = file.row(pos, layout.delimiter);
    const row = result instanceof Promise ? await result : result;
    pos = row.next;
    const fields = readRow(row.text, 0, layout.delimiter).fields;
    if (fields.length === 0 || (fields.length === 1 && fields[0].trim().length === 0)) continue;
    const time =
      layout.timeColumn === -1
        ? rowStarts.length
        : parseTimeCell(fields[layout.timeColumn] ?? "", layout.timeUnit, layout.decimalComma);
    if (isFinite(time)) {
      if (layout.kind === "long") {
        const key = (fields[layout.keyColumn] ?? "").trim();
        if (key.length > 0) {
          let rows = longRows.get(key);
          if (!rows) {
            rows = new CSVIndex(1024);
            longRows.set(key, rows);
          }
          rows.push(rowStarts.length);
        }
      }
      rowStarts.push(start);
      rowTimes.push(time);
    }
    if (pos / file.size - lastProgress > 0.02) {
      lastProgress = pos / file.size;
      sendProgress(lastProgress * 0.9);
    }
  }
  if (rowTimes.length === 0) throw new Error("No data rows found in CSV");
  let minTime = Infinity;
  let maxTime = -Infinity;
  for (let i = 0; i < rowTimes.length; i++) {
    if (rowTimes.get(i) < minTime) minTime = rowTimes.get(i);
    if (rowTimes.get(i) > maxTime) maxTime = rowTimes.get(i);
  }
  log.updateRangeWithTimestamp(minTime);
  log.updateRangeWithTimestamp(maxTime);

  if (layout.kind === "wide") {
    await indexWide();
  } else {
    await indexLong();
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

/** Gets the given cells using a single bounded disk cache for sequential requests. */
async function getCells(row: number, columns: number[]): Promise<string[]> {
  const text = (await file.row(rowStarts.get(row), layout.delimiter)).text;
  const fields = readRow(text, 0, layout.delimiter).fields;
  return columns.map((column) => fields[column] ?? "");
}

/** Picks a field type from sample cells. */
function inferType(cells: string[]): LoggableType {
  const nonEmpty = cells.map((cell) => cell.trim()).filter((cell) => cell.length > 0);
  if (nonEmpty.length === 0) return LoggableType.Number;
  const present = nonEmpty.filter((cell) => !isMissingCell(cell));
  if (present.length > 0 && present.every((cell) => isNumberCell(cell, layout.decimalComma))) {
    return LoggableType.Number;
  }
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

async function indexWide() {
  const columns = layout.headers.map((_, index) => index).filter((index) => index !== layout.timeColumn);
  // Sample cells across the file for type inference
  const sampleRows: string[][] = [];
  for (const row of sampleRowIndices(400)) sampleRows.push(await getCells(row, columns));
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

async function indexLong() {
  const selected = new Map<number, string>();
  const samples = new Map<string, string[]>();
  const units = new Map<string, string>();
  longRows.forEach((rows, key) => {
    samples.set(key, []);
    const step = Math.max(1, Math.floor(rows.length / 100));
    for (let i = 0; i < rows.length; i += step) selected.set(rows.get(i), key);
  });
  // Read samples in file order, sharing the cache across all channels.
  for (const row of Array.from(selected.keys()).sort((a, b) => a - b)) {
    const key = selected.get(row)!;
    const cells = await getCells(row, [layout.valueColumn, layout.unitColumn]);
    samples.get(key)!.push(cells[0]);
    if (!units.has(key)) units.set(key, cells[1].trim());
  }
  for (const [rawKey, rows] of Array.from(longRows)) {
    const key = columnNameToKey(rawKey);
    const type = inferType(samples.get(rawKey)!);
    longTypes.set(key, type);
    if (key !== rawKey) {
      longRows.set(key, rows);
      longRows.delete(rawKey);
    }
    log.createBlankField(key, type);
    setMetadata(log, key, csvChannelMetadata(key, units.get(rawKey) ?? "", databases, enumSidecar));
  }
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

async function decode(keys: string[]): Promise<string[]> {
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
        const cells = await getCells(row, columns);
        const timestamp = rowTimes.get(row);
        for (let i = 0; i < targets.length; i++) {
          putCell(targets[i].key, targets[i].info.type, timestamp, cells[i]);
        }
      }
    }
    targets.forEach((target) => decodedKeys.add(target.key));
  } else {
    for (const key of wanted) {
      const rows = longRows.get(key);
      const type = longTypes.get(key);
      if (rows === undefined || type === undefined) continue;
      for (let i = 0; i < rows.length; i++) {
        const row = rows.get(i);
        putCell(key, type, rowTimes.get(row), (await getCells(row, [layout.valueColumn]))[0]);
      }
      decodedKeys.add(key);
    }
  }
  log.getChangedFields().forEach((key) => sendKeys.push(key));
  return sendKeys;
}

let readId = 0;
function readDisk(offset: number, length: number): Promise<Uint8Array> {
  const id = readId++;
  return new Promise((resolve, reject) => {
    const listener = (event: MessageEvent) => {
      if (event.data.type !== "csvRead" || event.data.id !== id) return;
      self.removeEventListener("message", listener);
      if (event.data.error) reject(new Error(event.data.error));
      else resolve(event.data.data);
    };
    self.addEventListener("message", listener);
    self.postMessage({ type: "csvRead", id, offset, length });
  });
}
