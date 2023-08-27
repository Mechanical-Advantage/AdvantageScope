import ExportOptions from "../shared/ExportOptions";
import Log from "../shared/log/Log";
import LogFieldTree from "../shared/log/LogFieldTree";
import LoggableType from "../shared/log/LoggableType";
import { getLogValueText } from "../shared/log/LogUtil";
import { cleanFloat } from "../shared/util";
import { WPILOGEncoder, WPILOGEncoderRecord } from "./dataSources/wpilog/WPILOGEncoder";

self.onmessage = (event) => {
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
        .sort()
        .forEach((key) => {
          if (data[key].fullKey != null) {
            fields.push(data[key].fullKey as string);
          }
          if (Object.keys(data[key].children).length > 0) {
            processTree(data[key].children);
          }
        });
    };
    processTree(log.getFieldTree(false));

    // Filter by prefix
    if (options.prefixes !== "") {
      let filteredFields: string[] = [];
      options.prefixes.split(",").forEach((prefix) => {
        let prefixSeries = prefix.split(new RegExp(/\/|:/)).filter((item) => item.length > 0);
        fields.forEach((field) => {
          let fieldSeries = field.split(new RegExp(/\/|:/)).filter((item) => item.length > 0);
          if (fieldSeries.length < prefixSeries.length) return;
          if (
            prefixSeries.every((prefix, index) => fieldSeries[index].toLowerCase() == prefix.toLowerCase()) &&
            !filteredFields.includes(field)
          ) {
            filteredFields.push(field);
          }
        });
      });
      fields = filteredFields;
    }

    // Convert to requested format
    switch (options.format) {
      case "csv-table":
        resolve(
          generateCsvTable(
            log,
            fields,
            progress,
            options.samplingMode == "fixed" ? options.samplingPeriod / 1000 : null
          )
        );
        break;
      case "csv-list":
        resolve(generateCsvList(log, fields, progress));
        break;
      case "wpilog":
        resolve(generateWPILOG(log, fields, progress));
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
      if (fieldData === undefined || fieldType === undefined) return;
      let nextIndex = fieldData.timestamps.findIndex((value) => value > timestamp);
      if (nextIndex == -1) nextIndex = fieldData.timestamps.length;
      let value: any = null;
      if (nextIndex != 0) {
        value = fieldData.values[nextIndex - 1];
      }
      data[timestampIndex + 1].push(getLogValueText(value, fieldType).replaceAll(",", ";"));

      // Send progress update
      progress((fieldIndex + timestampIndex / timestamps.length) / fields.length);
    });
  });

  return data.map((x) => x.join(",")).join("\n");
}

function generateCsvList(log: Log, fields: string[], progress: (progress: number) => void) {
  // Retrieve data
  let rows: (number | string)[][] = [];
  fields.forEach((field, fieldIndex) => {
    let fieldData = log.getRange(field, -Infinity, Infinity);
    let fieldType = log.getType(field);
    if (fieldData === undefined) return;
    fieldData.values.forEach((value, valueIndex) => {
      if (fieldData === undefined || fieldType === undefined) return;
      rows.push([fieldData.timestamps[valueIndex], field, getLogValueText(value, fieldType).replaceAll(",", ";")]);

      // Send progress update
      progress((fieldIndex + valueIndex / fieldData.values.length) / fields.length);
    });
  });

  // Sort and add header
  rows.sort((a, b) => (a[0] as number) - (b[0] as number));
  rows.splice(0, 0, ["Timestamp", "Key", "Value"]);
  return rows.map((x) => x.join(",")).join("\n");
}

function generateWPILOG(log: Log, fields: string[], progress: (progress: number) => void) {
  let encoder = new WPILOGEncoder("AdvantageScope");
  fields.forEach((field, fieldIndex) => {
    let fieldData = log.getRange(field, -Infinity, Infinity);
    let fieldType = log.getType(field);
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
    encoder.add(
      WPILOGEncoderRecord.makeControlStart(0, {
        entry: entryId, // Entry 0 is reserved
        name: field,
        type: typeStr,
        metadata: ""
      })
    );

    // Add data
    fieldData.values.forEach((value, valueIndex) => {
      if (fieldData === undefined || fieldType === undefined) return;
      let timestamp = fieldData.timestamps[valueIndex] * 1000000;
      switch (fieldType) {
        case LoggableType.Raw:
          encoder.add(WPILOGEncoderRecord.makeRaw(entryId, timestamp, value));
          break;
        case LoggableType.Boolean:
          encoder.add(WPILOGEncoderRecord.makeBoolean(entryId, timestamp, value));
          break;
        case LoggableType.Number:
          encoder.add(WPILOGEncoderRecord.makeDouble(entryId, timestamp, value));
          break;
        case LoggableType.String:
          encoder.add(WPILOGEncoderRecord.makeString(entryId, timestamp, value));
          break;
        case LoggableType.BooleanArray:
          encoder.add(WPILOGEncoderRecord.makeBooleanArray(entryId, timestamp, value));
          break;
        case LoggableType.NumberArray:
          encoder.add(WPILOGEncoderRecord.makeDoubleArray(entryId, timestamp, value));
          break;
        case LoggableType.StringArray:
          encoder.add(WPILOGEncoderRecord.makeStringArray(entryId, timestamp, value));
          break;
      }

      // Send progress update
      progress((fieldIndex + valueIndex / fieldData.values.length) / fields.length);
    });
  });

  // Encode full log
  return encoder.getEncoded();
}
