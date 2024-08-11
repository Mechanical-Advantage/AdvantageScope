import TabType from "./TabType";

export interface HubState {
  sidebar: SidebarState;
  tabs: TabsState;
}

export interface SidebarState {
  width: number;
  expanded: string[];
}

export interface TabsState {
  selected: number;
  controlsHeight: number;
  tabs: TabState[];
}

export interface TabState {
  type: TabType;
  title: string;
  controller: unknown;
  renderer: unknown;
}
