// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import { parseStaticTrack } from "../../src/shared/spatial/StaticTrack";
test("metric track CSV and GeoJSON", () => {
  assert.equal(parseStaticTrack("x,y,class\n1,2,blue").points[0].class, "blue");
  assert.equal(parseStaticTrack("x,y\n1,2\n3,4").centreline, true);
  assert.equal(
    parseStaticTrack(
      JSON.stringify({
        type: "LineString",
        coordinates: [
          [0, 1],
          [2, 3]
        ]
      })
    ).points.length,
    2
  );
  assert.throws(() => parseStaticTrack("x,y\ninvalid,2"));
});
