// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { SourceListConfig } from "../../shared/SourceListConfig";
import { LapSourceRole } from "../LapService";

export const LapSourceGroups: { title: string; roles: [LapSourceRole, string][] }[] = [
  {
    title: "Position",
    roles: [
      ["latitude", "Latitude"],
      ["longitude", "Longitude"],
      ["yaw", "Yaw Rate"]
    ]
  },
  {
    title: "Speed",
    roles: [
      ["speed", "Speed"],
      ["frontLeft", "Front Left Wheel"],
      ["frontRight", "Front Right Wheel"],
      ["rpm", "Motor RPM"]
    ]
  },
  {
    title: "Lap Detection",
    roles: [
      ["counter", "Lap Counter"],
      ["beacon", "Lap Beacon"]
    ]
  }
];

export const LapSourceConfigs: SourceListConfig[] = LapSourceGroups.map(({ title, roles }) => ({
  title,
  autoAdvance: true,
  allowChildrenFromDrag: false,
  types: roles.map(([key, display]) => ({
    key,
    display,
    symbol: "numbers",
    showInTypeName: true,
    color: "#58a7ff",
    sourceTypes: ["Number"],
    singleField: true,
    showDocs: true,
    options: []
  }))
}));
