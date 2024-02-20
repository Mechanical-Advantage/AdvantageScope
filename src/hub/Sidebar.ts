import { SidebarState } from "../shared/HubState";
import LogFieldTree from "../shared/log/LogFieldTree";
import LoggableType from "../shared/log/LoggableType";
import { getOrDefault, searchFields, TYPE_KEY } from "../shared/log/LogUtil";
import { arraysEqual, setsEqual } from "../shared/util";
import { ZEBRA_LOG_KEY } from "./dataSources/LoadZebra";
import CustomSchemas from "./dataSources/schema/CustomSchemas";
import { SelectionMode } from "./Selection";

export default class Sidebar {
  private SIDEBAR = document.getElementsByClassName("side-bar")[0] as HTMLElement;
  private SIDEBAR_HANDLE = document.getElementsByClassName("side-bar-handle")[0] as HTMLElement;
  private SIDEBAR_SHADOW = document.getElementsByClassName("side-bar-shadow")[0] as HTMLElement;
  private SIDEBAR_TITLE = document.getElementsByClassName("side-bar-title")[0] as HTMLElement;
  private SEARCH_INPUT = document.getElementsByClassName("side-bar-search")[0] as HTMLInputElement;
  private TUNING_BUTTON = document.getElementsByClassName("side-bar-tuning-button")[0] as HTMLButtonElement;
  private FIELD_LIST = document.getElementById("fieldList") as HTMLElement;
  private ICON_TEMPLATES = document.getElementById("fieldItemIconTemplates") as HTMLElement;
  private DRAG_ITEM = document.getElementById("dragItem") as HTMLElement;

  private SEARCH_RESULTS = document.getElementsByClassName("search-results")[0] as HTMLElement;

  private MERGED_KEY = "Log";
  private KNOWN_KEYS = [
    "DriverStation",
    "NetworkTables",
    "RealOutputs",
    "ReplayOutputs",
    "SystemStats",
    "PowerDistribution",
    "DashboardInputs",
    "Timestamp",
    "AdvantageKit",
    "DS",
    "NT",
    "NTConnection",
    "messages",
    "systemTime",
    "DSLog",
    "DSEvents",
    ZEBRA_LOG_KEY
  ];
  private HIDDEN_KEYS = [".schema", "Metadata", "RealMetadata", "ReplayMetadata"];
  private INDENT_SIZE_PX = 20;
  private FIELD_DRAG_THRESHOLD_PX = 3;
  private VALUE_WIDTH_MARGIN_PX = 12;

  private sidebarHandleActive = false;
  private sidebarWidth = 300;
  private fieldCount = 0;
  private isTuningMode = false;
  private lastFieldKeys: string[] = [];
  private expandedFields = new Set<string>();
  private activeFields = new Set<string>();
  private activeFieldCallbacks: (() => void)[] = [];
  private updateTypeWarningCallbacks: (() => void)[] = [];
  private updateValueCallbacks: ((time: number | null) => void)[] = [];
  private selectGroup: string[] = [];
  private selectGroupClearCallbacks: (() => void)[] = [];
  private searchKey: string | null = null;
  private searchExpandCallbacks: (() => void)[] = [];
  private searchHoveredIndex: number | null = null;
  private searchResults: string[] = [];
  private setTuningModeActiveCallbacks: ((active: boolean) => void)[] = [];
  private tuningModePublishCallbacks: (() => void)[] = [];
  private tuningValueCache: { [key: string]: string } = {};
  private updateMetadataCallbacks: (() => void)[] = [];

