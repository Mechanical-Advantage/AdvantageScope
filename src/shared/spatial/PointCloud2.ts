// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export interface PointField {
  name: string;
  offset: number;
  datatype: number;
  count: number;
}
export interface PointCloud2 {
  width: number;
  height: number;
  fields: PointField[];
  is_bigendian: boolean;
  point_step: number;
  row_step: number;
  data: Uint8Array;
  is_dense: boolean;
  header?: { frame_id: string };
}
const SIZES = [0, 1, 1, 2, 2, 4, 4, 4, 8];
/** Decodes padded organized clouds without expanding points into Log fields. Non-finite points are dropped even if a producer incorrectly sets is_dense. */
export function decodePointCloud2(cloud: PointCloud2, colorField = "intensity") {
  const { width, height, point_step, row_step } = cloud;
  if (
    ![width, height, point_step, row_step].every((v) => Number.isSafeInteger(v) && v >= 0) ||
    point_step === 0 ||
    row_step < width * point_step ||
    row_step * height > cloud.data.byteLength
  )
    throw new Error("Invalid PointCloud2 layout");
  if (width * height > 10_000_000) throw new Error("PointCloud2 exceeds 10 million point limit");
  const view = new DataView(cloud.data.buffer, cloud.data.byteOffset, cloud.data.byteLength);
  for (const field of cloud.fields) {
    if (
      !SIZES[field.datatype] ||
      !Number.isInteger(field.offset) ||
      field.offset < 0 ||
      field.count < 1 ||
      field.offset + SIZES[field.datatype] * field.count > point_step
    )
      throw new Error("Invalid point field: " + field.name);
  }
  const fields = new Map(cloud.fields.map((f) => [f.name, f]));
  if (!["x", "y", "z"].every((name) => fields.has(name))) throw new Error("PointCloud2 requires x/y/z");
  const little = !cloud.is_bigendian;
  const read = (base: number, field: PointField): number => {
    const offset = base + field.offset;
    switch (field.datatype) {
      case 1:
        return view.getInt8(offset);
      case 2:
        return view.getUint8(offset);
      case 3:
        return view.getInt16(offset, little);
      case 4:
        return view.getUint16(offset, little);
      case 5:
        return view.getInt32(offset, little);
      case 6:
        return view.getUint32(offset, little);
      case 7:
        return view.getFloat32(offset, little);
      case 8:
        return view.getFloat64(offset, little);
      default:
        return NaN;
    }
  };
  const positions = new Float32Array(width * height * 3),
    values = new Float32Array(width * height),
    colors = new Float32Array(width * height * 3);
  let count = 0,
    min = Infinity,
    max = -Infinity;
  const field = fields.get(colorField);
  const rgb = colorField === "rgb" || colorField === "rgba";
  for (let row = 0; row < height; row++)
    for (let col = 0; col < width; col++) {
      const base = row * row_step + col * point_step;
      const xyz = ["x", "y", "z"].map((name) => read(base, fields.get(name)!));
      if (!xyz.every(Number.isFinite)) continue;
      positions.set(xyz, count * 3);
      const value = field ? read(base, field) : xyz[2];
      values[count] = Number.isFinite(value) ? value : 0;
      if (rgb && field) {
        const packed = view.getUint32(base + field.offset, little);
        colors.set([((packed >>> 16) & 255) / 255, ((packed >>> 8) & 255) / 255, (packed & 255) / 255], count * 3);
      }
      if (Number.isFinite(value)) {
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
      count++;
    }
  return {
    positions: positions.slice(0, count * 3),
    values: values.slice(0, count),
    colors: rgb ? colors.slice(0, count * 3) : null,
    min: Number.isFinite(min) ? min : 0,
    max: Number.isFinite(max) ? max : 1,
    frame: cloud.header?.frame_id ?? ""
  };
}
