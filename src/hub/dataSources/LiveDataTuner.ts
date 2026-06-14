// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/** A target for live tuning values, connected to a live data source. */
export default interface LiveDataTuner {
  /** Returns whether any key supports tuning. */
  hasTunableFields(): boolean;

  /** Returns whether a particular key support tuning. */
  isTunable(key: string): boolean;

  /** Sets the tuned value of a key. */
  publish(key: string, value: number | boolean): void;

  /** Unpublished a tuned key. */
  unpublish(key: string): void;
}
