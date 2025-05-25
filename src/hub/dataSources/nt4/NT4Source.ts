// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Log from "../../../shared/log/Log";
import { PHOTON_PREFIX, PROTO_PREFIX, STRUCT_PREFIX, getEnabledKey, getURCLKeys } from "../../../shared/log/LogUtil";
import LoggableType from "../../../shared/log/LoggableType";
import ProtoDecoder from "../../../shared/log/ProtoDecoder";
import { checkArrayType } from "../../../shared/util";
import { LiveDataSource, LiveDataSourceStatus } from "../LiveDataSource";
import CustomSchemas from "../schema/CustomSchemas";
import { NT4_Client, NT4_Topic } from "./NT4";
import NT4Tuner from "./NT4Tuner";

export const WPILOG_PREFIX = "NT:";
export const AKIT_PREFIX = "/AdvantageKit";
export const AKIT_TUNING_PREFIX = "/Tuning";

export default class NT4Source extends LiveDataSource {
  private akitMode: boolean;
  private client: NT4_Client | null = null;

  private shouldRunOutputCallback = false;
  private connectTime: number | null = null;
  private periodicCallback: NodeJS.Timeout | null = null;
  private noFieldsTimeout: NodeJS.Timeout | null = null;
  private loggingSubscription: number | null = null;
  private lowBandwidthTopicSubscription: number | null = null;
  private lowBandwidthDataSubscriptions: { [id: string]: number } = {};

  constructor(akitMode: boolean) {
    super();
    this.akitMode = akitMode;

    let periodic = () => {
      this.periodic();
      window.requestIdleCallback(periodic, { timeout: 100 });
    };
    window.requestIdleCallback(periodic, { timeout: 100 });
  }

  private periodic() {
    // Update timestamp range based on connection time
    if (this.client !== null && this.connectTime !== null) {
      let connectServerTime = this.client.getServerTime_us(this.connectTime);
      if (connectServerTime !== null) window.log.clearBeforeTime(connectServerTime / 1e6);
    }

    // Update subscriptions
    if (this.client !== null) {
      if (window.preferences?.liveSubscribeMode === "logging") {
        // Switch to logging subscribe mode
        Object.values(this.lowBandwidthDataSubscriptions).forEach((subscriptionId) => {
          this.client?.unsubscribe(subscriptionId);
        });
        this.lowBandwidthDataSubscriptions = {};
        if (this.lowBandwidthTopicSubscription !== null) {
          this.client.unsubscribe(this.lowBandwidthTopicSubscription);
          this.lowBandwidthTopicSubscription = null;
        }
        if (this.loggingSubscription === null) {
          this.loggingSubscription = this.client.subscribe(
            this.akitMode ? [AKIT_PREFIX + "/", AKIT_TUNING_PREFIX + "/"] : [""],
            true,
            true,
            0.02
          );
        }
      } else {
        // Switch to low bandwidth subscribe mode
        if (this.loggingSubscription !== null) {
          this.client.unsubscribe(this.loggingSubscription);
          this.loggingSubscription = null;
        }
        if (this.lowBandwidthTopicSubscription === null) {
          this.lowBandwidthTopicSubscription = this.client.subscribeTopicsOnly(
            this.akitMode ? [AKIT_PREFIX + "/", AKIT_TUNING_PREFIX + "/"] : [""],
            true
          );
        }

        // Add active fields
        let activeFields: Set<string> = new Set();
        if (window.log === this.log) {
          let announcedKeys = this.log.getFieldKeys().filter((key) => this.log?.getType(key) !== LoggableType.Empty);
          let enabledKey = getEnabledKey(this.log);
          [
            ...(this.akitMode
              ? ["/.schema", "/Timestamp"]
              : [
                  WPILOG_PREFIX + "/.schema",
                  WPILOG_PREFIX + AKIT_PREFIX + "/.schema",
                  WPILOG_PREFIX + AKIT_PREFIX + "/Timestamp"
                ]),
            ...(enabledKey === undefined ? [] : [enabledKey]),
            ...window.tabs.getActiveFields(),
            ...window.sidebar.getActiveFields(),
            ...getURCLKeys(window.log)
          ].forEach((key) => {
            // Compare to announced keys
            announcedKeys.forEach((announcedKey) => {
              let subscribeKey: string | null = null;
              if (announcedKey.startsWith(key)) {
                subscribeKey = key;
              } else if (key.startsWith(announcedKey)) {
                subscribeKey = announcedKey;
              }
              if (subscribeKey !== null) {
                if (this.akitMode) {
                  if (subscribeKey.startsWith(AKIT_TUNING_PREFIX)) {
                    activeFields.add(subscribeKey);
                  } else {
                    activeFields.add(AKIT_PREFIX + subscribeKey);
                  }
                } else {
                  activeFields.add(subscribeKey.slice(WPILOG_PREFIX.length));
                }
              }
            });
          });
        }

        // Remove duplicates based on prefixes
        let activeFieldsCopy = new Set(activeFields);
        activeFieldsCopy.forEach((field0) => {
          activeFieldsCopy.forEach((field1) => {
            if (field0 !== field1 && field0.startsWith(field1)) {
              activeFields.delete(field0);
            }
          });
        });

        // Update subscriptions
        activeFields.forEach((field) => {
          if (this.client === null) return;
          if (!(field in this.lowBandwidthDataSubscriptions)) {
            // Prefix match required for mechanisms, joysticks, and metadata
            this.lowBandwidthDataSubscriptions[field] = this.client.subscribe([field], true, true, 0.02);
          }
        });
        Object.entries(this.lowBandwidthDataSubscriptions).forEach(([field, subscriptionId]) => {
          if (!activeFields.has(field)) {
            this.client?.unsubscribe(subscriptionId);
            delete this.lowBandwidthDataSubscriptions[field];
          }
        });
      }
    }

    // Check if output callback should be triggered (prevents
    // running the callback many times for each frame)
    if (
      !this.shouldRunOutputCallback ||
      this.status === LiveDataSourceStatus.Stopped ||
      !this.outputCallback ||
      !this.log
    )
      return;
    this.shouldRunOutputCallback = false;
    this.outputCallback(this.log, () => {
      if (this.client) {
        let serverTime = this.client.getServerTime_us();
        if (serverTime === null) {
          return 10;
        } else {
          return (serverTime - this.client.getNetworkLatency_us()) / 1000000;
        }
      } else {
        return 10;
      }
    });
  }