  constructor() {
    // Set up handle for resizing
    this.SIDEBAR_HANDLE.addEventListener("mousedown", () => {
      this.sidebarHandleActive = true;
      document.body.style.cursor = "col-resize";
    });
    window.addEventListener("mouseup", () => {
      this.sidebarHandleActive = false;
      document.body.style.cursor = "initial";
    });
    window.addEventListener("mousemove", (event) => {
      if (this.sidebarHandleActive) {
        let width = event.clientX;
        if (width > 500) width = 500;
        if (width >= 80 && width < 160) width = 160;
        if (width < 80) width = 0;
        this.sidebarWidth = width;
        this.updateWidth();
      }
    });
    this.updateWidth();

    // Set up shadow when scrolling
    this.SIDEBAR.addEventListener("scroll", () => {
      this.SIDEBAR_SHADOW.style.opacity = this.SIDEBAR.scrollTop === 0 ? "0" : "1";
    });

    // Search controls
    let searchInputFocused = false;
    this.SEARCH_INPUT.addEventListener("focus", () => (searchInputFocused = true));
    this.SEARCH_INPUT.addEventListener("blur", () => (searchInputFocused = false));
    this.SEARCH_INPUT.addEventListener("input", () => {
      this.updateSearchResults();
    });
    this.SIDEBAR.addEventListener("scroll", () => {
      if (this.SIDEBAR.scrollTop > 50 && searchInputFocused) {
        this.SEARCH_INPUT.blur();
      }
    });
    let lastInputRectBottom: number | null = null;
    let lastInputRectWidth: number | null = null;
    let searchPeriodic = () => {
      let inputRect = this.SEARCH_INPUT.getBoundingClientRect();
      if (inputRect.bottom !== lastInputRectBottom) {
        lastInputRectBottom = inputRect.bottom;
        this.SEARCH_RESULTS.style.top = inputRect.bottom.toString() + "px";
      }
      if (inputRect.width !== lastInputRectWidth) {
        lastInputRectWidth = inputRect.width;
        this.SEARCH_RESULTS.style.minWidth = inputRect.width.toString() + "px";
      }
      let hidden =
        !searchInputFocused || this.SEARCH_INPUT.value.length === 0 || this.SEARCH_RESULTS.childElementCount === 0;
      if (hidden !== this.SEARCH_RESULTS.hidden) {
        if (hidden && !this.SEARCH_RESULTS.hidden) {
          this.SEARCH_RESULTS.scrollTop = 0;
          this.searchHoveredIndex = null;
          this.updateSearchHovered(false);
        }
        this.SEARCH_RESULTS.hidden = hidden;
      }
    };
    this.SEARCH_INPUT.addEventListener("keydown", (event) => {
      const resultsCount = this.SEARCH_RESULTS.children.length;
      if (event.code === "ArrowDown") {
        if (this.searchHoveredIndex === null || this.searchHoveredIndex >= resultsCount) {
          this.searchHoveredIndex = 0;
        } else if (this.searchHoveredIndex < resultsCount - 1) {
          this.searchHoveredIndex++;
        }
        this.updateSearchHovered(true);
      } else if (event.code === "ArrowUp") {
        if (this.searchHoveredIndex === null || this.searchHoveredIndex >= resultsCount) {
          this.searchHoveredIndex = 0;
        } else if (this.searchHoveredIndex > 0) {
          this.searchHoveredIndex--;
        }
        this.updateSearchHovered(true);
      } else if (event.code === "Enter") {
        this.runSearch();
      }
    });

    // Tuning button
    this.TUNING_BUTTON.addEventListener("click", () => {
      this.setTuningModeActive(!this.isTuningMode);
    });

    // Periodic functions
    let periodic = () => {
      searchPeriodic();
      this.updateTitle();
      this.updateValues();
      this.updateTuningButton();
      window.requestAnimationFrame(periodic);
    };
    window.requestAnimationFrame(periodic);
    setInterval(() => {
      this.tuningModePublishCallbacks.forEach((callback) => callback());
    }, 250);
  }

  /** Returns the current state. */
  saveState(): SidebarState {
    return {
      width: this.sidebarWidth,
      expanded: [...this.expandedFields]
    };
  }

  /** Restores to the provided state. */
  restoreState(state: SidebarState) {
    let widthEqual = state.width === this.sidebarWidth;
    let expandedSet = new Set<string>(state.expanded);
    let expandedEqual = setsEqual(expandedSet, this.expandedFields);
    this.sidebarWidth = state.width;
    this.expandedFields = expandedSet;
    if (!widthEqual) this.updateWidth();
    if (!expandedEqual) this.refresh(true);
  }

  /** Updates the hovering effect on the search results. */
  private updateSearchHovered(scroll: boolean) {
    Array.from(this.SEARCH_RESULTS.children).forEach((element, index) => {
      if (index === this.searchHoveredIndex) {
        element.classList.add("hovered");
        if (scroll) {
          element.scrollIntoView({ block: "nearest" });
        }
      } else {
        element.classList.remove("hovered");
      }
    });
  }

