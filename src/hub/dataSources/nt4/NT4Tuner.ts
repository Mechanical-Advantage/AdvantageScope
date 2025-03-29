import LoggableType from "../../../shared/log/LoggableType";
import LiveDataTuner from "../LiveDataTuner";
import { NT4_Client } from "./NT4";
import { AKIT_PREFIX, AKIT_TUNING_PREFIX, WPILOG_PREFIX } from "./NT4Source";

export default class NT4Tuner implements LiveDataTuner {
  private client: NT4_Client;
  private akitMode: boolean;

  constructor(client: NT4_Client, akitMode: boolean) {
    this.client = client;
    this.akitMode = akitMode;
  }

  hasTunableFields(): boolean {
    if (this.akitMode) {
      return !window.log.getFieldKeys().every((key) => !key.startsWith(AKIT_TUNING_PREFIX));
    } else {
      return true;
    }
  }

  isTunable(key: string): boolean {
    const remoteKey = this.getRemoteKey(key);
    const type = window.log.getType(key);
    return (
      (type === LoggableType.Number || type === LoggableType.Boolean) &&
      !remoteKey.startsWith(AKIT_PREFIX) &&
      (window.log.getField("NT:/Robot/DogLog/Options") === null || !remoteKey.startsWith("/Robot")) &&
      !window.log.isGenerated(key)
    );
  }

  publish(key: string, value: number | boolean): void {
    if (!this.isTunable(key)) return;
    const remoteKey = this.getRemoteKey(key);
    const type = window.log.getWpilibType(key);
    if (type === null) return;
    this.client.publishTopic(remoteKey, type);
    let timestamp = this.client.getServerTime_us();
    if (timestamp !== null) {
      if (typeof value === "number") {
        let cleanValue = type.startsWith("int") ? Math.floor(value) : value;
        this.client.addTimestampedSample(remoteKey, timestamp, cleanValue);
        window.log.putNumber(key, timestamp, cleanValue);
      } else {
        this.client.addTimestampedSample(remoteKey, timestamp, value);
        window.log.putBoolean(key, timestamp, value);
      }
    }
  }

  unpublish(key: string): void {
    const remoteKey = this.getRemoteKey(key);
    this.client.unpublishTopic(remoteKey);
  }

  private getRemoteKey(key: string): string {
    if (this.akitMode) {
      if (key.startsWith(AKIT_TUNING_PREFIX)) {
        return key;
      } else {
        return AKIT_PREFIX + key;
      }
    } else {
      return key.slice(WPILOG_PREFIX.length);
    }
  }
}
