import LoggableType from "../../shared/log/LoggableType";
import { getEnabledData } from "../../shared/log/LogUtil";
import { LogValueSetBoolean } from "../../shared/log/LogValueSets";
import TabType from "../../shared/TabType";
import { createUUID } from "../../shared/util";
import Visualizer from "../../shared/visualizers/Visualizer";
import { TimelineVisualizerState } from "../HubState";
import { SelectionMode } from "../Selection";
import TabController from "../TabController";

export default abstract class TimelineVizController implements TabController {
  private ENABLED_KEYS = [
    "/DriverStation/Enabled",
    "/AdvantageKit/DriverStation/Enabled",
    "DS:enabled",
    "/FMSInfo/FMSControlData"
  ];

  protected UUID = createUUID();
  protected CONTENT: HTMLElement;
  private TIMELINE_INPUT: HTMLInputElement;
  private TIMELINE_MARKER_CONTAINER: HTMLElement;
  private DRAG_HIGHLIGHT: HTMLElement;
  private CONFIG_TABLE: HTMLElement;

  private type: TabType;
  private fieldConfig: { element: HTMLElement; type: LoggableType }[];
  private fields: (string | null)[] = [];
  private visualizer: Visualizer;

  constructor(
    content: HTMLElement,
    type: TabType,
    fieldConfig: { element: HTMLElement; type: LoggableType }[],
    visualizer: Visualizer
  ) {
    this.CONTENT = content;
    this.type = type;
    this.fieldConfig = fieldConfig;
    this.visualizer = visualizer;

    this.TIMELINE_INPUT = content.getElementsByClassName("timeline-viz-timeline-slider")[0] as HTMLInputElement;
    this.TIMELINE_MARKER_CONTAINER = content.getElementsByClassName(
      "timeline-viz-timeline-marker-container"
    )[0] as HTMLElement;
    this.DRAG_HIGHLIGHT = content.getElementsByClassName("timeline-viz-drag-highlight")[0] as HTMLElement;
    this.CONFIG_TABLE = content.getElementsByClassName("timeline-viz-config")[0] as HTMLElement;

    // Timeline controls
    this.TIMELINE_INPUT.addEventListener("input", () => {
      window.selection.setSelectedTime(Number(this.TIMELINE_INPUT.value));
    });
    content.getElementsByClassName("timeline-viz-popup-button")[0].addEventListener("click", () => {
      window.sendMainMessage("create-satellite", {
        uuid: this.UUID,
        type: this.type
      });
    });

    // Drag handling
    window.addEventListener("drag-update", (event) => {
      this.handleDrag((event as CustomEvent).detail);
    });

    // Create field list and clear fields on right click
    Object.values(this.fieldConfig).forEach((field, index) => {
      this.fields.push(null);
      field.element.addEventListener("contextmenu", () => {
        this.fields[index] = null;
        this.updateFields();
      });
    });

    // Start periodic cycle
    window.setInterval(() => this.customPeriodic(), 1000 / 60);

    // Refresh timeline immediately
    this.refresh();
  }

  saveState(): TimelineVisualizerState {
    let type = this.type as TabType.Odometry | TabType.Points | TabType.Video;
    return {
      type: type,
      fields: this.fields,
      options: this.options
    };
  }

  restoreState(state: TimelineVisualizerState) {
    if (state.type != this.type) return;
    this.fields = state.fields;
    this.options = state.options;
    this.updateFields();
  }

  /** Processes a drag event, including updating a field if necessary. */
  private handleDrag(dragData: any) {
    if (this.CONTENT.hidden) return;

    this.DRAG_HIGHLIGHT.hidden = true;
    Object.values(this.fieldConfig).forEach((field, index) => {
      let rect = field.element.getBoundingClientRect();
      let active =
        dragData.x > rect.left && dragData.x < rect.right && dragData.y > rect.top && dragData.y < rect.bottom;
      let type = window.log.getType(dragData.data.fields[0]);
      let validType = type == field.type;

      if (active && validType) {
        if (dragData.end) {
          let key = dragData.data.fields[0];
          this.fields[index] = key;
          this.updateFields();
        } else {
          let contentRect = this.CONTENT.getBoundingClientRect();
          this.DRAG_HIGHLIGHT.style.left = (rect.left - contentRect.left).toString() + "px";
          this.DRAG_HIGHLIGHT.style.top = (rect.top - contentRect.top).toString() + "px";
          this.DRAG_HIGHLIGHT.style.width = rect.width.toString() + "px";
          this.DRAG_HIGHLIGHT.style.height = rect.height.toString() + "px";
          this.DRAG_HIGHLIGHT.hidden = false;
        }
      }
    });
  }

