import { ensureThemeContrast } from "../shared/Colors";
import {
  SourceListConfig,
  SourceListItemState,
  SourceListOptionValueConfig,
  SourceListState,
  SourceListTypeConfig,
  SourceListTypeMemoryEntry
} from "../shared/SourceListConfig";
import {
  grabChassisSpeeds,
  grabPosesAuto,
  grabSwerveStates,
  rotation3dTo2d,
  rotation3dToRPY
} from "../shared/geometry";
import { getLogValueText, getMechanismState, getOrDefault } from "../shared/log/LogUtil";
import LoggableType from "../shared/log/LoggableType";
import { convert } from "../shared/units";
import { createUUID, jsonCopy } from "../shared/util";

export default class SourceList {
  private DRAG_THRESHOLD_PX = 5;

  static typePromptCallbacks: { [key: string]: (state: SourceListItemState) => void } = {};
  static clearPromptCallbacks: { [key: string]: () => void } = {};

  private UUID = createUUID();
  private ITEM_TEMPLATE = document.getElementById("sourceListItemTemplate")?.firstElementChild as HTMLElement;
  private ROOT: HTMLElement;
  private TITLE: HTMLElement;
  private EDIT_BUTTON: HTMLButtonElement;
  private CLEAR_BUTTON: HTMLButtonElement;
  private HELP_BUTTON: HTMLButtonElement;
  private LIST: HTMLElement;
  private HAND_ICON: HTMLImageElement;
  private DRAG_HIGHLIGHT: HTMLElement;
  private DRAG_ITEM = document.getElementById("dragItem") as HTMLElement;

  private stopped = false;
  private config: SourceListConfig;
  private configStr: string;
  private state: SourceListState = [];
  private independentAllowedTypes: Set<string> = new Set(); // Types that are not only children
  private parentKeys: Map<string, string> = new Map(); // Map type key to parent key
  private supplementalStateSuppliers: (() => SourceListState)[];
  private getNumberPreview: ((key: string, time: number) => number | null) | undefined;

  private refreshLastFields: Set<string> = new Set();
  private refreshLastStructTypes: { [key: string]: string | null } = {};

