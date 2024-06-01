import Log from "../../shared/log/Log";
import { createUUID } from "../../shared/util";
import LiveDataTuner from "./LiveDataTuner";

/** A provider of live log data (i.e. the data is updated as it is received). */
export abstract class LiveDataSource {
  protected UUID: string = createUUID();
  protected status: LiveDataSourceStatus = LiveDataSourceStatus.Waiting;
  protected log: Log | null = null;

  protected address: string | null = null;
  protected statusCallback: ((status: LiveDataSourceStatus) => void) | null = null;
  protected outputCallback: ((log: Log, timeSupplier: () => number) => void) | null = null;

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
    outputCallback: (log: Log, timeSupplier: () => number) => void
  ) {
    this.address = address;
    this.statusCallback = statusCallback;
    this.outputCallback = (log: Log, timeSupplier: () => number) => {
      this.timeSupplier = timeSupplier;
      outputCallback(log, timeSupplier);
    };
    this.setStatus(LiveDataSourceStatus.Connecting);

    // Clear old data
    this.clearDataCallback = setInterval(() => {
      if (this.log && this.timeSupplier) {
        let liveDiscardSecs = window.preferences?.liveDiscard;
        if (liveDiscardSecs !== undefined && liveDiscardSecs !== -1) {
          let minTime = this.timeSupplier() - liveDiscardSecs;
          this.log.clearBeforeTime(Math.max(0, minTime));
        }
      }
    }, 1000 / 60);
  }

  /** Cancels the connection. */
  stop() {
    this.setStatus(LiveDataSourceStatus.Stopped);
    if (this.clearDataCallback) clearInterval(this.clearDataCallback);
  }

  /** Process new data from the main process, overriden by subclass. */
  handleMainMessage(data: any) {}

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
