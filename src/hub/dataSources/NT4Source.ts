import Log from "../../shared/log/Log";
import LoggableType from "../../shared/log/LoggableType";
import { checkArrayType } from "../../shared/util";
import { LiveDataSource, LiveDataSourceStatus } from "./LiveDataSource";
import { NT4_Client, NT4_Topic } from "./nt4/NT4";

export default class NT4Source extends LiveDataSource {
  private AKIT_PREFIX = "/AdvantageKit";

  private akitMode: boolean;
  private log: Log | null = null;
  private client: NT4_Client | null = null;

  private connectServerTime: number | null = null;
  private noFieldsTimeout: NodeJS.Timeout | null = null;

  constructor(akitMode: boolean) {
    super();
    this.akitMode = akitMode;
  }

  connect(
    address: string,
    statusCallback: (status: LiveDataSourceStatus) => void,
    outputCallback: (log: Log, timeSupplier: () => number) => void
  ) {
    super.connect(address, statusCallback, outputCallback);

    if (window.preferences == null) {
      this.setStatus(LiveDataSourceStatus.Error);
    } else {
      this.log = new Log();
      this.client = new NT4_Client(
        address,
        "AdvantageScope",
        (topic: NT4_Topic) => {
          // Announce
          if (!this.log) return;
          let type = this.getLogType(topic.type);
          if (type != null) {
            this.log.createBlankField(this.getKeyFromTopic(topic), type);
          }
          this.runOutputCallback();
        },
        (topic: NT4_Topic) => {
          // Unannounce
        },
        (topic: NT4_Topic, timestamp_us: number, value: unknown) => {
          // Data
          if (!this.log) return;

          if (this.noFieldsTimeout) clearTimeout(this.noFieldsTimeout);
          if (!this.connectServerTime && this.client != null) {
            this.connectServerTime = this.client.getServerTime_us();
          }

          let key = this.getKeyFromTopic(topic);
          let timestamp = Math.max(timestamp_us, this.connectServerTime == null ? 0 : this.connectServerTime) / 1000000;
          let type = this.getLogType(topic.type);

          let updated = false;
          if (type != null) {
            switch (type) {
              case LoggableType.Raw:
                if (value instanceof Uint8Array) {
                  this.log?.putRaw(key, timestamp, value);
                  updated = true;
                } else {
                  console.warn('Expected a raw value for "' + key + '" but got:', value);
                }
                break;
              case LoggableType.Boolean:
                if (typeof value === "boolean") {
                  this.log?.putBoolean(key, timestamp, value);
                  updated = true;
                } else {
                  console.warn('Expected a boolean value for "' + key + '" but got:', value);
                }
                break;
              case LoggableType.Number:
                if (typeof value === "number") {
                  this.log?.putNumber(key, timestamp, value);
                  updated = true;
                } else {
                  console.warn('Expected a number value for "' + key + '" but got:', value);
                }
                break;
              case LoggableType.String:
                if (typeof value === "string") {
                  this.log?.putString(key, timestamp, value);
                  updated = true;
                } else {
                  console.warn('Expected a string value for "' + key + '" but got:', value);
                }
                break;
              case LoggableType.BooleanArray:
                if (checkArrayType(value, "boolean")) {
                  this.log?.putBooleanArray(key, timestamp, value as boolean[]);
                  updated = true;
                } else {
                  console.warn('Expected a boolean[] value for "' + key + '" but got:', value);
                }
                break;
              case LoggableType.NumberArray:
                if (checkArrayType(value, "number")) {
                  this.log?.putNumberArray(key, timestamp, value as number[]);
                  updated = true;
                } else {
                  console.warn('Expected a number[] value for "' + key + '" but got:', value);
                }
                break;
              case LoggableType.StringArray:
                if (checkArrayType(value, "string")) {
                  this.log?.putStringArray(key, timestamp, value as string[]);
                  updated = true;
                } else {
                  console.warn('Expected a string[] value for "' + key + '" but got:', value);
                }
                break;
            }
          }
          if (updated) this.runOutputCallback();
        },
        () => {
          // Connected
          this.setStatus(LiveDataSourceStatus.Active);
          this.log = new Log();
          this.runOutputCallback();
          if (this.akitMode) {
            this.noFieldsTimeout = setTimeout(() => {
              window.sendMainMessage("error", {
                title: "Problem with NT4 connection",
                content:
                  "No fields were received from the server. AdvantageKit mode is selected. Are you connecting to a server without AdvantageKit?"
              });
            }, 500);
          }
        },
        () => {
          // Disconnected
          this.setStatus(LiveDataSourceStatus.Connecting);
          this.connectServerTime = null;
        }
      );
      this.client.connect();
      if (this.akitMode) {
        this.client?.subscribeAll([this.AKIT_PREFIX + "/"], true);
      } else {
        this.client?.subscribeAll(["/"], true);
      }
    }
  }

  stop() {
    super.stop();
    this.client?.disconnect();
  }

  /** Gets the name of the topic, depending on whether we're running in AdvantageKit mode. */
  private getKeyFromTopic(topic: NT4_Topic): string {
    if (this.akitMode) {
      return topic.name.slice(this.AKIT_PREFIX.length);
    } else {
      return topic.name;
    }
  }

  /** Triggers the output callback using the correct timestamp supplier. */
  private runOutputCallback() {
    if (!this.outputCallback || !this.log) return;
    this.outputCallback(this.log, () => {
      if (this.client) {
        let serverTime = this.client.getServerTime_us();
        if (serverTime === null) {
          return 10;
        } else {
          return serverTime / 1000000;
        }
      } else {
        return 10;
      }
    });
  }

  private getLogType(ntType: string): LoggableType | null {
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
      case "raw":
      case "rpc":
      case "msgpack":
      case "protobuf":
        return LoggableType.Raw;
      case "boolean[]":
        return LoggableType.BooleanArray;
      case "int[]":
      case "float[]":
      case "double[]":
        return LoggableType.NumberArray;
      case "string[]":
        return LoggableType.StringArray;
      default:
        return null;
    }
  }
}
