import TabType from "../lib/TabType";
import { TabGroupState } from "./HubState";
import ScrollSensor from "./ScrollSensor";
import TabController from "./TabController";
import LineGraphController from "./tabControllers/LineGraphController";
import MetadataController from "./tabControllers/MetadataController";
import OdometryController from "./tabControllers/OdometryController";
import PointsController from "./tabControllers/PointsController";
import TableController from "./tabControllers/TableController";
import VideoController from "./tabControllers/VideoController";

export default class Tabs {
  private VIEWER = document.getElementsByClassName("viewer")[0] as HTMLElement;
  private TAB_BAR = document.getElementsByClassName("tab-bar")[0];
  private SHADOW_LEFT = document.getElementsByClassName("tab-bar-shadow-left")[0] as HTMLElement;
  private SHADOW_RIGHT = document.getElementsByClassName("tab-bar-shadow-right")[0] as HTMLElement;
  private SCROLL_OVERLAY = document.getElementsByClassName("tab-bar-scroll")[0] as HTMLElement;
  private CONTENT_TEMPLATES = document.getElementById("tabContentTemplates") as HTMLElement;

  private LEFT_BUTTON = document.getElementsByClassName("move-left")[0] as HTMLElement;
  private RIGHT_BUTTON = document.getElementsByClassName("move-right")[0] as HTMLElement;
  private CLOSE_BUTTON = document.getElementsByClassName("close")[0] as HTMLElement;
  private ADD_BUTTON = document.getElementsByClassName("add-tab")[0] as HTMLElement;

  private tabList: {
    type: TabType;
    controller: TabController;
    titleElement: HTMLElement;
    contentElement: HTMLElement;
  }[] = [];
  private selectedTab = 0;
  private scrollSensor: ScrollSensor;

  constructor() {
    // Hover and click handling
    this.SCROLL_OVERLAY.addEventListener("click", (event) => {
      this.tabList.forEach((tab, index) => {
        let rect = tab.titleElement.getBoundingClientRect();
        if (
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        ) {
          this.setSelected(index);
        }
      });
    });
    this.SCROLL_OVERLAY.addEventListener("mousemove", (event) => {
      this.tabList.forEach((tab) => {
        let rect = tab.titleElement.getBoundingClientRect();
        if (
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        ) {
          tab.titleElement.classList.add("tab-hovered");
        } else {
          tab.titleElement.classList.remove("tab-hovered");
        }
      });
    });
    this.SCROLL_OVERLAY.addEventListener("mouseout", (event) => {
      this.tabList.forEach((tab) => {
        tab.titleElement.classList.remove("tab-hovered");
      });
    });

    // Control buttons
    this.LEFT_BUTTON.addEventListener("click", () => this.shift(this.selectedTab, -1));
    this.RIGHT_BUTTON.addEventListener("click", () => this.shift(this.selectedTab, 1));
    this.CLOSE_BUTTON.addEventListener("click", () => this.close(this.selectedTab));
    this.ADD_BUTTON.addEventListener("click", () => {
      window.sendMainMessage("ask-new-tab");
    });

    // Add default tabs
    this.addTab(TabType.Metadata);
    this.addTab(TabType.LineGraph);

    // Scroll management
    this.scrollSensor = new ScrollSensor(this.SCROLL_OVERLAY, (dx: number, dy: number) => {
      this.TAB_BAR.scrollLeft += dx + dy;
    });

    // Periodic function
    let periodic = () => {
      this.SHADOW_LEFT.style.opacity = Math.floor(this.TAB_BAR.scrollLeft) == 0 ? "0" : "1";
      this.SHADOW_RIGHT.style.opacity =
        Math.ceil(this.TAB_BAR.scrollLeft) == this.TAB_BAR.scrollWidth - this.TAB_BAR.clientWidth ? "0" : "1";
      this.tabList[this.selectedTab].controller.periodic();
      this.scrollSensor.periodic();
      window.requestAnimationFrame(periodic);
    };
    window.requestAnimationFrame(periodic);
  }

  /** Returns the current state. */
  saveState(): TabGroupState {
    return {
      selected: this.selectedTab,
      tabs: this.tabList.map((tab) => tab.controller.saveState())
    };
  }

  /** Restores to the provided state. */
  restoreState(state: TabGroupState) {
    this.tabList.forEach((tab) => {
      this.VIEWER.removeChild(tab.contentElement);
    });
    this.tabList = [];
    state.tabs.forEach((tabState) => {
      this.addTab(tabState.type);
      this.tabList[this.tabList.length - 1].controller.restoreState(tabState);
    });
    this.selectedTab = state.selected;
    this.updateElements();
  }

