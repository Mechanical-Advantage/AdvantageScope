export type SourceListConfig = {
  title: string;
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
  parentType?: string;

  // If only one option, show without submenu
  options: SourceListOptionConfig[];
  initialSelectionOption?: string;
};

export type SourceListOptionConfig = {
  key: string;
  display: string;
  showInTypeName: boolean;
  values: {
    key: string;
    display: string;
  }[];
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
      initialSelectionOption: "model"
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
          values: [
            { key: "#ff0000", display: "Red" },
            { key: "#00ff00", display: "Green" },
            { key: "#0000ff", display: "Blue" },
            { key: "#ffff00", display: "Yellow" },
            { key: "#ff00ff", display: "Magenta" },
            { key: "#00ffff", display: "Cyan" }
          ]
        }
      ],
      initialSelectionOption: "model"
    },
    {
      key: "component",
      display: "Component",
      symbol: "puzzlepiece.extension.fill",
      showInTypeName: true,
      color: "#888888",
      sourceTypes: ["NumberArray", "Pose2d", "Pose2d[]", "Transform2d", "Transform2d[]"],
      options: [],
      parentType: "robot"
    },
    {
      key: "camera",
      display: "Camera",
      symbol: "camera.fill",
      showInTypeName: true,
      color: "#888888",
      sourceTypes: ["NumberArray", "Pose2d", "Transform2d"],
      options: [],
      parentType: "robot"
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

// const LineGraphConfig: SourceListConfig = {
//   name: "Left Axis",
//   types: [
//     {
//       key: "stepped",
//       display: "Stepped",
//       symbol: "circle.fill",
//       showInTypeName: false,
//       color: "color",
//       options: [
//         {
//           key: "color",
//           display: "Color",
//           showInTypeName: false,
//           values: [
//             { key: "#ff0000", display: "Red" },
//             { key: "#00ff00", display: "Green" },
//             { key: "#0000ff", display: "Blue" }
//           ]
//         },
//         {
//           key: "thickness",
//           display: "Thickness",
//           showInTypeName: false,
//           values: [
//             { key: "normal", display: "Normal" },
//             { key: "bold", display: "Bold" },
//             { key: "verybold", display: "Very Bold" }
//           ]
//         }
//       ]
//     },
//     {
//       key: "smooth",
//       display: "Smooth",
//       symbol: "circle.circle.fill",
//       showInTypeName: false,
//       color: "color",
//       options: [
//         {
//           key: "color",
//           display: "Color",
//           showInTypeName: false,
//           values: [
//             { key: "#ff0000", display: "Red" },
//             { key: "#00ff00", display: "Green" },
//             { key: "#0000ff", display: "Blue" }
//           ]
//         },
//         {
//           key: "thickness",
//           display: "Thickness",
//           showInTypeName: false,
//           values: [
//             { key: "normal", display: "Normal" },
//             { key: "bold", display: "Bold" },
//             { key: "verybold", display: "Very Bold" }
//           ]
//         }
//       ]
//     },
//     {
//       key: "points",
//       display: "Points",
//       symbol: "circle.dotted.circle.fill",
//       showInTypeName: false,
//       color: "color",
//       options: [
//         {
//           key: "color",
//           display: "Color",
//           showInTypeName: false,
//           values: [
//             { key: "#ff0000", display: "Red" },
//             { key: "#00ff00", display: "Green" },
//             { key: "#0000ff", display: "Blue" }
//           ]
//         },
//         {
//           key: "size",
//           display: "Size",
//           showInTypeName: false,
//           values: [
//             { key: "normal", display: "Normal" },
//             { key: "large", display: "Large" }
//           ]
//         }
//       ]
//     }
//   ]
// };
