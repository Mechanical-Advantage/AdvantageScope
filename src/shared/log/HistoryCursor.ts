// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Log from "./Log";

/** Tracks append-only history, rebuilding after a seek, replacement or history edit. */
export default class HistoryCursor {
  private log: Log | null = null;
  private field: unknown;
  private first: number | undefined;
  private version = -1;
  private discardVersion = -1;
  private time = -Infinity;
  stamp = -Infinity;
  heldTimestamp: number | undefined;

  update(log: Log, key: string, time: number, reset: () => void): number {
    const field = log.getField(key);
    const first = field?.getTimestamps()[0];
    const version = log.getHistoryVersion(key);
    const discardVersion = field?.getDiscardVersion() ?? 0;
    if (
      log !== this.log ||
      field !== this.field ||
      (first !== this.first && discardVersion === this.discardVersion) ||
      version !== this.version ||
      time < this.time
    ) {
      reset();
      this.stamp = -Infinity;
    }
    this.heldTimestamp = undefined;
    // A held sample moved by retention is not a new event.
    if (first !== undefined && (field?.getFirstSampleTimestamp() ?? Infinity) <= this.stamp) {
      if (first > this.stamp && field?.getTimestamps()[1] === first) this.heldTimestamp = first;
      else this.stamp = Math.max(this.stamp, first);
    }
    this.discardVersion = discardVersion;
    this.log = log;
    this.field = field;
    this.first = first;
    this.version = version;
    this.time = time;
    return this.stamp;
  }
}
