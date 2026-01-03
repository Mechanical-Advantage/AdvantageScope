// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { SelectionMode } from "../Selection";
import { Distribution, DISTRIBUTION } from "../buildConstants";
import LogField from "../log/LogField";
import { arraysEqual, formatTimeWithMS, htmlEncode } from "../util";
import TabRenderer from "./TabRenderer";

export default class ConsoleRenderer implements TabRenderer {
  private ERROR_TEXT = "error";
  private WARNING_TEXT = "warning";

  private TABLE_CONTAINER: HTMLElement;
  private TABLE_BODY: HTMLElement;
  private JUMP_INPUT: HTMLInputElement;
  private JUMP_BUTTON: HTMLInputElement;
  private EXPORT_BUTTON: HTMLButtonElement | null;
  private HIGHLIGHT_BUTTON: HTMLButtonElement;
  private FILTER_INPUT: HTMLInputElement;
  private FIELD_CELL: HTMLElement;
  private FIELD_TEXT: HTMLElement;
  private FIELD_DELETE: HTMLButtonElement;
  private HAND_ICON: HTMLElement;

  private hasController: boolean;
  private key: string | null = null;
  private keyAvailable = false;
  private timestamps: number[] = [];
  private values: string[] = [];
  private renderedTimestamps: number[] = [];
  private renderedValues: string[] = [];
  private lastScrollPosition: number | null = null;
  private selectionMode: SelectionMode = SelectionMode.Idle;
  private selectedTime: number | null = null;
  private hoveredTime: number | null = null;

  constructor(root: HTMLElement, hasController: boolean) {
    this.hasController = hasController;
    this.TABLE_CONTAINER = root.getElementsByClassName("console-table-container")[0] as HTMLElement;
    this.TABLE_BODY = this.TABLE_CONTAINER.firstElementChild?.firstElementChild as HTMLElement;
    this.JUMP_INPUT = this.TABLE_BODY.firstElementChild?.firstElementChild?.firstElementChild as HTMLInputElement;
    this.JUMP_BUTTON = this.TABLE_BODY.firstElementChild?.firstElementChild?.lastElementChild as HTMLInputElement;
    this.EXPORT_BUTTON = hasController
      ? (this.TABLE_BODY.firstElementChild?.lastElementChild?.children[1] as HTMLButtonElement)
      : null;
    this.HIGHLIGHT_BUTTON = this.TABLE_BODY.firstElementChild?.lastElementChild?.getElementsByClassName(
      "highlight-button"
    )[0] as HTMLButtonElement;
    this.FILTER_INPUT = this.TABLE_BODY.firstElementChild?.lastElementChild?.lastElementChild as HTMLInputElement;
    this.FIELD_CELL = this.TABLE_BODY.firstElementChild?.lastElementChild as HTMLElement;
    this.FIELD_TEXT = this.FIELD_CELL.firstElementChild?.firstElementChild as HTMLElement;
    this.FIELD_DELETE = this.FIELD_CELL.firstElementChild?.lastElementChild as HTMLButtonElement;
    this.HAND_ICON = root.getElementsByClassName("large-table-hand-icon")[0] as HTMLElement;

    // Hide export button for Lite
    if (DISTRIBUTION === Distribution.Lite && this.EXPORT_BUTTON !== null) {
      this.EXPORT_BUTTON.hidden = true;
    }

    // Jump input handling
    let jump = () => {
      // Determine target time
      let targetTime = Number(this.JUMP_INPUT.value);
      if (this.JUMP_INPUT.value === "") {
        if (this.selectionMode !== SelectionMode.Idle) {
          targetTime = this.selectedTime as number;
        } else {
          targetTime = 0;
        }
      }

      // Find target row
      let targetRow = this.timestamps.findIndex((value) => value > targetTime);
      if (targetRow === -1) targetRow = this.timestamps.length;
      if (targetRow < 1) targetRow = 1;
      targetRow -= 1;
      this.TABLE_CONTAINER.scrollTop = Array.from(this.TABLE_BODY.children).reduce((totalHeight, row, rowIndex) => {
        if (rowIndex > 0 && rowIndex < targetRow + 1) {
          return totalHeight + row.clientHeight;
        } else {
          return totalHeight;
        }
      }, 0);
    };
    this.JUMP_INPUT.addEventListener("keydown", (event) => {
      if (event.code === "Enter") jump();
    });
    this.JUMP_BUTTON.addEventListener("click", jump);
    this.FILTER_INPUT.addEventListener("input", () => this.updateData());

    // Export button
    if (this.EXPORT_BUTTON !== null) {
      this.EXPORT_BUTTON.addEventListener("click", () => {
        if (this.values.length === 0) {
          window.sendMainMessage("error", {
            title: "Cannot export console log",
            content: "Please add a field with console data, then try again."
          });
        } else {
          window.sendMainMessage("export-console", this.values.join("\n"));
        }
      });
    }

    // Highlight button
    this.HIGHLIGHT_BUTTON.addEventListener("click", () => {
      this.HIGHLIGHT_BUTTON.classList.toggle("active");
      this.updateData();
    });

    // Delete button handling
    this.FIELD_DELETE.addEventListener("click", () => {
      root.dispatchEvent(new CustomEvent("close-field"));
    });

    // Select filter
    window.addEventListener("keydown", (event) => {
      if (root === null || root.hidden || (event.target !== document.body && event.target !== window)) return;
      if ((window.platform === "darwin" ? event.metaKey : event.ctrlKey) && event.key === "f") {
        this.FILTER_INPUT.select();
      }
    });

    // Update field text
    this.updateData();
  }

