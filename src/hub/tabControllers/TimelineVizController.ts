import { TimelineVisualizerState } from "../../shared/HubState";
import LoggableType from "../../shared/log/LoggableType";
import { getEnabledData } from "../../shared/log/LogUtil";
import TabType from "../../shared/TabType";
import { arraysEqual, createUUID } from "../../shared/util";
import Visualizer from "../../shared/visualizers/Visualizer";
import { SelectionMode } from "../Selection";
import TabController from "../TabController";

export default abstract class TimelineVizController implements TabController {
  protected UUID = createUUID();
  protected CONTENT: HTMLElement;
  private TIMELINE_INPUT: HTMLInputElement;
  private TIMELINE_MARKER_CONTAINER: HTMLElement;
  private DRAG_HIGHLIGHT: HTMLElement;
  private CONFIG_TABLE: HTMLElement;

  private type: TabType;
  private title: string = "";
  private fieldConfig: { element: HTMLElement; types: (LoggableType | "mechanism")[] }[];
  private fields: (string | null)[] = [];
  private listConfig: { element: HTMLElement; types: (LoggableType | "mechanism")[]; options: string[][] }[];
  private listFields: { type: string; key: string; fieldTypeIndex: number }[][] = [];
  private lastListFieldsStr: string = "";
  private lastAllKeys: string[] = [];
  protected visualizer: Visualizer;

