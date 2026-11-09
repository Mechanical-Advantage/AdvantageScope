// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { SourceListConfig } from "../../shared/SourceListConfig";
import { numberSlot } from "./DbcFields";

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
    numberSlot("steering", "Steering Angle", "360"),
    numberSlot("speedFL", "Wheel Speed FL", "speed"),
    numberSlot("speedFR", "Wheel Speed FR", "speed"),
    numberSlot("yawRate", "Yaw Rate", "explore"),
    numberSlot("accelX", "Longitudinal Accel", "target"),
    numberSlot("accelY", "Lateral Accel", "target"),
    numberSlot("shockFL", "Damper FL", "earthquake"),
    numberSlot("shockFR", "Damper FR", "earthquake"),
    numberSlot("shockRL", "Damper RL", "earthquake"),
    numberSlot("shockRR", "Damper RR", "earthquake")
  ]
};

export default CarDynamicsController_Config;
