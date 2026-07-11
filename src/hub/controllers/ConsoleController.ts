// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { LogFieldIterator } from "../../shared/log/LogUtil";
import LoggableType from "../../shared/log/LoggableType";
import { ConsoleRendererCommand } from "../../shared/renderers/ConsoleRenderer";
import { createUUID } from "../../shared/util";
import TabController from "./TabController";

export default class ConsoleController implements TabController {
  UUID = createUUID();

  private ROOT: HTMLElement;
  private TABLE_CONTAINER: HTMLElement;
  private DRAG_HIGHLIGHT: HTMLElement;

  private field: string | null = null;

  constructor(root: HTMLElement) {
    this.ROOT = root;
    this.TABLE_CONTAINER = root.getElementsByClassName("console-table-container")[0] as HTMLElement;
    this.DRAG_HIGHLIGHT = root.getElementsByClassName("console-table-drag-highlight")[0] as HTMLElement;

    // Drag handling
    window.addEventListener("drag-update", (event) => {
      if (this.ROOT.hidden) return;
      let dragData = (event as CustomEvent).detail;
      if (!("fields" in dragData.data)) return;
      let rect = this.TABLE_CONTAINER.getBoundingClientRect();
      let active =
        dragData.x > rect.left && dragData.x < rect.right && dragData.y > rect.top && dragData.y < rect.bottom;
      let fieldType = window.log.getType(dragData.data.fields[0]);
      let structuredType = window.log.getStructuredType(dragData.data.fields[0]);
      let validType =
        fieldType === LoggableType.String ||
        ["ConsoleData", "Console", "ConsoleLineTimestamp", "ErrorInfoTimestamp", "ProgramCrashInfoTimestamp"].includes(
          structuredType || ""
        );
      this.DRAG_HIGHLIGHT.hidden = true;
      if (active && validType) {
        if (dragData.end) {
          this.field = dragData.data.fields[0];
        } else {
          this.DRAG_HIGHLIGHT.hidden = false;
        }
      }
    });

    // Handle close field event
    this.ROOT.addEventListener("close-field", () => {
      this.field = null;
    });
  }

  saveState(): unknown {
    return this.field;
  }

  restoreState(state: unknown): void {
    if (typeof state === "string" || state === null) {
      this.field = state;
    }
  }

  refresh(): void {}

  newAssets(): void {}

  getActiveFields(): string[] {
    if (this.field !== null) {
      let structuredType = window.log.getStructuredType(this.field);
      return structuredType !== "Console" ? [this.field] : [];
    } else {
      return [];
    }
  }

  showTimeline(): boolean {
    return false;
  }

