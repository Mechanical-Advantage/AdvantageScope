import { SidebarState } from "../shared/HubState";
import LogFieldTree from "../shared/log/LogFieldTree";
import LoggableType from "../shared/log/LoggableType";
import { searchFields, TYPE_KEY } from "../shared/log/LogUtil";
import { arraysEqual, setsEqual } from "../shared/util";
import { ZEBRA_LOG_KEY } from "./dataSources/LoadZebra";

export default class Sidebar {
  private SIDEBAR = document.getElementsByClassName("side-bar")[0] as HTMLElement;
  private SIDEBAR_HANDLE = document.getElementsByClassName("side-bar-handle")[0] as HTMLElement;
  private SIDEBAR_SHADOW = document.getElementsByClassName("side-bar-shadow")[0] as HTMLElement;
  private SIDEBAR_TITLE = document.getElementsByClassName("side-bar-title")[0] as HTMLElement;
  private SEARCH_INPUT = document.getElementsByClassName("side-bar-search")[0] as HTMLInputElement;
  private FIELD_LIST = document.getElementById("fieldList") as HTMLElement;
  private ICON_TEMPLATES = document.getElementById("fieldItemIconTemplates") as HTMLElement;
  private DRAG_ITEM = document.getElementById("dragItem") as HTMLElement;

  private SEARCH_RESULTS = document.getElementsByClassName("search-results")[0] as HTMLElement;

  private MERGED_KEY = "MergedLog";
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
  private HIDDEN_KEYS = [".schema", "RealMetadata", "ReplayMetadata"];
  private INDENT_SIZE_PX = 20;
  private FIELD_DRAG_THRESHOLD_PX = 3;

  private sidebarHandleActive = false;
  private sidebarWidth = 300;
  private fieldCount = 0;
  private lastFieldKeys: string[] = [];
  private expandedFields = new Set<string>();
  private activeFields = new Set<string>();
  private activeFieldCallbacks: (() => void)[] = [];
  private selectGroup: string[] = [];
  private selectGroupClearCallbacks: (() => void)[] = [];
  private searchKey: string | null = null;
  private searchExpandCallbacks: (() => void)[] = [];

  constructor() {
    // Set up handle for resizing
    this.SIDEBAR_HANDLE.addEventListener("mousedown", (_) => {
      this.sidebarHandleActive = true;
      document.body.style.cursor = "col-resize";
    });
    window.addEventListener("mouseup", (_) => {
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
    let searchPeriodic = () => {
      let inputRect = this.SEARCH_INPUT.getBoundingClientRect();
      this.SEARCH_RESULTS.style.top = inputRect.bottom.toString() + "px";
      this.SEARCH_RESULTS.style.minWidth = inputRect.width.toString() + "px";
      let hidden =
        !searchInputFocused || this.SEARCH_INPUT.value.length === 0 || this.SEARCH_RESULTS.childElementCount === 0;
      let unhiding = !hidden && this.SEARCH_RESULTS.hidden;
      this.SEARCH_RESULTS.hidden = hidden;
      if (unhiding) {
        this.SEARCH_RESULTS.scrollTop = 0;
      }
    };

    // Periodic function
    let periodic = () => {
      searchPeriodic();
      this.updateTitle();
      window.requestAnimationFrame(periodic);
    };
    window.requestAnimationFrame(periodic);
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

  /** Updates the set of results based on the current query. */
  private updateSearchResults() {
    let query = this.SEARCH_INPUT.value;
    let results = query.length === 0 ? [] : searchFields(window.log, query);
    results = results.filter((field) => {
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
    results.forEach((field, index) => {
      let div = document.createElement("div");
      this.SEARCH_RESULTS.appendChild(div);
      div.classList.add("search-results-item");
      div.innerText = field;
      let search = () => {
        this.searchKey = field;
        this.searchExpandCallbacks.forEach((callback) => callback());
        this.searchKey = null;
      };
      div.addEventListener("mousedown", search);
      div.addEventListener("touchdown", search);
      if (index === 0) {
        this.SEARCH_INPUT.addEventListener("keydown", (event) => {
          if (div.getBoundingClientRect().height > 0 && event.code === "Enter") {
            search();
          }
        });
      }
    });
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
    if (this.fieldCount === 0) {
      this.SIDEBAR_TITLE.innerText = "No data available";
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
      this.SIDEBAR_TITLE.innerText =
        this.fieldCount.toString() +
        " field" +
        (this.fieldCount === 1 ? "" : "s") +
        ", " +
        Math.floor(runtime).toString() +
        runtimeUnit +
        " runtime";
    }
  }

  /** Refresh based on new log data or expanded field list. */
  refresh(forceRefresh: boolean = false) {
    let fieldsChanged = forceRefresh || !arraysEqual(window.log.getFieldKeys(), this.lastFieldKeys);
    this.lastFieldKeys = window.log.getFieldKeys();

    if (fieldsChanged) {
      // Update field count
      this.fieldCount = window.log.getFieldCount();

      // Remove old list
      while (this.FIELD_LIST.firstChild) {
        this.FIELD_LIST.removeChild(this.FIELD_LIST.firstChild);
      }

      // Add new list
      this.selectGroupClearCallbacks = [];
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

      // Update search
      this.updateSearchResults();
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

    // Active fields callback
    this.activeFieldCallbacks.push(() => {
      let visible = fieldElement.getBoundingClientRect().height > 0;

      // Add full key if available and array, raw, or string
      // - raw in case of msgpack, struct, or ptoto
      // - string in case of JSON
      if (
        field.fullKey !== null &&
        (window.log.getType(field.fullKey) === LoggableType.BooleanArray ||
          window.log.getType(field.fullKey) === LoggableType.NumberArray ||
          window.log.getType(field.fullKey) === LoggableType.StringArray ||
          window.log.getType(field.fullKey) === LoggableType.Raw ||
          window.log.getType(field.fullKey) === LoggableType.String)
      ) {
        if (visible) {
          this.activeFields.add(field.fullKey);
        } else {
          this.activeFields.delete(field.fullKey);
        }
      }

      // Add type subkey if available
      if (TYPE_KEY in field.children && field.children[TYPE_KEY].fullKey !== null) {
        let typeKey = field.children[TYPE_KEY].fullKey;
        if (visible) {
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

      // Add select update callback
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
