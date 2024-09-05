import LoggableType from "../../shared/log/LoggableType";
import { TableRendererCommand } from "../../shared/renderers/TableRenderer";
import { checkArrayType, createUUID } from "../../shared/util";
import TabController from "./TabController";

export default class TableController implements TabController {
  UUID = createUUID();

  private ROOT: HTMLElement;
  private TABLE_CONTAINER: HTMLElement;
  private TABLE_BODY: HTMLElement;
  private DRAG_HIGHLIGHT: HTMLElement;

  private fields: string[] = [];

  constructor(root: HTMLElement) {
    this.ROOT = root;
    this.TABLE_CONTAINER = root.getElementsByClassName("data-table-container")[0] as HTMLElement;
    this.TABLE_BODY = root.getElementsByClassName("data-table")[0].firstElementChild as HTMLElement;
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

  getCommand(): TableRendererCommand {
    const availableKeys = window.log.getFieldKeys();
    return {
      timestamps: window.log.getTimestamps(this.fields, this.UUID),
      fields: this.fields.map((key) => {
        const isAvailable = availableKeys.includes(key);
        return {
          key: key,
          isAvailable: isAvailable,
          serialized: isAvailable ? window.log.getField(key)?.toSerialized() : null
        };
      }),
      selectionMode: window.selection.getMode(),
      selectedTime: window.selection.getSelectedTime(),
      hoveredTime: window.selection.getHoveredTime()
    };
  }
}
