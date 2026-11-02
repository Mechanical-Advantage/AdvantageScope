// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import TabType from "../shared/TabType";
import { canonicalChannelPath } from "../shared/display/ChannelProfile";

/** Apply only through public tab state and selection APIs; preserve the user's other tabs. */
export function applyTracksideLayout() {
  const paths = window.log.getFieldKeys();
  const match = (pattern: RegExp) => paths.find((path) => pattern.test(canonicalChannelPath(path).toLowerCase()));
  const speed = match(/(?:vehicle_speed|ecu_vehiclespeed)$/);
  const rpm = match(/(?:motor_speed|inv_motorspeed|ecu_motorrpm|inv_motorrpm)$/);
  const command = match(/(?:torque_command|inv_torquecommand)$/);
  const actual = match(/(?:torque_feedback|inv_torquefeedback)$/);
  const source = (path: string | undefined, color: string) =>
    path
      ? [{ type: "stepped", logKey: path, logType: "Number", visible: true, options: { color, size: "normal" } }]
      : [];
  const add = (title: string, left: unknown[], right: unknown[], rpmAxis = false) => {
    let state = window.tabs.saveState();
    let index = state.tabs.findIndex((tab) => tab.title === title && tab.type === TabType.LineGraph);
    if (index < 0) {
      window.tabs.addTab(TabType.LineGraph);
      state = window.tabs.saveState();
      index = state.selected;
    }
    const tab = state.tabs[index];
    tab.title = title;
    tab.controller = {
      leftSources: left,
      rightSources: right,
      discreteSources: [],
      showRobotMode: false,
      rightUnitConversion: { autoTarget: rpmAxis ? "rotations/minute" : null, preset: null }
    };
    state.selected = index;
    window.tabs.restoreState(state);
    return index;
  };
  const main = add("Trackside · Speed / RPM", source(speed, "#ee9d5b"), source(rpm, "#7db4e8"), true);
  add("Trackside · Torque", [...source(command, "#ee9d5b"), ...source(actual, "#7db4e8")], []);
  window.tabs.setSelected(main);
  window.healthStrip.state.visible = true;
  window.healthStrip.state.trackside = true;
  window.healthStrip.render();
  const end = window.selection.getCurrentLiveTime() ?? window.log.getTimestampRange()[1];
  window.selection.setTimelineRange([end - 30, end], false);
  window.selection.lock();
}
