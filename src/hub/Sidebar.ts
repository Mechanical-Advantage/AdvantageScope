import { arraysEqual } from "../lib/util";
import { SidebarState } from "./HubState";
import LogFieldTree from "./log/LogFieldTree";

export default class Sidebar {
  private SIDEBAR = document.getElementsByClassName("side-bar")[0] as HTMLElement;
  private SIDEBAR_HANDLE = document.getElementsByClassName("side-bar-handle")[0] as HTMLElement;
  private SIDEBAR_SHADOW = document.getElementsByClassName("side-bar-shadow")[0] as HTMLElement;
  private SIDEBAR_TITLE = document.getElementsByClassName("side-bar-title")[0] as HTMLElement;
  private FIELD_LIST = document.getElementById("fieldList") as HTMLElement;
  private ICON_TEMPLATES = document.getElementById("fieldItemIconTemplates") as HTMLElement;
  private DRAG_ITEM = document.getElementById("dragItem") as HTMLElement;

  private KNOWN_KEYS = ["DriverStation", "NetworkTables", "RealOutputs", "ReplayOutputs", "SystemStats"];
  private HIDDEN_KEYS = ["RealMetadata", "ReplayMetadata"];
  private INDENT_SIZE_PX = 20;
  private FIELD_DRAG_THRESHOLD_PX = 3;

  private sidebarHandleActive = false;
  private sidebarWidth = 300;
  private lastFieldKeys: string[] = [];
  private expandedFields: string[] = [];
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
      expanded: this.expandedFields
    };
  }

  /** Restores to the provided state. */
  restoreState(state: SidebarState) {
    let widthEqual = state.width == this.sidebarWidth;
    let expandedEqual = arraysEqual(state.expanded, this.expandedFields);
    this.sidebarWidth = state.width;
    this.expandedFields = state.expanded;
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
    let fieldsChanged = forceRefresh || !arraysEqual(window.log.getFieldKeys(), this.lastFieldKeys);
    this.lastFieldKeys = window.log.getFieldKeys();

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
        .sort((a, b) => this.sortKeys(a, b))
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

    let fieldElement = document.createElement("div");
    parentElement.appendChild(fieldElement);
    fieldElement.classList.add("field-item");

    let closedIcon = this.ICON_TEMPLATES.children[0].cloneNode(true) as HTMLElement;
    let openIcon = this.ICON_TEMPLATES.children[1].cloneNode(true) as HTMLElement;
    let neutralIcon = this.ICON_TEMPLATES.children[2].cloneNode(true) as HTMLElement;
    fieldElement.append(closedIcon, openIcon, neutralIcon);
    closedIcon.style.display = hasChildren ? "initial" : "none";
    openIcon.style.display = "none";
    neutralIcon.style.display = hasChildren ? "none" : "initial";

    let label = document.createElement("div");
    fieldElement.appendChild(label);
    label.classList.add("field-item-label");
    if (this.KNOWN_KEYS.includes(title)) label.classList.add("known");
    label.innerText = title;
    label.style.fontStyle = field.fullKey == null ? "normal" : "italic";
    label.style.cursor = field.fullKey == null ? "auto" : "grab";
    if (field.fullKey != null) {
      let dragEvent = (x: number, y: number, offsetX: number, offsetY: number) => {
        let isGroup = this.selectGroup.includes(field.fullKey != null ? field.fullKey : "");
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
            let index = this.selectGroup.indexOf(field.fullKey != null ? field.fullKey : "");
            if (index == -1) {
              this.selectGroup.push(field.fullKey != null ? field.fullKey : "");
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

    if (hasChildren) {
      let childSpan = document.createElement("span");
      parentElement.appendChild(childSpan);
      childSpan.style.setProperty("--indent", (indent + this.INDENT_SIZE_PX).toString() + "px");
      childSpan.hidden = true;

      let setExpanded = (expanded: boolean) => {
        childSpan.hidden = !expanded;
        closedIcon.style.display = expanded ? "none" : "initial";
        openIcon.style.display = expanded ? "initial" : "none";
        if (expanded) {
          this.expandedFields.push(fullTitle);
        } else {
          this.expandedFields.splice(this.expandedFields.indexOf(fullTitle), 1);
        }
      };

      closedIcon.addEventListener("click", () => setExpanded(true));
      openIcon.addEventListener("click", () => setExpanded(false));
      if (this.expandedFields.includes(fullTitle)) setExpanded(true);

      Object.keys(field.children)
        .filter((key) => !this.HIDDEN_KEYS.includes(key))
        .sort((a, b) => this.sortKeys(a, b))
        .forEach((key) => {
          this.addFields(key, fullTitle + "/" + key, field.children[key], childSpan, indent + this.INDENT_SIZE_PX);
        });
    }
  }

  /** Soring function that uses the known keys and correctly interprets numbers within strings. */
  private sortKeys(a: string, b: string): number {
    // Check for known keys
    if (this.KNOWN_KEYS.includes(a) && !this.KNOWN_KEYS.includes(b)) return 1;
    if (!this.KNOWN_KEYS.includes(a) && this.KNOWN_KEYS.includes(b)) return -1;

    // Sort based on name
    function getNum(text: string): number | null {
      for (let i = text.length; i > 0; i -= 1) {
        let num = Number(text.slice(-i));
        if (!isNaN(num)) {
          return num;
        }
      }
      return null;
    }
    let aNum = getNum(a);
    let bNum = getNum(b);
    if (aNum != null && bNum != null) {
      return aNum - bNum;
    } else if (a > b) {
      return 1;
    } else if (a < b) {
      return -1;
    }
    return 0;
  }
}
