import { SelectionMode } from "../Selection";
import { getLogValueText } from "../log/LogUtil";
import { LogValueSetAny } from "../log/LogValueSets";
import LoggableType from "../log/LoggableType";
import { arraysEqual, createUUID, formatTimeWithMS } from "../util";
import TabRenderer from "./TabRenderer";

export default class TableRenderer implements TabRenderer {
  readonly UUID = createUUID();

  private ROOT: HTMLElement;
  private HEADER_TEMPLATE: HTMLElement;
  private TABLE_CONTAINER: HTMLElement;
  private TABLE_BODY: HTMLElement;
  private INPUT_FIELD: HTMLInputElement;
  private HAND_ICON: HTMLElement;

  private ROW_HEIGHT_PX = 25; // May be adjusted later based on platform
  private DATA_ROW_BUFFER = 15;

  private hasController: boolean;
  private fillerUpper: HTMLElement;
  private dataRows: HTMLElement[] = [];
  private dataRowTimestamps: number[] = [];
  private fillerLower: HTMLElement;

  private timestamps: number[] = [];
  private lastFields: string[] = [];
  private lastFieldsAvailable: boolean[] = [];
  private lastScrollPosition: number | null = null;
  private hoverCursorY: number | null = null;
  private didClearHoveredTime = false;
  private timestampRange: [number, number] | null = null;

  private selectionMode: SelectionMode = SelectionMode.Idle;
  private selectedTime: number | null = null;
  private hoveredTime: number | null = null;

