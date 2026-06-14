// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export interface LogValueSetAny {
  timestamps: number[];
  values: any[];
}

export interface LogValueSetRaw {
  timestamps: number[];
  values: Uint8Array[];
}

export interface LogValueSetBoolean {
  timestamps: number[];
  values: boolean[];
}

export interface LogValueSetNumber {
  timestamps: number[];
  values: number[];
}

export interface LogValueSetString {
  timestamps: number[];
  values: string[];
}

export interface LogValueSetBooleanArray {
  timestamps: number[];
  values: boolean[][];
}

export interface LogValueSetNumberArray {
  timestamps: number[];
  values: number[][];
}

export interface LogValueSetStringArray {
  timestamps: number[];
  values: string[][];
}
