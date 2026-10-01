// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Log from "../../../shared/log/Log";
import { LiveDataSource, LiveDataSourceStatus } from "../LiveDataSource";
import RRLOGDecoder from "./RRLOGDecoder";

/**
 * Live source for FateWeaver's FlightProjector.
 *
 * The robot broadcasts exactly the bytes a ".fate" file would contain, so this decodes the stream
 * with the same RRLOGDecoder used for files: it retains partial trailing entries between chunks,
 * and resets its channel table when a new "RR" header arrives mid-stream (which is what happens
 * when a new OpMode starts while this stays connected).
 */
export default class FateWeaverSource extends LiveDataSource {
  private FATEWEAVER_PORT = 8110;
  private RECONNECT_DELAY_MS = 500;
  private TIME_SYNC_INTERVAL = 0.5;

  private socket: WebSocket | null = null;
  private decoder: RRLOGDecoder | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private liveShiftInterval: NodeJS.Timeout | null = null;
  private lastTimeSync = 0;
  private liveZeroTime = 0;
  private targetLiveZeroTime = 0;

  connect(
    address: string,
    statusCallback: (status: LiveDataSourceStatus) => void,
    outputCallback: (log: Log, timeSupplier: () => number) => void
  ) {
    // Like RLOG, this derives time from the robot's monotonic clock and runs its own zero time
    // smoothing below, so the base class's "liveDiscard" trimming is not used.
    super.connect(address, statusCallback, outputCallback, false);

    if (window.preferences === null) {
      this.setStatus(LiveDataSourceStatus.Error);
      return;
    }
    this.openSocket();

    // Shift live zero time towards target
    this.liveShiftInterval = setInterval(() => {
      this.liveZeroTime = this.liveZeroTime * 0.98 + this.targetLiveZeroTime * 0.02;
    }, 1000 / 60);
  }

  stop() {
    super.stop();
    if (this.reconnectTimeout !== null) clearTimeout(this.reconnectTimeout);
    if (this.liveShiftInterval !== null) clearInterval(this.liveShiftInterval);
    this.closeSocket();
  }

  private openSocket() {
    // The decoder holds per-connection state (channel table, partial entry bytes), and the robot
    // replays the header and schemas to every new client, so this always starts fresh.
    this.log = new Log();
    this.decoder = new RRLOGDecoder();
    this.liveZeroTime = 0;
    this.targetLiveZeroTime = 0;
    this.setStatus(LiveDataSourceStatus.Connecting);

    const socket = new WebSocket("ws://" + this.address + ":" + this.FATEWEAVER_PORT);
    socket.binaryType = "arraybuffer";
    socket.onmessage = (event) => this.handleChunk(new Uint8Array(event.data as ArrayBuffer));
    socket.onclose = () => this.reconnect();
    socket.onerror = () => socket.close(); // onclose always follows, so reconnect happens there
    this.socket = socket;
  }

  private closeSocket() {
    if (this.socket === null) return;
    // Detach handlers first so closing here doesn't schedule a reconnect
    this.socket.onclose = null;
    this.socket.onerror = null;
    this.socket.onmessage = null;
    this.socket.close();
    this.socket = null;
  }

  private handleChunk(chunk: Uint8Array) {
    if (this.log === null || this.decoder === null) return;
    if (this.status === LiveDataSourceStatus.Stopped) return;

    if (!this.decoder.decode(this.log, chunk)) {
      // Bad magic, unsupported revision, or a corrupt entry. The decoder's offsets are no longer
      // trustworthy, so reconnect and start over rather than try to resync.
      this.socket?.close();
      return;
    }

    // Reset time sync at start
    const now = new Date().getTime() / 1000;
    if (this.status === LiveDataSourceStatus.Connecting) {
      this.liveZeroTime = now;
      this.targetLiveZeroTime = now;
      this.lastTimeSync = now;
    }

    // New data, everything normal
    this.setStatus(LiveDataSourceStatus.Active);

    // Update time sync
    if (this.log.getFieldKeys().length > 0 && now - this.lastTimeSync > this.TIME_SYNC_INTERVAL) {
      const logRange = this.log.getTimestampRange();
      this.targetLiveZeroTime = now - (logRange[1] - logRange[0]);
      this.lastTimeSync = now;
    }

    // Run output callback
    if (this.outputCallback !== null) {
      this.outputCallback(this.log, () => {
        if (this.log) {
          return new Date().getTime() / 1000 - this.liveZeroTime + this.log.getTimestampRange()[0];
        } else {
          return 0;
        }
      });
    }
  }

  private reconnect() {
    if (this.status === LiveDataSourceStatus.Stopped) return;
    this.setStatus(LiveDataSourceStatus.Connecting);
    this.socket = null;
    this.reconnectTimeout = setTimeout(() => this.openSocket(), this.RECONNECT_DELAY_MS);
  }
}
