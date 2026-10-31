// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// The mock backend core: simulated producers -> ingestion (catalogue, latest-value cache,
// availability, rolling history) -> fan-out to sessions. Transport-free and clock-injectable,
// so tests can drive it tick by tick.

import type {
  AvailabilityOp,
  AvailabilityState,
  CatalogueRemoveOp,
  CatalogueSnapshotBody,
  CatalogueUpsertOp,
  HistoryResponse,
  IngressLink,
  SignalDescriptor,
  SimStatus,
  SimStatusOp,
  TelemetrySample,
  TimeQuality
} from "./contract.ts";
import { API_VERSION } from "./contract.ts";
import { HistoryBuffer, encodeInt64 } from "./history.ts";
import { Rng, hexId } from "./prng.ts";
import { type SampleCtx, type SignalDef, type Source, SOURCES, buildSignals, churnSignal } from "./signals.ts";
import { Track } from "./track.ts";
import { Vehicle } from "./vehicle.ts";

export const TICK_HZ = 100;
export const TICK_NS = 1_000_000_000n / BigInt(TICK_HZ);
const DT = 1 / TICK_HZ;

export interface BackendOptions {
  seed: number;
  speed: number;
  dropRate: number;
  duplicate: boolean;
  faultDemo: boolean;
  staleTest: boolean;
  staleSource: Source;
  catalogueChurn: boolean;
  unsync: boolean;
  unsyncSource: Source;
  simClock: boolean;
  lapCounter: boolean;
  history: boolean;
  historySeconds: number;
  /** Fixes the Unix start time (ns) and boot nonce, making output bit-reproducible. */
  startTimeNs: bigint | null;
}

export const DEFAULT_OPTIONS: BackendOptions = {
  seed: 1,
  speed: 1,
  dropRate: 0,
  duplicate: false,
  faultDemo: false,
  staleTest: false,
  staleSource: "sbg-ins",
  catalogueChurn: false,
  unsync: false,
  unsyncSource: "ennoid-bms",
  simClock: false,
  lapCounter: false,
  history: true,
  historySeconds: 360,
  startTimeNs: null
};

/** stale-test schedule (sim seconds): source runs for ON, silent for OFF; offline after OFFLINE_AFTER. */
export const STALE_TEST = { period: 60, on: 30, offlineAfter: 4 };
/** catalogue-churn schedule (sim seconds): register at cycle start, remove after LIFE. */
export const CHURN = { period: 40, start: 10, life: 20 };

/** Anything that wants backend events (a WebSocket session). */
export interface BackendListener {
  onSample(s: TelemetrySample): void;
  onCatalogue(op: CatalogueUpsertOp | CatalogueRemoveOp): void;
  onAvailability(op: AvailabilityOp): void;
  onSimStatus(op: SimStatusOp): void;
  flush(force?: boolean): void;
}

interface Avail {
  state: AvailabilityState;
  lastSeenNs: bigint | null; // t_ns of newest sample
  lastSeenTick: number | null;
}

function wallNowNs(): bigint {
  return BigInt(Math.round((performance.timeOrigin + performance.now()) * 1000)) * 1000n;
}

export class MockBackend {
  readonly opts: BackendOptions;
  readonly track = new Track();
  readonly epoch: string;
  revision = 0;
  readonly catalogue = new Map<string, SignalDescriptor>();
  private defs = new Map<string, SignalDef>();
  readonly latest = new Map<string, TelemetrySample>();
  private history = new Map<string, HistoryBuffer>();
  private avail = new Map<string, Avail>();
  private seqs = new Map<string, number>();
  private listeners = new Set<BackendListener>();

  private vehicle!: Vehicle;
  private rng!: Rng; // value noise
  private dropRng: Rng;
  private linkRng: Rng;
  private bootNonce: string;
  readonly startNs: bigint;
  tick = 0;
  resetCount = 0;
  paused = false;
  streamIds: Record<string, string> = {};
  private canFrames = 0;
  private messages: string[] = [];
  private churnActive: string | null = null;
  private sourceDown = false;
  /** Counters for diagnostics/tests. */
  stats = { produced: 0, dropped: 0, delivered: 0 };

