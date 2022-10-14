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

export function getAllTabTypes(): TabType[] {
  return Object.values(TabType).filter((tabType) => typeof tabType == "number") as TabType[];
}

export function getTabTitle(type: TabType): string {
  switch (type) {
    case TabType.Metadata:
      return "🔍";
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
    case TabType.Points:
      return "🔵 Points";
    case TabType.Joysticks:
      return "🎮 Joysticks";
    case TabType.Swerve:
      return "🛞 Swerve";
    default:
      return "";
  }
}