  /** Updates the set of results based on the current query. */
  private updateSearchResults() {
    let query = this.SEARCH_INPUT.value;
    this.searchResults = query.length === 0 ? [] : searchFields(window.log, query);
    this.searchResults = this.searchResults.filter((field) => {
      let show = true;
      this.HIDDEN_KEYS.forEach((hiddenKey) => {
        if (field.startsWith("/" + hiddenKey)) show = false;
        if (field.startsWith("NT:/" + hiddenKey)) show = false;
        if (field.startsWith("NT:/AdvantageKit/" + hiddenKey)) show = false;
      });
      return show;
    });
    while (this.SEARCH_RESULTS.firstChild) {
      this.SEARCH_RESULTS.removeChild(this.SEARCH_RESULTS.firstChild);
    }
    this.searchResults.forEach((field, index) => {
      let div = document.createElement("div");
      this.SEARCH_RESULTS.appendChild(div);
      div.classList.add("search-results-item");
      div.innerText = field;
      div.addEventListener("mousedown", () => {
        this.searchHoveredIndex = index;
        this.runSearch();
      });
      div.addEventListener("touchdown", () => {
        this.searchHoveredIndex = index;
        this.runSearch();
      });
      div.addEventListener("mousemove", () => {
        this.searchHoveredIndex = index;
        this.updateSearchHovered(false);
      });
    });
  }

  /** Close the search and highlight the selected field. */
  private runSearch() {
    if (this.searchHoveredIndex === null || this.searchHoveredIndex >= this.searchResults.length) return;
    this.searchKey = this.searchResults[this.searchHoveredIndex];
    this.searchExpandCallbacks.forEach((callback) => callback());
    this.searchKey = null;
    this.SEARCH_INPUT.blur();
  }

  /** Updates the displayed width based on the current state. */
  private updateWidth() {
    document.documentElement.style.setProperty("--side-bar-width", this.sidebarWidth.toString() + "px");
    document.documentElement.style.setProperty("--show-side-bar", this.sidebarWidth > 0 ? "1" : "0");
  }

  /** Updates the title with the duration and field count. */
  private updateTitle() {
    let range = window.log.getTimestampRange();
    let liveTime = window.selection.getCurrentLiveTime();
    if (liveTime !== null) {
      range[1] = liveTime;
    }
    let title: string;
    if (this.fieldCount === 0) {
      title = "No data available";
    } else {
      let runtime = range[1] - range[0];
      let runtimeUnit = "s";
      if (runtime > 120) {
        runtime /= 60;
        runtimeUnit = "m";
      }
      if (runtime > 120) {
        runtime /= 60;
        runtimeUnit = "h";
      }
      title =
        this.fieldCount.toString() +
        " field" +
        (this.fieldCount === 1 ? "" : "s") +
        ", " +
        Math.floor(runtime).toString() +
        runtimeUnit +
        " runtime";
    }
    if (title !== this.SIDEBAR_TITLE.innerText) {
      this.SIDEBAR_TITLE.innerText = title;
    }
  }

  /** Updates the values displayed next to next field. */
  private updateValues() {
    let time: number | null = null;
    let selectionMode = window.selection.getMode();
    let hoveredTime = window.selection.getHoveredTime();
    let selectedTime = window.selection.getSelectedTime();
    if (selectionMode === SelectionMode.Playback || selectionMode === SelectionMode.Locked) {
      time = selectedTime as number;
    } else if (hoveredTime !== null) {
      time = hoveredTime;
    } else if (selectedTime !== null) {
      time = selectedTime;
    }
    this.updateValueCallbacks.forEach((callback) => callback(time));
  }

  /** Show or hide tuning button based on tuner availability. */
  private updateTuningButton() {
    let tuningButtonVisible = !this.TUNING_BUTTON.hidden;
    let tunerAvailable = window.tuner !== null;
    if (tuningButtonVisible !== tunerAvailable) {
      this.TUNING_BUTTON.hidden = !tunerAvailable;
      document.documentElement.style.setProperty("--show-tuning-button", tunerAvailable ? "1" : "0");
      if (!tunerAvailable) {
        this.setTuningModeActive(false);
      }
    }
  }

  private setTuningModeActive(active: boolean) {
    this.isTuningMode = active;
    this.setTuningModeActiveCallbacks.forEach((callback) => {
      callback(active);
    });
    if (active) {
      this.TUNING_BUTTON.classList.add("active");
    } else {
      this.TUNING_BUTTON.classList.remove("active");
    }
  }

