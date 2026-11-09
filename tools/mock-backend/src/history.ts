// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Bounded per-signal rolling history with columnar storage, plus spec 01 §5.3 query/downsampling.

import type {
  HistoryResponse,
  HistorySample,
  IngressLink,
  SignalType,
  TelemetrySample,
  TimeQuality
} from "../../../src/shared/mur/contract.ts";

const TQ: TimeQuality[] = ["synchronised", "estimated", "unsynchronised"];
const LINKS: (IngressLink | undefined)[] = [undefined, "rf", "cellular", "lan"];

type Kind = "num" | "i64" | "bool" | "obj";

function kindOf(type: string): Kind {
  if (type === "float64" || type === "enum") return "num";
  if (type === "int64") return "i64";
  if (type === "bool") return "bool";
  return "obj";
}

const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);
/** Default history window when from_ns is omitted (5 min). */
export const DEFAULT_WINDOW_NS = 300_000_000_000n;

/** JSON encoding of an int64 per spec §3.2: number when safe, else decimal string. */
export function encodeInt64(v: bigint): number | string {
  return v <= MAX_SAFE && v >= -MAX_SAFE ? Number(v) : v.toString();
}

export class HistoryBuffer {
  readonly type: string;
  readonly capacity: number;
  private readonly kind: Kind;
  private tNs: BigInt64Array;
  private recvNs: BigInt64Array;
  private seq: Float64Array;
  private stream: Uint16Array;
  private tq: Uint8Array;
  private link: Uint8Array;
  private num: Float64Array | null = null;
  private i64: BigInt64Array | null = null;
  private obj: unknown[] | null = null;
  private head = 0; // next write index
  private count = 0;
  private static streams: string[] = [];
  private static streamIdx = new Map<string, number>();

  constructor(type: string, capacity: number) {
    this.type = type;
    this.capacity = Math.max(4, Math.ceil(capacity));
    this.kind = kindOf(type);
    const n = this.capacity;
    this.tNs = new BigInt64Array(n);
    this.recvNs = new BigInt64Array(n);
    this.seq = new Float64Array(n);
    this.stream = new Uint16Array(n);
    this.tq = new Uint8Array(n);
    this.link = new Uint8Array(n);
    if (this.kind === "num" || this.kind === "bool") this.num = new Float64Array(n);
    else if (this.kind === "i64") this.i64 = new BigInt64Array(n);
    else this.obj = new Array(n);
  }

  private static streamIndex(id: string): number {
    let i = HistoryBuffer.streamIdx.get(id);
    if (i === undefined) {
      i = HistoryBuffer.streams.length;
      HistoryBuffer.streams.push(id);
      HistoryBuffer.streamIdx.set(id, i);
    }
    return i;
  }

  get size(): number {
    return this.count;
  }

  push(s: TelemetrySample): void {
    const i = this.head;
    this.tNs[i] = BigInt(s.t_ns);
    this.recvNs[i] = BigInt(s.received_ns);
    this.seq[i] = s.seq;
    this.stream[i] = HistoryBuffer.streamIndex(s.stream_id);
    this.tq[i] = Math.max(0, TQ.indexOf(s.time_quality));
    this.link[i] = Math.max(0, LINKS.indexOf(s.ingress_link));
    if (this.kind === "num") this.num![i] = s.value as number;
    else if (this.kind === "bool") this.num![i] = s.value ? 1 : 0;
    else if (this.kind === "i64") this.i64![i] = BigInt(s.value as number | string);
    else this.obj![i] = s.value;
    this.head = (i + 1) % this.capacity;
    if (this.count < this.capacity) this.count++;
  }

  /** Physical index of the k-th oldest retained sample. */
  private idx(k: number): number {
    return (this.head - this.count + k + this.capacity) % this.capacity;
  }

  /** Stream id of the newest sample, or null. */
  latestStream(): string | null {
    if (this.count === 0) return null;
    return HistoryBuffer.streams[this.stream[this.idx(this.count - 1)]];
  }

