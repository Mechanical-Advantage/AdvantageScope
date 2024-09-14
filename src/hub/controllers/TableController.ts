import { LogValueSetAny } from "../../shared/log/LogValueSets";
import LoggableType from "../../shared/log/LoggableType";
import { TableRendererCommand } from "../../shared/renderers/TableRenderer";
import { checkArrayType, createUUID } from "../../shared/util";
import TabController from "./TabController";

export default class TableController implements TabController {
  UUID = createUUID();

  private DRAG_THRESHOLD_PX = 5;

  private ROOT: HTMLElement;
  private TABLE_CONTAINER: HTMLElement;
  private TABLE_BODY: HTMLElement;
  private HEADER: HTMLElement;
  private DRAG_HIGHLIGHT: HTMLElement;
  private DRAG_ITEM = document.getElementById("dragItem") as HTMLElement;

  private fields: string[] = [];
  private ranges: { [key: string]: [number, number] } = {};

  constructor(root: HTMLElement) {
    this.ROOT = root;
    this.TABLE_CONTAINER = root.getElementsByClassName("data-table-container")[0] as HTMLElement;
    this.TABLE_BODY = root.getElementsByClassName("data-table")[0].firstElementChild as HTMLElement;
    this.HEADER = this.TABLE_BODY.firstElementChild as HTMLElement;
    this.DRAG_HIGHLIGHT = root.getElementsByClassName("data-table-drag-highlight")[0] as HTMLElement;

    // Drag handling
    window.addEventListener("drag-update", (event) => {
      this.handleDrag((event as CustomEvent).detail);
    });

    // Close field events
    this.ROOT.addEventListener("close-field", (event) => {
      let index = (event as CustomEvent).detail;
      if (index < this.fields.length) {
        this.fields.splice(index, 1);
      }
    });

    // Column dragging
    let mouseDownInfo: [number, number] | null = null;
    root.addEventListener("mousedown", (event) => {
      if (event.clientY < this.HEADER.firstElementChild!.getBoundingClientRect().bottom) {
        mouseDownInfo = [event.clientX, event.clientY];
      }
    });
    root.addEventListener("mouseup", () => {
      mouseDownInfo = null;
    });
    root.addEventListener("mousemove", (event) => {
      // Start drag
      if (
        mouseDownInfo !== null &&
        (Math.abs(event.clientX - mouseDownInfo[0]) >= this.DRAG_THRESHOLD_PX ||
          Math.abs(event.clientY - mouseDownInfo[1]) >= this.DRAG_THRESHOLD_PX)
      ) {
        // Find item
        let index = -1;
        Array.from(this.HEADER.children).forEach((element, i) => {
          if (i === 0) return;
          let rect = element.getBoundingClientRect();
          if (
            mouseDownInfo![0] >= rect.left &&
            mouseDownInfo![0] <= rect.right &&
            mouseDownInfo![1] >= rect.top &&
            mouseDownInfo![1] <= rect.bottom
          ) {
            index = i;
          }
        });
        mouseDownInfo = null;
        if (index === -1) return;

        // Update drag item
        while (this.DRAG_ITEM.firstChild) {
          this.DRAG_ITEM.removeChild(this.DRAG_ITEM.firstChild);
        }
        let element = this.HEADER.children[index];
        let keyContainer = element.firstElementChild as HTMLElement;
        let dragContainer = document.createElement("div");
        dragContainer.style.position = "absolute";
        dragContainer.style.width =
          Math.min(keyContainer.clientWidth, (keyContainer.firstElementChild as HTMLElement).offsetWidth).toString() +
          "px";
        dragContainer.style.height = "30px";
        dragContainer.style.left = "0px";
        dragContainer.style.top = "0px";
        dragContainer.style.margin = "none";
        dragContainer.style.padding = "none";
        let keyContainerClone = keyContainer.cloneNode(true) as HTMLElement;
        keyContainerClone.style.width = "100%";
        keyContainerClone.style.fontWeight = "bold";
        keyContainerClone.style.fontSize = "14px";
        dragContainer.appendChild(keyContainerClone);
        this.DRAG_ITEM.appendChild(dragContainer);

        // Start drag
        let itemRect = element.getBoundingClientRect();
        window.startDrag(event.clientX, event.clientY, event.clientX - itemRect.left, event.clientY - itemRect.top, {
          tableIndex: index - 1
        });
      }
    });
  }

