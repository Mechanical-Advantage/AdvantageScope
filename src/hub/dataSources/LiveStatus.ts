// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export type BackendState = "connecting" | "connected" | "error";
export type Freshness = "online" | "stale" | "offline" | "unknown";

export interface LiveStatusSummary {
  backend: BackendState;
  hasFreshData: boolean;
  backendDetail: string;
  viewedRun: number;
  runCount: number;
}

export interface LiveStatusProvider {
  getFieldAge(key: string): number | null;
  getLiveStatus(): LiveStatusSummary;
  /** Freshness of a sidebar field, or null if the key is not a signal. */
  getFieldFreshness(key: string): Freshness | null;
  /** Whether a field's recent samples have unsynchronised timestamps. */
  isFieldUnsynchronised(key: string): boolean;
}