  connect(
    address: string,
    statusCallback: (status: LiveDataSourceStatus) => void,
    outputCallback: (log: Log, timeSupplier: () => number) => void
  ) {
    super.connect(address, statusCallback, outputCallback);
    this.shouldRunOutputCallback = false;

    if (window.preferences === null) {
      this.setStatus(LiveDataSourceStatus.Error);
    } else {
      this.log = new Log();
      this.client = new NT4_Client(
        address,
        "AdvantageScope",
        (topic: NT4_Topic) => {
          // Announce
          if (!this.log) return;
          if (this.noFieldsTimeout) clearTimeout(this.noFieldsTimeout);
          if (topic.name === "") return;
          let modifiedKey = this.getKeyFromTopic(topic);
          let structuredType: string | null = null;
          if (topic.type.startsWith(STRUCT_PREFIX)) {
            structuredType = topic.type.split(STRUCT_PREFIX)[1];
            if (structuredType.endsWith("[]")) {
              structuredType = structuredType.slice(0, -2);
            }
          } else if (topic.type.startsWith(PROTO_PREFIX)) {
            structuredType = ProtoDecoder.getFriendlySchemaType(topic.type.split(PROTO_PREFIX)[1]);
          } else if (topic.type.startsWith(PHOTON_PREFIX)) {
            structuredType = topic.type.split(PHOTON_PREFIX)[1];
          } else if (topic.type === "msgpack") {
            structuredType = "MessagePack";
          } else if (topic.type === "json") {
            structuredType = "JSON";
          }
          this.log.createBlankField(modifiedKey, this.getLogType(topic.type));
          this.log.setWpilibType(modifiedKey, topic.type);
          this.log.setStructuredType(modifiedKey, structuredType);
          this.shouldRunOutputCallback = true;
        },
        (topic: NT4_Topic) => {
          // Unannounce
        },
        (topic: NT4_Topic, timestamp_us: number, value: unknown) => {
          // Data
          if (!this.log || !this.client || topic.name === "") return;

          let key = this.getKeyFromTopic(topic);
          let timestamp = Math.max(timestamp_us, this.log.getTimestampRange()[0]) / 1000000;

          let updated = false;
          switch (topic.type) {
            case "boolean":
              if (typeof value === "boolean") {
                this.log?.putBoolean(key, timestamp, value);
                updated = true;
              } else {
                console.warn('Expected a boolean value for "' + key + '" but got:', value);
              }
              break;
            case "int":
            case "float":
            case "double":
              if (typeof value === "number") {
                this.log?.putNumber(key, timestamp, value);
                updated = true;
              } else {
                console.warn('Expected a number value for "' + key + '" but got:', value);
              }
              break;
            case "string":
              if (typeof value === "string") {
                this.log?.putString(key, timestamp, value);
                updated = true;
              } else {
                console.warn('Expected a string value for "' + key + '" but got:', value);
              }
              break;
            case "boolean[]":
              if (checkArrayType(value, "boolean")) {
                this.log?.putBooleanArray(key, timestamp, value as boolean[]);
                updated = true;
              } else {
                console.warn('Expected a boolean[] value for "' + key + '" but got:', value);
              }
              break;
            case "int[]":
            case "float[]":
            case "double[]":
              if (checkArrayType(value, "number")) {
                this.log?.putNumberArray(key, timestamp, value as number[]);
                updated = true;
              } else {
                console.warn('Expected a number[] value for "' + key + '" but got:', value);
              }
              break;
            case "string[]":
              if (checkArrayType(value, "string")) {
                this.log?.putStringArray(key, timestamp, value as string[]);
                updated = true;
              } else {
                console.warn('Expected a string[] value for "' + key + '" but got:', value);
              }
              break;
            case "json":
              if (typeof value === "string") {
                this.log?.putJSON(key, timestamp, value);
                updated = true;
              } else {
                console.warn('Expected a string value for "' + key + '" but got:', value);
              }
              break;
            case "msgpack":
              if (value instanceof Uint8Array) {
                this.log?.putMsgpack(key, timestamp, value);
                updated = true;
              } else {
                console.warn('Expected a raw value for "' + key + '" but got:', value);
              }
              break;
            default: // Default to raw
              if (value instanceof Uint8Array) {
                if (topic.type.startsWith(STRUCT_PREFIX)) {
                  let schemaType = topic.type.split(STRUCT_PREFIX)[1];
                  if (schemaType.endsWith("[]")) {
                    this.log?.putStruct(key, timestamp, value, schemaType.slice(0, -2), true);
                  } else {
                    this.log?.putStruct(key, timestamp, value, schemaType, false);
                  }
                } else if (topic.type.startsWith(PHOTON_PREFIX)) {
                  let schemaType = topic.type.split(PHOTON_PREFIX)[1];
                  this.log?.putPhotonStruct(key, timestamp, value, schemaType);
                } else if (topic.type.startsWith(PROTO_PREFIX)) {
                  let schemaType = topic.type.split(PROTO_PREFIX)[1];
                  this.log?.putProto(key, timestamp, value, schemaType);
                } else {
                  this.log?.putRaw(key, timestamp, value);
                  if (CustomSchemas.has(topic.type)) {
                    try {
                      CustomSchemas.get(topic.type)!(this.log, key, timestamp, value);
                    } catch {
                      console.error('Failed to decode custom schema "' + topic.type + '"');
                    }
                    this.log.setGeneratedParent(key);
                  }
                }
                updated = true;
              } else {
                console.warn('Expected a raw value for "' + key + '" but got:', value);
              }
              break;
          }
          if (updated) {
            this.shouldRunOutputCallback = true;
          }
        },
        () => {
          // Connected
          this.setStatus(LiveDataSourceStatus.Active);
          this.log = new Log();
          this.shouldRunOutputCallback = true;
          if (!this.connectTime && this.client !== null) {
            this.connectTime = this.client.getClientTime_us();
          }
          if (this.akitMode) {
            this.noFieldsTimeout = setTimeout(() => {
              window.sendMainMessage("error", {
                title: "Problem with NT4 connection",
                content:
                  "No fields were received from the server. AdvantageKit mode is selected. Are you connecting to a server without AdvantageKit?"
              });
            }, 5000);
          }
        },
        () => {
          // Disconnected
          this.setStatus(LiveDataSourceStatus.Connecting);
          this.shouldRunOutputCallback = false;
          this.connectTime = null;
          if (this.noFieldsTimeout) clearTimeout(this.noFieldsTimeout);
        }
      );

      // Start connection
      this.client.connect();
    }
  }

