// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Optional binary extension: uint32 LE JSON-header length, UTF-8 header, interleaved Float32 xyzi.
// Only the header is JSON. The point payload stays binary from producer to worker.
export function cloudPacket(timeNs: bigint, run: number): Uint8Array {
  const count = 1200;
  const header = new TextEncoder().encode(
    JSON.stringify({
      t_ns: timeNs.toString(),
      run,
      header: { frame_id: "map" },
      width: count,
      height: 1,
      is_bigendian: false,
      is_dense: true,
      point_step: 16,
      row_step: count * 16,
      fields: ["x", "y", "z", "intensity"].map((name, i) => ({ name, offset: i * 4, datatype: 7, count: 1 }))
    })
  );
  const bytes = new Uint8Array(4 + header.length + count * 16);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, header.length, true);
  bytes.set(header, 4);
  const t = Number(timeNs % 100000000000n) / 1e9;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const r = 8 + Math.sin(a * 5 + t);
    [r * Math.cos(a), r * Math.sin(a), 0.5 + 0.4 * Math.sin(a * 4), i % 256].forEach((v, j) =>
      view.setFloat32(4 + header.length + i * 16 + j * 4, v, true)
    );
  }
  return bytes;
}
