// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/** Longitudinal wheel/GPS slip; unavailable below 2 m/s or with samples older than 250 ms.
 * Positive means wheel circumferential speed exceeds ground speed. Inputs are m/s and seconds.
 */
export function slipRatio(wheel: number, ground: number, wheelAge = 0, groundAge = 0): number {
  if (
    ![wheel, ground, wheelAge, groundAge].every(Number.isFinite) ||
    ground < 2 ||
    wheelAge < 0 ||
    groundAge < 0 ||
    wheelAge > 0.25 ||
    groundAge > 0.25
  )
    return NaN;
  return (wheel - ground) / ground;
}
