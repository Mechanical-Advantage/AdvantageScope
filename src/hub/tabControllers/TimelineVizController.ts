import { TimelineVisualizerState } from "../../shared/HubState";
import LoggableType from "../../shared/log/LoggableType";
import { getEnabledData } from "../../shared/log/LogUtil";
import TabType from "../../shared/TabType";
import { arraysEqual, clampValue, createUUID, scaleValue } from "../../shared/util";
import Visualizer from "../../shared/visualizers/Visualizer";
import { SelectionMode } from "../Selection";
import TabController from "../TabController";

export default abstract class TimelineVizController implements TabController {
  private HANDLE_WIDTH = 4;

  protected UUID = createUUID();
  protected CONTENT: HTMLElement;
  private TIMELINE_INPUT: HTMLInputElement;
  private TIMELINE_MARKER_CONTAINER: HTMLElement;
  private TIMELINE_LABEL: HTMLElement;
  private DRAG_HIGHLIGHT: HTMLElement;
  private CONFIG_TABLE: HTMLElement;
  private HIDE_BUTTON: HTMLButtonElement;
  private SHOW_BUTTON: HTMLButtonElement;

  private type: TabType;
  private title: string = "";
  private fieldConfig: { element: HTMLElement; types: (LoggableType | string)[] }[];
  private fields: ({ key: string; sourceTypeIndex: number; sourceType: LoggableType | string } | null)[] = [];
  private listConfig: {
    element: HTMLElement;
    types: (LoggableType | string)[];
    options: string[][];
    autoAdvanceOptions?: boolean[];
  }[];
  private listFields: { type: string; key: string; sourceTypeIndex: number; sourceType: LoggableType | string }[][] =
    [];
  private lastListFieldsStr: string = "";
  private lastAllKeys: string[] = [];
  private periodicInterval: number;
  protected visualizer: Visualizer;

