// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export const BETA_CONFIG: BetaConfig | null = {
  year: "2027",
  isAlpha: true,
  expiration: new Date(2027, 0, 9),
  surveyUrl: null
};

export type BetaConfig = {
  year: string;
  isAlpha: boolean;
  expiration: Date;
  surveyUrl: string | null;
};
