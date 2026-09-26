// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Log from "../../shared/log/Log";
import LogField from "../../shared/log/LogField";
import {
  applyKeyPrefix,
  getChildLogExtension,
  isChildLog,
  isMergePrefix,
  isSchema
} from "../../shared/log/LogKeyUtils";
import { getURCLKeys } from "../../shared/log/LogUtil";
import LoggableType from "../../shared/log/LoggableType";
import {
  AKIT_TIMESTAMP_KEYS,
  ALLIANCE_KEYS,
  AUTONOMOUS_KEYS,
  DRIVER_STATION_KEYS,
  ENABLED_KEYS,
  EVENT_KEYS,
  MATCH_NUMBER_KEYS,
  MATCH_TYPE_KEYS,
  SYSTEM_TIME_KEYS,
  UTILITY_KEYS
} from "../../shared/log/RobotState";
import { calcMockProgress, createUUID, scaleValue, setsEqual } from "../../shared/util";

/** A provider of historical log data (i.e. all the data is returned at once). */
export class HistoricalDataSource {
  private UUID = createUUID();
  private WORKER_NAMES = {
    ".rlog": "rlogWorker.js",
    ".wpilog": "wpilogWorker.js",
    ".wpilogxz": "wpilogWorker.js", // Decompressed by main process
    ".hoot": "wpilogWorker.js", // Converted to WPILOG by main process
    ".revlog": "wpilogWorker.js", // Converted to WPILOG by main process
    ".log": "roadRunnerWorker.js",
    ".csv": "csvWorker.js",
    ".dslog": "dsLogWorker.js",
    ".dsevents": "dsLogWorker.js"
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
  private childSources: Map<string, HistoricalDataSource> = new Map();

  /**
   * Generates log data from an in-memory byte array (for child logs).
   */
  openRaw(
    log: Log,
    data: Uint8Array,
    extension: string,
    keyPrefix: string,
    statusCallback: (status: HistoricalDataSourceStatus) => void,
    progressCallback: (progress: number) => void,
    refreshCallback: (hasNewFields: boolean) => void
  ) {
    this.log = log;
    this.path = "child." + extension; // Give it a fake path with the right extension
    this.keyPrefix = keyPrefix;
    this.statusCallback = statusCallback;
    this.progressCallback = progressCallback;
    this.refreshCallback = refreshCallback;

    this.setStatus(HistoricalDataSourceStatus.Reading);
    if (["wpilog", "rlog", "csv", "log"].includes(extension)) {
      setTimeout(() => {
        this.handleMainMessage({
          uuid: this.UUID,
          files: [data],
          error: null
        });
      }, 0);
    } else {
      window.sendMainMessage("historical-start-raw", {
        uuid: this.UUID,
        data: data,
        extension: extension
      });
    }

    this.fieldRequestInterval = window.setInterval(() => this.updateFieldRequest(), 50);

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
    this.childSources.forEach((source) => source.stop());
  }

  /** Returns an alternative error message to be displayed if log loading fails. */
  getCustomError(): string | null {
    return this.customError;
  }

  /** Returns the set of fields that are currently loading. */
  getLoadingFields(): Set<string> {
    let fields = new Set(this.requestedFields);
    this.childSources.forEach((childSource, key) => {
      if (
        childSource.status === HistoricalDataSourceStatus.Reading ||
        childSource.status === HistoricalDataSourceStatus.DecodingInitial
      ) {
        fields.add(key);
      }
      childSource.getLoadingFields().forEach((field) => fields.add(field));
    });
    return fields;
  }

  /** Processes a message from the main process. */
  handleMainMessage(message: any) {
    if (message.uuid !== this.UUID) {
      this.childSources.forEach((child) => child.handleMainMessage(message));
      return;
    }

    if (this.status !== HistoricalDataSourceStatus.Reading) return;
    this.setStatus(HistoricalDataSourceStatus.DecodingInitial);
    this.customError = message.error;
    let fileContents: (Uint8Array | null)[] = message.files;

    // Check for read error (all files are null)
    if (fileContents.every((buffer) => buffer === null)) {
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
    this.worker = new Worker("../bundles/" + selectedWorkerName, { type: "module" });
    let request: HistoricalDataSource_WorkerRequest = {
      type: "start",
      data: fileContents as Uint8Array[]
    };
    this.worker.postMessage(
      request,
      fileContents.map((array) => (array === null ? new ArrayBuffer(0) : array.buffer))
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

              // Check if this is a child log
              let extension = getChildLogExtension(this.log?.getWpilibType(key), this.log?.getStructuredType(key));

              if (extension !== null) {
                if (!this.childSources.has(key) && this.log) {
                  let capturedLog = this.log;
                  let rawData = capturedLog.getField(key)?.getRaw(-Infinity, Infinity);
                  if (rawData) {
                    setTimeout(async () => {
                      let totalLength = rawData.values.reduce((sum, arr) => sum + arr.length, 0);
                      let concatenated = new Uint8Array(totalLength);
                      let arrayOffset = 0;
                      for (let i = 0; i < rawData.values.length; i++) {
                        concatenated.set(rawData.values[i], arrayOffset);
                        arrayOffset += rawData.values[i].length;
                        if (i % 1000 === 0) {
                          await new Promise((resolve) => setTimeout(resolve, 0));
                        }
                      }
                      let childSource = new HistoricalDataSource();
                      this.childSources.set(key, childSource);
                      childSource.openRaw(
                        capturedLog,
                        concatenated,
                        extension,
                        key, // Use the parent field name as the prefix
                        (status) => {}, // Don't forward status directly, keep it independent
                        (progress) => {}, // Keep progress independent
                        (hasNewFields) => {
                          if (this.refreshCallback !== null) {
                            this.refreshCallback(hasNewFields);
                          }
                        }
                      );
                    }, 0);
                  }
                }
              }
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

  updateFieldRequest(loadEverything = false, forwardedRequests: Set<string> | null = null) {
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
        if (forwardedRequests) {
          forwardedRequests.forEach((field) => requestFields.add(field));
        }
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
          if (isSchema(key)) {
            requestFields.add(key);
          }
          if (isChildLog(this.log?.getWpilibType(key), this.log?.getStructuredType(key))) {
            requestFields.add(key);
          }
        });
        [
          ...ENABLED_KEYS,
          ...AUTONOMOUS_KEYS,
          ...UTILITY_KEYS,
          ...ALLIANCE_KEYS,
          ...DRIVER_STATION_KEYS,
          ...SYSTEM_TIME_KEYS,
          ...AKIT_TIMESTAMP_KEYS,
          ...EVENT_KEYS,
          ...MATCH_TYPE_KEYS,
          ...MATCH_NUMBER_KEYS
        ].forEach((key) => requestFields.add(key));

        // Compare to existing fields
        requestFields.forEach((field) => {
          this.log?.getFieldKeys().forEach((existingField) => {
            if (this.log?.getType(existingField) === LoggableType.Empty) return;
            if (
              existingField === field ||
              existingField.startsWith(field + "/") ||
              field.startsWith(existingField + "/")
            ) {
              requestFields.add(existingField);
            }
          });
        });

        // Filter fields and forward to child sources
        let childRequests: Map<string, Set<string>> = new Map();
        for (let childKey of this.childSources.keys()) {
          childRequests.set(childKey, new Set());
        }

        requestFields.forEach((field) => {
          // Check if field is a merged log prefix (e.g. "/Log0", "/Log1") rather than just starting with "/Log" (like "/Logs/Hoot")
          let isMergePrefixLocal = this.keyPrefix.length === 0 && isMergePrefix(field);

          let matchesPrefix = this.keyPrefix.length === 0 ? true : field.startsWith(this.keyPrefix + "/");

          if (
            this.requestedFields.has(field) ||
            this.finishedFields.has(field) ||
            this.log?.getField(field) === null ||
            this.log?.isGenerated(field) ||
            !matchesPrefix ||
            isMergePrefixLocal
          ) {
            requestFields.delete(field);
          } else {
            // Do not request fields managed by child sources
            for (let childKey of this.childSources.keys()) {
              if (field.startsWith(childKey + "/")) {
                childRequests.get(childKey)?.add(field);
                requestFields.delete(field);
                break;
              }
            }
          }
        });

        // Trigger child sources to update their requests
        for (let [childKey, childSource] of this.childSources.entries()) {
          // Remove the childKey prefix so the child source sees its own local keys
          let localChildRequests = new Set<string>();
          childRequests.get(childKey)?.forEach((field) => {
            localChildRequests.add(field.slice(childKey.length));
          });
          childSource.updateFieldRequest(loadEverything, localChildRequests);
        }

        // Decode schemas and URCL metadata first
        let requestFieldsArray = Array.from(requestFields);
        requestFieldsArray = [
          ...requestFieldsArray.filter(
            (field) =>
              isSchema(field) ||
              // A bit of a hack but it works
              field.includes("URCL/Raw/Aliases") ||
              field.includes("URCL/Raw/Persistent") ||
              isChildLog(this.log?.getWpilibType(field), this.log?.getStructuredType(field))
          ),
          ...requestFieldsArray.filter(
            (field) =>
              !isSchema(field) &&
              !field.includes("URCL/Raw/Aliases") &&
              !field.includes("URCL/Raw/Persistent") &&
              !isChildLog(this.log?.getWpilibType(field), this.log?.getStructuredType(field))
          )
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
