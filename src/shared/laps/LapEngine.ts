// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Finds laps and sectors from telemetry samples and calculates distance and time comparisons.

export type Point = { x: number; y: number };
export type Coordinate = { lat: number; lon: number };
export type GeographicGate = { a: Coordinate; b: Coordinate; direction?: number };
export type Gate = { a: Point; b: Point; direction?: number };
export type Sample = Point & { t: number; speed?: number; counter?: number; beacon?: number; yaw?: number };
export type LapConfig = {
  geographic?: { gate?: GeographicGate; sectors?: GeographicGate[]; finish?: GeographicGate };
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
  sectorTimes?: number[];
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
export function unproject(point: Point, origin: Coordinate): Coordinate {
  const k = (Math.PI / 180) * 6371008.8;
  return { lat: origin.lat + point.y / k, lon: origin.lon + point.x / (k * Math.cos((origin.lat * Math.PI) / 180)) };
}
export function geographicGate(gate: Gate, origin: Coordinate): GeographicGate {
  return { a: unproject(gate.a, origin), b: unproject(gate.b, origin), direction: gate.direction };
}
export function projectConfig(config: LapConfig, origin?: Coordinate): LapConfig {
  const local = (gate: GeographicGate): Gate => ({
    a: project(gate.a.lat, gate.a.lon, origin!),
    b: project(gate.b.lat, gate.b.lon, origin!),
    direction: gate.direction
  });
  const geo = config.geographic;
  return {
    ...config,
    gate: origin && geo?.gate ? local(geo.gate) : config.gate,
    sectors: origin && geo?.sectors ? [...geo.sectors.map(local), ...(config.sectors ?? [])] : config.sectors,
    finish: origin && geo?.finish ? local(geo.finish) : config.finish
  };
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
/** The first index whose time is at least `time`, or above it when `after` is set. Times must increase. */
export function indexAt(samples: { t: number }[], time: number, after = false): number {
  let lo = 0,
    hi = samples.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (after ? samples[mid].t <= time : samples[mid].t < time) lo = mid + 1;
    else hi = mid;
  }
  return lo;
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
/**
 * A 24 m line across the direction of travel, near the sample nearest a time. The car may be stopped
 * there or the log may end there, so travel comes from the next sample 1 m away, or else the last one.
 * The line sits 0.5 m from the sample, because a sample exactly on it can round to neither side.
 */
export function gateAt(samples: Sample[], time: number): Gate | undefined {
  if (!samples.length) return;
  const i = samples.reduce((best, p, j) => (Math.abs(p.t - time) < Math.abs(samples[best].t - time) ? j : best), 0),
    p = samples[i],
    moved = (q: Sample) => Math.hypot(q.x - p.x, q.y - p.y) >= 1,
    next = samples.slice(i + 1).find(moved),
    q = next ?? samples.slice(0, i).reverse().find(moved);
  if (!q) return;
  const sign = next ? 1 : -1,
    n = Math.hypot(q.x - p.x, q.y - p.y),
    dx = (sign * (q.x - p.x)) / n,
    dy = (sign * (q.y - p.y)) / n,
    c = { x: p.x + (sign * dx) / 2, y: p.y + (sign * dy) / 2 };
  return {
    a: { x: c.x - dy * 12, y: c.y + dx * 12 },
    b: { x: c.x + dy * 12, y: c.y - dx * 12 },
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
  const at = (l: Lap) => {
    const grid = l.grid;
    if (!grid.length) return NaN;
    let lo = 0,
      hi = grid.length - 1;
    if (distance <= grid[lo].distance) return grid[lo].time;
    if (distance >= grid[hi].distance) return grid[hi].time;
    while (hi - lo > 1) {
      const mid = (lo + hi) >>> 1;
      if (grid[mid].distance <= distance) lo = mid;
      else hi = mid;
    }
    return (
      grid[lo].time +
      ((grid[hi].time - grid[lo].time) * (distance - grid[lo].distance)) / (grid[hi].distance - grid[lo].distance)
    );
  };
  return at(lap) - at(reference);
}
/** Known gate crossings follow travel order. Missed gates keep their unknown sector positions. */
export function sectorCrossings(samples: Sample[], lap: { start: number; end: number }, gates: Gate[]) {
  const crossings = gates.map((gate, index) => {
    for (let j = Math.max(0, indexAt(samples, lap.start) - 2); j < samples.length - 1 && samples[j].t < lap.end; j++) {
      const time = crossing(samples[j], samples[j + 1], gate);
      if (time !== undefined && time > lap.start && time < lap.end) return { index, time };
    }
    return { index, time: NaN };
  });
  const ordered = crossings.filter((crossing) => Number.isFinite(crossing.time)).sort((a, b) => a.time - b.time);
  let next = 0;
  return crossings.map((crossing) => (Number.isFinite(crossing.time) ? ordered[next++] : crossing));
}

/** Reuses sample prefixes and scan checkpoints until an input or configuration edit changes them. */
export class LapAnalysisCache {
  samples: LapResult["samples"] = [];
  times: number[] = [];
  distances: number[] = [];
  scans = new Map<string, { offset: number; before: unknown; states: unknown[] }>();
  grids = new Map<string, { grid: Lap["grid"]; splits: number[]; gap: boolean; yaw: number }>();
  signature = "";
  from = 0;
  processed = 0;
  scan<T>(name: string, initial: T, step: (state: T, i: number) => T): T {
    let entry = this.scans.get(name);
    if (!entry || this.from < entry.offset) {
      if (this.scans.size >= 16) this.scans.delete(this.scans.keys().next().value!);
      this.scans.set(name, (entry = { offset: 0, before: initial, states: [] }));
    }
    const states = entry.states as T[];
    states.length = Math.min(states.length, this.from - entry.offset);
    for (let i = entry.offset + states.length; i < this.samples.length; i++) {
      states.push(step(states.length ? states.at(-1)! : (entry.before as T), i));
      this.processed++;
    }
    const result = states.length ? states.at(-1)! : (entry.before as T);
    // Keep checkpoints for a bounded tail. An older edit takes the full-analysis path.
    if (states.length > 4096) {
      const trim = states.length - 4096;
      entry.before = states[trim - 1];
      states.splice(0, trim);
      entry.offset += trim;
    }
    return result;
  }
}
type TimeLink = { time: number; previous?: TimeLink };
function linkTimes(link?: TimeLink): number[] {
  const times: number[] = [];
  while (link) {
    times.push(link.time);
    link = link.previous;
  }
  return times.reverse();
}

export function analyze(
  input: Sample[],
  config: LapConfig = {},
  cache?: LapAnalysisCache,
  changedFrom = -Infinity
): LapResult {
  const signature = JSON.stringify(config);
  if (cache && signature !== cache.signature) {
    cache.samples = [];
    cache.times = [];
    cache.distances = [];
    cache.scans.clear();
    cache.grids.clear();
    cache.signature = signature;
    changedFrom = -Infinity;
  }
  const samples: LapResult["samples"] = cache?.samples ?? [];
  if (cache && changedFrom === -Infinity) cache.grids.clear();
  const retained = cache ? indexAt(samples, changedFrom) : 0;
  samples.length = retained;
  if (cache) {
    cache.times.length = retained;
    cache.distances.length = retained;
    cache.from = Math.max(0, retained - 2);
  }
  input.slice(cache ? indexAt(input, changedFrom) : 0).forEach((p) => {
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
    cache?.times.push(p.t);
    cache?.distances.push(distance);
    if (cache) cache.processed++;
  });
  const scan = <T>(name: string, initial: T, step: (state: T, i: number) => T): T => {
    if (cache) return cache.scan(name, initial, step);
    let state = initial;
    for (let i = 0; i < samples.length; i++) state = step(state, i);
    return state;
  };
  const auto = scan("auto", { away: false, best: Infinity, index: -1 }, (state, i) => {
    if (!i) return state;
    const d = Math.hypot(samples[i].x - samples[0].x, samples[i].y - samples[0].y);
    const away = state.away || d > 30;
    return away && samples[i].t - samples[0].t >= (config.minTime ?? 20) && d < state.best
      ? { away, best: d, index: i }
      : { ...state, away };
  });
  let automatic: Gate | undefined;
  if (samples.length >= 3 && auto.index >= 1 && auto.best <= 30) {
    const c = samples[auto.index],
      v = sub(c, samples[auto.index - 1]),
      n = Math.hypot(v.x, v.y);
    if (n)
      automatic = {
        a: { x: c.x - (v.y / n) * 12, y: c.y + (v.x / n) * 12 },
        b: { x: c.x + (v.y / n) * 12, y: c.y - (v.x / n) * 12 },
        direction: -1
      };
  }
  const gate = config.gate ?? automatic;
  const result: LapResult = { laps: [], samples, gate, theoretical: [] };
  if (samples.length < 2) return result;
  const times = cache?.times ?? samples.map((p) => p.t),
    distances = cache?.distances ?? samples.map((p) => p.distance);
  const dAt = (t: number) => interpolate(times, distances, t);
  const min = config.minTime ?? (config.mode === "skidpad" ? 4 : config.mode === "accel" ? 0 : 20);
  let boundaries: number[] = [],
    source = "gps";
  // Only consecutive integer increments, confirmed by the following sample, are counters.
  // A boolean beacon must similarly remain high for two samples. Never trust arbitrary positive IDs.
  const signals = scan(
    "signals",
    {
      counter: undefined as TimeLink | undefined,
      beacon: undefined as TimeLink | undefined,
      count: 0,
      high: 0,
      invalid: false
    },
    (state, i) => {
      const p = samples[i],
        prev = samples[i - 1],
        next = samples[i + 1];
      return {
        counter:
          prev &&
          Number.isSafeInteger(prev.counter) &&
          prev.counter! >= 0 &&
          p.counter === prev.counter! + 1 &&
          (!next || next.counter === p.counter)
            ? { time: p.t, previous: state.counter }
            : state.counter,
        beacon:
          prev?.beacon === 0 && p.beacon === 1 && next?.beacon === 1
            ? { time: p.t, previous: state.beacon }
            : state.beacon,
        count: state.count + Number(p.beacon !== undefined),
        high: state.high + Number(p.beacon === 1),
        invalid: state.invalid || (p.beacon !== undefined && p.beacon !== 0 && p.beacon !== 1)
      };
    }
  );
  const counters = linkTimes(signals.counter),
    beacons = linkTimes(signals.beacon);
  const beaconUsable = !signals.invalid && signals.high < signals.count / 2;
  /** Debounced crossings of a line. A dragged line has no direction, so laps run the way the car crosses it most. */
  const crossings = (line: Gate) => {
    const times: number[] = [],
      center = { x: (line.a.x + line.b.x) / 2, y: (line.a.y + line.b.y) / 2 };
    let direction = line.direction;
    if (!direction) {
      const votes = scan(JSON.stringify(["votes", line]), { sum: 0, first: 0 }, (state, i) => {
        if (!i || crossing(samples[i - 1], samples[i], line) === undefined) return state;
        const sign = Math.sign(cross(sub(samples[i], samples[i - 1]), sub(line.b, line.a)));
        return { sum: state.sum + sign, first: state.first || sign };
      });
      direction = Math.sign(votes.sum) || votes.first;
    }
    const directed = { ...line, direction };
    const rearm = config.rearm ?? (config.gate ? 12 : 30);
    const state = scan(
      JSON.stringify(["crossings", directed]),
      { armed: true, last: -Infinity, link: undefined as TimeLink | undefined },
      (state, i) => {
        if (!i) return state;
        const p = samples[i];
        let armed = state.armed || Math.hypot(p.x - center.x, p.y - center.y) >= rearm;
        const t = crossing(samples[i - 1], p, directed);
        if (armed && t !== undefined && t - state.last >= min)
          return { armed: false, last: t, link: { time: t, previous: state.link } };
        return { ...state, armed };
      }
    );
    times.push(...linkTimes(state.link));
    return times;
  };
  // A drawn line wins unless the car doesn't cross it, as on another log. Autocross needs only the start of a run.
  const drawn = config.gate ? crossings(config.gate) : [];
  const usesDrawnLine = !config.manual?.length && drawn.length >= (config.mode === "autocross" ? 1 : 2);
  if (config.manual?.length) {
    source = "manual";
    boundaries = config.manual.filter((t) => Number.isFinite(t) && t >= times[0] && t <= times.at(-1)!);
  } else if (usesDrawnLine) {
    boundaries = drawn;
  } else if (counters.length) {
    source = "counter";
    boundaries = counters;
  } else if (beaconUsable && beacons.length) {
    source = "beacon";
    boundaries = beacons;
  } else if (gate) {
    boundaries = crossings(gate);
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
    const runs = scan(
      "accel",
      { start: undefined as number | undefined, target: 0, link: undefined as TimeLink | undefined },
      (state, i) => {
        if (!i) return state;
        if (state.start !== undefined) {
          if (samples[i].distance < state.target) return state;
          return {
            start: undefined,
            target: 0,
            link: {
              time: interpolate(distances, times, state.target),
              previous: { time: state.start, previous: state.link }
            }
          };
        }
        if ((samples[i - 1].speed ?? 0) <= 0.5 && (samples[i].speed ?? 0) > 0.5) {
          const start = samples[i - 1].t,
            target = dAt(start) + 75;
          if (samples[i].distance >= target)
            return {
              start: undefined,
              target: 0,
              link: {
                time: interpolate(distances, times, target),
                previous: { time: start, previous: state.link }
              }
            };
          return { ...state, start, target };
        }
        return state;
      }
    );
    boundaries = linkTimes(runs.link);
  }
  if (config.mode === "autocross" && config.finish) {
    const finishes = scan("finish", undefined as TimeLink | undefined, (link, i) => {
      if (!i) return link;
      const time = crossing(samples[i - 1], samples[i], config.finish!);
      return time === undefined ? link : { time, previous: link };
    });
    const finishTimes = linkTimes(finishes);
    boundaries = boundaries.flatMap((start) => {
      let lo = 0,
        hi = finishTimes.length;
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (finishTimes[mid] <= start + min) lo = mid + 1;
        else hi = mid;
      }
      return lo === finishTimes.length ? [] : [start, finishTimes[lo]];
    });
  }
  const runPairs =
    config.mode === "accel" || (config.mode === "autocross" && config.finish)
      ? boundaries.filter((_, i) => i % 2 === 0).map((start, i) => [start, boundaries[i * 2 + 1]])
      : undefined;
  const edges = [times[0], ...boundaries.filter((t) => t > times[0] && t < times.at(-1)!), times.at(-1)!];
  let stint = 1;
  const stopState = scan(
    "stops",
    { start: undefined as number | undefined, link: undefined as TimeLink | undefined },
    (state, i) => {
      const p = samples[i];
      if ((p.speed ?? Infinity) < 0.5) return { ...state, start: state.start ?? p.t };
      return {
        start: undefined,
        link: state.start !== undefined && p.t - state.start > 60 ? { time: p.t, previous: state.link } : state.link
      };
    }
  );
  const stops = linkTimes(stopState.link);
  for (let i = 0; i < edges.length - 1; i++) {
    const start = edges[i],
      end = edges[i + 1],
      complete = runPairs
        ? runPairs.some((pair) => pair[0] === start && pair[1] === end)
        : boundaries.includes(start) && boundaries.includes(end);
    if (end - start < 1e-8) continue;
    if (config.mode === "endurance") stint = 1 + stops.filter((t) => t <= start).length;
    const gridKey = JSON.stringify([start, end, complete]);
    const saved = end < changedFrom ? cache?.grids.get(gridKey) : undefined;
    const inside = saved ? [] : samples.slice(indexAt(samples, start, true), indexAt(samples, end));
    const ts = [start, ...inside.map((p) => p.t), end],
      ds = ts.map(dAt);
    const length = complete && config.mode !== "accel" ? config.length ?? ds.at(-1)! - ds[0] : ds.at(-1)! - ds[0];
    const grid = saved?.grid ?? resample(ds, ts, length);
    let splits =
      saved?.splits ??
      (config.fractions ?? [1 / 3, 2 / 3])
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
    if (!saved && config.sectors?.length)
      splits = sectorCrossings(samples, { start, end }, config.sectors).map((crossing) => crossing.time);
    const gap = saved?.gap ?? ts.some((t, j) => j > 0 && t - ts[j - 1] > 1);
    const yaw =
      saved?.yaw ??
      samples.slice(indexAt(samples, start), indexAt(samples, end)).reduce((sum, p) => sum + (p.yaw ?? 0), 0);
    if (cache && complete && !saved) cache.grids.set(gridKey, { grid, splits, gap, yaw });
    const sectorEdges = [start, ...splits, end];
    const valid =
      complete &&
      end - start >= min &&
      // Crossings of a drawn line time the lap, so a GPS gap between them can't change the time.
      (usesDrawnLine || !gap) &&
      !stops.some((t) => t > start && t < end);
    result.laps.push({
      index: i,
      start,
      end,
      complete,
      source,
      distance: length,
      grid,
      ...(config.sectors?.length ? { sectorTimes: sectorEdges } : {}),
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
        const saved = cache?.grids.get(JSON.stringify([l.start, l.end, l.complete]));
        if (saved) return saved.yaw;
        const ys = samples.slice(indexAt(samples, l.start), indexAt(samples, l.end)).map((p) => p.yaw ?? 0);
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

/** The times a lap enters each sector, then its end. A gate the car missed gives NaN. */
function sectorEdgeTimes(lap: Lap): number[] {
  const edges = lap.sectorTimes ?? [lap.start];
  if (!lap.sectorTimes) for (const duration of lap.sectors) edges.push(edges.at(-1)! + duration);
  return edges;
}

/** Return only a sector whose start and end crossings are known. */
export function sectorAt(lap: Lap, time: number): number | undefined {
  const edges = sectorEdgeTimes(lap);
  for (let i = 0; i < edges.length - 1; i++) {
    if (Number.isFinite(edges[i]) && Number.isFinite(edges[i + 1]) && time >= edges[i] && time < edges[i + 1]) return i;
  }
}

/**
 * One block per sector of a lap, in lap distance, for the split bar over the Line Graph. A lap with one
 * sector has no split bar, and a sector whose gate the car missed has no block.
 */
export function sectorBlocks(lap: Lap): { start: number; end: number; label: string }[] {
  if (lap.sectors.length < 2) return [];
  const times = lap.grid.map((p) => p.time),
    distances = lap.grid.map((p) => p.distance);
  const edges = sectorEdgeTimes(lap).map((t, i, all) =>
    i === 0 ? 0 : i === all.length - 1 ? lap.distance : interpolate(times, distances, t - lap.start)
  );
  return edges
    .slice(1)
    .map((end, i) => ({ start: edges[i], end, label: `S${i + 1}` }))
    .filter((block) => Number.isFinite(block.start) && Number.isFinite(block.end) && block.end > block.start);
}

/** The box around a lap's trace between two lap distances, or undefined if no sample falls in it. */
export function sectorBounds(
  lap: Lap,
  samples: Sample[],
  range: [number, number]
): [number, number, number, number] | undefined {
  const times = lap.grid.map((p) => p.time),
    distances = lap.grid.map((p) => p.distance);
  // The trace runs straight between samples, so the box includes the points where it crosses each edge.
  const points: Point[] = [];
  const at = (distance: number) => {
    const t = lap.start + interpolate(distances, times, distance),
      i = samples.findIndex((p) => p.t >= t);
    if (i < 1) return;
    const p = samples[i - 1],
      q = samples[i],
      f = (t - p.t) / (q.t - p.t);
    points.push({ x: p.x + (q.x - p.x) * f, y: p.y + (q.y - p.y) * f });
  };
  at(range[0]);
  for (const p of samples) {
    if (p.t < lap.start || p.t > lap.end) continue;
    const distance = interpolate(times, distances, p.t - lap.start);
    if (distance >= range[0] && distance <= range[1]) points.push(p);
  }
  at(range[1]);
  if (!points.length) return;
  const box: [number, number, number, number] = [Infinity, -Infinity, Infinity, -Infinity];
  for (const p of points) {
    box[0] = Math.min(box[0], p.x);
    box[1] = Math.max(box[1], p.x);
    box[2] = Math.min(box[2], p.y);
    box[3] = Math.max(box[3], p.y);
  }
  return box;
}
