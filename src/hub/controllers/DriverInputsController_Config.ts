// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { SourceListConfig } from "../../shared/SourceListConfig";
import { numberSlot } from "./DbcFields";

/** Each slot's default DBC signals, tried in order when no field is dragged into that slot. */
export const DriverInputsDefaults: { [slot: string]: string[] } = {
  steering: ["DASH_SteeringAngle"],
  throttle: ["ECU_ThrottlePos", "PEDAL_Position1", "PEDAL_Position2"],
  brakeFront: ["ECU_BrakePressFront"],
  brakeRear: ["ECU_BrakePressRear"]
};

const DriverInputsController_Config: SourceListConfig = {
  title: "Sources",
  autoAdvance: true,
  allowChildrenFromDrag: true,
  typeMemoryId: "driverInputs",
  types: [
    numberSlot("steering", "Steering Angle", "360"),
    numberSlot("throttle", "Throttle", "speed"),
    numberSlot("brakeFront", "Brake Front", "verticalalignbottom"),
    numberSlot("brakeRear", "Brake Rear", "verticalalignbottom")
  ]
};

export default DriverInputsController_Config;
