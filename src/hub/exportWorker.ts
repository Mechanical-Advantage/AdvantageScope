import { IWritable, McapWriter } from "@mcap/core";
import { IReadable } from "@mcap/core/dist/esm/src/types";
import ExportOptions from "../shared/ExportOptions";
import Log from "../shared/log/Log";
import LogFieldTree from "../shared/log/LogFieldTree";
import { AKIT_TIMESTAMP_KEYS, filterFieldByPrefixes, getLogValueText } from "../shared/log/LogUtil";
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
    processTree(log.getFieldTree(options.includeGenerated));

    // Filter by type and prefix
    fields = fields.filter((field) => log.getType(field) !== LoggableType.Empty);
    fields = filterFieldByPrefixes(fields, options.prefixes, options.format === "wpilog");

    // Get timestamps based on sampling mode
    let timestamps: number[] | undefined = undefined;
    switch (options.samplingMode) {
      case "fixed":
        let samplingPeriodSecs = options.samplingPeriod / 1000;
        let range = log.getTimestampRange();
        timestamps = [];
        for (let timestamp = range[0]; timestamp <= range[1]; timestamp += samplingPeriodSecs) {
          timestamps.push(cleanFloat(timestamp));
        }
        break;

      case "akit":
        let timestampField = log.getFieldKeys().find((key) => AKIT_TIMESTAMP_KEYS.includes(key));
        if (timestampField === undefined) {
          reject();
          return;
        }
        let timestampData = log.getNumber(timestampField, -Infinity, Infinity);
        if (timestampData === undefined) {
          reject();
          return;
        }
        timestamps = timestampData.timestamps;
        break;
    }

    // Convert to requested format
    switch (options.format) {
      case "csv-table":
        resolve(generateCsvTable(log, fields, progress, timestamps));
        break;
      case "csv-list":
        resolve(generateCsvList(log, fields, progress, timestamps));
        break;
      case "wpilog":
        resolve(generateWPILOG(log, fields, progress, timestamps));
        break;
      case "mcap":
        resolve(await generateMCAP(log, fields, progress, timestamps));
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
  timestamps?: number[]
): string {
  // Generate timestamps for changes
  if (timestamps === undefined) {
    timestamps = log.getTimestamps(fields);
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

    timestamps!.forEach((timestamp, timestampIndex) => {
      if (fieldData === undefined || fieldType === null) return;
      let nextIndex = fieldData.timestamps.findIndex((value) => value > timestamp);
      if (nextIndex === -1) nextIndex = fieldData.timestamps.length;
      let value: any = null;
      if (nextIndex !== 0) {
        value = fieldData.values[nextIndex - 1];
      }
      data[timestampIndex + 1].push(getLogValueText(value, fieldType).replaceAll(",", ";"));

      // Send progress update
      progress((fieldIndex + timestampIndex / timestamps!.length) / fields.length);
    });
  });

  let text = data.map((x) => x.join(",")).join("\n");
  progress(1);
  return text;
}

function generateCsvList(
  log: Log,
  fields: string[],
  progress: (progress: number) => void,
  timestamps?: number[]
): string {
  // Retrieve data
  let rows: (number | string)[][] = [];
  fields.forEach((field, fieldIndex) => {
    let fieldData = log.getRange(field, -Infinity, Infinity);
    let fieldType = log.getType(field);
    if (fieldData === undefined) return;
    let addValue = (timestamp: number, value: any) => {
      if (fieldType === null) return;
      rows.push([timestamp, field, getLogValueText(value, fieldType).replaceAll(",", ";")]);
    };

    if (timestamps === undefined) {
      // Add all values
      fieldData.values.forEach((value, valueIndex) => {
        if (fieldData === undefined) return;
        addValue(fieldData.timestamps[valueIndex], value);
        progress((fieldIndex + valueIndex / fieldData.values.length) / fields.length);
      });
    } else {
      // Add samples at timestamps
      timestamps.forEach((timestamp, timestampIndex) => {
        if (fieldData === undefined) return;
        let nextIndex = fieldData.timestamps.findIndex((value) => value > timestamp);
        if (nextIndex === -1) nextIndex = fieldData.timestamps.length;
        let value: any = null;
        if (nextIndex !== 0) {
          value = fieldData.values[nextIndex - 1];
        }
        addValue(timestamp, value);
        progress((fieldIndex + timestampIndex / timestamps.length) / fields.length);
      });
    }
  });

  // Sort and add header
  rows.sort((a, b) => (a[0] as number) - (b[0] as number));
  rows.splice(0, 0, ["Timestamp", "Key", "Value"]);
  let text = rows.map((x) => x.join(",")).join("\n");
  progress(1);
  return text;
}