  constructor(
    content: HTMLElement,
    type: TabType,
    fieldConfig: { element: HTMLElement; types: (LoggableType | string)[] }[],
    listConfig: {
      element: HTMLElement;
      types: (LoggableType | string)[];
      options: string[][];
      autoAdvanceOptions?: boolean[];
    }[],
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
    this.TIMELINE_LABEL = content.getElementsByClassName("timeline-viz-timeline-label")[0] as HTMLElement;
    this.DRAG_HIGHLIGHT = content.getElementsByClassName("timeline-viz-drag-highlight")[0] as HTMLElement;
    this.CONFIG_TABLE = content.getElementsByClassName("timeline-viz-config")[0] as HTMLElement;

    // Timeline controls
    this.TIMELINE_INPUT.addEventListener("input", () => {
      window.selection.setSelectedTime(Number(this.TIMELINE_INPUT.value));
    });
    content.getElementsByClassName("timeline-viz-reset-button")[0].addEventListener("click", () => {
      let enabledData = getEnabledData(window.log);
      if (enabledData) {
        for (let i = 0; i < enabledData.timestamps.length; i++) {
          if (enabledData.values[i]) {
            window.selection.setSelectedTime(enabledData.timestamps[i]);
            return;
          }
        }
      }
    });
    this.HIDE_BUTTON = content.getElementsByClassName("timeline-viz-hide-button")[0] as HTMLButtonElement;
    this.SHOW_BUTTON = content.getElementsByClassName("timeline-viz-show-button")[0] as HTMLButtonElement;
    this.HIDE_BUTTON.addEventListener("click", () => {
      this.HIDE_BUTTON.hidden = true;
      this.SHOW_BUTTON.hidden = false;
      this.CONFIG_TABLE.hidden = true;
    });
    this.SHOW_BUTTON.addEventListener("click", () => {
      this.HIDE_BUTTON.hidden = false;
      this.SHOW_BUTTON.hidden = true;
      this.CONFIG_TABLE.hidden = false;
    });
    content.getElementsByClassName("timeline-viz-popup-button")[0].addEventListener("click", () => {
      window.sendMainMessage("create-satellite", {
        uuid: this.UUID,
        type: this.type
      });
    });
    this.TIMELINE_INPUT.addEventListener("mouseenter", () => {
      this.TIMELINE_LABEL.classList.add("show");
    });
    this.TIMELINE_INPUT.addEventListener("mouseleave", () => {
      this.TIMELINE_LABEL.classList.remove("show");
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
    this.periodicInterval = window.setInterval(() => this.customPeriodic(), 1000 / 60);

    // Refresh timeline immediately
    this.refresh();
  }

  stopPeriodic() {
    window.clearInterval(this.periodicInterval);
  }

  saveState(): TimelineVisualizerState {
    let type = this.type as TabType.Odometry | TabType.Points | TabType.Video;
    return {
      type: type,
      fields: this.fields,
      listFields: this.listFields,
      options: this.options,
      configHidden: this.CONFIG_TABLE.hidden
    };
  }

  restoreState(state: TimelineVisualizerState) {
    if (state.type !== this.type) return;
    this.fields = state.fields;
    this.listFields = state.listFields;
    this.options = state.options;
    this.HIDE_BUTTON.hidden = state.configHidden;
    this.SHOW_BUTTON.hidden = !state.configHidden;
    this.CONFIG_TABLE.hidden = state.configHidden;
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
        let anyValidType = false;
        dragData.data.fields.forEach((dragField: string, dragFieldIndex: number) => {
          if (configIndex === 0 && anyValidType) return; // Single field and valid field already found
          let logType = window.log.getType(dragField);
          let structuredType = window.log.getStructuredType(dragField);
          let validLogType = logType !== null && field.types.includes(logType);
          let validStructuredType = structuredType !== null && field.types.includes(structuredType);
          let validType = validLogType || validStructuredType;
          anyValidType = anyValidType || validType;

          if (active && validType && dragData.end) {
            if (configIndex === 0) {
              // Single field
              let typeIndex = this.fieldConfig[index].types.indexOf(validStructuredType ? structuredType! : logType!);
              this.fields[index] = {
                key: dragField,
                sourceTypeIndex: typeIndex,
                sourceType: this.fieldConfig[index].types[typeIndex]
              };
            } else {
              // List field
              let selectedOptions = this.listFields[index].map((field) => field.type);
              let typeIndex = this.listConfig[index].types.indexOf(validStructuredType ? structuredType! : logType!);
              let availableOptions = this.listConfig[index].options[typeIndex];
              if (
                this.listConfig[index].autoAdvanceOptions === undefined ||
                this.listConfig[index].autoAdvanceOptions![typeIndex]
              ) {
                availableOptions = availableOptions.filter((option) => !selectedOptions.includes(option));
                if (availableOptions.length === 0) {
                  availableOptions.push(this.listConfig[index].options[typeIndex][0]);
                }
              }
              this.listFields[index].push({
                type: availableOptions[0],
                key: dragField,
                sourceTypeIndex: typeIndex,
                sourceType: this.listConfig[index].types[typeIndex]
              });
            }
          }
        });
        if (active && anyValidType) {
          if (dragData.end) {
            this.updateFields();
            if (configIndex === 1) {
              // List field, scroll to bottom
              let listContent = field.element.firstElementChild as HTMLElement;
              listContent.scrollTop = listContent.scrollHeight;
            }
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
      let key = this.fields[index]?.key;

      if (key === undefined) {
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
    if (arraysEqual(allKeys, this.lastAllKeys) && listFieldsStr === this.lastListFieldsStr) {
      return;
    }
    this.lastAllKeys = allKeys;
    this.lastListFieldsStr = listFieldsStr;

    // List fields
    Object.values(this.listConfig).forEach((list, index) => {
      let content = list.element.firstElementChild as HTMLElement;

      // Clear elements
      while (content.firstChild) {
        content.removeChild(content.firstChild);
      }

      // Add filler if necessary
      if (this.listFields[index].length === 0) {
        let fillerElement = document.createElement("div");
        fillerElement.classList.add("list-filler");
        fillerElement.innerText = "<Drag Here>";
        content.appendChild(fillerElement);
      }

      // Add fields
      this.listFields[index].forEach((field, fieldIndex) => {
        let itemElement = document.createElement("div");
        itemElement.classList.add("list-item");
        content.appendChild(itemElement);
        itemElement.addEventListener("contextmenu", () => {
          this.listFields[index].splice(fieldIndex, 1);
          this.updateFields();
        });

        let labelElement = document.createElement("span");
        labelElement.classList.add("label");
        labelElement.innerHTML = "<select></select>: ";
        itemElement.appendChild(labelElement);

        let selectElement = labelElement.firstChild as HTMLSelectElement;
        list.options[field.sourceTypeIndex].forEach((option) => {
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
    let activeFields = this.fields.filter((field) => field !== null).map((field) => field?.key) as string[];
    this.listFields.forEach((group) =>
      group.forEach((field) => {
        activeFields.push(field.key);
      })
    );
    return [...activeFields, ...this.getAdditionalActiveFields()];
  }

  periodic() {
    // Update list shadows
    Object.values(this.listConfig).forEach((list) => {
      let content = list.element.firstElementChild as HTMLElement;
      let shadowTop = list.element.getElementsByClassName("list-shadow-top")[0] as HTMLElement;
      let shadowBottom = list.element.getElementsByClassName("list-shadow-bottom")[0] as HTMLElement;
      shadowTop.style.opacity = content.scrollTop === 0 ? "0" : "1";
      shadowBottom.style.opacity =
        Math.ceil(content.scrollTop + content.clientHeight) >= content.scrollHeight ? "0" : "1";
    });

    // Update timeline label position
    {
      let contentBox = this.CONTENT.getBoundingClientRect();
      let timelineBox = this.TIMELINE_MARKER_CONTAINER.getBoundingClientRect();
      let windowX = scaleValue(
        Number(this.TIMELINE_INPUT.value),
        [Number(this.TIMELINE_INPUT.min), Number(this.TIMELINE_INPUT.max)],
        [timelineBox.left + this.HANDLE_WIDTH / 2, timelineBox.right - this.HANDLE_WIDTH / 2]
      );
      let contentX = windowX - contentBox.left;
      this.TIMELINE_LABEL.style.left = contentX.toString() + "px";
    }
  }

  /** Called every 15ms (regardless of the visible tab). */
  private customPeriodic() {
    // Get time to render
    let time: number;
    let range = window.log.getTimestampRange();
    let selectionMode = window.selection.getMode();
    let hoveredTime = window.selection.getHoveredTime();
    let selectedTime = window.selection.getSelectedTime();
    if (selectionMode === SelectionMode.Playback || selectionMode === SelectionMode.Locked) {
      time = selectedTime as number;
    } else if (hoveredTime !== null) {
      time = hoveredTime;
    } else if (selectedTime !== null) {
      time = selectedTime;
    } else {
      time = range[0];
    }
    let liveTime = window.selection.getCurrentLiveTime();
    if (liveTime !== null) {
      range[1] = liveTime;
    }

    // Render timeline sections
    while (this.TIMELINE_MARKER_CONTAINER.firstChild) {
      this.TIMELINE_MARKER_CONTAINER.removeChild(this.TIMELINE_MARKER_CONTAINER.firstChild);
    }
    this.TIMELINE_INPUT.min = range[0].toString();
    this.TIMELINE_INPUT.max = range[1].toString();
    this.TIMELINE_INPUT.disabled = window.selection.getMode() === SelectionMode.Locked;

    let enabledData = getEnabledData(window.log);
    if (enabledData) {
      for (let i = 0; i < enabledData.values.length; i++) {
        if (enabledData.values[i]) {
          let div = document.createElement("div");
          this.TIMELINE_MARKER_CONTAINER.appendChild(div);
          let nextTime = i === enabledData.values.length - 1 ? range[1] : enabledData.timestamps[i + 1];
          let marginPercent = (this.HANDLE_WIDTH / 2 / this.TIMELINE_MARKER_CONTAINER.clientWidth) * 100;
          let leftPercent = scaleValue(enabledData.timestamps[i], range, [i === 0 ? 0 : marginPercent, 100]);
          let rightPercent = scaleValue(nextTime, range, [
            0,
            100 - (i === enabledData.values.length - 1 ? 0 : marginPercent)
          ]);
          leftPercent = clampValue(leftPercent, 0, 100);
          rightPercent = clampValue(rightPercent, 0, 100);
          let widthPercent = rightPercent - leftPercent;
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

    // Update timeline label
    let labelNumber = Math.round(time * 10) / 10;
    let labelString = labelNumber.toString();
    if (labelNumber % 1 === 0) {
      labelString += ".0";
    }
    this.TIMELINE_LABEL.innerText = labelString + "s";

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
  protected getFields() {
    return this.fields;
  }

  /** Returns the list of selected fields from lists. */
  protected getListFields() {
    return this.listFields;
  }

  /** Returns the set of selected options. */
  abstract get options(): { [id: string]: any };

  /** Updates the set of selected options. */
  abstract set options(options: { [id: string]: any });

  /** Notify that the set of assets was updated. */
  abstract newAssets(): void;

  /**
   * Returns the list of fields currently being displayed. This is
   * used to selectively request fields from live sources, and all
   * keys matching the provided prefixes will be made available.
   * */
  abstract getAdditionalActiveFields(): string[];

  /** Returns a command to render a single frame. */
  abstract getCommand(time: number): any;
}
