import Log from "../../shared/log/Log";
import { getOrDefault } from "../../shared/log/LogUtil";
import LoggableType from "../../shared/log/LoggableType";
import WorkerManager from "../WorkerManager";

/** A provider of historical log data (i.e. all the data is returned at once). */
export class HistoricalDataSource {
  private WORKER_NAMES = {
    ".rlog": "hub$rlogWorker.js",
    ".wpilog": "hub$wpilogWorker.js",
    ".hoot": "hub$wpilogWorker.js", // Converted to WPILOG by main process
    ".dslog": "hub$dsLogWorker.js",
    ".dsevents": "hub$dsLogWorker.js"
  };

  private paths: string[] = [];
  private mockProgress: number = 0;
  private status: HistoricalDataSourceStatus = HistoricalDataSourceStatus.Waiting;
  private statusCallback: ((status: HistoricalDataSourceStatus) => void) | null = null;
  private progressCallback: ((progress: number) => void) | null = null;
  private outputCallback: ((log: Log) => void) | null = null;
  private customError: string | null = null;

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

    // Post message to start reading
    for (let i = 0; i < paths.length; i++) {
      let path = paths[i];
      let newPath = path;
      if (path.endsWith(".dsevents")) {
        newPath = path.slice(0, -8) + "dslog";
      }
      if (window.platform !== "win32" && path.endsWith(".hoot")) {
        this.customError = "Hoot log files cannot be decoded on macOS or Linux.";
        this.setStatus(HistoricalDataSourceStatus.Error);
        return;
      }
      if (!this.paths.includes(newPath)) {
        this.paths.push(newPath);
      }
    }
    this.setStatus(HistoricalDataSourceStatus.Reading);
    window.sendMainMessage("historical-start", this.paths);

    // Start mock progress updates
    let startTime = new Date().getTime();
    let sendMockProgress = () => {
      if (this.status === HistoricalDataSourceStatus.Reading) {
        let time = (new Date().getTime() - startTime) / 1000;
        this.mockProgress = HistoricalDataSource.calcMockProgress(time);
        if (this.progressCallback !== null) {
          this.progressCallback(this.mockProgress);
        }
        window.requestAnimationFrame(sendMockProgress);
      }
    };
    window.requestAnimationFrame(sendMockProgress);
  }

  /** Cancels the read operation. */
  stop() {
    this.setStatus(HistoricalDataSourceStatus.Stopped);
  }

  /** Returns an alternative error message to be displayed if log loading fails. */
  getCustomError(): string | null {
    return this.customError;
  }

  /** Process new data from the main process, send to worker. */
  handleMainMessage(data: any) {
    if (this.status !== HistoricalDataSourceStatus.Reading) return;
    this.setStatus(HistoricalDataSourceStatus.Decoding);
    this.customError = data.error;
    let fileContents: (Uint8Array | null)[][] = data.files;

    // Check for read error (at least one file is all null)
    if (!fileContents.every((contents) => !contents.every((buffer) => buffer === null))) {
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
          let decodeProgress = progressValues.reduce((a, b) => a + b, 0) / progressValues.length;
          let totalProgress = this.mockProgress + decodeProgress * (1 - this.mockProgress);
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
            let log: Log =
              fileContents.length === 1
                ? decodedLogs[i]!
                : Log.mergeLogs(decodedLogs.filter((log) => log !== null) as Log[]);
            if (this.outputCallback !== null) {
              this.outputCallback(log);
            }
            this.setStatus(HistoricalDataSourceStatus.Ready);

            // Hoot non-Pro warning
            if (data.hasHootNonPro && !window.preferences?.skipHootNonProWarning) {
              window.sendMainMessage("hoot-non-pro-warning");
            }
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

  /** Calculates a mock progress value for the initial load time. */
  private static calcMockProgress(time: number): number {
    // https://www.desmos.com/calculator/86u4rnu8ob
    return 0.5 - 0.5 / (0.1 * time + 1);
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
