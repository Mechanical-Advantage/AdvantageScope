// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { SourceListConfig } from "../../shared/SourceListConfig";
import { numberSlot as slot } from "./DbcFields";

/** Each slot's default DBC signal, used when no field is dragged into that slot. */
export const CarDynamicsDefaults: { [slot: string]: string[] } = {
  steering: ["DASH_SteeringAngle"],
  speedFL: ["DASH_SpeedFL"],
  speedFR: ["DASH_SpeedFR"],
  yawRate: ["SBG_FRONT_GyroZ"],
  accelX: ["SBG_FRONT_AccelX"],
  accelY: ["SBG_FRONT_AccelY"],
  shockFL: ["DASH_ShockPotFrontLeft"],
  shockFR: ["DASH_ShockPotFrontRight"],
  shockRL: ["REAR_ShockPotRearLeft"],
  shockRR: ["REAR_ShockPotRearRight"]
};

const CarDynamicsController_Config: SourceListConfig = {
  title: "Sources",
  autoAdvance: true,
  allowChildrenFromDrag: true,
  typeMemoryId: "carDynamics",
  types: [
    slot("steering", "Steering Angle", "360"),
    slot("speedFL", "Wheel Speed FL", "speed"),
    slot("speedFR", "Wheel Speed FR", "speed"),
    slot("yawRate", "Yaw Rate", "explore"),
    slot("accelX", "Longitudinal Accel", "target"),
    slot("accelY", "Lateral Accel", "target"),
    slot("shockFL", "Damper FL", "earthquake"),
    slot("shockFR", "Damper FR", "earthquake"),
    slot("shockRL", "Damper RL", "earthquake"),
    slot("shockRR", "Damper RR", "earthquake")
  ]
};

export default CarDynamicsController_Config;
