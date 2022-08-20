import Log from "../../lib/log/Log";
import NamedMessage from "../../lib/NamedMessage";

/** A provider of historial log data (i.e. all of the data is returned at once). */
export abstract class HistorialDataSource {
  protected status: HistorialDataSourceStatus = HistorialDataSourceStatus.Waiting;

  protected sendMainMessage: (name: string, data: any) => void;
  protected statusCallback: ((status: HistorialDataSourceStatus) => void) | null = null;
  protected outputCallback: ((log: Log) => void) | null = null;

  constructor(sendMainMessage: (name: string, data: any) => void) {
    this.sendMainMessage = sendMainMessage;
  }

  /**
   * Generates log data from a file.
   * @param path The path to the log file
   * @param statusCallback A callback to be triggered when the status changes
   * @param outputCallback A callback to receive the generated log object
   */
  openFile(
    path: string,
    statusCallback: (status: HistorialDataSourceStatus) => void,
    outputCallback: (log: Log) => void
  ) {
    this.statusCallback = statusCallback;
    this.outputCallback = outputCallback;
    this.setStatus(HistorialDataSourceStatus.Reading);

    // Post message to start reading
    this.sendMainMessage("historical-start", path);
  }

  /** Cancels the read operation. */
  stop(): void {
    this.setStatus(HistorialDataSourceStatus.Stopped);
  }

  /** Process new data from a message. */
  handleMainMessage(data: any) {}

  /** Update the current status and triggers the callback if necessary. */
  protected setStatus(status: HistorialDataSourceStatus) {
    if (status != this.status) {
      this.status = status;
      if (this.statusCallback != null) this.statusCallback(status);
    }
  }
}

export enum HistorialDataSourceStatus {
  Waiting,
  Reading,
  Decoding,
  Ready,
  Error,
  Stopped
}
