// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { FoxgloveClient } from "@foxglove/ws-protocol";
import Log from "../../../shared/log/Log";
import { LiveDataSource, LiveDataSourceStatus } from "../LiveDataSource";
import { SegmentTracker } from "../mur/MURSegments";
import { mapMessage, MappedChannel, registerChannel } from "./FoxgloveMapping";

export default class FoxgloveSource extends LiveDataSource {
  private client: FoxgloveClient | null = null;
  private channels = new Map<number, MappedChannel>();
  private subscriptions = new Map<number, number>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private reconnect: ReturnType<typeof setTimeout> | null = null;
  private segments = new SegmentTracker("sim", 0);
  private run = 0;
  private sequence = 0;
  private now = 0;
  private hasClock = false;
  connect(
    address: string,
    statusCallback: (status: LiveDataSourceStatus) => void,
    outputCallback: (log: Log, timeSupplier: () => number) => void
  ) {
    super.connect(address, statusCallback, outputCallback, false);
    this.log = new Log();
    this.open();
    this.timer = setInterval(() => this.periodic(), 100);
  }
  private open() {
    if (this.status === LiveDataSourceStatus.Stopped) return;
    const address = /^wss?:/.test(this.address!) ? this.address! : "ws://" + this.address;
    let socket: WebSocket;
    try {
      socket = new WebSocket(address, [FoxgloveClient.SUPPORTED_SUBPROTOCOL]);
    } catch {
      this.setStatus(LiveDataSourceStatus.Error);
      return;
    }
    this.channels.clear();
    this.subscriptions.clear();
    const client = new FoxgloveClient({ ws: socket });
    this.client = client;
    client.on("advertise", (channels) => {
      for (const channel of channels) {
        try {
          this.channels.set(channel.id, registerChannel(this.log!, channel));
        } catch (error) {
          this.log!.putString(channel.topic + "/error", this.now, String(error));
        }
      }
      this.setStatus(LiveDataSourceStatus.Active);
      this.publish();
      this.periodic();
    });
    client.on("unadvertise", (ids) => {
      for (const id of ids) {
        const sub = this.subscriptions.get(id);
        if (sub !== undefined) client.unsubscribe(sub);
        this.subscriptions.delete(id);
        this.channels.delete(id);
      }
    });
    client.on("time", (event) =>
      this.clock(Number(event.timestamp / 1_000_000_000n) + Number(event.timestamp % 1_000_000_000n) * 1e-9)
    );
    client.on("message", (event) => {
      const id = [...this.subscriptions].find(([, sub]) => sub === event.subscriptionId)?.[0];
      const mapped = id === undefined ? undefined : this.channels.get(id);
      if (!mapped || !this.log) return;
      const time = this.hasClock
        ? this.now
        : Number(event.timestamp / 1_000_000_000n) + Number(event.timestamp % 1_000_000_000n) * 1e-9;
      try {
        const data = event.data;
        const bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength).slice();
        const value = mapMessage(this.log, mapped, time, bytes);
        if (mapped.channel.topic === "/clock" && value?.clock)
          this.clock(Number(value.clock.sec) + Number(value.clock.nanosec) * 1e-9);
        else {
          this.now = time;
          this.publish();
        }
      } catch (error) {
        this.log.putString(mapped.channel.topic + "/error", time, String(error));
      }
    });
    client.on("error", () => this.setStatus(LiveDataSourceStatus.Error));
    client.on("close", () => {
      if (this.status === LiveDataSourceStatus.Stopped) return;
      this.setStatus(LiveDataSourceStatus.Error);
      this.setStatus(LiveDataSourceStatus.Connecting);
      this.reconnect = setTimeout(() => this.open(), 1000);
    });
  }
  private clock(time: number) {
    const decision = this.segments.observe("/clock", String(this.run), ++this.sequence, time);
    if (decision === "new-segment") {
      this.segments.startNewSegment();
      this.run++;
      this.log = new Log();
      for (const [id, mapped] of this.channels) this.channels.set(id, registerChannel(this.log, mapped.channel));
      this.segments.observe("/clock", String(this.run), ++this.sequence, time);
      this.now = time;
      this.publish();
      this.newSegmentCallback?.();
    }
    this.now = time;
    this.hasClock = true;
    this.log?.updateRangeWithTimestamp(time);
    this.publish();
  }
  private publish() {
    if (this.log) this.outputCallback?.(this.log, () => this.now);
  }
  private periodic() {
    if (!this.client || this.status !== LiveDataSourceStatus.Active || !this.log) return;
    const fields =
      window.log === this.log ? [...window.tabs.getActiveFields(), ...window.sidebar.getActiveFields()] : [];
    for (const [id, mapped] of this.channels) {
      const topic = mapped.channel.topic;
      const active = topic === "/clock" || fields.some((key) => key === topic || key.startsWith(topic + "/"));
      const sub = this.subscriptions.get(id);
      if (active && sub === undefined) this.subscriptions.set(id, this.client.subscribe(id));
      else if (!active && sub !== undefined) {
        this.client.unsubscribe(sub);
        this.subscriptions.delete(id);
      }
    }
  }
  stop() {
    super.stop();
    if (this.timer) clearInterval(this.timer);
    if (this.reconnect) clearTimeout(this.reconnect);
    this.client?.close();
    this.client = null;
  }
}
