import { ConsoleState } from "../../shared/HubState";
import LoggableType from "../../shared/log/LoggableType";
import { LogValueSetString } from "../../shared/log/LogValueSets";
import TabType from "../../shared/TabType";
import { formatTimeWithMS, htmlEncode } from "../../shared/util";
import { SelectionMode } from "../Selection";
import TabController from "../TabController";

export default class ConsoleController implements TabController {
  private CONTENT: HTMLElement;
  private DRAG_HIGHLIGHT: HTMLElement;
  private TABLE_CONTAINER: HTMLElement;
  private TABLE_BODY: HTMLElement;
  private JUMP_INPUT: HTMLInputElement;
  private JUMP_BUTTON: HTMLInputElement;
  private FIELD_CELL: HTMLElement;
  private FIELD_TEXT: HTMLElement;

  private field: string | null = null;
  private lastData: LogValueSetString = {
    timestamps: [],
    values: []
  };

  constructor(content: HTMLElement) {
    this.CONTENT = content;
    this.DRAG_HIGHLIGHT = content.getElementsByClassName("console-table-drag-highlight")[0] as HTMLElement;
    this.TABLE_CONTAINER = content.getElementsByClassName("console-table-container")[0] as HTMLElement;
    this.TABLE_BODY = this.TABLE_CONTAINER.firstElementChild?.firstElementChild as HTMLElement;
    this.JUMP_INPUT = this.TABLE_BODY.firstElementChild?.firstElementChild?.firstElementChild as HTMLInputElement;
    this.JUMP_BUTTON = this.TABLE_BODY.firstElementChild?.firstElementChild?.lastElementChild as HTMLInputElement;
    this.FIELD_CELL = this.TABLE_BODY.firstElementChild?.lastElementChild as HTMLElement;
    this.FIELD_TEXT = this.FIELD_CELL.firstElementChild as HTMLElement;

    // Drag handling
    window.addEventListener("drag-update", (event) => {
      if (this.CONTENT.hidden) return;
      let dragData = (event as CustomEvent).detail;
      let rect = this.CONTENT.getBoundingClientRect();
      let active =
        dragData.x > rect.left && dragData.x < rect.right && dragData.y > rect.top && dragData.y < rect.bottom;
      let validType = window.log.getType(dragData.data.fields[0]) === LoggableType.String;
      this.DRAG_HIGHLIGHT.hidden = true;
      if (active && validType) {
        if (dragData.end) {
          this.field = dragData.data.fields[0];
          this.updateData();
        } else {
          this.DRAG_HIGHLIGHT.hidden = false;
        }
      }
    });
    this.FIELD_CELL.addEventListener("contextmenu", () => {
      this.field = null;
      this.updateData();
    });

    // Jump input handling
    let jump = () => {
      // Determine target time
      let targetTime = Number(this.JUMP_INPUT.value);
      if (this.JUMP_INPUT.value === "") {
        if (window.selection.getMode() !== SelectionMode.Idle) {
          targetTime = window.selection.getSelectedTime() as number;
        } else {
          targetTime = 0;
        }
      }

      // Find target row
      let targetRow = this.lastData.timestamps.findIndex((value) => value > targetTime);
      if (targetRow === -1) targetRow = this.lastData.timestamps.length;
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

    // Update field text
    this.updateData();
  }

  saveState(): ConsoleState {
    return {
      type: TabType.Console,
      field: this.field
    };
  }

  restoreState(state: ConsoleState) {
    this.field = state.field;
    this.updateData();
  }

  refresh() {
    this.updateData();
  }

  newAssets() {}

  getActiveFields(): string[] {
    if (this.field === null) {
      return [];
    } else {
      return [this.field];
    }
  }

  periodic() {
    // Update highlights
    this.updateHighlights();

    // Update placeholder for jump input
    let selectedTime = window.selection.getSelectedTime();
    let placeholder = selectedTime === null ? 0 : selectedTime;
    this.JUMP_INPUT.placeholder = formatTimeWithMS(placeholder);

    // Scroll to bottom if locked
    if (window.selection.getMode() === SelectionMode.Locked) {
      this.TABLE_CONTAINER.scrollTop = this.TABLE_CONTAINER.scrollHeight - this.TABLE_CONTAINER.clientHeight;
    }
  }

  /** Updates the field text and data. */
  updateData() {
    // Update field text
    if (this.field === null) {
      this.FIELD_TEXT.innerText = "<Drag Here>";
      this.FIELD_TEXT.style.textDecoration = "";
    } else if (!window.log.getFieldKeys().includes(this.field)) {
      this.FIELD_TEXT.innerText = this.field;
      this.FIELD_TEXT.style.textDecoration = "line-through";
    } else {
      this.FIELD_TEXT.innerText = this.field;
      this.FIELD_TEXT.style.textDecoration = "";
    }

    // Get data
    let logData: LogValueSetString = {
      timestamps: [],
      values: []
    };
    if (this.field !== null) {
      let logDataTemp = window.log.getString(this.field, -Infinity, Infinity);
      if (logDataTemp) logData = logDataTemp;
    }

    // Clear extra rows
    while (this.TABLE_BODY.children.length - 1 > logData.timestamps.length) {
      this.TABLE_BODY.removeChild(this.TABLE_BODY.lastElementChild!);
    }

    // Add new rows
    while (this.TABLE_BODY.children.length - 1 < logData.timestamps.length) {
      let row = document.createElement("tr");
      this.TABLE_BODY.appendChild(row);
      let timestampCell = document.createElement("td");
      row.appendChild(timestampCell);
      let valueCell = document.createElement("td");
      row.appendChild(valueCell);

      // Bind selection controls
      row.addEventListener("mouseenter", () => {
        let rowIndex = Array.from(this.TABLE_BODY.children).indexOf(row);
        window.selection.setHoveredTime(this.lastData.timestamps[rowIndex - 1]);
      });
      row.addEventListener("mouseleave", () => {
        window.selection.setHoveredTime(null);
      });
      row.addEventListener("click", () => {
        let rowIndex = Array.from(this.TABLE_BODY.children).indexOf(row);
        window.selection.setSelectedTime(this.lastData.timestamps[rowIndex - 1]);
      });
      row.addEventListener("contextmenu", () => {
        window.selection.goIdle();
      });
    }

    // Update values
    for (let i = 0; i < logData.values.length; i++) {
      // Check if value has changed
      let hasChanged = false;
      if (i > this.lastData.timestamps.length) {
        hasChanged = true; // New row
      } else if (
        logData.timestamps[i] !== this.lastData.timestamps[i] ||
        logData.values[i] !== this.lastData.values[i]
      ) {
        hasChanged = true; // Data has changed
      }

      // Update cell contents
      if (hasChanged) {
        let row = this.TABLE_BODY.children[i + 1];
        (row.children[0] as HTMLElement).innerText = formatTimeWithMS(logData.timestamps[i]);
        (row.children[1] as HTMLElement).innerHTML = htmlEncode(logData.values[i]).replace("\n", "<br />");
      }
    }

    // Update last timestamps
    this.lastData = {
      timestamps: [...logData.timestamps],
      values: [...logData.values]
    };
  }

  /** Updates highlighted times (selected & hovered). */
  private updateHighlights() {
    if (this.lastData.timestamps.length === 0) return;
    let highlight = (time: number | null, className: string) => {
      Array.from(this.TABLE_BODY.children).forEach((row) => row.classList.remove(className));
      if (time) {
        let target = this.lastData.timestamps.findIndex((value) => value > time);
        if (target === -1) target = this.lastData.timestamps.length;
        if (target < 1) target = 1;
        target -= 1;
        this.TABLE_BODY.children[target + 1].classList.add(className);
      }
    };
    switch (window.selection.getMode()) {
      case SelectionMode.Idle:
        highlight(null, "selected");
        highlight(window.selection.getHoveredTime(), "hovered");
        break;
      case SelectionMode.Static:
      case SelectionMode.Playback:
        highlight(window.selection.getSelectedTime(), "selected");
        highlight(window.selection.getHoveredTime(), "hovered");
        break;
      case SelectionMode.Locked:
        Array.from(this.TABLE_BODY.children).forEach((row) => row.classList.remove("selected"));
        Array.from(this.TABLE_BODY.children).forEach((row) => row.classList.remove("hovered"));
        break;
    }
  }
}
