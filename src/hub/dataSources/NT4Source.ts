import Log from "../../shared/log/Log";
import LoggableType from "../../shared/log/LoggableType";
import { checkArrayType } from "../../shared/util";
import { LiveDataSource, LiveDataSourceStatus } from "./LiveDataSource";
import { Transform3d, Translation3d, Rotation3d } from "../../shared/geometry";
import { NT4_Client, NT4_Topic } from "./nt4/NT4";
import { number } from "mathjs";

class TargetCorner {
  x: number = 0;
  y: number = 0;
}

class PhotonTrackedTarget {
  yaw: number = 0;
  pitch: number = 0;
  area: number = 0;
  skew: number = 0;
  fiducialId: number = 0;
  bestCameraToTarget: number[] = [];
  altCameraToTarget: number[] = [];
  poseAmbiguity: number = 0;
  minAreaRectCorners: TargetCorner[] = [];
  detectedCorners: TargetCorner[] = [];
}

class PhotonPipelineResult {
  latency: number = 0;
  timestamp: number = 0;
  targets: PhotonTrackedTarget[] = [];
}


export default class NT4Source extends LiveDataSource {
  private AKIT_PREFIX = "/AdvantageKit";

  private akitMode: boolean;
  private log: Log | null = null;
  private client: NT4_Client | null = null;

  private shouldRunOutputCallback = false;
  private connectServerTime: number | null = null;
  private noFieldsTimeout: NodeJS.Timeout | null = null;

  constructor(akitMode: boolean) {
    super();
    this.akitMode = akitMode;

    // Check periodically if output callback should be triggered
    // (prevents running the callback many times for each frame)
    this.shouldRunOutputCallback = false;
    setInterval(() => {
      if (
        !this.shouldRunOutputCallback ||
        this.status == LiveDataSourceStatus.Stopped ||
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

  connect(
    address: string,
    statusCallback: (status: LiveDataSourceStatus) => void,
    outputCallback: (log: Log, timeSupplier: () => number) => void
  ) {
    super.connect(address, statusCallback, outputCallback);
    this.shouldRunOutputCallback = false;

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
          this.shouldRunOutputCallback = true;
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
              case LoggableType.PhotonPacked2023_1_2:
                if (value instanceof Uint8Array) {
                  this.parsePhotonPacket(key, timestamp, value);
                  updated = true;
                } else {
                  console.warn('Expected a PhotonVision packed value for "' + key + '" but got:', value);
                }
            }
          }
          if (updated) this.shouldRunOutputCallback = true;
        },
        () => {
          // Connected
          this.setStatus(LiveDataSourceStatus.Active);
          this.log = new Log();
          this.shouldRunOutputCallback = true;
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
          this.connectServerTime = null;
        }
      );
      this.client.connect();
      if (this.akitMode) {
        this.client?.subscribe([this.AKIT_PREFIX + "/"], true, true, 0);
      } else {
        this.client?.subscribe(["/"], true, true, 0);
      }
    }
  }

  parseTransform3d(view: DataView, offset: number): number[] {
    let tx = view.getFloat64(offset);
    offset += 8;
    let ty = view.getFloat64(offset);
    offset += 8;
    let tz = view.getFloat64(offset);
    offset += 8;
    let qw = view.getFloat64(offset);
    offset += 8;
    let qx = view.getFloat64(offset);
    offset += 8;
    let qy = view.getFloat64(offset);
    offset += 8;
    let qz = view.getFloat64(offset);
    offset += 8;

    return [tx, ty, tz, qw, qx, qy, qz];
  }

  /**
   * 
   * @param key Base key for the entry
   * @param timestamp 
   * @param value Byte array coming in
   */
  parsePhotonPacket(key: string, timestamp: number, value: Uint8Array) {
    let view = new DataView(value.buffer, value.byteOffset, value.byteLength);
    
    let offset = 0;
    
    let result = new PhotonPipelineResult();

    result.latency = view.getFloat64(offset);
    result.timestamp = timestamp - result.latency;
    offset += 8;

    const numTargets = view.getInt8(offset);
    offset += 1

    result.targets = [];
    for (let i = 0; i < numTargets; i++) {
      let target = new PhotonTrackedTarget();
      target.yaw = view.getFloat64(offset);
      offset += 8;
      target.pitch = view.getFloat64(offset);
      offset += 8;
      target.area = view.getFloat64(offset);
      offset += 8;
      target.skew = view.getFloat64(offset);
      offset += 8;
      target.fiducialId = view.getInt32(offset);
      offset += 4;

      target.bestCameraToTarget = this.parseTransform3d(view, offset);
      offset += 7 * 8;
      target.altCameraToTarget = this.parseTransform3d(view, offset);
      offset += 7 * 8;
      target.poseAmbiguity = view.getFloat64(offset);
      offset += 8;

      target.minAreaRectCorners = [];
      for (let j = 0; j < 4; j++) {
        let x = view.getFloat64(offset);
        offset += 8;
        let y = view.getFloat64(offset);
        offset += 8;
        target.minAreaRectCorners.push({ x: x, y: y });
      }

      target.detectedCorners = [];
      const numCorners = view.getInt8(offset);
      offset += 1
      for (let j = 0; j < numCorners; j++) {
        let x = view.getFloat64(offset);
        offset += 8;
        let y = view.getFloat64(offset);
        offset += 8;
        target.detectedCorners.push({ x: x, y: y });
      }

      result.targets.push(target)
    }

    this.encodeResult(result, timestamp, key);
  }

  encodeResult(result: PhotonPipelineResult, timestamp: number, ntKey: string) {
    this.log?.putNumber(ntKey + "/latency", timestamp, result.latency)
    this.log?.putNumber(ntKey + "/timestamp", timestamp, result.timestamp)

    for (const [idx, target] of result.targets.entries()) {
      
      Object.entries(target)
        .forEach(([key, value]) => {
          if (typeof value == "number") {
            this.log?.putNumber(ntKey + `/target_${idx}/${key}` , timestamp, Number(value))
          }
          if (Array.isArray(value)) {
            if (typeof value[0] == "number") {
              this.log?.putNumberArray(ntKey+ `/target_${idx}/${key}` , timestamp, value)
            } else if (typeof value[0] == "object") {
              let xArray: number[] = [];
              let yArray: number[] = [];
              value.forEach(it => { xArray.push(it.x); yArray.push(it.y); })
              this.log?.putNumberArray(ntKey + `/target_${idx}/${key}_x` , timestamp, xArray)
              this.log?.putNumberArray(ntKey + `/target_${idx}/${key}_y` , timestamp, yArray)
            }
          }
        })

      // this.log?.putNumber(key + `/target_${idx}/yaw` , timestamp, target.yaw)
      // this.log?.putNumber(key + `/target_${idx}/pitch` , timestamp, target.pitch)
      // this.log?.putNumberArray(key + `/target_${idx}/bestPose` , timestamp, target.bestCameraToTarget)
      // this.log?.putNumberArray(key + `/target_${idx}/altPose` , timestamp, target.altCameraToTarget)
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
      case "rawBytes":
        return LoggableType.PhotonPacked2023_1_2;
      default:
        return null;
    }
  }
}
