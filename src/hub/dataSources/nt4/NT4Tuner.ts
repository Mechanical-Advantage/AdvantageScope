import LoggableType from "../../../shared/log/LoggableType";
import LiveDataTuner from "../LiveDataTuner";
import { NT4_Client } from "./NT4";
import { AKIT_PREFIX, WPILOG_PREFIX } from "./NT4Source";

export default class NT4Tuner implements LiveDataTuner {
  private client: NT4_Client;

  constructor(client: NT4_Client) {
    this.client = client;
  }

  isTunable(key: string): boolean {
    const remoteKey = this.getRemoteKey(key);
    const type = window.log.getType(key);
    return (
      (type === LoggableType.Number || type === LoggableType.Boolean) &&
      !remoteKey.startsWith(AKIT_PREFIX) &&
      !window.log.isGenerated(key)
    );
  }

  publish(key: string, value: number | boolean): void {
    if (!this.isTunable(key)) return;
    const remoteKey = this.getRemoteKey(key);
    const type = window.log.getWpilibType(key);
    if (type === null) return;
    this.client.publishTopic(remoteKey, type);
    if (typeof value === "number") {
      this.client.addSample(remoteKey, type.startsWith("int") ? Math.floor(value) : value);
    } else {
      this.client.addSample(remoteKey, value);
    }
  }

  unpublish(key: string): void {
    const remoteKey = this.getRemoteKey(key);
    this.client.unpublishTopic(remoteKey);
  }

  private getRemoteKey(key: string): string {
    return key.slice(WPILOG_PREFIX.length);
  }
}
