// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import LineGraphFilter from "../../shared/LineGraphFilter";
import { SourceListItemState } from "../../shared/SourceListConfig";

const PREFIX = "DS:/Dscomm/";

export const DriverStationController_ConsoleKey = PREFIX + "Console";

function numeric(key: string, color: string, type = "smooth", size = "bold"): SourceListItemState {
  return {
    type: type,
    logKey: PREFIX + key,
    logType: "Number",
    visible: true,
    options: { color: color, size: size }
  };
}

function stripes(key: string, color: string, logType = "Boolean"): SourceListItemState {
  return {
    type: "stripes",
    logKey: PREFIX + key,
    logType: logType,
    visible: true,
    options: { color: color }
  };
}

function graph(left: SourceListItemState[], right: SourceListItemState[], discrete: SourceListItemState[]) {
  return {
    leftSources: left,
    rightSources: right,
    discreteSources: discrete,
    leftLockedRange: null,
    rightLockedRange: null,
    leftUnitConversion: { autoTarget: null, preset: null },
    rightUnitConversion: { autoTarget: null, preset: null },
    leftFilter: LineGraphFilter.None,
    rightFilter: LineGraphFilter.None,
    showRobotMode: true
  };
}

/** The robot status is displayed on all of the default graphs. */
const STATUS_WORD = stripes("Status/Robot/StatusWord", "#af2437", "Number");

/** The state of a new graph added by the user. */
export const DriverStationController_EmptyGraph = graph([], [], []);

/** The graphs that are always available, with their default line graph states. */
export const DriverStationController_DefaultGraphs: { id: string; title: string; state: unknown }[] = [
  {
    id: "power",
    title: "Power",
    state: graph(
      [numeric("Status/Power/Battery", "#e5b31b", "smooth", "normal")],
      [numeric("Status/DriverStation/DsBattery", "#80588e", "stepped", "normal")],
      [STATUS_WORD]
    )
  },
  {
    id: "comms",
    title: "Comms",
    state: graph(
      [
        numeric("Status/Timing/DirectRtt", "#3b875a"),
        numeric("Status/Timing/Rtt", "#2b66a2"),
        numeric("Status/Timing/AveragePacketTime", "#80588e")
      ],
      [numeric("Status/Timing/LostPackets", "#5f4528", "stepped", "normal")],
      [stripes("Status/DriverStation/RobotState", "#858584", "Number"), STATUS_WORD]
    )
  },
  {
    id: "load",
    title: "Load",
    state: graph(
      [
        numeric("Status/Resources/CanBusUtilizations/0", "#3b875a"),
        numeric("Status/Resources/CanBusUtilizations/1", "#e5b31b"),
        numeric("Status/Resources/CanBusUtilizations/2", "#af2437"),
        numeric("Status/Resources/CanBusUtilizations/3", "#80588e"),
        numeric("Status/Resources/CanBusUtilizations/4", "#e48b32")
      ],
      [numeric("Status/Resources/CPU", "#c0b487"), numeric("Status/DriverStation/DsCpuUtilization", "#858584")],
      [STATUS_WORD]
    )
  }
];
