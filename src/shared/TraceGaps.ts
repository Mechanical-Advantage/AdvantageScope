// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Pure gap detection for line graph traces. A "gap" is a stretch where a numeric field has no data (a long time
// step, or NaN samples) between two valid samples, or after the last valid sample when the stream has not resumed.

/** A missing stretch. `t1` is Infinity (and `v1` NaN) when the stream has not resumed. */
export type TraceGap = { t0: number; v0: number; t1: number; v1: number };

const MIN_GAP_SECONDS = 1;
const GAP_PERIOD_FACTOR = 10;

/**
 * Running median of a field's sample period over its whole log, updated incrementally as samples arrive.
 * Counts exact periods; unchanged logs reuse the cached median.
 */
export class PeriodStats {
  private seen = 0;
  private firstTimestamp = NaN;
  private lastTimestamp = NaN;
  private counts = new Map<number, number>();
  private total = 0;
  private cachedMedian: number | null = null;

  /** Consumes any samples not yet seen. Resets if the log was replaced or truncated. */
  update(timestamps: number[]) {
    if (
      timestamps.length < this.seen ||
      (this.seen > 0 && (timestamps[0] !== this.firstTimestamp || timestamps[this.seen - 1] !== this.lastTimestamp))
    ) {
      this.seen = 0;
      this.counts.clear();
      this.total = 0;
      this.cachedMedian = null;
    }
    if (this.seen === 0 && timestamps.length > 0) this.firstTimestamp = timestamps[0];
    for (let i = Math.max(1, this.seen); i < timestamps.length; i++) {
      const dt = timestamps[i] - timestamps[i - 1];
      if (!(dt > 0)) continue;
      const bucket = dt;
      this.counts.set(bucket, (this.counts.get(bucket) ?? 0) + 1);
      this.total++;
    }
    if (this.seen !== timestamps.length) this.cachedMedian = null;
    this.seen = timestamps.length;
    this.lastTimestamp = timestamps[timestamps.length - 1];
  }

  /** Median sample period in seconds, or null with fewer than two samples. */
  median(): number | null {
    if (this.total === 0) return null;
    if (this.cachedMedian !== null) return this.cachedMedian;
    const buckets = [...this.counts.keys()].sort((a, b) => a - b);
    let running = 0;
    let lower: number | null = null;
    for (const bucket of buckets) {
      running += this.counts.get(bucket)!;
      if (lower === null && running > Math.floor((this.total - 1) / 2)) lower = bucket;
      if (running > Math.floor(this.total / 2)) return (this.cachedMedian = (lower! + bucket) / 2);
    }
    return null;
  }
}

/**
 * Time step above which a field counts as having a gap, or null if the field must not be bridged
 * (logged only on change: median period over 1 s). Until a period is known, use the 1 s floor.
 */
export function gapThreshold(medianPeriod: number | null): number | null {
  if (medianPeriod === null || !(medianPeriod > 0)) return MIN_GAP_SECONDS;
  if (medianPeriod > MIN_GAP_SECONDS) return null;
  return Math.max(MIN_GAP_SECONDS, GAP_PERIOD_FACTOR * medianPeriod);
}

/**
 * Finds gaps in the samples. NaN samples are missing data: a NaN run between two valid samples is always a gap.
 * After the last valid sample, an `Infinity` gap is reported when NaN samples follow it, when the stream is known to
 * be down (`streamDown`), or when `edge` (the right end of the displayed range) is more than `threshold` later.
 */
export function findGaps(
  timestamps: number[],
  values: number[],
  threshold: number,
  edge: number,
  streamDown = false
): TraceGap[] {
  const gaps: TraceGap[] = [];
  let last = -1;
  let sawNaN = false;
  for (let i = 0; i < timestamps.length; i++) {
    if (Number.isNaN(values[i])) {
      sawNaN = true;
      continue;
    }
    if (last >= 0 && (sawNaN || timestamps[i] - timestamps[last] > threshold)) {
      gaps.push({ t0: timestamps[last], v0: values[last], t1: timestamps[i], v1: values[i] });
    }
    last = i;
    sawNaN = false;
  }
  if (last >= 0) {
    const stale = edge - timestamps[last] > threshold;
    if (sawNaN || stale || (streamDown && edge > timestamps[last])) {
      gaps.push({ t0: timestamps[last], v0: values[last], t1: Infinity, v1: NaN });
    }
  }
  return gaps;
}

/** Whether a trace should stop at its last sample instead of holding to the right edge. */
export function isUnresumed(gaps: TraceGap[] | undefined): boolean {
  return gaps !== undefined && gaps.length > 0 && gaps[gaps.length - 1].t1 === Infinity;
}

/**
 * Restricts gaps to [lo, hi] and maps their times through `mapX` (e.g. into lap time or distance). Gaps cut by a
 * bound have their value interpolated at the bound; finite bridges are clipped at both bounds.
 */
export function clipGaps(gaps: TraceGap[], lo: number, hi: number, mapX: (t: number) => number): TraceGap[] {
  const out: TraceGap[] = [];
  for (const gap of gaps) {
    if (gap.t1 <= lo || gap.t0 >= hi) continue;
    const lerp = (t: number) => gap.v0 + ((gap.v1 - gap.v0) * (t - gap.t0)) / (gap.t1 - gap.t0);
    const startsBefore = gap.t0 < lo;
    const t0 = startsBefore ? lo : gap.t0;
    const v0 = startsBefore && Number.isFinite(gap.t1) ? lerp(lo) : gap.v0;
    if (!Number.isFinite(gap.t1)) {
      out.push({ t0: mapX(t0 - lo), v0, t1: Infinity, v1: NaN });
    } else {
      out.push({ t0: mapX(t0 - lo), v0, t1: mapX(Math.min(hi, gap.t1) - lo), v1: gap.t1 > hi ? lerp(hi) : gap.v1 });
    }
  }
  return out;
}

/** Samples without NaN, plus which segments (i to i+1) lie inside a gap. */
export function prepareTrace(
  timestamps: number[],
  values: number[],
  gaps: TraceGap[]
): { timestamps: number[]; values: number[]; gapAfter: boolean[] } {
  const ts: number[] = [];
  const vs: number[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    if (Number.isNaN(values[i]) || gaps.some((gap) => timestamps[i] > gap.t0 && timestamps[i] < gap.t1)) continue;
    ts.push(timestamps[i]);
    vs.push(values[i]);
  }
  const gapAfter = new Array<boolean>(ts.length).fill(false);
  for (const gap of gaps) {
    // First sample j after the gap start; the segment j-1 -> j is the first that may cross it
    let lo = 0;
    let hi = ts.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (ts[mid] > gap.t0) hi = mid;
      else lo = mid + 1;
    }
    for (let i = Math.max(0, lo - 1); i + 1 < ts.length && ts[i] < gap.t1; i++) {
      if (ts[i + 1] > gap.t0) gapAfter[i] = true;
    }
  }
  return { timestamps: ts, values: vs, gapAfter };
}
