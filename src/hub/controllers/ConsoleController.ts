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
      console.log(active);
      let validType = window.log.getType(dragData.data.fields[0]) === LoggableType.String;
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
      return [this.field];
    } else {
      return [];
    }
  }

  showTimeline(): boolean {
    return false;
  }

  getCommand(): ConsoleRendererCommand {
    const isAvailable = this.field !== null && window.log.getFieldKeys().includes(this.field);
    return {
      key: this.field,
      keyAvailable: isAvailable,
      serialized: isAvailable ? window.log.getField(this.field!)?.toSerialized() : null,

      selectionMode: window.selection.getMode(),
      selectedTime: window.selection.getSelectedTime(),
      hoveredTime: window.selection.getHoveredTime()
    };
  }
}
