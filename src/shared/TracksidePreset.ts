// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { canonicalChannelPath } from "./display/ChannelProfile";
import { HealthTile } from "./HealthStrip";

// Unapproved placeholder limits: the team must replace these before operational use.
const tracksideTiles: [string, RegExp, "high" | "low", number?, number?, boolean?][] = [
  ["SoC", /(?:state_of_charge|(?:ennoid_|ecu_)?(?:soc|accusoc))$/, "low", 25, 15],
  ["Min cell", /(?:cell_voltage_min|(?:ennoid_)?cellvoltagemin)$/, "low", 3.3, 3.1],
  ["Max cell", /(?:cell_voltage_max|(?:ennoid_)?cellvoltagemax)$/, "high", 4.15, 4.2],
  ["Max cell temp", /(?:accumulator\/temperature_max|(?:ennoid_)?tempcellmax|ecu_accutempmax)$/, "high", 50, 60],
  ["Motor temp", /(?:motor_temperature|(?:inv_|ecu_)?motortemp)$/, "high", 90, 110],
  ["Inverter temp", /(?:module_temperature|ecu_invertertemp|inv_moduleatemp)$/, "high", 70, 85],
  ["HV pack", /(?:pack_voltage|(?:ennoid_)?packvoltage)$/, "low", 350, 320],
  [
    "BMS fault",
    /(?:bms_faults?|bms\/faultflags|ennoid_faultflags|imd_state|ttcs_imdstate)$/,
    "high",
    undefined,
    undefined,
    true
  ],
  ["Vehicle state", /(?:car_state|ecu_ecustate)$/, "high"]
];
export function tracksideHealthTiles(paths: string[]): HealthTile[] {
  return tracksideTiles.flatMap(([label, pattern, direction, warn, critical, fault]) => {
    const path = paths.find((key) => !key.endsWith("/raw") && pattern.test(canonicalChannelPath(key).toLowerCase()));
    return [{ path: path ?? "", label, direction, warn, critical, fault, latch: fault ?? false }];
  });
}