  constructor(
    content: HTMLElement,
    type: TabType,
    fieldConfig: { element: HTMLElement; types: (LoggableType | "mechanism")[] }[],
    listConfig: { element: HTMLElement; types: (LoggableType | "mechanism")[]; options: string[][] }[],
    visualizer: Visualizer
  ) {
    this.CONTENT = content;
    this.type = type;
    this.fieldConfig = fieldConfig;
    this.listConfig = listConfig;
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

    // Create empty arrays for list fields
    Object.values(this.listConfig).forEach(() => {
      this.listFields.push([]);
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
      listFields: this.listFields,
      options: this.options
    };
  }

  restoreState(state: TimelineVisualizerState) {
    if (state.type != this.type) return;
    this.fields = state.fields;
    this.listFields = state.listFields;
    this.options = state.options;
    this.updateFields();
  }

  /** Processes a drag event, including updating a field if necessary. */
  private handleDrag(dragData: any) {
    if (this.CONTENT.hidden) return;

    this.DRAG_HIGHLIGHT.hidden = true;
    [Object.values(this.fieldConfig), Object.values(this.listConfig)].forEach((configList, configIndex) => {
      configList.forEach((field, index) => {
        let rect = field.element.getBoundingClientRect();
        let active =
          dragData.x > rect.left && dragData.x < rect.right && dragData.y > rect.top && dragData.y < rect.bottom;
        let rawType = window.log.getType(dragData.data.fields[0]);
        let type: LoggableType | "mechanism" = rawType === undefined ? "mechanism" : rawType!;
        let validType = field.types.includes(type);

        if (active && validType) {
          if (dragData.end) {
            let key = dragData.data.fields[0];
            if (configIndex == 0) {
              // Single field
              this.fields[index] = key;
            } else {
              // List field
              let selectedOptions = this.listFields[index].map((field) => field.type);
              let typeIndex = this.listConfig[index].types.indexOf(type);
              let availableOptions = this.listConfig[index].options[typeIndex].filter(
                (option) => !selectedOptions.includes(option)
              );
              if (availableOptions.length == 0) availableOptions.push(this.listConfig[index].options[typeIndex][0]);
              this.listFields[index].push({
                type: availableOptions[0],
                key: key,
                fieldTypeIndex: typeIndex
              });
            }
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
    });
  }

  /** Checks if a key or its children are available. */
  private keyAvailable(key: string): boolean {
    let allKeys = window.log.getFieldKeys();
    for (let i = 0; i < allKeys.length; i++) {
      if (allKeys[i].startsWith(key)) {
        return true;
      }
    }
    return false;
  }

  /** Updates the field elements based on the internal field list. */
  private updateFields() {
    let allKeys = window.log.getFieldKeys();

    // Single fields
    Object.values(this.fieldConfig).forEach((field, index) => {
      let textElement = field.element.lastElementChild as HTMLElement;
      let key = this.fields[index];

      if (key == null) {
        textElement.innerText = "<Drag Here>";
        textElement.style.textDecoration = "";
      } else if (!this.keyAvailable(key)) {
        textElement.innerText = key;
        textElement.style.textDecoration = "line-through";
      } else {
        textElement.innerText = key;
        textElement.style.textDecoration = "";
      }
    });

    // Exit if list fields and available fields have not changed
    let listFieldsStr = JSON.stringify(this.listFields);
    if (arraysEqual(allKeys, this.lastAllKeys) && listFieldsStr == this.lastListFieldsStr) {
      return;
    }
    this.lastAllKeys = allKeys;
    this.lastListFieldsStr = listFieldsStr;

    // List fields
    Object.values(this.listConfig).forEach((list, index) => {
      // Clear elements
      while (list.element.firstChild) {
        list.element.removeChild(list.element.firstChild);
      }

      // Add filler if necessary
      if (this.listFields[index].length == 0) {
        let fillerElement = document.createElement("div");
        fillerElement.classList.add("list-filler");
        fillerElement.innerText = "<Drag Here>";
        list.element.appendChild(fillerElement);
      }

      // Add fields
      this.listFields[index].forEach((field, fieldIndex) => {
        let itemElement = document.createElement("div");
        itemElement.classList.add("list-item");
        list.element.appendChild(itemElement);
        itemElement.addEventListener("contextmenu", () => {
          this.listFields[index].splice(fieldIndex, 1);
          this.updateFields();
        });

        let labelElement = document.createElement("span");
        labelElement.classList.add("label");
        labelElement.innerHTML = "<select></select>: ";
        itemElement.appendChild(labelElement);

        let selectElement = labelElement.firstChild as HTMLSelectElement;
        list.options[field.fieldTypeIndex].forEach((option) => {
          let optionElement = document.createElement("option");
          optionElement.innerText = option;
          selectElement.appendChild(optionElement);
        });
        selectElement.value = field.type;
        selectElement.addEventListener("change", () => {
          this.listFields[index][fieldIndex].type = selectElement.value;
        });

        let fieldNameElement = document.createElement("span");
        fieldNameElement.classList.add("field-name");
        fieldNameElement.innerText = field.key;
        fieldNameElement.style.textDecoration = this.keyAvailable(field.key) ? "" : "line-through";
        itemElement.appendChild(fieldNameElement);
      });
    });
  }

  /** Called when this tab's title changes, so that the updated title can be sent to the satellites. */
  setTitle(title: string) {
    this.title = title;
  }

  refresh() {
    // Update fields
    this.updateFields();
  }

  getActiveFields(): string[] {
    let activeFields = this.fields.filter((field) => field !== null) as string[];
    this.listFields.forEach((group) =>
      group.forEach((field) => {
        activeFields.push(field.key);
      })
    );
    return [...activeFields, ...this.getAdditionalActiveFields()];
  }

  periodic() {}

  /** Called every 15ms (regardless of the visible tab). */
  private customPeriodic() {
    // Get time to render
    let time: number;
    let range = window.log.getTimestampRange();
    let selectionMode = window.selection.getMode();
    let hoveredTime = window.selection.getHoveredTime();
    let selectedTime = window.selection.getSelectedTime();
    if (selectionMode == SelectionMode.Playback || selectionMode == SelectionMode.Locked) {
      time = selectedTime as number;
    } else if (hoveredTime !== null) {
      time = hoveredTime;
    } else if (selectedTime !== null) {
      time = selectedTime;
    } else {
      time = range[0];
    }

    // Render timeline sections
    while (this.TIMELINE_MARKER_CONTAINER.firstChild) {
      this.TIMELINE_MARKER_CONTAINER.removeChild(this.TIMELINE_MARKER_CONTAINER.firstChild);
    }
    let isLocked = window.selection.getMode() == SelectionMode.Locked;
    if (isLocked) range[1] = selectedTime as number;
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

    // Update timeline value
    if (selectedTime !== null) {
      this.TIMELINE_INPUT.value = selectedTime.toString();
    } else {
      this.TIMELINE_INPUT.value = range[0].toString();
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
      command: command,
      title: this.title
    });
  }

  /** Returns the list of selected fields. */
  protected getFields(): (string | null)[] {
    return this.fields;
  }

  /** Returns the list of selected fields from lists. */
  protected getListFields(): { type: string; key: string }[][] {
    return this.listFields;
  }

  /** Returns the set of selected options. */
  abstract get options(): { [id: string]: any };

  /** Updates the set of selected options. */
  abstract set options(options: { [id: string]: any });

  /**
   * Returns the list of fields currently being displayed. This is
   * used to selectively request fields from live sources, and all
   * keys matching the provided prefixes will be made available.
   * */
  abstract getAdditionalActiveFields(): string[];

  /** Returns a command to render a single frame. */
  abstract getCommand(time: number): any;
}