  /**
   * Creates a new source list controller
   *
   * @param root The top-level HTML element of the source list
   * @param config The configuration used for controlling the source list
   * @param supplementalStateSuppliers Suppliers of additional states from other source lists, used when running auto advance logic
   */
  constructor(
    root: HTMLElement,
    config: SourceListConfig,
    supplementalStateSuppliers: (() => SourceListState)[],
    editButtonCallback?: (coordinates: [number, number]) => void,
    getNumberPreview?: (key: string, time: number) => number | null
  ) {
    this.config = jsonCopy(config);
    this.configStr = JSON.stringify(config);
    this.supplementalStateSuppliers = supplementalStateSuppliers;
    this.getNumberPreview = getNumberPreview;
    this.ROOT = root;
    this.ROOT.classList.add("source-list");

    this.TITLE = document.createElement("div");
    this.ROOT.appendChild(this.TITLE);
    this.TITLE.classList.add("title");
    this.TITLE.innerText = config.title;
    this.TITLE.style.left = editButtonCallback === undefined ? "55px" : "30px";
    this.TITLE.style.right = editButtonCallback === undefined ? "55px" : "30px";

    this.EDIT_BUTTON = document.createElement("button");
    this.ROOT.appendChild(this.EDIT_BUTTON);
    this.EDIT_BUTTON.classList.add("edit");
    let editIcon = document.createElement("img");
    this.EDIT_BUTTON.appendChild(editIcon);
    editIcon.src = "symbols/ellipsis.svg";
    this.EDIT_BUTTON.hidden = editButtonCallback === undefined;

    this.CLEAR_BUTTON = document.createElement("button");
    this.ROOT.appendChild(this.CLEAR_BUTTON);
    this.CLEAR_BUTTON.classList.add("clear");
    let clearButton = document.createElement("img");
    this.CLEAR_BUTTON.appendChild(clearButton);
    clearButton.src = "symbols/trash.fill.svg";
    this.CLEAR_BUTTON.hidden = editButtonCallback !== undefined;

    this.HELP_BUTTON = document.createElement("button");
    this.ROOT.appendChild(this.HELP_BUTTON);
    this.HELP_BUTTON.classList.add("help");
    let helpIcon = document.createElement("img");
    this.HELP_BUTTON.appendChild(helpIcon);
    helpIcon.src = "symbols/questionmark.circle.svg";
    this.HELP_BUTTON.hidden = editButtonCallback !== undefined;

    this.LIST = document.createElement("div");
    this.ROOT.appendChild(this.LIST);
    this.LIST.classList.add("list");

    this.HAND_ICON = document.createElement("img");
    this.ROOT.appendChild(this.HAND_ICON);
    this.HAND_ICON.classList.add("hand-icon");
    this.HAND_ICON.src = "symbols/rectangle.and.hand.point.up.left.filled.svg";
    this.updateHandIcon();

    this.DRAG_HIGHLIGHT = document.createElement("div");
    this.ROOT.appendChild(this.DRAG_HIGHLIGHT);
    this.DRAG_HIGHLIGHT.classList.add("drag-highlight");
    this.DRAG_HIGHLIGHT.hidden = true;

    // Summarize config
    this.config.types.forEach((typeConfig) => {
      if (typeConfig.childOf === undefined) {
        typeConfig.sourceTypes.forEach((source) => {
          this.independentAllowedTypes.add(source);
        });
      }
      if (typeConfig.parentKey !== undefined) {
        this.parentKeys.set(typeConfig.key, typeConfig.parentKey);
      }
    });

    // Edit button
    this.EDIT_BUTTON.addEventListener("click", () => {
      let rect = this.EDIT_BUTTON.getBoundingClientRect();
      let coordinates: [number, number] = [Math.round(rect.right), Math.round(rect.top)];
      if (editButtonCallback !== undefined) {
        editButtonCallback(coordinates);
      }
    });
    this.CLEAR_BUTTON.addEventListener("click", () => {
      let rect = this.CLEAR_BUTTON.getBoundingClientRect();
      window.sendMainMessage("source-list-clear-prompt", {
        uuid: this.UUID,
        coordinates: [Math.round(rect.right), Math.round(rect.top)]
      });
      SourceList.clearPromptCallbacks[this.UUID] = () => {
        delete SourceList.clearPromptCallbacks[this.UUID];
        this.clear();
      };
    });
    this.HELP_BUTTON.addEventListener("click", () => {
      window.sendMainMessage("source-list-help", this.config);
    });

    // Incoming drag handling
    window.addEventListener("drag-update", (event) => {
      let dragData = (event as CustomEvent).detail;
      if ("sourceListUUID" in dragData.data) {
        this.handleItemDrag(dragData);
      } else if ("fields" in dragData.data) {
        this.handleFieldDrag(dragData);
      }
    });

    // Entry dragging support
    let mouseDownInfo: [number, number] | null = null;
    this.LIST.addEventListener("mousedown", (event) => {
      mouseDownInfo = [event.clientX, event.clientY];
    });
    this.LIST.addEventListener("mouseup", () => {
      mouseDownInfo = null;
    });
    this.LIST.addEventListener("mousemove", (event) => {
      // Start drag
      if (
        mouseDownInfo !== null &&
        (Math.abs(event.clientX - mouseDownInfo[0]) >= this.DRAG_THRESHOLD_PX ||
          Math.abs(event.clientY - mouseDownInfo[1]) >= this.DRAG_THRESHOLD_PX)
      ) {
        // Find item
        let index = -1;
        Array.from(this.LIST.children).forEach((element, i) => {
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
        let element = this.LIST.children[index];
        let dragContainer = document.createElement("div");
        dragContainer.style.position = "absolute";
        dragContainer.style.width = element.clientWidth.toString() + "px";
        dragContainer.style.height = "30px";
        dragContainer.style.left = "0px";
        dragContainer.style.top = "0px";
        dragContainer.style.pointerEvents = "none";
        dragContainer.style.margin = "none";
        dragContainer.style.padding = "none";
        dragContainer.classList.add("source-list");
        let elementClone = element.cloneNode(true) as HTMLElement;
        {
          // Apply icon color
          Array.from(elementClone.getElementsByTagName("object")).forEach((objElement) => {
            const color = objElement.getAttribute("type-color");
            objElement.addEventListener("load", () => {
              if (color !== null && objElement.contentDocument !== null) {
                let svgs = objElement.contentDocument.getElementsByTagName("svg");
                if (svgs.length > 0) {
                  svgs[0].style.color = color;
                }
              }
            });
          });
        }
        dragContainer.appendChild(elementClone);
        this.DRAG_ITEM.appendChild(dragContainer);

        // Start drag
        let itemRect = element.getBoundingClientRect();
        window.startDrag(event.clientX, event.clientY, event.clientX - itemRect.left, event.clientY - itemRect.top, {
          sourceListUUID: this.UUID,
          sourceListConfigStr: this.configStr,
          sourceListIndex: index,
          sourceListIsChild: this.isChild(index),
          sourceListElement: this.LIST,
          sourceListState: this.state
        });
      }
    });

    // Periodic method
    let lastIsDark: boolean | null = null;
    let periodic = () => {
      if (this.stopped) return;

      // Update items when theme changes (some icon colors will change)
      let isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark !== lastIsDark) {
        lastIsDark = isDark;
        this.updateAllItems();
      }

      // Update value previews
      this.updateAllPreviews();

      window.requestAnimationFrame(periodic);
    };
    window.requestAnimationFrame(periodic);
  }

  setTitle(title: string): void {
    this.TITLE.innerText = title;
  }

  /**
   * Returns the set of item states displayed by the source list.
   * @param onlyDisplayedFields Whether to only include fields that should be rendered
   */
  getState(onlyDisplayedFields = false): SourceListState {
    if (onlyDisplayedFields) {
      let availableFields: boolean[] = [];
      let parentAvailable = false;
      this.state.forEach((item) => {
        let available = this.isFieldAvailable(item);
        let typeConfig = this.config.types.find((typeConfig) => typeConfig.key === item.type);

        if (typeConfig?.parentKey !== undefined) {
          parentAvailable = available;
        }
        if (typeConfig?.childOf !== undefined && parentAvailable !== null) {
          availableFields.push(available && parentAvailable);
        } else {
          availableFields.push(available);
        }
      });
      return this.state.filter((item, index) => item.visible && availableFields[index]);
    } else {
      return this.state;
    }
  }

  setState(state: SourceListState) {
    this.clear();
    state.forEach((itemState) => {
      this.addListItem(itemState);
    });
  }

  getActiveFields(): string[] {
    return this.state.map((item) => item.logKey);
  }

  stop() {
    this.stopped = true;
  }

  /** Removes all items in the source list. */
  clear() {
    this.state = [];
    while (this.LIST.firstChild) {
      this.LIST.removeChild(this.LIST.firstChild);
    }
    this.updateHandIcon();
  }

  /** Call when a new set of log fields may be available. */
  refresh() {
    let displayedFields = this.state.map((item) => item.logKey);
    let currentFields = new Set(window.log.getFieldKeys().filter((field) => displayedFields.includes(field)));
    let structTypes: { [key: string]: string | null } = {};
    currentFields.forEach((field) => {
      structTypes[field] = window.log.getStructuredType(field);
    });

    let shouldUpdate = false;
    currentFields.forEach((field) => {
      if (!this.refreshLastFields.has(field)) {
        // New field was added
        shouldUpdate = true;
      }
    });

    if (!shouldUpdate) {
      this.refreshLastFields.forEach((field) => {
        if (!currentFields.has(field)) {
          // Existing field was removed
          shouldUpdate = true;
        }
      });

      if (!shouldUpdate) {
        Object.entries(structTypes).forEach(([key, type]) => {
          if (this.refreshLastStructTypes[key] !== type) {
            // Struct type changed
            shouldUpdate = true;
          }
        });
      }
    }

    this.refreshLastFields = currentFields;
    this.refreshLastStructTypes = structTypes;
    if (shouldUpdate) {
      this.updateAllItems();
    }
  }

  /**
   * Updates a set of option values and validates that all items are valid.
   */
  setOptionValues(type: string, option: string, values: SourceListOptionValueConfig[]) {
    let typeConfig = this.config.types.find((typeConfig) => typeConfig.key === type);
    if (typeConfig === undefined) return;
    let optionConfig = typeConfig!.options.find((optionConfig) => optionConfig.key === option);
    if (optionConfig === undefined) return;
    optionConfig.values = values;

    // Verify that all items have a valid selection
    let possibleValues = values.map((x) => x.key);
    this.state.forEach((item, index) => {
      if (item.type === type && !possibleValues.includes(item.options[option])) {
        item.options[option] = values[0].key;
        this.updateItem(this.LIST.children[index] as HTMLElement, item);
      }
    });
  }

  private updateHandIcon() {
    let show = this.LIST.childElementCount === 0;
    this.HAND_ICON.style.transition = show ? "opacity 1s ease-in 1s" : "";
    this.HAND_ICON.style.opacity = show ? "0.15" : "0";
  }

  /**
   * Adds a new field to the list, if the type is valid.
   *
   * @param logKey The key for the field to add
   * @param parentIndex The index of the parent item (optional)
   */
  addField(logKey: string, parentIndex?: number) {
    let logType = window.log.getType(logKey);
    let logTypeString = logType === null ? null : LoggableType[logType];
    let structuredType = window.log.getStructuredType(logKey);

    // Get memory entry
    let memory: SourceListTypeMemoryEntry | null = null;
    if (
      this.config.typeMemoryId &&
      this.config.typeMemoryId in window.typeMemory &&
      logKey in window.typeMemory[this.config.typeMemoryId]
    ) {
      memory = window.typeMemory[this.config.typeMemoryId][logKey];
    }

    // Get all possible types
    let stateWithSupplemental = this.state.concat(...this.supplementalStateSuppliers.map((func) => func()));
    let possibleTypes: { typeConfig: SourceListTypeConfig; logType: string; uses: number }[] = [];
    for (let i = 0; i < this.config.types.length; i++) {
      let typeConfig = this.config.types[i];
      if (
        (parentIndex === undefined && typeConfig.childOf !== undefined) || // Not inserting as a child
        (parentIndex !== undefined && typeConfig.childOf !== this.parentKeys.get(this.state[parentIndex!].type)) // Type is not the correct parent
      ) {
        continue;
      }
      let finalType = "";
      if (structuredType !== null && typeConfig.sourceTypes.includes(structuredType)) {
        finalType = structuredType;
      } else if (logTypeString !== null && typeConfig.sourceTypes.includes(logTypeString)) {
        finalType = logTypeString;
      }
      if (finalType.length > 0) {
        possibleTypes.push({
          typeConfig: typeConfig,
          logType: finalType,
          uses: stateWithSupplemental.filter((itemState) => itemState.type === typeConfig.key).length
        });
      }
    }

    // Find best type
    if (possibleTypes.length === 0) return;
    if (this.config.autoAdvance === true) {
      possibleTypes.sort((a, b) => a.uses - b.uses);
    }
    let memoryTypeIndex = possibleTypes.findIndex((type) => memory !== null && type.typeConfig.key === memory.type);
    if (memoryTypeIndex !== -1) {
      let memoryType = possibleTypes.splice(memoryTypeIndex, 1)[0];
      possibleTypes.splice(0, 0, memoryType);
    }
    let bestType = possibleTypes[0];

    // Add to list
    let options: { [key: string]: string } = {};
    bestType.typeConfig.options.forEach((optionConfig) => {
      if (
        memory !== null &&
        optionConfig.key in memory.options &&
        optionConfig.values.map((valueConfig) => valueConfig.key).includes(memory.options[optionConfig.key])
      ) {
        // Select value from type memory
        options[optionConfig.key] = memory.options[optionConfig.key];
      } else if (this.config.autoAdvance !== optionConfig.key) {
        // Select first value
        options[optionConfig.key] = optionConfig.values[0].key;
      } else {
        // Select least used value
        let useCounts: { valueConfig: SourceListOptionValueConfig; uses: number }[] = optionConfig.values.map(
          (valueConfig) => {
            return {
              valueConfig: valueConfig,
              uses: stateWithSupplemental.filter(
                (itemState) =>
                  optionConfig.key in itemState.options && itemState.options[optionConfig.key] === valueConfig.key
              ).length
            };
          }
        );
        useCounts.sort((a, b) => a.uses - b.uses);
        options[optionConfig.key] = useCounts[0].valueConfig.key;
      }
    });
    let state: SourceListItemState = {
      type: bestType.typeConfig.key,
      logKey: logKey,
      logType: bestType.logType,
      visible: true,
      options: options
    };
    if (parentIndex !== undefined) {
      let insertIndex = parentIndex! + 1;
      while (insertIndex < this.state.length && this.isChild(insertIndex)) {
        insertIndex++;
      }
      this.addListItem(state, insertIndex);
    } else {
      this.addListItem(state);
    }
  }

  /** Processes a item drag event, including rearranging fields if necessary. */
  private handleItemDrag(dragData: any) {
    let uuid: string = dragData.data.sourceListUUID;
    let configStr: string = dragData.data.sourceListConfigStr;
    if (configStr !== this.configStr) return;
    let startIndex: number = dragData.data.sourceListIndex;
    let childSource: boolean = dragData.data.sourceListIsChild;
    let sourceElement: HTMLElement = dragData.data.sourceListElement;
    let sourceState: SourceListState = dragData.data.sourceListState;
    let end: boolean = dragData.end;
    let x: number = dragData.x;
    let y: number = dragData.y;

    let rootRect = this.ROOT.getBoundingClientRect();
    if (x < rootRect.left || x > rootRect.right || y < rootRect.top || y > rootRect.bottom) {
      this.DRAG_HIGHLIGHT.hidden = true;
      return;
    }

    let isValidTarget = (targetIndex: number) => {
      if (childSource) {
        if (uuid !== this.UUID) return false;

        let sourceParent = startIndex - 1;
        while (sourceParent >= 0 && this.isChild(sourceParent)) {
          sourceParent--;
        }

        let targetParent = targetIndex - 1;
        while (targetParent >= 0 && this.isChild(targetParent)) {
          targetParent--;
        }

        if (sourceParent !== targetParent) return false;
      } else {
        if (targetIndex < this.LIST.childElementCount && this.isChild(targetIndex)) return false;
      }
      return true;
    };

    let closestDist = Infinity;
    let closestIndex = 0;
    Array.from(this.LIST.children).forEach((element, index) => {
      if (!isValidTarget(index)) return;
      let dist = Math.abs(y - element.getBoundingClientRect().top);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = index;
      }
    });
    let lastElement = this.LIST.lastElementChild;
    if (lastElement !== null && isValidTarget(this.LIST.childElementCount)) {
      let dist = Math.abs(y - lastElement.getBoundingClientRect().bottom);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = this.LIST.childElementCount;
      }
    }

