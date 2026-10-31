// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/** DBC files are bundled as text (see `moduleTypes` in rolldown.config.mjs). */
declare module "*.dbc" {
  const text: string;
  export default text;
}
