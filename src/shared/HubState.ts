// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

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
  tabs: TabState[];
}

export interface TabState {
  type: TabType;
  title: string;
  controller: unknown;
  controllerUUID: string;
  renderer: unknown;
  controlsHeight: number;
}
