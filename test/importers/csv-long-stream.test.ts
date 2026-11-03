// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { test } from "node:test";
import { compareCSV } from "./reference/compareCSV";

test("long disk-backed CSV matches the string loader with quoted keys, empty values and duplicate times", async () => {
  await compareCSV(
    '\ufefftime;signal;value;unit\r\n2;bus.A;1,2;V\r\n1;bus.B;true;\r\n1;bus.A;;V\r\n0;bus.B;false;\r\n3;"key,with\nnewline";"hello ""world""";\r\n4;bus.A;5,4;V'
  );
});
