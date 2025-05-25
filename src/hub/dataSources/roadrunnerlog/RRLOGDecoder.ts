// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { Pose2d } from "../../../shared/geometry";
import Log from "../../../shared/log/Log";
import { EnumSchema, MessageSchema, PrimitiveSchema, RRMessage, StructSchema } from "./RRLOGCommon";

export default class RRLOGDecoder {
  private SUPPORTED_LOG_REVISIONS = [0];
  private STRING_DECODER = new TextDecoder("UTF-8");

  private isFile;

  private magic: string | null = null; //
  private logRevision: number | null = null;
  private firstTimestamp: bigint | null = null;
  private lastTimestamp: number = 0; // no guarantee of ever finding a timestamp; default to 0 just in case
  private lastProgressTimestamp = 0;
  private keyIDs: { [id: number]: string } = {};
  private keySchemas: { [id: number]: MessageSchema } = {};

  constructor(isFile: boolean) {
    this.isFile = isFile;
  }

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
        // StructSchema
        let numFields = dataBuffer.getInt32(shiftOffset(4));
        let schema = new StructSchema();
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
        let numConstants = dataBuffer.getInt32(shiftOffset(4));
        let schema = new EnumSchema();
        for (let i = 0; i < numConstants; i++) {
          schema.constants.push(readString());
        }
        return schema;
      } else {
        throw "Unknown schema type: " + schemaType;
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
      } else {
        // Must be EnumSchema; for some reason checking is a warning
        let ordinal = dataBuffer.getInt32(shiftOffset(4));
        return schema.constants[ordinal];
      }
    }

    const rrTimeToInt = (rr: bigint) => {
      if (this.firstTimestamp === null) {
        this.firstTimestamp = rr;
      }
      return Number(rr - this.firstTimestamp) / 1e9;
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

      mainLoop: while (true) {
        if (offset >= dataArray.length) break mainLoop; // No more data, so we can't start a new entry

        readLoop: while (true) {
          let type: number;
          try {
            type = dataBuffer.getInt32(shiftOffset(4));
            if (type === undefined) break readLoop; // This was the last cycle, save the data
          } catch (e) {
            break readLoop;
          }

          let keyID: number;
          switch (type) {
            case 0: // New channel definition
              keyID = Object.keys(this.keyIDs).length;
              this.keyIDs[keyID] = readString();
              this.keySchemas[keyID] = readSchema();
              break;
            case 1: // New message
              keyID = dataBuffer.getInt32(shiftOffset(4));
              let key = this.keyIDs[keyID];
              let schema = this.keySchemas[keyID];
              let msg = readMsg(schema);

              // find a timestamp

              // guaranteed by writer
              if (
                (key === "OPMODE_PRE_INIT" || key === "OPMODE_PRE_START" || key === "OPMODE_POST_STOP") &&
                typeof msg === "bigint"
              ) {
                this.lastTimestamp = rrTimeToInt(msg);
                if (key === "OPMODE_PRE_START") {
                  log.putBoolean("RUNNING", this.lastTimestamp, true);
                } else if (key === "OPMODE_POST_STOP") {
                  log.putBoolean("RUNNING", this.lastTimestamp, false);
                }

                // blindly guessing, this works with roadrunner's built in writing, hopefully others follow the standard
              } else if (msg instanceof Map && msg.has("timestamp")) {
                let timestamp = msg.get("timestamp");
                if (timestamp != undefined && typeof timestamp === "bigint") {
                  this.lastTimestamp = rrTimeToInt(timestamp);
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
                      translation: [<number>msg.get("x") / 39.37008, <number>msg.get("y") / 39.37008],
                      rotation: msg.get("heading")
                    });
                  }
                  // struct
                  log.putUnknownStruct(key, timestamp, msg);
                  break;
              }
              break;
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
      }
      return true;
    } catch {
      return false;
    }
  }
}
