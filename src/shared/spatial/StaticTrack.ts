// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export interface TrackPoint {
  position: [number, number, number];
  class: string;
}
export interface StaticTrack {
  points: TrackPoint[];
  centreline: boolean;
}
/** Local metric geometry, expressed in the view's fixed frame. GeoJSON lon/lat must be projected before import. */
export function parseStaticTrack(text: string): StaticTrack {
  let rows: any[][];
  let centreline = false;
  if (text.trimStart().startsWith("{")) {
    const geo = JSON.parse(text);
    const features =
      geo.type === "FeatureCollection" ? geo.features : [geo.type === "Feature" ? geo : { geometry: geo }];
    rows = [];
    for (const feature of features) {
      const geometry = feature.geometry;
      if (geometry.type === "LineString") {
        centreline = true;
        rows.push(...geometry.coordinates.map((p: any) => [...p.slice(0, 2), p[2] ?? 0, ""]));
      } else if (geometry.type === "Point")
        rows.push([
          geometry.coordinates[0],
          geometry.coordinates[1],
          geometry.coordinates[2] ?? 0,
          feature.properties?.class ?? "orange"
        ]);
      else throw new Error("Track GeoJSON supports Point or LineString");
    }
  } else {
    const lines = text
      .trim()
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => line.split(/[,;\t]/).map((v) => v.trim()));
    const header = lines.shift()!.map((v) => v.toLowerCase());
    if (!header.includes("x") || !header.includes("y")) throw new Error("Track CSV needs x,y[,z,class] in metres");
    centreline = !header.includes("class");
    rows = lines.map((row) => [
      row[header.indexOf("x")],
      row[header.indexOf("y")],
      header.includes("z") ? row[header.indexOf("z")] : 0,
      row[header.indexOf("class")] ?? ""
    ]);
  }
  const points = rows.map((row) => ({
    position: [Number(row[0]), Number(row[1]), Number(row[2])] as [number, number, number],
    class: String(row[3])
  }));
  if (!points.length || points.some((p) => !p.position.every(Number.isFinite)))
    throw new Error("Track contains invalid coordinates");
  return { points, centreline };
}
