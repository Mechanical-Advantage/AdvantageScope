import Log from "../../shared/log/Log";
import LogField from "../../shared/log/LogField";
import LoggableType from "../../shared/log/LoggableType";
import { createUUID, scaleValue, setsEqual } from "../../shared/util";

/** A provider of historical log data (i.e. all the data is returned at once). */
export class HistoricalDataSource {
  private WORKER_NAMES = {
    ".rlog": "hub$rlogWorker.js",
    ".wpilog": "hub$wpilogWorker.js",
    ".hoot": "hub$wpilogWorker.js", // Converted to WPILOG by main process
    ".dslog": "hub$dsLogWorker.js",
    ".dsevents": "hub$dsLogWorker.js"
  };
  private UUID = createUUID();

  private path = "";
  private mockProgress: number = 0;
  private mockProgressActive = true;
  private status: HistoricalDataSourceStatus = HistoricalDataSourceStatus.Waiting;
  private statusCallback: ((status: HistoricalDataSourceStatus) => void) | null = null;
  private progressCallback: ((progress: number) => void) | null = null;
  private loadingCallback: (() => void) | null = null;
  private outputCallback: ((log: Log) => void) | null = null;
  private customError: string | null = null;

  private log: Log | null = null;
  private worker: Worker | null = null;
  private logIsPartial = false;
  private finishedFields: Set<string> = new Set();
  private requestedFields: Set<string> = new Set();
  private fieldRequestInterval: number | null = null;
  private lastRawRequestFields: Set<string> = new Set();