  private timer: ReturnType<typeof setInterval> | null = null;
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor(opts: Partial<BackendOptions> = {}) {
    this.opts = { ...DEFAULT_OPTIONS, ...opts };
    const now = wallNowNs();
    this.startNs = this.opts.startTimeNs ?? (now / 1_000_000_000n) * 1_000_000_000n;
    this.bootNonce = this.opts.startTimeNs !== null ? this.opts.startTimeNs.toString() : now.toString();
    this.epoch = `epoch-${hexId(`${this.opts.seed}:${this.bootNonce}:epoch`, 8)}`;
    this.dropRng = new Rng(this.opts.seed ^ 0xd209);
    this.linkRng = new Rng(this.opts.seed ^ 0x1196);
    this.initRun();
    for (const d of buildSignals({ lapCounter: this.opts.lapCounter })) this.register(d, false);
  }

  /** (Re)initialises the simulated run: vehicle, noise RNG, stream ids, seq counters. */
  private initRun(): void {
    this.tick = 0;
    this.vehicle = new Vehicle(this.track, this.opts.seed);
    this.rng = new Rng(this.opts.seed);
    this.canFrames = 0;
    this.messages = [];
    this.sourceDown = false;
    this.streamIds = {};
    for (const src of SOURCES) {
      this.streamIds[src] = `${src}-${hexId(`${this.opts.seed}:${this.bootNonce}:${this.resetCount}:${src}`, 6)}`;
    }
    this.seqs.clear();
    // rebuild per-sensor state but keep descriptors (identical -> no catalogue events)
    for (const d of buildSignals({ lapCounter: this.opts.lapCounter })) {
      if (this.defs.has(d.desc.path)) this.defs.set(d.desc.path, d);
    }
  }

  // ------------------------------------------------------------------------------- catalogue

  private register(def: SignalDef, broadcast = true): void {
    const path = def.desc.path;
    this.defs.set(path, def);
    const desc: SignalDescriptor = this.opts.simClock ? { ...def.desc, clock_domain: "sim" } : { ...def.desc };
    this.catalogue.set(path, desc);
    this.revision++;
    if (!this.history.has(path) || this.history.get(path)!.type !== desc.type) {
      const rate = def.rateHz ?? 2;
      this.history.set(path, new HistoryBuffer(desc.type, rate * this.opts.historySeconds * 1.05 + 32));
    }
    if (!this.avail.has(path)) this.avail.set(path, { state: "offline", lastSeenNs: null, lastSeenTick: null });
    if (broadcast) {
      const op: CatalogueUpsertOp = {
        op: "catalogue_upsert",
        catalogue_epoch: this.epoch,
        revision: this.revision,
        signal: desc
      };
      for (const l of this.listeners) l.onCatalogue(op);
    }
  }

  private unregister(path: string): void {
    if (!this.catalogue.delete(path)) return;
    this.defs.delete(path);
    this.latest.delete(path);
    this.avail.delete(path);
    this.revision++;
    const op: CatalogueRemoveOp = {
      op: "catalogue_remove",
      catalogue_epoch: this.epoch,
      revision: this.revision,
      path
    };
    for (const l of this.listeners) l.onCatalogue(op);
  }

  snapshot(): CatalogueSnapshotBody {
    return {
      api_version: API_VERSION,
      catalogue_epoch: this.epoch,
      revision: this.revision,
      clock_domain: this.opts.simClock ? "sim" : "unix",
      signals: [...this.catalogue.values()]
    };
  }

  availabilityAll(): AvailabilityOp[] {
    const out: AvailabilityOp[] = [];
    for (const path of this.catalogue.keys()) out.push(this.availOp(path));
    return out;
  }

  private availOp(path: string): AvailabilityOp {
    const a = this.avail.get(path)!;
    return {
      op: "availability",
      path,
      state: a.state,
      last_seen_ns: a.lastSeenNs === null ? null : a.lastSeenNs.toString()
    };
  }

  private setAvail(path: string, state: AvailabilityState): void {
    const a = this.avail.get(path);
    if (!a || a.state === state) return;
    a.state = state;
    const op = this.availOp(path);
    for (const l of this.listeners) l.onAvailability(op);
  }

  // ------------------------------------------------------------------------------- listeners

  addListener(l: BackendListener): void {
    this.listeners.add(l);
  }
  removeListener(l: BackendListener): void {
    this.listeners.delete(l);
  }
  flushAll(force = false): void {
    for (const l of this.listeners) l.flush(force);
  }

  // ------------------------------------------------------------------------------- time

  simTimeNs(): bigint {
    return BigInt(this.tick) * TICK_NS;
  }

  /** t_ns of the current tick in the server's clock domain (before any unsync skew). */
  nowNs(): bigint {
    return this.opts.simClock ? this.simTimeNs() : this.startNs + this.simTimeNs();
  }

