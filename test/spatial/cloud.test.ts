// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import { decodePointCloud2, PointCloud2 } from "../../src/shared/spatial/PointCloud2";
for (const big of [false, true])
  test("padded cloud offsets and endianness " + big, () => {
    const cloud: PointCloud2 = {
      width: 2,
      height: 2,
      point_step: 20,
      row_step: 48,
      is_dense: false,
      is_bigendian: big,
      fields: ["intensity", "x", "y", "z"].map((name, i) => ({ name, offset: i * 4, datatype: 7, count: 1 })),
      data: new Uint8Array(96)
    };
    const view = new DataView(cloud.data.buffer);
    for (const offset of [0, 20, 48, 68]) [10, 1, 2, 3].forEach((v, i) => view.setFloat32(offset + i * 4, v, !big));
    view.setFloat32(68 + 4, NaN, !big);
    const result = decodePointCloud2(cloud);
    assert.equal(result.positions.length, 9);
    assert.deepEqual([...result.positions.slice(0, 3)], [1, 2, 3]);
    assert.equal(result.min, 10);
    assert.throws(() => decodePointCloud2({ ...cloud, row_step: 1 }));
  });
