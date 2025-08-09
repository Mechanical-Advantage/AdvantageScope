// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export default interface ExportOptions {
  format: "csv-table" | "csv-list" | "wpilog" | "mcap";
  samplingMode: "changes" | "fixed" | "akit";
  samplingPeriod: number;
  prefixes: string;
  includeGenerated: boolean;
}
