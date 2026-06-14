// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/** A layer of a recursive log tree. */
export default interface LogFieldTree {
  fullKey: string | null;
  children: { [id: string]: LogFieldTree };
}
