import Log from "../../lib/log/Log";

/** A provider of live log data (i.e. the data is updated as it is received). */
export interface LiveDataSource {
  /**
   * Generates log data from a live source.
   * @param address The IP address of the source
   * @param log A log instance to update with data
   * @param statusCallback A callback to be triggered when the status changes
   * @param outputCallback A callback to be triggered when new data is available
   */
  connect(
    address: string,
    log: Log,
    statusCallback: (status: LiveDataSourceStatus) => void,
    outputCallback: () => void
  ): void;

  /** Cancels the connection. */
  stop(): void;
}

export enum LiveDataSourceStatus {
  Waiting,
  Connecting,
  Active,
  Stopped
}
