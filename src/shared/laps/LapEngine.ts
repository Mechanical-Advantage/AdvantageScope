// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// In-page live connection UI (works the same in Electron and Lite):
// - ConnectDialog: File -> Connect... (Cmd/Ctrl+K). Pick a registered source, enter an address, or pick a
//   recent server. Styled like the Preferences prompt.
// - LiveStatusPill: title-bar pill with three separate indicators (backend, car, sim), plus a popover with
//   details, sim controls (only when the backend has sim endpoints) and connect/disconnect.

export type Point = { x: number; y: number };
export type Gate = { a: Point; b: Point; direction?: number };
export type Sample = Point & { t: number; speed?: number; counter?: number; beacon?: number; yaw?: number };
export type LapConfig = {
  gate?: Gate;
  sectors?: Gate[];
  fractions?: number[];
  minTime?: number;
  rearm?: number;
  manual?: number[];
  length?: number;
  mode?: "circuit" | "accel" | "skidpad" | "autocross" | "endurance";
  finish?: Gate;
};
export type Lap = {
  index: number;
  start: number;
  end: number;
  complete: boolean;
  source: string;
  distance: number;
  sectors: number[];
  grid: { distance: number; time: number }[];
  label: string;
  stint: number;
  valid: boolean;
};
export type LapResult = {
  laps: Lap[];
  samples: (Sample & { distance: number })[];
  gate?: Gate;
  best?: number;
  theoretical: number[];
};