  simStatus(): SimStatus {
    return {
      clock_domain: this.opts.simClock ? "sim" : "unix",
      state: this.paused ? "paused" : "running",
      sim_time_ns: this.simTimeNs().toString(),
      reset_count: this.resetCount,
      stream_ids: { ...this.streamIds },
      speed: this.opts.speed
    };
  }

  private broadcastSim(reason: SimStatusOp["reason"]): void {
    const op: SimStatusOp = { op: "sim_status", reason, ...this.simStatus() };
    for (const l of this.listeners) l.onSimStatus(op);
  }

  pause(): void {
    if (this.paused) return;
    this.flushAll(true);
    this.paused = true;
    this.broadcastSim("pause");
  }
  resume(): void {
    if (!this.paused) return;
    this.paused = false;
    this.lastRealMs = performance.now();
    this.carryTicks = 0;
    this.broadcastSim("resume");
  }
  /** Sim time jumps back to 0; every source gets a new stream_id and seq restarts. */
  reset(): void {
    this.flushAll(true);
    this.resetCount++;
    this.initRun();
    this.latest.clear();
    for (const a of this.avail.values()) a.lastSeenTick = 0;
    if (this.churnActive) this.unregister(this.churnActive);
    this.churnActive = null;
    this.lastRealMs = performance.now();
    this.carryTicks = 0;
    this.broadcastSim("reset");
  }

  // ------------------------------------------------------------------------------- simulation

  /** Advances the simulation by n ticks (ignores pause; the real-time loop respects it). */
  advance(n = 1): void {
    for (let i = 0; i < n; i++) this.step();
  }

  private step(): void {
    const v = this.vehicle;
    if (this.tick > 0) v.step(DT);
    const st = v.state;
    if (st.events.length) {
      this.messages.push(...st.events);
      st.events.length = 0;
    }
    const tSec = this.tick * DT;
    this.canFrames += 24; // ~2400 frames/s across both buses

    this.scheduleTestModes(tSec);

    const tTrue = this.nowNs();
    const ctx: SampleCtx = {
      st,
      track: this.track,
      rng: this.rng,
      tSec,
      utcNs: this.startNs + this.simTimeNs(),
      canFrames: this.canFrames,
      messages: this.messages
    };

    for (const [path, def] of this.defs) {
      const rate = def.rateHz;
      if (rate !== null && this.tick % Math.max(1, Math.round(TICK_HZ / rate)) !== 0) continue;
      const src = def.desc.source as Source;
      if (this.opts.staleTest && this.sourceDown && src === this.opts.staleSource) continue;
      let value = def.read(ctx);
      // 10 seconds normal, 10 seconds fault, then recovery (latches remain visible).
      if (this.opts.faultDemo && this.tick >= 1000 && this.tick < 2000) {
        if (path.endsWith("/motor_temperature")) value = 373.15;
        if (path.endsWith("/temperature_max")) value = 338.15;
        if (path.endsWith("/imd_state")) value = 4;
      }
      if (value === undefined) continue;
      this.produce(path, def.desc, src, tTrue, value);
    }
    this.messages.length = 0;
    this.checkAvailability();
    this.tick++;
  }

  private scheduleTestModes(tSec: number): void {
    if (this.opts.staleTest) {
      const phase = tSec % STALE_TEST.period;
      const down = phase >= STALE_TEST.on;
      if (down !== this.sourceDown) {
        this.sourceDown = down;
        this.messages.push(`${this.opts.staleSource} ${down ? "stopped" : "resumed"} (stale-test)`);
      }
      if (down && phase - STALE_TEST.on >= STALE_TEST.offlineAfter) {
        // producer known disconnected (e.g. its heartbeat/LWT): offline
        for (const [path, d] of this.catalogue) if (d.source === this.opts.staleSource) this.setAvail(path, "offline");
      }
    }
    if (this.opts.catalogueChurn) {
      const cycle = Math.floor(tSec / CHURN.period);
      const phase = tSec - cycle * CHURN.period;
      if (!this.churnActive && phase >= CHURN.start && phase < CHURN.start + CHURN.life) {
        const def = churnSignal(cycle);
        this.register(def);
        this.churnActive = def.desc.path;
        this.messages.push(`Registered ${def.desc.path} (catalogue-churn)`);
      } else if (this.churnActive && (phase >= CHURN.start + CHURN.life || phase < CHURN.start)) {
        this.messages.push(`Removed ${this.churnActive} (catalogue-churn)`);
        this.unregister(this.churnActive);
        this.churnActive = null;
      }
    }
  }

