export var defaultState: HubState = {
  selection: {
    selectedTime: null,
    playbackSpeed: 1
  },
  sidebar: {
    width: 300,
    expanded: []
  },
  tabController: {
    selected: null,
    tabs: []
  }
};

export interface HubState {
  selection: SelectionState;
  sidebar: SidebarState;
  tabController: TabControllerState;
}

export interface SelectionState {
  selectedTime: number | null;
  playbackSpeed: number;
}

export interface SidebarState {
  width: number;
  expanded: string[];
}

export interface TabControllerState {
  selected: number | null;
  tabs: (LineGraphState | TableState | OdometryState | PointsState)[];
}

export interface LineGraphState {
  name: "line-graph";
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
  name: "table";
  fields: string[];
}

export interface OdometryState {
  name: "odometry";
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
  name: "points";
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