  stop() {
    super.stop();
    this.client?.disconnect();
    if (this.periodicCallback !== null) clearInterval(this.periodicCallback);
  }

  getTuner() {
    if (this.client === null || this.log === null) {
      throw "Cannot create NT4 tuner before starting connection";
    } else {
      return new NT4Tuner(this.client, this.akitMode);
    }
  }

  /** Gets the name of the topic, depending on whether we're running in AdvantageKit mode. */
  private getKeyFromTopic(topic: NT4_Topic): string {
    if (this.akitMode) {
      if (topic.name.startsWith(AKIT_PREFIX)) {
        return topic.name.slice(AKIT_PREFIX.length);
      } else {
        return topic.name;
      }
    } else {
      return WPILOG_PREFIX + topic.name;
    }
  }

  private getLogType(ntType: string): LoggableType {
    switch (ntType) {
      case "boolean":
        return LoggableType.Boolean;
      case "int":
      case "float":
      case "double":
        return LoggableType.Number;
      case "string":
      case "json":
        return LoggableType.String;
      case "boolean[]":
        return LoggableType.BooleanArray;
      case "int[]":
      case "float[]":
      case "double[]":
        return LoggableType.NumberArray;
      case "string[]":
        return LoggableType.StringArray;
      default: // Default to raw
        return LoggableType.Raw;
    }
  }
}
