// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/**
 * Serializable description of a live source. Sources are registered in
 * src/hub/dataSources/LiveSourceRegistry.ts; the hub sends this info to the
 * main process (Electron or Lite) to build the live source menus.
 */
export interface LiveSourceInfo {
  /** Stable ID, stored in the "liveMode" preference. */
  id: string;

  /** Display name for menus. */
  name: string;

  /** Address used when the "Live Address" preference is empty. */
  defaultAddress: string;

  /** Whether the source can run in the browser (Lite) build. */
  liteCompatible: boolean;
}
