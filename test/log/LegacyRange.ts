// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Frozen pre-optimization lookup, shared by the differential test and benchmark.
import { LogValueSetAny } from "../../src/shared/log/LogValueSets";

export class LegacyRange {
  private getRangeCache: { [id: string]: number } = {};
  constructor(public data: LogValueSetAny) {}
  getRange(start: number, end: number, uuid?: string, startOffset?: number): LogValueSetAny {
    let timestamps: number[];
    let values: any[];

    let cacheIndex: number | null = null;
    if (start === end && uuid !== undefined && uuid in this.getRangeCache) {
      cacheIndex = this.getRangeCache[uuid];
    }

    let startValueIndex = -1;
    if (
      cacheIndex !== null &&
      cacheIndex < this.data.timestamps.length &&
      !(this.data.timestamps[cacheIndex] > start)
    ) {
      // Search from previous location
      let rawIndex = this.data.timestamps.slice(cacheIndex).findIndex((x) => x > start);
      if (rawIndex !== -1) startValueIndex = rawIndex + cacheIndex;
    }
    if (startValueIndex === -1) {
      // Search from start
      startValueIndex = this.data.timestamps.findIndex((x) => x > start);
    }
    if (startValueIndex === -1) {
      startValueIndex = this.data.timestamps.length - 1;
    } else if (startValueIndex !== 0) {
      startValueIndex -= 1;
    }
    if (startOffset !== undefined && startOffset >= -startValueIndex) {
      startValueIndex += startOffset;
    }

    let endValueIndex = -1;
    if (cacheIndex !== null && cacheIndex < this.data.timestamps.length && !(this.data.timestamps[cacheIndex] >= end)) {
      // Search from previous location
      let rawIndex = this.data.timestamps.slice(cacheIndex).findIndex((x) => x >= end);
      if (rawIndex !== -1) endValueIndex = rawIndex + cacheIndex;
    }
    if (endValueIndex === -1) {
      // Search from start
      endValueIndex = this.data.timestamps.findIndex((x) => x >= end);
    }
    if (endValueIndex === -1 || endValueIndex === this.data.timestamps.length - 1) {
      // Extend to end of timestamps
      timestamps = this.data.timestamps.slice(startValueIndex);
      values = this.data.values.slice(startValueIndex);
    } else {
      timestamps = this.data.timestamps.slice(startValueIndex, endValueIndex + 1);
      values = this.data.values.slice(startValueIndex, endValueIndex + 1);
    }

    if (start === end && uuid !== undefined) {
      this.getRangeCache[uuid] = startValueIndex;
    }

    return { timestamps: timestamps, values: values };
  }
}
