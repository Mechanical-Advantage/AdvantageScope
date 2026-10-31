// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { LITE_VERSION } from "../../shared/buildConstants";

export namespace LocalStorageKeys {
  const PREFIX = "AdvantageScopeLite/";
  export const STATE = PREFIX + LITE_VERSION + "/state";
  export const PREFS = PREFIX + "prefs";
  export const TYPE_MEMORY = PREFIX + "type-memory";
  export const RECENT_UNITS = PREFIX + "recent-units";
  export const SIDEBAR_WIDTH = "AdvantageScopeLite/sidebar-width"; // Shared with DS lite
}
