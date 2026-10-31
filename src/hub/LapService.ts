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

import { analyze, interpolate, LapConfig, LapResult, project, Sample } from "../shared/laps/LapEngine";
import Log from "../shared/log/Log";

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
export const LAP_COLORS = ["#58a7ff", "#f4b860", "#72d6a0", "#d49bff", "#ff8c9c", "#70d6de"];
class LapService {
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
  reference: number | null = null;
  overlays: number[] = [];
  selected: number | null = null;
  version = 0;
  private log?: Log;
  private signature = "";
  private nextUpdate = 0;
  private derivedEnd = -Infinity;
  private derivedSignature = "";
  private grids = new WeakMap<object, { d: number[]; t: number[] }>();
  fields(): string[] {
    const keys = window.log.getFieldKeys().filter((k) => !k.startsWith("Laps/"));
    const find = (pattern: RegExp) => keys.find((k) => pattern.test(k)) ?? "";
    const s = this.settings;
    if (keys.length) {
      for (const key of [
        "latitude",
        "longitude",
        "frontLeft",
        "frontRight",
        "speed",
        "rpm",
        "yaw",
        "counter",
        "beacon"
      ] as const) {
        if (s[key] && !keys.includes(s[key])) s[key] = "";
      }
    }
    s.latitude ||= find(/front.*latitude$/i) || find(/(?:gps\/latitude|latitude)$/i);
    s.longitude ||= find(/front.*longitude$/i) || find(/(?:gps\/longitude|longitude)$/i);
    s.frontLeft ||= find(/(?:DASH_SpeedFL|wheel_speed_fl)$/i);
    s.frontRight ||= find(/(?:DASH_SpeedFR|wheel_speed_fr)$/i);
    s.speed ||= find(/(?:vehicle_speed|ground_speed|gps.*speed)$/i);
    s.rpm ||= find(/(?:motor_speed|MotorSpeedRPM)$/i);
    s.yaw ||= find(/(?:yaw_rate|YawRate)$/i);
    s.counter ||= find(/(?:lap_counter|lapcounter|lap_count)$/i);
    s.beacon ||= find(/(?:lap_beacon|beacon)$/i);
    return [s.latitude, s.longitude, s.frontLeft, s.frontRight, s.speed, s.rpm, s.yaw, s.counter, s.beacon].filter(
      Boolean
    );
  }
  invalidate() {
    this.signature = "";
    this.nextUpdate = 0;
  }
  update() {
    if (this.log !== window.log) {
      this.log = window.log;
      this.signature = "";
      this.derivedSignature = "";
      this.derivedEnd = -Infinity;
      this.reference = null;
      this.overlays = [];
      this.selected = null;
    }
    if (performance.now() < this.nextUpdate) return;
    this.nextUpdate = performance.now() + 500;
    const fields = this.fields();
    const data = new Map(fields.map((k) => [k, window.log.getNumber(k, -Infinity, Infinity)]));
    const signature = JSON.stringify([
      this.settings,
      fields.map((k) => [k, data.get(k)?.timestamps.length, data.get(k)?.timestamps.at(-1), data.get(k)?.values.at(-1)])
    ]);
    if (signature === this.signature) return;
    this.signature = signature;
    const s = this.settings;
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
      return v;
    };
    const lat = data.get(s.latitude),
      lon = data.get(s.longitude);
    const base = lat ?? data.get(s.counter) ?? data.get(s.speed) ?? data.get(s.frontLeft);
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
    const samples: Sample[] = [];
    if (base) {
      // Log compresses unchanged values independently per channel. Use the union so a
      // constant latitude does not hide wheel-speed or longitude changes.
      const timestamps = [...new Set([...data.values()].flatMap((d) => d?.timestamps ?? []))].sort((a, b) => a - b);
      const firstFix =
        timestamps.find(
          (t) => Math.abs(held(s.latitude, t) ?? 0) > 0.001 && Math.abs(held(s.longitude, t) ?? 0) > 0.001
        ) ?? timestamps[0];
      const origin = { lat: coordinate(s.latitude, firstFix) || 0, lon: coordinate(s.longitude, firstFix) || 0 };
      timestamps.forEach((t) => {
        if (lat && t < firstFix) return;
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
        const point = lat ? project(latitude, longitude, origin) : { x: 0, y: 0 };
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
    this.result = analyze(samples, s.config);
    const ref = this.result.laps.find((l) => l.index === (this.reference ?? this.result.best));
    if (ref && !s.config.length && s.config.mode !== "accel")
      this.result = analyze(samples, { ...s.config, length: ref.distance });
    if (this.reference === null || !this.result.laps.some((l) => l.index === this.reference))
      this.reference = this.result.best ?? null;
    if (!this.overlays.length)
      this.overlays = this.result.laps
        .filter((l) => l.valid)
        .slice(0, 4)
        .map((l) => l.index);
    // Rebuild derived channels after edits or when the reference changes. Otherwise only append the active lap.
    const ds = JSON.stringify([
      s,
      this.reference,
      this.result.laps.filter((l) => l.complete).map((l) => [l.start, l.end])
    ]);
    const names = ["Number", "Time", "Distance", "Sector", "DeltaToReference"];
    if (ds !== this.derivedSignature) {
      names.forEach((n) => window.log.deleteField("Laps/" + n));
      this.derivedEnd = -Infinity;
      this.derivedSignature = ds;
    }
    const reference = this.result.laps.find((l) => l.index === this.reference);
    for (const lap of this.result.laps) {
      const points = this.result.samples.filter((p) => p.t >= lap.start && p.t < lap.end && p.t > this.derivedEnd);
      const gridTimes = lap.grid.map((g) => g.time),
        gridDistances = lap.grid.map((g) => g.distance);
      const refDistances = reference?.grid.map((g) => g.distance) ?? [],
        refTimes = reference?.grid.map((g) => g.time) ?? [];
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
        names.forEach((n, i) => window.log.putNumber("Laps/" + n, p.t, values[i]));
        this.derivedEnd = p.t;
      });
    }
    names.forEach((n, i) =>
      window.log.setMetadataString("Laps/" + n, JSON.stringify({ unit: ["", "s", "m", "", "s"][i] }))
    );
    this.version++;
  }
  bands() {
    this.update();
    return this.result.laps.map((l) => ({
      start: l.start,
      end: l.end,
      color: l.index === this.result.best ? "#b56cff" : LAP_COLORS[l.index % LAP_COLORS.length],
      darkColor: l.index === this.result.best ? "#b56cff" : LAP_COLORS[l.index % LAP_COLORS.length]
    }));
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
