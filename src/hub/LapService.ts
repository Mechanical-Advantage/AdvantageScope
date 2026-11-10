// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Reads lap sources from the log and shares lap results, selections, and overlays across tabs.

import {
  analyze,
  Coordinate,
  Gate,
  geographicGate,
  indexAt,
  interpolate,
  LapAnalysisCache,
  LapConfig,
  LapResult,
  project,
  projectConfig,
  Sample
} from "../shared/laps/LapEngine";
import { slipRatio } from "../shared/laps/SlipRatio";
import Log from "../shared/log/Log";
import LoggableType from "../shared/log/LoggableType";
import { fixedSampleCount } from "../shared/util";

export type LapSettings = {
  latitude: string;
  longitude: string;
  frontLeft: string;
  frontRight: string;
  speed: string;
  rpm: string;
  yaw: string;
  counter: string;
  beacon: string;
  radius: number;
  ratio: number;
  config: LapConfig;
};
export type LapSourceRole = Exclude<keyof LapSettings, "radius" | "ratio" | "config">;
export const LAP_COLORS = ["#58a7ff", "#f4b860", "#72d6a0", "#d49bff", "#ff8c9c", "#70d6de"];
const SOURCE_ROLES: LapSourceRole[] = [
  "latitude",
  "longitude",
  "frontLeft",
  "frontRight",
  "speed",
  "rpm",
  "yaw",
  "counter",
  "beacon"
];
/** Whether a channel already holds exactly what writing these values to an empty channel would store. */
function storedAs(key: string, times: number[], values: number[]): boolean {
  const stored = window.log.getNumber(key, -Infinity, Infinity);
  if (!stored || !times.length) return false;
  // Log keeps only the first of consecutive equal values.
  let n = 0;
  for (let i = 0; i < times.length; i++) {
    if (n && values[i] === values[i - 1]) continue;
    if (stored.timestamps[n] !== times[i] || !Object.is(stored.values[n], values[i])) return false;
    n++;
  }
  return n === stored.timestamps.length;
}
export class LapService {
  settings: LapSettings = {
    latitude: "",
    longitude: "",
    frontLeft: "",
    frontRight: "",
    speed: "",
    rpm: "",
    yaw: "",
    counter: "",
    beacon: "",
    radius: 0.203,
    ratio: 39 / 9,
    config: {}
  };
  result: LapResult = { laps: [], samples: [], theoretical: [] };
  origin?: Coordinate;
  localConfig() {
    return projectConfig(this.settings.config, this.origin);
  }
  setGate(index: number, gate: Gate) {
    const config = this.settings.config;
    if (this.origin) {
      const local = this.localConfig();
      const geo = (config.geographic ??= {});
      const saved = geographicGate(gate, this.origin);
      if (index === -2) {
        geo.finish = saved;
        delete config.finish;
      } else if (index < 0) {
        geo.gate = saved;
        delete config.gate;
      } else {
        const sectors = local.sectors ?? [];
        sectors[index] = gate;
        geo.sectors = sectors.map((sector) => geographicGate(sector, this.origin!));
        delete config.sectors;
      }
    } else if (index === -2) config.finish = gate;
    else if (index < 0) config.gate = gate;
    else (config.sectors ??= [])[index] = gate;
    this.invalidate();
  }
  reference: number | null = null;
  /** The stretch of a lap, in lap distance, last double-clicked on a Line Graph's split bar. The Track Map zooms to it. */
  focus?: { lap: number; range: [number, number]; id: number };
  overlays: number[] = [];
  private autoOverlays = true;
  selected: number | null = null;
  version = 0;
  private log?: Log;
  private signature = "";
  private sampleSignature = "";
  /** The origin of the last log's track, kept until the next log has its own origin. */
  private switchOrigin?: Coordinate;
  private samples: Sample[] = [];
  private analysis = new LapAnalysisCache();
  private referenceAnalysis = new LapAnalysisCache();
  private inputCache = new Map<string, { timestamps: number[]; values: number[]; version: number }>();
  private inputStart = -Infinity;
  private sourceSignature = "";
  private nextUpdate = 0;
  private derivedEnd = -Infinity;
  private slipEnd = -Infinity;
  private slipSignature = "";
  private derivedSignature = "";
  private derivedLapStart = -Infinity;
  private grids = new WeakMap<object, { d: number[]; t: number[] }>();
  private sourceLog?: Log;
  private cleared = new Set<LapSourceRole>();
  private sourcesChecked = false;
  setSource(role: LapSourceRole, key: string) {
    this.fields();
    this.settings[role] = key;
    if (key) this.cleared.delete(role);
    else this.cleared.add(role);
    this.invalidate();
  }
  fields(): string[] {
    const keys = window.log.getFieldKeys().filter((k) => !k.startsWith("Laps/"));
    const find = (pattern: RegExp) =>
      keys.find((k) => pattern.test(k) && window.log.getType(k) === LoggableType.Number) ?? "";
    const s = this.settings;
    if (this.sourceLog !== window.log) {
      this.sourceLog = window.log;
      this.cleared.clear();
      this.sourcesChecked = false;
    }
    // Another log's paths give way once this log's fields arrive. After that a missing path stays, shown as missing.
    if (keys.length && !this.sourcesChecked) {
      this.sourcesChecked = true;
      for (const role of SOURCE_ROLES) if (s[role] && !keys.includes(s[role])) s[role] = "";
    }
    if (!this.cleared.has("latitude")) s.latitude ||= find(/front.*latitude$/i) || find(/(?:gps\/latitude|latitude)$/i);
    if (!this.cleared.has("longitude"))
      s.longitude ||= find(/front.*longitude$/i) || find(/(?:gps\/longitude|longitude)$/i);
    if (!this.cleared.has("frontLeft")) s.frontLeft ||= find(/(?:DASH_SpeedFL|wheel_speed_fl|WheelSpeedFL)$/i);
    if (!this.cleared.has("frontRight")) s.frontRight ||= find(/(?:DASH_SpeedFR|wheel_speed_fr|WheelSpeedFR)$/i);
    if (!this.cleared.has("speed")) s.speed ||= find(/(?:vehicle_speed|ground_speed|gps.*speed)$/i);
    if (!this.cleared.has("rpm")) s.rpm ||= find(/(?:motor_speed|MotorSpeedRPM)$/i);
    if (!this.cleared.has("yaw")) s.yaw ||= find(/(?:yaw_rate|YawRate)$/i);
    if (!this.cleared.has("counter")) s.counter ||= find(/(?:lap_counter|lapcounter|lap_count)$/i);
    if (!this.cleared.has("beacon")) s.beacon ||= find(/(?:lap_beacon|beacon)$/i);
    return [
      s.latitude,
      s.longitude,
      s.frontLeft,
      s.frontRight,
      s.speed,
      s.rpm,
      s.yaw,
      s.counter,
      s.beacon,
      find(/(?:gps\/ground_speed|ground_speed)$/i)
    ].filter(Boolean);
  }
  /** A new start/finish line replaces manual splits. Either way the laps renumber, so overlays are chosen again. */
  setStartLine(gate?: Gate) {
    const config = this.settings.config;
    if (gate) {
      this.setGate(-1, gate);
      delete config.manual;
    } else {
      delete config.gate;
      if (config.geographic) delete config.geographic.gate;
    }
    this.reference = null;
    this.overlays = [];
    this.autoOverlays = true;
    this.selected = null;
    this.invalidate();
  }
  setOverlays(indices: number[]) {
    this.overlays = indices;
    this.autoOverlays = false;
  }
  /** A restored layout's paths get the same check as a new log's. */
  recheckSources() {
    this.sourcesChecked = false;
  }
  invalidate() {
    this.signature = "";
    this.nextUpdate = 0;
  }
  update() {
    if (this.log !== window.log) {
      this.log = window.log;
      // Legacy local gates already placed on a track keep that position on the next log.
      // One lone fix is not a track, so it can't anchor them.
      if (this.origin && this.result.samples.length > 1) this.switchOrigin = this.origin;
      this.origin = undefined;
      this.nextUpdate = 0;
      this.signature = "";
      this.derivedSignature = "";
      this.sampleSignature = "";
      this.inputCache.clear();
      this.sourceSignature = "";
      this.derivedEnd = -Infinity;
      this.slipEnd = -Infinity;
      this.slipSignature = "";
      this.reference = null;
      this.overlays = [];
      this.autoOverlays = true;
      this.selected = null;
    }
    if (performance.now() < this.nextUpdate) return;
    this.nextUpdate = performance.now() + 500;
    const fields = this.fields();
    const live = window.selection?.getCurrentLiveTime() != null;
    const sourceSignature = JSON.stringify([
      { ...this.settings, config: undefined },
      fields.map((key) => [key, window.log.getUnit(key)])
    ]);
    const start = window.log.getTimestampRange()[0];
    let append = live && sourceSignature === this.sourceSignature && start === this.inputStart;
    if (fields.some((key) => this.inputCache.get(key)?.version !== window.log.getHistoryVersion(key))) append = false;
    this.sourceSignature = sourceSignature;
    this.inputStart = start;
    let changedFrom = Infinity;
    const data = new Map(
      fields.map((key) => {
        const cached = append ? this.inputCache.get(key) : undefined;
        const end = cached?.timestamps.at(-1) ?? -Infinity;
        const tail = window.log.getNumber(key, end, Infinity);
        if (!cached) {
          if (tail) this.inputCache.set(key, { ...tail, version: window.log.getHistoryVersion(key) });
          changedFrom = -Infinity;
          return [key, tail] as const;
        }
        if (tail)
          for (let i = 0; i < tail.timestamps.length; i++) {
            if (tail.timestamps[i] <= end) continue;
            // Interpolation can revise the held tail when the next value arrives.
            changedFrom = Math.min(
              changedFrom,
              key === this.settings.counter || key === this.settings.beacon ? tail.timestamps[i] : end
            );
            cached.timestamps.push(tail.timestamps[i]);
            cached.values.push(tail.values[i]);
          }
        return [key, cached] as const;
      })
    );
    const inputs = JSON.stringify([
      !data.get(this.settings.latitude) ? window.log.getTimestampRange()[1] : undefined,
      fields.map((k) => [
        k,
        window.log.getUnit(k),
        window.log.getHistoryVersion(k),
        data.get(k)?.timestamps.length,
        data.get(k)?.timestamps.at(-1),
        data.get(k)?.values.at(-1)
      ])
    ]);
    const signature = JSON.stringify([this.settings, inputs]);
    if (signature === this.signature) return;
    this.signature = signature;
    const s = this.settings;
    // Samples depend on the data and sources but not on the lap settings, so an Event change reuses them.
    const sampleSignature = JSON.stringify([{ ...s, config: undefined }, inputs]);
    const reuse = sampleSignature === this.sampleSignature;
    this.sampleSignature = sampleSignature;
    const at = (key: string, t: number) => {
      const d = data.get(key);
      return d ? interpolate(d.timestamps, d.values, t) : NaN;
    };
    const speed = (key: string, t: number) => {
      let v = at(key, t);
      const unit = window.log.getUnit(key)?.toLowerCase();
      if (unit === "kilometers/hour" || unit === "km/h" || unit === "kph") v /= 3.6;
      if (unit === "radians/second" || unit === "rad/s") v *= s.radius;
      if (unit === "rotations/minute") v *= (Math.PI / 30) * s.radius;
      // Unknown units cannot safely contribute to integrated distance or slip.
      if (
        ![
          "meters/second",
          "m/s",
          "kilometers/hour",
          "km/h",
          "kph",
          "radians/second",
          "rad/s",
          "rotations/minute"
        ].includes(unit ?? "")
      )
        return NaN;
      return Number.isFinite(v) && v >= 0 && v <= 100 ? v : NaN;
    };
    const lat = data.get(s.latitude),
      lon = data.get(s.longitude);
    const base = [lat, data.get(s.counter), data.get(s.beacon), data.get(s.speed), data.get(s.frontLeft)].find(
      (d) => d?.timestamps.length
    );
    const held = (key: string, t: number) => {
      const d = data.get(key);
      if (!d?.timestamps.length) return undefined;
      let lo = 0,
        hi = d.timestamps.length;
      while (lo < hi) {
        const m = (lo + hi) >>> 1;
        if (d.timestamps[m] <= t) lo = m + 1;
        else hi = m;
      }
      return lo ? d.values[lo - 1] : undefined;
    };
    const coordinate = (key: string, t: number) => {
      const d = data.get(key);
      if (!d?.timestamps.length) return NaN;
      let i = 0,
        hi = d.timestamps.length;
      while (i < hi) {
        const m = (i + hi) >>> 1;
        if (d.timestamps[m] <= t) i = m + 1;
        else hi = m;
      }
      // Hold across a GPS outage; interpolating through it invents a shortcut.
      return i > 0 && i < d.timestamps.length && d.timestamps[i] - d.timestamps[i - 1] > 1
        ? d.values[i - 1]
        : at(key, t);
    };
    append &&= this.samples.length > 1;
    if (append && !lat) changedFrom = Math.min(changedFrom, this.samples.at(-1)!.t);
    const samples: Sample[] = reuse || append ? this.samples : [];
    if (!reuse && append) samples.length = indexAt(samples, changedFrom);
    this.samples = samples;
    const previousOrigin = this.origin;
    if (!reuse && !append) this.origin = undefined;
    if (base && !reuse) {
      // Log compresses unchanged values independently per channel. Use the union so a
      // constant latitude does not hide wheel-speed or longitude changes.
      let timestamps = [
        ...new Set(
          [...data.values()].flatMap((d) => {
            if (!d) return [];
            if (!append) return d.timestamps;
            let lo = 0,
              hi = d.timestamps.length;
            while (lo < hi) {
              const mid = (lo + hi) >>> 1;
              if (d.timestamps[mid] < changedFrom) lo = mid + 1;
              else hi = mid;
            }
            return d.timestamps.slice(lo);
          })
        )
      ].sort((a, b) => a - b);
      if (!lat && (timestamps.length || append)) {
        if (!timestamps.length) timestamps.push(changedFrom);
        // Unchanged wheel values still cover time. Keep intervals within the engine's
        // speed integration limit, including the held tail through the log end.
        const start = append ? Math.max(samples.at(-1)?.t ?? timestamps[0], changedFrom) : timestamps[0],
          end = window.log.getTimestampRange()[1];
        const count = fixedSampleCount(start, end, 0.5);
        timestamps = [
          ...new Set([...timestamps, end, ...Array.from({ length: count }, (_, i) => start + i * 0.5)])
        ].sort((a, b) => a - b);
      }
      const validFix = (t: number) => {
        const latitude = coordinate(s.latitude, t),
          longitude = coordinate(s.longitude, t);
        return (
          Number.isFinite(latitude) &&
          Number.isFinite(longitude) &&
          Math.abs(latitude) <= 90 &&
          Math.abs(longitude) <= 180 &&
          (Math.abs(latitude) > 0.001 || Math.abs(longitude) > 0.001)
        );
      };
      // Choose a locally consistent initial pair so one bad first fix cannot anchor
      // the rejection filter on the other side of the planet.
      const firstFix =
        append && this.origin
          ? -Infinity
          : timestamps.find((t, i) => {
              if (!validFix(t)) return false;
              const next = timestamps[i + 1];
              if (next === undefined) return true;
              if (!validFix(next)) return false;
              const delta = project(coordinate(s.latitude, next), coordinate(s.longitude, next), {
                lat: coordinate(s.latitude, t),
                lon: coordinate(s.longitude, t)
              });
              return Math.hypot(delta.x, delta.y) <= 100 * (next - t);
            });
      const origin =
        append && this.origin
          ? this.origin
          : firstFix === undefined
          ? undefined
          : {
              lat: coordinate(s.latitude, firstFix),
              lon: coordinate(s.longitude, firstFix)
            };
      if (lat && lon && origin) this.origin = origin;
      let accepted: Sample | undefined = samples.at(-1);
      timestamps.forEach((t) => {
        if (lat && (firstFix === undefined || t < firstFix)) return;
        const latitude = coordinate(s.latitude, t),
          longitude = coordinate(s.longitude, t);
        if (
          lat &&
          (!Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            Math.abs(latitude) > 90 ||
            Math.abs(longitude) > 180 ||
            (Math.abs(latitude) < 0.001 && Math.abs(longitude) < 0.001))
        )
          return;
        let v = (speed(s.frontLeft, t) + speed(s.frontRight, t)) / 2;
        if (!Number.isFinite(v)) {
          const rpm = at(s.rpm, t),
            unit = window.log.getUnit(s.rpm);
          v = (rpm * (unit === "radians/second" || unit === "rad/s" ? 1 : Math.PI / 30) * s.radius) / s.ratio;
        }
        if (!Number.isFinite(v)) v = speed(s.speed, t);
        const point = lat ? project(latitude, longitude, origin!) : { x: 0, y: 0 };
        // Reject GPS jumps above 100 m/s (360 km/h). Compare with the last accepted
        // fix, so an isolated outlier does not poison the next good sample.
        if (lat && accepted && Math.hypot(point.x - accepted.x, point.y - accepted.y) > 100 * (t - accepted.t)) return;
        if (lat) accepted = { ...point, t };
        samples.push({
          ...point,
          t,
          speed: Number.isFinite(v) ? v : undefined,
          counter: held(s.counter, t),
          beacon: held(s.beacon, t),
          yaw: at(s.yaw, t)
        });
      });
    }
    // Compare front-wheel circumferential speed with independent GPS ground speed.
    // Never interpolate across a stale source or infer slip at standstill.
    const gpsKey = fields.find((k) => /ground_speed$/i.test(k)) ?? "";
    const age = (key: string, t: number) => {
      const ts = data.get(key)?.timestamps ?? [];
      let lo = 0,
        hi = ts.length;
      while (lo < hi) {
        const m = (lo + hi) >>> 1;
        if (ts[m] <= t) lo = m + 1;
        else hi = m;
      }
      return lo ? t - ts[lo - 1] : Infinity;
    };
    if (!reuse && gpsKey && s.frontLeft && s.frontRight) {
      // Live data only appends, so rewriting the whole session on each update would grow without bound.
      // A static log recomputes in full, because a lazily loaded field can add earlier samples.
      const slipSignature = JSON.stringify([
        s.frontLeft,
        s.frontRight,
        gpsKey,
        s.radius,
        [s.frontLeft, s.frontRight, gpsKey].map((key) => window.log.getUnit(key))
      ]);
      const live = window.selection?.getCurrentLiveTime() != null;
      if (!live || slipSignature !== this.slipSignature) this.slipEnd = -Infinity;
      this.slipSignature = slipSignature;
      for (let i = indexAt(samples, this.slipEnd, true); i < samples.length; i++) {
        const p = samples[i];
        window.log.putNumber(
          "Laps/SlipRatio",
          p.t,
          slipRatio(
            (speed(s.frontLeft, p.t) + speed(s.frontRight, p.t)) / 2,
            speed(gpsKey, p.t),
            Math.max(age(s.frontLeft, p.t), age(s.frontRight, p.t)),
            age(gpsKey, p.t)
          )
        );
        this.slipEnd = p.t;
      }
      window.log.setMetadataString(
        "Laps/SlipRatio",
        JSON.stringify({
          unit: "ratio",
          description:
            "(mean front-wheel circumferential speed − GPS ground speed) / GPS ground speed; invalid below 2 m/s or after 250 ms without samples"
        })
      );
    }
    const anchor =
      this.switchOrigin ??
      (window.log.getTimestampRange()[0] > (this.result.samples[0]?.t ?? Infinity) ? previousOrigin : undefined);
    if (anchor && this.origin && (anchor.lat !== this.origin.lat || anchor.lon !== this.origin.lon)) {
      // Old layouts store local gates. Anchor them before a log switch or retention moves the local origin.
      const config = s.config;
      if (config.gate || config.finish || config.sectors?.length) {
        const geo = (config.geographic ??= {});
        if (config.gate) geo.gate ??= geographicGate(config.gate, anchor);
        if (config.finish) geo.finish ??= geographicGate(config.finish, anchor);
        if (config.sectors?.length)
          geo.sectors = [...(geo.sectors ?? []), ...config.sectors.map((gate) => geographicGate(gate, anchor))];
        delete config.gate;
        delete config.finish;
        delete config.sectors;
      }
    }
    if (this.origin) this.switchOrigin = undefined;
    const config = this.localConfig();
    const analysisFrom = append ? changedFrom : reuse ? Infinity : -Infinity;
    this.result = analyze(samples, config, this.analysis, analysisFrom);
    const ref = this.result.laps.find((l) => l.index === (this.reference ?? this.result.best));
    if (ref && !s.config.length && s.config.mode !== "accel")
      this.result = analyze(samples, { ...config, length: ref.distance }, this.referenceAnalysis, analysisFrom);
    if (this.reference === null || !this.result.laps.some((l) => l.index === this.reference))
      this.reference = this.result.best ?? null;
    // Until the user chooses, live overlays the latest laps and a log the first.
    if (this.autoOverlays || !this.overlays.length) {
      const valid = this.result.laps.filter((l) => l.valid).map((l) => l.index);
      this.overlays = window.selection?.getCurrentLiveTime() != null ? valid.slice(-4) : valid.slice(0, 4);
    }
    // Rebuild derived channels after edits or when the reference changes. Otherwise only append the active lap.
    const ds = JSON.stringify([s, this.reference]);
    const names = ["Laps/Number", "Laps/Time", "Laps/Distance", "Laps/Sector", "Laps/DeltaToReference"];
    const rebuild = ds !== this.derivedSignature;
    if (rebuild) {
      this.derivedEnd = -Infinity;
      this.derivedSignature = ds;
    } else if (this.derivedLapStart !== this.result.laps.at(-1)?.start) {
      // Finalising a lap can change its grid and sectors. Rewrite only that lap's tail.
      this.derivedEnd = Math.min(this.derivedEnd, this.derivedLapStart - 1e-9);
    }
    this.derivedLapStart = this.result.laps.at(-1)?.start ?? -Infinity;
    const reference = this.result.laps.find((l) => l.index === this.reference);
    const refDistances = reference?.grid.map((g) => g.distance) ?? [],
      refTimes = reference?.grid.map((g) => g.time) ?? [];
    const times: number[] = [],
      columns: number[][] = names.map(() => []);
    for (const lap of this.result.laps) {
      if (lap.end <= this.derivedEnd) continue;
      const all = this.result.samples,
        points = all.slice(
          Math.max(indexAt(all, lap.start), indexAt(all, this.derivedEnd, true)),
          indexAt(all, lap.end)
        );
      const gridTimes = lap.grid.map((g) => g.time),
        gridDistances = lap.grid.map((g) => g.distance);
      points.forEach((p) => {
        const elapsed = p.t - lap.start;
        const distance = interpolate(gridTimes, gridDistances, elapsed);
        const sector = lap.sectors.reduce(
          (a, v, i) => {
            a.sum += v;
            if (elapsed >= a.sum) a.index = i + 2;
            return a;
          },
          { sum: 0, index: 1 }
        ).index;
        const values = [
          lap.index,
          elapsed,
          distance,
          sector,
          reference ? elapsed - interpolate(refDistances, refTimes, distance) : NaN
        ];
        times.push(p.t);
        columns.forEach((column, i) => column.push(values[i]));
        this.derivedEnd = p.t;
      });
    }
    names.forEach((n, i) => {
      // A rebuild usually leaves most channels as they were, as when only the Event changes.
      // Rewriting a long session's channel costs more than comparing it.
      if (rebuild) {
        if (storedAs(n, times, columns[i])) return;
        window.log.deleteField(n);
      }
      times.forEach((t, j) => window.log.putNumber(n, t, columns[i][j]));
    });
    names.forEach((n, i) => window.log.setMetadataString(n, JSON.stringify({ unit: ["", "s", "m", "", "s"][i] })));
    this.version++;
  }
  private bandKey = "";
  private bandCache: {
    start: number;
    end: number;
    color: string;
    darkColor: string;
    label: string;
    highlighted: boolean;
  }[] = [];
  bands() {
    this.update();
    const key = JSON.stringify([this.version, this.selected, this.reference]);
    if (key === this.bandKey) return this.bandCache;
    this.bandKey = key;
    return (this.bandCache = this.result.laps.map((l) => ({
      start: l.start,
      end: l.end,
      color: l.index % 2 ? "#637986" : "#8a9299",
      darkColor: l.index % 2 ? "#637986" : "#8a9299",
      label: `L${l.index}${l.index === this.reference ? " ref" : ""}`,
      highlighted: l.index === this.selected || l.index === this.reference
    })));
  }
  delta(lap: number, distance: number) {
    const l = this.result.laps.find((l) => l.index === lap),
      r = this.result.laps.find((l) => l.index === this.reference);
    if (!l || !r) return NaN;
    const at = (lap: typeof l) => {
      let grid = this.grids.get(lap);
      if (!grid) {
        grid = { d: lap.grid.map((p) => p.distance), t: lap.grid.map((p) => p.time) };
        this.grids.set(lap, grid);
      }
      return interpolate(grid.d, grid.t, distance);
    };
    return at(l) - at(r);
  }
}
export const lapService = new LapService();
