// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Live source for the MUR telemetry backend (spec 01 §5: HTTP catalogue/history + WebSocket live).
// Contract types come from tools/mock-backend/src/contract.ts.
//
// - Catalogue: hello -> catalogue_snapshot builds the tree; upserts/removes update it live. The descriptor
//   unit goes into field metadata so Log.getUnit and unit conversion work (MURLogAdapter).
// - Subscriptions: one subscription ("mur-voir-active") holding exactly the active fields of the tabs and
//   sidebar, replaced atomically whenever that set changes (same diff as NT4Source.periodic()).
// - History: fetched when a field becomes active in a tab; a 501 response disables later history requests.
// - Dedup on (path, stream_id, seq) (MURDedup). Time: BigInt session-relative seconds (MURTime).
// - Segments: a clock rewind starts a new segment (MURSegments): the Log is replaced and the hub
//   resets the selection, so the new run never mixes with the old one.
// - Reconnect: automatic with backoff; fresh snapshot, then the subscription is replayed by periodic().

import type {
  AvailabilityState,
  CatalogueSnapshotOp,
  HistoryResponse,
  ServerOp,
  SignalDescriptor,
  TelemetrySample
} from "../../../../tools/mock-backend/src/contract";
import Log from "../../../shared/log/Log";
import { LiveDataSource, LiveDataSourceStatus } from "../LiveDataSource";
import { BackendState, Freshness, LiveStatusProvider, LiveStatusSummary } from "../LiveStatus";
import { SampleDeduplicator } from "./MURDedup";
import {
  createField,
  deleteField,
  getLayoutSignature,
  getMetadataString,
  keyToPath,
  writeValue
} from "./MURLogAdapter";
import { SegmentTracker } from "./MURSegments";
import { LiveClock, SessionTimeBase } from "./MURTime";

