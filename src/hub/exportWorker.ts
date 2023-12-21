import { IWritable, McapWriter } from "@mcap/core";
import { IReadable } from "@mcap/core/dist/esm/src/types";
import ExportOptions from "../shared/ExportOptions";
import Log from "../shared/log/Log";
import LogFieldTree from "../shared/log/LogFieldTree";
import { filterFieldByPrefixes, getLogValueText } from "../shared/log/LogUtil";
import LoggableType from "../shared/log/LoggableType";
import { cleanFloat } from "../shared/util";
import { WPILOGEncoder, WPILOGEncoderRecord } from "./dataSources/wpilog/WPILOGEncoder";

self.onmessage = async (event) => {
  // WORKER SETUP
  let { id, payload } = event.data;
  function resolve(result: any) {
    self.postMessage({ id: id, payload: result });
  }
  function progress(percent: number) {
    self.postMessage({ id: id, progress: percent });
  }
  function reject() {
    self.postMessage({ id: id });
  }

  // MAIN LOGIC

  try {
    let options: ExportOptions = payload.options;
    let log = Log.fromSerialized(payload.log);

    // Get list of fields
    let fields: string[] = [];
    let processTree = (data: { [id: string]: LogFieldTree }) => {
      Object.keys(data)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .forEach((key) => {
          if (data[key].fullKey !== null) {
            fields.push(data[key].fullKey as string);
          }
          if (Object.keys(data[key].children).length > 0) {
            processTree(data[key].children);
          }
        });
    };
    processTree(log.getFieldTree(options.format === "csv-table" || options.format === "csv-list")); // Include generated field if not wpilog

    // Filter by type and prefix
    fields = fields.filter((field) => log.getType(field) !== LoggableType.Empty);
    fields = filterFieldByPrefixes(fields, options.prefixes, options.format === "wpilog");

    // Convert to requested format
    switch (options.format) {
      case "csv-table":
        resolve(
          generateCsvTable(
            log,
            fields,
            progress,
            options.samplingMode === "fixed" ? options.samplingPeriod / 1000 : null
          )
        );
        break;
      case "csv-list":
        resolve(generateCsvList(log, fields, progress));
        break;
      case "wpilog":
        resolve(generateWPILOG(log, fields, progress));
        break;
      case "mcap":
        resolve(await generateMCAP(log, fields, progress));
        break;
    }
  } catch {
    // Something went wrong
    reject();
  }
};

function generateCsvTable(
  log: Log,
  fields: string[],
  progress: (progress: number) => void,
  samplingPeriodSecs: number | null
): string {
  // Generate timestamps
  let timestamps: number[] = log.getTimestamps(fields);
  if (samplingPeriodSecs !== null) {
    let minTime = Math.floor(timestamps[0] / samplingPeriodSecs) * samplingPeriodSecs;
    let maxTime = timestamps[timestamps.length - 1];
    timestamps = [];
    for (let timestamp = minTime; timestamp <= maxTime; timestamp += samplingPeriodSecs) {
      timestamps.push(cleanFloat(timestamp));
    }
  }

  // Record timestamps
  let data: string[][] = [["Timestamp"]];
  timestamps.forEach((timestamp) => {
    data.push([timestamp.toString()]);
  });

  // Retrieve data
  fields.forEach((field, fieldIndex) => {
    data[0].push(field);
    let fieldData = log.getRange(field, -Infinity, Infinity);
    let fieldType = log.getType(field);

    timestamps.forEach((timestamp, timestampIndex) => {
      if (fieldData === undefined || fieldType === null) return;
      let nextIndex = fieldData.timestamps.findIndex((value) => value > timestamp);
      if (nextIndex === -1) nextIndex = fieldData.timestamps.length;
      let value: any = null;
      if (nextIndex !== 0) {
        value = fieldData.values[nextIndex - 1];
      }
      data[timestampIndex + 1].push(getLogValueText(value, fieldType).replaceAll(",", ";"));

      // Send progress update
      progress((fieldIndex + timestampIndex / timestamps.length) / fields.length);
    });
  });

  let text = data.map((x) => x.join(",")).join("\n");
  progress(1);
  return text;
}

