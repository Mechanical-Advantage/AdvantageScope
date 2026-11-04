// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// One live WebSocket client (spec 01 §5.2): hello/snapshot, subscriptions with replace
// semantics, max_rate_hz throttling (newest wins), batching, and bounded buffering.

import type {
  AvailabilityOp,
  CatalogueRemoveOp,
  CatalogueUpsertOp,
  ErrorOp,
  SamplesOp,
  ServerOp,
  SubscriptionAckOp,
  TelemetrySample
} from "../../../src/shared/mur/contract.ts";
import { API_VERSION } from "../../../src/shared/mur/contract.ts";
import type { BackendListener, MockBackend } from "./backend.ts";

export interface Transport {
  send(text: string): void;
  /** Bytes queued in the socket but not yet written. */
  bufferedAmount(): number;
}

export interface SessionOptions {
  nowMs: () => number;
  /** Unthrottled samples are batched for this long. */
  batchMs: number;
  /** Above this many buffered bytes the session stops sending and coalesces to latest-per-path. */
  highWaterBytes: number;
  /** Max queued samples per subscription before coalescing to latest-per-path. */
  maxQueue: number;
  maxSamplesPerMessage: number;
}

export const DEFAULT_SESSION_OPTIONS: SessionOptions = {
  nowMs: () => performance.now(),
  batchMs: 25,
  highWaterBytes: 1 << 20,
  maxQueue: 20_000,
  maxSamplesPerMessage: 2000
};

interface Subscription {
  id: string;
  paths: Set<string>;
  intervalMs: number | null; // null = unthrottled
  queue: TelemetrySample[]; // unthrottled
  pending: Map<string, TelemetrySample>; // throttled: newest wins
  lastSent: Map<string, number>; // throttled: wall ms
  lastBatch: number;
}

export class Session implements BackendListener {
  private backend: MockBackend;
  private transport: Transport;
  private opts: SessionOptions;
  private helloed = false;
  private subs = new Map<string, Subscription>();
  stats = { coalesced: 0, sentSamples: 0, sentMessages: 0 };

  constructor(backend: MockBackend, transport: Transport, opts: Partial<SessionOptions> = {}) {
    this.backend = backend;
    this.transport = transport;
    this.opts = { ...DEFAULT_SESSION_OPTIONS, ...opts };
    backend.addListener(this);
  }

  close(): void {
    this.backend.removeListener(this);
    this.subs.clear();
  }

  private send(op: ServerOp): void {
    this.stats.sentMessages++;
    this.transport.send(JSON.stringify(op));
  }

  private error(code: string, message: string, extra: Partial<ErrorOp> = {}): void {
    this.send({ op: "error", code, message, ...extra });
  }

  // ------------------------------------------------------------------------------- client ops

  handle(text: string): void {
    let msg: any;
    try {
      msg = JSON.parse(text);
    } catch {
      return this.error("bad_request", "Message is not valid JSON");
    }
    if (!msg || typeof msg !== "object" || typeof msg.op !== "string") {
      return this.error("bad_request", "Message must be an object with a string 'op'");
    }
    switch (msg.op) {
      case "hello":
        return this.onHello(msg);
      case "subscribe":
        if (!this.helloed)
          return this.error("hello_required", "Send hello before subscribe", { subscription_id: msg.subscription_id });
        return this.onSubscribe(msg);
      case "unsubscribe":
        if (!this.helloed)
          return this.error("hello_required", "Send hello before unsubscribe", {
            subscription_id: msg.subscription_id
          });
        return this.onUnsubscribe(msg);
      default:
        return this.error("unknown_op", `Unknown op: ${String(msg.op)}`);
    }
  }

  private onHello(msg: any): void {
    if (msg.api_version !== API_VERSION) {
      return this.error("unsupported_api_version", `Server supports api_version ${API_VERSION}`);
    }
    // a repeated hello restarts the session: fresh snapshot, no subscriptions
    this.subs.clear();
    this.helloed = true;
    this.send({ op: "catalogue_snapshot", ...this.backend.snapshot() });
    for (const a of this.backend.availabilityAll()) this.send(a);
  }

