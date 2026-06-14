// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export enum Distribution {
  FRC6328,
  WPILib,
  Lite
}

// @ts-ignore
export const DISTRIBUTION: Distribution = Distribution.__distribution__;
export const LITE_VERSION: string = "__version__"; // Only use for Lite since we can't check if the app is packaged
export const BUILD_DATE: string = "__build_date__";
export const COPYRIGHT: string = "__copyright__";
