// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { NeonColors_RedStart } from "../../shared/Colors";
import { SourceListConfig } from "../../shared/SourceListConfig";

export const SwerveArrangementValues: string[] = ["0,1,2,3", "1,0,3,2", "0,1,3,2", "0,3,1,2", "3,0,2,1", "1,0,2,3"];

const SwerveController_Config: SourceListConfig = {
  title: "hub.swerve.sources",
  autoAdvance: "color",
  allowChildrenFromDrag: false,
  typeMemoryId: "swerve",
  types: [
    {
      key: "moduleVelocities",
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
      previewType: "ModuleVelocities"
    },
    {
      key: "robotVelocities",
      symbol: "arrow.up.and.down.square.fill",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["ChassisVelocities", "ChassisSpeeds"],
      showDocs: true,
      options: [
        {
          key: "color",
          showInTypeName: false,
          values: NeonColors_RedStart
        }
      ],
      initialSelectionOption: "color",
      previewType: "RobotVelocities"
    },
    {
      key: "rotation",
      symbol: "angle",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Rotation2d", "Rotation3d"],
      showDocs: true,
      options: [],
      previewType: "Rotation2d"
    },
    {
      key: "rotationLegacy",
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
      previewType: "Rotation2d"
    }
  ]
};

export default SwerveController_Config;
