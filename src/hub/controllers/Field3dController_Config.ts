// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { NeonColors, NeonColors_RedStart } from "../../shared/Colors";
import { SourceListConfig } from "../../shared/SourceListConfig";
import { SwerveArrangementValues } from "./SwerveController_Config";

const Field3dController_Config: SourceListConfig = {
  title: "hub.field.poses",
  autoAdvance: true,
  allowChildrenFromDrag: false,
  typeMemoryId: "field3d",
  types: [
    {
      key: "robot",
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
        "Transform3d[]"
      ],
      showDocs: true,
      options: [
        {
          key: "model",
          showInTypeName: true,
          values: []
        }
      ],
      initialSelectionOption: "model",
      parentKey: "robot",
      previewType: "Pose3d"
    },
    {
      key: "ghost",
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
          key: "model",
          showInTypeName: true,
          values: []
        },
        {
          key: "color",
          showInTypeName: false,
          values: NeonColors
        }
      ],
      initialSelectionOption: "model",
      parentKey: "robot",
      previewType: "Pose3d"
    },
    {
      key: "component",
      symbol: "puzzlepiece.extension.fill",
      showInTypeName: true,
      color: "#9370db",
      sourceTypes: ["Pose3d", "Pose3d[]", "Transform3d", "Transform3d[]"],
      showDocs: true,
      options: [],
      childOf: "robot",
      previewType: "Pose3d"
    },
    {
      key: "mechanism",
      symbol: "gearshape.fill",
      showInTypeName: true,
      color: "#888888",
      sourceTypes: ["Mechanism2d"],
      showDocs: true,
      options: [
        {
          key: "plane",
          showInTypeName: false,
          values: ["xz", "yz"]
        }
      ],
      childOf: "robot"
    },
    {
      key: "vision",
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
          showInTypeName: false,
          values: NeonColors
        },
        {
          key: "size",
          showInTypeName: false,
          values: ["normal", "bold"]
        }
      ],
      childOf: "robot",
      previewType: "Translation3d"
    },
    {
      key: "swerveModuleVelocities",
      symbol: "arrow.up.left.and.down.right.and.arrow.up.right.and.down.left",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["SwerveModuleVelocity[]", "SwerveModuleState[]"],
      showDocs: true,
      options: [
        {
          key: "color",
          showInTypeName: false,
          values: NeonColors_RedStart
        },
        {
          key: "arrangement",
          showInTypeName: false,
          values: SwerveArrangementValues
        }
      ],
      initialSelectionOption: "color",
      childOf: "robot",
      previewType: "ModuleVelocities"
    },
    {
      key: "rotationOverride",
      symbol: "angle",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Rotation2d", "Rotation3d"],
      showDocs: true,
      options: [],
      childOf: "robot",
      previewType: "Rotation3d"
    },
    {
      key: "rotationOverrideLegacy",
      symbol: "angle",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Number"],
      showDocs: false,
      options: [
        {
          key: "units",
          showInTypeName: false,
          values: ["radians", "degrees"]
        }
      ],
      childOf: "robot",
      previewType: "Rotation3d"
    },
    {
      key: "gamePiece",
      symbol: "star.fill",
      showInTypeName: false,
      color: "#ffd700",
      sourceTypes: ["Pose3d", "Pose3d[]", "Transform3d", "Transform3d[]", "Translation3d", "Translation3d[]"],
      showDocs: true,
      options: [
        {
          key: "variant",
          showInTypeName: true,
          values: []
        }
      ],
      initialSelectionOption: "variant",
      previewType: "Pose3d"
    },
    {
      key: "trajectory",
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
        "SwerveSample[]",
        "DifferentialSample[]",
        "Trajectory"
      ],
      showDocs: true,
      options: [
        {
          key: "color",
          showInTypeName: false,
          values: NeonColors
        },
        {
          key: "size",
          showInTypeName: false,
          values: ["normal", "bold"]
        }
      ],
      previewType: "Translation3d"
    },
    {
      key: "heatmap",
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
        "Translation3d[]"
      ],
      showDocs: true,
      options: [
        {
          key: "timeRange",
          showInTypeName: false,
          values: ["enabled", "auto", "teleop", "teleop-no-endgame", "full", "visible"]
        }
      ],
      initialSelectionOption: "timeRange",
      previewType: null
    },
    {
      key: "aprilTag",
      symbol: "qrcode",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Pose3d", "Pose3d[]", "Transform3d", "Transform3d[]", "Trajectory"],
      showDocs: true,
      options: [
        {
          key: "variant",
          showInTypeName: true,
          values: []
        }
      ],
      parentKey: "aprilTag",
      initialSelectionOption: "variant",
      previewType: "Pose3d"
    },
    {
      key: "aprilTagIDs",
      symbol: "number",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["NumberArray"],
      showDocs: true,
      options: [],
      childOf: "aprilTag",
      previewType: null
    },
    {
      key: "axes",
      symbol: "move.3d",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Pose3d", "Pose3d[]", "Transform3d", "Transform3d[]", "Trajectory"],
      showDocs: true,
      options: [],
      previewType: "Pose3d"
    },
    {
      key: "cone",
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
      showDocs: true,
      options: [
        {
          key: "color",
          showInTypeName: false,
          values: NeonColors
        },
        {
          key: "position",
          showInTypeName: true,
          values: ["center", "back", "front"]
        }
      ],
      initialSelectionOption: "color",
      previewType: "Pose3d"
    },
    {
      key: "cameraOverride",
      symbol: "camera.fill",
      showInTypeName: true,
      color: "#888888",
      sourceTypes: ["Pose3d", "Transform3d"],
      showDocs: true,
      options: [],
      previewType: "Pose3d"
    }
  ]
};

export default Field3dController_Config;
