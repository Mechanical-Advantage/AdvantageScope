// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Log from "../../shared/log/Log";
import LogField from "../../shared/log/LogField";
import {
  AKIT_TIMESTAMP_KEYS,
  EVENT_KEYS,
  MATCH_NUMBER_KEYS,
  MATCH_TYPE_KEYS,
  MERGE_PREFIX,
  SYSTEM_TIME_KEYS,
  applyKeyPrefix,
  getURCLKeys
} from "../../shared/log/LogUtil";
import LoggableType from "../../shared/log/LoggableType";
import { calcMockProgress, createUUID, scaleValue, setsEqual } from "../../shared/util";

/** A provider of historical log data (i.e. all the data is returned at once). */
export class HistoricalDataSource {
  private UUID = createUUID();
  private WORKER_NAMES = {
    ".rlog": "hub$rlogWorker.js",
    ".wpilog": "hub$wpilogWorker.js",
    ".hoot": "hub$wpilogWorker.js", // Converted to WPILOG by main process
    ".dslog": "hub$dsLogWorker.js",
    ".dsevents": "hub$dsLogWorker.js",
    ".log": "hub$rrlogWorker.js"
  };

  private path = "";
  private keyPrefix = "";
  private mockProgress: number = 0;
  private mockProgressActive = true;
  private status: HistoricalDataSourceStatus = HistoricalDataSourceStatus.Waiting;
  private statusCallback: ((status: HistoricalDataSourceStatus) => void) | null = null;
  private progressCallback: ((progress: number) => void) | null = null;
  private refreshCallback: ((hasNewFields: boolean) => void) | null = null;
  private loadAllCallbacks: (() => void)[] = [];
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
   * @param log The log object to write to
   * @param path The path to the log file
   * @param statusCallback A callback to be triggered when the status changes
   * @param progressCallback A callback to be triggered when the progress changes
   * @param loadingCallback A callback to be triggered when a new set of data is available
   * @param keyPrefix A prefix to append to all keys
   */
  openFile(
    log: Log,
    path: string,
    keyPrefix: string,
    statusCallback: (status: HistoricalDataSourceStatus) => void,
    progressCallback: (progress: number) => void,
    refreshCallback: (hasNewFields: boolean) => void
  ) {
    this.log = log;
    this.path = path;
    this.keyPrefix = keyPrefix;
    this.statusCallback = statusCallback;
    this.progressCallback = progressCallback;
    this.refreshCallback = refreshCallback;

    // Post message to start reading
    if (this.path.endsWith(".dsevents")) {
      this.path = this.path.slice(0, -8) + "dslog";
    }
    this.setStatus(HistoricalDataSourceStatus.Reading);
    window.sendMainMessage("historical-start", { uuid: this.UUID, path: this.path });

    // Update field request periodically
    this.fieldRequestInterval = window.setInterval(() => this.updateFieldRequest(), 50);

    // Start mock progress updates
    let startTime = new Date().getTime();
    let sendMockProgress = () => {
      if (this.mockProgressActive) {
        let time = (new Date().getTime() - startTime) / 1000;
        this.mockProgress = calcMockProgress(time);
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
    let offset = 0;
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
          if (this.log !== null) {
            offset = this.log.mergeWith(Log.fromSerialized(message.log), this.keyPrefix);
          }
          this.logIsPartial = message.isPartial;
          break;

        case "failed":
          this.setStatus(HistoricalDataSourceStatus.Error);
          return; // Exit immediately

        case "fields":
          if (this.logIsPartial) {
            message.fields.forEach((field) => {
              let key = applyKeyPrefix(this.keyPrefix, field.key);
              field.data.timestamps = (field.data.timestamps as number[]).map((timestamp) => timestamp + offset);
              this.log?.setField(key, LogField.fromSerialized(field.data));
              if (field.generatedParent) this.log?.setGeneratedParent(key);
              this.requestedFields.delete(key);
              this.finishedFields.add(key);
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
        this.refreshCallback !== null &&
        this.log !== null &&
        (this.requestedFields.size === 0 || !this.logIsPartial)
      ) {
        this.refreshCallback(true);
        this.loadAllCallbacks.forEach((callback) => callback());
        this.loadAllCallbacks = [];
      }
    };
  }

  /** Loads all fields that are not currently decoded. */
  loadAllFields(): Promise<void> {
    this.updateFieldRequest(true);
    if (this.requestedFields.size === 0) {
      return new Promise((resolve) => resolve());
    } else {
      return new Promise((resolve) => {
        this.loadAllCallbacks.push(resolve);
      });
    }
  }

  private updateFieldRequest(loadEverything = false) {
    if (
      (this.status === HistoricalDataSourceStatus.Idle || this.status === HistoricalDataSourceStatus.DecodingField) &&
      this.worker !== null &&
      this.logIsPartial
    ) {
      let requestFields: Set<string> = new Set();
      if (!loadEverything) {
        // Normal behavior, use active fields
        window.tabs.getActiveFields().forEach((field) => requestFields.add(field));
        window.sidebar.getActiveFields().forEach((field) => requestFields.add(field));
        getURCLKeys(window.log).forEach((field) => requestFields.add(field));
      } else {
        // Need to access all fields, load everything
        this.log?.getFieldKeys().forEach((key) => {
          requestFields.add(key);
        });
      }

      // Compare to previous set
      if (!setsEqual(requestFields, this.lastRawRequestFields)) {
        this.lastRawRequestFields = new Set([...requestFields]);

        // Add keys that are always requested
        this.log?.getFieldKeys().forEach((key) => {
          if (key.includes("/.schema/")) {
            requestFields.add(key);
          }
        });
        [...SYSTEM_TIME_KEYS, ...AKIT_TIMESTAMP_KEYS, ...EVENT_KEYS, ...MATCH_TYPE_KEYS, ...MATCH_NUMBER_KEYS].forEach(
          (key) => requestFields.add(key)
        );

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
            this.log?.isGenerated(field) ||
            !field.startsWith(this.keyPrefix) ||
            (this.keyPrefix.length === 0 && field.startsWith("/" + MERGE_PREFIX))
          ) {
            requestFields.delete(field);
          }
        });

        // Decode schemas and URCL metadata first
        let requestFieldsArray = Array.from(requestFields);
        requestFieldsArray = [
          ...requestFieldsArray.filter(
            (field) =>
              field.includes("/.schema/") ||
              // A bit of a hack but it works
              field.includes("URCL/Raw/Aliases") ||
              field.includes("URCL/Raw/Persistent")
          ),
          ...requestFieldsArray.filter((field) => !field.includes("/.schema/"))
        ];

        // Send requests
        requestFieldsArray.forEach((field) => {
          let request: HistoricalDataSource_WorkerRequest = {
            type: "parseField",
            key: field.slice(this.keyPrefix.length)
          };
          this.requestedFields.add(field);
          this.worker?.postMessage(request);
        });
        if (requestFieldsArray.length > 0 && this.refreshCallback !== null) {
          this.refreshCallback(false);
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