function generateCsvList(log: Log, fields: string[], progress: (progress: number) => void): string {
  // Retrieve data
  let rows: (number | string)[][] = [];
  fields.forEach((field, fieldIndex) => {
    let fieldData = log.getRange(field, -Infinity, Infinity);
    let fieldType = log.getType(field);
    if (fieldData === undefined) return;
    fieldData.values.forEach((value, valueIndex) => {
      if (fieldData === undefined || fieldType === null) return;
      rows.push([fieldData.timestamps[valueIndex], field, getLogValueText(value, fieldType).replaceAll(",", ";")]);

      // Send progress update
      progress((fieldIndex + valueIndex / fieldData.values.length) / fields.length);
    });
  });

  // Sort and add header
  rows.sort((a, b) => (a[0] as number) - (b[0] as number));
  rows.splice(0, 0, ["Timestamp", "Key", "Value"]);
  let text = rows.map((x) => x.join(",")).join("\n");
  progress(1);
  return text;
}

function generateWPILOG(log: Log, fields: string[], progress: (progress: number) => void): Uint8Array {
  let encoder = new WPILOGEncoder("AdvantageScope");
  fields.forEach((field, fieldIndex) => {
    let fieldData = log.getRange(field, -Infinity, Infinity);
    let fieldType = log.getType(field);
    let wpilibType = log.getWpilibType(field);
    let wpilibMetadata = log.getWpilibMetadata(field);
    if (fieldData === undefined || fieldType === undefined) return;

    // Start record
    let entryId = fieldIndex + 1;
    let typeStr: string = "";
    switch (fieldType) {
      case LoggableType.Raw:
        typeStr = "raw";
        break;
      case LoggableType.Boolean:
        typeStr = "boolean";
        break;
      case LoggableType.Number:
        typeStr = "double";
        break;
      case LoggableType.String:
        typeStr = "string";
        break;
      case LoggableType.BooleanArray:
        typeStr = "boolean[]";
        break;
      case LoggableType.NumberArray:
        typeStr = "double[]";
        break;
      case LoggableType.StringArray:
        typeStr = "string[]";
        break;
    }
    if (wpilibType !== null) {
      typeStr = wpilibType;

      // NT4 uses "int" but wpilog uses "int64"
      if (typeStr === "int") {
        typeStr = "int64";
      }
      if (typeStr === "int[]") {
        typeStr = "int64[]";
      }
    }
    if (wpilibMetadata === "") {
      wpilibMetadata = JSON.stringify({ exportSource: "AdvantageScope" });
    } else {
      try {
        let wpilibMetadataParsed = JSON.parse(wpilibMetadata);
        wpilibMetadataParsed.exportSource = "AdvantageScope";
        wpilibMetadata = JSON.stringify(wpilibMetadataParsed);
      } catch {}
    }
    encoder.add(
      WPILOGEncoderRecord.makeControlStart(0, {
        entry: entryId, // Entry 0 is reserved
        name: field,
        type: typeStr,
        metadata: wpilibMetadata
      })
    );

    // Add data
    fieldData.values.forEach((value, valueIndex) => {
      if (fieldData === undefined || typeStr === "") return;
      let timestamp = fieldData.timestamps[valueIndex] * 1000000;
      switch (typeStr) {
        case "boolean":
          encoder.add(WPILOGEncoderRecord.makeBoolean(entryId, timestamp, value));
          break;
        case "int64":
          encoder.add(WPILOGEncoderRecord.makeInteger(entryId, timestamp, value));
          break;
        case "float":
          encoder.add(WPILOGEncoderRecord.makeFloat(entryId, timestamp, value));
          break;
        case "double":
          encoder.add(WPILOGEncoderRecord.makeDouble(entryId, timestamp, value));
          break;
        case "string":
        case "json":
          encoder.add(WPILOGEncoderRecord.makeString(entryId, timestamp, value));
          break;
        case "boolean[]":
          encoder.add(WPILOGEncoderRecord.makeBooleanArray(entryId, timestamp, value));
          break;
        case "int64[]":
          encoder.add(WPILOGEncoderRecord.makeIntegerArray(entryId, timestamp, value));
          break;
        case "float[]":
          encoder.add(WPILOGEncoderRecord.makeFloatArray(entryId, timestamp, value));
          break;
        case "double[]":
          encoder.add(WPILOGEncoderRecord.makeDoubleArray(entryId, timestamp, value));
          break;
        case "string[]":
          encoder.add(WPILOGEncoderRecord.makeStringArray(entryId, timestamp, value));
          break;
        default:
          encoder.add(WPILOGEncoderRecord.makeRaw(entryId, timestamp, value));
          break;
      }

      // Send progress update
      progress((fieldIndex + valueIndex / fieldData.values.length) / fields.length);
    });
  });

  // Encode full log
  progress(1);
  return encoder.getEncoded();
}

