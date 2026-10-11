// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { Pose2d } from "../../../shared/geometry";
import Log from "../../../shared/log/Log";
import { Units } from "../../../shared/units";
import {
  ArraySchema,
  EnumSchema,
  MapSchema,
  MessageSchema,
  OptionalSchema,
  PrimitiveSchema,
  RRMessage,
  StructSchema,
  mapKeyToString
} from "./RRLOGCommon";

export default class RRLOGDecoder {
  private SUPPORTED_LOG_REVISIONS = [0, 1, 2, 3];

  // First revision whose message entries carry their own timestamp
  private TIMESTAMPED_REVISION = 3;
  private STRING_DECODER = new TextDecoder("UTF-8");

  private magic: string | null = null;
  private logRevision: number | null = null;
  private firstRRTimestamp: bigint | null = null;
  private lastTimestamp: number = 0;
  private lastProgressTimestamp = 0;
  private keyIDs: { [id: number]: string } = {};
  private keySchemas: { [id: number]: MessageSchema } = {};

  // Trailing bytes of an entry that was cut off by the end of the last chunk. Always empty when
  // decoding a complete file in one call.
  private pendingData: Uint8Array = new Uint8Array();

  /**
   * Decodes a chunk of log data, which does not need to end at an entry boundary. Bytes belonging
   * to an incomplete trailing entry are saved and prepended to the next chunk, so a stream can be
   * decoded by calling this repeatedly with the same decoder.
   */
  decode(log: Log, dataArray: Uint8Array, progressCallback?: (progress: number) => void): boolean {
    if (this.pendingData.length > 0) {
      let combined = new Uint8Array(this.pendingData.length + dataArray.length);
      combined.set(this.pendingData);
      combined.set(dataArray, this.pendingData.length);
      dataArray = combined;
      this.pendingData = new Uint8Array();
    }
    let dataBuffer = new DataView(dataArray.buffer, dataArray.byteOffset, dataArray.byteLength);
    let offset = 0;

    function shiftOffset(shift: number) {
      return (offset += shift) - shift;
    }

    // Reads past the end of the chunk throw RangeError, which is how an incomplete entry is
    // detected. DataView does that on its own; these two read raw bytes, so they check manually.
    const readByte = (): number => {
      if (offset >= dataArray.length) throw new RangeError("Incomplete byte");
      return dataArray[shiftOffset(1)];
    };

    const readString = (): string => {
      let len = dataBuffer.getInt32(shiftOffset(4));
      if (len < 0 || offset + len > dataArray.length) throw new RangeError("Incomplete string");
      let string = this.STRING_DECODER.decode(dataArray.subarray(offset, offset + len));
      offset += len;
      return string;
    };

    const readSchema = (): MessageSchema => {
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
      } else if (schemaType === 8) {
        this.requireRevision2(schemaType);
        let key = readSchema();
        return new MapSchema(key, readSchema());
      } else if (schemaType === 9) {
        this.requireRevision2(schemaType);
        return new OptionalSchema(readSchema());
      } else {
        throw "Unknown schema type: " + schemaType;
      }
    };

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
      } else if (schema instanceof MapSchema) {
        return arraySchemaCount(schema.key) + arraySchemaCount(schema.value);
      } else if (schema instanceof OptionalSchema) {
        return arraySchemaCount(schema.schema);
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
        return readByte() !== 0;
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
      } else if (schema instanceof MapSchema) {
        let size = dataBuffer.getInt32(shiftOffset(4));
        let msg = new Map<string, RRMessage>();
        for (let i = 0; i < size; ++i) {
          let key = readMsg(schema.key); // key and value are always both present
          msg.set(mapKeyToString(key), readMsg(schema.value));
        }
        return msg;
      } else if (schema instanceof OptionalSchema) {
        let present = readByte();
        if (present === 0) return null; // Absent, nothing follows
        if (present !== 1) throw "Invalid optional presence byte: " + present;
        return readMsg(schema.schema);
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
        if (dataArray.length - offset < 2) return this.retain(dataArray, offset);
        this.magic = this.STRING_DECODER.decode(dataArray.subarray(offset, offset + 2));
        shiftOffset(2);
        if (!(this.magic === "RR")) {
          return false;
        }
      }

      // Check log revision
      if (this.logRevision === null) {
        if (dataArray.length - offset < 2) return this.retain(dataArray, offset);
        this.logRevision = dataBuffer.getInt16(shiftOffset(2));
        if (!this.SUPPORTED_LOG_REVISIONS.includes(this.logRevision)) {
          return false;
        }
      }

      while (true) {
        // Everything before this point is a complete entry, so this is where decoding resumes if
        // the chunk runs out partway through the next one
        let entryStart = offset;

        if (offset >= dataArray.length) break; // No more entries in this chunk

        let type: number;
        try {
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
            if (offset >= dataArray.length) break; // Header was the end of this chunk
          }

          type = dataBuffer.getInt32(shiftOffset(4));

          let keyID: number;
          switch (type) {
            case 0: // New channel definition
              // The name and schema are stored together, so a channel is never half-registered if
              // the entry turns out to be incomplete (the ID is derived from the channel count)
              keyID = Object.keys(this.keyIDs).length;
              let newName = readString();
              let newSchema = readSchema();
              this.keyIDs[keyID] = newName;
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

              // Newer logs stamp every message with the time it was logged, nanoseconds on the
              // robot's monotonic clock. Read it before the payload, where the writer put it.
              let hasMessageTimestamp = this.logRevision !== null && this.logRevision >= this.TIMESTAMPED_REVISION;
              let messageTimestamp = hasMessageTimestamp ? dataBuffer.getBigInt64(shiftOffset(8)) : null;
              let msg = readMsg(schema);

              // Find a timestamp
              if (messageTimestamp !== null) {
                // Timestamps are not guaranteed to increase (several threads can log at once), which
                // the log handles by inserting out of order values in place.
                this.lastTimestamp = rrTimestampToSeconds(messageTimestamp);

                // The robot reports OpMode transitions as events
                if (key === "OpMode/Event" && typeof msg === "string") {
                  if (msg === "PRE_START") {
                    // Offset start time by 50ms to show the values returned by the first loop
                    log.putBoolean("RUNNING", this.lastTimestamp + 0.05, true);
                  } else if (msg === "POST_STOP") {
                    log.putBoolean("RUNNING", this.lastTimestamp, false);
                  }
                }

                // Older logs have no per-message timestamp, so one is inferred from the data.
                // Automatically added by log writer
              } else if (
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
          // The entry ran past the end of the chunk. For a stream that means the rest of it hasn't
          // arrived yet, so keep the bytes and pick up here next time. For a file it means the log
          // was truncated or corrupted, and the retained bytes are simply never used.
          if (e instanceof RangeError) {
            this.retain(dataArray, entryStart);
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

  /**
   * Saves the bytes from the given offset onward to be decoded once the rest of the entry arrives.
   * Returns true so callers can `return this.retain(...)` when a chunk is too short to act on.
   */
  private retain(dataArray: Uint8Array, from: number): boolean {
    this.pendingData = from >= dataArray.length ? new Uint8Array() : dataArray.slice(from);
    return true;
  }

  /**
   * Rejects a schema tag that the declared log revision doesn't include; message types added in later versions can't
   * be ignored because decoder doesn't know how many bytes to skip. Throws an error if the log revision is too low.
   */
  private requireRevision2(schemaType: number) {
    if (this.logRevision !== null && this.logRevision < 2) {
      throw "Schema type " + schemaType + " requires log revision 2, but the header declares " + this.logRevision;
    }
  }
}
