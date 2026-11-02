// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import TabType from "../shared/TabType";
import { canonicalChannelPath } from "../shared/display/ChannelProfile";

type PendingAxis = {
  uuid: string;
  axis: "leftSources" | "rightSources";
  expected: string;
  missing: { pattern: RegExp; color: string }[];
};
let pending: PendingAxis[] = [];
const patterns = [
  /(?:vehicle_speed|ecu_vehiclespeed)$/,
  /(?:motor_speed|inv_motorspeed|ecu_motorrpm|inv_motorrpm)$/,
  /(?:torque_command|inv_torquecommand)$/,
  /(?:torque_feedback|inv_torquefeedback)$/
];
const source = (path: string | undefined, color: string) =>
  path ? [{ type: "stepped", logKey: path, logType: "Number", visible: true, options: { color, size: "normal" } }] : [];
const match = (paths: string[], pattern: RegExp) =>
  paths.find((path) => pattern.test(canonicalChannelPath(path).toLowerCase()));

/** Retry only unresolved preset fields, and abandon an axis as soon as the user changes it. */
export function updateTracksideLayout() {
  if (!pending.length) return;
  const paths = window.log.getFieldKeys();
  const state = window.tabs.saveState();
  let changed = false;
  pending = pending.filter((entry) => {
    const tab = state.tabs.find((tab) => tab.controllerUUID === entry.uuid);
    if (!tab || tab.type !== TabType.LineGraph) return false;
    const controller = tab.controller as Record<string, unknown>;
    if (JSON.stringify(controller[entry.axis]) !== entry.expected) return false;
    entry.missing = entry.missing.filter(({ pattern, color }) => {
      const path = match(paths, pattern);
      if (!path) return true;
      controller[entry.axis] = [...(controller[entry.axis] as unknown[]), ...source(path, color)];
      changed = true;
      return false;
    });
    entry.expected = JSON.stringify(controller[entry.axis]);
    return entry.missing.length > 0;
  });
  if (changed) window.tabs.restoreState(state);
}

/** Apply only through public tab state and selection APIs; preserve the user's other tabs. */
export function applyTracksideLayout() {
  const paths = window.log.getFieldKeys();
  pending = [];
  const [speed, rpm, command, actual] = patterns.map((pattern) => match(paths, pattern));
  const add = (title: string, left: unknown[], right: unknown[], rpmAxis = false, roles: number[][] = []) => {
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
    roles.forEach((indices, i) => {
      const axis = i === 0 ? "leftSources" : "rightSources";
      const missing = indices
        .filter((role) => !match(paths, patterns[role]))
        .map((role) => ({
          pattern: patterns[role],
          color: role % 2 === 0 ? "#ee9d5b" : "#7db4e8"
        }));
      if (missing.length)
        pending.push({
          uuid: tab.controllerUUID,
          axis,
          expected: JSON.stringify((tab.controller as Record<string, unknown>)[axis]),
          missing
        });
    });
    state.selected = index;
    window.tabs.restoreState(state);
    return index;
  };
  const main = add("Trackside · Speed / RPM", source(speed, "#ee9d5b"), source(rpm, "#7db4e8"), true, [[0], [1]]);
  add("Trackside · Torque", [...source(command, "#ee9d5b"), ...source(actual, "#7db4e8")], [], false, [[2, 3]]);
  window.tabs.setSelected(main);
  window.healthStrip.state.visible = true;
  window.healthStrip.state.trackside = true;
  window.healthStrip.render();
  const end = window.selection.getCurrentLiveTime() ?? window.log.getTimestampRange()[1];
  window.selection.setTimelineRange([end - 30, end], false);
  window.selection.lock();
}