  constructor(root: HTMLElement, hasController: boolean) {
    this.ROOT = root;
    this.hasController = hasController;
    this.HEADER_TEMPLATE = root.getElementsByClassName("data-table-header-template")[0] as HTMLElement;
    this.TABLE_CONTAINER = root.getElementsByClassName("data-table-container")[0] as HTMLElement;
    this.TABLE_BODY = root.getElementsByClassName("data-table")[0].firstElementChild as HTMLElement;
    this.INPUT_FIELD = root.getElementsByClassName("data-table-jump-input")[0] as HTMLInputElement;
    this.HAND_ICON = root.getElementsByClassName("large-table-hand-icon")[0] as HTMLElement;

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
        if (this.selectionMode !== SelectionMode.Idle) {
          targetTime = this.selectedTime as number;
        } else {
          targetTime = 0;
          window.selection.setSelectedTime(0);
        }
      } else {
        window.selection.setSelectedTime(targetTime);
      }
      this.selectedTime = targetTime;
      this.scrollToSelected();
    };
    this.INPUT_FIELD.addEventListener("keydown", (event) => {
      if (event.code === "Enter") jump();
    });
    root.getElementsByClassName("data-table-jump-button")[0].addEventListener("click", jump);

    // Bind hover controls
    this.TABLE_BODY.addEventListener("mousemove", (event) => {
      this.hoverCursorY = event.clientY;
    });
    this.TABLE_BODY.addEventListener("mouseleave", () => {
      this.hoverCursorY = null;
    });

    // Initialize columns
    this.updateFields([]);
  }

  /** Scrolls such that the selected time is in view.
   *
   * @returns Whether the position was updated
   */
  private scrollToSelected() {
    if (this.selectedTime !== null) {
      let targetRow = this.timestamps.findLastIndex((timestamp) => timestamp <= this.selectedTime!);
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
  private updateFields(fields: TableRendererCommand["fields"]) {
    // Update hand icon
    let showHand = this.hasController && (fields.length === 0 || fields.every((field) => !field.isAvailable));
    this.HAND_ICON.style.transition = showHand ? "opacity 1s ease-in 1s" : "";
    this.HAND_ICON.style.opacity = showHand ? "0.15" : "0";

    // Clear old header cells
    let header = this.TABLE_BODY.firstElementChild as HTMLElement;
    while (header.childElementCount > 1) {
      header.removeChild(header.lastChild as HTMLElement);
    }

    // Add new header cells
    fields.forEach((field, index) => {
      let cell = document.createElement("th");
      Array.from(this.HEADER_TEMPLATE.children).forEach((element) => {
        cell.appendChild(element.cloneNode(true));
      });
      header.appendChild(cell);

      let keyContainer = cell.firstElementChild as HTMLElement;
      let textElement = keyContainer.firstElementChild as HTMLElement;
      if (!field.isAvailable) {
        textElement.style.textDecoration = "line-through";
      }
      cell.title = field.key;
      textElement.innerText = field.key;

      let closeButton = cell.lastElementChild as HTMLElement;
      closeButton.title = "";
      closeButton.hidden = !this.hasController;
      if (this.hasController) {
        keyContainer.classList.add("has-close-button");
        closeButton.addEventListener("click", () => {
          this.ROOT.dispatchEvent(new CustomEvent("close-field", { detail: index }));
        });
      }
    });
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
        for (let i = this.dataRows.length - 1; i >= 0; i--) {
          if (!this.dataRows[i].hidden) {
            this.dataRows[i].classList.add("selected");
            break;
          }
        }
        highlight(this.hoveredTime, "hovered");
        break;
    }
  }

  getAspectRatio(): number | null {
    return null;
  }

  getTimestampRange(): [number, number] | null {
    return this.timestampRange;
  }

  render(command: TableRendererCommand): void {
    let initialScrollPosition = this.TABLE_CONTAINER.scrollTop;
    this.selectionMode = command.selectionMode;
    this.selectedTime = command.selectedTime;
    this.hoveredTime = command.hoveredTime;

    // Check if fields have changed
    {
      let fields = command.fields.map((field) => field.key);
      let fieldsAvailable = command.fields.map((field) => field.isAvailable);
      if (!arraysEqual(fields, this.lastFields) || !arraysEqual(fieldsAvailable, this.lastFieldsAvailable)) {
        this.updateFields(command.fields);
        this.lastFields = fields;
        this.lastFieldsAvailable = fieldsAvailable;
      }
    }

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

    // Update timestamps, count removed rows from start
    let removedRows = this.timestamps.findIndex((timestamp) => timestamp === command.timestamps[1]) - 1;
    if (removedRows > 0) {
      this.TABLE_CONTAINER.scrollTop = initialScrollPosition - removedRows * this.ROW_HEIGHT_PX;
    }
    this.timestamps = command.timestamps;

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
    this.timestampRange =
      this.dataRowTimestamps.length > 0
        ? [this.dataRowTimestamps[0], this.dataRowTimestamps[this.dataRowTimestamps.length - 1]]
        : null;
    command.fields.forEach((field) => {
      if (!field.isAvailable) {
        for (let i = dataRowStart; i < dataRowEnd; i++) {
          cellText[i - dataRowStart].push("null");
        }
      } else {
        for (let i = dataRowStart; i < dataRowEnd; i++) {
          let nextIndex = field.data!.timestamps.findIndex((value) => value > this.timestamps[i]);
          if (nextIndex === -1) nextIndex = field.data!.timestamps.length;
          if (nextIndex === 0 || field.type === null) {
            cellText[i - dataRowStart].push("null");
          } else {
            let value = field.data!.values[nextIndex - 1];
            let text = getLogValueText(value, field.type);
            if (field.type === LoggableType.Boolean) {
              text = (value ? "🟩" : "🟥") + " " + text;
            }
            cellText[i - dataRowStart].push(text);
          }
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
    switch (this.selectionMode) {
      case SelectionMode.Playback:
        this.scrollToSelected();
        break;
      case SelectionMode.Locked:
        if (this.lastScrollPosition !== null && initialScrollPosition < this.lastScrollPosition) {
          // Scrolling down, unlock
          window.selection.unlock();
        } else {
          this.scrollToSelected();
        }
        break;
    }
    this.lastScrollPosition = this.TABLE_CONTAINER.scrollTop;

    // Update selected & hovered times
    let header = this.TABLE_BODY.firstElementChild as HTMLElement;
    if (this.hoverCursorY !== null && this.hoverCursorY > header.getBoundingClientRect().bottom) {
      this.dataRows.forEach((row, index) => {
        let rect = row.getBoundingClientRect();
        if (this.hoverCursorY! >= rect.top && this.hoverCursorY! < rect.bottom) {
          window.selection.setHoveredTime(this.dataRowTimestamps[index]);
          this.didClearHoveredTime = false;
        }
      });
    } else if (!this.didClearHoveredTime) {
      window.selection.setHoveredTime(null);
      this.didClearHoveredTime = true;
    }
    this.updateHighlights();
    let placeholder = this.selectedTime === null ? 0 : this.selectedTime;
    this.INPUT_FIELD.placeholder = formatTimeWithMS(placeholder);
  }

  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {}
}

export type TableRendererCommand = {
  timestamps: number[];
  fields: {
    key: string;
    isAvailable: boolean;
    data: LogValueSetAny | null;
    type: LoggableType | null;
  }[];
  selectionMode: SelectionMode;
  selectedTime: number | null;
  hoveredTime: number | null;
};