const API_VERSION = 1;
const SUBSCRIPTION_ID = "mur-voir-active";
const MAX_RATE_HZ = 50;
const HISTORY_MAX_POINTS = 2000;
const RECONNECT_MIN_MS = 500;
const RECONNECT_MAX_MS = 5000;
const UNSYNC_HOLD_MS = 3000; // How long a signal stays flagged after its last unsynchronised sample

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

  private receiptTimes = new Map<string, number>();
  private backend: BackendState = "connecting";
  private backendDetail = "";

  private descriptors = new Map<string, SignalDescriptor>();
  private layouts = new Map<string, string>();
  private catalogue: { epoch: string; revision: number } | null = null;
  private availability = new Map<string, { state: AvailabilityState; lastSeenNs: string | null }>();
  private unsynchronised = new Map<string, number>(); // path -> wall time of the last unsynchronised sample

  private timeBase = new SessionTimeBase();
  private clock = new LiveClock();
  private dedup = new SampleDeduplicator();
  private segments = new SegmentTracker();

  private requests = new AbortController();
  private subscribedPaths: string[] = [];
  private historyRequested = new Set<string>();
  private historyAvailable: boolean | null = null;

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
    this.requests.abort();
    this.periodicActive = false;
    if (this.reconnectTimeout !== null) window.clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = null;
    if (this.socket !== null) {
      this.socket.onopen = this.socket.onmessage = this.socket.onerror = this.socket.onclose = null;
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
      this.setStatus(LiveDataSourceStatus.Error);
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
      this.setStatus(LiveDataSourceStatus.Error);
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
      this.setStatus(LiveDataSourceStatus.Error);
      this.setStatus(LiveDataSourceStatus.Connecting);
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (this.status === LiveDataSourceStatus.Stopped || this.reconnectTimeout !== null) return;
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

    // Subscriptions are not durable across sockets: periodic() replays them. Refetch history to fill the gap.
    this.subscribedPaths = [];
    this.historyRequested.clear();

    this.backend = "connected";
    this.backendDetail = "";
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

  private handleSample(sample: TelemetrySample) {
    if (!this.log) return;
    const descriptor = this.descriptors.get(sample.path);
    if (descriptor === undefined) return;

    let time = this.timeBase.sampleTime(sample);
    if (time === null) return;
    let decision = this.segments.observe(sample.path, sample.stream_id, sample.seq, time.seconds, !time.approximate);
    if (decision === "drop") return;
    if (decision === "new-segment") {
      this.startNewSegment();
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
    this.receiptTimes.set(sample.path, now);
    if (!this.availability.has(sample.path)) {
      this.availability.set(sample.path, { state: "online", lastSeenNs: sample.t_ns });
    }
    if (time.approximate) {
      this.unsynchronised.set(sample.path, now);
    } else {
      this.unsynchronised.delete(sample.path);
    }
    this.clock.observe(time.seconds, now);
    this.shouldRunOutputCallback = true;
  }

  /** Replaces the Log after a clock rewind and drops the previous run. */
  private startNewSegment() {
    this.segments.startNewSegment();
    // Deduplication and history progress belong to this run's time base.
    this.dedup.clear();
    this.timeBase.resetSegment();
    this.clock.reset();
    this.unsynchronised.clear();
    this.historyRequested.clear();

    this.log = new Log();
    this.receiptTimes.clear();
    // Keep availability from the snapshot that preceded this stream.
    this.descriptors.forEach((descriptor) => createField(this.log!, descriptor));
    console.log("[MUR] Starting segment " + this.segments.getSegmentIndex().toString());
    this.runOutputCallback();
    this.newSegmentCallback?.();
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
          this.fetchHistory(path);
        }
      });
    }

    // Discard old data (Preferences -> live discard)
    const discardS = window.preferences?.liveDiscard;
    const liveEdge = this.clock.now(Date.now());
    if (discardS !== undefined && discardS !== -1 && liveEdge !== null && Date.now() - this.lastDiscard >= 1000) {
      this.lastDiscard = Date.now();
      const minTime = liveEdge - discardS;
      if (minTime > this.log.getTimestampRange()[0]) this.log.clearBeforeTime(minTime, false);
    }

    if (this.shouldRunOutputCallback) {
      this.shouldRunOutputCallback = false;
      this.runOutputCallback();
    }
  }

  private lastDiscard = -Infinity;

  private runOutputCallback() {
    if (this.status === LiveDataSourceStatus.Stopped || !this.outputCallback || !this.log) return;
    this.outputCallback(this.log, () => {
      const now = this.clock.now(Date.now());
      return now !== null ? now : this.log!.getTimestampRange()[1];
    });
  }

  private async fetchHistory(path: string) {
    if (this.historyAvailable === false) return;
    const segmentIndex = this.segments.getSegmentIndex();
    const url = this.baseUrl + "/api/v1/history?path=" + encodeURIComponent(path) + "&max_points=" + HISTORY_MAX_POINTS;
    let response: Response;
    try {
      response = await fetch(url, { signal: this.requests.signal });
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
    if (this.requests.signal.aborted || !this.log || segmentIndex !== this.segments.getSegmentIndex()) return;
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

  // ------------------------------------------------------------------------------------------
  // LiveStatusProvider

  getStatusProvider(): LiveStatusProvider {
    return this;
  }

  getLiveStatus(): LiveStatusSummary {
    return {
      backend: this.backend,
      backendDetail: this.backendDetail,
      viewedRun: 0,
      runCount: 1,
      hasFreshData: Array.from(this.descriptors.keys()).some((key) => this.getFieldFreshness(key) === "online")
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
    if (!lastSeen) return null;
    const seconds = Number(BigInt(lastSeen)) / 1e9;
    const now = Date.now() / 1000;
    return Math.max(0, now - seconds);
  }

  isFieldUnsynchronised(key: string): boolean {
    const path = key.startsWith("/") ? key.slice(1) : key;
    const time = this.unsynchronised.get(path);
    return time !== undefined && Date.now() - time < UNSYNC_HOLD_MS;
  }
}