  saveState(): unknown {
    return {
      highlight: this.HIGHLIGHT_BUTTON.classList.contains("active")
    };
  }

  restoreState(state: unknown): void {
    if (state === null || typeof state !== "object") return;
    if ("highlight" in state && typeof state.highlight === "boolean") {
      if (state.highlight) {
        this.HIGHLIGHT_BUTTON.classList.add("active");
      } else {
        this.HIGHLIGHT_BUTTON.classList.remove("active");
      }
      this.updateData();
    }
  }

  getAspectRatio(): number | null {
    return null;
  }

  render(command: ConsoleRendererCommand): void {
    // Update selection state
    this.selectionMode = command.selectionMode;
    this.selectedTime = command.selectedTime;
    this.hoveredTime = command.hoveredTime;

    // Get data from field
    let field = command.keyAvailable ? LogField.fromSerialized(command.serialized) : null;
    let fieldData = field === null ? undefined : field.getString(-Infinity, Infinity);
    let newTimestamps = fieldData === undefined ? [] : fieldData.timestamps;
    let newValues = fieldData === undefined ? [] : fieldData.values;

    // Update values
    if (
      command.key !== this.key ||
      command.keyAvailable !== this.keyAvailable ||
      !arraysEqual(newTimestamps, this.timestamps) ||
      !arraysEqual(newValues, this.values)
    ) {
      this.key = command.key;
      this.keyAvailable = command.keyAvailable;
      this.timestamps = newTimestamps;
      this.values = newValues;
      this.updateData();
    }

    // Update highlights
    this.updateHighlights();

    // Update placeholder for jump input
    let selectedTime = this.selectedTime;
    let placeholder = selectedTime === null ? 0 : selectedTime;
    this.JUMP_INPUT.placeholder = formatTimeWithMS(placeholder);

    // Scroll to bottom if locked
    if (this.selectionMode === SelectionMode.Locked) {
      if (this.lastScrollPosition !== null && this.TABLE_CONTAINER.scrollTop < this.lastScrollPosition) {
        window.selection.unlock();
      } else {
        this.TABLE_CONTAINER.scrollTop = this.TABLE_CONTAINER.scrollHeight - this.TABLE_CONTAINER.clientHeight;
      }
    }
    this.lastScrollPosition = this.TABLE_CONTAINER.scrollTop;
  }

