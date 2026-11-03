// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Log from "../../shared/log/Log";
import { LiveDataSource, LiveDataSourceStatus } from "./LiveDataSource";

/** Owns an initial attempt; only established connections may keep reconnecting. */
export class LiveConnection {
  private connected = false;
  private stopped = false;
  private failing = false;
  private active = false;
  private timeout: ReturnType<typeof setTimeout> | null = null;

  constructor(readonly source: LiveDataSource) {}

  connect(
    address: string,
    status: (status: LiveDataSourceStatus) => void,
    output: (log: Log, time: () => number) => void,
    failed: (detail: string) => void
  ) {
    const fail = (detail: string) => {
      if (this.stopped) return;
      this.stop();
      failed(detail);
    };
    this.timeout = setTimeout(
      () => fail(`Timed out connecting to ${address}. Check the server and address, then retry.`),
      10000
    );
    try {
      this.source.connect(
        address,
        (next) => {
          if (this.stopped || this.failing) return;
          this.active = next === LiveDataSourceStatus.Active;
          if (next === LiveDataSourceStatus.Error && !this.connected) {
            this.failing = true;
            const detail = this.source.getStatusProvider()?.getLiveStatus().backendDetail;
            // Let synchronous source setup finish before disposing its resources.
            queueMicrotask(() =>
              fail(
                detail
                  ? `${detail} (${address}). Check the connection settings, then retry.`
                  : `Cannot connect to ${address}. Check the server and address, then retry.`
              )
            );
            return;
          }
          if (next === LiveDataSourceStatus.Active) {
            this.connected = true;
            if (this.timeout !== null) clearTimeout(this.timeout);
            this.timeout = null;
          }
          status(next);
        },
        (log, time) => {
          if (this.active && !this.stopped) output(log, time);
        }
      );
    } catch {
      fail(`Cannot connect to ${address}. Check the server and connection settings, then retry.`);
    }
  }

  stop() {
    if (this.stopped) return;
    this.stopped = true;
    if (this.timeout !== null) clearTimeout(this.timeout);
    this.timeout = null;
    this.source.stop();
  }
}
