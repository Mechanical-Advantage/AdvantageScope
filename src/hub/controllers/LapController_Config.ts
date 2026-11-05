// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { SourceListConfig } from "../../shared/SourceListConfig";
import { LapSourceRole } from "../LapService";

export const LapSourceGroups: { title: string; roles: [LapSourceRole, string, string][] }[] = [
  {
    title: "Position",
    roles: [
      ["latitude", "Latitude", "lat(itude)?$"],
      ["longitude", "Longitude", "(lon|lng|longitude)$"],
      ["yaw", "Yaw Rate", "yaw"]
    ]
  },
  {
    title: "Speed",
    roles: [
      ["speed", "Speed", "^(vehicle|ground|gps)?.?speed"],
      ["frontLeft", "Front Left Wheel", "(fl|front.?left)$"],
      ["frontRight", "Front Right Wheel", "(fr|front.?right)$"],
      ["rpm", "Motor RPM", "rpm|motor.?speed"]
    ]
  },
  {
    title: "Lap Detection",
    roles: [
      ["counter", "Lap Counter", "lap.?count"],
      ["beacon", "Lap Beacon", "beacon"]
    ]
  }
];

export const LapSourceConfigs: SourceListConfig[] = LapSourceGroups.map(({ title, roles }) => ({
  title,
  autoAdvance: true,
  allowChildrenFromDrag: false,
  types: roles.map(([key, display, fieldPattern]) => ({
    key,
    display,
    fieldPattern,
    symbol: "numbers",
    showInTypeName: true,
    color: "#58a7ff",
    sourceTypes: ["Number"],
    singleField: true,
    showDocs: true,
    options: []
  }))
}));