  private produce(path: string, desc: SignalDescriptor, src: Source, tTrue: bigint, raw: unknown): void {
    const streamId = this.streamIds[src];
    const seq = this.seqs.get(path) ?? 0;
    this.seqs.set(path, seq + 1);
    this.stats.produced++;
    // link loss: the seq is consumed at the producer, so drops show up as gaps
    if (this.opts.dropRate > 0 && this.dropRng.next() < this.opts.dropRate) {
      this.stats.dropped++;
      return;
    }
    let tNs = tTrue;
    let tq: TimeQuality;
    if (this.opts.unsync && src === this.opts.unsyncSource) {
      // free-running source clock: 1.734 s offset plus 80 ppm drift
      tNs = tTrue + 1_734_000_000n + (this.simTimeNs() * 80n) / 1_000_000n;
      tq = "unsynchronised";
    } else if (this.opts.simClock || src === "sbg-ins" || src === "autonomy") {
      tq = "synchronised"; // sim clock / GNSS-disciplined
    } else {
      tq = "estimated"; // stamped on reception at the car gateway
    }
    let value: unknown = raw;
    if (desc.type === "int64") value = encodeInt64(BigInt(raw as number | string));
    const primaryLink: IngressLink = this.opts.simClock ? "lan" : this.opts.duplicate ? "rf" : "cellular";
    const sample: TelemetrySample = {
      path,
      stream_id: streamId,
      seq,
      t_ns: tNs.toString(),
      received_ns: this.receivedNs(tTrue, 8, 40),
      time_quality: tq,
      ingress_link: primaryLink,
      value
    };
    this.ingest(sample);
    if (this.opts.duplicate) {
      // the same measurement arriving again over the cellular link, later
      const dup: TelemetrySample = {
        ...sample,
        ingress_link: "cellular",
        received_ns: this.receivedNs(tTrue, 60, 180)
      };
      for (const l of this.listeners) l.onSample(dup);
    }
  }

  private receivedNs(tTrue: bigint, loMs: number, hiMs: number): string {
    const lat = BigInt(Math.round(this.linkRng.range(loMs, hiMs) * 1e6));
    if (this.opts.simClock) return (wallNowNs() + lat).toString();
    return (tTrue + lat).toString();
  }

  /** Ingestion: history, latest-value cache, availability, fan-out. */
  private ingest(s: TelemetrySample): void {
    if (!this.catalogue.has(s.path)) return;
    if (this.opts.history) this.history.get(s.path)?.push(s);
    const prev = this.latest.get(s.path);
    // old/out-of-order samples must not overwrite newer values
    if (!prev || prev.stream_id !== s.stream_id || prev.seq < s.seq) this.latest.set(s.path, s);
    const a = this.avail.get(s.path)!;
    a.lastSeenNs = BigInt(s.t_ns);
    a.lastSeenTick = this.tick;
    if (a.state !== "online") this.setAvail(s.path, "online");
    for (const l of this.listeners) l.onSample(s);
  }

  private checkAvailability(): void {
    for (const [path, a] of this.avail) {
      if (a.state !== "online" || a.lastSeenTick === null) continue;
      const desc = this.catalogue.get(path)!;
      if ((this.tick - a.lastSeenTick) * DT * 1000 > desc.stale_after_ms) this.setAvail(path, "stale");
    }
  }

  // ------------------------------------------------------------------------------- history

  queryHistory(
    path: string,
    fromNs: bigint | null,
    toNs: bigint | null,
    maxPoints: number,
    streamId?: string
  ): HistoryResponse | null {
    const buf = this.history.get(path);
    if (!buf || !this.catalogue.has(path)) return null;
    return buf.query(path, fromNs, toNs, maxPoints, streamId);
  }

  // ------------------------------------------------------------------------------- real-time loop

  private lastRealMs = 0;
  private carryTicks = 0;

  start(flushIntervalMs = 10): void {
    this.lastRealMs = performance.now();
    this.advance(1); // tick 0: every signal emits once
    this.timer = setInterval(() => this.pump(), 5);
    this.flushTimer = setInterval(() => this.flushAll(), flushIntervalMs);
  }

  private pump(): void {
    const now = performance.now();
    const elapsed = now - this.lastRealMs;
    this.lastRealMs = now;
    if (this.paused) return;
    this.carryTicks += (elapsed / 1000) * TICK_HZ * this.opts.speed;
    let n = Math.floor(this.carryTicks);
    this.carryTicks -= n;
    if (n > 200) n = 200; // don't spiral if the process stalls
    this.advance(n);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.timer = this.flushTimer = null;
  }
}
