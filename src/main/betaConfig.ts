// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export const BETA_CONFIG: BetaConfig | null = {
  year: "2026",
  isAlpha: false,
  expiration: new Date(2026, 0, 10),
  surveyUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSeiBaYQ0CME-Fjt2G3d4uJ1cKOQfj8NPTPh7mNvA_ZQFQwGHw/viewform?usp=header"
};

export type BetaConfig = {
  year: string;
  isAlpha: boolean;
  expiration: Date;
  surveyUrl: string | null;
};
