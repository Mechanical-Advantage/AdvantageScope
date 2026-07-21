// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { SelectionMode } from "../Selection";
import { IS_LITE } from "../buildConstants";
import { formatTimeWithMS, htmlEncode } from "../util";
import TabRenderer from "./TabRenderer";

export default class ConsoleRenderer implements TabRenderer {
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
  private lines: { timestamp: number; value: string; isError: boolean; isWarning: boolean }[] = [];
  private renderedTimestamps: number[] = [];
  private renderedValues: string[] = [];
  private lastScrollPosition: number | null = null;
  private selectionMode: SelectionMode = SelectionMode.Idle;
  private selectedTime: number | null = null;
  private hoveredTime: number | null = null;
  private lastDisplayOffset: number | null = null;
  private lastIsStartAt0: boolean | null = null;
  private displayOffset = 0;

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
    if (IS_LITE && this.EXPORT_BUTTON !== null) {
      this.EXPORT_BUTTON.hidden = true;
    }

    // Jump input handling
    let jump = () => {
      let displayOffset = window.log ? window.log.getTimestampDisplayOffset() : 0;
      let targetTime = Number(this.JUMP_INPUT.value);
      if (this.JUMP_INPUT.value === "") {
        if (this.selectionMode !== SelectionMode.Idle) {
          targetTime = this.selectedTime as number;
        } else {
          targetTime = 0;
        }
      } else {
        targetTime = targetTime - displayOffset;
      }

      // Find target row
      let targetRow = this.lines.findIndex((l) => l.timestamp > targetTime);
      if (targetRow === -1) targetRow = this.lines.length;
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
        if (this.lines.length === 0) {
          window.sendMainMessage("error", {
            title: "Cannot export console log",
            content: "Please add a field with console data, then try again."
          });
        } else {
          window.sendMainMessage("export-console", this.lines.map((l) => l.value).join("\n"));
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

    // Check if data changed
    let dataChanged = command.lines.length !== this.lines.length;
    if (!dataChanged) {
      for (let i = 0; i < command.lines.length; i++) {
        if (
          command.lines[i].timestamp !== this.lines[i].timestamp ||
          command.lines[i].value !== this.lines[i].value ||
          command.lines[i].isError !== this.lines[i].isError ||
          command.lines[i].isWarning !== this.lines[i].isWarning
        ) {
          dataChanged = true;
          break;
        }
      }
    }

    // Update values
    let isStartAt0 = window.preferences?.timestamps !== "original";
    let formatChanged = command.displayOffset !== this.lastDisplayOffset || isStartAt0 !== this.lastIsStartAt0;
    this.lastDisplayOffset = command.displayOffset;
    this.lastIsStartAt0 = isStartAt0;

    if (command.key !== this.key || command.keyAvailable !== this.keyAvailable || dataChanged || formatChanged) {
      this.key = command.key;
      this.keyAvailable = command.keyAvailable;
      this.lines = command.lines;
      this.displayOffset = command.displayOffset;
      this.updateData();
    }

    // Update highlights
    this.updateHighlights();

    // Update placeholder for jump input
    let selectedTime = this.selectedTime;
    let placeholder = selectedTime === null ? 0 : selectedTime;
    let displayPlaceholder = placeholder + command.displayOffset;
    let placeholderText = formatTimeWithMS(displayPlaceholder);
    if (isStartAt0) {
      placeholderText = "(" + placeholderText + ")";
    }
    this.JUMP_INPUT.placeholder = placeholderText;

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
    let isStartAt0 = window.preferences?.timestamps !== "original";
    let formatChanged = this.displayOffset !== this.lastDisplayOffset || isStartAt0 !== this.lastIsStartAt0;
    this.lastDisplayOffset = this.displayOffset;
    this.lastIsStartAt0 = isStartAt0;

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
    let lines = this.lines;
    const filter = this.FILTER_INPUT.value.toLowerCase();
    if (filter.startsWith("!") ? filter.length > 1 : filter.length > 0) {
      let filteredLines: typeof this.lines = [];
      for (let i = 0; i < lines.length; i++) {
        let value = lines[i].value;
        if (
          filter.startsWith("!")
            ? !value.toLowerCase().includes(filter.slice(1).toLowerCase())
            : value.toLowerCase().includes(filter.toLowerCase())
        ) {
          filteredLines.push(lines[i]);
        }
      }
      lines = filteredLines;
    }

    // Clear extra rows
    while (this.TABLE_BODY.children.length - 1 > lines.length) {
      this.TABLE_BODY.removeChild(this.TABLE_BODY.lastElementChild!);
    }

    // Add new rows
    while (this.TABLE_BODY.children.length - 1 < lines.length) {
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
    for (let i = 0; i < lines.length; i++) {
      let value = lines[i].value;
      let timestamp = lines[i].timestamp;

      // Format value
      let valueFormatted = "";
      if (filter.length > 0 && !filter.startsWith("!")) {
        let lastPosition = -1;
        let position = -1;
        while (
          position + filter.length < value.length &&
          (position = value
            .toLowerCase()
            .indexOf(filter.toLowerCase(), position === -1 ? 0 : position + filter.length)) > -1
        ) {
          if (lastPosition === -1) {
            valueFormatted += htmlEncode(value.substring(0, position));
          } else {
            valueFormatted += htmlEncode(value.substring(lastPosition + filter.length, position));
          }
          valueFormatted +=
            '<span class="highlight">' + htmlEncode(value.substring(position, position + filter.length)) + "</span>";
          lastPosition = position;
        }
        if (lastPosition !== -1) {
          valueFormatted += value.substring(lastPosition + filter.length);
        }
      } else {
        valueFormatted = htmlEncode(value);
      }
      valueFormatted = valueFormatted.replaceAll("\n", "<br />");

      // Update highlight
      let row = this.TABLE_BODY.children[i + 1];
      if (this.HIGHLIGHT_BUTTON.classList.contains("active")) {
        if (lines[i].isError) {
          row.classList.add("error");
        } else {
          row.classList.remove("error");
        }
        if (lines[i].isWarning) {
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
      } else if (this.renderedTimestamps[i] !== timestamp || this.renderedValues[i] !== valueFormatted) {
        hasChanged = true; // Data has changed
        this.renderedValues[i] = valueFormatted;
      }

      // Update cell contents
      if (hasChanged || formatChanged) {
        let displayTime = timestamp + this.displayOffset;
        let text = formatTimeWithMS(displayTime);
        if (isStartAt0) {
          text = "(" + text + ")";
        }
        if ((row.children[0] as HTMLElement).innerText !== text) {
          (row.children[0] as HTMLElement).innerText = text;
        }
      }
      if (hasChanged) {
        (row.children[1] as HTMLElement).innerHTML = valueFormatted;
      }
    }
    this.renderedTimestamps = lines.map((l) => l.timestamp);
  }

  /** Updates highlighted times (selected & hovered). */
  private updateHighlights() {
    if (this.renderedTimestamps.length === 0) return;
    let highlight = (time: number | null, className: string) => {
      Array.from(this.TABLE_BODY.children).forEach((row) => row.classList.remove(className));
      if (time) {
        let target = this.renderedTimestamps.findIndex((value) => value > time);
        if (target === -1) target = this.renderedTimestamps.length; // Use the last timestamp
        if (target < 1) target = 1; // Use the first timestamp (0 is the header cell, so the indexes of console cells start at 1)
        this.TABLE_BODY.children[target].classList.add(className);
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
  lines: {
    timestamp: number;
    value: string;
    isError: boolean;
    isWarning: boolean;
  }[];
  displayOffset: number;

  selectionMode: SelectionMode;
  selectedTime: number | null;
  hoveredTime: number | null;
};
