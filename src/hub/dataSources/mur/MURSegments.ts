// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Segment detection for the MUR live source (spec 02 §4: sim resets and backward time jumps). Pure.
//
// A *segment* is one continuous run of the session timeline. AdvantageScope's Log assumes time only moves
// forward, so a sim reset to t = 0 would otherwise insert the new run into the old run's history. When a new
// segment starts, MURSource replaces the Log and the hub resets the selection (see MURSource.startNewSegment).
//
// A new segment starts when:
// - the backend reports a sim reset (`sim_status` with `reason: "reset"`; handled by the caller), or
// - a path's samples jump backwards in time by more than `toleranceS` while their seq moves forwards (the clock
//   was rewound), or
// - a path switches to a new `stream_id` in the sim clock domain (the sim was restarted), or in the unix domain
//   with a backward time jump.
//
// A new `stream_id` in the unix domain with time still moving forwards is a producer restart on the same
// timeline: the data is appended to the current segment (dedup keys include the stream, so nothing collides).
// Out-of-order samples (lower seq, same stream) are normal and are accepted.
//
// Streams that belonged to an earlier segment are *retired*: late samples or history from them are dropped,
// so the old run never leaks into the new one.

import type { ClockDomain } from "../../../../tools/mock-backend/src/contract";

export type SegmentDecision = "accept" | "drop" | "new-segment";

interface PathState {
  streamId: string;
  seq: number;
  time: number;
}

export class SegmentTracker {
  private domain: ClockDomain;
  private toleranceS: number;
  private paths = new Map<string, PathState>();
  private currentStreams = new Set<string>();
  private retiredStreams = new Set<string>();
  private segmentIndex = 0;

  constructor(domain: ClockDomain = "unix", toleranceS = 1) {
    this.domain = domain;
    this.toleranceS = toleranceS;
  }

  setDomain(domain: ClockDomain) {
    this.domain = domain;
  }

  /** Index of the current segment, starting at 0. */
  getSegmentIndex(): number {
    return this.segmentIndex;
  }

  isRetired(streamId: string): boolean {
    return this.retiredStreams.has(streamId);
  }

  /**
   * Classifies a live sample. "new-segment" means the caller must start a new segment (call `startNewSegment`)
   * and then call `observe` again, which will return "accept".
   *
   * Pass `trustedTime = false` for receive-time fallbacks (unsynchronised sources): their times jitter with the
   * link, so they never trigger a backward-jump segment on their own.
   */
  observe(path: string, streamId: string, seq: number, time: number, trustedTime = true): SegmentDecision {
    if (this.retiredStreams.has(streamId)) return "drop";
    const last = this.paths.get(path);
    if (last !== undefined) {
      const backwards = trustedTime && time < last.time - this.toleranceS;
      if (last.streamId === streamId) {
        if (backwards && seq > last.seq) return "new-segment";
      } else if (backwards || this.domain === "sim") {
        return "new-segment";
      }
    }

    this.currentStreams.add(streamId);
    if (last === undefined || last.streamId !== streamId || seq > last.seq) {
      this.paths.set(path, { streamId: streamId, seq: seq, time: time });
    }
    return "accept";
  }

  /** Returns whether a history sample may be used. History never starts a segment. */
  acceptHistory(streamId: string): boolean {
    return !this.retiredStreams.has(streamId);
  }

  /** Starts a new segment: every stream seen so far is retired. */
  startNewSegment() {
    this.currentStreams.forEach((streamId) => this.retiredStreams.add(streamId));
    this.currentStreams.clear();
    this.paths.clear();
    this.segmentIndex++;
  }

  /**
   * Marks streams as belonging to the current segment, e.g. the `stream_ids` from a `sim_status` reset, so a
   * later reset retires them even if no sample from them was seen.
   */
  registerStreams(streamIds: string[]) {
    streamIds.forEach((streamId) => {
      if (!this.retiredStreams.has(streamId)) this.currentStreams.add(streamId);
    });
  }
}
