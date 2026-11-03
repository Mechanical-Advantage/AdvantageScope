// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Log from "../../shared/log/Log";
import { createUUID } from "../../shared/util";
import LiveDataTuner from "./LiveDataTuner";
import { LiveStatusProvider } from "./LiveStatus";

/** A provider of live log data (i.e. the data is updated as it is received). */
export abstract class LiveDataSource {
  protected UUID: string = createUUID();
  protected status: LiveDataSourceStatus = LiveDataSourceStatus.Waiting;
  protected log: Log | null = null;

  protected address: string | null = null;
  protected statusCallback: ((status: LiveDataSourceStatus) => void) | null = null;
  protected outputCallback: ((log: Log, timeSupplier: () => number) => void) | null = null;

  /**
   * Called after the source starts a new segment (e.g. a sim reset), once the new log has been passed to the
   * output callback. The hub uses it to reset the selection and live edge, since time has jumped backwards.
   */
  newSegmentCallback: (() => void) | null = null;

  private clearDataCallback: NodeJS.Timeout | null = null;
  private timeSupplier: (() => number) | null = null;

  /**
   * Generates log data from a live source.
   * @param address The IP address of the source
   * @param statusCallback A callback to be triggered when the status changes
   * @param outputCallback A callback to be triggered whenever new data is available. This function is given a reference to the log object and a supplier function that returns the current server timestamp.
   */
  connect(
    address: string,
    statusCallback: (status: LiveDataSourceStatus) => void,
    outputCallback: (log: Log, timeSupplier: () => number) => void,
    enableClearData = true
  ) {
    this.address = address;
    this.statusCallback = statusCallback;
    this.outputCallback = (log: Log, timeSupplier: () => number) => {
      this.timeSupplier = timeSupplier;
      outputCallback(log, timeSupplier);
    };
    this.setStatus(LiveDataSourceStatus.Connecting);

    // Clear old data
    if (enableClearData) {
      this.clearDataCallback = setInterval(() => {
        if (this.log && this.timeSupplier) {
          this.log.discardLiveData(this.timeSupplier(), window.preferences?.liveDiscard);
        }
      }, 1000 / 60);
    }
  }

  /** Cancels the connection. */
  stop() {
    this.setStatus(LiveDataSourceStatus.Stopped);
    if (this.clearDataCallback) clearInterval(this.clearDataCallback);
  }

  /** Process new data from the main process, overriden by subclass. */
  handleMainMessage(data: any) {}

  /** Returns detailed connection state (backend/car/signal/sim), or null if the source only has a status. */
  getStatusProvider(): LiveStatusProvider | null {
    return null;
  }

  /** Returns an object to be used for sending tuning data, or null if tuning is not supported. */
  getTuner(): LiveDataTuner | null {
    return null;
  }

  /** Updates the current status and triggers the callback if necessary. */
  protected setStatus(status: LiveDataSourceStatus) {
    if (status !== this.status && this.status !== LiveDataSourceStatus.Stopped) {
      this.status = status;
      if (this.statusCallback !== null) this.statusCallback(status);
    }
    if (status !== LiveDataSourceStatus.Active) {
      this.timeSupplier = null;
    }
  }
}

export enum LiveDataSourceStatus {
  Waiting,
  Connecting,
  Active,
  Error,
  Stopped
}
