enum TabType {
  Metadata,
  LineGraph,
  Table,
  Console,
  Statistics,
  Odometry,
  ThreeDimension,
  Video,
  Points,
  Joysticks,
  Swerve
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
    case TabType.Metadata:
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
    case TabType.Points:
      return "Points";
    case TabType.Joysticks:
      return "Joysticks";
    case TabType.Swerve:
      return "Swerve";
    default:
      return "";
  }
}

export function getTabIcon(type: TabType): string {
  switch (type) {
    case TabType.Metadata:
      return "🔍";
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
    case TabType.Points:
      return "🔵";
    case TabType.Joysticks:
      return "🎮";
    case TabType.Swerve:
      return "🦀";
    default:
      return "";
  }
}
