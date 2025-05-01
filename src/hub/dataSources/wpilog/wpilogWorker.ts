import Log from "../../../shared/log/Log";
import { getEnabledKey, PHOTON_PREFIX, PROTO_PREFIX, STRUCT_PREFIX } from "../../../shared/log/LogUtil";
import LoggableType from "../../../shared/log/LoggableType";
import {
  HistoricalDataSource_WorkerFieldResponse,
  HistoricalDataSource_WorkerRequest,
  HistoricalDataSource_WorkerResponse
} from "../HistoricalDataSource";
import CustomSchemas from "../schema/CustomSchemas";
import { WPILOGDecoder } from "./WPILOGDecoder";
import { CONTROL_ENTRY } from "./WPILOGShared";
import * as wpilogIndexer from "./indexer/wpilogIndexer";

let decoder: WPILOGDecoder | null = null;
const log = new Log(false);
const entryIds: { [id: number]: string } = {};
const entryTypes: { [id: string]: string } = {};
const entryStartTimes: { [id: number]: number } = {};
const dataRecordPositions: { [id: string]: number[] } = {};

function sendResponse(response: HistoricalDataSource_WorkerResponse) {
  self.postMessage(response);
}

self.onmessage = async (event) => {
  let request: HistoricalDataSource_WorkerRequest = event.data;
  switch (request.type) {
    case "start":
      await start(request.data[0]);
      break;

    case "parseField":
      parseField(request.key);
      break;
  }
};

async function start(data: Uint8Array) {
  let lastProgressValue = 0;
  let shortLivedFieldNames: Set<string> = new Set();
  decoder = new WPILOGDecoder(data);

  try {
    await wpilogIndexer.run(
      data,
      (min, max) => {
        log.updateRangeWithTimestamp(min);
        log.updateRangeWithTimestamp(max);
      },
      (entry, position) => {
        if (entry === CONTROL_ENTRY) {
          let record = decoder?.getRecordAtPosition(position)[0];
          if (record !== null && record !== undefined) {
            if (record.isStart()) {
              const startData = record.getStartData();
              if (!(startData.name in dataRecordPositions) || entryTypes[startData.name] !== startData.type) {
                // If the entry was previously declared with a different type, clear
                // the old data to avoid a conflict (use the last declared type)
                dataRecordPositions[startData.name] = [];
              }
              entryIds[startData.entry] = startData.name;
              entryTypes[startData.name] = startData.type;
              entryStartTimes[startData.entry] = record.getTimestamp();
              switch (startData.type) {
                case "boolean":
                  log.createBlankField(startData.name, LoggableType.Boolean);
                  break;
                case "int":
                case "int64":
                case "float":
                case "double":
                  log.createBlankField(startData.name, LoggableType.Number);
                  break;
                case "string":
                case "json":
                  log.createBlankField(startData.name, LoggableType.String);
                  break;
                case "boolean[]":
                  log.createBlankField(startData.name, LoggableType.BooleanArray);
                  break;
                case "int[]":
                case "int64[]":
                case "float[]":
                case "double[]":
                  log.createBlankField(startData.name, LoggableType.NumberArray);
                  break;
                case "string[]":
                  log.createBlankField(startData.name, LoggableType.StringArray);
                  break;
                default: // Default to raw
                  log.createBlankField(startData.name, LoggableType.Raw);
                  if (startData.type.startsWith(STRUCT_PREFIX)) {
                    let schemaType = startData.type.split(STRUCT_PREFIX)[1];
                    log.setStructuredType(startData.name, schemaType);
                  } else if (startData.type.startsWith(PHOTON_PREFIX)) {
                    let schemaType = startData.type.split(PHOTON_PREFIX)[1];
                    log.setStructuredType(startData.name, schemaType);
                  } else if (startData.type.startsWith(PROTO_PREFIX)) {
                    let schemaType = startData.type.split(PROTO_PREFIX)[1];
                    log.setStructuredType(startData.name, schemaType);
                  }
                  break;
              }
              log.setWpilibType(startData.name, startData.type);
              log.setMetadataString(startData.name, startData.metadata);
            } else if (record.isFinish()) {
              let entry = record.getFinishEntry();

              // Entry has existed for less than a second so ignore
              if (record.getTimestamp() - entryStartTimes[entry] < 1e6) {
                shortLivedFieldNames.add(entryIds[entry]);
                log.deleteField(entryIds[entry]);
                delete entryIds[entry];
                delete entryStartTimes[entry];
              }
            } else if (record.isSetMetadata()) {
              let setMetadataData = record.getSetMetadataData();
              if (setMetadataData.entry in entryIds) {
                log.setMetadataString(entryIds[setMetadataData.entry], setMetadataData.metadata);
              }
            }
          }
        } else if (entry in entryIds) {
          let key = entryIds[entry];
          if (key in dataRecordPositions) {
            dataRecordPositions[key].push(position);
          }
        }

        // Send progress update
        let progress = position / data.byteLength;
        if (progress - lastProgressValue > 0.01) {
          lastProgressValue = progress;
          sendResponse({
            type: "progress",
            value: progress
          });
        }
      }
    );
  } catch (exception) {
    console.error(exception);
    sendResponse({
      type: "failed"
    });
    return;
  }

  // Warn about short-lived fields
  if (shortLivedFieldNames.size > 0) {
    console.warn("Ignoring short-lived WPILOG entries:", [...shortLivedFieldNames].toSorted());
  }

  // Load enabled field (required for merging)
  let enabledKey = getEnabledKey(log);
  if (enabledKey !== undefined) {
    parseField(enabledKey, true);
  }

  // Send message
  log.getChangedFields(); // Reset changed fields
  sendResponse({
    type: "initial",
    log: log.toSerialized(),
    isPartial: true
  });
}