async function generateMCAP(log: Log, fields: string[], progress: (progress: number) => void): Promise<Uint8Array> {
  // Create MCAP writer
  const textEncoder = new TextEncoder();
  let logBuffer = new TempBuffer();
  const writer = new McapWriter({ writable: logBuffer });
  await writer.start({
    library: "AdvantageScope",
    profile: ""
  });

  // Add schemas
  let getSingleSchema = async (type: string) => {
    return await writer.registerSchema({
      name: type,
      encoding: "jsonschema",
      data: textEncoder.encode(JSON.stringify({ type: "object", properties: { value: { type: type } } }))
    });
  };
  let getArraySchema = async (type: string) => {
    return await writer.registerSchema({
      name: type + "[]",
      encoding: "jsonschema",
      data: textEncoder.encode(
        JSON.stringify({ type: "object", properties: { value: { type: "array", items: { type: type } } } })
      )
    });
  };
  let schemaIds: Map<LoggableType, number> = new Map();
  schemaIds.set(LoggableType.Boolean, await getSingleSchema("boolean"));
  schemaIds.set(LoggableType.Number, await getSingleSchema("number"));
  schemaIds.set(LoggableType.String, await getSingleSchema("string"));
  schemaIds.set(LoggableType.BooleanArray, await getArraySchema("boolean"));
  schemaIds.set(LoggableType.NumberArray, await getArraySchema("number"));
  schemaIds.set(LoggableType.BooleanArray, await getArraySchema("string"));

  // Add fields
  let filteredFields = fields.filter((field) => {
    let type = log.getType(field);
    return type !== null && schemaIds.has(type) && !log.isGenerated(field);
  });
  for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
    let field = filteredFields[fieldIndex];
    let fieldData = log.getRange(field, -Infinity, Infinity);
    let fieldType = log.getType(field);
    if (fieldData === undefined || fieldType === null) {
      continue;
    }

    // Register channel
    let channelId = await writer.registerChannel({
      messageEncoding: "json",
      metadata: new Map(),
      schemaId: schemaIds.get(fieldType)!,
      topic: field
    });

    // Add data
    for (let i = 0; i < fieldData.timestamps.length; i++) {
      let timestamp = BigInt(Math.round(fieldData.timestamps[i] * 1e9)); // MCAP uses nanoseconds
      let value = textEncoder.encode(JSON.stringify({ value: fieldData.values[i] }));
      await writer.addMessage({
        channelId: channelId,
        data: value,
        logTime: timestamp,
        publishTime: timestamp,
        sequence: i
      });

      // Send progress update
      progress((fieldIndex + i / fieldData.values.length) / filteredFields.length);
    }
  }

  // Return MCAP data
  await writer.end();
  return logBuffer.get();
}

/** Copied from @mcap/core */
class TempBuffer implements IReadable, IWritable {
  #buffer = new ArrayBuffer(1024);
  #size = 0;

  position(): bigint {
    return BigInt(this.#size);
  }
  async write(data: Uint8Array): Promise<void> {
    if (this.#size + data.byteLength > this.#buffer.byteLength) {
      const newBuffer = new ArrayBuffer(this.#size + data.byteLength);
      new Uint8Array(newBuffer).set(new Uint8Array(this.#buffer));
      this.#buffer = newBuffer;
    }
    new Uint8Array(this.#buffer, this.#size).set(data);
    this.#size += data.byteLength;
  }

  async size(): Promise<bigint> {
    return BigInt(this.#size);
  }
  async read(offset: bigint, size: bigint): Promise<Uint8Array> {
    if (offset < 0n || offset + size > BigInt(this.#buffer.byteLength)) {
      throw new Error("read out of range");
    }
    return new Uint8Array(this.#buffer, Number(offset), Number(size));
  }

  get(): Uint8Array {
    return new Uint8Array(this.#buffer, 0, this.#size);
  }
}
