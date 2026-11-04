// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Sample deduplication on (path, stream_id, seq) (spec 01 §4.1, §6). Pure, so it can be unit tested.
//
// Keeping every key ever seen would grow without bound, so each (path, stream_id) keeps:
// - the exact set of seqs within WINDOW of the newest seq (catches RF/cellular copies and the history/live
//   overlap, which are always close to the newest data), and
// - the lowest seq seen. Anything older than the window is accepted only if it is older than everything seen
//   so far, i.e. history backfill. History must therefore be offered newest-first (see `filterHistory`).

import { sampleKey } from "../../../shared/mur/contract";

interface StreamState {
  min: number;
  max: number;
  recent: Set<string>;
}

export class SampleDeduplicator {
  static readonly WINDOW = 4096;

  private streams = new Map<string, StreamState>();

  /** Returns true if the sample is new (and records it), false if it is a duplicate. */
  accept(path: string, streamId: string, seq: number): boolean {
    const streamKey = path + "\u0000" + streamId;
    const key = sampleKey({ path: path, stream_id: streamId, seq: seq });
    let state = this.streams.get(streamKey);
    if (state === undefined) {
      state = { min: seq, max: seq, recent: new Set([key]) };
      this.streams.set(streamKey, state);
      return true;
    }

    if (seq > state.max) {
      state.max = seq;
      state.recent.add(key);
      if (state.recent.size > SampleDeduplicator.WINDOW * 2) this.prune(state, path, streamId);
      return true;
    }
    if (seq >= state.max - SampleDeduplicator.WINDOW) {
      if (state.recent.has(key)) return false;
      state.recent.add(key);
      if (seq < state.min) state.min = seq;
      return true;
    }
    if (seq < state.min) {
      state.min = seq;
      return true;
    }
    return false;
  }

  /**
   * Filters a batch of history samples for one path, returning the new ones in ascending seq order.
   * Samples are checked newest-first so that backfill older than the window is accepted.
   */
  filterHistory<T extends { stream_id: string; seq: number }>(path: string, samples: T[]): T[] {
    const sorted = [...samples].sort((a, b) => b.seq - a.seq);
    const accepted = sorted.filter((sample) => this.accept(path, sample.stream_id, sample.seq));
    return accepted.reverse();
  }

  /** Forgets everything (new segment). */
  clear() {
    this.streams.clear();
  }

  private prune(state: StreamState, path: string, streamId: string) {
    const floor = state.max - SampleDeduplicator.WINDOW;
    const kept = new Set<string>();
    state.recent.forEach((key) => {
      const seq = Number(key.slice(path.length + streamId.length + 2));
      if (seq >= floor) kept.add(key);
    });
    state.recent = kept;
  }
}