  saveState(): unknown {
    return this.fields;
  }

  restoreState(state: unknown): void {
    if (checkArrayType(state, "string")) {
      this.fields = state as string[];
    }
  }

  /** Processes a drag event, including adding a field if necessary. */
  private handleDrag(dragData: any) {
    if (this.ROOT.hidden) return;
    const isField = "fields" in dragData.data;
    const isColumn = "tableIndex" in dragData.data;
    if (!isField && !isColumn) return;

    // Remove empty fields
    let dragFields: string[] = [];
    if (isField) {
      dragFields = dragData.data.fields;
      dragFields = dragFields.filter((field) => window.log.getType(field) !== LoggableType.Empty);
      if (dragFields.length === 0) return;
    }

    // Find selected section
    let tableBox = this.TABLE_CONTAINER.getBoundingClientRect();
    let selected: number | null = null;
    let selectedX: number | null = null;
    if (dragData.y > tableBox.y) {
      for (let i = 0; i < this.HEADER.childElementCount; i++) {
        let targetX = 0;
        if (i === 0 && this.fields.length > 0) {
          targetX = this.HEADER.children[1].getBoundingClientRect().left;
        } else {
          targetX = this.HEADER.children[i].getBoundingClientRect().right;
        }
        if (targetX < (this.HEADER.firstElementChild as HTMLElement).getBoundingClientRect().right) continue;
        let leftBound = i === 0 ? tableBox.x : targetX - this.HEADER.children[i].getBoundingClientRect().width / 2;
        let rightBound =
          i === this.HEADER.childElementCount - 1
            ? Infinity
            : targetX + this.HEADER.children[i + 1].getBoundingClientRect().width / 2;
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
        if (isField) {
          this.fields.splice(selected, 0, ...dragFields);
        } else if (isColumn) {
          let sourceIndex = dragData.data.tableIndex;
          let fields = this.fields.splice(sourceIndex, 1)[0];
          if (selected <= sourceIndex) {
            this.fields.splice(selected, 0, fields);
          } else {
            this.fields.splice(selected - 1, 0, fields);
          }
        }
      }
    } else {
      this.DRAG_HIGHLIGHT.hidden = selected === null;
      if (selected !== null && selectedX !== null) {
        this.DRAG_HIGHLIGHT.style.left = (selectedX - tableBox.x - 12.5).toString() + "px";
      }
    }
  }

  refresh(): void {}

  newAssets(): void {}

  getActiveFields(): string[] {
    return this.fields;
  }

  showTimeline(): boolean {
    return false;
  }

  addRendererRange(uuid: string, range: [number, number] | null) {
    if (range === null) {
      if (uuid in this.ranges) delete this.ranges[uuid];
    } else {
      this.ranges[uuid] = range;
    }
  }

  getCommand(): TableRendererCommand {
    const availableKeys = window.log.getFieldKeys();

    let ranges = Object.values(this.ranges);
    ranges.sort((a, b) => a[0] - b[0]);
    const mergedRanges: [number, number][] = [];
    for (const range of ranges) {
      if (mergedRanges.length === 0 || range[0] > mergedRanges[mergedRanges.length - 1][1]) {
        mergedRanges.push(range);
      } else {
        mergedRanges[mergedRanges.length - 1][1] = Math.max(mergedRanges[mergedRanges.length - 1][1], range[1]);
      }
    }

    let fieldData: TableRendererCommand["fields"] = this.fields.map((key) => {
      const isAvailable = availableKeys.includes(key);
      if (!isAvailable) {
        return {
          key: key,
          isAvailable: false,
          data: null,
          type: null
        };
      } else {
        let data: LogValueSetAny = { timestamps: [], values: [] };
        mergedRanges.forEach((range) => {
          let newData = window.log.getRange(key, range[0], range[1], this.UUID);
          if (newData !== undefined) {
            data.timestamps = data.timestamps.concat(newData.timestamps);
            data.values = data.values.concat(newData.values);
          }
        });
        return {
          key: key,
          isAvailable: true,
          data: data,
          type: window.log.getType(key)
        };
      }
    });

    return {
      timestamps: window.log.getTimestamps(this.fields, this.UUID),
      fields: fieldData,
      selectionMode: window.selection.getMode(),
      selectedTime: window.selection.getSelectedTime(),
      hoveredTime: window.selection.getHoveredTime()
    };
  }
}