  private onSubscribe(msg: any): void {
    const id = msg.subscription_id;
    if (typeof id !== "string" || id.length === 0)
      return this.error("bad_request", "subscription_id must be a non-empty string");
    if (!Array.isArray(msg.paths) || msg.paths.some((p: unknown) => typeof p !== "string")) {
      return this.error("bad_request", "paths must be an array of strings", { subscription_id: id });
    }
    const rate = msg.max_rate_hz;
    if (rate !== undefined && rate !== null && !(typeof rate === "number" && rate > 0 && Number.isFinite(rate))) {
      return this.error("bad_request", "max_rate_hz must be a positive number or null", { subscription_id: id });
    }
    const accepted: string[] = [];
    const unknown: string[] = [];
    for (const p of new Set<string>(msg.paths)) (this.backend.catalogue.has(p) ? accepted : unknown).push(p);

    // atomic replace: anything queued for the old subscription is discarded
    const sub: Subscription = {
      id,
      paths: new Set(accepted),
      intervalMs: typeof rate === "number" ? 1000 / rate : null,
      queue: [],
      pending: new Map(),
      lastSent: new Map(),
      lastBatch: this.opts.nowMs()
    };
    this.subs.set(id, sub);

    const ack: SubscriptionAckOp = { op: "subscription_ack", subscription_id: id, accepted_paths: accepted };
    this.send(ack);
    if (unknown.length > 0) {
      this.error("unknown_signal", `Unknown path${unknown.length > 1 ? "s" : ""}: ${unknown.join(", ")}`, {
        subscription_id: id,
        paths: unknown
      });
    }
    if (msg.include_latest === true) {
      const latest: TelemetrySample[] = [];
      const now = this.opts.nowMs();
      for (const p of accepted) {
        const s = this.backend.latest.get(p);
        if (s) {
          latest.push(s);
          if (sub.intervalMs !== null) sub.lastSent.set(p, now);
        }
      }
      if (latest.length > 0) this.sendSamples(id, true, latest);
    }
  }

  private onUnsubscribe(msg: any): void {
    const id = msg.subscription_id;
    if (!this.subs.delete(id))
      this.error("unknown_subscription", `No subscription ${String(id)}`, { subscription_id: id });
  }

  // ------------------------------------------------------------------------------- backend events

  onSample(s: TelemetrySample): void {
    if (!this.helloed) return;
    for (const sub of this.subs.values()) {
      if (!sub.paths.has(s.path)) continue;
      if (sub.intervalMs !== null) {
        sub.pending.set(s.path, s);
      } else {
        sub.queue.push(s);
        if (sub.queue.length > this.opts.maxQueue) this.coalesce(sub);
      }
    }
  }

  onCatalogue(op: CatalogueUpsertOp | CatalogueRemoveOp): void {
    if (!this.helloed) return;
    if (op.op === "catalogue_remove") {
      // never deliver samples for a path after its remove event
      for (const sub of this.subs.values()) {
        sub.pending.delete(op.path);
        if (sub.queue.some((s) => s.path === op.path)) sub.queue = sub.queue.filter((s) => s.path !== op.path);
      }
    }
    this.send(op);
  }

  onAvailability(op: AvailabilityOp): void {
    if (this.helloed) this.send(op);
  }

  // ------------------------------------------------------------------------------- delivery

  /** Keep only the newest sample per path. */
  private coalesce(sub: Subscription): void {
    if (sub.queue.length === 0) return;
    const newest = new Map<string, TelemetrySample>();
    for (const s of sub.queue) newest.set(s.path, s);
    this.stats.coalesced += sub.queue.length - newest.size;
    sub.queue = [...newest.values()];
  }

  /** Sends due samples. `force` drains batches immediately and drops throttled leftovers. */
  flush(force = false): void {
    if (!this.helloed || this.subs.size === 0) return;
    if (this.transport.bufferedAmount() > this.opts.highWaterBytes) {
      // slow client: never buffer unboundedly, keep only the latest per path
      for (const sub of this.subs.values()) this.coalesce(sub);
      return;
    }
    const now = this.opts.nowMs();
    for (const sub of this.subs.values()) {
      const out: TelemetrySample[] = [];
      if (sub.intervalMs !== null && force) {
        sub.pending.clear();
      } else if (sub.intervalMs !== null) {
        for (const [path, s] of sub.pending) {
          const last = sub.lastSent.get(path);
          if (last === undefined || now - last >= sub.intervalMs - 1e-6) {
            out.push(s);
            sub.pending.delete(path);
            sub.lastSent.set(path, now);
          }
        }
      } else if (
        sub.queue.length > 0 &&
        (force || now - sub.lastBatch >= this.opts.batchMs || sub.queue.length >= this.opts.maxSamplesPerMessage)
      ) {
        out.push(...sub.queue);
        sub.queue = [];
        sub.lastBatch = now;
      }
      if (out.length > 0) this.sendSamples(sub.id, false, out);
    }
  }

  private sendSamples(id: string, initial: boolean, samples: TelemetrySample[]): void {
    const max = this.opts.maxSamplesPerMessage;
    for (let i = 0; i < samples.length; i += max) {
      const chunk = samples.slice(i, i + max);
      const op: SamplesOp = { op: "samples", subscription_id: id, initial, samples: chunk };
      this.stats.sentSamples += chunk.length;
      this.send(op);
    }
  }
}
