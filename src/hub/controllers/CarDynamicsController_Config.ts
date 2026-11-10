// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { SourceListConfig } from "../../shared/SourceListConfig";
import { numberSlot } from "./DbcFields";

const CarDynamicsController_Config: SourceListConfig = {
  title: "Sources",
  autoAdvance: true,
  allowChildrenFromDrag: true,
  typeMemoryId: "carDynamics",
  types: [
    numberSlot("steering", "Steering Angle", "360", true),
    numberSlot("speedFL", "Wheel Speed FL", "speed"),
    numberSlot("speedFR", "Wheel Speed FR", "speed"),
    numberSlot("yawRate", "Yaw Rate", "explore", true),
    numberSlot("accelX", "Longitudinal Accel", "target", true),
    numberSlot("accelY", "Lateral Accel", "target", true),
    numberSlot("shockFL", "Damper FL", "earthquake"),
    numberSlot("shockFR", "Damper FR", "earthquake"),
    numberSlot("shockRL", "Damper RL", "earthquake"),
    numberSlot("shockRR", "Damper RR", "earthquake")
  ]
};

export default CarDynamicsController_Config;
