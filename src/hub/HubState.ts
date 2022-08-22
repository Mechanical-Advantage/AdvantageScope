import TabType from "../lib/TabType";

export interface HubState {
  sidebar: SidebarState;
  tabs: TabGroupState;
}

export interface SidebarState {
  width: number;
  expanded: string[];
}

export interface TabGroupState {
  selected: number;
  tabs: TabState[];
}

export interface TabState {
  type: TabType;
}

export interface MetadataState extends TabState {
  type: TabType.Metadata;
}

export interface LineGraphState {
  type: TabType.LineGraph;
  range: [number, number];
  legends: {
    left: {
      lockedRange: [number, number] | null;
      fields: [
        {
          displayKey: string;
          color: string;
          show: boolean;
        }
      ];
    };
    discrete: {
      fields: [
        {
          displayKey: string;
          color: string;
          show: boolean;
        }
      ];
    };
    right: {
      lockedRange: [number, number] | null;
      fields: [
        {
          displayKey: string;
          color: string;
          show: boolean;
        }
      ];
    };
  };
}

export interface TableState {
  name: TabType.Table;
  fields: string[];
}

export interface OdometryState {
  name: TabType.Odometry;
  fields: {
    robotPose: string | null;
    ghostPose: string | null;
    visionCoordinates: string | null;
  };
  options: {
    game: string;
    unitDistance: "meters" | "inches";
    unitRotation: "radians" | "degrees";
    origin: "right" | "center" | "left";
    size: number;
    alliance: "red" | "blue";
    orientation: "red, blue" | "blue, red";
  };
}

export interface PointsState {
  name: TabType.Points;
  fields: {
    x: string | null;
    y: string | null;
  };
  options: {
    width: number;
    height: number;
    group: number;
    pointShape: "plus" | "cross" | "circle";
    pointSize: "large" | "medium" | "small";
  };
}
