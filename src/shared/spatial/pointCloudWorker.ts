// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { parse } from "@foxglove/rosmsg";
import { MessageReader } from "@foxglove/rosmsg2-serialization";
import { decodePointCloud2 } from "./PointCloud2";
self.onmessage = (event) => {
  const { id, payload } = event.data;
  try {
    const message =
      payload.encoding === "cdr"
        ? new MessageReader(parse(payload.definition, { ros2: true })).readMessage(payload.bytes)
        : payload.cloud;
    const result = decodePointCloud2(message, payload.field);
    // @ts-expect-error worker transfer overload
    self.postMessage({ id, payload: result }, [
      result.positions.buffer,
      result.values.buffer,
      ...(result.colors ? [result.colors.buffer] : [])
    ]);
  } catch (error) {
    self.postMessage({ id, payload: { error: String(error) } });
  }
};
