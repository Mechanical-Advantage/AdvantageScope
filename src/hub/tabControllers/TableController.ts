import { TableState } from "../../shared/HubState";
import LoggableType from "../../shared/log/LoggableType";
import { getLogValueText } from "../../shared/log/LogUtil";
import { LogValueSetAny } from "../../shared/log/LogValueSets";
import TabType from "../../shared/TabType";
import { arraysEqual, createUUID, formatTimeWithMS } from "../../shared/util";
import { SelectionMode } from "../Selection";
import TabController from "../TabController";

export default class TableController implements TabController {
  private CONTENT: HTMLElement;
  private NO_DATA_ALERT: HTMLElement;
  private HEADER_TEMPLATE: HTMLElement;
  private TABLE_CONTAINER: HTMLElement;
  private TABLE_BODY: HTMLElement;
  private DRAG_HIGHLIGHT: HTMLElement;
  private INPUT_FIELD: HTMLInputElement;

  private UUID = createUUID();
  private ROW_HEIGHT_PX = 25; // May be adjusted later based on platform
  private SCROLL_MARGIN_PX = 3000;
  private MAX_ROWS = 1000;

  private fields: string[] = [];
  private timestamps: number[] = [];
  private currentRange: [number, number] = [0, 0];
  private lastLogFieldList: string[] = [];

  constructor(content: HTMLElement) {
    this.CONTENT = content;
    this.NO_DATA_ALERT = content.getElementsByClassName("tab-centered")[0] as HTMLElement;
    this.HEADER_TEMPLATE = content.getElementsByClassName("data-table-header-template")[0] as HTMLElement;
    this.TABLE_CONTAINER = content.getElementsByClassName("data-table-container")[0] as HTMLElement;
    this.TABLE_BODY = content.getElementsByClassName("data-table")[0].firstElementChild as HTMLElement;
    this.DRAG_HIGHLIGHT = content.getElementsByClassName("data-table-drag-highlight")[0] as HTMLElement;
    this.INPUT_FIELD = content.getElementsByClassName("data-table-jump-input")[0] as HTMLInputElement;

    // Drag handling
    window.addEventListener("drag-update", (event) => {
      this.handleDrag((event as CustomEvent).detail);
    });

    // Jump input handling
    let jump = () => {
      // Determine target time
      let targetTime = Number(this.INPUT_FIELD.value);
      if (this.INPUT_FIELD.value == "") {
        if (window.selection.getMode() != SelectionMode.Idle) {
          targetTime = window.selection.getSelectedTime() as number;
        } else {
          targetTime = 0;
        }
      }

      this.jumpToTime(targetTime);
    };
    this.INPUT_FIELD.addEventListener("keydown", (event) => {
      if (event.code == "Enter") jump();
    });
    content.getElementsByClassName("data-table-jump-button")[0].addEventListener("click", jump);
  }

  saveState(): TableState {
    return { type: TabType.Table, fields: this.fields };
  }

  restoreState(state: TableState) {
    this.fields = state.fields;
    this.updateFields();
  }

  refresh() {
    // Update timestamps (Check if fields were only added at the end. If not, do a full refresh)
    let fullRefresh = true;
    let newTimestamps = window.log.getTimestamps(this.fields, this.UUID);
    if (newTimestamps.length >= this.timestamps.length) {
      if (arraysEqual(this.timestamps.slice(0, newTimestamps.length), this.timestamps)) {
        fullRefresh = false;
      }
    }
    if (fullRefresh) {
      let targetTime = 0;
      let offsetPx = 0;
      if (this.timestamps.length > 0) {
        targetTime =
          this.timestamps[Math.floor(this.TABLE_CONTAINER.scrollTop / this.ROW_HEIGHT_PX) + this.currentRange[0]];
        offsetPx = this.TABLE_CONTAINER.scrollTop % this.ROW_HEIGHT_PX;
      }
      this.timestamps = newTimestamps;
      this.jumpToTime(targetTime, offsetPx);
    } else {
      this.timestamps = newTimestamps;
    }

    // Check if field list changed
    let fieldList = window.log.getFieldKeys();
    if (arraysEqual(fieldList, this.lastLogFieldList)) return;
    this.lastLogFieldList = fieldList;
    this.updateFields();
  }

