// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { HubState } from "../../shared/HubState";

const DEFAULT_DS_LAYOUT: HubState = {
  sidebar: { width: 300, expanded: ["/Control", "/Status", "/Control/ControlData"] },
  tabs: {
    selected: 0,
    tabs: [
      {
        type: 1,
        title: "Status",
        controller: {
          leftSources: [],
          rightSources: [],
          discreteSources: [],
          leftLockedRange: null,
          rightLockedRange: null,
          leftUnitConversion: { autoTarget: null, preset: null },
          rightUnitConversion: { autoTarget: null, preset: null },
          leftFilter: 0,
          rightFilter: 0
        },
        controllerUUID: "0",
        renderer: null,
        controlsHeight: 200
      },
      {
        type: 5,
        title: "Console",
        controller: null,
        controllerUUID: "1",
        renderer: { highlight: false },
        controlsHeight: 0
      },
      {
        type: 8,
        title: "Joysticks",
        controller: ["None", "None", "None", "None", "None", "None"],
        controllerUUID: "2",
        renderer: null,
        controlsHeight: 85
      }
    ]
  }
};

export default DEFAULT_DS_LAYOUT;
