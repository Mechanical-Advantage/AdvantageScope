// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/** A type of log data that can be stored. */
enum LoggableType {
  Raw,
  Boolean,
  Number,
  String,
  BooleanArray,
  NumberArray,
  StringArray,
  Empty // Used as a placeholder for child fields of structured data
}

export default LoggableType;
