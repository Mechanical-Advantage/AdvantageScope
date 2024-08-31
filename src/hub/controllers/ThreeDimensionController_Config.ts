import { NeonColors, NeonColors_GreenFirst } from "../../shared/Colors";
import { SourceListConfig } from "../../shared/SourceListConfig";

const ThreeDimensionController_Config: SourceListConfig = {
  title: "Poses",
  autoAdvance: true,
  allowChildrenFromDrag: false,
  typeMemoryId: "threeDimension",
  types: [
    {
      key: "robot",
      display: "Robot",
      symbol: "location.fill",
      showInTypeName: false,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: [
        "Pose2d",
        "Pose3d",
        "Pose2d[]",
        "Pose3d[]",
        "Transform2d",
        "Transform3d",
        "Transform2d[]",
        "Transform3d[]",
        "ZebraTranslation"
      ],
      options: [
        {
          key: "model",
          display: "Model",
          showInTypeName: true,
          values: []
        }
      ],
      initialSelectionOption: "model",
      parentKey: "robot",
      geometryPreviewType: "Pose3d"
    },
    {
      key: "robotLegacy",
      display: "Robot",
      symbol: "location.fill",
      showInTypeName: false,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["NumberArray"],
      options: [
        {
          key: "model",
          display: "Model",
          showInTypeName: true,
          values: []
        },
        {
          key: "format",
          display: "Format",
          showInTypeName: false,
          values: [
            { key: "Pose2d", display: "2D Pose(s)" },
            { key: "Pose3d", display: "3D Pose(s)" },
            { key: "Translation2d", display: "2D Translation(s)" },
            { key: "Translation3d", display: "3D Translation(s)" }
          ]
        },
        {
          key: "units",
          display: "Rotation Units",
          showInTypeName: false,
          values: [
            { key: "radians", display: "Radians" },
            { key: "degrees", display: "Degrees" }
          ]
        }
      ],
      initialSelectionOption: "model",
      numberArrayDeprecated: true,
      parentKey: "robot",
      geometryPreviewType: "Pose3d"
    },
    {
      key: "ghost",
      display: "Ghost",
      symbol: "location.fill.viewfinder",
      showInTypeName: true,
      color: "color",
      sourceTypes: [
        "Pose2d",
        "Pose3d",
        "Pose2d[]",
        "Pose3d[]",
        "Transform2d",
        "Transform3d",
        "Transform2d[]",
        "Transform3d[]",
        "ZebraTranslation"
      ],
      options: [
        {
          key: "model",
          display: "Model",
          showInTypeName: true,
          values: []
        },
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors
        }
      ],
      initialSelectionOption: "model",
      parentKey: "robot",
      geometryPreviewType: "Pose3d"
    },
    {
      key: "ghostLegacy",
      display: "Ghost",
      symbol: "location.fill.viewfinder",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["NumberArray"],
      options: [
        {
          key: "model",
          display: "Model",
          showInTypeName: true,
          values: []
        },
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors
        },
        {
          key: "format",
          display: "Format",
          showInTypeName: false,
          values: [
            { key: "Pose2d", display: "2D Pose(s)" },
            { key: "Pose3d", display: "3D Pose(s)" },
            { key: "Translation2d", display: "2D Translation(s)" },
            { key: "Translation3d", display: "3D Translation(s)" }
          ]
        },
        {
          key: "units",
          display: "Rotation Units",
          showInTypeName: false,
          values: [
            { key: "radians", display: "Radians" },
            { key: "degrees", display: "Degrees" }
          ]
        }
      ],
      initialSelectionOption: "model",
      parentKey: "robot",
      numberArrayDeprecated: true,
      geometryPreviewType: "Pose3d"
    },
    {
      key: "component",
      display: "Component",
      symbol: "puzzlepiece.extension.fill",
      showInTypeName: true,
      color: "#9370db",
      sourceTypes: ["Pose3d", "Pose3d[]", "Transform3d", "Transform3d[]"],
      options: [],
      childOf: "robot",
      geometryPreviewType: "Pose3d"
    },
    {
      key: "componentLegacy",
      display: "Component",
      symbol: "puzzlepiece.extension.fill",
      showInTypeName: true,
      color: "#9370db",
      sourceTypes: ["NumberArray"],
      options: [],
      childOf: "robot",
      numberArrayDeprecated: true,
      geometryPreviewType: "Pose3d"
    },
    {
      key: "mechanism",
      display: "Mechanism",
      symbol: "gearshape.fill",
      showInTypeName: true,
      color: "#888888",
      sourceTypes: ["Mechanism2d"],
      options: [],
      childOf: "robot"
    },
    {
      key: "rotationOverride",
      display: "Rotation Override",
      symbol: "angle",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Rotation2d"],
      options: [],
      childOf: "robot",
      geometryPreviewType: "Rotation3d"
    },
    {
      key: "rotationOverrideLegacy",
      display: "Rotation Override",
      symbol: "angle",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Number"],
      options: [
        {
          key: "units",
          display: "Rotation Units",
          showInTypeName: false,
          values: [
            { key: "radians", display: "Radians" },
            { key: "degrees", display: "Degrees" }
          ]
        }
      ],
      childOf: "robot",
      geometryPreviewType: "Rotation2d"
    },
    {
      key: "vision",
      display: "Vision Target",
      symbol: "scope",
      showInTypeName: true,
      color: "color",
      sourceTypes: [
        "Pose2d",
        "Pose3d",
        "Pose2d[]",
        "Pose3d[]",
        "Transform2d",
        "Transform3d",
        "Transform2d[]",
        "Transform3d[]",
        "Translation2d",
        "Translation3d",
        "Translation2d[]",
        "Translation3d[]"
      ],
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors_GreenFirst
        }
      ],
      childOf: "robot",
      geometryPreviewType: "Translation3d"
    },
    {
      key: "visionLegacy",
      display: "Vision Target",
      symbol: "scope",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["NumberArray"],
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors_GreenFirst
        },
        {
          key: "format",
          display: "Format",
          showInTypeName: false,
          values: [
            { key: "Pose2d", display: "2D Pose(s)" },
            { key: "Pose3d", display: "3D Pose(s)" },
            { key: "Translation2d", display: "2D Translation(s)" },
            { key: "Translation3d", display: "3D Translation(s)" }
          ]
        }
      ],
      numberArrayDeprecated: true,
      childOf: "robot",
      geometryPreviewType: "Translation3d"
    },
    {
      key: "gamePiece",
      display: "Game Piece",
      symbol: "star.fill",
      showInTypeName: false,
      color: "#ffd700",
      sourceTypes: ["Pose3d", "Pose3d[]", "Transform3d", "Transform3d[]", "Translation3d", "Translation3d[]"],
      options: [
        {
          key: "variant",
          display: "Variant",
          showInTypeName: true,
          values: [
            { key: "Note", display: "Note" },
            { key: "High Note", display: "High Note" }
          ]
        }
      ],
      initialSelectionOption: "variant",
      geometryPreviewType: "Pose3d"
    },
    {
      key: "gamePieceLegacy",
      display: "Game Piece",
      symbol: "star.fill",
      showInTypeName: false,
      color: "#ffd700",
      sourceTypes: ["NumberArray"],
      options: [
        {
          key: "variant",
          display: "Variant",
          showInTypeName: true,
          values: [
            { key: "Note", display: "Note" },
            { key: "High Note", display: "High Note" }
          ]
        },
        {
          key: "format",
          display: "Format",
          showInTypeName: false,
          values: [
            { key: "Pose3d", display: "3D Pose(s)" },
            { key: "Translation3d", display: "3D Translation(s)" }
          ]
        }
      ],
      initialSelectionOption: "variant",
      numberArrayDeprecated: true,
      geometryPreviewType: "Pose3d"
    },
    {
      key: "trajectory",
      display: "Trajectory",
      symbol: "point.bottomleft.forward.to.point.topright.scurvepath.fill",
      showInTypeName: true,
      color: "#ff8800",
      sourceTypes: [
        "Pose2d[]",
        "Pose3d[]",
        "Transform2d[]",
        "Transform3d[]",
        "Translation2d[]",
        "Translation3d[]",
        "Trajectory"
      ],
      options: [],
      geometryPreviewType: "Translation3d"
    },
    {
      key: "trajectoryLegacy",
      display: "Trajectory",
      symbol: "point.bottomleft.forward.to.point.topright.scurvepath.fill",
      showInTypeName: true,
      color: "#ff8800",
      sourceTypes: ["NumberArray"],
      options: [
        {
          key: "format",
          display: "Format",
          showInTypeName: false,
          values: [
            { key: "Pose2d", display: "2D Pose(s)" },
            { key: "Pose3d", display: "3D Pose(s)" },
            { key: "Translation2d", display: "2D Translation(s)" },
            { key: "Translation3d", display: "3D Translation(s)" }
          ]
        }
      ],
      numberArrayDeprecated: true,
      geometryPreviewType: "Translation3d"
    },
    {
      key: "heatmap",
      display: "Heatmap",
      symbol: "map.fill",
      showInTypeName: true,
      color: "#ff0000",
      sourceTypes: [
        "Pose2d",
        "Pose3d",
        "Pose2d[]",
        "Pose3d[]",
        "Transform2d",
        "Transform3d",
        "Transform2d[]",
        "Transform3d[]",
        "Translation2d",
        "Translation3d",
        "Translation2d[]",
        "Translation3d[]",
        "ZebraTranslation"
      ],
      options: [
        {
          key: "filter",
          display: "Filter",
          showInTypeName: false,
          values: [
            { key: "enabled", display: "Enabled" },
            { key: "auto", display: "Auto" },
            { key: "teleop", display: "Teleop" },
            { key: "teleop-no-endgame", display: "Teleop (No Endgame)" },
            { key: "full", display: "No Filter" }
          ]
        }
      ],
      initialSelectionOption: "filter",
      geometryPreviewType: null
    },
    {
      key: "heatmapLegacy",
      display: "Heatmap",
      symbol: "map.fill",
      showInTypeName: true,
      color: "#ff0000",
      sourceTypes: ["NumberArray"],
      options: [
        {
          key: "filter",
          display: "Filter",
          showInTypeName: false,
          values: [
            { key: "enabled", display: "Enabled" },
            { key: "auto", display: "Auto" },
            { key: "teleop", display: "Teleop" },
            { key: "teleop-no-endgame", display: "Teleop (No Endgame)" },
            { key: "full", display: "Full Log" }
          ]
        },
        {
          key: "format",
          display: "Format",
          showInTypeName: false,
          values: [
            { key: "Pose2d", display: "2D Pose(s)" },
            { key: "Pose3d", display: "3D Pose(s)" },
            { key: "Translation2d", display: "2D Translation(s)" },
            { key: "Translation3d", display: "3D Translation(s)" }
          ]
        }
      ],
      initialSelectionOption: "filter",
      numberArrayDeprecated: true,
      geometryPreviewType: null
    },
    {
      key: "aprilTag",
      display: "AprilTag",
      symbol: "qrcode",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Pose3d", "Pose3d[]", "Transform3d", "Transform3d[]", "Trajectory"],
      options: [
        {
          key: "family",
          display: "Family",
          showInTypeName: true,
          values: [
            { key: "36h11", display: "36h11" },
            { key: "16h5", display: "16h5" }
          ]
        }
      ],
      parentKey: "aprilTag",
      initialSelectionOption: "family",
      geometryPreviewType: "Pose3d"
    },
    {
      key: "aprilTagLegacy",
      display: "AprilTag",
      symbol: "qrcode",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["NumberArray"],
      options: [
        {
          key: "family",
          display: "Family",
          showInTypeName: true,
          values: [
            { key: "36h11", display: "36h11" },
            { key: "16h5", display: "16h5" }
          ]
        }
      ],
      numberArrayDeprecated: true,
      parentKey: "aprilTag",
      initialSelectionOption: "family",
      geometryPreviewType: "Pose3d"
    },
    {
      key: "aprilTagIDs",
      display: "AprilTag IDs",
      symbol: "number",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["NumberArray"],
      options: [],
      childOf: "aprilTag",
      geometryPreviewType: null
    },
    {
      key: "axes",
      display: "Axes",
      symbol: "move.3d",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Pose3d", "Pose3d[]", "Transform3d", "Transform3d[]", "Trajectory"],
      options: [],
      geometryPreviewType: "Pose3d"
    },
    {
      key: "axesLegacy",
      display: "Axes",
      symbol: "move.3d",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["NumberArray"],
      options: [],
      numberArrayDeprecated: true,
      geometryPreviewType: "Pose3d"
    },
    {
      key: "cone",
      display: "Cone",
      symbol: "cone.fill",
      showInTypeName: true,
      color: "color",
      sourceTypes: [
        "Pose2d",
        "Pose3d",
        "Pose2d[]",
        "Pose3d[]",
        "Transform2d",
        "Transform3d",
        "Transform2d[]",
        "Transform3d[]",
        "Trajectory"
      ],
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors
        },
        {
          key: "position",
          display: "Position",
          showInTypeName: true,
          values: [
            { key: "center", display: "Center" },
            { key: "back", display: "Back" },
            { key: "front", display: "Front" }
          ]
        }
      ],
      initialSelectionOption: "color",
      geometryPreviewType: "Pose3d"
    },
    {
      key: "coneLegacy",
      display: "Cone",
      symbol: "cone.fill",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["NumberArray"],
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors
        },
        {
          key: "position",
          display: "Position",
          showInTypeName: true,
          values: [
            { key: "center", display: "Center" },
            { key: "back", display: "Back" },
            { key: "front", display: "Front" }
          ]
        },
        {
          key: "format",
          display: "Format",
          showInTypeName: false,
          values: [
            { key: "Pose2d", display: "2D Pose(s)" },
            { key: "Pose3d", display: "3D Pose(s)" },
            { key: "Translation2d", display: "2D Translation(s)" },
            { key: "Translation3d", display: "3D Translation(s)" }
          ]
        },
        {
          key: "units",
          display: "Rotation Units",
          showInTypeName: false,
          values: [
            { key: "radians", display: "Radians" },
            { key: "degrees", display: "Degrees" }
          ]
        }
      ],
      initialSelectionOption: "color",
      numberArrayDeprecated: true,
      geometryPreviewType: "Pose3d"
    },
    {
      key: "cameraOverride",
      display: "Camera Override",
      symbol: "camera.fill",
      showInTypeName: true,
      color: "#888888",
      sourceTypes: ["Pose3d", "Transform3d"],
      options: [],
      geometryPreviewType: "Pose3d"
    },
    {
      key: "cameraOverrideLegacy",
      display: "Camera Override",
      symbol: "camera.fill",
      showInTypeName: true,
      color: "#888888",
      sourceTypes: ["NumberArray"],
      options: [],
      numberArrayDeprecated: true,
      geometryPreviewType: "Pose3d"
    },
    {
      key: "zebra",
      display: "Zebra Marker",
      symbol: "mappin.circle.fill",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["ZebraTranslation"],
      options: [],
      geometryPreviewType: "Translation2d"
    }
  ]
};

export default ThreeDimensionController_Config;
