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

export function getAllTabTypes(): TabType[] {
  return Object.values(TabType).filter((tabType) => typeof tabType == "number") as TabType[];
}

export function getTabTitle(type: TabType): string {
  switch (type) {
    case TabType.Documentation:
      return "📖";
    case TabType.LineGraph:
      return "📉 Line Graph";
    case TabType.Table:
      return "🔢 Table";
    case TabType.Console:
      return "💬 Console";
    case TabType.Statistics:
      return "📊 Statistics";
    case TabType.Odometry:
      return "🗺 Odometry";
    case TabType.ThreeDimension:
      return "👀 3D Field";
    case TabType.Video:
      return "🎬 Video";
    case TabType.Joysticks:
      return "🎮 Joysticks";
    case TabType.Swerve:
      return "🦀 Swerve";
    case TabType.Points:
      return "🔵 Points";
    case TabType.Metadata:
      return "🔍 Metadata";
    default:
      return "";
  }
}
