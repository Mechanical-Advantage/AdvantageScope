// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { BETA_CONFIG } from "../betaConfig";

export namespace LocalStorageKeys {
  const PREFIX = "AdvantageScopeLite/";
  export const STATE = PREFIX + "state";
  export const PREFS = PREFIX + "prefs";
  export const TYPE_MEMORY = PREFIX + "type-memory";
  export const RECENT_UNITS = PREFIX + "recent-units";
  export const BETA_STATE = PREFIX + "beta-" + (BETA_CONFIG === null ? "NA" : BETA_CONFIG.year);
}
