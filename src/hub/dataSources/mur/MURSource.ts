// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Live source for the MUR telemetry backend (spec 01 §5: HTTP catalogue/history + WebSocket live), with the
// sim clock extensions from spec 02 §4/§6. Contract types come from tools/mock-backend/src/contract.ts.
//
// - Catalogue: hello -> catalogue_snapshot builds the tree; upserts/removes update it live. The descriptor
//   unit goes into field metadata so Log.getUnit and unit conversion work (MURLogAdapter).
// - Subscriptions: one subscription ("mur-voir-active") holding exactly the active fields of the tabs and
//   sidebar, replaced atomically whenever that set changes (same diff as NT4Source.periodic()).
// - History: fetched when a field becomes active in a tab; 501 is remembered and shown in the status pill.
// - Dedup on (path, stream_id, seq) (MURDedup). Time: BigInt session-relative seconds (MURTime).
// - Segments: a sim reset or clock rewind starts a new segment (MURSegments): the Log is replaced and the hub
//   resets the selection, so the new run never mixes with the old one.
// - Reconnect: automatic with backoff; fresh snapshot, then the subscription is replayed by periodic().

import type {
  AvailabilityState,
  CatalogueSnapshotOp,
  ClockDomain,
  HistoryResponse,
  ServerOp,
  SignalDescriptor,
  SimStatus,
  SimStatusOp,
  TelemetrySample
} from "../../../../tools/mock-backend/src/contract";
import Log from "../../../shared/log/Log";
import { LiveDataSource, LiveDataSourceStatus } from "../LiveDataSource";
import { BackendState, Freshness, LiveStatusProvider, LiveStatusSummary, SimAction } from "../LiveStatus";
import { SampleDeduplicator } from "./MURDedup";
import {
  createField,
  deleteField,
  getLayoutSignature,
  getMetadataString,
  keyToPath,
  writeValue
} from "./MURLogAdapter";
import { RetainedRuns, SegmentTracker } from "./MURSegments";
import { LiveClock, SessionTimeBase } from "./MURTime";

const API_VERSION = 1;
const SUBSCRIPTION_ID = "mur-voir-active";
const MAX_RATE_HZ = 50;
const HISTORY_MAX_POINTS = 2000;
const RECONNECT_MIN_MS = 500;
const RECONNECT_MAX_MS = 5000;
const UNSYNC_HOLD_MS = 3000; // How long a signal stays flagged after its last unsynchronised sample
const SIM_RESET_DISPLAY_MS = 3000; // How long the pill shows "reset"

