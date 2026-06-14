// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/** A message object with a name. */
export default interface NamedMessage {
  readonly name: string;
  readonly data?: any;
}