  /** Refresh based on new log data. */
  refresh() {
    this.tabList.forEach((tab) => {
      tab.controller.refresh();
    });
  }

  /** Creates a new tab. */
  addTab(type: TabType) {
    let title: string;
    let contentElement: HTMLElement;
    let controller: TabController;
    switch (type) {
      case TabType.Metadata:
        title = "\ud83d\udd0d";
        contentElement = this.CONTENT_TEMPLATES.children[0].cloneNode(true) as HTMLElement;
        controller = new MetadataController(contentElement);
        break;
      case TabType.LineGraph:
        title = "Line Graph";
        contentElement = this.CONTENT_TEMPLATES.children[1].cloneNode(true) as HTMLElement;
        controller = new LineGraphController(contentElement);
        break;
      case TabType.Table:
        title = "Table";
        contentElement = this.CONTENT_TEMPLATES.children[2].cloneNode(true) as HTMLElement;
        controller = new TableController(contentElement);
        break;
      case TabType.Odometry:
        title = "Odometry";
        contentElement = this.CONTENT_TEMPLATES.children[3].cloneNode(true) as HTMLElement;
        contentElement.appendChild(this.CONTENT_TEMPLATES.children[4].cloneNode(true));
        controller = new OdometryController(contentElement);
        break;
      case TabType.Points:
        title = "Points";
        contentElement = this.CONTENT_TEMPLATES.children[3].cloneNode(true) as HTMLElement;
        contentElement.appendChild(this.CONTENT_TEMPLATES.children[5].cloneNode(true));
        controller = new PointsController(contentElement);
        break;
      case TabType.Video:
        title = "Video";
        contentElement = this.CONTENT_TEMPLATES.children[3].cloneNode(true) as HTMLElement;
        contentElement.appendChild(this.CONTENT_TEMPLATES.children[6].cloneNode(true));
        controller = new VideoController(contentElement);
        break;
    }

    // Create title element
    let titleElement = document.createElement("div");
    titleElement.classList.add("tab");
    titleElement.innerText = title;

    // Save to tab list
    this.tabList.push({
      type: type,
      controller: controller,
      titleElement: titleElement,
      contentElement: contentElement
    });
    this.selectedTab = this.tabList.length - 1;
    this.VIEWER.appendChild(contentElement);
    this.updateElements();
  }

  /** Closes the specified tab. */
  close(index: number) {
    if (index < 1 || index > this.tabList.length - 1) return;
    this.VIEWER.removeChild(this.tabList[index].contentElement);
    this.tabList.splice(index, 1);
    if (this.selectedTab > index) this.selectedTab--;
    if (this.selectedTab > this.tabList.length - 1) this.selectedTab = this.tabList.length - 1;
    this.updateElements();
  }

  /** Returns the index of the selected tab. */
  getSelectedTab(): number {
    return this.selectedTab;
  }

  /** Changes which tab is currently selected. */
  setSelected(index: number) {
    if (index < 0 || index > this.tabList.length - 1) return;
    this.selectedTab = index;
    this.updateElements();
  }

  /** Moves the specified tab left or right. */
  shift(index: number, shift: number) {
    if (index == 0) return;
    if (index + shift < 1) shift = 1 - index;
    if (index + shift > this.tabList.length - 1) shift = this.tabList.length - 1 - index;
    if (this.selectedTab == index) this.selectedTab += shift;

    let tab = this.tabList.splice(index, 1)[0];
    this.tabList.splice(index + shift, 0, tab);
    this.updateElements();
  }

  /** Adjusts the locked range for an axis on the selected line graph. */
  editAxis(isLeft: boolean, range: [number, number] | null) {
    if (this.tabList[this.selectedTab].type == TabType.LineGraph) {
      (this.tabList[this.selectedTab].controller as LineGraphController).editAxis(isLeft, range);
    }
  }

  /** Updates the displayed elements based on the tab list. */
  private updateElements() {
    // Remove old tabs
    while (this.TAB_BAR.firstChild) {
      this.TAB_BAR.removeChild(this.TAB_BAR.firstChild);
    }

    // Add title elements
    this.tabList.forEach((item, index) => {
      this.TAB_BAR.appendChild(item.titleElement);
      if (index == this.selectedTab) {
        item.titleElement.classList.add("tab-selected");
        item.contentElement.hidden = false;
      } else {
        item.titleElement.classList.remove("tab-selected");
        item.contentElement.hidden = true;
      }
    });
  }
}