function parseField(key: string, skipMessage = false) {
  // Parse records
  if (!(key in entryTypes)) {
    // Try removing leading slash, sometimes inserted
    // when a key prefix is used in the main renderer
    if (key.startsWith("/")) {
      key = key.slice(1);
    }
    if (!(key in entryTypes)) {
      console.warn("Unavailable key requested for parsing:", key);
      return;
    }
  }
  if (key in dataRecordPositions) {
    const type = entryTypes[key];
    dataRecordPositions[key].forEach((position) => {
      const [record, _] = decoder!.getRecordAtPosition(position);
      if (record === null) return;
      let timestamp = record.getTimestamp() / 1000000.0;
      try {
        switch (type) {
          case "boolean":
            log.putBoolean(key, timestamp, record.getBoolean());
            break;
          case "int":
          case "int64":
            log.putNumber(key, timestamp, record.getInteger());
            break;
          case "float":
            log.putNumber(key, timestamp, record.getFloat());
            break;
          case "double":
            log.putNumber(key, timestamp, record.getDouble());
            break;
          case "string":
            log.putString(key, timestamp, record.getString());
            break;
          case "boolean[]":
            log.putBooleanArray(key, timestamp, record.getBooleanArray());
            break;
          case "int[]":
          case "int64[]":
            log.putNumberArray(key, timestamp, record.getIntegerArray());
            break;
          case "float[]":
            log.putNumberArray(key, timestamp, record.getFloatArray());
            break;
          case "double[]":
            log.putNumberArray(key, timestamp, record.getDoubleArray());
            break;
          case "string[]":
            log.putStringArray(key, timestamp, record.getStringArray());
            break;
          case "json":
            log.putJSON(key, timestamp, record.getString());
            break;
          case "msgpack":
            log.putMsgpack(key, timestamp, record.getRaw());
            break;
          default: // Default to raw
            if (type.startsWith(STRUCT_PREFIX)) {
              let schemaType = type.split(STRUCT_PREFIX)[1];
              if (schemaType.endsWith("[]")) {
                log.putStruct(key, timestamp, record.getRaw(), schemaType.slice(0, -2), true);
              } else {
                log.putStruct(key, timestamp, record.getRaw(), schemaType, false);
              }
            } else if (type.startsWith(PHOTON_PREFIX)) {
              let schemaType = type.split(PHOTON_PREFIX)[1];
              log.putPhotonStruct(key, timestamp, record.getRaw(), schemaType);
            } else if (type.startsWith(PROTO_PREFIX)) {
              let schemaType = type.split(PROTO_PREFIX)[1];
              log.putProto(key, timestamp, record.getRaw(), schemaType);
            } else {
              log.putRaw(key, timestamp, record.getRaw());
              if (CustomSchemas.has(type)) {
                try {
                  CustomSchemas.get(type)!(log, key, timestamp, record.getRaw());
                } catch {
                  console.error('Failed to decode custom schema "' + type + '"');
                }
                log.setGeneratedParent(key);
              }
            }
            break;
        }
      } catch (error) {
        console.error("Failed to decode WPILOG record:", error);
      }
    });
    delete dataRecordPositions[key]; // Clear memory
  }

  // Get set of changed fields
  let fieldData: HistoricalDataSource_WorkerFieldResponse[] = [];
  let hasRoot = false;
  log.getChangedFields().forEach((childKey) => {
    let serialized = log.getField(childKey)!.toSerialized();
    if (childKey === key) hasRoot = true;
    fieldData.push({
      key: childKey,
      data: serialized,
      generatedParent: log.isGeneratedParent(childKey)
    });
  });
  if (!hasRoot) {
    let field = log.getField(key);
    if (field !== null) {
      fieldData.push({
        key: key,
        data: field.toSerialized(),
        generatedParent: log.isGeneratedParent(key)
      });
    }
  }

  // Send result
  if (!skipMessage) {
    sendResponse({
      type: "fields",
      fields: fieldData
    });
  }
}
