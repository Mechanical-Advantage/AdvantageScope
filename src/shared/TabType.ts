// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

enum TabType {
  Documentation,
  LineGraph,
  Field2d,
  // 3 was 3D Field. This value stays reserved for saved layouts.
  Table = 4,
  Console,
  Statistics,
  Video,
  // 8-10 were Joysticks, Swerve and Mechanism (removed); values kept stable for saved layouts
  Points = 11,
  Metadata = 12,
  TrackMap = 13,
  Laps = 14
  // 20-22 were Raw Messages, Log and Image. These values stay reserved for saved layouts.
}

export default TabType;

export function getAllTabTypes(): TabType[] {
  return Object.values(TabType).filter((tabType) => typeof tabType === "number") as TabType[];
}

export const LITE_COMPATIBLE_TABS = [
  TabType.Documentation,
  TabType.LineGraph,
  TabType.Field2d,
  TabType.Table,
  TabType.Console,
  TabType.Statistics,
  TabType.Points,
  TabType.Metadata,
  TabType.TrackMap,
  TabType.Laps
];

export function getDefaultTabTitle(type: TabType): string {
  switch (type) {
    case TabType.Documentation:
      return "";
    case TabType.LineGraph:
      return "Line Graph";
    case TabType.Field2d:
      return "2D Field";
    case TabType.Table:
      return "Table";
    case TabType.Console:
      return "Console";
    case TabType.Statistics:
      return "Statistics";
    case TabType.Video:
      return "Video";
    case TabType.Points:
      return "Points";
    case TabType.TrackMap:
      return "Track Map";
    case TabType.Laps:
      return "Laps";
    case TabType.Metadata:
      return "Metadata";
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
    case TabType.Table:
      return "🔢";
    case TabType.Console:
      return "💬";
    case TabType.Statistics:
      return "📊";
    case TabType.Video:
      return "🎬";
    case TabType.Points:
      return "📍";
    case TabType.TrackMap:
      return "";
    case TabType.Laps:
      return "";
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
        case TabType.Table:
          return "T";
        case TabType.Console:
          return "C";
        case TabType.Statistics:
          return "S";
        case TabType.Video:
          return "V";
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
