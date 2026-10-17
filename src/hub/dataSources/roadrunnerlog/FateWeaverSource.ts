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
 * The robot sends the bytes a ".fate" file would contain, one whole entry per message, so this
 * uses the same RRLOGDecoder as files. A new "RR" header mid-stream (a new OpMode) resets its
 * channel table. A message for an unknown channel is skipped and the robot is asked to resend the
 * header and schemas. The log and time origin survive reconnects.
 */
export default class FateWeaverSource extends LiveDataSource {
  private FATEWEAVER_PORT = 8110;
  private RECONNECT_DELAY_MS = 500;
  private TIME_SYNC_INTERVAL = 0.5;
  private RESYNC_REQUEST = "resync";
  private RESYNC_TIMEOUT_MS = 2000;

  private socket: WebSocket | null = null;
  private decoder: RRLOGDecoder | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private resyncTimeout: NodeJS.Timeout | null = null;
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
    // The robot replays the header and schemas to each new client, so each connection gets a new
    // decoder. The log and time origin carry over to keep timestamps continuous.
    let previous = this.decoder;
    if (this.log === null) {
      this.log = new Log();
      previous = null;
    }
    this.decoder = new RRLOGDecoder(true, previous);
    this.clearResync();
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
    this.clearResync();
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
      // Bad magic, unsupported revision, or corrupt entry; reconnect for a fresh header and schemas
      this.socket?.close();
      return;
    }

    if (this.decoder.clockReset) {
      // Robot restarted, so its timestamps no longer match this log; start a new one
      this.log = null;
      this.decoder = null;
      this.socket?.close();
      return;
    }

    if (this.decoder.needsResync) {
      this.requestResync();
    } else {
      this.clearResync();
    }

    // Reset time sync at start, from the end of the log if it already has data
    const now = new Date().getTime() / 1000;
    if (this.status === LiveDataSourceStatus.Connecting) {
      let logDuration = 0;
      if (this.log.getFieldKeys().length > 0) {
        const logRange = this.log.getTimestampRange();
        logDuration = logRange[1] - logRange[0];
      }
      this.liveZeroTime = now - logDuration;
      this.targetLiveZeroTime = this.liveZeroTime;
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

  /** Asks the robot to resend the header and schemas, reconnecting if they don't arrive in time. */
  private requestResync() {
    if (this.resyncTimeout !== null) return;
    this.socket?.send(this.RESYNC_REQUEST);
    this.resyncTimeout = setTimeout(() => this.socket?.close(), this.RESYNC_TIMEOUT_MS);
  }

  private clearResync() {
    if (this.resyncTimeout === null) return;
    clearTimeout(this.resyncTimeout);
    this.resyncTimeout = null;
  }

  private reconnect() {
    if (this.status === LiveDataSourceStatus.Stopped) return;
    this.setStatus(LiveDataSourceStatus.Connecting);
    this.socket = null;
    this.reconnectTimeout = setTimeout(() => this.openSocket(), this.RECONNECT_DELAY_MS);
  }
}
