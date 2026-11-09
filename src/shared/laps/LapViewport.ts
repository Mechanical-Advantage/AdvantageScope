// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/** A graph-local lap viewport. A null range follows the full lap as it grows. */
export class LapViewport {
  private mode = "time";
  private bounds: [number, number] = [0, 1];
  private range: [number, number] | null = null;

  get active() {
    return this.mode !== "time";
  }

  update(mode: string, bounds: [number, number]): [number, number] {
    if (mode !== this.mode) this.range = null;
    this.mode = mode;
    this.bounds = bounds;
    if (this.range) this.range = this.clamp(this.range);
    return this.range ?? bounds;
  }

  scroll(dx: number, dy: number, width: number, anchor = 0.5) {
    if (!this.active || width <= 0 || (dx === 0 && dy === 0)) return;
    const range = this.range ?? this.bounds;
    const span = range[1] - range[0];
    const fraction = Math.max(0, Math.min(1, anchor));
    const nextSpan = Math.min(this.bounds[1] - this.bounds[0], Math.max(0.001, span * Math.pow(1.001, dy)));
    const start = range[0] + (dx * span) / width + (span - nextSpan) * fraction;
    const next = this.clamp([start, start + nextSpan]);
    this.range = next[1] - next[0] >= this.bounds[1] - this.bounds[0] ? null : next;
  }

  /** Shows one stretch of the lap, such as a sector double-clicked on the split bar. */
  zoomTo(range: [number, number]) {
    if (!this.active || !(range[1] > range[0])) return;
    const next = this.clamp(range);
    this.range = next[1] - next[0] >= this.bounds[1] - this.bounds[0] ? null : next;
  }

  private clamp(range: [number, number]): [number, number] {
    const span = Math.min(range[1] - range[0], this.bounds[1] - this.bounds[0]);
    const start = Math.max(this.bounds[0], Math.min(range[0], this.bounds[1] - span));
    return [start, start + span];
  }
}