function generateWPILOG(
  log: Log,
  fields: string[],
  progress: (progress: number) => void,
  timestamps?: number[]
): Uint8Array {
  let encoder = new WPILOGEncoder("AdvantageScope");
  fields.forEach((field, fieldIndex) => {
    let fieldData = log.getRange(field, -Infinity, Infinity);
    let fieldType = log.getType(field);
    let wpilibType = log.getWpilibType(field);
    let metadata = log.getMetadataString(field);
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
    if (metadata === "") {
      metadata = JSON.stringify({ exporter: "AdvantageScope" });
    } else {
      try {
        let metadataParsed = JSON.parse(metadata);
        metadataParsed.exporter = "AdvantageScope";
        metadata = JSON.stringify(metadataParsed);
      } catch {}
    }
    let startTimestamp = fieldData.timestamps.length > 0 ? fieldData.timestamps[0] : 0;
    encoder.add(
      WPILOGEncoderRecord.makeControlStart(startTimestamp * 1000000, {
        entry: entryId, // Entry 0 is reserved
        name: field,
        type: typeStr,
        metadata: metadata
      })
    );

    // Add data
    let addValue = (timestamp: number, value: any) => {
      let timestampMicros = timestamp * 1000000;
      switch (typeStr) {
        case "boolean":
          encoder.add(WPILOGEncoderRecord.makeBoolean(entryId, timestampMicros, value));
          break;
        case "int64":
          encoder.add(WPILOGEncoderRecord.makeInteger(entryId, timestampMicros, value));
          break;
        case "float":
          encoder.add(WPILOGEncoderRecord.makeFloat(entryId, timestampMicros, value));
          break;
        case "double":
          encoder.add(WPILOGEncoderRecord.makeDouble(entryId, timestampMicros, value));
          break;
        case "string":
        case "json":
          encoder.add(WPILOGEncoderRecord.makeString(entryId, timestampMicros, value));
          break;
        case "boolean[]":
          encoder.add(WPILOGEncoderRecord.makeBooleanArray(entryId, timestampMicros, value));
          break;
        case "int64[]":
          encoder.add(WPILOGEncoderRecord.makeIntegerArray(entryId, timestampMicros, value));
          break;
        case "float[]":
          encoder.add(WPILOGEncoderRecord.makeFloatArray(entryId, timestampMicros, value));
          break;
        case "double[]":
          encoder.add(WPILOGEncoderRecord.makeDoubleArray(entryId, timestampMicros, value));
          break;
        case "string[]":
          encoder.add(WPILOGEncoderRecord.makeStringArray(entryId, timestampMicros, value));
          break;
        default:
          encoder.add(WPILOGEncoderRecord.makeRaw(entryId, timestampMicros, value));
          break;
      }
    };
    if (timestamps === undefined) {
      // Add all values
      fieldData.values.forEach((value, valueIndex) => {
        if (fieldData === undefined || typeStr === "") return;
        addValue(fieldData.timestamps[valueIndex], value);
        progress((fieldIndex + valueIndex / fieldData.values.length) / fields.length);
      });
    } else {
      // Add samples at timestamps
      timestamps.forEach((timestamp, timestampIndex) => {
        if (fieldData === undefined) return;
        let nextIndex = fieldData.timestamps.findIndex((value) => value > timestamp);
        if (nextIndex === -1) nextIndex = fieldData.timestamps.length;
        if (nextIndex !== 0) {
          addValue(timestamp, fieldData.values[nextIndex - 1]);
        }
        progress((fieldIndex + timestampIndex / timestamps.length) / fields.length);
      });
    }
  });

  // Encode full log
  progress(1);
  return encoder.getEncoded(true);
}

async function generateMCAP(
  log: Log,
  fields: string[],
  progress: (progress: number) => void,
  timestamps?: number[]
): Promise<Uint8Array> {
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
    return type !== null && schemaIds.has(type);
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
    let addValue = async (timestamp: number, value: any, sequence: number) => {
      let timestampNanos = BigInt(Math.round(timestamp * 1e9));
      let valueStr = textEncoder.encode(JSON.stringify({ value: value }));
      await writer.addMessage({
        channelId: channelId,
        data: valueStr,
        logTime: timestampNanos,
        publishTime: timestampNanos,
        sequence: sequence
      });
    };
    if (timestamps === undefined) {
      for (let i = 0; i < fieldData.timestamps.length; i++) {
        await addValue(fieldData.timestamps[i], fieldData.values[i], i);
        progress((fieldIndex + i / fieldData.values.length) / filteredFields.length);
      }
    } else {
      for (let i = 0; i < timestamps.length; i++) {
        let timestamp = timestamps[i];
        let nextIndex = fieldData.timestamps.findIndex((value) => value > timestamp);
        if (nextIndex === -1) nextIndex = fieldData.timestamps.length;
        if (nextIndex !== 0) {
          addValue(timestamp, fieldData.values[nextIndex - 1], i);
        }
        progress((fieldIndex + i / timestamps.length) / fields.length);
      }
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
