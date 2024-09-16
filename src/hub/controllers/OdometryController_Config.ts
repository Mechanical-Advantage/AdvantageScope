import { NeonColors, NeonColors_RedStart } from "../../shared/Colors";
import { SourceListConfig } from "../../shared/SourceListConfig";
import { SwerveArrangementValues } from "./SwerveController_Config";

const OdometryController_Config: SourceListConfig = {
  title: "Poses",
  autoAdvance: true,
  allowChildrenFromDrag: false,
  typeMemoryId: "odometry",
  types: [
    {
      key: "robot",
      display: "Robot",
      symbol: "location.fill",
      showInTypeName: true,
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
        "Transform3d[]"
      ],
      showDocs: true,
      options: [],
      parentKey: "robot",
      previewType: "Pose2d"
    },
    {
      key: "robotLegacy",
      display: "Robot",
      symbol: "location.fill",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["NumberArray"],
      showDocs: false,
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
      numberArrayDeprecated: true,
      parentKey: "robot",
      previewType: "Pose2d"
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
        "Transform3d[]"
      ],
      showDocs: true,
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors
        }
      ],
      initialSelectionOption: "color",
      parentKey: "robot",
      previewType: "Pose2d"
    },
    {
      key: "ghostLegacy",
      display: "Ghost",
      symbol: "location.fill.viewfinder",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["NumberArray"],
      showDocs: false,
      options: [
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
      initialSelectionOption: "color",
      parentKey: "robot",
      numberArrayDeprecated: true,
      previewType: "Pose2d"
    },
    {
      key: "ghostZebra",
      display: "Ghost",
      symbol: "location.fill.viewfinder",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["ZebraTranslation"],
      showDocs: false,
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors
        }
      ],
      initialSelectionOption: "color",
      parentKey: "robot",
      previewType: "Translation2d"
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
      showDocs: true,
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors
        },
        {
          key: "size",
          display: "Thickness",
          showInTypeName: false,
          values: [
            { key: "normal", display: "Normal" },
            { key: "bold", display: "Bold" }
          ]
        }
      ],
      childOf: "robot",
      previewType: "Translation2d"
    },
    {
      key: "visionLegacy",
      display: "Vision Target",
      symbol: "scope",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["NumberArray"],
      showDocs: false,
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors
        },
        {
          key: "size",
          display: "Thickness",
          showInTypeName: false,
          values: [
            { key: "normal", display: "Normal" },
            { key: "bold", display: "Bold" }
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
      numberArrayDeprecated: true,
      childOf: "robot",
      previewType: "Translation2d"
    },
    {
      key: "swerveStates",
      display: "Swerve States",
      symbol: "arrow.up.left.and.down.right.and.arrow.up.right.and.down.left",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["SwerveModuleState[]"],
      showDocs: true,
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors_RedStart
        },
        {
          key: "arrangement",
          display: "Arrangement",
          showInTypeName: false,
          values: SwerveArrangementValues
        }
      ],
      initialSelectionOption: "color",
      childOf: "robot",
      previewType: "SwerveModuleState[]"
    },
    {
      key: "swerveStatesLegacy",
      display: "Swerve States",
      symbol: "arrow.up.left.and.down.right.and.arrow.up.right.and.down.left",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["NumberArray"],
      showDocs: false,
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors_RedStart
        },
        {
          key: "arrangement",
          display: "Arrangement",
          showInTypeName: false,
          values: SwerveArrangementValues
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
      childOf: "robot",
      previewType: "SwerveModuleState[]"
    },
    {
      key: "rotationOverride",
      display: "Rotation Override",
      symbol: "angle",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Rotation2d", "Rotation3d"],
      showDocs: true,
      options: [],
      childOf: "robot",
      previewType: "Rotation2d"
    },
    {
      key: "rotationOverrideLegacy",
      display: "Rotation Override",
      symbol: "angle",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Number"],
      showDocs: false,
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
      previewType: "Rotation2d"
    },
    {
      key: "trajectory",
      display: "Trajectory",
      symbol: "point.bottomleft.forward.to.point.topright.scurvepath.fill",
      showInTypeName: true,
      color: "color",
      sourceTypes: [
        "Pose2d[]",
        "Pose3d[]",
        "Transform2d[]",
        "Transform3d[]",
        "Translation2d[]",
        "Translation3d[]",
        "Trajectory"
      ],
      showDocs: true,
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors
        },
        {
          key: "size",
          display: "Thickness",
          showInTypeName: false,
          values: [
            { key: "normal", display: "Normal" },
            { key: "bold", display: "Bold" }
          ]
        }
      ],
      previewType: "Translation2d"
    },
    {
      key: "trajectoryLegacy",
      display: "Trajectory",
      symbol: "point.bottomleft.forward.to.point.topright.scurvepath.fill",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["NumberArray"],
      showDocs: false,
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors
        },
        {
          key: "size",
          display: "Thickness",
          showInTypeName: false,
          values: [
            { key: "normal", display: "Normal" },
            { key: "bold", display: "Bold" }
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
      numberArrayDeprecated: true,
      previewType: "Translation2d"
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
      showDocs: true,
      options: [
        {
          key: "timeRange",
          display: "Time Range",
          showInTypeName: false,
          values: [
            { key: "enabled", display: "Enabled" },
            { key: "auto", display: "Auto" },
            { key: "teleop", display: "Teleop" },
            { key: "teleop-no-endgame", display: "Teleop (No Endgame)" },
            { key: "full", display: "Full Log" }
          ]
        }
      ],
      initialSelectionOption: "timeRange",
      previewType: null
    },
    {
      key: "heatmapLegacy",
      display: "Heatmap",
      symbol: "map.fill",
      showInTypeName: true,
      color: "#ff0000",
      sourceTypes: ["NumberArray"],
      showDocs: false,
      options: [
        {
          key: "timeRange",
          display: "Time Range",
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
      initialSelectionOption: "timeRange",
      numberArrayDeprecated: true,
      previewType: null
    },
    {
      key: "arrow",
      display: "Arrow",
      symbol: "arrow.up.circle",
      showInTypeName: true,
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
        "Trajectory"
      ],
      showDocs: true,
      options: [
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
      initialSelectionOption: "position",
      previewType: "Pose2d"
    },
    {
      key: "arrowLegacy",
      display: "Arrow",
      symbol: "arrow.up.circle",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["NumberArray"],
      showDocs: false,
      options: [
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
      initialSelectionOption: "position",
      numberArrayDeprecated: true,
      previewType: "Pose2d"
    },
    {
      key: "zebra",
      display: "Zebra Marker",
      symbol: "mappin.circle.fill",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["ZebraTranslation"],
      showDocs: true,
      options: [],
      previewType: "Translation2d"
    }
  ]
};

export default OdometryController_Config;
