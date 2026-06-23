// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { NeonColors, NeonColors_RedStart } from "../../shared/Colors";
import { SourceListConfig } from "../../shared/SourceListConfig";
import { SwerveArrangementValues } from "./SwerveController_Config";

const Field2dController_Config: SourceListConfig = {
  title: "hub.field.poses",
  autoAdvance: true,
  allowChildrenFromDrag: false,
  typeMemoryId: "field2d",
  types: [
    {
      key: "robot",
      symbol: "location.fill",
      showInTypeName: true,
      color: "bumpers",
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
          key: "bumpers",
          showInTypeName: false,
          values: ["", ...NeonColors]
        }
      ],
      parentKey: "robot",
      previewType: "Pose2d"
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
          key: "color",
          showInTypeName: false,
          values: NeonColors
        }
      ],
      initialSelectionOption: "color",
      parentKey: "robot",
      previewType: "Pose2d"
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
      previewType: "Translation2d"
    },
    {
      key: "swerveStates",
      symbol: "arrow.up.left.and.down.right.and.arrow.up.right.and.down.left",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["SwerveModuleState[]"],
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
      previewType: "SwerveModuleState[]"
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
      previewType: "Rotation2d"
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
      previewType: "Rotation2d"
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
        "Trajectory",
        "DifferentialSample[]",
        "SwerveSample[]"
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
      previewType: "Translation2d"
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
      key: "arrow",
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
        "DifferentialSample[]",
        "SwerveSample[]",
        "Trajectory"
      ],
      showDocs: true,
      options: [
        {
          key: "position",
          showInTypeName: true,
          values: ["center", "back", "front"]
        }
      ],
      initialSelectionOption: "position",
      previewType: "Pose2d"
    }
  ]
};

export default Field2dController_Config;
