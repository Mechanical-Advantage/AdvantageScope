// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// A clock rewind starts a new segment. A producer restart with forward Unix time stays in the current Log.
// Retired streams cannot add late samples or history to a later segment.

export type SegmentDecision = "accept" | "drop" | "new-segment";

interface PathState {
  streamId: string;
  seq: number;
  time: number;
}

export class SegmentTracker {
  private toleranceS: number;
  private paths = new Map<string, PathState>();
  private currentStreams = new Set<string>();
  private retiredStreams = new Set<string>();
  private segmentIndex = 0;

  constructor(toleranceS = 1) {
    this.toleranceS = toleranceS;
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
      } else if (backwards) {
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
}
