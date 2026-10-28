// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { Distribution, DISTRIBUTION } from "../../shared/buildConstants";
import { HubState } from "../../shared/HubState";
import TabType from "../../shared/TabType";

const DEFAULT_DS_LAYOUT: HubState = {
  sidebar: { width: 300, expanded: ["/Control", "/Status"] },
  tabs: {
    selected: DISTRIBUTION !== Distribution.LiteDS ? 1 : 0,
    tabs: [
      ...(DISTRIBUTION !== Distribution.LiteDS
        ? [
            {
              type: TabType.Documentation,
              title: "",
              controller: null,
              controllerUUID: "0",
              renderer: "",
              controlsHeight: 0
            }
          ]
        : []),
      {
        type: TabType.Console,
        title: "",
        controller: "DS:/Dscomm/Console",
        controllerUUID: "1",
        renderer: { highlight: true },
        controlsHeight: 0
      },
      {
        type: TabType.LineGraph,
        title: "Communication",
        controller: {
          leftSources: [
            {
              type: "stepped",
              logKey: "DS:/Dscomm/Status/Timing/Rtt",
              logType: "Number",
              visible: true,
              options: { color: "#3b875a", size: "normal" }
            }
          ],
          rightSources: [
            {
              type: "stepped",
              logKey: "DS:/Dscomm/Status/Timing/LostPackets",
              logType: "Number",
              visible: true,
              options: { color: "#e5b31b", size: "normal" }
            }
          ],
          discreteSources: [
            {
              type: "stripes",
              logKey: "DS:/Dscomm/Status/Connection/HasTcpConn",
              logType: "Boolean",
              visible: true,
              options: { color: "#2b66a2" }
            },
            {
              type: "stripes",
              logKey: "DS:/Dscomm/Status/Robot/HasUserCode",
              logType: "Boolean",
              visible: true,
              options: { color: "#80588e" }
            },
            {
              type: "stripes",
              logKey: "DS:/Dscomm/Status/Robot/HasUserCodeReady",
              logType: "Boolean",
              visible: true,
              options: { color: "#e48b32" }
            }
          ],
          leftLockedRange: null,
          rightLockedRange: null,
          leftUnitConversion: { autoTarget: null, preset: null },
          rightUnitConversion: { autoTarget: null, preset: null },
          leftFilter: 0,
          rightFilter: 0,
          showRobotMode: true
        },
        controllerUUID: "2",
        renderer: null,
        controlsHeight: 200
      },
      {
        type: TabType.LineGraph,
        title: "Power",
        controller: {
          leftSources: [
            {
              type: "stepped",
              logKey: "DS:/Dscomm/Status/Power/Battery",
              logType: "Number",
              visible: true,
              options: { color: "#e5b31b", size: "normal" }
            }
          ],
          rightSources: [],
          discreteSources: [],
          leftLockedRange: null,
          rightLockedRange: null,
          leftUnitConversion: { autoTarget: null, preset: null },
          rightUnitConversion: { autoTarget: null, preset: null },
          leftFilter: 0,
          rightFilter: 0,
          showRobotMode: true
        },
        controllerUUID: "3",
        renderer: null,
        controlsHeight: 200
      },
      {
        type: TabType.LineGraph,
        title: "CPU",
        controller: {
          leftSources: [
            {
              type: "stepped",
              logKey: "DS:/Dscomm/Status/Resources/CPU",
              logType: "Number",
              visible: true,
              options: { color: "#af2437", size: "bold" }
            },
            {
              type: "stepped",
              logKey: "DS:/Dscomm/Status/DriverStation/DsCpuUtilization",
              logType: "Number",
              visible: true,
              options: { color: "#80588e", size: "normal" }
            }
          ],
          rightSources: [],
          discreteSources: [],
          leftLockedRange: null,
          rightLockedRange: null,
          leftUnitConversion: { autoTarget: null, preset: null },
          rightUnitConversion: { autoTarget: null, preset: null },
          leftFilter: 0,
          rightFilter: 0,
          showRobotMode: true
        },
        controllerUUID: "4",
        renderer: null,
        controlsHeight: 200
      },
      {
        type: TabType.Joysticks,
        title: "",
        controller: ["Generic Joystick", "None", "None", "None", "None", "None"],
        controllerUUID: "5",
        renderer: null,
        controlsHeight: 85
      }
    ]
  }
};

export default DEFAULT_DS_LAYOUT;