/** Turns a user-entered address into an HTTP base URL ("localhost:8090" -> "http://localhost:8090"). */
export function normaliseBaseUrl(address: string): string {
  let url = address.trim();
  if (url.startsWith("ws://")) url = "http://" + url.slice(5);
  if (url.startsWith("wss://")) url = "https://" + url.slice(6);
  if (!/^https?:\/\//.test(url)) url = "http://" + url;
  url = url.replace(/\/+$/, "");
  url = url.replace(/\/api\/v1(\/live)?$/, "");
  return url;
}

export default class MURSource extends LiveDataSource implements LiveStatusProvider {
  private baseUrl = "";
  private socket: WebSocket | null = null;
  private reconnectTimeout: number | null = null;
  private reconnectDelayMs = RECONNECT_MIN_MS;
  private periodicActive = false;
  private shouldRunOutputCallback = false;

  private runs = new RetainedRuns<Log>();
  private receiptTimes = new Map<string, number>();
  private lastReceipt: number | null = null;
  private retryAttempt = 0;
  private retryAt = 0;
  private receivingAgainUntil = 0;
  private backend: BackendState = "connecting";
  private backendDetail = "";

  private descriptors = new Map<string, SignalDescriptor>();
  private layouts = new Map<string, string>();
  private catalogue: { epoch: string; revision: number } | null = null;
  private availability = new Map<string, { state: AvailabilityState; lastSeenNs: string | null }>();
  private unsynchronised = new Map<string, number>(); // path -> wall time of the last unsynchronised sample

  private timeBase = new SessionTimeBase("unix");
  private clock = new LiveClock("unix");
  private dedup = new SampleDeduplicator();
  private segments = new SegmentTracker("unix");

  private subscribedPaths: string[] = [];
  private historyRequested = new Set<string>();
  private historyAvailable: boolean | null = null;

  private sim: SimStatus | null = null;
  private simControls = false;
  private simResetUntil = 0;

  connect(
    address: string,
    statusCallback: (status: LiveDataSourceStatus) => void,
    outputCallback: (log: Log, timeSupplier: () => number) => void
  ) {
    // The base class trims with clearBeforeTime(max(0, now - discard)), which pins the range start to 0 even
    // when the session starts later. Trim here instead, only once there is data older than the discard window.
    super.connect(address, statusCallback, outputCallback, false);
    this.baseUrl = normaliseBaseUrl(address);
    this.log = new Log();
    this.runs = new RetainedRuns<Log>();
    this.runs.append(this.log);
    this.openSocket();

    // Periodic subscription updates and output (same scheduling as NT4Source)
    this.periodicActive = true;
    const schedule = (callback: () => void) => {
      if (window.requestIdleCallback !== undefined) {
        window.requestIdleCallback(callback, { timeout: 100 });
      } else {
        window.requestAnimationFrame(callback);
      }
    };
    const periodic = () => {
      if (!this.periodicActive) return;
      this.periodic();
      schedule(periodic);
    };
    schedule(periodic);
  }

  stop() {
    super.stop();
    this.periodicActive = false;
    if (this.reconnectTimeout !== null) window.clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = null;
    if (this.socket !== null) {
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
  }

  // ------------------------------------------------------------------------------------------
  // Connection

  private openSocket() {
    if (this.status === LiveDataSourceStatus.Stopped) return;
    this.backend = this.backendDetail === "" ? "connecting" : this.backend;
    let socket: WebSocket;
    try {
      socket = new WebSocket(this.baseUrl.replace(/^http/, "ws") + "/api/v1/live");
    } catch (error) {
      this.backend = "error";
      this.backendDetail = "Invalid address: " + this.baseUrl;
      this.scheduleReconnect();
      return;
    }
    this.socket = socket;

    socket.onopen = () => {
      this.reconnectDelayMs = RECONNECT_MIN_MS;
      socket.send(JSON.stringify({ op: "hello", api_version: API_VERSION }));
    };
    socket.onmessage = (event) => {
      if (typeof event.data !== "string") return;
      let message: ServerOp;
      try {
        message = JSON.parse(event.data);
      } catch {
        console.warn("[MUR] Ignoring non-JSON message");
        return;
      }
      this.handleMessage(message);
    };
    socket.onerror = () => {
      this.backend = "error";
      this.backendDetail = "Cannot reach " + this.baseUrl;
    };
    socket.onclose = () => {
      if (this.socket !== socket) return;
      this.socket = null;
      this.catalogue = null;
      this.subscribedPaths = [];
      if (this.backend === "connected") {
        this.backend = "connecting";
        this.backendDetail = "Connection lost, reconnecting";
      }
      this.setStatus(LiveDataSourceStatus.Connecting);
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (this.status === LiveDataSourceStatus.Stopped || this.reconnectTimeout !== null) return;
    this.retryAttempt++;
    this.retryAt = Date.now() + this.reconnectDelayMs;
    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectTimeout = null;
      this.openSocket();
    }, this.reconnectDelayMs);
    this.reconnectDelayMs = Math.min(this.reconnectDelayMs * 2, RECONNECT_MAX_MS);
  }

  private send(message: object) {
    if (this.socket !== null && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  // ------------------------------------------------------------------------------------------
  // Server messages

  private handleMessage(message: ServerOp) {
    switch (message.op) {
      case "catalogue_snapshot":
        this.handleSnapshot(message);
        break;
      case "catalogue_upsert":
        if (!this.isNextRevision(message.catalogue_epoch, message.revision)) return;
        this.upsertDescriptor(message.signal);
        this.shouldRunOutputCallback = true;
        break;
      case "catalogue_remove":
        if (!this.isNextRevision(message.catalogue_epoch, message.revision)) return;
        this.descriptors.delete(message.path);
        this.layouts.delete(message.path);
        this.availability.delete(message.path);
        if (this.log) deleteField(this.log, message.path);
        this.shouldRunOutputCallback = true;
        break;
      case "availability":
        this.availability.set(message.path, { state: message.state, lastSeenNs: message.last_seen_ns });
        this.shouldRunOutputCallback = true;
        break;
      case "sim_status":
        this.handleSimStatus(message);
        break;
      case "samples":
        message.samples.forEach((sample) => this.handleSample(sample));
        break;
      case "error":
        console.warn("[MUR] Backend error (" + message.code + "): " + message.message);
        break;
      default:
        // Unknown ops are ignored (spec 01 extensions)
        break;
    }
  }

  private isNextRevision(epoch: string, revision: number): boolean {
    if (this.catalogue === null || epoch !== this.catalogue.epoch) return false;
    if (revision <= this.catalogue.revision) return false;
    this.catalogue.revision = revision;
    return true;
  }

  private handleSnapshot(snapshot: CatalogueSnapshotOp) {
    // Discard the old epoch/revision and reconcile the tree with the fresh snapshot (spec 01 §5.2 reconnect)
    const domain: ClockDomain = snapshot.clock_domain ?? "unix";
    if (domain !== this.timeBase.getDomain()) {
      this.timeBase.setDomain(domain);
      this.clock.setDomain(domain);
      this.segments.setDomain(domain);
    }
    this.catalogue = { epoch: snapshot.catalogue_epoch, revision: snapshot.revision };
    const newPaths = new Set(snapshot.signals.map((signal) => signal.path));
    Array.from(this.descriptors.keys()).forEach((path) => {
      if (!newPaths.has(path)) {
        this.descriptors.delete(path);
        this.layouts.delete(path);
        if (this.log) deleteField(this.log, path);
      }
    });
    snapshot.signals.forEach((signal) => this.upsertDescriptor(signal));
    this.availability.clear();
    if (domain !== "sim") this.sim = null;

    // Subscriptions are not durable across sockets: periodic() replays them. Refetch history to fill the gap.
    this.subscribedPaths = [];
    this.historyRequested.clear();

    this.backend = "connected";
    this.backendDetail = "";
    this.checkSimControls();
    this.setStatus(LiveDataSourceStatus.Active);
    this.shouldRunOutputCallback = true;
  }

  private upsertDescriptor(descriptor: SignalDescriptor) {
    if (!this.log) return;
    const layout = getLayoutSignature(descriptor);
    const oldLayout = this.layouts.get(descriptor.path);
    if (oldLayout !== undefined && oldLayout !== layout) {
      // Incompatible type or schema change: never interpret old data with the new schema
      deleteField(this.log, descriptor.path);
    }
    this.descriptors.set(descriptor.path, descriptor);
    this.layouts.set(descriptor.path, layout);
    createField(this.log, descriptor);
    const metadata = getMetadataString(descriptor);
    if (this.log.getMetadataString("/" + descriptor.path) !== metadata) {
      this.log.setMetadataString("/" + descriptor.path, metadata);
    }
  }

  private handleSimStatus(status: SimStatusOp) {
    const now = Date.now();
    if (status.reason === "reset") {
      this.startNewSegment();
      this.simResetUntil = now + SIM_RESET_DISPLAY_MS;
    }
    this.segments.registerStreams(Object.values(status.stream_ids));
    this.sim = status;
    this.clock.setRunning(status.state === "running", status.speed, now);
    this.timeBase.setSimRate(status.speed);
  }

  private handleSample(sample: TelemetrySample) {
    if (!this.log) return;
    const descriptor = this.descriptors.get(sample.path);
    if (descriptor === undefined) return;

    let time = this.timeBase.sampleTime(sample);
    if (time === null) return;
    let decision = this.segments.observe(sample.path, sample.stream_id, sample.seq, time.seconds, !time.approximate);
    if (decision === "drop") return;
    if (decision === "new-segment") {
      this.startNewSegment(false);
      time = this.timeBase.sampleTime(sample)!;
      this.segments.observe(sample.path, sample.stream_id, sample.seq, time.seconds, !time.approximate);
    }
    if (!this.dedup.accept(sample.path, sample.stream_id, sample.seq)) return;
    if (time.seconds < 0) return;

    if (!writeValue(this.log, descriptor, time.seconds, sample.value)) {
      console.warn('[MUR] Value does not match type "' + descriptor.type + '" for ' + sample.path, sample.value);
      return;
    }

    const now = Date.now();
    if (this.retryAttempt > 0) this.receivingAgainUntil = now + 3000;
    this.retryAttempt = 0;
    this.lastReceipt = now;
    this.receiptTimes.set(sample.path, now);
    if (!this.availability.has(sample.path)) {
      this.availability.set(sample.path, { state: "online", lastSeenNs: sample.t_ns });
    }
    if (time.approximate) {
      this.unsynchronised.set(sample.path, now);
    } else {
      this.unsynchronised.delete(sample.path);
    }
    if (!time.approximate || this.timeBase.getDomain() === "unix" || this.clock.now(now) === null) {
      this.clock.observe(time.seconds, now);
    }
    this.shouldRunOutputCallback = true;
  }

  /** Starts a new run, retaining the previous Log and preserving a past-run selection. */
  private startNewSegment(clearAvailability = true) {
    this.segments.startNewSegment();
    this.dedup.clear();
    this.timeBase.resetSegment();
    this.clock.reset();
    this.unsynchronised.clear();
    this.historyRequested.clear();

    this.log = new Log();
    const following = this.runs.append(this.log);
    this.receiptTimes.clear();
    // A reconnect snapshot precedes samples from the new stream. Keep its health;
    // an explicit sim reset instead waits for receipts from the new run.
    if (clearAvailability) this.availability.clear();
    this.descriptors.forEach((descriptor) => createField(this.log!, descriptor));
    console.log("[MUR] Starting segment " + this.segments.getSegmentIndex().toString());
    this.runOutputCallback();
    if (following) this.newSegmentCallback?.();
  }

  // ------------------------------------------------------------------------------------------
  // Subscriptions, history and output

  private periodic() {
    if (this.status === LiveDataSourceStatus.Stopped || !this.log) return;

    if (this.catalogue !== null) {
      // Active fields (same sources as NT4Source.periodic): tabs plus visible sidebar fields
      const isKnownPath = (path: string) => this.descriptors.has(path);
      const tabPaths = new Set<string>();
      window.tabs.getActiveFields().forEach((key) => {
        const path = keyToPath(key, isKnownPath);
        if (path !== null) tabPaths.add(path);
      });
      const activePaths = new Set(tabPaths);
      window.sidebar.getActiveFields().forEach((key) => {
        const path = keyToPath(key, isKnownPath);
        if (path !== null) activePaths.add(path);
      });

      // Replace the subscription atomically when the set changes
      const paths = Array.from(activePaths).sort();
      if (paths.join("\n") !== this.subscribedPaths.join("\n")) {
        if (paths.length > 0) {
          this.send({
            op: "subscribe",
            subscription_id: SUBSCRIPTION_ID,
            paths: paths,
            max_rate_hz: MAX_RATE_HZ,
            include_latest: true
          });
        } else if (this.subscribedPaths.length > 0) {
          this.send({ op: "unsubscribe", subscription_id: SUBSCRIPTION_ID });
        }
        this.subscribedPaths = paths;
      }

      // Backfill history for fields that just became active in a tab
      tabPaths.forEach((path) => {
        if (!this.historyRequested.has(path)) {
          this.historyRequested.add(path);
          this.requestHistory(path);
        }
      });
    }

    // Discard old data (Preferences -> live discard)
    const discardS = window.preferences?.liveDiscard;
    const liveEdge = this.clock.now(Date.now());
    if (discardS !== undefined && discardS !== -1 && liveEdge !== null) {
      const minTime = liveEdge - discardS;
      if (minTime > this.log.getTimestampRange()[0]) this.log.clearBeforeTime(minTime, false);
    }

    if (this.shouldRunOutputCallback) {
      this.shouldRunOutputCallback = false;
      this.runOutputCallback();
    }
  }

  private runOutputCallback() {
    if (this.status === LiveDataSourceStatus.Stopped || !this.outputCallback || !this.log) return;
    if (this.runs.selected !== this.runs.entries.length - 1) return;
    this.outputCallback(this.log, () => {
      const now = this.clock.now(Date.now());
      return now !== null ? now : this.log!.getTimestampRange()[1];
    });
  }

  private async requestHistory(path: string) {
    if (this.historyAvailable === false) return;
    const segmentIndex = this.segments.getSegmentIndex();
    const url = this.baseUrl + "/api/v1/history?path=" + encodeURIComponent(path) + "&max_points=" + HISTORY_MAX_POINTS;
    let response: Response;
    try {
      response = await fetch(url);
    } catch {
      this.historyRequested.delete(path); // Retry on the next periodic call after reconnecting
      return;
    }
    if (response.status === 501) {
      this.historyAvailable = false;
      return;
    }
    if (!response.ok) return;
    this.historyAvailable = true;
    const body: HistoryResponse = await response.json();

    // Drop responses that belong to an earlier segment or a retired stream
    if (!this.log || segmentIndex !== this.segments.getSegmentIndex()) return;
    const descriptor = this.descriptors.get(path);
    if (descriptor === undefined) return;
    const samples = body.samples.filter((sample) => this.segments.acceptHistory(sample.stream_id));
    let wrote = false;
    this.dedup.filterHistory(path, samples).forEach((sample) => {
      const time = this.timeBase.sampleTime(sample);
      if (time === null || time.seconds < 0) return;
      if (writeValue(this.log!, descriptor, time.seconds, sample.value)) wrote = true;
    });
    if (wrote) this.shouldRunOutputCallback = true;
  }

  private async checkSimControls() {
    try {
      const response = await fetch(this.baseUrl + "/api/v1/sim/status");
      this.simControls = response.ok;
      if (response.ok && this.sim === null) {
        const status: SimStatus = await response.json();
        this.sim = status;
        this.clock.setRunning(status.state === "running", status.speed, Date.now());
        this.timeBase.setSimRate(status.speed);
      }
    } catch {
      this.simControls = false;
    }
  }

  // ------------------------------------------------------------------------------------------
  // LiveStatusProvider

  getStatusProvider(): LiveStatusProvider {
    return this;
  }

  getLiveStatus(): LiveStatusSummary {
    const counts = { online: 0, stale: 0, offline: 0, neverSeen: 0 };
    this.descriptors.forEach((_, path) => {
      const state = this.getFieldFreshness(path);
      if (state === null || state === "unknown") counts.neverSeen++;
      else counts[state]++;
    });
    let car: Freshness | null = null;
    if (this.descriptors.size > 0) {
      if (counts.online + counts.stale + counts.offline === 0) {
        car = "unknown";
      } else if (counts.online === 0) {
        car = counts.stale > 0 ? "stale" : "offline";
      } else {
        car = counts.stale + counts.offline > 0 ? "stale" : "online";
      }
    }

    const now = Date.now();
    let unsynchronisedCount = 0;
    this.unsynchronised.forEach((time) => {
      if (now - time < UNSYNC_HOLD_MS) unsynchronisedCount++;
    });

    let sim: LiveStatusSummary["sim"] = null;
    if (this.sim !== null && this.timeBase.getDomain() === "sim") {
      sim = {
        state: now < this.simResetUntil ? "reset" : this.sim.state,
        timeS: this.clock.now(now) ?? 0,
        speed: this.sim.speed,
        resetCount: this.sim.reset_count
      };
    }

    return {
      oldestAgeS:
        this.descriptors.size === 0
          ? null
          : Array.from(this.descriptors.keys()).reduce<number | null>((oldest, path) => {
              const age = this.getFieldAge(path);
              return age === null ? oldest : Math.max(oldest ?? 0, age);
            }, null),
      lastReceiptAgeS: this.lastReceipt === null ? null : (now - this.lastReceipt) / 1000,
      retryAttempt: this.retryAttempt,
      retryInS: Math.max(0, (this.retryAt - now) / 1000),
      receivingAgain: now < this.receivingAgainUntil,
      viewedRun: this.runs.selected,
      runCount: this.runs.entries.length,
      backend: this.backend,
      backendDetail: this.backendDetail,
      car: car,
      signalCounts: counts,
      sim: sim,
      simControls: this.simControls,
      historyAvailable: this.historyAvailable,
      unsynchronisedCount: unsynchronisedCount,
      segmentIndex: this.segments.getSegmentIndex(),
      catalogue:
        this.catalogue === null
          ? null
          : { epoch: this.catalogue.epoch, revision: this.catalogue.revision, signals: this.descriptors.size }
    };
  }

  getFieldFreshness(key: string): Freshness | null {
    const path = key.startsWith("/") ? key.slice(1) : key;
    if (!this.descriptors.has(path)) return null;
    if (this.backend !== "connected") return "offline";
    const availability = this.availability.get(path);
    if (!availability || availability.lastSeenNs === null) return "unknown";
    return availability.state;
  }

  getFieldAge(key: string): number | null {
    const path = key.startsWith("/") ? key.slice(1) : key;
    const received = this.receiptTimes.get(path);
    if (received !== undefined) return Math.max(0, (Date.now() - received) / 1000);
    const lastSeen = this.availability.get(path)?.lastSeenNs;
    // Availability timestamps use the backend's clock domain. In sim mode use the live clock.
    if (!lastSeen) return null;
    const seconds = Number(BigInt(lastSeen)) / 1e9;
    const now = this.timeBase.getDomain() === "sim" ? this.clock.now(Date.now()) : Date.now() / 1000;
    return now === null ? null : Math.max(0, now - seconds);
  }

  selectRun(index: number) {
    if (!this.outputCallback || !this.runs.select(index)) return;
    const log = this.runs.entries[index];
    this.outputCallback(log, () =>
      index === this.runs.entries.length - 1
        ? this.clock.now(Date.now()) ?? log.getTimestampRange()[1]
        : log.getTimestampRange()[1]
    );
    this.newSegmentCallback?.();
    if (index !== this.runs.entries.length - 1) window.selection.setLiveDisconnected();
  }

  isFieldUnsynchronised(key: string): boolean {
    const path = key.startsWith("/") ? key.slice(1) : key;
    const time = this.unsynchronised.get(path);
    return time !== undefined && Date.now() - time < UNSYNC_HOLD_MS;
  }

  async simControl(action: SimAction): Promise<void> {
    let response: Response;
    try {
      response = await fetch(this.baseUrl + "/api/v1/sim/" + action, { method: "POST" });
    } catch {
      throw "Cannot reach " + this.baseUrl;
    }
    if (!response.ok) {
      let message = "HTTP " + response.status.toString();
      try {
        const body = await response.json();
        if (typeof body.message === "string") message = body.message;
      } catch {}
      throw message;
    }
  }
}
