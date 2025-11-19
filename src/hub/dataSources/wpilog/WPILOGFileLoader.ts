// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

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

export default class WPILOGLoader {
  decoder: WPILOGDecoder | null = null;
  log = new Log(false);
  entryIds: { [id: number]: string } = {};
  entryTypes: { [id: string]: string } = {};
  entryStartTimes: { [id: number]: number } = {};
  dataRecordPositions: { [id: string]: number[] } = {};
  sendResponse: (resp: any) => void = () => { }
  constructor(sendResponse: (resp: any) => void) {
    this.sendResponse = sendResponse
  }

  async loadFile(data: Uint8Array
  ): Promise<any> {

    this.entryTypes = {};
    let lastProgressValue = 0;
    let shortLivedFieldNames: Set<string> = new Set();
    this.decoder = new WPILOGDecoder(data);

    try {
      await wpilogIndexer.run(
        data,
        (min, max) => {
          this.log.updateRangeWithTimestamp(min);
          this.log.updateRangeWithTimestamp(max);
        },
        (entry, position) => {
          if (entry === CONTROL_ENTRY) {
            let record = this.decoder?.getRecordAtPosition(position)[0];
            if (record !== null && record !== undefined) {
              if (record.isStart()) {
                const startData = record.getStartData();
                if (!(startData.name in this.dataRecordPositions) || this.entryTypes[startData.name] !== startData.type) {
                  // If the entry was previously declared with a different type, clear
                  // the old data to avoid a conflict (use the last declared type)
                  this.dataRecordPositions[startData.name] = [];
                }
                this.entryIds[startData.entry] = startData.name;
                this.entryTypes[startData.name] = startData.type;
                this.entryStartTimes[startData.entry] = record.getTimestamp();
                switch (startData.type) {
                  case "boolean":
                    this.log.createBlankField(startData.name, LoggableType.Boolean);
                    break;
                  case "int":
                  case "int64":
                  case "float":
                  case "double":
                    this.log.createBlankField(startData.name, LoggableType.Number);
                    break;
                  case "string":
                  case "json":
                    this.log.createBlankField(startData.name, LoggableType.String);
                    break;
                  case "boolean[]":
                    this.log.createBlankField(startData.name, LoggableType.BooleanArray);
                    break;
                  case "int[]":
                  case "int64[]":
                  case "float[]":
                  case "double[]":
                    this.log.createBlankField(startData.name, LoggableType.NumberArray);
                    break;
                  case "string[]":
                    this.log.createBlankField(startData.name, LoggableType.StringArray);
                    break;
                  default: // Default to raw
                    this.log.createBlankField(startData.name, LoggableType.Raw);
                    if (startData.type.startsWith(STRUCT_PREFIX)) {
                      let schemaType = startData.type.split(STRUCT_PREFIX)[1];
                      this.log.setStructuredType(startData.name, schemaType);
                    } else if (startData.type.startsWith(PHOTON_PREFIX)) {
                      let schemaType = startData.type.split(PHOTON_PREFIX)[1];
                      this.log.setStructuredType(startData.name, schemaType);
                    } else if (startData.type.startsWith(PROTO_PREFIX)) {
                      let schemaType = startData.type.split(PROTO_PREFIX)[1];
                      this.log.setStructuredType(startData.name, schemaType);
                    }
                    break;
                }
                this.log.setWpilibType(startData.name, startData.type);
                this.log.setMetadataString(startData.name, startData.metadata);
              } else if (record.isFinish()) {
                let entry = record.getFinishEntry();

                // Entry has existed for less than a second so ignore
                if (record.getTimestamp() - this.entryStartTimes[entry] < 1e6) {
                  shortLivedFieldNames.add(this.entryIds[entry]);
                  this.log.deleteField(this.entryIds[entry]);
                  delete this.entryIds[entry];
                  delete this.entryStartTimes[entry];
                }
              } else if (record.isSetMetadata()) {
                let setMetadataData = record.getSetMetadataData();
                if (setMetadataData.entry in this.entryIds) {
                  this.log.setMetadataString(this.entryIds[setMetadataData.entry], setMetadataData.metadata);
                }
              }
            }
          } else if (entry in this.entryIds) {
            let key = this.entryIds[entry];
            if (key in this.dataRecordPositions) {
              this.dataRecordPositions[key].push(position);
            }
          }

          // Send progress update
          let progress = position / data.byteLength;
          if (progress - lastProgressValue > 0.01) {
            lastProgressValue = progress;
            this.sendResponse({
              type: "progress",
              value: progress
            });
          }
        }
      );
    } catch (exception) {
      console.log(exception)
      console.error(exception);
      this.sendResponse({
        type: "failed"
      });
      return;
    }

    // Warn about short-lived fields
    if (shortLivedFieldNames.size > 0) {
      console.warn("Ignoring short-lived WPILOG entries:", [...shortLivedFieldNames].toSorted());
    }

    // Load enabled field (required for merging)
    let enabledKey = getEnabledKey(this.log);
    if (enabledKey !== undefined) {
      this.parseField(enabledKey, true);
    }

    // Send message
    this.log.getChangedFields(); // Reset changed fields
    return {
      serializedLog: this.log.toSerialized(),
      log: this.log
    }
    // return this.log.toSerialized();
    // this.sendResponse({
    //   type: "initial",
    //   log: this.log.toSerialized(),
    //   isPartial: true
    // });
  }