  /** Refresh based on new log data or expanded field list. */
  refresh(forceRefresh: boolean = false) {
    let fieldKeys = window.log.getFieldKeys();
    let fieldsChanged = forceRefresh || !arraysEqual(fieldKeys, this.lastFieldKeys);
    this.lastFieldKeys = fieldKeys;

    if (fieldsChanged) {
      // Update field count
      this.fieldCount = window.log.getFieldCount();

      // Remove old list
      let originalScroll = this.SIDEBAR.scrollTop;
      while (this.FIELD_LIST.firstChild) {
        this.FIELD_LIST.removeChild(this.FIELD_LIST.firstChild);
      }
      this.activeFields = new Set();
      this.activeFieldCallbacks = [];
      this.updateTypeWarningCallbacks = [];
      this.updateValueCallbacks = [];
      this.selectGroupClearCallbacks = [];
      this.setTuningModeActiveCallbacks = [];
      this.tuningModePublishCallbacks = [];
      this.updateMetadataCallbacks = [];

      // Add new list
      let tree = window.log.getFieldTree();
      let rootKeys = Object.keys(tree);
      if (rootKeys.length === 1 && tree[rootKeys[0]].fullKey === null) {
        // If only one table, use it as the root
        tree = tree[rootKeys[0]].children;
      }
      Object.keys(tree)
        .filter((key) => !this.HIDDEN_KEYS.includes(key))
        .sort((a, b) => this.sortKeys(a, b, true))
        .forEach((key) => {
          this.addFields(key, "/" + key, tree[key], this.FIELD_LIST, 0);
        });
      this.SIDEBAR.scrollTop = originalScroll;

      // Update search
      this.updateSearchResults();
    } else {
      // Update type warnings and metadata
      this.updateTypeWarningCallbacks.forEach((callback) => callback());
      this.updateMetadataCallbacks.forEach((callback) => callback());
    }
  }

