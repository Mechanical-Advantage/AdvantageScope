import { SidebarState } from "../shared/HubState";
import LogFieldTree from "../shared/log/LogFieldTree";
import LoggableType from "../shared/log/LoggableType";
import { getFullKeyIfMechanism, getOrDefault, MECHANISM_KEY, TYPE_KEY } from "../shared/log/LogUtil";
import { arraysEqual, setsEqual } from "../shared/util";

export default class Sidebar {
  private SIDEBAR = document.getElementsByClassName("side-bar")[0] as HTMLElement;
  private SIDEBAR_HANDLE = document.getElementsByClassName("side-bar-handle")[0] as HTMLElement;
  private SIDEBAR_SHADOW = document.getElementsByClassName("side-bar-shadow")[0] as HTMLElement;
  private SIDEBAR_TITLE = document.getElementsByClassName("side-bar-title")[0] as HTMLElement;
  private FIELD_LIST = document.getElementById("fieldList") as HTMLElement;
  private ICON_TEMPLATES = document.getElementById("fieldItemIconTemplates") as HTMLElement;
  private DRAG_ITEM = document.getElementById("dragItem") as HTMLElement;

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
    "DSEvents"
  ];
  private HIDDEN_KEYS = ["RealMetadata", "ReplayMetadata"];
  private INDENT_SIZE_PX = 20;
  private FIELD_DRAG_THRESHOLD_PX = 3;

  private sidebarHandleActive = false;
  private sidebarWidth = 300;
  private lastFieldKeys: string[] = [];
  private lastMechanismFieldKeys: string[] = [];
  private expandedFields = new Set<string>();
  private activeFields = new Set<string>();
  private activeFieldCallbacks: (() => void)[] = [];
  private selectGroup: string[] = [];
  private selectGroupClearCallbacks: (() => void)[] = [];

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
      this.SIDEBAR_SHADOW.style.opacity = this.SIDEBAR.scrollTop == 0 ? "0" : "1";
    });
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
    let widthEqual = state.width == this.sidebarWidth;
    let expandedSet = new Set<string>(state.expanded);
    let expandedEqual = setsEqual(expandedSet, this.expandedFields);
    this.sidebarWidth = state.width;
    this.expandedFields = expandedSet;
    if (!widthEqual) this.updateWidth();
    if (!expandedEqual) this.refresh(true);
  }

  /** Updates the displayed width based on the current state. */
  private updateWidth() {
    document.documentElement.style.setProperty("--side-bar-width", this.sidebarWidth.toString() + "px");
    document.documentElement.style.setProperty("--show-side-bar", this.sidebarWidth > 0 ? "1" : "0");
  }

  /** Refresh based on new log data or expanded field list. */
  refresh(forceRefresh: boolean = false) {
    let mechanismFieldKeys = window.log
      .getFieldKeys()
      .filter((key) => key.endsWith(TYPE_KEY))
      .filter((key) => getOrDefault(window.log, key, LoggableType.String, Infinity, "") === MECHANISM_KEY);
    let fieldsChanged =
      forceRefresh ||
      !arraysEqual(window.log.getFieldKeys(), this.lastFieldKeys) ||
      !arraysEqual(mechanismFieldKeys, this.lastMechanismFieldKeys);
    this.lastFieldKeys = window.log.getFieldKeys();
    this.lastMechanismFieldKeys = mechanismFieldKeys;

    if (fieldsChanged) {
      // Remove old list
      while (this.FIELD_LIST.firstChild) {
        this.FIELD_LIST.removeChild(this.FIELD_LIST.firstChild);
      }

      // Add new list
      this.selectGroupClearCallbacks = [];
      let tree = window.log.getFieldTree();
      Object.keys(tree)
        .filter((key) => !this.HIDDEN_KEYS.includes(key))
        .sort((a, b) => this.sortKeys(a, b, true))
        .forEach((key) => {
          this.addFields(key, "/" + key, tree[key], this.FIELD_LIST, 0);
        });
    }

    // Update title
    let range = window.log.getTimestampRange();
    let fieldCount = window.log.getFieldCount();
    if (fieldCount == 0) {
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
        fieldCount.toString() +
        " field" +
        (fieldCount == 1 ? "" : "s") +
        ", " +
        Math.round(runtime).toString() +
        runtimeUnit +
        " runtime";
    }
  }

  /** Recursively adds a set of fields. */
  private addFields(title: string, fullTitle: string, field: LogFieldTree, parentElement: HTMLElement, indent: number) {
    let hasChildren = Object.keys(field.children).length > 0;

    // Create element
    let fieldElement = document.createElement("div");
    parentElement.appendChild(fieldElement);
    fieldElement.classList.add("field-item");

    // Active fields callback
    this.activeFieldCallbacks.push(() => {
      let visible = fieldElement.getBoundingClientRect().height > 0;

      // Add full key if available and array
      if (
        field.fullKey !== null &&
        (window.log.getType(field.fullKey) === LoggableType.BooleanArray ||
          window.log.getType(field.fullKey) === LoggableType.NumberArray ||
          window.log.getType(field.fullKey) === LoggableType.StringArray)
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

    // Check if mechanism
    let mechanismFullKey = getFullKeyIfMechanism(field);
    if (mechanismFullKey !== null) {
      field.fullKey = mechanismFullKey; // Acts like a normal field
    }

    // Create label
    let label = document.createElement("div");
    fieldElement.appendChild(label);
    label.classList.add("field-item-label");
    if (
      (indent == 0 || (indent == this.INDENT_SIZE_PX && fullTitle.startsWith("/AdvantageKit"))) &&
      this.KNOWN_KEYS.includes(title)
    ) {
      label.classList.add("known");
    }
    label.innerText = title;
    label.style.fontStyle = field.fullKey === null ? "normal" : "italic";
    label.style.cursor = field.fullKey === null ? "auto" : "grab";

    // Dragging support
    if (field.fullKey !== null) {
      let dragEvent = (x: number, y: number, offsetX: number, offsetY: number) => {
        let isGroup = this.selectGroup.includes(field.fullKey !== null ? field.fullKey : "");
        this.DRAG_ITEM.innerText = title + (isGroup ? "..." : "");
        this.DRAG_ITEM.style.fontWeight = isGroup ? "bolder" : "initial";
        window.startDrag(x, y, offsetX, offsetY, {
          fields: isGroup ? this.selectGroup : [field.fullKey],
          children: isGroup ? [] : Object.values(field.children).map((x) => x.fullKey)
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
        if (mouseDownInfo != null) {
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
        if (mouseDownInfo != null) {
          if (
            (event.ctrlKey || event.metaKey) &&
            Math.abs(event.clientX - mouseDownInfo[0]) < this.FIELD_DRAG_THRESHOLD_PX &&
            Math.abs(event.clientY - mouseDownInfo[1]) < this.FIELD_DRAG_THRESHOLD_PX
          ) {
            let index = this.selectGroup.indexOf(field.fullKey !== null ? field.fullKey : "");
            if (index == -1) {
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
    }

    // Add children
    if (hasChildren) {
      let childSpan = document.createElement("span");
      parentElement.appendChild(childSpan);
      childSpan.style.setProperty("--indent", (indent + this.INDENT_SIZE_PX).toString() + "px");
      childSpan.hidden = true;

      let firstExpand = true;
      let setExpanded = (expanded: boolean) => {
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
          if (fullTitle == "/AdvantageKit") {
            // Apply hidden and known keys
            childKeys = childKeys
              .filter((key) => !this.HIDDEN_KEYS.includes(key))
              .sort((a, b) => this.sortKeys(a, b, true));
          } else {
            childKeys = childKeys.sort((a, b) => this.sortKeys(a, b));
          }
          childKeys.forEach((key) => {
            this.addFields(key, fullTitle + "/" + key, field.children[key], childSpan, indent + this.INDENT_SIZE_PX);
          });
        }
      };

      closedIcon.addEventListener("click", () => setExpanded(true));
      openIcon.addEventListener("click", () => setExpanded(false));
      if (this.expandedFields.has(fullTitle)) setExpanded(true);
    }
  }

  /** Soring function that uses the known keys (optionally) and correctly interprets numbers within strings. */
  private sortKeys(a: string, b: string, useKnown: boolean = false): number {
    // Check for known keys
    if (useKnown) {
      if (this.KNOWN_KEYS.includes(a) && !this.KNOWN_KEYS.includes(b)) return 1;
      if (!this.KNOWN_KEYS.includes(a) && this.KNOWN_KEYS.includes(b)) return -1;
    }

    return a.localeCompare(b, undefined, { numeric: true });
  }

  /** Returns the set of field keys that are currently visible. */
  getActiveFields(): Set<string> {
    this.activeFieldCallbacks.forEach((callback) => callback());
    return this.activeFields;
  }
}
