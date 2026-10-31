// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// DBC files bundled as text (see dbc/SOURCE.txt for the mur-msgs commit).
import murControl from "./dbc/mur_control_can.dbc";
import murDashboard from "./dbc/mur_dashboard_can.dbc";
import murTelemetry from "./dbc/mur_telemetry_can.dbc";
import cascadia from "./dbc/vendor/Cascadia_PM100DZ.dbc";
import ennoid from "./dbc/vendor/ENNOID_BMS.dbc";
import orion from "./dbc/vendor/Orion_BMS.dbc";
import sbg from "./dbc/vendor/SBG_Ellipse.dbc";
import valeo from "./dbc/vendor/Valeo_OBC.dbc";

/** Bundled DBC files by relative path. */
export const BUNDLED_DBCS: { [path: string]: string } = {
  "mur_control_can.dbc": murControl,
  "mur_telemetry_can.dbc": murTelemetry,
  "mur_dashboard_can.dbc": murDashboard,
  "vendor/Cascadia_PM100DZ.dbc": cascadia,
  "vendor/ENNOID_BMS.dbc": ennoid,
  "vendor/Orion_BMS.dbc": orion,
  "vendor/SBG_Ellipse.dbc": sbg,
  "vendor/Valeo_OBC.dbc": valeo
};
