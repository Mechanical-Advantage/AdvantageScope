import { TabGroupState } from "../shared/HubState";
import { getEnabledKey } from "../shared/log/LogUtil";
import TabType, { getDefaultTabTitle, getTabIcon, TIMELINE_VIZ_TYPES } from "../shared/TabType";
import { UnitConversionPreset } from "../shared/units";
import ScrollSensor from "./ScrollSensor";
import TabController from "./TabController";
import ConsoleController from "./tabControllers/ConsoleController";
import DocumentationController from "./tabControllers/DocumentationController";
import JoysticksController from "./tabControllers/JoysticksController";
import LineGraphController from "./tabControllers/LineGraphController";
import MechanismController from "./tabControllers/MechanismController";
import MetadataController from "./tabControllers/MetadataController";
import OdometryController from "./tabControllers/OdometryController";
import PointsController from "./tabControllers/PointsController";
import StatisticsController from "./tabControllers/StatisticsController";
import SwerveController from "./tabControllers/SwerveController";
import TableController from "./tabControllers/TableController";
import ThreeDimensionController from "./tabControllers/ThreeDimensionController";
import TimelineVizController from "./tabControllers/TimelineVizController";
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
    title: string;
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
    this.SCROLL_OVERLAY.addEventListener("contextmenu", (event) => {
      this.tabList.forEach((tab, index) => {
        if (index === 0) return;
        let rect = tab.titleElement.getBoundingClientRect();
        if (
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        ) {
          window.sendMainMessage("ask-rename-tab", {
            index: index,
            name: this.tabList[index].title
          });
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
    this.SCROLL_OVERLAY.addEventListener("mouseout", () => {
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
    this.addTab(TabType.Documentation);
    this.addTab(TabType.LineGraph);

    // Scroll management
    this.scrollSensor = new ScrollSensor(this.SCROLL_OVERLAY, (dx: number, dy: number) => {
      this.TAB_BAR.scrollLeft += dx + dy;
    });

    // Periodic function
    let periodic = () => {
      this.SHADOW_LEFT.style.opacity = Math.floor(this.TAB_BAR.scrollLeft) <= 0 ? "0" : "1";
      this.SHADOW_RIGHT.style.opacity =
        Math.ceil(this.TAB_BAR.scrollLeft) >= this.TAB_BAR.scrollWidth - this.TAB_BAR.clientWidth ? "0" : "1";
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
      tabs: this.tabList.slice(1).map((tab) => {
        let state = tab.controller.saveState();
        state.title = tab.title;
        return state;
      })
    };
  }

  /** Restores to the provided state. */
  restoreState(state: TabGroupState) {
    this.tabList.forEach((tab) => {
      this.VIEWER.removeChild(tab.contentElement);
    });
    this.tabList = [];
    this.selectedTab = 0;
    this.addTab(TabType.Documentation); // Add default tab
    state.tabs.forEach((tabState, index) => {
      this.addTab(tabState.type);
      if (tabState.title) this.renameTab(index + 1, tabState.title);
      this.tabList[index + 1].controller.restoreState(tabState);
    });
    this.selectedTab = state.selected >= this.tabList.length ? this.tabList.length - 1 : state.selected;
    this.updateElements();
  }

  /** Refresh based on new log data. */
  refresh() {
    this.tabList.forEach((tab) => {
      tab.controller.refresh();
    });
  }

  /** Refresh based on new log data. */
  newAssets() {
    this.tabList.forEach((tab) => {
      tab.controller.newAssets();
    });
  }

  /** Returns the set of fields currently being displayed. */
  getActiveFields(): Set<string> {
    let activeFields = new Set<string>();
    this.tabList.forEach((tab) => {
      tab.controller.getActiveFields().forEach((field) => {
        activeFields.add(field);
      });
    });
    let enabledKey = getEnabledKey(window.log);
    if (enabledKey !== undefined) {
      activeFields.add(enabledKey);
    }
    return activeFields;
  }

  /** Creates a new tab. */
  addTab(type: TabType) {
    // Select existing metadata tab
    if (type === TabType.Metadata) {
      let existingIndex = this.tabList.findIndex((tab) => tab.type === TabType.Metadata);
      if (existingIndex >= 0) {
        this.setSelected(existingIndex);
        return;
      }
    }

    // Add tab
    let contentElement: HTMLElement;
    let controller: TabController;
    switch (type) {
      case TabType.Documentation:
        contentElement = this.CONTENT_TEMPLATES.children[0].cloneNode(true) as HTMLElement;
        controller = new DocumentationController(contentElement);
        break;
      case TabType.LineGraph:
        contentElement = this.CONTENT_TEMPLATES.children[1].cloneNode(true) as HTMLElement;
        controller = new LineGraphController(contentElement);
        break;
      case TabType.Table:
        contentElement = this.CONTENT_TEMPLATES.children[2].cloneNode(true) as HTMLElement;
        controller = new TableController(contentElement);
        break;
      case TabType.Console:
        contentElement = this.CONTENT_TEMPLATES.children[3].cloneNode(true) as HTMLElement;
        controller = new ConsoleController(contentElement);
        break;
      case TabType.Statistics:
        contentElement = this.CONTENT_TEMPLATES.children[4].cloneNode(true) as HTMLElement;
        controller = new StatisticsController(contentElement);
        break;
      case TabType.Odometry:
        contentElement = this.CONTENT_TEMPLATES.children[5].cloneNode(true) as HTMLElement;
        contentElement.appendChild(this.CONTENT_TEMPLATES.children[6].cloneNode(true));
        controller = new OdometryController(contentElement);
        break;
      case TabType.ThreeDimension:
        contentElement = this.CONTENT_TEMPLATES.children[5].cloneNode(true) as HTMLElement;
        contentElement.appendChild(this.CONTENT_TEMPLATES.children[7].cloneNode(true));
        controller = new ThreeDimensionController(contentElement);
        break;
      case TabType.Video:
        contentElement = this.CONTENT_TEMPLATES.children[5].cloneNode(true) as HTMLElement;
        contentElement.appendChild(this.CONTENT_TEMPLATES.children[8].cloneNode(true));
        controller = new VideoController(contentElement);
        break;
      case TabType.Joysticks:
        contentElement = this.CONTENT_TEMPLATES.children[5].cloneNode(true) as HTMLElement;
        contentElement.appendChild(this.CONTENT_TEMPLATES.children[9].cloneNode(true));
        controller = new JoysticksController(contentElement);
        break;
      case TabType.Swerve:
        contentElement = this.CONTENT_TEMPLATES.children[5].cloneNode(true) as HTMLElement;
        contentElement.appendChild(this.CONTENT_TEMPLATES.children[10].cloneNode(true));
        controller = new SwerveController(contentElement);
        break;
      case TabType.Mechanism:
        contentElement = this.CONTENT_TEMPLATES.children[5].cloneNode(true) as HTMLElement;
        contentElement.appendChild(this.CONTENT_TEMPLATES.children[11].cloneNode(true));
        controller = new MechanismController(contentElement);
        break;
      case TabType.Points:
        contentElement = this.CONTENT_TEMPLATES.children[5].cloneNode(true) as HTMLElement;
        contentElement.appendChild(this.CONTENT_TEMPLATES.children[12].cloneNode(true));
        controller = new PointsController(contentElement);
        break;
      case TabType.Metadata:
        contentElement = this.CONTENT_TEMPLATES.children[13].cloneNode(true) as HTMLElement;
        controller = new MetadataController(contentElement);
        break;
    }

    // Create title element
    let titleElement = document.createElement("div");
    titleElement.classList.add("tab");
    titleElement.innerText = getTabIcon(type) + " " + getDefaultTabTitle(type);

    // Save to tab list
    if (this.tabList.length === 0) {
      this.selectedTab = -1;
    }
    this.tabList.splice(this.selectedTab + 1, 0, {
      type: type,
      title: getDefaultTabTitle(type),
      controller: controller,
      titleElement: titleElement,
      contentElement: contentElement
    });
    this.selectedTab += 1;
    this.VIEWER.appendChild(contentElement);
    controller.periodic(); // Some controllers need to initialize by running a periodic cycle while visible
    if (TIMELINE_VIZ_TYPES.includes(type)) {
      (controller as TimelineVizController).setTitle(getDefaultTabTitle(type));
    }
    this.updateElements();
  }

  /** Closes the specified tab. */
  close(index: number) {
    if (index < 1 || index > this.tabList.length - 1) return;
    if (TIMELINE_VIZ_TYPES.includes(this.tabList[index].type)) {
      (this.tabList[index].controller as TimelineVizController).stopPeriodic();
    }
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
    if (index === 0) return;
    if (index + shift < 1) shift = 1 - index;
    if (index + shift > this.tabList.length - 1) shift = this.tabList.length - 1 - index;
    if (this.selectedTab === index) this.selectedTab += shift;

    let tab = this.tabList.splice(index, 1)[0];
    this.tabList.splice(index + shift, 0, tab);
    this.updateElements();
  }

  /** Renames a single tab. */
  renameTab(index: number, name: string) {
    let tab = this.tabList[index];
    tab.title = name;
    tab.titleElement.innerText = getTabIcon(tab.type) + " " + name;
    if (TIMELINE_VIZ_TYPES.includes(tab.type)) {
      (tab.controller as TimelineVizController).setTitle(name);
    }
  }

  /** Adds the enabled field to the discrete legend on the selected line graph. */
  addDiscreteEnabled() {
    if (this.tabList[this.selectedTab].type === TabType.LineGraph) {
      (this.tabList[this.selectedTab].controller as LineGraphController).addDiscreteEnabled();
    }
  }

  /** Adjusts the locked range and unit conversion for an axis on the selected line graph. */
  editAxis(legend: string, lockedRange: [number, number] | null, unitConversion: UnitConversionPreset) {
    if (this.tabList[this.selectedTab].type === TabType.LineGraph) {
      (this.tabList[this.selectedTab].controller as LineGraphController).editAxis(legend, lockedRange, unitConversion);
    }
  }

  /** Clear the fields for an axis on the selected line graph. */
  clearAxis(legend: string) {
    if (this.tabList[this.selectedTab].type === TabType.LineGraph) {
      (this.tabList[this.selectedTab].controller as LineGraphController).clearAxis(legend);
    }
  }

  /** Switches the selected camera for the selected 3D field. */
  set3DCamera(index: number) {
    if (this.tabList[this.selectedTab].type === TabType.ThreeDimension) {
      (this.tabList[this.selectedTab].controller as ThreeDimensionController).set3DCamera(index);
    }
  }

  /** Switches the orbit FOV for the selected 3D field. */
  setFov(fov: number) {
    if (this.tabList[this.selectedTab].type === TabType.ThreeDimension) {
      (this.tabList[this.selectedTab].controller as ThreeDimensionController).setFov(fov);
    }
  }

  /** Sends video data to all video controllers. */
  processVideoData(data: any) {
    this.tabList.forEach((tab) => {
      if (tab.type === TabType.Video) {
        (tab.controller as VideoController).processVideoData(data);
      }
    });
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
      if (index === this.selectedTab) {
        item.titleElement.classList.add("tab-selected");
        item.contentElement.hidden = false;
      } else {
        item.titleElement.classList.remove("tab-selected");
        item.contentElement.hidden = true;
      }
    });
  }
}