  newAssets() {}

  /** Processes a drag event, including adding a field if necessary. */
  private handleDrag(dragData: any) {
    if (this.CONTENT.hidden) return;

    // Find selected section
    let header = this.TABLE_BODY.firstElementChild as HTMLElement;
    let tableBox = this.TABLE_CONTAINER.getBoundingClientRect();
    let selected: number | null = null;
    let selectedX: number | null = null;
    if (dragData.y > tableBox.y) {
      for (let i = 0; i < header.childElementCount; i++) {
        let targetX = 0;
        if (i == 0 && this.fields.length > 0) {
          targetX = header.children[1].getBoundingClientRect().left;
        } else {
          targetX = header.children[i].getBoundingClientRect().right;
        }
        if (targetX < (header.firstElementChild as HTMLElement).getBoundingClientRect().right) continue;
        let leftBound = i == 0 ? tableBox.x : targetX - header.children[i].getBoundingClientRect().width / 2;
        let rightBound =
          i == header.childElementCount - 1
            ? Infinity
            : targetX + header.children[i + 1].getBoundingClientRect().width / 2;
        if (leftBound < dragData.x && rightBound > dragData.x) {
          selected = i;
          selectedX = targetX;
        }
      }
    }

    // Update highlight or add field
    if (dragData.end) {
      this.DRAG_HIGHLIGHT.hidden = true;
      if (selected != null) {
        this.fields.splice(selected, 0, ...dragData.data.fields);
        this.updateFields();
      }
    } else {
      this.DRAG_HIGHLIGHT.hidden = selected == null;
      if (selected != null && selectedX != null) {
        this.DRAG_HIGHLIGHT.style.left = (selectedX - tableBox.x - 12.5).toString() + "px";
      }
    }
  }

  /** Jumps to the specified time */
  private jumpToTime(targetTime: number, offsetPx: number = 0) {
    // If no data, clear table
    if (this.timestamps.length == 0) {
      this.clearTable();
      return;
    }

    // Find index
    let target = this.timestamps.findIndex((value) => value > targetTime);
    if (target == -1) target = this.timestamps.length;
    if (target < 1) target = 1;
    target -= 1;

    // Jump to index
    if (this.timestamps.length < this.MAX_ROWS) {
      this.currentRange = [0, this.timestamps.length - 1];
    } else {
      this.currentRange = [target - this.MAX_ROWS / 2, target + this.MAX_ROWS / 2 - 1];
      let offset = 0;
      if (this.currentRange[0] < 0) offset = this.currentRange[0] * -1;
      if (this.currentRange[1] > this.timestamps.length - 1) offset = this.timestamps.length - 1 - this.currentRange[1];
      this.currentRange[0] += offset;
      this.currentRange[1] += offset;
    }
    this.clearTable();
    this.fillRange(this.currentRange, false);
    this.TABLE_CONTAINER.scrollTop = (target - this.currentRange[0]) * this.ROW_HEIGHT_PX + offsetPx;
  }

