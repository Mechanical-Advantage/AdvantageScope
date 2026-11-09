// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Time handling for the MUR live source (spec 01 §4.1). Pure: no DOM or Log access, so it can be
// unit tested with node:test.
//
// The Log stores float seconds. Unix-epoch nanoseconds (~1.8e18) do not fit in a double without losing
// precision, so every `t_ns` is converted with BigInt relative to a session epoch first, and only the small
// difference becomes a float.

import type { TelemetrySample } from "../../../../tools/mock-backend/src/contract";

const NS_PER_S = 1000000000n;

/**
 * In the unix clock domain, the session epoch sits this far before the first time reference, so history
 * fetched after connecting (up to the 5+ minute rolling buffer) still lands at positive seconds. The live
 * source trims everything before t = 0.
 */
export const UNIX_EPOCH_MARGIN_NS = 3600n * NS_PER_S;

/** Parses a decimal-string (or bigint) nanosecond timestamp. Returns null if it is not a valid integer. */
export function parseNs(value: string | bigint | null | undefined): bigint | null {
  if (typeof value === "bigint") return value;
  if (typeof value !== "string" || !/^-?\d+$/.test(value)) return null;
  return BigInt(value);
}

/** Converts nanoseconds to seconds since `epochNs`, doing the subtraction exactly in BigInt. */
export function nsToSessionSeconds(tNs: bigint, epochNs: bigint): number {
  const delta = tNs - epochNs;
  const whole = delta / NS_PER_S;
  const remainder = delta % NS_PER_S;
  return Number(whole) + Number(remainder) / 1e9;
}

/** Converts session seconds back to absolute nanoseconds (used for history query bounds). */
export function sessionSecondsToNs(seconds: number, epochNs: bigint): bigint {
  const whole = Math.floor(seconds);
  const fractionNs = Math.round((seconds - whole) * 1e9);
  return epochNs + BigInt(whole) * NS_PER_S + BigInt(fractionNs);
}

export interface SampleTime {
  /** Seconds since the session epoch. */
  seconds: number;
  /** True when this is a receive-time fallback for an unsynchronised source (shown with an indicator). */
  approximate: boolean;
}

export class SessionTimeBase {
  private epochNs: bigint | null = null;
  /** Returns the epoch, or null if no time reference has been seen yet. */
  getEpochNs(): bigint | null {
    return this.epochNs;
  }

  /** Fixes the epoch from a time reference if it is not set yet. */
  observeReference(refNs: bigint) {
    if (this.epochNs === null) {
      this.epochNs = refNs - UNIX_EPOCH_MARGIN_NS;
    }
  }

  /** Forgets everything learned from samples (new segment). Unix epochs are re-derived from the next sample. */
  resetSegment() {
    this.epochNs = null;
  }

  /** Returns the session time of a sample, or null if its timestamps can't be parsed. */
  sampleTime(sample: Pick<TelemetrySample, "t_ns" | "received_ns" | "time_quality">): SampleTime | null {
    const tNs = parseNs(sample.t_ns);
    const receivedNs = parseNs(sample.received_ns);
    if (tNs === null) return null;

    if (sample.time_quality !== "unsynchronised") {
      this.observeReference(tNs);
      return { seconds: nsToSessionSeconds(tNs, this.epochNs!), approximate: false };
    }

    // Unsynchronised: fall back to receive time
    const fallbackNs = receivedNs ?? tNs;
    this.observeReference(fallbackNs);
    return { seconds: nsToSessionSeconds(fallbackNs, this.epochNs!), approximate: true };
  }
}

/**
 * The live edge ("now") of the session in seconds. It follows the newest sample time and extrapolates with wall
 * time between batches, so the line graph scrolls smoothly. It never moves backwards within a segment.
 *
 */
export class LiveClock {
  private anchorTime: number | null = null;
  private anchorWallMs = 0;
  private lastOutput: number | null = null;

  /** Clears all state (new segment). */
  reset() {
    this.anchorTime = null;
    this.lastOutput = null;
  }

  /** Records a sample time. */
  observe(seconds: number, wallMs: number) {
    const extrapolated = this.anchorTime === null ? null : this.extrapolate(wallMs);
    if (extrapolated === null || seconds > extrapolated) {
      this.anchorTime = seconds;
      this.anchorWallMs = wallMs;
    }
  }

  /** Returns the live edge, or null before the first sample. */
  now(wallMs: number): number | null {
    if (this.anchorTime === null) return null;
    let output = this.extrapolate(wallMs);
    if (this.lastOutput !== null && output < this.lastOutput) output = this.lastOutput;
    this.lastOutput = output;
    return output;
  }

  private extrapolate(wallMs: number): number {
    const anchor = this.anchorTime!;
    return anchor + Math.max(0, wallMs - this.anchorWallMs) / 1000;
  }
}
