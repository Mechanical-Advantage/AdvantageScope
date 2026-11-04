// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import type { SamplesOp, ServerOp, TelemetrySample } from "../../../src/shared/mur/contract.ts";
import { MockBackend, type BackendOptions } from "../src/backend.ts";
import { Session, type SessionOptions } from "../src/session.ts";

export const START_NS = 1_793_328_600_000_000_000n;

/** A session wired to an in-memory transport and a manual clock. */
export class Harness {
  backend: MockBackend;
  session: Session;
  out: ServerOp[] = [];
  clockMs = 0;
  buffered = 0;

  constructor(opts: Partial<BackendOptions> = {}, sessionOpts: Partial<SessionOptions> = {}) {
    this.backend = new MockBackend({ startTimeNs: START_NS, ...opts });
    this.session = new Session(
      this.backend,
      { send: (t) => this.out.push(JSON.parse(t)), bufferedAmount: () => this.buffered },
      { nowMs: () => this.clockMs, ...sessionOpts }
    );
  }

  send(op: object): void {
    this.session.handle(JSON.stringify(op));
  }

  /** Advance sim + wall clock by n ticks (10 ms each), flushing after every tick. */
  run(ticks: number): void {
    for (let i = 0; i < ticks; i++) {
      this.backend.advance(1);
      this.clockMs += 10;
      this.session.flush();
    }
  }

  take(): ServerOp[] {
    const o = this.out;
    this.out = [];
    return o;
  }
}

export function samplesOf(ops: ServerOp[], subId?: string): TelemetrySample[] {
  return ops
    .filter((o): o is SamplesOp => o.op === "samples" && (subId === undefined || o.subscription_id === subId))
    .flatMap((o) => o.samples);
}

export const P = "vehicles/mur27";
