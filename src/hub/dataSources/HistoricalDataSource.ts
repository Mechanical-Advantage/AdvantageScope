import Log from "../../shared/log/Log";
import WorkerManager from "../WorkerManager";

/** A provider of historial log data (i.e. all of the data is returned at once). */
export class HistorialDataSource {
  private WORKER_NAMES = {
    ".rlog": "hub$rlogWorker.js",
    ".wpilog": "hub$wpilogWorker.js",
    ".dslog": "hub$dsLogWorker.js",
    ".dsevents": "hub$dsLogWorker.js"
  };

  private path: string | null = null;
  private status: HistorialDataSourceStatus = HistorialDataSourceStatus.Waiting;
  private statusCallback: ((status: HistorialDataSourceStatus) => void) | null = null;
  private outputCallback: ((log: Log) => void) | null = null;

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
    this.path = path;
    this.statusCallback = statusCallback;
    this.outputCallback = outputCallback;
    this.setStatus(HistorialDataSourceStatus.Reading);

    // Post message to start reading
    let paths = [path];
    if (path.endsWith(".dslog")) {
      paths.push(path.slice(0, -5) + "dsevents");
    } else if (path.endsWith(".dsevents")) {
      paths.splice(0, 0, path.slice(0, -8) + "dslog");
    }
    window.sendMainMessage("historical-start", paths);
  }

  /** Cancels the read operation. */
  stop() {
    this.setStatus(HistorialDataSourceStatus.Stopped);
  }

  /** Process new data from the main process, send to worker. */
  handleMainMessage(data: any) {
    if (this.status != HistorialDataSourceStatus.Reading) return;
    this.setStatus(HistorialDataSourceStatus.Decoding);
    let fileContents: string[] = data;

    // Check for read error
    if (fileContents.every((contents) => contents === null)) {
      this.setStatus(HistorialDataSourceStatus.Error);
      return;
    }

    // Start decode
    let selectedWorkerName: string | null = null;
    Object.entries(this.WORKER_NAMES).forEach(([extension, workerName]) => {
      if (this.path?.endsWith(extension)) {
        selectedWorkerName = workerName;
      }
    });
    if (!selectedWorkerName) {
      this.setStatus(HistorialDataSourceStatus.Error);
      return;
    }
    WorkerManager.request("../bundles/" + selectedWorkerName, fileContents)
      .then((response: any) => {
        if (this.status == HistorialDataSourceStatus.Error || this.status == HistorialDataSourceStatus.Stopped) return;
        if (this.outputCallback != null) this.outputCallback(Log.fromSerialized(response));
        this.setStatus(HistorialDataSourceStatus.Ready);
      })
      .catch(() => {
        this.setStatus(HistorialDataSourceStatus.Error);
      });
  }

  /** Updates the current status and triggers the callback if necessary. */
  private setStatus(status: HistorialDataSourceStatus) {
    if (status != this.status && this.status != HistorialDataSourceStatus.Stopped) {
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