  private sampleAt(i: number): HistorySample {
    let value: unknown;
    if (this.kind === "num") value = this.num![i];
    else if (this.kind === "bool") value = this.num![i] !== 0;
    else if (this.kind === "i64") value = encodeInt64(this.i64![i]);
    else value = this.obj![i];
    const out: HistorySample = {
      stream_id: HistoryBuffer.streams[this.stream[i]],
      seq: this.seq[i],
      t_ns: this.tNs[i].toString(),
      received_ns: this.recvNs[i].toString(),
      time_quality: TQ[this.tq[i]],
      value
    };
    const link = LINKS[this.link[i]];
    if (link) out.ingress_link = link;
    return out;
  }

  private numericAt(i: number): number {
    if (this.kind === "i64") return Number(this.i64![i]);
    return this.num![i];
  }

  /**
   * Query a time range of one stream.
   * - float64/int64: min/max-preserving bucket downsampling (each bucket keeps its min and max sample)
   * - bool/enum: keep state changes (+ first/last), then min/max buckets if still too many
   * - string: newest `maxPoints` (truncated)
   * - geometry/other: evenly strided raw samples (never averaged)
   */
  query(
    path: string,
    fromNs: bigint | null,
    toNs: bigint | null,
    maxPoints: number,
    streamId?: string
  ): HistoryResponse {
    const sid = streamId ?? this.latestStream();
    const sidIdx = sid === null ? -1 : HistoryBuffer.streamIdx.get(sid);
    const inStream: number[] = [];
    if (sidIdx !== undefined && sidIdx >= 0) {
      for (let k = 0; k < this.count; k++) {
        const i = this.idx(k);
        if (this.stream[i] === sidIdx) inStream.push(i);
      }
    }
    // defaults: the newest DEFAULT_WINDOW_NS of the selected stream
    const newest = inStream.length ? this.tNs[inStream[inStream.length - 1]] : 0n;
    const to = toNs ?? newest;
    const from = fromNs ?? to - DEFAULT_WINDOW_NS;
    const sel = inStream.filter((i) => this.tNs[i] >= from && this.tNs[i] <= to);
    let chosen = sel;
    let downsampled = false;
    let truncated = false;
    if (sel.length > maxPoints) {
      const type = this.type as SignalType;
      if (type === "float64" || type === "int64") {
        chosen = this.minMax(sel, maxPoints);
        downsampled = true;
      } else if (type === "bool" || type === "enum") {
        chosen = this.changes(sel);
        if (chosen.length > maxPoints) chosen = this.minMax(chosen, maxPoints);
        downsampled = true;
      } else if (type === "string") {
        chosen = sel.slice(sel.length - maxPoints);
        truncated = true;
      } else {
        chosen = this.stride(sel, maxPoints);
        downsampled = true;
      }
    }
    return {
      path,
      samples: chosen.map((i) => this.sampleAt(i)),
      truncated,
      downsampled,
      stream_id: sid
    };
  }

  private minMax(sel: number[], maxPoints: number): number[] {
    const buckets = Math.max(1, Math.floor(maxPoints / 2));
    const out: number[] = [];
    const n = sel.length;
    for (let b = 0; b < buckets; b++) {
      const lo = Math.floor((b * n) / buckets);
      const hi = Math.floor(((b + 1) * n) / buckets);
      if (hi <= lo) continue;
      let iMin = lo,
        iMax = lo;
      for (let k = lo + 1; k < hi; k++) {
        const v = this.numericAt(sel[k]);
        if (v < this.numericAt(sel[iMin])) iMin = k;
        if (v > this.numericAt(sel[iMax])) iMax = k;
      }
      if (iMin === iMax) out.push(sel[iMin]);
      else if (iMin < iMax) out.push(sel[iMin], sel[iMax]);
      else out.push(sel[iMax], sel[iMin]);
    }
    return out;
  }

  private changes(sel: number[]): number[] {
    const out: number[] = [];
    for (let k = 0; k < sel.length; k++) {
      if (k === 0 || k === sel.length - 1 || this.num![sel[k]] !== this.num![sel[k - 1]]) out.push(sel[k]);
    }
    return out;
  }

  private stride(sel: number[], maxPoints: number): number[] {
    if (maxPoints <= 1) return [sel[sel.length - 1]];
    const out: number[] = [];
    const n = sel.length;
    for (let k = 0; k < maxPoints; k++) out.push(sel[Math.round((k * (n - 1)) / (maxPoints - 1))]);
    return out;
  }
}
