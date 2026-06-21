// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { Distribution, DISTRIBUTION } from "./buildConstants";

enum TabType {
  Documentation,
  LineGraph,
  Field2d,
  Field3d,
  Table,
  Console,
  Statistics,
  Video,
  Joysticks,
  Swerve,
  Mechanism,
  Points,
  Metadata
}

export default TabType;

export function getAllTabTypes(): TabType[] {
  return Object.values(TabType).filter((tabType) => typeof tabType === "number") as TabType[];
}

export const LITE_COMPATIBLE_TABS =
  DISTRIBUTION === Distribution.Lite
    ? [
        TabType.Documentation,
        TabType.LineGraph,
        TabType.Field2d,
        TabType.Field3d,
        TabType.Table,
        TabType.Console,
        TabType.Statistics,
        TabType.Joysticks,
        TabType.Swerve,
        TabType.Mechanism,
        TabType.Points,
        TabType.Metadata
      ]
    : // Lite DS
      [TabType.LineGraph, TabType.Table, TabType.Console, TabType.Statistics, TabType.Joysticks];

export function getDefaultTabTitle(type: TabType): string {
  switch (type) {
    case TabType.Documentation:
      return "";
    case TabType.LineGraph:
      return t("tabs.lineGraph");
    case TabType.Field2d:
      return t("tabs.field2d");
    case TabType.Field3d:
      return t("tabs.field3d");
    case TabType.Table:
      return t("tabs.table");
    case TabType.Console:
      return t("tabs.console");
    case TabType.Statistics:
      return t("tabs.statistics");
    case TabType.Video:
      return t("tabs.video");
    case TabType.Joysticks:
      return t("tabs.joysticks");
    case TabType.Swerve:
      return t("tabs.swerve");
    case TabType.Mechanism:
      return t("tabs.mechanism");
    case TabType.Points:
      return t("tabs.points");
    case TabType.Metadata:
      return t("tabs.metadata");
    default:
      return "";
  }
}

export function getTabIcon(type: TabType): string {
  switch (type) {
    case TabType.Documentation:
      return "📖";
    case TabType.LineGraph:
      return "📉";
    case TabType.Field2d:
      return "🗺";
    case TabType.Field3d:
      return "👀";
    case TabType.Table:
      return "🔢";
    case TabType.Console:
      return "💬";
    case TabType.Statistics:
      return "📊";
    case TabType.Video:
      return "🎬";
    case TabType.Joysticks:
      return "🎮";
    case TabType.Swerve:
      return "🦀";
    case TabType.Mechanism:
      return "⚙️";
    case TabType.Points:
      return "📍";
    case TabType.Metadata:
      return "🔍";
    default:
      return "";
  }
}

export function getTabAccelerator(type: TabType): string {
  if (type === TabType.Documentation) return "";
  return (
    "Alt+" +
    (() => {
      switch (type) {
        case TabType.LineGraph:
          return "G";
        case TabType.Field2d:
          return "2";
        case TabType.Field3d:
          return "3";
        case TabType.Table:
          return "T";
        case TabType.Console:
          return "C";
        case TabType.Statistics:
          return "S";
        case TabType.Video:
          return "V";
        case TabType.Joysticks:
          return "J";
        case TabType.Swerve:
          return "D";
        case TabType.Mechanism:
          return "M";
        case TabType.Points:
          return "P";
        case TabType.Metadata:
          return "I";
        default:
          return "";
      }
    })()
  );
}