export function project(lat: number, lon: number, origin: { lat: number; lon: number }): Point {
  const k = (Math.PI / 180) * 6371008.8;
  return { x: (lon - origin.lon) * k * Math.cos((origin.lat * Math.PI) / 180), y: (lat - origin.lat) * k };
}
const cross = (a: Point, b: Point) => a.x * b.y - a.y * b.x;
const sub = (a: Point, b: Point) => ({ x: a.x - b.x, y: a.y - b.y });
export function crossing(p: Sample, q: Sample, gate: Gate): number | undefined {
  const r = sub(q, p),
    s = sub(gate.b, gate.a),
    den = cross(r, s);
  if (Math.abs(den) < 1e-9 || (gate.direction && Math.sign(den) !== gate.direction)) return;
  const offset = sub(gate.a, p),
    u = cross(offset, r) / den,
    v = cross(offset, s) / den;
  if (v > 0 && v <= 1 && u >= 0 && u <= 1) return p.t + v * (q.t - p.t);
}
export function interpolate(xs: number[], ys: number[], x: number): number {
  if (!xs.length) return NaN;
  let lo = 0,
    hi = xs.length - 1;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[hi]) return ys[hi];
  while (hi - lo > 1) {
    const mid = (lo + hi) >>> 1;
    if (xs[mid] <= x) lo = mid;
    else hi = mid;
  }
  return ys[lo] + ((ys[hi] - ys[lo]) * (x - xs[lo])) / (xs[hi] - xs[lo]);
}
/** Closest return after travelling away; orient a 24 m gate across the trajectory. */
export function autoGate(samples: Sample[], minTime = 20): Gate | undefined {
  if (samples.length < 3) return;
  const start = samples[0];
  let best = Infinity,
    index = -1,
    away = false;
  for (let i = 1; i < samples.length; i++) {
    const d = Math.hypot(samples[i].x - start.x, samples[i].y - start.y);
    if (d > 30) away = true;
    if (away && samples[i].t - start.t >= minTime && d < best) {
      best = d;
      index = i;
    }
  }
  if (index < 1 || best > 30) return;
  const v = sub(samples[index], samples[index - 1]),
    n = Math.hypot(v.x, v.y);
  if (n === 0) return;
  const c = samples[index];
  return {
    a: { x: c.x - (v.y / n) * 12, y: c.y + (v.x / n) * 12 },
    b: { x: c.x + (v.y / n) * 12, y: c.y - (v.x / n) * 12 },
    direction: -1
  };
}
export function classifySkidpad(yaws: number[]): string[] {
  let previous = 0,
    count = 0;
  return yaws.map((yaw) => {
    const sign = Math.sign(yaw);
    if (!sign) return "Invalid yaw";
    count = sign === previous ? count + 1 : 1;
    previous = sign;
    return (sign < 0 ? "R" : "L") + count;
  });
}
/** Standstills are collapsed before inverting distance. Both endpoints are retained. */
export function resample(distances: number[], times: number[], length: number, spacing = 1) {
  if (!Number.isFinite(length) || !Number.isFinite(spacing) || !(length > 0) || !(spacing > 0) || !distances.length)
    return [];
  const ds: number[] = [],
    ts: number[] = [],
    total = distances.at(-1)! - distances[0];
  if (!Number.isFinite(total) || !(total > 0)) return [];
  distances.forEach((d, i) => {
    const x = ((d - distances[0]) / total) * length;
    if (!ds.length || x > ds.at(-1)!) {
      ds.push(x);
      ts.push(times[i] - times[0]);
    }
  });
  const grid: { distance: number; time: number }[] = [];
  // Preserve metre spacing for ordinary laps; corrupt lengths must never size an allocation.
  const count = Math.min(Math.ceil(length / spacing), Math.max(4096, distances.length * 4));
  for (let i = 0; i < count; i++) {
    const d = i * Math.max(spacing, length / count);
    grid.push({ distance: d, time: interpolate(ds, ts, d) });
  }
  grid.push({ distance: length, time: times.at(-1)! - times[0] });
  return grid;
}
export function deltaTime(lap: Lap, reference: Lap, distance: number): number {
  const at = (l: Lap) =>
    interpolate(
      l.grid.map((p) => p.distance),
      l.grid.map((p) => p.time),
      distance
    );
  return at(lap) - at(reference);
}
export function analyze(input: Sample[], config: LapConfig = {}): LapResult {
  const samples: LapResult["samples"] = [];
  input.forEach((p) => {
    if (![p.t, p.x, p.y].every(Number.isFinite) || (samples.length && p.t <= samples.at(-1)!.t)) return;
    const prev = samples.at(-1);
    let distance = prev?.distance ?? 0;
    if (prev) {
      const dt = p.t - prev.t;
      distance +=
        dt <= 0.5 &&
        Number.isFinite(p.speed) &&
        Number.isFinite(prev.speed) &&
        p.speed! >= 0 &&
        p.speed! <= 100 &&
        prev.speed! >= 0 &&
        prev.speed! <= 100
          ? Math.max(0, (p.speed! + prev.speed!) / 2) * dt
          : Math.hypot(p.x - prev.x, p.y - prev.y);
    }
    samples.push({ ...p, distance });
  });
  const gate = config.gate ?? autoGate(samples, config.minTime);
  const result: LapResult = { laps: [], samples, gate, theoretical: [] };
  if (samples.length < 2) return result;
  const times = samples.map((p) => p.t),
    distances = samples.map((p) => p.distance);
  const dAt = (t: number) => interpolate(times, distances, t);
  const min = config.minTime ?? (config.mode === "skidpad" ? 4 : config.mode === "accel" ? 0 : 20);
  let boundaries: number[] = [],
    source = "gps";
  // Only consecutive integer increments, confirmed by the following sample, are counters.
  // A boolean beacon must similarly remain high for two samples. Never trust arbitrary positive IDs.
  const counters: number[] = [],
    beacons: number[] = [];
  for (let i = 1; i < samples.length; i++) {
    const p = samples[i],
      prev = samples[i - 1],
      next = samples[i + 1];
    if (
      Number.isSafeInteger(prev.counter) &&
      prev.counter! >= 0 &&
      p.counter === prev.counter! + 1 &&
      (!next || next.counter === p.counter)
    )
      counters.push(p.t);
    if (prev.beacon === 0 && p.beacon === 1 && next?.beacon === 1) beacons.push(p.t);
  }
  // A beacon is a mostly-low 0/1 pulse. Any other value, or idling high, means it can't mark laps.
  const beaconValues = samples.map((p) => p.beacon).filter((b) => b !== undefined);
  const beaconUsable =
    beaconValues.every((b) => b === 0 || b === 1) &&
    beaconValues.filter((b) => b === 1).length < beaconValues.length / 2;
  if (config.manual?.length) {
    source = "manual";
    boundaries = config.manual.filter((t) => Number.isFinite(t) && t >= times[0] && t <= times.at(-1)!);
  } else if (!config.gate && counters.length) {
    source = "counter";
    boundaries = counters;
  } else if (!config.gate && beaconUsable && beacons.length) {
    source = "beacon";
    boundaries = beacons;
  } else if (gate) {
    let armed = true,
      last = -Infinity;
    const center = { x: (gate.a.x + gate.b.x) / 2, y: (gate.a.y + gate.b.y) / 2 };
    for (let i = 1; i < samples.length; i++) {
      const p = samples[i];
      if (Math.hypot(p.x - center.x, p.y - center.y) >= (config.rearm ?? 30)) armed = true;
      const t = crossing(samples[i - 1], p, gate);
      if (armed && t !== undefined && t - last >= min) {
        boundaries.push(t);
        last = t;
        armed = false;
      }
    }
  } else if (
    Number.isFinite(config.length) &&
    config.length! > 0 &&
    distances.at(-1)! / config.length! <= samples.length
  ) {
    source = "distance";
    boundaries.push(times[0]);
    for (let d = config.length!; d <= distances.at(-1)!; d += config.length!)
      boundaries.push(Math.abs(d - distances.at(-1)!) < 1e-8 ? times.at(-1)! : interpolate(distances, times, d));
  }
  boundaries = [...new Set(boundaries)].sort((a, b) => a - b);
  if (config.mode === "accel") {
    source = "accel";
    boundaries = [];
    for (let i = 1; i < samples.length; i++)
      if ((samples[i - 1].speed ?? 0) <= 0.5 && (samples[i].speed ?? 0) > 0.5) {
        const start = samples[i - 1].t,
          target = dAt(start) + 75;
        if (target <= distances.at(-1)!) {
          boundaries.push(start, interpolate(distances, times, target));
          while (i < samples.length - 1 && samples[i].t < boundaries.at(-1)!) i++;
        }
      }
  }
  if (config.mode === "autocross" && config.finish) {
    boundaries = boundaries.flatMap((start) => {
      const end = samples
        .slice(1)
        .map((p, i) => crossing(samples[i], p, config.finish!))
        .find((t) => t !== undefined && t > start + min);
      return end === undefined ? [] : [start, end];
    });
  }
  const runPairs =
    config.mode === "accel" || (config.mode === "autocross" && config.finish)
      ? boundaries.filter((_, i) => i % 2 === 0).map((start, i) => [start, boundaries[i * 2 + 1]])
      : undefined;
  const edges = [times[0], ...boundaries.filter((t) => t > times[0] && t < times.at(-1)!), times.at(-1)!];
  let stint = 1,
    stopStart: number | undefined;
  const stops: number[] = [];
  samples.forEach((p) => {
    if ((p.speed ?? Infinity) < 0.5) stopStart ??= p.t;
    else {
      if (stopStart !== undefined && p.t - stopStart > 60) stops.push(p.t);
      stopStart = undefined;
    }
  });
  for (let i = 0; i < edges.length - 1; i++) {
    const start = edges[i],
      end = edges[i + 1],
      complete = runPairs
        ? runPairs.some((pair) => pair[0] === start && pair[1] === end)
        : boundaries.includes(start) && boundaries.includes(end);
    if (end - start < 1e-8) continue;
    if (config.mode === "endurance") stint = 1 + stops.filter((t) => t <= start).length;
    const inside = samples.filter((p) => p.t > start && p.t < end);
    const ts = [start, ...inside.map((p) => p.t), end],
      ds = ts.map(dAt);
    const length = complete && config.mode !== "accel" ? config.length ?? ds.at(-1)! - ds[0] : ds.at(-1)! - ds[0];
    const grid = resample(ds, ts, length);
    let splits = (config.fractions ?? [1 / 3, 2 / 3])
      .filter((f) => f > 0 && f < 1)
      .sort((a, b) => a - b)
      .map(
        (f) =>
          start +
          interpolate(
            grid.map((p) => p.distance),
            grid.map((p) => p.time),
            f * length
          )
      );
    if (config.sectors?.length)
      splits = config.sectors.map(
        (g) =>
          samples
            .slice(1)
            .map((p, j) => crossing(samples[j], p, g))
            .find((t) => t !== undefined && t > start && t < end) ?? NaN
      );
    const sectorEdges = [start, ...splits, end];
    const valid =
      complete &&
      end - start >= min &&
      !ts.some((t, j) => j > 0 && t - ts[j - 1] > 1) &&
      !stops.some((t) => t > start && t < end);
    result.laps.push({
      index: i,
      start,
      end,
      complete,
      source,
      distance: length,
      grid,
      sectors: sectorEdges.slice(1).map((t, j) => t - sectorEdges[j]),
      label: complete ? "Flying" : "Partial",
      stint,
      valid
    });
  }
  if (config.mode === "skidpad") {
    const laps = result.laps.filter((l) => l.complete);
    const labels = classifySkidpad(
      laps.map((l) => {
        const ys = samples.filter((p) => p.t >= l.start && p.t < l.end).map((p) => p.yaw ?? 0);
        return ys.reduce((a, b) => a + b, 0);
      })
    );
    laps.forEach((l, i) => {
      l.label = labels[i];
      l.valid = l.valid && ["R2", "L2"].includes(l.label);
    });
  }
  const valid = result.laps.filter((l) => l.valid);
  result.best = valid.reduce<Lap | undefined>(
    (best, l) => (!best || l.end - l.start < best.end - best.start ? l : best),
    undefined
  )?.index;
  result.theoretical = (valid[0]?.sectors ?? []).map((_, i) =>
    valid.reduce((best, l) => (Number.isFinite(l.sectors[i]) ? Math.min(best, l.sectors[i]) : best), Infinity)
  );
  return result;
}

/**
 * Maps the raw samples inside a lap onto its x axis (lap time or lap distance) without touching the
 * values. The sample held at the lap start is kept so stepped traces begin at the right level.
 */
export function lapSamples(
  timestamps: number[],
  values: number[],
  lap: { start: number; end: number; grid: { time: number; distance: number }[] },
  distance: boolean
): { timestamps: number[]; values: number[] } {
  const gridTimes = lap.grid.map((p) => p.time);
  const gridDistances = lap.grid.map((p) => p.distance);
  const x = (lapTime: number) => (distance ? interpolate(gridTimes, gridDistances, lapTime) : lapTime);
  const result: { timestamps: number[]; values: number[] } = { timestamps: [], values: [] };
  let held: number | null = null;
  for (let i = 0; i < timestamps.length; i++) {
    if (timestamps[i] < lap.start) {
      held = values[i];
    } else if (timestamps[i] <= lap.end) {
      if (held !== null) {
        if (timestamps[i] > lap.start) {
          result.timestamps.push(x(0));
          result.values.push(held);
        }
        held = null;
      }
      result.timestamps.push(x(timestamps[i] - lap.start));
      result.values.push(values[i]);
    } else {
      break;
    }
  }
  return result;
}
