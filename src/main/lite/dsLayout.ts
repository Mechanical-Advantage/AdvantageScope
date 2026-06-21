// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { HubState } from "../../shared/HubState";

export function getDefaultDsLayout(): HubState {
  return {
    sidebar: { width: 300, expanded: ["/Control", "/Status"] },
    tabs: {
      selected: 0,
      tabs: [
        {
          type: 5,
          title: "",
          controller: "DS:/Dscomm/Console",
          controllerUUID: "0",
          renderer: { highlight: true },
          controlsHeight: 0
        },
        {
          type: 1,
          title: t("tabs.communication"),
          controller: {
            leftSources: [
              {
                type: "stepped",
                logKey: "DS:/Dscomm/Status/Rtt",
                logType: "Number",
                visible: true,
                options: { color: "#3b875a", size: "normal" }
              }
            ],
            rightSources: [
              {
                type: "stepped",
                logKey: "DS:/Dscomm/Status/LostPackets",
                logType: "Number",
                visible: true,
                options: { color: "#e5b31b", size: "normal" }
              }
            ],
            discreteSources: [
              {
                type: "stripes",
                logKey: "DS:/Dscomm/Status/HasTcpConn",
                logType: "Boolean",
                visible: true,
                options: { color: "#2b66a2" }
              },
              {
                type: "stripes",
                logKey: "DS:/Dscomm/Status/HasUserCode",
                logType: "Boolean",
                visible: true,
                options: { color: "#80588e" }
              },
              {
                type: "stripes",
                logKey: "DS:/Dscomm/Status/HasUserCodeReady",
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
          controllerUUID: "1",
          renderer: null,
          controlsHeight: 200
        },
        {
          type: 1,
          title: t("tabs.power"),
          controller: {
            leftSources: [
              {
                type: "stepped",
                logKey: "DS:/Dscomm/Status/Battery",
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
          controllerUUID: "2",
          renderer: null,
          controlsHeight: 200
        },
        {
          type: 1,
          title: t("tabs.cpu"),
          controller: {
            leftSources: [
              {
                type: "stepped",
                logKey: "DS:/Dscomm/Status/CPU",
                logType: "Number",
                visible: true,
                options: { color: "#af2437", size: "bold" }
              },
              {
                type: "stepped",
                logKey: "DS:/Dscomm/Status/DsCpuUtilization",
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
          controllerUUID: "3",
          renderer: null,
          controlsHeight: 200
        },
        {
          type: 8,
          title: t("tabs.joysticks"),
          controller: ["Generic Joystick", "None", "None", "None", "None", "None"],
          controllerUUID: "4",
          renderer: null,
          controlsHeight: 85
        }
      ]
    }
  };
}
