// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { CoordinateSystem } from "./AdvantageScopeAssets";

/** A set of application preferences. */
export default interface Preferences {
  theme: "light" | "dark" | "system";
  rioAddress: string;
  rioPath: string;
  liveMode: "nt4" | "nt4-akit" | "phoenix" | "pathplanner" | "rlog";
  liveSubscribeMode: "low-bandwidth" | "logging";
  liveDiscard: number;
  publishFilter: string;
  rlogPort: number;
  coordinateSystem: "automatic" | CoordinateSystem;
  field3dModeAc: "cinematic" | "standard" | "low-power";
  field3dModeBattery: "" | "cinematic" | "standard" | "low-power";
  tbaApiKey: string;
  userAssetsFolder: string | null;
  skipHootNonProWarning: boolean;
  skipNumericArrayDeprecationWarning: boolean;
  skipFrcLogFolderDefault: boolean;
  skipXRExperimentalWarning: boolean;
  ctreLicenseAccepted: boolean;
  usb?: boolean;
}
