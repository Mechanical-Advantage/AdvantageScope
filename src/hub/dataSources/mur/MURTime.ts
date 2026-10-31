// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Time handling for the MUR live source (spec 01 §4.1, spec 02 §4). Pure: no DOM or Log access, so it can be
// unit tested with node:test.
//
// The Log stores float seconds. Unix-epoch nanoseconds (~1.8e18) do not fit in a double without losing
// precision, so every `t_ns` is converted with BigInt relative to a session epoch first, and only the small
// difference becomes a float.

import type { ClockDomain, TelemetrySample } from "../../../../tools/mock-backend/src/contract";

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

/**
 * Maps sample timestamps onto the session timeline.
 *
 * - `sim` domain: `t_ns` is sim time starting at 0, so the epoch is 0.
 * - `unix` domain: the epoch is fixed from the first time reference minus `UNIX_EPOCH_MARGIN_NS`.
 *
 * Samples with `time_quality: "unsynchronised"` use their receive time instead (spec 01 §4.1 allows this for
 * approximate live display). `received_ns` is always Unix time, so in the sim domain it is mapped onto the sim
 * clock from the most recent trusted sample (its t and receive time) and the sim speed:
 * `t_ref + (received - received_ref) * speed`. Until a trusted sample is known, the source's own `t_ns` is
 * used, still flagged approximate.
 */
export class SessionTimeBase {
  private domain: ClockDomain = "unix";
  private epochNs: bigint | null = null;
  private reference: { tNs: bigint; receivedNs: bigint } | null = null;
  private simRate = 1;

  constructor(domain: ClockDomain = "unix") {
    this.setDomain(domain);
  }

  getDomain(): ClockDomain {
    return this.domain;
  }

  /** Sets the clock domain (from the catalogue snapshot). Changing domain resets the epoch. */
  setDomain(domain: ClockDomain) {
    if (domain === this.domain && this.epochNs !== null) return;
    this.domain = domain;
    this.epochNs = domain === "sim" ? 0n : null;
    this.reference = null;
  }

  /** Sets the sim speed (sim seconds per wall second), used to map receive times onto the sim clock. */
  setSimRate(rate: number) {
    this.simRate = rate > 0 ? rate : 1;
  }

  /** Returns the epoch, or null if no time reference has been seen yet (unix domain only). */
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
    this.epochNs = this.domain === "sim" ? 0n : null;
    this.reference = null;
  }

  /** Returns the session time of a sample, or null if its timestamps can't be parsed. */
  sampleTime(sample: Pick<TelemetrySample, "t_ns" | "received_ns" | "time_quality">): SampleTime | null {
    const tNs = parseNs(sample.t_ns);
    const receivedNs = parseNs(sample.received_ns);
    if (tNs === null) return null;

    if (sample.time_quality !== "unsynchronised") {
      this.observeReference(tNs);
      if (receivedNs !== null) this.reference = { tNs: tNs, receivedNs: receivedNs };
      return { seconds: nsToSessionSeconds(tNs, this.epochNs!), approximate: false };
    }

    // Unsynchronised: fall back to receive time
    let fallbackNs = tNs;
    if (receivedNs !== null) {
      if (this.domain === "unix") {
        fallbackNs = receivedNs;
      } else if (this.reference !== null) {
        const wallDeltaNs = Number(receivedNs - this.reference.receivedNs);
        fallbackNs = this.reference.tNs + BigInt(Math.round(wallDeltaNs * this.simRate));
      }
    }
    this.observeReference(fallbackNs);
    return { seconds: nsToSessionSeconds(fallbackNs, this.epochNs!), approximate: true };
  }
}

/**
 * The live edge ("now") of the session in seconds. It follows the newest sample time and extrapolates with wall
 * time between batches, so the line graph scrolls smoothly. It never moves backwards within a segment.
 *
 * - unix domain: extrapolates at 1x indefinitely (time passes even when the car is silent).
 * - sim domain: extrapolates at the sim speed, but only up to `SIM_MAX_EXTRAPOLATION_S` past the newest data,
 *   and not at all while the sim is paused. A paused sim therefore freezes the live edge.
 */
export class LiveClock {
  static readonly SIM_MAX_EXTRAPOLATION_S = 0.5;

  private domain: ClockDomain;
  private anchorTime: number | null = null;
  private anchorWallMs = 0;
  private maxDataTime: number | null = null;
  private running = true;
  private rate = 1;
  private lastOutput: number | null = null;

  constructor(domain: ClockDomain = "unix") {
    this.domain = domain;
  }

  setDomain(domain: ClockDomain) {
    this.domain = domain;
  }

  /** Clears all state (new segment). */
  reset() {
    this.anchorTime = null;
    this.maxDataTime = null;
    this.lastOutput = null;
  }

  /** Updates the sim run state. Pausing freezes the edge at its current value. */
  setRunning(running: boolean, rate: number, wallMs: number) {
    if (this.anchorTime !== null) {
      // Re-anchor at the current output so the edge is continuous across the state change
      const current = this.now(wallMs);
      this.anchorTime = current;
      this.anchorWallMs = wallMs;
    }
    this.running = running;
    this.rate = rate > 0 ? rate : 1;
  }

  isRunning(): boolean {
    return this.running;
  }

  /** Records a sample time. */
  observe(seconds: number, wallMs: number) {
    if (this.maxDataTime === null || seconds > this.maxDataTime) this.maxDataTime = seconds;
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
    if (this.domain === "sim" && !this.running) return anchor;
    const rate = this.domain === "sim" ? this.rate : 1;
    let output = anchor + (Math.max(0, wallMs - this.anchorWallMs) / 1000) * rate;
    if (this.domain === "sim" && this.maxDataTime !== null) {
      output = Math.min(output, Math.max(anchor, this.maxDataTime + LiveClock.SIM_MAX_EXTRAPOLATION_S));
    }
    return output;
  }
}
