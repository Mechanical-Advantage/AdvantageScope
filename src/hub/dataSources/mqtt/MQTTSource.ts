// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import type { MqttClient } from "mqtt";
import mqtt from "mqtt/dist/mqtt.esm";
import Log from "../../../shared/log/Log";
import { LiveDataSource, LiveDataSourceStatus } from "../LiveDataSource";
import { BackendState, Freshness, LiveStatusProvider, LiveStatusSummary } from "../LiveStatus";
import { LiveClock, SessionTimeBase } from "../mur/MURTime";
import { DEFAULT_MQTT_SETTINGS, mqttCredentials, normaliseMQTTSettings } from "./MQTTConfig";
import { mqttMetadata, parseMQTTPayload } from "./MQTTPayload";

/** Direct broker debug connection. All transport is WebSocket, including Electron. */
export default class MQTTSource extends LiveDataSource implements LiveStatusProvider {
  private client: MqttClient | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private backend: BackendState = "connecting";
  private detail = "Connecting to broker";
  private retryAttempt = 0;
  private retryAt = 0;
  private lastReceipt: number | null = null;
  private receivingAgainUntil = 0;
  private receipts = new Map<string, { time: number; approximate: boolean }>();
  private types = new Map<string, string>();
  private timeBase = new SessionTimeBase();
  private clock = new LiveClock();
  private dirty = false;

  connect(
    address: string,
    status: (status: LiveDataSourceStatus) => void,
    output: (log: Log, time: () => number) => void
  ) {
    super.connect(address, status, output);
    this.log = new Log();
    const settings = normaliseMQTTSettings(window.preferences?.mqttConnections?.[address] ?? DEFAULT_MQTT_SETTINGS);
    const credentials = mqttCredentials.get(address);
    this.client = mqtt.connect(address, {
      reconnectPeriod: 0,
      connectTimeout: 10000,
      clean: true,
      username: credentials?.username || undefined,
      password: credentials?.password || undefined
    });
    const client = this.client;
    client.on("connect", () => {
      if (this.status === LiveDataSourceStatus.Stopped) return;
      client.subscribe(settings.topic, (error, granted) => {
        if (this.status === LiveDataSourceStatus.Stopped) return;
        if (error || !granted?.length || granted.some((g) => g.qos === 128)) {
          this.detail = "Broker rejected subscription: " + (error?.message ?? settings.topic);
          this.backend = "error";
          this.setStatus(LiveDataSourceStatus.Error);
          client.end(true);
          return;
        }
        this.backend = "connected";
        this.detail = "Broker connected · " + settings.topic;
        if (this.retryAttempt) this.receivingAgainUntil = Date.now() + 3000;
        this.retryAttempt = 0;
        this.setStatus(LiveDataSourceStatus.Active);
      });
    });
    client.on("error", (error) => {
      this.detail = "Broker: " + error.message;
      this.backend = "error";
      this.setStatus(LiveDataSourceStatus.Error);
    });
    client.on("close", () => {
      if (this.status === LiveDataSourceStatus.Stopped) return;
      this.backend = "error";
      if (!this.detail.startsWith("Broker:")) this.detail = "Broker disconnected";
      this.setStatus(LiveDataSourceStatus.Error);
      if (this.retryTimer !== null) return;
      const delay = Math.min(30000, 500 * 2 ** Math.min(this.retryAttempt++, 6));
      this.retryAt = Date.now() + delay;
      this.retryTimer = setTimeout(() => {
        this.retryTimer = null;
        this.backend = "connecting";
        this.detail = "Reconnecting to broker";
        client.reconnect();
      }, delay);
    });
    client.on("message", (topic, payload) => {
      if (this.status === LiveDataSourceStatus.Stopped || !this.log) return;
      const now = Date.now();
      const receivedNs = (BigInt(now) * 1000000n).toString();
      for (const sample of parseMQTTPayload(topic, payload, settings)) {
        const path = sample.path;
        const type = sample.value instanceof Uint8Array ? "raw" : typeof sample.value;
        // A malformed publisher cannot reinterpret a field's existing history.
        if (this.types.has(path) && this.types.get(path) !== type) continue;
        const time = this.timeBase.sampleTime({
          t_ns: sample.tNs ?? receivedNs,
          received_ns: receivedNs,
          time_quality: sample.tNs === null ? "unsynchronised" : "synchronised"
        });
        if (!time || time.seconds < 0) continue;
        if (!this.types.has(path)) {
          this.types.set(path, type);
        }
        if (typeof sample.value === "number") this.log.putNumber(path, time.seconds, sample.value);
        else if (typeof sample.value === "boolean") this.log.putBoolean(path, time.seconds, sample.value);
        else if (typeof sample.value === "string") this.log.putString(path, time.seconds, sample.value);
        else this.log.putRaw(path, time.seconds, sample.value);
        const metadata = sample.metadata ?? mqttMetadata(path);
        if (metadata && !this.log.getMetadataString(path)) this.log.setMetadataString(path, JSON.stringify(metadata));
        this.receipts.set(path, { time: now, approximate: time.approximate });
        this.lastReceipt = now;
        this.clock.observe(time.seconds, now);
        this.dirty = true;
      }
    });
    this.timer = setInterval(() => {
      if (!this.dirty || !this.log) return;
      this.dirty = false;
      this.outputCallback?.(this.log, () => this.clock.now(Date.now()) ?? 0);
    }, 50);
  }
  stop() {
    super.stop();
    if (this.timer !== null) clearInterval(this.timer);
    if (this.retryTimer !== null) clearTimeout(this.retryTimer);
    this.client?.end(true);
    this.client?.removeAllListeners();
    this.client = null;
  }
  getStatusProvider(): LiveStatusProvider {
    return this;
  }
  getFieldAge(key: string): number | null {
    const receipt = this.receipts.get(key.replace(/^\//, ""));
    return receipt ? Math.max(0, (Date.now() - receipt.time) / 1000) : null;
  }
  getFieldFreshness(key: string): Freshness | null {
    const age = this.getFieldAge(key);
    return age === null ? null : this.backend !== "connected" || age > 5 ? "offline" : age > 1 ? "stale" : "online";
  }
  isFieldUnsynchronised(key: string): boolean {
    const receipt = this.receipts.get(key.replace(/^\//, ""));
    return !!receipt?.approximate && Date.now() - receipt.time < 5000;
  }
  getLiveStatus(): LiveStatusSummary {
    return {
      backend: this.backend,
      backendDetail: this.detail,
      viewedRun: 0,
      runCount: 1,
      hasFreshData: Array.from(this.receipts.keys()).some((key) => this.getFieldFreshness(key) === "online")
    };
  }
}