    if (end) {
      this.DRAG_HIGHLIGHT.hidden = true;
      let endIndex = closestIndex;
      let itemCount = 0;
      let i = startIndex;
      if (childSource) {
        itemCount = 1;
      } else {
        while (true) {
          itemCount++;
          if (i + itemCount >= this.state.length || !this.isChild(i + itemCount)) break;
        }
      }

      // Rearrange items
      for (let i = 0; i < itemCount; i++) {
        let state = sourceState[startIndex];
        if (uuid !== this.UUID) {
          sourceElement.removeChild(sourceElement.children[startIndex]);
          sourceState.splice(startIndex, 1);
          this.addListItem(state, endIndex);
          endIndex++;
        } else if (endIndex < startIndex) {
          this.LIST.removeChild(this.LIST.children[startIndex]);
          this.state.splice(startIndex, 1);
          this.addListItem(state, endIndex);
          startIndex++;
          endIndex++;
        } else if (endIndex > startIndex) {
          this.LIST.removeChild(this.LIST.children[startIndex]);
          this.state.splice(startIndex, 1);
          this.addListItem(state, endIndex - 1);
        }
      }
    } else {
      this.DRAG_HIGHLIGHT.hidden = false;
      let highlightY = 0;
      if (this.LIST.childElementCount === 0) {
        highlightY = this.LIST.getBoundingClientRect().top;
      } else if (closestIndex < this.LIST.childElementCount) {
        highlightY = this.LIST.children[closestIndex].getBoundingClientRect().top;
      } else {
        highlightY = this.LIST.children[this.LIST.childElementCount - 1].getBoundingClientRect().bottom;
      }
      highlightY -= this.ROOT.getBoundingClientRect().top;
      highlightY -= 6;
      this.DRAG_HIGHLIGHT.style.left = "0%";
      this.DRAG_HIGHLIGHT.style.top = highlightY.toString() + "px";
      this.DRAG_HIGHLIGHT.style.width = "100%";
      this.DRAG_HIGHLIGHT.style.height = "12px";
    }
  }

  /** Processes a field drag event, including adding a field if necessary. */
  private handleFieldDrag(dragData: any) {
    let end = dragData.end;
    let x = dragData.x;
    let y = dragData.y;
    let draggedFields: string[];
    if (this.config.allowChildrenFromDrag) {
      draggedFields = dragData.data.fields.concat(dragData.data.children);
    } else {
      draggedFields = dragData.data.fields;
    }

    // Exit if out of range
    let listRect = this.ROOT.getBoundingClientRect();
    if (
      listRect.width === 0 ||
      listRect.height === 0 ||
      x < listRect.left ||
      x > listRect.right ||
      y < listRect.top ||
      y > listRect.bottom
    ) {
      this.DRAG_HIGHLIGHT.hidden = true;
      Array.from(this.LIST.children).forEach((element) => {
        element.classList.remove("parent-highlight");
      });
      return;
    }

    // Check pixel ranges
    let parentIndex: number | null = null;
    for (let i = 0; i < this.LIST.childElementCount; i++) {
      let itemRect = this.LIST.children[i].getBoundingClientRect();
      let withinItem = x > itemRect.left && x < itemRect.right && y > itemRect.top && y < itemRect.bottom;
      if (withinItem && this.parentKeys.has(this.state[i].type)) {
        parentIndex = i;
      }
    }

    // Check type validity
    let isTypeValid = (sourceTypes: Set<string>): boolean => {
      return draggedFields.some((field) => {
        let logType = window.log.getType(field);
        let logTypeString = logType === null ? null : LoggableType[logType];
        let structuredType = window.log.getStructuredType(field);
        return (
          (logTypeString !== null && sourceTypes.has(logTypeString)) ||
          (structuredType !== null && sourceTypes.has(structuredType))
        );
      });
    };
    let isTypeValidAsChild = (parentType: string): boolean => {
      let parentKey = this.parentKeys.get(parentType);
      if (parentKey === undefined) return false;
      let childAllowedTypes: Set<string> = new Set();
      this.config.types.forEach((typeConfig) => {
        if (typeConfig.childOf === parentKey) {
          typeConfig.sourceTypes.forEach((type) => childAllowedTypes.add(type));
        }
      });
      return isTypeValid(childAllowedTypes);
    };
    let typeValidAsRoot = isTypeValid(this.independentAllowedTypes);
    let typeValidAsChild = false;
    if (parentIndex !== null) {
      typeValidAsChild = isTypeValidAsChild(this.state[parentIndex!].type);
    }

    // Apply parent highlights
    for (let i = 0; i < this.state.length; i++) {
      if (isTypeValidAsChild(this.state[i].type)) {
        this.LIST.children[i].classList.add("parent-highlight");
      }
    }

    // Add fields and update highlight
    if (end) {
      this.DRAG_HIGHLIGHT.hidden = true;
      if (!typeValidAsChild) parentIndex = null;
      if (parentIndex !== null || typeValidAsRoot) {
        draggedFields.forEach((field) => {
          this.addField(field, parentIndex === null ? undefined : parentIndex);
        });
      }
      Array.from(this.LIST.children).forEach((element) => {
        element.classList.remove("parent-highlight");
      });
    } else if (typeValidAsChild && parentIndex !== null) {
      let top = Math.max(this.LIST.children[parentIndex!].getBoundingClientRect().top - listRect.top, 0);
      let bottom = Math.min(
        this.LIST.children[parentIndex!].getBoundingClientRect().bottom - listRect.top,
        listRect.height
      );
      this.DRAG_HIGHLIGHT.style.left = "0%";
      this.DRAG_HIGHLIGHT.style.top = top.toString() + "px";
      this.DRAG_HIGHLIGHT.style.width = "100%";
      this.DRAG_HIGHLIGHT.style.height = (bottom - top).toString() + "px";
      this.DRAG_HIGHLIGHT.hidden = false;
    } else if (typeValidAsRoot) {
      this.DRAG_HIGHLIGHT.style.left = "0%";
      this.DRAG_HIGHLIGHT.style.top = "0%";
      this.DRAG_HIGHLIGHT.style.width = "100%";
      this.DRAG_HIGHLIGHT.style.height = "100%";
      this.DRAG_HIGHLIGHT.hidden = false;
    } else {
      this.DRAG_HIGHLIGHT.hidden = true;
      Array.from(this.LIST.children).forEach((element) => {
        element.classList.remove("parent-highlight");
      });
    }
  }

  /** Update all items to match the current state. */
  private updateAllItems() {
    let count = Math.min(this.state.length, this.LIST.childElementCount);
    for (let i = 0; i < count; i++) {
      this.updateItem(this.LIST.children[i] as HTMLElement, this.state[i]);
    }
  }

  /** Update the preview values of all items. */
  private updateAllPreviews() {
    let count = Math.min(this.state.length, this.LIST.childElementCount);
    for (let i = 0; i < count; i++) {
      this.updatePreview(this.LIST.children[i] as HTMLElement, this.state[i]);
    }
  }

  /** Make a list item element and inserts it into the list. */
  private addListItem(state: SourceListItemState, insertIndex?: number) {
    let item = this.ITEM_TEMPLATE.cloneNode(true) as HTMLElement;
    if (insertIndex === undefined) {
      this.LIST.appendChild(item);
      this.state.push(state);
    } else {
      this.LIST.insertBefore(item, this.LIST.children[insertIndex!]);
      this.state.splice(insertIndex, 0, state);
    }
    this.updateItem(item, state);
    this.updateHandIcon();

    // Check if child type
    let typeConfig = this.config.types.find((typeConfig) => typeConfig.key === state.type);
    let isChild = typeConfig !== undefined && typeConfig.childOf !== undefined;

    // Type controls
    let typeButton = item.getElementsByClassName("type")[0] as HTMLButtonElement;
    let typeNameElement = item.getElementsByClassName("type-name")[0] as HTMLElement;
    let promptType = (coordinates: [number, number]) => {
      let index = Array.from(this.LIST.children).indexOf(item);
      window.sendMainMessage("source-list-type-prompt", {
        uuid: this.UUID,
        config: this.config,
        state: this.state[index],
        coordinates: coordinates
      });
      let originalType = this.state[index].type;
      SourceList.typePromptCallbacks[this.UUID] = (newState) => {
        delete SourceList.typePromptCallbacks[this.UUID];
        let index = Array.from(this.LIST.children).indexOf(item);
        this.state[index] = newState;
        this.updateItem(item, newState);

        if (!isChild) {
          let originalParentKey = this.config.types.find((typeConfig) => typeConfig.key === originalType)?.parentKey;
          let newParentKey = this.config.types.find((typeConfig) => typeConfig.key === newState.type)?.parentKey;
          if (originalParentKey !== newParentKey) {
            // Changed parent key, remove children
            index++;
            if (!this.isChild(index)) return;
            let childCount = 0;
            while (index + childCount < this.state.length) {
              childCount++;
              if (!this.isChild(index + childCount)) break;
            }
            this.state.splice(index, childCount);
            for (let i = 0; i < childCount; i++) {
              this.LIST.removeChild(this.LIST.children[index]);
              this.updateHandIcon();
            }
          }
        }
      };
    };
    typeButton.addEventListener("click", () => {
      let rect = typeButton.getBoundingClientRect();
      promptType([Math.round(rect.right), Math.round(rect.top)]);
    });
    item.addEventListener("contextmenu", (event) => {
      promptType([event.clientX, event.clientY]);
    });

    // Warning button
    let warningButton = item.getElementsByClassName("warning")[0] as HTMLButtonElement;
    let enableWarning = typeConfig?.numberArrayDeprecated === true;
    warningButton.hidden = !enableWarning;
    let keyContainer = item.getElementsByClassName("key-container")[0] as HTMLElement;
    keyContainer.style.setProperty("--has-warning", enableWarning ? "1" : "0");
    warningButton.addEventListener("click", () => {
      window.sendMainMessage("numeric-array-deprecation-warning", { force: true });
    });
    if (enableWarning) {
      window.sendMainMessage("numeric-array-deprecation-warning", { force: false });
    }

    // Hide button
    let hideButton = item.getElementsByClassName("hide")[0] as HTMLButtonElement;
    let toggleHidden = () => {
      let index = Array.from(this.LIST.children).indexOf(item);
      let newVisible = !this.state[index].visible;
      this.state[index].visible = newVisible;
      this.updateItem(item, this.state[index]);
      if (!isChild) {
        while (index < this.state.length) {
          index++;
          if (!this.isChild(index)) break;
          this.state[index].visible = newVisible;
          this.updateItem(this.LIST.children[index] as HTMLElement, this.state[index]);
        }
      }
    };
    hideButton.addEventListener("click", (event) => {
      event.preventDefault();
      toggleHidden();
    });
    let lastClick = 0;
    [typeNameElement, keyContainer].forEach((element) =>
      element.addEventListener("click", () => {
        let now = new Date().getTime();
        if (now - lastClick < 400) {
          toggleHidden();
          lastClick = 0;
        } else {
          lastClick = now;
        }
      })
    );

    // Child formatting
    if (isChild) {
      item.classList.add("child");
    }

    // Remove button
    let removeButton = item.getElementsByClassName("remove")[0] as HTMLButtonElement;
    removeButton.addEventListener("click", () => {
      let index = Array.from(this.LIST.children).indexOf(item);
      let removeCount = 0;
      while (index + removeCount < this.state.length) {
        removeCount++;
        if (isChild || !this.isChild(index + removeCount)) break;
      }
      this.state.splice(index, removeCount);
      for (let i = 0; i < removeCount; i++) {
        this.LIST.removeChild(this.LIST.children[index]);
      }
      this.updateHandIcon();
    });
    return item;
  }

  /**
   * Updates a list item to match the item state.
   *
   * @param item The HTML element to update
   * @param state The desired display state
   */
  private updateItem(item: HTMLElement, state: SourceListItemState) {
    let typeConfig = this.config.types.find((typeConfig) => typeConfig.key === state.type);
    if (typeConfig === undefined) throw 'Unknown type "' + state.type + '"';

    // Update type icon
    let typeIconVisible = item.getElementsByTagName("object")[0] as HTMLObjectElement;
    let typeIconHidden = item.getElementsByTagName("object")[1] as HTMLObjectElement;
    if (typeIconVisible.classList.contains("hidden")) {
      let temp = typeIconVisible;
      typeIconVisible = typeIconHidden;
      typeIconHidden = temp;
    }
    let color: string;
    if (typeConfig.color.startsWith("#")) {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark && typeConfig.darkColor !== undefined) {
        color = typeConfig.darkColor;
      } else {
        color = typeConfig.color;
      }
    } else {
      color = state.options[typeConfig.color];
    }
    color = ensureThemeContrast(color);
    let dataPath = "symbols/sourceList/" + typeConfig.symbol + ".svg";
    if (dataPath !== typeIconVisible.getAttribute("data")) {
      // Load new image on hidden icon
      typeIconHidden.data = dataPath;
      typeIconHidden.addEventListener("load", () => {
        if (typeIconHidden.contentDocument) {
          typeIconHidden.contentDocument.getElementsByTagName("svg")[0].style.color = color;
          typeIconHidden.setAttribute("type-color", color);

          typeIconHidden.classList.remove("hidden");
          typeIconVisible.classList.add("hidden");
        }
      });
    } else if (typeIconVisible.contentDocument !== null) {
      // Replace color on visible icon
      let svgs = typeIconVisible.contentDocument.getElementsByTagName("svg");
      if (svgs.length > 0) {
        svgs[0].style.color = color;
      }
      typeIconVisible.setAttribute("type-color", color);
    }

    // Update type name
    let typeNameComponents: string[] = [];
    if (typeConfig.showInTypeName) {
      typeNameComponents.push(typeConfig.display);
    }
    typeConfig.options.forEach((optionConfig) => {
      if (optionConfig.showInTypeName) {
        let valueKey = state.options[optionConfig.key];
        let valueConfig = optionConfig.values.find((value) => value.key === valueKey);
        if (valueConfig === undefined) return;
        typeNameComponents.push(valueConfig.display);
      }
    });
    let typeNameElement = item.getElementsByClassName("type-name")[0] as HTMLElement;
    typeNameElement.innerText = typeNameComponents.join("/") + (typeNameComponents.length > 0 ? ":" : "");

    // Update log key
    let keyContainer = item.getElementsByClassName("key-container")[0] as HTMLElement;
    let keySpan = keyContainer.firstElementChild as HTMLElement;
    keySpan.innerText = state.logKey;
    keySpan.style.textDecoration = this.isFieldAvailable(state) ? "" : "line-through";
    keyContainer.title = state.logKey;

    // Update type width, cloning to a new node in case the controls aren't visible
    let mockTypeName = typeNameElement.cloneNode(true) as HTMLElement;
    let mockSourceContainer = document.createElement("div");
    mockSourceContainer.classList.add("source-list");
    mockSourceContainer.appendChild(mockTypeName);
    document.body.appendChild(mockSourceContainer);
    let typeNameWidth = mockTypeName.clientWidth;
    if (typeNameWidth > 0) typeNameWidth += 3; //Add extra margin after colon
    document.body.removeChild(mockSourceContainer);
    keyContainer.style.setProperty("--type-width", typeNameWidth.toString() + "px");

    // Update hide button
    let hideButton = item.getElementsByClassName("hide")[0] as HTMLButtonElement;
    let hideIcon = hideButton.firstElementChild as HTMLImageElement;
    hideIcon.src = "symbols/" + (state.visible ? "eye.slash.svg" : "eye.svg");
    if (state.visible) {
      item.classList.remove("hidden");
    } else {
      item.classList.add("hidden");
    }

    // Save to memory
    if (this.config.typeMemoryId !== undefined) {
      if (!(this.config.typeMemoryId in window.typeMemory)) {
        window.typeMemory[this.config.typeMemoryId] = {};
      }
      window.typeMemory[this.config.typeMemoryId][state.logKey] = { type: state.type, options: state.options };
    }
  }

  private isChild(index: number) {
    if (index < 0 || index >= this.state.length) return false;
    let typeConfig = this.config.types.find((typeConfig) => typeConfig.key === this.state[index].type);
    return typeConfig !== undefined && typeConfig.childOf !== undefined;
  }

  private isFieldAvailable(item: SourceListItemState): boolean {
    let fieldType = window.log.getType(item.logKey);
    let fieldStructuredType = window.log.getStructuredType(item.logKey);
    return (fieldType !== null && LoggableType[fieldType] === item.logType) || fieldStructuredType === item.logType;
  }

  /**
   * Updates the preview value of an item.
   *
   * @param item The HTML element to update
   * @param state The associated item state
   */
  private updatePreview(item: HTMLElement, state: SourceListItemState) {
    let time = window.selection.getRenderTime();
    let valueSymbol = item.getElementsByClassName("value-symbol")[0] as HTMLElement;
    let valueText = item.getElementsByClassName("value")[0] as HTMLElement;
    let typeConfig = this.config.types.find((typeConfig) => typeConfig.key === state.type);

    // Get text
    let text: string | null = null;
    if (this.isFieldAvailable(state) && time !== null) {
      let logType = window.log.getType(state.logKey);
      let structuredType = window.log.getStructuredType(state.logKey);
      if (logType !== null) {
        let value: any;
        if (logType === LoggableType.Number && this.getNumberPreview !== undefined) {
          value = this.getNumberPreview(state.logKey, time);
        } else {
          value = getOrDefault(window.log, state.logKey, logType, time, null);
        }
        if (value !== null || logType === LoggableType.Empty) {
          if (typeConfig?.previewType !== undefined) {
            if (typeConfig?.previewType !== null) {
              let numberArrayFormat: "Translation2d" | "Translation3d" | "Pose2d" | "Pose3d" = "Pose3d";
              let numberArrayUnits: "radians" | "degrees" = "radians";
              if ("format" in state.options) {
                let formatRaw = state.options.format;
                numberArrayFormat =
                  formatRaw === "Pose2d" ||
                  formatRaw === "Pose3d" ||
                  formatRaw === "Translation2d" ||
                  formatRaw === "Translation3d"
                    ? formatRaw
                    : "Pose3d";
              }
              if ("units" in state.options) {
                numberArrayUnits = state.options.units === "degrees" ? "degrees" : "radians";
              }
              let poseStrings: string[] = [];
              if (typeConfig?.previewType === "SwerveModuleState[]") {
                let swerveStates = grabSwerveStates(
                  window.log,
                  state.logKey,
                  state.logType,
                  time,
                  undefined,
                  numberArrayUnits,
                  this.UUID
                );
                swerveStates.forEach((state) => {
                  poseStrings.push(
                    "\u03bd: " +
                      state.speed.toFixed(2) +
                      "m/s, \u03b8: " +
                      convert(state.angle, "radians", "degrees").toFixed(2) +
                      "\u00b0"
                  );
                });
              } else if (typeConfig?.previewType === "ChassisSpeeds") {
                let chassisSpeeds = grabChassisSpeeds(window.log, state.logKey, time, this.UUID);
                poseStrings.push(
                  "\u03bdx: " +
                    chassisSpeeds.vx.toFixed(2) +
                    "m/s, \u03bdy: " +
                    chassisSpeeds.vy.toFixed(2) +
                    "m/s, \u03a9: " +
                    convert(chassisSpeeds.omega, "radians", "degrees").toFixed(2) +
                    "\u00b0/s"
                );
              } else {
                let poses = grabPosesAuto(
                  window.log,
                  state.logKey,
                  state.logType,
                  time,
                  this.UUID,
                  numberArrayFormat,
                  numberArrayUnits,
                  "red", // Display in native coordinate system
                  0,
                  0
                );
                poseStrings = poses.map((annotatedPose) => {
                  switch (typeConfig?.previewType) {
                    case "Rotation2d": {
                      return (
                        convert(rotation3dTo2d(annotatedPose.pose.rotation), "radians", "degrees").toFixed(2) + "\u00b0"
                      );
                    }
                    case "Translation2d": {
                      return (
                        "X: " +
                        annotatedPose.pose.translation[0].toFixed(2) +
                        "m, Y: " +
                        annotatedPose.pose.translation[1].toFixed(2) +
                        "m"
                      );
                    }
                    case "Pose2d":
                    case "Transform2d": {
                      return (
                        "X: " +
                        annotatedPose.pose.translation[0].toFixed(2) +
                        "m, Y: " +
                        annotatedPose.pose.translation[1].toFixed(2) +
                        "m, \u03b8: " +
                        convert(rotation3dTo2d(annotatedPose.pose.rotation), "radians", "degrees").toFixed(2) +
                        "\u00b0"
                      );
                    }
                    case "Rotation3d": {
                      let rpy = rotation3dToRPY(annotatedPose.pose.rotation);
                      return (
                        "Roll: " +
                        convert(rpy[0], "radians", "degrees").toFixed(2) +
                        "\u00b0, Pitch: " +
                        convert(rpy[1], "radians", "degrees").toFixed(2) +
                        "\u00b0, Yaw: " +
                        convert(rpy[2], "radians", "degrees").toFixed(2) +
                        "\u00b0"
                      );
                    }
                    case "Translation3d": {
                      return (
                        "X: " +
                        annotatedPose.pose.translation[0].toFixed(2) +
                        "m, Y: " +
                        annotatedPose.pose.translation[1].toFixed(2) +
                        "m, Z: " +
                        annotatedPose.pose.translation[2].toFixed(2) +
                        "m"
                      );
                    }
                    case "Pose3d": {
                      let rpy = rotation3dToRPY(annotatedPose.pose.rotation);
                      return (
                        "X: " +
                        annotatedPose.pose.translation[0].toFixed(2) +
                        "m, Y: " +
                        annotatedPose.pose.translation[1].toFixed(2) +
                        "m, Z: " +
                        annotatedPose.pose.translation[2].toFixed(2) +
                        "m, Roll: " +
                        convert(rpy[0], "radians", "degrees").toFixed(2) +
                        "\u00b0, Pitch: " +
                        convert(rpy[1], "radians", "degrees").toFixed(2) +
                        "\u00b0, Yaw: " +
                        convert(rpy[2], "radians", "degrees").toFixed(2) +
                        "\u00b0"
                      );
                    }
                    default: {
                      return "";
                    }
                  }
                });
              }
              if (poseStrings.length === 1) {
                text = poseStrings[0];
              } else if (poseStrings.length === 0) {
                text = "No values";
              } else {
                text = text =
                  poseStrings.length.toString() +
                  " value" +
                  (poseStrings.length === 1 ? "" : "s") +
                  " \u2014 [" +
                  poseStrings.map((str) => "(" + str + ")").join(", ") +
                  "]";
              }
            }
          } else if (structuredType === "Mechanism2d") {
            let mechanismState = getMechanismState(window.log, state.logKey, time);
            if (mechanismState !== null) {
              let count = mechanismState.lines.length;
              text = count.toString() + " segment" + (count === 1 ? "" : "s");
            }
          } else if (
            logType === LoggableType.BooleanArray ||
            logType === LoggableType.NumberArray ||
            logType === LoggableType.StringArray
          ) {
            text =
              value.length.toString() +
              " value" +
              (value.length === 1 ? "" : "s") +
              " \u2014 " +
              getLogValueText(value, logType);
          } else {
            text = getLogValueText(value, logType);
          }
        }
      }
    }

    // Update state
    valueSymbol.hidden = text === null;
    valueText.hidden = text === null;
    item.style.height = valueSymbol.hidden ? "30px" : "50px";
    if (text !== null && text !== valueText.innerText) {
      valueText.innerText = text;
    }
  }
}
