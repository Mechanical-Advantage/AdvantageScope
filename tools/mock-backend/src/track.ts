// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// A small closed FSAE-style circuit (~1 km) built from straights and arcs.
//
// Map frame: x = east, y = north, z = up (ENU, right-handed), origin at the end of the last
// corner. The car drives counter-clockwise. Positive curvature = left turn.

export type Segment = { kind: "straight"; length: number } | { kind: "arc"; radius: number; angleDeg: number }; // + = left

const deg = Math.PI / 180;

/** Default layout: main straight, hairpin, sweepers, a back-straight chicane. Closes exactly. */
export const DEFAULT_LAYOUT: Segment[] = [
  { kind: "straight", length: 260 }, // main straight (start/finish at s = 30)
  { kind: "arc", radius: 12, angleDeg: 180 }, // hairpin
  { kind: "straight", length: 60 },
  { kind: "arc", radius: 20, angleDeg: -90 }, // right-hander
  { kind: "straight", length: 160 },
  { kind: "arc", radius: 25, angleDeg: 90 },
  { kind: "straight", length: 55 },
  { kind: "arc", radius: 20, angleDeg: -30 }, // chicane
  { kind: "arc", radius: 20, angleDeg: 30 },
  { kind: "straight", length: 10 },
  { kind: "arc", radius: 20, angleDeg: 30 },
  { kind: "arc", radius: 20, angleDeg: -30 },
  { kind: "straight", length: 55 },
  { kind: "arc", radius: 15, angleDeg: 90 },
  { kind: "straight", length: 194 },
  { kind: "arc", radius: 20, angleDeg: 90 } // final corner onto the main straight
];

export interface TrackPoint {
  s: number;
  x: number;
  y: number;
  yaw: number; // rad, from +x (east), CCW
  kappa: number; // 1/m, + = left
}

export interface TrackCone {
  id: string;
  x: number;
  y: number;
  cls: "blue" | "yellow" | "orange_big";
}

export class Track {
  readonly length: number;
  readonly ds: number;
  readonly startLineS: number;
  readonly halfWidth = 1.6;
  readonly points: TrackPoint[];
  readonly cones: TrackCone[];
  /** Closure error of the layout (m), for tests. */
  readonly closureError: number;

  constructor(layout: Segment[] = DEFAULT_LAYOUT, ds = 0.25, startLineS = 30) {
    this.ds = ds;
    this.startLineS = startLineS;
    const pts: TrackPoint[] = [];
    let x = 0,
      y = 0,
      yaw = 0,
      s = 0;
    for (const seg of layout) {
      const segLen = seg.kind === "straight" ? seg.length : seg.radius * Math.abs(seg.angleDeg) * deg;
      const kappa = seg.kind === "straight" ? 0 : Math.sign(seg.angleDeg) / seg.radius;
      const n = Math.max(1, Math.round(segLen / ds));
      const step = segLen / n;
      for (let i = 0; i < n; i++) {
        pts.push({ s, x, y, yaw, kappa });
        // exact integration of a constant-curvature step
        if (kappa === 0) {
          x += step * Math.cos(yaw);
          y += step * Math.sin(yaw);
        } else {
          const nyaw = yaw + kappa * step;
          x += (Math.sin(nyaw) - Math.sin(yaw)) / kappa;
          y += (Math.cos(yaw) - Math.cos(nyaw)) / kappa;
          yaw = nyaw;
        }
        s += step;
      }
    }
    this.closureError = Math.hypot(x, y) + Math.abs(normAngle(yaw));
    this.length = s;
    this.points = pts;
    this.cones = this.buildCones();
  }

  /** Interpolated centreline state at arc length s (wrapped). */
  at(s: number): TrackPoint {
    const L = this.length;
    const sw = ((s % L) + L) % L;
    const i = Math.min(this.points.length - 1, Math.floor(sw / this.ds));
    const p = this.points[i];
    const d = sw - p.s;
    // integrate from the sample point with its curvature (exact within a segment)
    let x: number, y: number, yaw: number;
    if (p.kappa === 0) {
      x = p.x + d * Math.cos(p.yaw);
      y = p.y + d * Math.sin(p.yaw);
      yaw = p.yaw;
    } else {
      yaw = p.yaw + p.kappa * d;
      x = p.x + (Math.sin(yaw) - Math.sin(p.yaw)) / p.kappa;
      y = p.y + (Math.cos(p.yaw) - Math.cos(yaw)) / p.kappa;
    }
    return { s: sw, x, y, yaw, kappa: p.kappa };
  }

  private buildCones(): TrackCone[] {
    const cones: TrackCone[] = [];
    const spacing = 5;
    let id = 0;
    for (let s = 0; s < this.length - spacing / 2; s += spacing) {
      const p = this.at(s);
      const nx = -Math.sin(p.yaw),
        ny = Math.cos(p.yaw);
      cones.push({ id: `c${id++}`, x: p.x + nx * this.halfWidth, y: p.y + ny * this.halfWidth, cls: "blue" });
      cones.push({ id: `c${id++}`, x: p.x - nx * this.halfWidth, y: p.y - ny * this.halfWidth, cls: "yellow" });
    }
    const sl = this.at(this.startLineS);
    const nx = -Math.sin(sl.yaw),
      ny = Math.cos(sl.yaw);
    for (const off of [-0.5, 0.5]) {
      const fx = Math.cos(sl.yaw) * off,
        fy = Math.sin(sl.yaw) * off;
      const w = this.halfWidth + 0.3;
      cones.push({ id: `c${id++}`, x: sl.x + nx * w + fx, y: sl.y + ny * w + fy, cls: "orange_big" });
      cones.push({ id: `c${id++}`, x: sl.x - nx * w + fx, y: sl.y - ny * w + fy, cls: "orange_big" });
    }
    return cones;
  }
}

export function normAngle(a: number): number {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

// Map frame <-> WGS84 (equirectangular around an origin near Melton, VIC; fine for ~1 km).
export const GPS_ORIGIN = { lat: -37.6825, lon: 144.5695, alt: 92 };
const EARTH_R = 6378137;

export function mapToLatLon(x: number, y: number): { lat: number; lon: number } {
  const lat = GPS_ORIGIN.lat + y / EARTH_R / deg;
  const lon = GPS_ORIGIN.lon + x / (EARTH_R * Math.cos(GPS_ORIGIN.lat * deg)) / deg;
  return { lat, lon };
}