  /**
   * Generates log data from a file.
   * @param path The path to the log file
   * @param statusCallback A callback to be triggered when the status changes
   * @param progressCallback A callback to be triggered when the progress changes
   * @param loadingCallback A callback to be triggered when a new set of fields begin loading
   * @param outputCallback A callback to receive the generated log object
   */
  openFile(
    path: string,
    statusCallback: (status: HistoricalDataSourceStatus) => void,
    progressCallback: (progress: number) => void,
    loadingCallback: () => void,
    outputCallback: (log: Log) => void
  ) {
    this.statusCallback = statusCallback;
    this.progressCallback = progressCallback;
    this.loadingCallback = loadingCallback;
    this.outputCallback = outputCallback;

    // Post message to start reading
    if (window.platform !== "win32" && path.endsWith(".hoot")) {
      this.customError = "Hoot log files cannot be decoded on macOS or Linux.";
      this.setStatus(HistoricalDataSourceStatus.Error);
      return;
    }
    if (path.endsWith(".dsevents")) {
      path = path.slice(0, -8) + "dslog";
    }
    this.path = path;
    this.setStatus(HistoricalDataSourceStatus.Reading);
    window.sendMainMessage("historical-start", { uuid: this.UUID, path: this.path });

    // Update field request periodically
    this.fieldRequestInterval = window.setInterval(() => this.updateFieldRequest(), 50);

    // Start mock progress updates
    let startTime = new Date().getTime();
    let sendMockProgress = () => {
      if (this.mockProgressActive) {
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

  /** Returns the set of fields that are currently loading. */
  getLoadingFields(): Set<string> {
    return this.requestedFields;
  }

  /** Process new data from the main process, send to worker. */
  handleMainMessage(data: any) {
    if (this.status !== HistoricalDataSourceStatus.Reading || data.uuid !== this.UUID) return;
    this.setStatus(HistoricalDataSourceStatus.DecodingInitial);
    this.customError = data.error;
    let fileContents: (Uint8Array | null)[] = data.files;

    // Check for read error (at least one file is all null)
    if (!fileContents.every((buffer) => buffer !== null)) {
      this.setStatus(HistoricalDataSourceStatus.Error);
      return;
    }

    // Make worker
    let selectedWorkerName: string | null = null;
    Object.entries(this.WORKER_NAMES).forEach(([extension, workerName]) => {
      if (this.path.endsWith(extension)) {
        selectedWorkerName = workerName;
      }
    });
    if (selectedWorkerName === null) {
      this.setStatus(HistoricalDataSourceStatus.Error);
      return;
    }
    this.worker = new Worker("../bundles/" + selectedWorkerName);
    let request: HistoricalDataSource_WorkerRequest = {
      type: "start",
      data: fileContents as Uint8Array[]
    };
    this.worker.postMessage(
      request,
      (fileContents as Uint8Array[]).map((array) => array.buffer)
    );

    // Process response
    this.worker.onmessage = (event) => {
      let message = event.data as HistoricalDataSource_WorkerResponse;
      switch (message.type) {
        case "progress":
          this.mockProgressActive = false;
          if (this.progressCallback !== null) {
            this.progressCallback(scaleValue(message.value, [0, 1], [this.mockProgress, 1]));
          }
          return; // Exit immediately

        case "initial":
          this.log = Log.fromSerialized(message.log);
          this.logIsPartial = message.isPartial;
          break;

        case "failed":
          this.setStatus(HistoricalDataSourceStatus.Error);
          return;

        case "fields":
          if (this.logIsPartial) {
            message.fields.forEach((field) => {
              this.log?.setField(field.key, LogField.fromSerialized(field.data));
              if (field.generatedParent) this.log?.setGeneratedParent(field.key);
              this.requestedFields.delete(field.key);
              this.finishedFields.add(field.key);
            });
          }
          break;
      }
      this.setStatus(
        this.requestedFields.size > 0 && this.logIsPartial
          ? HistoricalDataSourceStatus.DecodingField
          : HistoricalDataSourceStatus.Idle
      );
      if (
        this.outputCallback !== null &&
        this.log !== null &&
        (this.requestedFields.size === 0 || !this.logIsPartial)
      ) {
        this.outputCallback(this.log);
      }
    };
  }

  private updateFieldRequest() {
    if (
      (this.status === HistoricalDataSourceStatus.Idle || this.status === HistoricalDataSourceStatus.DecodingField) &&
      this.worker !== null &&
      this.logIsPartial
    ) {
      let requestFields: Set<string> = new Set();
      window.tabs.getActiveFields().forEach((field) => requestFields.add(field));
      window.sidebar.getActiveFields().forEach((field) => requestFields.add(field));

      // Compare to previous set
      if (!setsEqual(requestFields, this.lastRawRequestFields)) {
        this.lastRawRequestFields = new Set([...requestFields]);

        // Always request schemas and AdvantageKit timestamp
        this.log?.getFieldKeys().forEach((key) => {
          if (key.startsWith("/.schema")) {
            requestFields.add(key);
          }
        });
        requestFields.add("/Timestamp");

        // Compare to existing fields
        requestFields.forEach((field) => {
          this.log?.getFieldKeys().forEach((existingField) => {
            if (this.log?.getType(existingField) === LoggableType.Empty) return;
            if (existingField.startsWith(field) || field.startsWith(existingField)) {
              requestFields.add(existingField);
            }
          });
        });

        // Filter fields
        requestFields.forEach((field) => {
          if (
            this.requestedFields.has(field) ||
            this.finishedFields.has(field) ||
            this.log?.getField(field) === null ||
            this.log?.isGenerated(field)
          ) {
            requestFields.delete(field);
          }
        });

        // Decode schemas first
        let requestFieldsArray = Array.from(requestFields);
        requestFieldsArray = [
          ...requestFieldsArray.filter((field) => field.startsWith("/.schema")),
          ...requestFieldsArray.filter((field) => !field.startsWith("/.schema"))
        ];

        // Send requests
        requestFieldsArray.forEach((field) => {
          let request: HistoricalDataSource_WorkerRequest = {
            type: "parseField",
            key: field
          };
          this.requestedFields.add(field);
          this.worker?.postMessage(request);
        });
        if (requestFieldsArray.length > 0 && this.loadingCallback !== null) {
          this.loadingCallback();
        }
      }

      // Update status
      this.setStatus(
        this.requestedFields.size > 0 ? HistoricalDataSourceStatus.DecodingField : HistoricalDataSourceStatus.Idle
      );
    }
  }

  /** Updates the current status and triggers the callback if necessary. */
  private setStatus(status: HistoricalDataSourceStatus) {
    if (status !== this.status && this.status !== HistoricalDataSourceStatus.Stopped) {
      this.status = status;
      if (this.status === HistoricalDataSourceStatus.Stopped || this.status === HistoricalDataSourceStatus.Error) {
        this.worker?.terminate();
        this.mockProgressActive = false;
        if (this.fieldRequestInterval !== null) window.clearInterval(this.fieldRequestInterval);
      }
      if (this.statusCallback !== null) this.statusCallback(status);
    }
  }

  /** Calculates a mock progress value for the initial load time. */
  private static calcMockProgress(time: number): number {
    // https://www.desmos.com/calculator/86u4rnu8ob
    return 0.5 - 0.5 / (0.1 * time + 1);
  }
}

export type HistoricalDataSource_WorkerRequest =
  | {
      type: "start";
      data: Uint8Array[];
    }
  | {
      type: "parseField";
      key: string;
    };

export type HistoricalDataSource_WorkerResponse =
  | {
      type: "progress";
      value: number;
    }
  | {
      type: "initial";
      log: any;
      isPartial: boolean;
    }
  | {
      type: "failed";
    }
  | {
      type: "fields";
      fields: HistoricalDataSource_WorkerFieldResponse[];
    };

export type HistoricalDataSource_WorkerFieldResponse = {
  key: string;
  data: any;
  generatedParent: boolean;
};

export enum HistoricalDataSourceStatus {
  Waiting,
  Reading,
  DecodingInitial,
  DecodingField,
  Idle,
  Error,
  Stopped
}