  /** Updates the field text and data. */
  updateData() {
    // Update field text
    if (this.key === null) {
      this.FIELD_TEXT.innerText = "";
      this.FIELD_TEXT.style.textDecoration = "";
      this.FIELD_DELETE.hidden = true;
    } else if (!this.keyAvailable) {
      this.FIELD_TEXT.innerText = this.key;
      this.FIELD_TEXT.style.textDecoration = "line-through";
      this.FIELD_DELETE.hidden = !this.hasController;
    } else {
      this.FIELD_TEXT.innerText = this.key;
      this.FIELD_TEXT.style.textDecoration = "";
      this.FIELD_DELETE.hidden = !this.hasController;
    }

    // Update hand icon
    let showHand = this.hasController && !this.keyAvailable;
    this.HAND_ICON.style.transition = showHand ? "opacity 1s ease-in 1s" : "";
    this.HAND_ICON.style.opacity = showHand ? "0.15" : "0";

    // Get data
    let timestamps = this.timestamps;
    let values = this.values;
    const filter = this.FILTER_INPUT.value.toLowerCase();
    if (filter.startsWith("!") ? filter.length > 1 : filter.length > 0) {
      let filteredTimestamps: number[] = [];
      let filteredValues: string[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        let value = values[i];
        if (
          filter.startsWith("!")
            ? !value.toLowerCase().includes(filter.slice(1).toLowerCase())
            : value.toLowerCase().includes(filter.toLowerCase())
        ) {
          filteredTimestamps.push(timestamps[i]);
          filteredValues.push(value);
        }
      }
      timestamps = filteredTimestamps;
      values = filteredValues;
    }

    // Clear extra rows
    while (this.TABLE_BODY.children.length - 1 > timestamps.length) {
      this.TABLE_BODY.removeChild(this.TABLE_BODY.lastElementChild!);
    }

    // Add new rows
    while (this.TABLE_BODY.children.length - 1 < timestamps.length) {
      let row = document.createElement("tr");
      this.TABLE_BODY.appendChild(row);
      let timestampCell = document.createElement("td");
      row.appendChild(timestampCell);
      let valueCell = document.createElement("td");
      row.appendChild(valueCell);

      // Bind selection controls
      row.addEventListener("mouseenter", () => {
        let rowIndex = Array.from(this.TABLE_BODY.children).indexOf(row);
        window.selection.setHoveredTime(this.renderedTimestamps[rowIndex - 1]);
      });
      row.addEventListener("mouseleave", () => {
        window.selection.setHoveredTime(null);
      });
      row.addEventListener("click", () => {
        let rowIndex = Array.from(this.TABLE_BODY.children).indexOf(row);
        window.selection.setSelectedTime(this.renderedTimestamps[rowIndex - 1]);
      });
      row.addEventListener("contextmenu", () => {
        window.selection.goIdle();
      });
    }

    // Update values
    for (let i = 0; i < values.length; i++) {
      // Format value
      let valueFormatted = "";
      if (filter.length > 0 && !filter.startsWith("!")) {
        let lastPosition = -1;
        let position = -1;
        while (
          position + filter.length < values[i].length &&
          (position = values[i]
            .toLowerCase()
            .indexOf(filter.toLowerCase(), position === -1 ? 0 : position + filter.length)) > -1
        ) {
          if (lastPosition === -1) {
            valueFormatted += htmlEncode(values[i].substring(0, position));
          } else {
            valueFormatted += htmlEncode(values[i].substring(lastPosition + filter.length, position));
          }
          valueFormatted +=
            '<span class="highlight">' +
            htmlEncode(values[i].substring(position, position + filter.length)) +
            "</span>";
          lastPosition = position;
        }
        if (lastPosition !== -1) {
          valueFormatted += values[i].substring(lastPosition + filter.length);
        }
      } else {
        valueFormatted = htmlEncode(values[i]);
      }
      valueFormatted = valueFormatted.replaceAll("\n", "<br />");

      // Update highlight
      let row = this.TABLE_BODY.children[i + 1];
      if (this.HIGHLIGHT_BUTTON.classList.contains("active")) {
        if (values[i].toLowerCase().includes(this.ERROR_TEXT)) {
          row.classList.add("error");
        } else {
          row.classList.remove("error");
        }
        if (values[i].toLowerCase().includes(this.WARNING_TEXT)) {
          row.classList.add("warning");
        } else {
          row.classList.remove("warning");
        }
      } else {
        row.classList.remove("error");
        row.classList.remove("warning");
      }

      // Check if value has changed
      let hasChanged = false;
      if (i > this.renderedTimestamps.length) {
        hasChanged = true; // New row
        this.renderedValues.push(valueFormatted);
      } else if (this.renderedTimestamps[i] !== timestamps[i] || this.renderedValues[i] !== valueFormatted) {
        hasChanged = true; // Data has changed
        this.renderedValues[i] = valueFormatted;
      }

      // Update cell contents
      if (hasChanged) {
        (row.children[0] as HTMLElement).innerText = formatTimeWithMS(timestamps[i]);
        (row.children[1] as HTMLElement).innerHTML = valueFormatted;
      }
    }
    this.renderedTimestamps = timestamps;
  }

  /** Updates highlighted times (selected & hovered). */
  private updateHighlights() {
    if (this.timestamps.length === 0) return;
    let highlight = (time: number | null, className: string) => {
      Array.from(this.TABLE_BODY.children).forEach((row) => row.classList.remove(className));
      if (time) {
        let target = this.renderedTimestamps.findIndex((value) => value > time);
        if (target === -1) target = this.renderedTimestamps.length;
        if (target < 1) target = 1;
        target -= 1;
        this.TABLE_BODY.children[target + 1].classList.add(className);
      }
    };
    switch (this.selectionMode) {
      case SelectionMode.Idle:
        highlight(null, "selected");
        highlight(this.hoveredTime, "hovered");
        break;
      case SelectionMode.Static:
      case SelectionMode.Playback:
        highlight(this.selectedTime, "selected");
        highlight(this.hoveredTime, "hovered");
        break;
      case SelectionMode.Locked:
        Array.from(this.TABLE_BODY.children).forEach((row) => row.classList.remove("selected"));
        Array.from(this.TABLE_BODY.children).forEach((row) => row.classList.remove("hovered"));
        break;
    }
  }
}

export type ConsoleRendererCommand = {
  key: string | null;
  keyAvailable: boolean;
  serialized: any;

  selectionMode: SelectionMode;
  selectedTime: number | null;
  hoveredTime: number | null;
};
