import Log from "../../shared/log/Log";
import WorkerManager from "../WorkerManager";

/** A provider of historical log data (i.e. all the data is returned at once). */
export class HistoricalDataSource {
  private WORKER_NAMES = {
    ".rlog": "hub$rlogWorker.js",
    ".wpilog": "hub$wpilogWorker.js",
    ".dslog": "hub$dsLogWorker.js",
    ".dsevents": "hub$dsLogWorker.js"
  };

  private paths: string[] = [];
  private status: HistoricalDataSourceStatus = HistoricalDataSourceStatus.Waiting;
  private statusCallback: ((status: HistoricalDataSourceStatus) => void) | null = null;
  private progressCallback: ((progress: number) => void) | null = null;
  private outputCallback: ((log: Log) => void) | null = null;

  /**
   * Generates log data from a set of files.
   * @param paths The paths to the log files
   * @param statusCallback A callback to be triggered when the status changes
   * @param progressCallback A callback to be triggered when the progress changes
   * @param outputCallback A callback to receive the generated log object
   */
  openFile(
    paths: string[],
    statusCallback: (status: HistoricalDataSourceStatus) => void,
    progressCallback: (progress: number) => void,
    outputCallback: (log: Log) => void
  ) {
    this.statusCallback = statusCallback;
    this.progressCallback = progressCallback;
    this.outputCallback = outputCallback;
    this.setStatus(HistoricalDataSourceStatus.Reading);

    // Post message to start reading
    paths.forEach((path) => {
      let newPath = path;
      if (path.endsWith(".dsevents")) {
        newPath = path.slice(0, -8) + "dslog";
      }
      if (!this.paths.includes(newPath)) {
        this.paths.push(newPath);
      }
    });
    window.sendMainMessage("historical-start", this.paths);
  }

  /** Cancels the read operation. */
  stop() {
    this.setStatus(HistoricalDataSourceStatus.Stopped);
  }

  /** Process new data from the main process, send to worker. */
  handleMainMessage(data: any) {
    if (this.status !== HistoricalDataSourceStatus.Reading) return;
    this.setStatus(HistoricalDataSourceStatus.Decoding);
    let fileContents: (Uint8Array | null)[][] = data;

    // Check for read error
    if (fileContents.every((contents) => contents === null)) {
      this.setStatus(HistoricalDataSourceStatus.Error);
      return;
    }

    // Start decodes
    let decodedLogs: (Log | null)[] = new Array(fileContents.length).fill(null);
    let progressValues: number[] = new Array(fileContents.length).fill(0);
    let completedCount = 0;
    for (let i = 0; i < fileContents.length; i++) {
      // Get contents and worker
      let contents = fileContents[i];
      let path = this.paths[i];
      let selectedWorkerName: string | null = null;
      Object.entries(this.WORKER_NAMES).forEach(([extension, workerName]) => {
        if (path.endsWith(extension)) {
          selectedWorkerName = workerName;
        }
      });
      if (!selectedWorkerName) {
        this.setStatus(HistoricalDataSourceStatus.Error);
        return;
      }

      // Start request
      WorkerManager.request("../bundles/" + selectedWorkerName, contents, (progress) => {
        progressValues[i] = progress;
        if (this.progressCallback && this.status === HistoricalDataSourceStatus.Decoding) {
          let totalProgress = progressValues.reduce((a, b) => a + b, 0) / progressValues.length;
          this.progressCallback(totalProgress);
        }
      })
        .then((response: any) => {
          if (this.status === HistoricalDataSourceStatus.Error || this.status === HistoricalDataSourceStatus.Stopped) {
            return;
          }
          decodedLogs[i] = Log.fromSerialized(response);
          completedCount++;
          if (completedCount === fileContents.length && this.status === HistoricalDataSourceStatus.Decoding) {
            // All decodes finised
            if (this.outputCallback !== null) {
              if (fileContents.length === 1) {
                this.outputCallback(decodedLogs[i]!);
              } else {
                this.outputCallback(Log.mergeLogs(decodedLogs.filter((log) => log !== null) as Log[]));
              }
            }
            this.setStatus(HistoricalDataSourceStatus.Ready);
          }
        })
        .catch(() => {
          this.setStatus(HistoricalDataSourceStatus.Error);
        });
    }
  }

  /** Updates the current status and triggers the callback if necessary. */
  private setStatus(status: HistoricalDataSourceStatus) {
    if (status !== this.status && this.status !== HistoricalDataSourceStatus.Stopped) {
      this.status = status;
      if (this.statusCallback !== null) this.statusCallback(status);
    }
  }
}

export enum HistoricalDataSourceStatus {
  Waiting,
  Reading,
  Decoding,
  Ready,
  Error,
  Stopped
}
