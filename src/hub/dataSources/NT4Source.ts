import Log from "../../shared/log/Log";
import LoggableType from "../../shared/log/LoggableType";
import { checkArrayType } from "../../shared/util";
import { LiveDataSource, LiveDataSourceStatus } from "./LiveDataSource";
import { NT4_Client, NT4_Topic } from "./NT4";
import CustomSchemas from "./schema/CustomSchemas";

export default class NT4Source extends LiveDataSource {
  private WPILOG_PREFIX = "NT:";
  private AKIT_PREFIX = "/AdvantageKit";

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

    this.periodicCallback = setInterval(() => {
      // Update timestamp range based on connection time
      this.clearTimestampsBeforeConnection();

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
              [this.akitMode ? this.AKIT_PREFIX + "/" : "/"],
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
              [this.akitMode ? this.AKIT_PREFIX + "/" : "/"],
              true
            );
          }

          // Add active fields
          let activeFields: Set<string> = new Set();
          if (window.log === this.log) {
            [
              "/.schema",
              ...(this.akitMode ? [] : [this.WPILOG_PREFIX + this.AKIT_PREFIX + "/.schema"]),
              ...window.tabs.getActiveFields(),
              ...window.sidebar.getActiveFields()
            ].forEach((key) => {
              // Compare to announced keys
              window.log.getFieldKeys().forEach((announcedKey) => {
                if (window.log.isGenerated(announcedKey) || window.log.getType(announcedKey) === LoggableType.Empty) {
                  return;
                }
                let subscribeKey: string | null = null;
                if (announcedKey.startsWith(key)) {
                  subscribeKey = key;
                } else if (key.startsWith(announcedKey)) {
                  subscribeKey = announcedKey;
                }
                if (subscribeKey !== null) {
                  if (akitMode) {
                    activeFields.add(this.AKIT_PREFIX + subscribeKey);
                  } else {
                    activeFields.add(subscribeKey.slice(this.WPILOG_PREFIX.length));
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
    }, 1000 / 60);
  }

  /** If the connection is active and the server connection time is known,
   * clear data before that time. This prevents topics that haven't been
   * updated for a while from altering the timestamp range. */
  private clearTimestampsBeforeConnection() {
    if (this.client !== null && this.connectTime !== null) {
      let connectServerTime = this.client.getServerTime_us(this.connectTime);
      if (connectServerTime !== null) window.log.clearBeforeTime(connectServerTime / 1e6);
    }
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
          this.log.createBlankField(modifiedKey, this.getLogType(topic.type));
          this.log.setWpilibType(modifiedKey, topic.type);
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
                if (topic.type.startsWith("struct:")) {
                  let schemaType = topic.type.split("struct:")[1];
                  if (schemaType.endsWith("[]")) {
                    this.log?.putStruct(key, timestamp, value, schemaType.slice(0, -2), true);
                  } else {
                    this.log?.putStruct(key, timestamp, value, schemaType, false);
                  }
                } else if (topic.type.startsWith("proto:")) {
                  let schemaType = topic.type.split("proto:")[1];
                  this.log?.putProto(key, timestamp, value, schemaType);
                } else {
                  this.log?.putRaw(key, timestamp, value);
                  if (CustomSchemas.has(topic.type)) {
                    CustomSchemas.get(topic.type)!(this.log, key, timestamp, value);
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
            this.clearTimestampsBeforeConnection();
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

  /** Gets the name of the topic, depending on whether we're running in AdvantageKit mode. */
  private getKeyFromTopic(topic: NT4_Topic): string {
    if (this.akitMode) {
      return topic.name.slice(this.AKIT_PREFIX.length);
    } else {
      return this.WPILOG_PREFIX + topic.name;
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
