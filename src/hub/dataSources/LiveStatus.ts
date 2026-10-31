// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Connection state that a live source can expose beyond LiveDataSourceStatus (spec 01 §6 "Connection state"):
// backend connected vs car online vs signal fresh, plus sim clock state. Read by the status pill and sidebar.

export type BackendState = "connecting" | "connected" | "error";
export type Freshness = "online" | "stale" | "offline";
export type SimClockState = "running" | "paused" | "reset";
export type SimAction = "pause" | "resume" | "reset";

export interface LiveStatusSummary {
  backend: BackendState;
  /** Human-readable detail for the backend state (e.g. the last error). */
  backendDetail: string;

  /** Aggregate availability over all signals that have ever been seen, or null if unknown. */
  car: Freshness | null;
  signalCounts: { online: number; stale: number; offline: number; neverSeen: number };

  /** Sim clock state, or null when the backend is not in the sim clock domain. */
  sim: { state: SimClockState; timeS: number; speed: number; resetCount: number } | null;
  /** Whether the backend exposes sim control endpoints (GET /api/v1/sim/status). */
  simControls: boolean;

  /** False when the history endpoint returned 501. Null if not known yet. */
  historyAvailable: boolean | null;
  /** Signals currently receiving unsynchronised timestamps (shown with receive-time fallback). */
  unsynchronisedCount: number;
  /** Number of segments started (sim resets, clock jumps) in this connection. */
  segmentIndex: number;
  /** Catalogue epoch and revision from the backend. */
  catalogue: { epoch: string; revision: number; signals: number } | null;
}

export interface LiveStatusProvider {
  getLiveStatus(): LiveStatusSummary;
  /** Freshness of a sidebar field, or null if the key is not a signal. */
  getFieldFreshness(key: string): Freshness | null;
  /** Whether a field's recent samples have unsynchronised timestamps. */
  isFieldUnsynchronised(key: string): boolean;
  /** Calls a sim control endpoint. Rejects with a message on failure. */
  simControl(action: SimAction): Promise<void>;
}