  /** Updates the table based on the current field list */
  private updateFields() {
    // Update no data alert
    this.NO_DATA_ALERT.hidden = this.fields.length > 0;

    // Clear old header cells
    let header = this.TABLE_BODY.firstElementChild as HTMLElement;
    while (header.childElementCount > 1) {
      header.removeChild(header.lastChild as HTMLElement);
    }

    // Add new header cells
    this.fields.forEach((field, index) => {
      let cell = document.createElement("th");
      Array.from(this.HEADER_TEMPLATE.children).forEach((element) => {
        cell.appendChild(element.cloneNode(true));
      });
      header.appendChild(cell);

      let textElement = (cell.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
      let closeButton = cell.lastElementChild as HTMLElement;
      if (!window.log.getFieldKeys().includes(field)) {
        textElement.style.textDecoration = "line-through";
      }
      cell.title = field;
      textElement.innerText = field;
      closeButton.title = "";
      closeButton.addEventListener("click", () => {
        this.fields.splice(index, 1);
        this.updateFields();
      });
    });

    // Reset table data and timestamps
    if (this.fields.length > 0) {
      let targetTime = 0;
      let offsetPx = 0;
      if (this.timestamps.length > 0) {
        targetTime =
          this.timestamps[Math.floor(this.TABLE_CONTAINER.scrollTop / this.ROW_HEIGHT_PX) + this.currentRange[0]];
        offsetPx = this.TABLE_CONTAINER.scrollTop % this.ROW_HEIGHT_PX;
      }
      this.timestamps = window.log.getTimestamps(this.fields, this.UUID);
      this.jumpToTime(targetTime, offsetPx);
    } else {
      this.timestamps = [];
      this.clearTable();
    }
  }

  /** Clears all data currently in the table. */
  private clearTable() {
    while (this.TABLE_BODY.childElementCount > 1) {
      this.TABLE_BODY.removeChild(this.TABLE_BODY.lastChild as HTMLElement);
    }
  }

  /** Updates highlighted times (selected & hovered). */
  private updateHighlights() {
    if (this.timestamps.length == 0) return;
    let highlight = (time: number | null, className: string) => {
      Array.from(this.TABLE_BODY.children).forEach((row) => row.classList.remove(className));
      if (time) {
        let target = this.timestamps.findIndex((value) => value > time);
        if (target == -1) target = this.timestamps.length;
        if (target < 1) target = 1;
        target -= 1;
        if (target >= this.currentRange[0] && target <= this.currentRange[1]) {
          this.TABLE_BODY.children[target - this.currentRange[0] + 1].classList.add(className);
        }
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
        (this.TABLE_BODY.lastElementChild as HTMLElement).classList.add("selected");
        break;
    }
  }

  /**
   * Adds rows on the top or bottom in the specified range.
   * @param range The range of timestamp indexes to insert
   * @param top Whether to add the rows at the top or bottom
   */
  private fillRange(range: [number, number], top: boolean) {
    // Get data
    let dataLookup: { [id: string]: any[] } = {};
    let typeLookup: { [id: string]: LoggableType } = {};
    let availableFields = window.log.getFieldKeys();
    this.fields.forEach((field) => {
      if (!availableFields.includes(field)) return;
      let data = window.log.getRange(field, this.timestamps[range[0]], this.timestamps[range[1]]) as LogValueSetAny;
      let fullData = [];
      for (let i = range[0]; i < range[1] + 1; i++) {
        let nextIndex = data.timestamps.findIndex((value) => value > this.timestamps[i]);
        if (nextIndex == -1) nextIndex = data?.timestamps.length;
        if (nextIndex == 0) {
          fullData.push(null);
        } else {
          fullData.push(data.values[nextIndex - 1]);
        }
      }
      dataLookup[field] = fullData;
      typeLookup[field] = window.log.getType(field) as LoggableType;
    });

    // Add rows
    let nextRow: HTMLElement | null = null;
    if (top) nextRow = this.TABLE_BODY.children[1] as HTMLElement;
    for (let i = range[0]; i < range[1] + 1; i++) {
      // Create row
      let row = document.createElement("tr");
      if (top) {
        this.TABLE_BODY.insertBefore(row, nextRow);
      } else {
        this.TABLE_BODY.appendChild(row);
      }

      // Bind selection controls
      row.addEventListener("mouseenter", () => {
        window.selection.setHoveredTime(this.timestamps[i]);
      });
      row.addEventListener("mouseleave", () => {
        window.selection.setHoveredTime(null);
      });
      row.addEventListener("click", () => {
        window.selection.setSelectedTime(this.timestamps[i]);
      });
      row.addEventListener("contextmenu", () => {
        window.selection.goIdle();
      });

      // Add timestamp
      let timestampCell = document.createElement("td");
      row.appendChild(timestampCell);
      timestampCell.innerText = formatTimeWithMS(this.timestamps[i]);

      // Add data
      this.fields.forEach((field) => {
        let dataCell = document.createElement("td");
        row.appendChild(dataCell);
        let value = dataLookup[field][i - range[0]];
        dataCell.innerText = getLogValueText(value, typeLookup[field]);
      });
    }

    // Update highlights
    this.updateHighlights();

    // Update row height (not all platforms render the same way)
    let rowHeight = this.TABLE_BODY.children[1].getBoundingClientRect().height;
    if (rowHeight > 0 && rowHeight != this.ROW_HEIGHT_PX) this.ROW_HEIGHT_PX = rowHeight;
  }

  getActiveFields(): string[] {
    return this.fields;
  }

  periodic() {
    // Update based on selected & hovered times
    this.updateHighlights();
    let selectedTime = window.selection.getSelectedTime();
    let placeholder = selectedTime == null ? 0 : selectedTime;
    this.INPUT_FIELD.placeholder = formatTimeWithMS(placeholder);

    // Stop if no data
    if (this.timestamps.length == 0) return;

    let atMaxRows = this.currentRange[1] - this.currentRange[0] + 1 >= this.MAX_ROWS;
    let rowOffset = 0;
    if (!atMaxRows) {
      // If not enough rows, add any that are missing
      if (this.timestamps.length > 0) {
        rowOffset = this.timestamps.length - this.currentRange[1] - 1;
      }
    } else if (window.selection.getMode() == SelectionMode.Locked) {
      // Always go to the latest data
      rowOffset = this.timestamps.length - 1 - this.currentRange[1];
    } else {
      // Determine if rows need to be updated based on scroll
      let offsetPx = 0;
      if (this.TABLE_CONTAINER.scrollTop < this.SCROLL_MARGIN_PX && this.currentRange[0] > 0) {
        offsetPx = this.TABLE_CONTAINER.scrollTop - this.SCROLL_MARGIN_PX;
      }
      if (
        this.TABLE_CONTAINER.scrollHeight - this.TABLE_CONTAINER.clientHeight - this.TABLE_CONTAINER.scrollTop <
          this.SCROLL_MARGIN_PX &&
        this.currentRange[1] < this.timestamps.length - 1
      ) {
        offsetPx =
          this.SCROLL_MARGIN_PX -
          (this.TABLE_CONTAINER.scrollHeight - this.TABLE_CONTAINER.clientHeight - this.TABLE_CONTAINER.scrollTop);
      }
      rowOffset = Math.floor(offsetPx / this.ROW_HEIGHT_PX);
    }

    // Update rows
    if (rowOffset != 0) {
      if (this.currentRange[0] + rowOffset < 0) rowOffset = -this.currentRange[0];
      if (this.currentRange[1] + rowOffset > this.timestamps.length - 1) {
        rowOffset = this.timestamps.length - 1 - this.currentRange[1];
      }
      if (atMaxRows) {
        // Offset both sides if at row limit
        this.currentRange[0] += rowOffset;
        this.currentRange[1] += rowOffset;
      } else if (rowOffset < 0) {
        // Add to min range to extend
        this.currentRange[0] += rowOffset;
      } else if (rowOffset > 0) {
        // Add to max range to extend
        this.currentRange[1] += rowOffset;
      }
      if (rowOffset < 0) {
        let limitedRowOffset = rowOffset < -this.MAX_ROWS ? -this.MAX_ROWS : rowOffset;
        if (atMaxRows) {
          for (let i = 0; i < limitedRowOffset * -1; i++) {
            this.TABLE_BODY.removeChild(this.TABLE_BODY.lastElementChild as HTMLElement);
          }
        }
        this.fillRange([this.currentRange[0], this.currentRange[0] - limitedRowOffset - 1], true);
      }
      if (rowOffset > 0) {
        let limitedRowOffset = rowOffset > this.MAX_ROWS ? this.MAX_ROWS : rowOffset;
        if (atMaxRows) {
          for (let i = 0; i < limitedRowOffset; i++) {
            this.TABLE_BODY.removeChild(this.TABLE_BODY.children[1]);
          }
        }
        this.fillRange([this.currentRange[1] - limitedRowOffset + 1, this.currentRange[1]], false);
      }
    }

    // Scroll to bottom if locked
    if (window.selection.getMode() == SelectionMode.Locked) {
      this.TABLE_CONTAINER.scrollTop = this.TABLE_CONTAINER.scrollHeight - this.TABLE_CONTAINER.clientHeight;
    }
  }
}