  /** Updates the field elements based on the internal field list. */
  private updateFields() {
    Object.values(this.fieldConfig).forEach((field, index) => {
      let textElement = field.element.lastElementChild as HTMLElement;
      let key = this.fields[index];
      let availableKeys = window.log.getFieldKeys();

      if (key == null) {
        textElement.innerText = "<Drag Here>";
        textElement.style.textDecoration = "";
      } else if (!availableKeys.includes(key)) {
        textElement.innerText = key;
        textElement.style.textDecoration = "line-through";
      } else {
        textElement.innerText = key;
        textElement.style.textDecoration = "";
      }
    });
  }

  refresh() {
    // Render timeline sections
    while (this.TIMELINE_MARKER_CONTAINER.firstChild) {
      this.TIMELINE_MARKER_CONTAINER.removeChild(this.TIMELINE_MARKER_CONTAINER.firstChild);
    }
    let range = window.log.getTimestampRange();
    let isLocked = window.selection.getMode() == SelectionMode.Locked;
    if (isLocked) range[1] = window.selection.getSelectedTime() as number;
    this.TIMELINE_INPUT.min = range[0].toString();
    this.TIMELINE_INPUT.max = range[1].toString();
    this.TIMELINE_INPUT.disabled = isLocked;

    let enabledData = getEnabledData(window.log);
    if (enabledData) {
      for (let i = 0; i < enabledData.values.length; i++) {
        if (enabledData.values[i]) {
          let div = document.createElement("div");
          this.TIMELINE_MARKER_CONTAINER.appendChild(div);
          let leftPercent = ((enabledData.timestamps[i] - range[0]) / (range[1] - range[0])) * 100;
          let nextTime = i == enabledData.values.length - 1 ? range[1] : enabledData.timestamps[i + 1];
          let widthPercent = ((nextTime - enabledData.timestamps[i]) / (range[1] - range[0])) * 100;
          div.style.left = leftPercent.toString() + "%";
          div.style.width = widthPercent.toString() + "%";
        }
      }
    }

    // Jump to end of timeline if locked
    if (window.selection.getMode() == SelectionMode.Locked) this.TIMELINE_INPUT.value = this.TIMELINE_INPUT.max;

    // Update fields
    this.updateFields();
  }

  periodic() {}

  /** Called every 15ms (regardless of the visible tab). */
  private customPeriodic() {
    // Get time to render
    let time = 0;
    let selectionMode = window.selection.getMode();
    let hoveredTime = window.selection.getHoveredTime();
    let selectedTime = window.selection.getSelectedTime();
    if (selectionMode == SelectionMode.Playback || selectionMode == SelectionMode.Locked) {
      time = selectedTime as number;
    } else if (hoveredTime) {
      time = hoveredTime;
    } else if (selectedTime) {
      time = selectedTime;
    }

    // Update timeline
    if (window.selection.getMode() != SelectionMode.Locked) {
      this.TIMELINE_INPUT.value = time.toString();
    }

    // Update content height
    this.CONTENT.style.setProperty(
      "--bottom-margin",
      this.CONFIG_TABLE.getBoundingClientRect().height.toString() + "px"
    );

    // Get command
    let command = this.getCommand(time);

    // Update visualizers
    if (!this.CONTENT.hidden) this.visualizer.render(command);
    window.sendMainMessage("update-satellite", {
      uuid: this.UUID,
      command: command
    });
  }

  /** Returns the list of selected fields. */
  protected getFields(): (string | null)[] {
    return this.fields;
  }

  /** Returns the set of selected options. */
  abstract get options(): { [id: string]: any };

  /** Updates the set of selected options. */
  abstract set options(options: { [id: string]: any });

  /** Returns a command to render a single frame. */
  abstract getCommand(time: number): any;
}
