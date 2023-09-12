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
  private DATA_ROW_BUFFER = 15;

  private fillerUpper: HTMLElement;
  private dataRows: HTMLElement[] = [];
  private dataRowTimestamps: number[] = [];
  private fillerLower: HTMLElement;

  private fields: string[] = [];
  private timestamps: number[] = [];
  private lastLogFieldList: string[] = [];
  private lastSelectionMode = SelectionMode.Idle;
  private scrollToSelectedNext = false;
  private hoverCursorY: number | null = null;

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

    // Create filler elements
    {
      this.fillerUpper = document.createElement("div");
      this.TABLE_BODY.appendChild(this.fillerUpper);
      this.fillerUpper.style.height = "500px";
      this.fillerUpper.style.width = "0px";
    }
    {
      this.fillerLower = document.createElement("div");
      this.TABLE_BODY.appendChild(this.fillerLower);
      this.fillerLower.style.height = "1000px";
      this.fillerLower.style.width = "0px";
    }

    // Jump input handling
    let jump = () => {
      let targetTime = Number(this.INPUT_FIELD.value);
      if (this.INPUT_FIELD.value === "") {
        if (window.selection.getMode() !== SelectionMode.Idle) {
          targetTime = window.selection.getSelectedTime() as number;
        } else {
          targetTime = 0;
          window.selection.setSelectedTime(0);
        }
      } else {
        window.selection.setSelectedTime(targetTime);
      }
      this.scrollToSelected();
    };
    this.INPUT_FIELD.addEventListener("keydown", (event) => {
      if (event.code === "Enter") jump();
    });
    content.getElementsByClassName("data-table-jump-button")[0].addEventListener("click", jump);

    // Bind hover controls
    this.TABLE_BODY.addEventListener("mousemove", (event) => {
      this.hoverCursorY = event.clientY;
    });
    this.TABLE_BODY.addEventListener("mouseleave", () => {
      this.hoverCursorY = null;
    });
  }

  saveState(): TableState {
    return { type: TabType.Table, fields: this.fields };
  }

  restoreState(state: TableState) {
    this.fields = state.fields;
    this.updateFields();
  }

  refresh() {
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

    // Remove empty fields
    let dragFields = dragData.data.fields as string[];
    dragFields = dragFields.filter((field) => window.log.getType(field) !== LoggableType.Empty);
    if (dragFields.length === 0) return;

    // Find selected section
    let header = this.TABLE_BODY.firstElementChild as HTMLElement;
    let tableBox = this.TABLE_CONTAINER.getBoundingClientRect();
    let selected: number | null = null;
    let selectedX: number | null = null;
    if (dragData.y > tableBox.y) {
      for (let i = 0; i < header.childElementCount; i++) {
        let targetX = 0;
        if (i === 0 && this.fields.length > 0) {
          targetX = header.children[1].getBoundingClientRect().left;
        } else {
          targetX = header.children[i].getBoundingClientRect().right;
        }
        if (targetX < (header.firstElementChild as HTMLElement).getBoundingClientRect().right) continue;
        let leftBound = i === 0 ? tableBox.x : targetX - header.children[i].getBoundingClientRect().width / 2;
        let rightBound =
          i === header.childElementCount - 1
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
      if (selected !== null) {
        this.fields.splice(selected, 0, ...dragFields);
        this.updateFields();
      }
    } else {
      this.DRAG_HIGHLIGHT.hidden = selected === null;
      if (selected !== null && selectedX !== null) {
        this.DRAG_HIGHLIGHT.style.left = (selectedX - tableBox.x - 12.5).toString() + "px";
      }
    }
  }

  /** Scrolls such that the selected time is in view.
   *
   * @returns Whether the position was updated
   */
  private scrollToSelected() {
    const selectedTime = window.selection.getSelectedTime();
    if (selectedTime !== null) {
      let targetRow = this.timestamps.findLastIndex((timestamp) => timestamp <= selectedTime);
      if (targetRow === -1) targetRow = 0;

      const visibleHeight = this.TABLE_CONTAINER.clientHeight - this.TABLE_BODY.firstElementChild!.clientHeight;
      let firstVisibleRow = Math.ceil(this.TABLE_CONTAINER.scrollTop / this.ROW_HEIGHT_PX);
      let lastVisibleRow = Math.ceil(
        (this.TABLE_CONTAINER.scrollTop + visibleHeight - this.ROW_HEIGHT_PX) / this.ROW_HEIGHT_PX
      );
      if (targetRow < firstVisibleRow) {
        this.TABLE_CONTAINER.scrollTop = targetRow * this.ROW_HEIGHT_PX;
      } else if (targetRow > lastVisibleRow) {
        this.TABLE_CONTAINER.scrollTop = targetRow * this.ROW_HEIGHT_PX - visibleHeight + this.ROW_HEIGHT_PX;
      }
    }
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

    // Update timestamps
    this.timestamps = window.log.getTimestamps(this.fields, this.UUID);
  }

  /** Updates highlighted times (selected & hovered). */
  private updateHighlights() {
    if (this.timestamps.length === 0) return;
    let highlight = (time: number | null, className: string) => {
      this.dataRows.forEach((row) => row.classList.remove(className));
      if (time) {
        let dataRowIndex = this.dataRowTimestamps.findLastIndex((timestamp) => timestamp <= time);
        if (dataRowIndex !== -1 && dataRowIndex < this.dataRows.length) {
          this.dataRows[dataRowIndex].classList.add(className);
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
        for (let i = this.dataRows.length - 1; i >= 0; i--) {
          if (!this.dataRows[i].hidden) {
            this.dataRows[i].classList.add("selected");
            break;
          }
        }
        highlight(window.selection.getHoveredTime(), "hovered");
        break;
    }
  }

  getActiveFields(): string[] {
    return this.fields;
  }

  periodic() {
    // Update data row count
    const dataRowCount = Math.ceil(this.TABLE_CONTAINER.clientHeight / this.ROW_HEIGHT_PX) + this.DATA_ROW_BUFFER * 2;
    while (this.dataRows.length > dataRowCount) {
      this.TABLE_BODY.removeChild(this.dataRows.pop()!);
    }
    while (this.dataRows.length < dataRowCount) {
      let row = document.createElement("tr");
      this.TABLE_BODY.insertBefore(row, this.fillerLower);
      let timestampCell = document.createElement("td");
      row.appendChild(timestampCell);
      this.dataRows.push(row);

      // Bind selection controls
      row.addEventListener("click", () => {
        let rowIndex = this.dataRows.indexOf(row);
        if (rowIndex < this.dataRowTimestamps.length) {
          window.selection.setSelectedTime(this.dataRowTimestamps[rowIndex]);
        }
      });
      row.addEventListener("contextmenu", () => {
        window.selection.goIdle();
      });
    }

    // Update row height (not all platforms render the same way)
    if (this.dataRows.length > 0) {
      let rowHeight = this.dataRows[0].clientHeight;
      if (rowHeight > 0 && rowHeight !== this.ROW_HEIGHT_PX) {
        this.ROW_HEIGHT_PX = rowHeight;
      }
    }

    // Update timestamps, scroll if removed from start
    let newTimestamps = window.log.getTimestamps(this.fields, this.UUID);
    let removedRows = this.timestamps.findIndex((timestamp) => timestamp === newTimestamps[0]);
    this.TABLE_CONTAINER.scrollTop -= removedRows * this.ROW_HEIGHT_PX;
    this.timestamps = newTimestamps;

    // Update element heights
    let dataRowStart: number;
    let dataRowEnd: number;
    if (this.timestamps.length < dataRowCount) {
      this.dataRows.forEach((row, index) => {
        row.hidden = index >= this.timestamps.length;
      });
      this.fillerUpper.style.height = "0px";
      this.fillerLower.style.height = "0px";
      dataRowStart = 0;
      dataRowEnd = this.timestamps.length;
    } else {
      let scrollRow = Math.floor(this.TABLE_CONTAINER.scrollTop / this.ROW_HEIGHT_PX);
      let fillerRowsUpper = 0;
      if (scrollRow > this.DATA_ROW_BUFFER) {
        fillerRowsUpper = scrollRow - this.DATA_ROW_BUFFER;
      }
      if (fillerRowsUpper + dataRowCount > this.timestamps.length) {
        fillerRowsUpper = this.timestamps.length - dataRowCount;
      }
      let fillerRowsLower = this.timestamps.length - dataRowCount - fillerRowsUpper;
      let scrollTop = this.TABLE_CONTAINER.scrollTop;
      this.fillerUpper.style.height = (fillerRowsUpper * this.ROW_HEIGHT_PX).toString() + "px";
      this.fillerLower.style.height = (fillerRowsLower * this.ROW_HEIGHT_PX).toString() + "px";
      this.dataRows.forEach((row) => {
        row.hidden = false;
      });
      this.TABLE_CONTAINER.scrollTop = scrollTop;
      dataRowStart = fillerRowsUpper;
      dataRowEnd = fillerRowsUpper + dataRowCount;
    }

    // Get cell text
    let cellText: string[][] = [];
    this.dataRowTimestamps = [];
    for (let i = dataRowStart; i < dataRowEnd; i++) {
      this.dataRowTimestamps.push(this.timestamps[i]);
      cellText.push([formatTimeWithMS(this.timestamps[i])]);
    }
    let availableFields = window.log.getFieldKeys();
    this.fields.forEach((field) => {
      if (!availableFields.includes(field)) {
        for (let i = dataRowStart; i < dataRowEnd; i++) {
          cellText[i - dataRowStart].push("null");
        }
        return;
      }
      let data = window.log.getRange(
        field,
        this.timestamps[dataRowStart],
        this.timestamps[dataRowEnd]
      ) as LogValueSetAny;
      for (let i = dataRowStart; i < dataRowEnd; i++) {
        let nextIndex = data.timestamps.findIndex((value) => value > this.timestamps[i]);
        if (nextIndex === -1) nextIndex = data?.timestamps.length;
        if (nextIndex === 0) {
          cellText[i - dataRowStart].push("null");
        } else {
          cellText[i - dataRowStart].push(getLogValueText(data.values[nextIndex - 1], window.log.getType(field)!));
        }
      }
    });

    // Update elements
    this.dataRows.forEach((row, rowIndex) => {
      if (rowIndex >= cellText.length) return;
      let cellCount = cellText[rowIndex].length;
      while (row.children.length > cellCount) {
        row.removeChild(row.lastChild!);
      }
      while (row.children.length < cellCount) {
        row.appendChild(document.createElement("td"));
      }
      cellText[rowIndex].forEach((text, cellIndex) => {
        let cell = row.children[cellIndex] as HTMLElement;
        if (cell.innerText !== text) {
          cell.innerText = text;
        }
      });
    });

    // Scroll automatically based on selection mode
    switch (window.selection.getMode()) {
      case SelectionMode.Static:
        if (this.lastSelectionMode == SelectionMode.Locked) {
          this.scrollToSelectedNext = true;
        }
        break;
      case SelectionMode.Playback:
        this.scrollToSelected();
        break;
      case SelectionMode.Locked:
        this.TABLE_CONTAINER.scrollTop = this.TABLE_CONTAINER.scrollHeight - this.TABLE_CONTAINER.clientHeight;
        break;
    }
    if (this.scrollToSelectedNext) {
      this.scrollToSelectedNext = false;
      this.scrollToSelected();
    }
    this.lastSelectionMode = window.selection.getMode();

    // Update selected & hovered times
    let header = this.TABLE_BODY.firstElementChild as HTMLElement;
    if (this.hoverCursorY !== null && this.hoverCursorY > header.getBoundingClientRect().bottom) {
      this.dataRows.forEach((row, index) => {
        let rect = row.getBoundingClientRect();
        if (this.hoverCursorY! >= rect.top && this.hoverCursorY! < rect.bottom) {
          window.selection.setHoveredTime(this.dataRowTimestamps[index]);
        }
      });
    } else {
      window.selection.setHoveredTime(null);
    }
    this.updateHighlights();
    let selectedTime = window.selection.getSelectedTime();
    let placeholder = selectedTime === null ? 0 : selectedTime;
    this.INPUT_FIELD.placeholder = formatTimeWithMS(placeholder);
  }
}
