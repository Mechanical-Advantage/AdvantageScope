enum TabType {
  Documentation,
  LineGraph,
  Table,
  Console,
  Statistics,
  Odometry,
  ThreeDimension,
  Video,
  Joysticks,
  Swerve,
  Points,
  Metadata
}

export default TabType;

export const TIMELINE_VIZ_TYPES: TabType[] = [
  TabType.Odometry,
  TabType.ThreeDimension,
  TabType.Video,
  TabType.Points,
  TabType.Joysticks,
  TabType.Swerve
];

export function getAllTabTypes(): TabType[] {
  return Object.values(TabType).filter((tabType) => typeof tabType == "number") as TabType[];
}

export function getDefaultTabTitle(type: TabType): string {
  switch (type) {
    case TabType.Documentation:
      return "";
    case TabType.LineGraph:
      return "Line Graph";
    case TabType.Table:
      return "Table";
    case TabType.Console:
      return "Console";
    case TabType.Statistics:
      return "Statistics";
    case TabType.Odometry:
      return "Odometry";
    case TabType.ThreeDimension:
      return "3D Field";
    case TabType.Video:
      return "Video";
    case TabType.Joysticks:
      return "Joysticks";
    case TabType.Swerve:
      return "Swerve";
    case TabType.Points:
      return "Points";
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
    case TabType.Table:
      return "🔢";
    case TabType.Console:
      return "💬";
    case TabType.Statistics:
      return "📊";
    case TabType.Odometry:
      return "🗺";
    case TabType.ThreeDimension:
      return "👀";
    case TabType.Video:
      return "🎬";
    case TabType.Joysticks:
      return "🎮";
    case TabType.Swerve:
      return "🦀";
    case TabType.Points:
      return "🔵";
    case TabType.Metadata:
      return "🔍";
    default:
      return "";
  }
}