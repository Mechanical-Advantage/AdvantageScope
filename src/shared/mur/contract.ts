// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Shared runtime helpers; wire types are generated from the pinned JSON Schema.
export type * from "./live-types.ts";
import type { SignalType } from "./live-types.ts";

export const API_VERSION = 1;
export const NUMERIC_TYPES: readonly SignalType[] = ["float64", "int64"];

/** Deduplication identity: path, publisher stream and sequence. */
export function sampleKey(s: { path: string; stream_id: string; seq: number }): string {
  return `${s.path}\u0000${s.stream_id}\u0000${s.seq}`;
}

/** Preserve full int64 precision when parsing the wire value. */
export function parseInt64(v: number | string): bigint {
  return BigInt(v);
}