  getCommand(): ConsoleRendererCommand {
    const isAvailable = this.field !== null && window.log.getFieldKeys().includes(this.field);

    let lines: { timestamp: number; value: string; isError: boolean; isWarning: boolean }[] = [];

    if (isAvailable && this.field) {
      let structuredType = window.log.getStructuredType(this.field);
      let type = window.log.getType(this.field);

      if (type === LoggableType.String) {
        // Legacy string parsing: AvantageKit v26.0.2 and below.
        let fieldData = window.log.getField(this.field)?.getString(-Infinity, Infinity);
        if (fieldData) {
          for (let i = 0; i < fieldData.timestamps.length; i++) {
            let value = fieldData.values[i];
            let valueLower = value.toLowerCase();
            lines.push({
              timestamp: fieldData.timestamps[i],
              value: value,
              isError: valueLower.includes("error"),
              isWarning: valueLower.includes("warning")
            });
          }
        }
      } else if (structuredType === "ConsoleData") {
        // Structured string parsing: AvantageKit v27.0.0 and above.
        let fieldIndex = window.log.getField(this.field + "/index")?.getNumber(-Infinity, Infinity);
        let fieldData = window.log.getField(this.field + "/data")?.getString(-Infinity, Infinity);

        if (fieldIndex && fieldData) {
          let dataIter = new LogFieldIterator(fieldData);

          for (let time of fieldIndex.timestamps) {
            let newData = dataIter.getAtTime(time);
            if (newData === undefined) continue;

            let newDataLower = newData.toLowerCase();
            lines.push({
              timestamp: time,
              value: newData,
              isError: newDataLower.includes("error"),
              isWarning: newDataLower.includes("warning")
            });
          }
        }
      } else {
        // Structured 2027+ DSlog console data
        let keysToProcess: string[] = [];
        if (structuredType === "Console") {
          keysToProcess = [this.field + "/ConsoleLine", this.field + "/ErrorInfo", this.field + "/ProgramCrashInfo"];
        } else if (
          ["ConsoleLineTimestamp", "ErrorInfoTimestamp", "ProgramCrashInfoTimestamp"].includes(structuredType || "")
        ) {
          keysToProcess = [this.field];
        }

        for (let key of keysToProcess) {
          let type = window.log.getStructuredType(key);
          let rawData = window.log.getField(key)?.getRaw(-Infinity, Infinity);
          if (!rawData) continue;

          if (type === "ConsoleLineTimestamp") {
            let fieldData = window.log.getField(key + "/ConsoleLine")?.getString(-Infinity, Infinity);
            let iter = new LogFieldIterator(fieldData);
            for (let t of rawData.timestamps) {
              let value = iter.getAtTime(t);
              if (value !== undefined) {
                let valueLower = value.toLowerCase();
                lines.push({
                  timestamp: t,
                  value: value,
                  isError: false,
                  isWarning: false
                });
              }
            }
          } else if (type === "ErrorInfoTimestamp") {
            let detailsData = window.log.getField(key + "/ErrorInfo/Details")?.getString(-Infinity, Infinity);
            let locationData = window.log.getField(key + "/ErrorInfo/Location")?.getString(-Infinity, Infinity);
            let callStackData = window.log.getField(key + "/ErrorInfo/CallStack")?.getString(-Infinity, Infinity);
            let isErrorData = window.log.getField(key + "/ErrorInfo/IsError")?.getBoolean(-Infinity, Infinity);

            let detailsIter = new LogFieldIterator(detailsData);
            let locationIter = new LogFieldIterator(locationData);
            let callStackIter = new LogFieldIterator(callStackData);
            let isErrorIter = new LogFieldIterator(isErrorData);

            for (let t of rawData.timestamps) {
              let details = detailsIter.getAtTime(t) ?? "";
              let location = locationIter.getAtTime(t) ?? "";
              let callStack = callStackIter.getAtTime(t) ?? "";
              let isError = isErrorIter.getAtTime(t) ?? false;

              let value = details;
              if (location || callStack) {
                value += "\n" + location + "\n" + callStack;
              }

              lines.push({
                timestamp: t,
                value: value,
                isError: isError,
                isWarning: !isError
              });
            }
          } else if (type === "ProgramCrashInfoTimestamp") {
            let detailsData = window.log.getField(key + "/ProgramCrashInfo/Details")?.getString(-Infinity, Infinity);
            let locationData = window.log.getField(key + "/ProgramCrashInfo/Location")?.getString(-Infinity, Infinity);
            let callStackData = window.log
              .getField(key + "/ProgramCrashInfo/CallStack")
              ?.getString(-Infinity, Infinity);

            let detailsIter = new LogFieldIterator(detailsData);
            let locationIter = new LogFieldIterator(locationData);
            let callStackIter = new LogFieldIterator(callStackData);

            for (let t of rawData.timestamps) {
              let details = detailsIter.getAtTime(t) ?? "";
              let location = locationIter.getAtTime(t) ?? "";
              let callStack = callStackIter.getAtTime(t) ?? "";

              let value = details;
              if (location || callStack) {
                value += "\n" + location + "\n" + callStack;
              }

              lines.push({
                timestamp: t,
                value: value,
                isError: true,
                isWarning: false
              });
            }
          }
        }
      }

      lines.sort((a, b) => a.timestamp - b.timestamp);
    }

    return {
      key: this.field,
      keyAvailable: isAvailable,
      lines: lines,

      selectionMode: window.selection.getMode(),
      selectedTime: window.selection.getSelectedTime(),
      hoveredTime: window.selection.getHoveredTime()
    };
  }
}
