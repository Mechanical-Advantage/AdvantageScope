// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { Pose2d } from "../../../shared/geometry";
import Log from "../../../shared/log/Log";
import { Units } from "../../../shared/units";
import { ArraySchema, EnumSchema, MessageSchema, PrimitiveSchema, RRMessage, StructSchema } from "./RRLOGCommon";

export default class RRLOGDecoder {
  private SUPPORTED_LOG_REVISIONS = [0, 1];
  private STRING_DECODER = new TextDecoder("UTF-8");

  private magic: string | null = null;
  private logRevision: number | null = null;
  private firstRRTimestamp: bigint | null = null;
  private lastTimestamp: number = 0;
  private lastProgressTimestamp = 0;
  private keyIDs: { [id: number]: string } = {};
  private keySchemas: { [id: number]: MessageSchema } = {};

  decode(log: Log, dataArray: Uint8Array, progressCallback?: (progress: number) => void): boolean {
    let dataBuffer = new DataView(dataArray.buffer);
    let offset = 0;

    function shiftOffset(shift: number) {
      return (offset += shift) - shift;
    }

    const readString = (): string => {
      let len = dataBuffer.getInt32(shiftOffset(4));
      let string = this.STRING_DECODER.decode(dataArray.subarray(offset, offset + len));
      offset += len;
      return string;
    };

    function readSchema(): MessageSchema {
      let schemaType = dataBuffer.getInt32(shiftOffset(4));
      if (schemaType === 0) {
        let schema = new StructSchema();
        let numFields = dataBuffer.getInt32(shiftOffset(4));
        for (let i = 0; i < numFields; i++) {
          schema.fields.set(readString(), readSchema());
        }
        return schema;
      } else if (schemaType === 1) {
        return PrimitiveSchema.INT;
      } else if (schemaType === 2) {
        return PrimitiveSchema.LONG;
      } else if (schemaType === 3) {
        return PrimitiveSchema.DOUBLE;
      } else if (schemaType === 4) {
        return PrimitiveSchema.STRING;
      } else if (schemaType === 5) {
        return PrimitiveSchema.BOOLEAN;
      } else if (schemaType === 6) {
        let schema = new EnumSchema();
        let numConstants = dataBuffer.getInt32(shiftOffset(4));
        for (let i = 0; i < numConstants; i++) {
          schema.constants.push(readString());
        }
        return schema;
      } else if (schemaType === 7) {
        return new ArraySchema(readSchema());
      } else {
        throw "Unknown schema type: " + schemaType;
      }
    }

    function arraySchemaCount(schema: MessageSchema): number {
      if (schema instanceof StructSchema) {
        let count = 0;
        for (const entry of schema.fields.entries()) {
          // Recursively search the child schemas
          count += arraySchemaCount(entry[1]);
        }
        return count;
      } else if (schema instanceof ArraySchema) {
        return 1 + arraySchemaCount(schema.schema);
      } else {
        return 0;
      }
    }

    function readMsg(schema: MessageSchema): RRMessage {
      if (schema instanceof StructSchema) {
        let msg = new Map<string, any>();
        for (const [key, value] of schema.fields.entries()) {
          msg.set(key, readMsg(value));
        }
        return msg;
      } else if (schema === PrimitiveSchema.INT) {
        return dataBuffer.getInt32(shiftOffset(4));
      } else if (schema === PrimitiveSchema.LONG) {
        return dataBuffer.getBigInt64(shiftOffset(8));
      } else if (schema === PrimitiveSchema.DOUBLE) {
        return dataBuffer.getFloat64(shiftOffset(8));
      } else if (schema === PrimitiveSchema.STRING) {
        return readString();
      } else if (schema === PrimitiveSchema.BOOLEAN) {
        return dataArray[shiftOffset(1)] !== 0;
      } else if (schema instanceof EnumSchema) {
        let ordinal = dataBuffer.getInt32(shiftOffset(4));
        return schema.constants[ordinal];
      } else if (schema instanceof ArraySchema) {
        let size = dataBuffer.getInt32(shiftOffset(4));
        let msg: RRMessage[] = [];
        for (let i = 0; i < size; ++i) {
          msg.push(readMsg(schema.schema)); // the schema of the array elements
        }
        return msg;
      } else {
        throw "Unknown schema type: " + schema;
      }
    }

    const rrTimestampToSeconds = (rrTimestamp: bigint) => {
      if (this.firstRRTimestamp === null) {
        this.firstRRTimestamp = rrTimestamp;
      }
      return Number(rrTimestamp - this.firstRRTimestamp) / 1e9; // Nanoseconds to seconds
    };

    try {
      // Check magic beginning
      if (this.magic === null) {
        this.magic = this.STRING_DECODER.decode(dataArray.subarray(offset, offset + 2));
        shiftOffset(2);
        if (!(this.magic === "RR")) {
          return false;
        }
      }

      // Check log revision
      if (this.logRevision === null) {
        this.logRevision = dataBuffer.getInt16(shiftOffset(2));
        if (!this.SUPPORTED_LOG_REVISIONS.includes(this.logRevision)) {
          return false;
        }
      }

      while (true) {
        // Check for the start of another log
        // Allows users to concatenate auto and teleop logs for full match replays
        if (this.STRING_DECODER.decode(dataArray.subarray(offset, offset + 2)) === "RR") {
          shiftOffset(2);
          // Check log revision again for completeness (probably not needed)
          this.logRevision = dataBuffer.getInt16(shiftOffset(2));
          if (!this.SUPPORTED_LOG_REVISIONS.includes(this.logRevision)) {
            return false;
          }
          // Channels and keys are per-log
          this.keyIDs = {};
          this.keySchemas = {};
        }

        let type: number;
        try {
          type = dataBuffer.getInt32(shiftOffset(4));
          if (type === undefined) break; // This was the last cycle, save the data

          let keyID: number;
          switch (type) {
            case 0: // New channel definition
              keyID = Object.keys(this.keyIDs).length;
              this.keyIDs[keyID] = readString();
              let newSchema = readSchema();
              this.keySchemas[keyID] = newSchema;
              if (this.logRevision === 0) {
                // Workaround for https://github.com/acmerobotics/road-runner-ftc/issues/22
                // In v0, each ArraySchema in a definition adds 4 00 bytes to the end of the definition
                shiftOffset(4 * arraySchemaCount(newSchema));
              }
              break;
            case 1: // New message
              keyID = dataBuffer.getInt32(shiftOffset(4));
              let key = this.keyIDs[keyID];
              let schema = this.keySchemas[keyID];
              let msg = readMsg(schema);

              // Find a timestamp

              // Automatically added by log writer
              if (
                (key === "OPMODE_PRE_INIT" ||
                  key === "OPMODE_PRE_START" ||
                  key === "OPMODE_POST_STOP" ||
                  key === "TIMESTAMP") &&
                typeof msg === "bigint"
              ) {
                this.lastTimestamp = rrTimestampToSeconds(msg);
                if (key === "OPMODE_PRE_START") {
                  // Offset start time by 50ms to show the values returned by the first loop
                  log.putBoolean("RUNNING", this.lastTimestamp + 0.05, true);
                } else if (key === "OPMODE_POST_STOP") {
                  log.putBoolean("RUNNING", this.lastTimestamp, false);
                }

                // Automatically parse timestamp fields of Road Runner's built in message classes
              } else if (msg instanceof Map && msg.has("timestamp")) {
                let timestamp = msg.get("timestamp");
                if (timestamp !== undefined && typeof timestamp === "bigint") {
                  this.lastTimestamp = rrTimestampToSeconds(timestamp);
                }
              }

              let timestamp = this.lastTimestamp;
              let type = typeof msg;
              switch (type) {
                case "boolean":
                  log.putBoolean(key, timestamp, <boolean>msg);
                  break;
                case "number":
                  log.putNumber(key, timestamp, <number>msg);
                  break;
                case "bigint":
                  log.putNumber(key, timestamp, Number(msg)); // unsafe??
                  break;
                case "string":
                  log.putString(key, timestamp, <string>msg);
                  break;
                default:
                  if (msg instanceof Map && msg.has("x") && msg.has("y") && msg.has("heading")) {
                    log.putPose(key, timestamp, <Pose2d>{
                      translation: [
                        Units.convert(<number>msg.get("x"), "inches", "meters"),
                        Units.convert(<number>msg.get("y"), "inches", "meters")
                      ],
                      rotation: msg.get("heading")
                    });
                  } else {
                    // struct or array
                    // "allowRootWrite" enabled here to allow for direct array parsing
                    // Writing to the root field is OK because we don't have any
                    // serialized data that it would conflict with (different from
                    // other structured data sources).
                    // https://github.com/Mechanical-Advantage/AdvantageScope/issues/427
                    log.putUnknownStruct(key, timestamp, msg, true);
                  }
                  break;
              }
              break;
          }
        } catch (e) {
          // Catch file ending
          // Usually files should end at message breaks, but this handles corrupted or incorrectly saved logs ending early
          if (e instanceof RangeError && e.message === "Offset is outside the bounds of the DataView") {
            break;
          } else {
            console.error(e);
            return false;
          }
        }

        // Send progress update
        if (progressCallback !== undefined) {
          let now = new Date().getTime();
          if (now - this.lastProgressTimestamp > 1000 / 60) {
            this.lastProgressTimestamp = now;
            progressCallback(offset / dataBuffer.byteLength);
          }
        }
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