  parseField(key: string, skipMessage = false) {
    // Parse records
    if (!(key in this.entryTypes)) {
      // Try removing leading slash, sometimes inserted
      // when a key prefix is used in the main renderer
      if (key.startsWith("/")) {
        key = key.slice(1);
      }
      if (!(key in this.entryTypes)) {
        console.warn("Unavailable key requested for parsing:", key);
        return;
      }
    }
    if (key in this.dataRecordPositions) {
      const type = this.entryTypes[key];
      this.dataRecordPositions[key].forEach((position) => {
        const [record, _] = this.decoder!.getRecordAtPosition(position);
        if (record === null) return;
        let timestamp = record.getTimestamp() / 1000000.0;
        try {
          switch (type) {
            case "boolean":
              this.log.putBoolean(key, timestamp, record.getBoolean());
              break;
            case "int":
            case "int64":
              this.log.putNumber(key, timestamp, record.getInteger());
              break;
            case "float":
              this.log.putNumber(key, timestamp, record.getFloat());
              break;
            case "double":
              this.log.putNumber(key, timestamp, record.getDouble());
              break;
            case "string":
              this.log.putString(key, timestamp, record.getString());
              break;
            case "boolean[]":
              this.log.putBooleanArray(key, timestamp, record.getBooleanArray());
              break;
            case "int[]":
            case "int64[]":
              this.log.putNumberArray(key, timestamp, record.getIntegerArray());
              break;
            case "float[]":
              this.log.putNumberArray(key, timestamp, record.getFloatArray());
              break;
            case "double[]":
              this.log.putNumberArray(key, timestamp, record.getDoubleArray());
              break;
            case "string[]":
              this.log.putStringArray(key, timestamp, record.getStringArray());
              break;
            case "json":
              this.log.putJSON(key, timestamp, record.getString());
              break;
            case "msgpack":
              this.log.putMsgpack(key, timestamp, record.getRaw());
              break;
            default: // Default to raw
              if (type.startsWith(STRUCT_PREFIX)) {
                let schemaType = type.split(STRUCT_PREFIX)[1];
                if (schemaType.endsWith("[]")) {
                  this.log.putStruct(key, timestamp, record.getRaw(), schemaType.slice(0, -2), true);
                } else {
                  this.log.putStruct(key, timestamp, record.getRaw(), schemaType, false);
                }
              } else if (type.startsWith(PHOTON_PREFIX)) {
                let schemaType = type.split(PHOTON_PREFIX)[1];
                this.log.putPhotonStruct(key, timestamp, record.getRaw(), schemaType);
              } else if (type.startsWith(PROTO_PREFIX)) {
                let schemaType = type.split(PROTO_PREFIX)[1];
                this.log.putProto(key, timestamp, record.getRaw(), schemaType);
              } else {
                this.log.putRaw(key, timestamp, record.getRaw());
                if (CustomSchemas.has(type)) {
                  try {
                    CustomSchemas.get(type)!(this.log, key, timestamp, record.getRaw());
                  } catch {
                    console.error('Failed to decode custom schema "' + type + '"');
                  }
                  this.log.setGeneratedParent(key);
                }
              }
              break;
          }
        } catch (error) {
          console.error("Failed to decode WPILOG record:", error);
        }
      });
      delete this.dataRecordPositions[key]; // Clear memory
    }

    // Get set of changed fields
    let fieldData: HistoricalDataSource_WorkerFieldResponse[] = [];
    let hasRoot = false;
    this.log.getChangedFields().forEach((childKey) => {
      let serialized = this.log.getField(childKey)!.toSerialized();
      if (childKey === key) hasRoot = true;
      fieldData.push({
        key: childKey,
        data: serialized,
        generatedParent: this.log.isGeneratedParent(childKey)
      });
    });
    if (!hasRoot) {
      let field = this.log.getField(key);
      if (field !== null) {
        fieldData.push({
          key: key,
          data: field.toSerialized(),
          generatedParent: this.log.isGeneratedParent(key)
        });
      }
    }

    // Send result
    if (!skipMessage) {
      this.sendResponse({
        type: "fields",
        fields: fieldData
      });
    }
  }

}