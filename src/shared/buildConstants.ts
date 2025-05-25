// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export enum Distributor {
  FRC6328,
  WPILib
}

// @ts-ignore
export const DISTRIBUTOR: Distributor = Distributor.__distributor__;
export const BUILD_DATE: string = "__build_date__";
export const COPYRIGHT: string = "__copyright__";
