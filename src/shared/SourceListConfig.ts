import { GraphColors, NeonColors } from "./Colors";

export type SourceListConfig = {
  title: string;
  autoAdvance: boolean | string; // True advances type, string advances option
  types: SourceListTypeConfig[];
};

export type SourceListTypeConfig = {
  key: string;
  display: string;
  symbol: string;
  showInTypeName: boolean;
  color: string; // Option key or hex (starting with #)
  darkColor?: string;
  sourceTypes: string[];
  parentKey?: string; // Identifies parents with shared children types
  childOf?: string; // Parent key this child is attached to

  // If only one option, show without submenu
  options: SourceListOptionConfig[];
  initialSelectionOption?: string;
};

export type SourceListOptionConfig = {
  key: string;
  display: string;
  showInTypeName: boolean;
  values: SourceListOptionValueConfig[];
};

export type SourceListOptionValueConfig = {
  key: string;
  display: string;
};

export type SourceListState = SourceListItemState[];

export type SourceListItemState = {
  type: string;
  logKey: string;
  logType: string;
  visible: boolean;
  options: { [key: string]: string };
};

export const OdometryConfig: SourceListConfig = {
  title: "Poses",
  autoAdvance: true,
  types: [
    {
      key: "robot",
      display: "Robot",
      symbol: "location.fill",
      showInTypeName: false,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["NumberArray", "Pose2d", "Pose2d[]", "Transform2d", "Transform2d[]"],
      options: [
        {
          key: "model",
          display: "Model",
          showInTypeName: true,
          values: [
            { key: "Presto", display: "Presto" },
            { key: "KitBot", display: "KitBot" }
          ]
        }
      ],
      initialSelectionOption: "model",
      parentKey: "robot"
    },
    {
      key: "ghost",
      display: "Ghost",
      symbol: "location.fill.viewfinder",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["NumberArray", "Pose2d", "Pose2d[]", "Transform2d", "Transform2d[]", "ZebraTranslation"],
      options: [
        {
          key: "model",
          display: "Model",
          showInTypeName: true,
          values: [
            { key: "Presto", display: "Presto" },
            { key: "KitBot", display: "KitBot" }
          ]
        },
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors
        }
      ],
      initialSelectionOption: "model",
      parentKey: "robot"
    },
    {
      key: "component",
      display: "Component",
      symbol: "puzzlepiece.extension.fill",
      showInTypeName: true,
      color: "#888888",
      sourceTypes: ["NumberArray", "Pose3d", "Pose3d[]", "Transform3d", "Transform3d[]"],
      options: [],
      childOf: "robot"
    },
    {
      key: "camera",
      display: "Camera",
      symbol: "camera.fill",
      showInTypeName: true,
      color: "#888888",
      sourceTypes: ["NumberArray", "Pose3d", "Transform3d"],
      options: [],
      childOf: "robot"
    },
    {
      key: "vision",
      display: "Vision Target",
      symbol: "scope",
      showInTypeName: true,
      color: "#00bb00",
      sourceTypes: [
        "NumberArray",
        "Pose2d",
        "Pose2d[]",
        "Transform2d",
        "Transform2d[]",
        "Translation2d",
        "Translation2d[]"
      ],
      options: []
    },
    {
      key: "trajectory",
      display: "Trajectory",
      symbol: "point.bottomleft.forward.to.point.topright.scurvepath.fill",
      showInTypeName: true,
      color: "#ff8800",
      sourceTypes: ["NumberArray", "Pose2d[]", "Transform2d[]", "Translation2d[]", "Trajectory"],
      options: []
    },
    {
      key: "heatmap",
      display: "Heatmap",
      symbol: "map.fill",
      showInTypeName: true,
      color: "#ff0000",
      sourceTypes: [
        "NumberArray",
        "Pose2d",
        "Pose2d[]",
        "Transform2d",
        "Transform2d[]",
        "Translation2d",
        "Translation2d[]"
      ],
      options: [
        {
          key: "samples",
          display: "Samples",
          showInTypeName: false,
          values: [
            { key: "enabled", display: "Enabled Only" },
            { key: "full", display: "Full Log" }
          ]
        }
      ]
    },
    {
      key: "arrow",
      display: "Arrow",
      symbol: "arrow.up.circle",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["NumberArray", "Pose2d", "Pose2d[]", "Transform2d", "Transform2d[]"],
      options: [
        {
          key: "position",
          display: "Position",
          showInTypeName: false,
          values: [
            { key: "center", display: "Center" },
            { key: "back", display: "Back" },
            { key: "front", display: "Front" }
          ]
        }
      ]
    },
    {
      key: "zebra",
      display: "Zebra Marker",
      symbol: "mappin.circle.fill",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["ZebraTranslation"],
      options: []
    }
  ]
};