  /** Recursively adds a set of fields. */
  private addFields(
    title: string,
    fullTitle: string,
    field: LogFieldTree,
    parentElement: HTMLElement,
    indent: number,
    generated = false
  ) {
    let hasChildren = Object.keys(field.children).length > 0;
    let childrenGenerated = generated || (field.fullKey !== null && window.log.isGeneratedParent(field.fullKey));

    // Create element
    let fieldElementContainer = document.createElement("div");
    parentElement.appendChild(fieldElementContainer);
    fieldElementContainer.classList.add("field-item-container");
    let fieldElement = document.createElement("div");
    fieldElementContainer.appendChild(fieldElement);
    fieldElement.classList.add("field-item");
    if (generated) {
      fieldElement.classList.add("generated");
    }
    let valueElement = document.createElement("div");
    fieldElementContainer.appendChild(valueElement);
    valueElement.classList.add("field-value");
    fieldElementContainer.style.setProperty("--value-width", "0px");

    // Active fields callback
    this.activeFieldCallbacks.push(() => {
      let rect = fieldElement.getBoundingClientRect();
      let expanded = rect.height > 0;
      let onScreen = rect.height > 0 && rect.width > 0 && rect.top >= -rect.height && rect.top <= window.innerHeight;

      if (field.fullKey !== null) {
        let isActive = false;
        let type = window.log.getType(field.fullKey);
        let structuredType = window.log.getStructuredType(field.fullKey);
        let wpilibType = window.log.getWpilibType(field.fullKey);

        // Active if expanded and array or structured
        if (
          expanded &&
          (type === LoggableType.BooleanArray ||
            type === LoggableType.NumberArray ||
            type === LoggableType.StringArray ||
            (type !== LoggableType.Empty && structuredType !== null) ||
            (type === LoggableType.Raw && wpilibType !== null && CustomSchemas.has(wpilibType)))
        ) {
          isActive = true;
        }

        // Active if number, boolean, or string and on screen
        if (
          onScreen &&
          (type === LoggableType.Number || type === LoggableType.Boolean || type === LoggableType.String)
        ) {
          isActive = true;
        }

        // Apply active status
        if (isActive) {
          this.activeFields.add(field.fullKey);
        } else {
          this.activeFields.delete(field.fullKey);
        }
      }

      // Add type subkey if available
      if (TYPE_KEY in field.children && field.children[TYPE_KEY].fullKey !== null) {
        let typeKey = field.children[TYPE_KEY].fullKey;
        if (expanded) {
          this.activeFields.add(typeKey);
        } else {
          this.activeFields.delete(typeKey);
        }
      }
    });

    // Add icons
    let closedIcon = this.ICON_TEMPLATES.children[0].cloneNode(true) as HTMLElement;
    let openIcon = this.ICON_TEMPLATES.children[1].cloneNode(true) as HTMLElement;
    let neutralIcon = this.ICON_TEMPLATES.children[2].cloneNode(true) as HTMLElement;
    fieldElement.append(closedIcon, openIcon, neutralIcon);
    closedIcon.style.display = hasChildren ? "initial" : "none";
    openIcon.style.display = "none";
    neutralIcon.style.display = hasChildren ? "none" : "initial";

    // Create label
    let label = document.createElement("div");
    fieldElement.appendChild(label);
    label.classList.add("field-item-label");
    if (
      (indent === 0 ||
        (indent === this.INDENT_SIZE_PX &&
          (fullTitle.startsWith("/AdvantageKit") || fullTitle.startsWith("/" + this.MERGED_KEY)))) &&
      (this.KNOWN_KEYS.includes(title) || title.startsWith(this.MERGED_KEY))
    ) {
      label.classList.add("known");
    }
    {
      let labelSpan = document.createElement("span");
      label.appendChild(labelSpan);
      labelSpan.innerText = title;
    }
    label.style.fontStyle = field.fullKey === null ? "normal" : "italic";
    label.style.cursor = field.fullKey === null ? "auto" : "grab";
    if (field.fullKey) {
      {
        let typeWarningSpan = document.createElement("span");
        label.appendChild(typeWarningSpan);
        typeWarningSpan.innerHTML = " &#x26A0;";
        typeWarningSpan.style.cursor = "help";
        const warningText =
          "Values with conflicting types have been written to this field. Only values compatible with the initial type can be viewed and exported.";
        typeWarningSpan.addEventListener("click", () => {
          window.sendMainMessage("alert", {
            title: "Conflicting types",
            content: warningText
          });
        });
        typeWarningSpan.title = warningText;
        let lastHidden = false;
        let updateTypeWarning = () => {
          let hidden = !window.log.getTypeWarning(field.fullKey!);
          if (hidden !== lastHidden) {
            lastHidden = hidden;
            typeWarningSpan.hidden = hidden;
          }
        };
        this.updateTypeWarningCallbacks.push(updateTypeWarning);
        updateTypeWarning();
      }
      let structuredType = window.log.getStructuredType(field.fullKey);
      if (structuredType !== null) {
        let typeLabel = document.createElement("span");
        typeLabel.classList.add("field-item-type-label");
        label.appendChild(typeLabel);
        typeLabel.innerHTML = " &ndash; " + structuredType;
      }
    }

    // Full key fields
    if (field.fullKey !== null) {
      // Dragging support
      {
        let dragEvent = (x: number, y: number, offsetX: number, offsetY: number) => {
          let isGroup = this.selectGroup.includes(field.fullKey !== null ? field.fullKey : "");
          this.DRAG_ITEM.innerText = title + (isGroup ? "..." : "");
          this.DRAG_ITEM.style.fontWeight = isGroup ? "bolder" : "initial";
          window.startDrag(x, y, offsetX, offsetY, {
            fields: isGroup ? this.selectGroup : [field.fullKey],
            children: isGroup
              ? []
              : Object.values(field.children)
                  .map((x) => x.fullKey)
                  .filter((x) => x !== null && !x.endsWith("/length"))
          });
          if (isGroup) {
            this.selectGroup = [];
            this.selectGroupClearCallbacks.forEach((callback) => callback());
          }
        };
        let mouseDownInfo: [number, number, number, number] | null = null;
        label.addEventListener("mousedown", (event) => {
          mouseDownInfo = [event.clientX, event.clientY, event.offsetX, event.offsetY];
        });
        window.addEventListener("mousemove", (event) => {
          if (mouseDownInfo !== null) {
            if (
              Math.abs(event.clientX - mouseDownInfo[0]) >= this.FIELD_DRAG_THRESHOLD_PX ||
              Math.abs(event.clientY - mouseDownInfo[1]) >= this.FIELD_DRAG_THRESHOLD_PX
            ) {
              dragEvent(mouseDownInfo[0], mouseDownInfo[1], mouseDownInfo[2], mouseDownInfo[3]);
              mouseDownInfo = null;
            }
          }
        });
        label.addEventListener("mouseup", (event) => {
          if (mouseDownInfo !== null) {
            if (
              (event.ctrlKey || event.metaKey) &&
              Math.abs(event.clientX - mouseDownInfo[0]) < this.FIELD_DRAG_THRESHOLD_PX &&
              Math.abs(event.clientY - mouseDownInfo[1]) < this.FIELD_DRAG_THRESHOLD_PX
            ) {
              let index = this.selectGroup.indexOf(field.fullKey !== null ? field.fullKey : "");
              if (index === -1) {
                this.selectGroup.push(field.fullKey !== null ? field.fullKey : "");
                label.style.fontWeight = "bolder";
              } else {
                this.selectGroup.splice(index, 1);
                label.style.fontWeight = "initial";
              }
            }
            mouseDownInfo = null;
          }
        });
        label.addEventListener("touchstart", (event) => {
          let touch = event.targetTouches[0];
          dragEvent(
            touch.clientX,
            touch.clientY,
            touch.clientX - label.getBoundingClientRect().x,
            touch.clientY - label.getBoundingClientRect().y
          );
        });
      }

      // Select update callback
      this.selectGroupClearCallbacks.push(() => {
        label.style.fontWeight = "initial";
      });

      // Search expand callback
      let highlightForSearch = () => {
        if (this.searchKey !== null && field.fullKey === this.searchKey) {
          // @ts-expect-error
          fieldElement.scrollIntoViewIfNeeded(); // Available in Chromium but not standard
          fieldElementContainer.classList.add("highlight");
          setTimeout(() => fieldElementContainer.classList.remove("highlight"), 3000);
        }
      };
      this.searchExpandCallbacks.push(highlightForSearch);
      highlightForSearch(); // Try immediately in case this field was generating while expanding for search

      // Update value callback
      let type = window.log.getType(field.fullKey);
      let numValueInput: HTMLInputElement | null = null;
      let numValueSpan: HTMLElement | null = null;
      if (type === LoggableType.Boolean) {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        valueElement.appendChild(svg);
        svg.setAttributeNS(null, "width", "9");
        svg.setAttributeNS(null, "height", "9");
        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        svg.appendChild(circle);
        circle.setAttributeNS(null, "cx", "4.5");
        circle.setAttributeNS(null, "cy", "4.5");
        circle.setAttributeNS(null, "r", "4.5");

        // Update values periodically
        let firstUpdate = true;
        let lastValue: boolean | null = null;
        let lastHidden: boolean | null = null;
        this.updateValueCallbacks.push((time) => {
          let rect = fieldElement.getBoundingClientRect();
          let onScreen =
            rect.height > 0 && rect.width > 0 && rect.top >= -rect.height && rect.top <= window.innerHeight;
          if (!onScreen) return;

          let value: boolean | null =
            time === null ? null : getOrDefault(window.log, field.fullKey!, LoggableType.Boolean, time, null);
          if (!firstUpdate && value === lastValue) return;
          firstUpdate = false;
          lastValue = value;

          if (value !== null) {
            const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
            circle.setAttributeNS(null, "fill", value ? (darkMode ? "lightgreen" : "green") : "red");
          }
          let hidden = value === null;
          valueElement.hidden = hidden;
          if (hidden !== lastHidden) {
            lastHidden = hidden;
            let valueWidth = valueElement.clientWidth === 0 ? 0 : valueElement.clientWidth + this.VALUE_WIDTH_MARGIN_PX;
            fieldElementContainer.style.setProperty("--value-width", valueWidth.toString() + "px");
          }
        });

        // Tuning mode controls
        svg.addEventListener("click", () => {
          if (!this.isTuningMode) return;
          let oldValue = circle.getAttributeNS(null, "fill") !== "red";
          let value = !oldValue;
          let liveTime = window.selection.getCurrentLiveTime();
          if (liveTime !== null) {
            window.tuner?.publish(field.fullKey!, value);
            window.log.putBoolean(field.fullKey!, liveTime, value);
          }
        });
        let setTuningModeActive = (active: boolean) => {
          active = active && window.tuner !== null && window.tuner.isTunable(field.fullKey!);
          if (active) {
            svg.classList.add("tunable");
          } else {
            svg.classList.remove("tunable");
          }
        };
        this.setTuningModeActiveCallbacks.push(setTuningModeActive);
        setTuningModeActive(this.isTuningMode);
      } else if (type === LoggableType.Number) {
        // Create wrapper elements
        numValueInput = document.createElement("input");
        numValueInput.hidden = true;
        numValueInput.type = "number";
        valueElement.appendChild(numValueInput);
        numValueSpan = document.createElement("span");
        valueElement.appendChild(numValueSpan);

        // Add callback
        let firstUpdate = true;
        let lastValue: number | null = null;
        let lastCharCount: number | null = null;
        this.updateValueCallbacks.push((time) => {
          let rect = fieldElement.getBoundingClientRect();
          let onScreen =
            rect.height > 0 && rect.width > 0 && rect.top >= -rect.height && rect.top <= window.innerHeight;
          if (!onScreen) return;

          let value: number | null =
            time === null ? null : getOrDefault(window.log, field.fullKey!, LoggableType.Number, time, null);
          if (!firstUpdate && value === lastValue) return;
          firstUpdate = false;
          lastValue = value;

          let valueStr = "";
          if (value !== null) {
            if (Math.abs(value) < 1e-9) {
              valueStr = "0";
            } else if (Math.abs(value) >= 1e5 || Math.abs(value) < 1e-3) {
              valueStr = value.toExponential(1).replace("+", "");
            } else if (value % 1 === 0) {
              valueStr = value.toString();
            } else {
              valueStr = value.toFixed(3);
            }
          }
          numValueInput!.placeholder = valueStr;
          numValueSpan!.innerText = valueStr;
          let charCount = valueStr.length;
          if (charCount !== lastCharCount) {
            lastCharCount = charCount;
            let valueWidth = valueElement.clientWidth === 0 ? 0 : valueElement.clientWidth + this.VALUE_WIDTH_MARGIN_PX;
            fieldElementContainer.style.setProperty("--value-width", valueWidth.toString() + "px");
          }
        });
      } else if (type === LoggableType.String) {
        let firstUpdate = true;
        let lastValue: string | null = null;
        let lastCharCount: number | null = null;
        let lastSidebarWidth = 0;
        this.updateValueCallbacks.push((time) => {
          let rect = fieldElement.getBoundingClientRect();
          let onScreen =
            rect.height > 0 && rect.width > 0 && rect.top >= -rect.height && rect.top <= window.innerHeight;
          if (!onScreen) return;

          let value: string | null =
            time === null ? null : getOrDefault(window.log, field.fullKey!, LoggableType.String, time, null);
          if (!firstUpdate && value === lastValue && this.sidebarWidth === lastSidebarWidth) return;
          firstUpdate = false;
          lastValue = value;
          lastSidebarWidth = this.sidebarWidth;

          let valueStr = "";
          if (value !== null) {
            const maxCharacters = Math.round(this.sidebarWidth * 0.03);
            if (value.length > maxCharacters) {
              valueStr = value.substring(0, maxCharacters - 1) + "\u2026";
            } else {
              valueStr = value;
            }
          } else {
            valueStr = "";
          }
          valueElement.innerText = valueStr;
          let charCount = valueStr.length;
          if (charCount !== lastCharCount) {
            lastCharCount = charCount;
            let valueWidth = valueElement.clientWidth === 0 ? 0 : valueElement.clientWidth + this.VALUE_WIDTH_MARGIN_PX;
            fieldElementContainer.style.setProperty("--value-width", valueWidth.toString() + "px");
          }
        });
      }

      // Tuning mode callbacks for number
      if (type === LoggableType.Number) {
        // Enable & disable tuning mode
        let setTuningModeActive = (active: boolean) => {
          active = active && window.tuner !== null && window.tuner.isTunable(field.fullKey!);
          numValueInput!.hidden = !active;
          numValueSpan!.hidden = active;
          if (!active) {
            delete this.tuningValueCache[field.fullKey!];
          }
          let valueWidth = valueElement.clientWidth === 0 ? 0 : valueElement.clientWidth + this.VALUE_WIDTH_MARGIN_PX;
          fieldElementContainer.style.setProperty("--value-width", valueWidth.toString() + "px");
        };
        this.setTuningModeActiveCallbacks.push(setTuningModeActive);
        setTuningModeActive(this.isTuningMode);

        // Manage focus
        let isFocused = false;
        numValueInput?.addEventListener("focus", () => (isFocused = true));
        numValueInput?.addEventListener("blur", () => (isFocused = false));
        numValueInput?.addEventListener("keydown", (event) => {
          if (event.key === "Enter") numValueInput?.blur();
        });

        // Publish & unpublish value
        let lastHasValue = false;
        this.tuningModePublishCallbacks.push(() => {
          if (!this.isTuningMode || isFocused) return;
          let value = Number(numValueInput!.value);
          let hasValue = numValueInput!.value.length > 0 && !isNaN(value) && isFinite(value);
          if (hasValue) {
            this.tuningValueCache[field.fullKey!] = numValueInput!.value;
            let liveTime = window.selection.getCurrentLiveTime();
            if (liveTime !== null) {
              window.tuner?.publish(field.fullKey!, value);
              window.log.putNumber(field.fullKey!, liveTime, value);
            }
          } else if (lastHasValue) {
            delete this.tuningValueCache[field.fullKey!];
            window.tuner?.unpublish(field.fullKey!);
          }
          lastHasValue = hasValue;
        });

        // Set initial value from cache
        if (field.fullKey in this.tuningValueCache) {
          numValueInput!.value = this.tuningValueCache[field.fullKey];
        }
      }

      // Metadata callback
      let lastMetadata: string | null = null;
      let updateMetadata = () => {
        let metadata = window.log.getMetadataString(field.fullKey!);
        if (metadata === lastMetadata) return;
        lastMetadata = metadata;
        try {
          let metadataParsed = JSON.parse(metadata);
          label.title = Object.keys(metadataParsed)
            .sort()
            .map((key) => key + ": " + metadataParsed[key])
            .join("\n");
        } catch {
          label.title = metadata;
        }
      };
      this.updateMetadataCallbacks.push(updateMetadata);
      updateMetadata();
    }

    // Add children
    if (hasChildren) {
      let childSpan = document.createElement("span");
      parentElement.appendChild(childSpan);
      childSpan.style.setProperty("--indent", (indent + this.INDENT_SIZE_PX).toString() + "px");
      childSpan.hidden = true;

      let firstExpand = true;
      let currentlyExpanded = false;
      let setExpanded = (expanded: boolean) => {
        currentlyExpanded = expanded;

        // Update icon and span display
        childSpan.hidden = !expanded;
        closedIcon.style.display = expanded ? "none" : "initial";
        openIcon.style.display = expanded ? "initial" : "none";
        if (expanded) {
          this.expandedFields.add(fullTitle);
        } else {
          this.expandedFields.delete(fullTitle);
        }

        // Add children if first time
        if (firstExpand) {
          firstExpand = false;
          let childKeys = Object.keys(field.children);
          if (fullTitle === "/AdvantageKit" || fullTitle === "/NT" || fullTitle.startsWith("/" + this.MERGED_KEY)) {
            // Apply hidden and known keys
            childKeys = childKeys
              .filter((key) => !this.HIDDEN_KEYS.includes(key))
              .sort((a, b) => this.sortKeys(a, b, true));
          } else {
            childKeys = childKeys.sort((a, b) => this.sortKeys(a, b));
          }
          childKeys.forEach((key) => {
            this.addFields(
              key,
              fullTitle + "/" + key,
              field.children[key],
              childSpan,
              indent + this.INDENT_SIZE_PX,
              childrenGenerated
            );
          });
        }
      };

      // Search expand callback
      let expandForSearch = () => {
        if (this.searchKey === null) return;
        let foundSearchKey = false;
        let searchTree = (tree: LogFieldTree) => {
          if (tree.fullKey === this.searchKey) {
            foundSearchKey = true;
          } else {
            Object.values(tree.children).forEach((tree) => searchTree(tree));
          }
        };
        Object.values(field.children).forEach((tree) => searchTree(tree));
        if (foundSearchKey && !currentlyExpanded) {
          setExpanded(true);
        }
      };
      this.searchExpandCallbacks.push(expandForSearch);
      expandForSearch(); // Try immediately in case this field was generating while expanding for search

      // User controls
      closedIcon.addEventListener("click", () => setExpanded(true));
      openIcon.addEventListener("click", () => setExpanded(false));
      if (this.expandedFields.has(fullTitle)) setExpanded(true);
    }
  }

  /** Soring function that uses the known keys (optionally) and correctly interprets numbers within strings. */
  private sortKeys(a: string, b: string, useKnown: boolean = false): number {
    // Check for known keys
    if (useKnown) {
      let isMerged = (key: string) => key.startsWith(this.MERGED_KEY);
      if (isMerged(a) && !isMerged(b)) return 1;
      if (!isMerged(a) && isMerged(b)) return -1;

      let isKnown = (key: string) => this.KNOWN_KEYS.includes(key);
      if (isKnown(a) && !isKnown(b)) return 1;
      if (!isKnown(a) && isKnown(b)) return -1;
    }
    return a.localeCompare(b, undefined, { numeric: true });
  }

  /** Returns the set of field keys that are currently visible. */
  getActiveFields(): Set<string> {
    this.activeFieldCallbacks.forEach((callback) => callback());
    return this.activeFields;
  }
}
