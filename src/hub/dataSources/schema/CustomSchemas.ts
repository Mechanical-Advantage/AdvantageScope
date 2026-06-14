// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Log from "../../../shared/log/Log";
import URCLSchema from "./URCLSchema";
import URCLSchemaLegacy from "./URCLSchemaLegacy";

/** Schemas that require custom handling because they can't be decoded using just the log data. */
const CustomSchemas: Map<string, (log: Log, key: string, timestamp: number, value: Uint8Array) => void> = new Map();
export default CustomSchemas;

CustomSchemas.set("URCL", URCLSchemaLegacy.parseURCLr1);
CustomSchemas.set("URCLr2_periodic", URCLSchemaLegacy.parseURCLr2);
CustomSchemas.set("URCLr3_periodic", URCLSchema.parseURCLr3);
