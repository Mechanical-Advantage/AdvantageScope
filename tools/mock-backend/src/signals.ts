// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Signal catalogue for the simulated mur27 car: descriptors + how to sample each one.
// Names/groups/rates follow the mur-msgs DBCs (see research/mur-existing/REPORT.md);
// values are SI at the API boundary.

import type { ConeArray, Pose3, SampleValue, SignalDescriptor } from "./contract.ts";
import type { Rng } from "./prng.ts";
import { GPS_ORIGIN, type Track, mapToLatLon } from "./track.ts";
import { CAR, type VehicleState } from "./vehicle.ts";

export const VEHICLE = "mur27";
export const P = `vehicles/${VEHICLE}`;

/** Sources (descriptor `source`), each with its own stream_id. */
export const SOURCES = [
  "control-can",
  "telemetry-can",
  "ennoid-bms",
  "sbg-ins",
  "autonomy",
  "telemetry",
  "lap-beacon"
] as const;
export type Source = (typeof SOURCES)[number];

export interface SampleCtx {
  st: VehicleState;
  track: Track;
  rng: Rng;
  tSec: number;
  /** GNSS UTC time in ns (Unix epoch), independent of the sim clock domain. */
  utcNs: bigint;
  canFrames: number;
  /** Status messages raised since the last tick. */
  messages: string[];
}

export interface SignalDef {
  desc: SignalDescriptor;
  /** Production rate in Hz on the 100 Hz sim tick; null = event-driven (polled every tick). */
  rateHz: number | null;
  /** Returns the value, or undefined to skip this tick. */
  read: (c: SampleCtx) => SampleValue | undefined;
}

const VSM_ENUM = {
  "0": "VSM Start",
  "1": "Pre-charge Init",
  "2": "Pre-charge Active",
  "3": "Pre-charge Complete",
  "4": "VSM Wait",
  "5": "VSM Ready",
  "6": "Motor Running",
  "7": "Blink Fault Code",
  "14": "Shutdown In Process",
  "15": "Recycle Power"
};
const INV_STATE_ENUM = {
  "0": "Power On",
  "1": "Stop",
  "2": "Open Loop",
  "3": "Closed Loop",
  "4": "Wait",
  "8": "Idle Run",
  "9": "Idle Stop"
};
const ECU_STATE_ENUM = {
  "0": "Init",
  "1": "Standby",
  "2": "Ready To Drive",
  "3": "Driving",
  "4": "Fault",
  "5": "Shutdown",
  "255": "Invalid/Init"
};
const DRIVE_MODE_ENUM = { "0": "Off", "1": "Eco", "2": "Normal", "3": "Attack", "255": "Invalid/Init" };
const IMD_ENUM = {
  "0": "Normal",
  "1": "Undervoltage",
  "2": "Speed Start",
  "3": "Device Error",
  "4": "Earth Fault",
  "5": "Ground Fault Warning",
  "6": "SST Warning",
  "7": "SST Fault",
  "255": "Invalid/Init"
};
const SOL_MODE_ENUM = {
  "0": "Uninitialized",
  "1": "VerticalGyro",
  "2": "AHRS",
  "3": "NavVelocityDeprecated",
  "4": "NavPosition"
};

function round(x: number, d: number): number {
  const f = 10 ** d;
  return Math.round(x * f) / f;
}

function staleFor(rate: number | null): number {
  if (rate === null) return 15000;
  return Math.max(250, Math.round((1000 / rate) * 3));
}

interface Spec {
  path: string; // relative to vehicles/mur27/
  type: SignalDescriptor["type"];
  unit: string | null;
  label: string;
  description: string;
  source: Source;
  rate: number | null;
  tags: string[];
  chart?: string;
  extra?: Partial<SignalDescriptor>;
  read: (c: SampleCtx) => SampleValue | undefined;
}

function def(s: Spec): SignalDef {
  const chart =
    s.chart ??
    (s.type === "float64" || s.type === "int64"
      ? "line"
      : s.type === "bool" || s.type === "enum"
      ? "state"
      : s.type === "string"
      ? "text"
      : "3d");
  const desc: SignalDescriptor = {
    path: `${P}/${s.path}`,
    type: s.type,
    schema_version: 1,
    unit: s.unit,
    description: s.description,
    source: s.source,
    nominal_rate_hz: s.rate,
    stale_after_ms: staleFor(s.rate),
    display: { label: s.label, preferred_chart: chart },
    tags: s.tags,
    writable: false,
    ...s.extra
  };
  return { desc, rateHz: s.rate, read: s.read };
}

const K = (c: number) => c + 273.15;

export interface SignalOptions {
  lapCounter: boolean;
}

/** Builds fresh signal definitions (with fresh per-sensor state). */
export function buildSignals(opts: SignalOptions): SignalDef[] {
  // per-sensor slowly-varying state (random walks, filters)
  const s = {
    gpsBiasX: 0,
    gpsBiasY: 0,
    cpu: 0.3,
    lastStatusT: -Infinity,
    shockBias: [0, 0, 0, 0]
  };

  // repeatable road profile so bumps recur at the same place every lap
  const road = (lapS: number, phase: number) =>
    0.0018 * Math.sin(lapS * 0.91 + phase) +
    0.0011 * Math.sin(lapS * 2.37 + phase * 2.1) +
    0.0007 * Math.sin(lapS * 5.3 + phase * 0.7);

  const wheel = (c: SampleCtx, side: 1 | -1) => {
    const v = c.st.v * (1 - side * c.st.kappa * (CAR.trackWidth / 2));
    return Math.max(0, v / CAR.wheelRadius + c.rng.gauss(0.08) * (c.st.v > 0.2 ? 1 : 0));
  };
  const shock = (c: SampleCtx, front: boolean, left: boolean, idx: number) => {
    const roll = 0.0009 * c.st.ay * (left ? -1 : 1);
    const pitch = 0.0006 * c.st.ax * (front ? -1 : 1);
    const bump = c.st.v > 0.5 ? road(c.st.lapS + (front ? 0 : CAR.wheelbase), idx * 1.7) * Math.min(1, c.st.v / 10) : 0;
    s.shockBias[idx] += c.rng.gauss(0.00001);
    return round((front ? 0.026 : 0.024) + roll + pitch + bump + s.shockBias[idx] + c.rng.gauss(0.00012), 6);
  };

  const pose = (st: VehicleState): Pose3 => ({
    position: { x: round(st.x, 4), y: round(st.y, 4), z: 0 },
    orientation: { x: 0, y: 0, z: round(Math.sin(st.yaw / 2), 6), w: round(Math.cos(st.yaw / 2), 6) }
  });

  const signals: SignalDef[] = [
    // ------------------------------------------------------------------ powertrain / inverter
    def({
      path: "powertrain/inverter/motor_speed",
      type: "float64",
      unit: "rad/s",
      label: "Motor Speed",
      description: "Motor shaft speed (INV_MotorSpeedRPM, converted to rad/s)",
      source: "control-can",
      rate: 100,
      tags: ["powertrain", "inverter"],
      extra: { min: -3430, max: 3430 },
      read: (c) => round((c.st.motorRpm * 2 * Math.PI) / 60 + c.rng.gauss(0.6) * (c.st.v > 0.1 ? 1 : 0), 3)
    }),
    def({
      path: "powertrain/inverter/torque_command",
      type: "float64",
      unit: "N*m",
      label: "Torque Command",
      description: "Torque command sent to the inverter (INV_CommandedTorque)",
      source: "control-can",
      rate: 100,
      tags: ["powertrain", "inverter"],
      extra: { min: -CAR.maxRegenTorque, max: CAR.maxMotorTorque },
      read: (c) => round(c.st.torqueCmd, 1)
    }),
    def({
      path: "powertrain/inverter/torque_feedback",
      type: "float64",
      unit: "N*m",
      label: "Torque Feedback",
      description: "Estimated motor torque (INV_TorqueFeedback)",
      source: "control-can",
      rate: 100,
      tags: ["powertrain", "inverter"],
      read: (c) => round(c.st.torqueFb + c.rng.gauss(0.8), 2)
    }),
    def({
      path: "powertrain/inverter/dc_bus_voltage",
      type: "float64",
      unit: "V",
      label: "DC Bus Voltage",
      description: "Inverter DC bus voltage (INV_DCBusVoltage)",
      source: "control-can",
      rate: 100,
      tags: ["powertrain", "inverter", "hv"],
      extra: { min: 0, max: 600 },
      read: (c) => round(Math.max(0, c.st.busV + c.rng.gauss(0.3)), 1)
    }),
    def({
      path: "powertrain/inverter/dc_bus_current",
      type: "float64",
      unit: "A",
      label: "DC Bus Current",
      description: "Inverter DC bus current, positive discharging (INV_DCBusCurrent)",
      source: "control-can",
      rate: 100,
      tags: ["powertrain", "inverter", "hv"],
      read: (c) => round(c.st.busI + c.rng.gauss(0.6), 1)
    }),
    def({
      path: "powertrain/inverter/phase_current",
      type: "float64",
      unit: "A",
      label: "Phase Current (RMS)",
      description: "Motor phase current magnitude, RMS (INV_PhaseACurrent)",
      source: "control-can",
      rate: 100,
      tags: ["powertrain", "inverter"],
      read: (c) => round(Math.abs(c.st.torqueFb) * 1.25 + Math.abs(c.rng.gauss(0.8)), 1)
    }),
    def({
      path: "powertrain/inverter/dc_power",
      type: "float64",
      unit: "W",
      label: "DC Power",
      description: "Derived DC power, V x I at the inverter (DC_Power_kW)",
      source: "control-can",
      rate: 100,
      tags: ["powertrain", "derived", "hv"],
      extra: { max: 80000 },
      read: (c) => round(c.st.busV * c.st.busI + c.rng.gauss(150), 0)
    }),
    def({
      path: "powertrain/inverter/motor_temperature",
      type: "float64",
      unit: "K",
      label: "Motor Temperature",
      description: "Motor winding temperature (INV_MotorTemp)",
      source: "control-can",
      rate: 10,
      tags: ["powertrain", "inverter", "thermal"],
      extra: { max: K(120) },
      read: (c) => round(c.st.motorTempK + c.rng.gauss(0.1), 1)
    }),
    def({
      path: "powertrain/inverter/module_temperature",
      type: "float64",
      unit: "K",
      label: "Inverter Module Temperature",
      description: "Hottest IGBT module temperature (INV_ModuleATemp..C)",
      source: "control-can",
      rate: 10,
      tags: ["powertrain", "inverter", "thermal"],
      read: (c) => round(c.st.inverterTempK + c.rng.gauss(0.1), 1)
    }),
    def({
      path: "powertrain/inverter/coolant_temperature",
      type: "float64",
      unit: "K",
      label: "Coolant Temperature",
      description: "Inverter coolant inlet temperature (INV_CoolantTemp)",
      source: "control-can",
      rate: 10,
      tags: ["powertrain", "thermal"],
      read: (c) => round(c.st.coolantTempK + c.rng.gauss(0.1), 1)
    }),
    def({
      path: "powertrain/inverter/vsm_state",
      type: "enum",
      unit: null,
      label: "VSM State",
      description: "Inverter vehicle state machine (INV_VSMState)",
      source: "control-can",
      rate: 10,
      tags: ["powertrain", "inverter", "state"],
      extra: { enum_values: VSM_ENUM },
      read: (c) => c.st.vsmState
    }),
    def({
      path: "powertrain/inverter/inverter_state",
      type: "enum",
      unit: null,
      label: "Inverter State",
      description: "Inverter control state (INV_InverterState)",
      source: "control-can",
      rate: 10,
      tags: ["powertrain", "inverter", "state"],
      extra: { enum_values: INV_STATE_ENUM },
      read: (c) => (c.st.vsmState === 6 ? (Math.abs(c.st.torqueCmd) > 0.5 ? 3 : 8) : c.st.tsActive ? 1 : 0)
    }),
    def({
      path: "powertrain/inverter/enabled",
      type: "bool",
      unit: null,
      label: "Inverter Enabled",
      description: "Inverter enable state (INV_InverterEnableState)",
      source: "control-can",
      rate: 10,
      tags: ["powertrain", "inverter", "state"],
      read: (c) => c.st.vsmState >= 5
    }),
    // ------------------------------------------------------------------ accumulator
    def({
      path: "accumulator/pack_voltage",
      type: "float64",
      unit: "V",
      label: "Pack Voltage",
      description: "Accumulator pack voltage (ENNOID_PackVoltage)",
      source: "ennoid-bms",
      rate: 10,
      tags: ["accumulator", "hv"],
      extra: { min: 0, max: 600 },
      read: (c) => round(c.st.packV + c.rng.gauss(0.2), 2)
    }),
    def({
      path: "accumulator/pack_current",
      type: "float64",
      unit: "A",
      label: "Pack Current",
      description: "Accumulator current, positive discharging (ENNOID_PackCurrent)",
      source: "ennoid-bms",
      rate: 10,
      tags: ["accumulator", "hv"],
      read: (c) => round(c.st.busI + c.rng.gauss(0.5), 1)
    }),
    def({
      path: "accumulator/state_of_charge",
      type: "float64",
      unit: "1",
      label: "State of Charge",
      description: "Pack state of charge as a fraction 0..1 (ENNOID_SoC)",
      source: "ennoid-bms",
      rate: 1,
      tags: ["accumulator"],
      extra: { min: 0, max: 1 },
      read: (c) => round(c.st.soc, 4)
    }),
    def({
      path: "accumulator/cell_voltage_min",
      type: "float64",
      unit: "V",
      label: "Cell Voltage Min",
      description: "Lowest cell voltage (ENNOID_CellVoltageMin)",
      source: "ennoid-bms",
      rate: 1,
      tags: ["accumulator", "cells"],
      extra: { min: 2.8, max: 4.2 },
      read: (c) => round(c.st.cellMin + c.rng.gauss(0.001), 3)
    }),
    def({
      path: "accumulator/cell_voltage_max",
      type: "float64",
      unit: "V",
      label: "Cell Voltage Max",
      description: "Highest cell voltage (ENNOID_CellVoltageMax)",
      source: "ennoid-bms",
      rate: 1,
      tags: ["accumulator", "cells"],
      extra: { min: 2.8, max: 4.2 },
      read: (c) => round(c.st.cellMax + c.rng.gauss(0.001), 3)
    }),
    def({
      path: "accumulator/temperature_max",
      type: "float64",
      unit: "K",
      label: "Cell Temperature Max",
      description: "Hottest cell temperature (ENNOID_TempCellMax)",
      source: "ennoid-bms",
      rate: 1,
      tags: ["accumulator", "thermal"],
      extra: { max: K(60) },
      read: (c) => round(c.st.accTempMaxK + c.rng.gauss(0.15), 1)
    }),
    def({
      path: "accumulator/temperature_min",
      type: "float64",
      unit: "K",
      label: "Cell Temperature Min",
      description: "Coolest cell temperature (ECU_AccuTempMin)",
      source: "ennoid-bms",
      rate: 1,
      tags: ["accumulator", "thermal"],
      read: (c) => round(c.st.accTempMinK + c.rng.gauss(0.15), 1)
    }),
    def({
      path: "accumulator/discharge_current_limit",
      type: "float64",
      unit: "A",
      label: "Discharge Current Limit",
      description: "BMS discharge current limit (TTCS_DCL)",
      source: "ennoid-bms",
      rate: 1,
      tags: ["accumulator", "limits"],
      read: (c) => round(Math.min(200, 200 - Math.max(0, c.st.accTempMaxK - K(45)) * 15), 0)
    }),
    def({
      path: "accumulator/imd_state",
      type: "enum",
      unit: null,
      label: "IMD State",
      description: "Insulation monitoring device state (TTCS_IMDState)",
      source: "ennoid-bms",
      rate: 1,
      tags: ["accumulator", "safety", "state"],
      extra: { enum_values: IMD_ENUM },
      read: () => 0
    }),
    def({
      path: "accumulator/airs_closed",
      type: "bool",
      unit: null,
      label: "AIRs Closed",
      description: "Both accumulator isolation relays closed (TTCS_SDCStatus1/2)",
      source: "ennoid-bms",
      rate: 1,
      tags: ["accumulator", "safety", "state"],
      read: (c) => c.st.tsActive
    }),
    // ------------------------------------------------------------------ driver
    def({
      path: "driver/throttle",
      type: "float64",
      unit: "1",
      label: "Throttle",
      description: "Accelerator pedal position, fraction 0..1 (PEDAL_Position1)",
      source: "control-can",
      rate: 100,
      tags: ["driver", "pedals"],
      extra: { min: 0, max: 1 },
      read: (c) => round(Math.min(1, Math.max(0, c.st.throttle + c.rng.gauss(0.003))), 4)
    }),
    def({
      path: "driver/brake_pressure_front",
      type: "float64",
      unit: "Pa",
      label: "Brake Pressure Front",
      description: "Front brake line pressure (PEDAL_BrakePressure1)",
      source: "control-can",
      rate: 100,
      tags: ["driver", "pedals", "brakes"],
      extra: { min: 0, max: 1e7 },
      read: (c) => round(Math.max(0, c.st.brakeFront + c.rng.gauss(4000)), 0)
    }),
    def({
      path: "driver/brake_pressure_rear",
      type: "float64",
      unit: "Pa",
      label: "Brake Pressure Rear",
      description: "Rear brake line pressure (PEDAL_BrakePressure2)",
      source: "control-can",
      rate: 100,
      tags: ["driver", "pedals", "brakes"],
      extra: { min: 0, max: 1e7 },
      read: (c) => round(Math.max(0, c.st.brakeRear + c.rng.gauss(4000)), 0)
    }),
    def({
      path: "driver/steering_angle",
      type: "float64",
      unit: "rad",
      label: "Steering Angle",
      description: "Steering-wheel angle, positive left (DASH_SteeringAngle)",
      source: "telemetry-can",
      rate: 100,
      tags: ["driver", "vehicle-dynamics"],
      extra: { min: -2.1, max: 2.1 },
      read: (c) => round(c.st.steeringWheel + c.rng.gauss(0.004), 4)
    }),
    // ------------------------------------------------------------------ dynamics
    def({
      path: "dynamics/vehicle_speed",
      type: "float64",
      unit: "m/s",
      label: "Vehicle Speed",
      description: "Vehicle speed from front wheel speeds (Dashboard_Speed)",
      source: "telemetry-can",
      rate: 50,
      tags: ["vehicle-dynamics"],
      extra: { min: 0, max: 40 },
      read: (c) => round(Math.max(0, c.st.v + c.rng.gauss(0.04) * (c.st.v > 0.1 ? 1 : 0)), 3)
    }),
    def({
      path: "dynamics/wheel_speed_fl",
      type: "float64",
      unit: "rad/s",
      label: "Wheel Speed FL",
      description: "Front-left wheel angular speed (DASH_WheelSpeedFL)",
      source: "telemetry-can",
      rate: 100,
      tags: ["vehicle-dynamics", "wheels"],
      read: (c) => round(wheel(c, 1), 3)
    }),
    def({
      path: "dynamics/wheel_speed_fr",
      type: "float64",
      unit: "rad/s",
      label: "Wheel Speed FR",
      description: "Front-right wheel angular speed (DASH_WheelSpeedFR)",
      source: "telemetry-can",
      rate: 100,
      tags: ["vehicle-dynamics", "wheels"],
      read: (c) => round(wheel(c, -1), 3)
    }),
    def({
      path: "dynamics/rear_axle_speed",
      type: "float64",
      unit: "rad/s",
      label: "Rear Axle Speed",
      description: "Derived rear axle speed from motor speed through the 9:39 chain",
      source: "control-can",
      rate: 100,
      tags: ["vehicle-dynamics", "wheels", "derived"],
      read: (c) =>
        round((c.st.motorRpm * 2 * Math.PI) / 60 / CAR.gearRatio + c.rng.gauss(0.05) * (c.st.v > 0.1 ? 1 : 0), 3)
    }),
    def({
      path: "dynamics/yaw_rate",
      type: "float64",
      unit: "rad/s",
      label: "Yaw Rate",
      description: "Body yaw rate, positive CCW (SBG_FRONT_GyroZ)",
      source: "sbg-ins",
      rate: 100,
      tags: ["vehicle-dynamics", "imu"],
      read: (c) => round(c.st.yawRate + c.rng.gauss(0.006), 4)
    }),
    def({
      path: "dynamics/accel_x",
      type: "float64",
      unit: "m/s^2",
      label: "Longitudinal Accel",
      description: "Body longitudinal acceleration, positive forward (SBG_FRONT_AccelX)",
      source: "sbg-ins",
      rate: 100,
      tags: ["vehicle-dynamics", "imu"],
      read: (c) => round(c.st.ax + c.rng.gauss(0.12), 3)
    }),
    def({
      path: "dynamics/accel_y",
      type: "float64",
      unit: "m/s^2",
      label: "Lateral Accel",
      description: "Body lateral acceleration, positive left (SBG_FRONT_AccelY)",
      source: "sbg-ins",
      rate: 100,
      tags: ["vehicle-dynamics", "imu"],
      read: (c) => round(c.st.ay + c.rng.gauss(0.12), 3)
    }),
    def({
      path: "dynamics/shock_fl",
      type: "float64",
      unit: "m",
      label: "Shock FL",
      description: "Front-left damper position, compression positive (DASH_ShockPotFrontLeft)",
      source: "telemetry-can",
      rate: 100,
      tags: ["vehicle-dynamics", "suspension"],
      extra: { min: 0, max: 0.05 },
      read: (c) => shock(c, true, true, 0)
    }),
    def({
      path: "dynamics/shock_fr",
      type: "float64",
      unit: "m",
      label: "Shock FR",
      description: "Front-right damper position, compression positive (DASH_ShockPotFrontRight)",
      source: "telemetry-can",
      rate: 100,
      tags: ["vehicle-dynamics", "suspension"],
      extra: { min: 0, max: 0.05 },
      read: (c) => shock(c, true, false, 1)
    }),
    def({
      path: "dynamics/shock_rl",
      type: "float64",
      unit: "m",
      label: "Shock RL",
      description: "Rear-left damper position, compression positive (REAR_ShockPotRearLeft)",
      source: "telemetry-can",
      rate: 100,
      tags: ["vehicle-dynamics", "suspension"],
      extra: { min: 0, max: 0.05 },
      read: (c) => shock(c, false, true, 2)
    }),
    def({
      path: "dynamics/shock_rr",
      type: "float64",
      unit: "m",
      label: "Shock RR",
      description: "Rear-right damper position, compression positive (REAR_ShockPotRearRight)",
      source: "telemetry-can",
      rate: 100,
      tags: ["vehicle-dynamics", "suspension"],
      extra: { min: 0, max: 0.05 },
      read: (c) => shock(c, false, false, 3)
    }),
    // ------------------------------------------------------------------ gps / ins
    def({
      path: "gps/latitude",
      type: "float64",
      unit: "deg",
      label: "Latitude",
      description: "WGS84 latitude (SBG_REAR_Latitude)",
      source: "sbg-ins",
      rate: 10,
      tags: ["gps", "position"],
      read: (c) => {
        s.gpsBiasY = 0.995 * s.gpsBiasY + c.rng.gauss(0.03);
        return round(mapToLatLon(c.st.x, c.st.y + s.gpsBiasY + c.rng.gauss(0.05)).lat, 9);
      }
    }),
    def({
      path: "gps/longitude",
      type: "float64",
      unit: "deg",
      label: "Longitude",
      description: "WGS84 longitude (SBG_REAR_Longitude)",
      source: "sbg-ins",
      rate: 10,
      tags: ["gps", "position"],
      read: (c) => {
        s.gpsBiasX = 0.995 * s.gpsBiasX + c.rng.gauss(0.03);
        return round(mapToLatLon(c.st.x + s.gpsBiasX + c.rng.gauss(0.05), c.st.y).lon, 9);
      }
    }),
    def({
      path: "gps/altitude",
      type: "float64",
      unit: "m",
      label: "Altitude",
      description: "Height above ellipsoid (SBG_REAR_Altitude)",
      source: "sbg-ins",
      rate: 10,
      tags: ["gps", "position"],
      read: (c) =>
        round(GPS_ORIGIN.alt + 0.4 * Math.sin((c.st.lapS / c.track.length) * 2 * Math.PI) + c.rng.gauss(0.08), 2)
    }),
    def({
      path: "gps/heading",
      type: "float64",
      unit: "rad",
      label: "Heading",
      description: "True heading, clockwise from north, 0..2pi (SBG EKF)",
      source: "sbg-ins",
      rate: 10,
      tags: ["gps", "orientation"],
      extra: { min: 0, max: 2 * Math.PI },
      read: (c) => {
        let h = Math.PI / 2 - c.st.yaw + c.rng.gauss(0.003);
        h = ((h % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        return round(h, 5);
      }
    }),
    def({
      path: "gps/ground_speed",
      type: "float64",
      unit: "m/s",
      label: "Ground Speed",
      description: "Horizontal speed from INS velocity N/E (SBG_REAR_EkfVelNed)",
      source: "sbg-ins",
      rate: 50,
      tags: ["gps", "vehicle-dynamics"],
      read: (c) => round(Math.max(0, c.st.v + c.rng.gauss(0.03)), 3)
    }),
    def({
      path: "gps/solution_mode",
      type: "enum",
      unit: null,
      label: "INS Solution Mode",
      description: "SBG Ellipse solution mode (SBG_REAR_SolMode)",
      source: "sbg-ins",
      rate: 1,
      tags: ["gps", "state"],
      extra: { enum_values: SOL_MODE_ENUM },
      read: (c) => (c.tSec < 1.5 ? 2 : 4)
    }),
    def({
      path: "gps/utc_time",
      type: "int64",
      unit: "ns",
      label: "GNSS UTC Time",
      description: "GNSS UTC time in Unix-epoch nanoseconds (exceeds 2^53: sent as a decimal string)",
      source: "sbg-ins",
      rate: 10,
      tags: ["gps", "time"],
      read: (c) => c.utcNs.toString()
    }),
    // ------------------------------------------------------------------ ecu
    def({
      path: "ecu/car_state",
      type: "enum",
      unit: null,
      label: "Car State",
      description: "ECU state machine (ECU_ECUState)",
      source: "control-can",
      rate: 10,
      tags: ["ecu", "state"],
      extra: { enum_values: ECU_STATE_ENUM },
      read: (c) => c.st.ecuState
    }),
    def({
      path: "ecu/ts_active",
      type: "bool",
      unit: null,
      label: "TS Active",
      description: "Tractive system active (ECU_TSActive)",
      source: "control-can",
      rate: 10,
      tags: ["ecu", "state", "hv"],
      read: (c) => c.st.tsActive
    }),
    def({
      path: "ecu/ready_to_drive",
      type: "bool",
      unit: null,
      label: "Ready To Drive",
      description: "Ready-to-drive latched (ECU_RTDButton)",
      source: "control-can",
      rate: 10,
      tags: ["ecu", "state"],
      read: (c) => c.st.readyToDrive
    }),
    def({
      path: "ecu/drive_mode",
      type: "enum",
      unit: null,
      label: "Drive Mode",
      description: "Selected drive mode (ECU_DriveMode)",
      source: "control-can",
      rate: 10,
      tags: ["ecu", "state"],
      extra: { enum_values: DRIVE_MODE_ENUM },
      read: (c) => (c.st.driving ? 2 : 0)
    }),
    def({
      path: "ecu/torque_limit",
      type: "float64",
      unit: "N*m",
      label: "Torque Limit",
      description: "ECU torque limit (ECU_TorqueLimit)",
      source: "control-can",
      rate: 100,
      tags: ["ecu", "limits", "powertrain"],
      read: (c) => (c.st.driving ? CAR.maxMotorTorque : 0)
    }),
    // ------------------------------------------------------------------ pdu
    def({
      path: "pdu/pump_duty",
      type: "float64",
      unit: "1",
      label: "Pump Duty",
      description: "Coolant pump duty cycle, fraction (PDU_CMD_PumpState)",
      source: "telemetry-can",
      rate: 10,
      tags: ["pdu", "thermal"],
      read: (c) => (c.st.tsActive ? 1 : 0)
    }),
    def({
      path: "pdu/fan_duty",
      type: "float64",
      unit: "1",
      label: "Fan Duty",
      description: "Radiator fan duty cycle, fraction (PDU_Fan1Duty)",
      source: "telemetry-can",
      rate: 10,
      tags: ["pdu", "thermal"],
      read: (c) => round(Math.min(1, Math.max(0, (c.st.coolantTempK - K(25)) / 15)), 2)
    }),
    def({
      path: "pdu/lv_battery_voltage",
      type: "float64",
      unit: "V",
      label: "LV Battery Voltage",
      description: "Low-voltage battery reference voltage (PDU_BatteryRefVoltage)",
      source: "telemetry-can",
      rate: 10,
      tags: ["pdu", "lv"],
      read: (c) => round(13.1 - c.tSec * 0.00005 - (c.st.tsActive ? 0.15 : 0) + c.rng.gauss(0.01), 3)
    }),
    // ------------------------------------------------------------------ system
    def({
      path: "system/cpu_load",
      type: "float64",
      unit: "1",
      label: "CPU Load",
      description: "Telemetry gateway CPU utilisation as a fraction from 0 to 1",
      source: "telemetry",
      rate: 5,
      tags: ["system"],
      extra: { min: 0, max: 1 },
      read: (c) => {
        s.cpu += (0.32 + 0.08 * Math.sin(c.tSec / 23) - s.cpu) * 0.3 + c.rng.gauss(0.02);
        if (c.rng.next() < 0.01) s.cpu += 0.4; // occasional spike
        s.cpu = Math.min(1, Math.max(0.02, s.cpu));
        return round(s.cpu, 3);
      }
    }),
    def({
      path: "system/can_frame_count",
      type: "int64",
      unit: null,
      label: "CAN Frames Logged",
      description: "Total CAN frames received by the gateway since boot (counter)",
      source: "telemetry",
      rate: 1,
      tags: ["system", "counter"],
      read: (c) => c.canFrames
    }),
    def({
      path: "system/link_rssi",
      type: "float64",
      unit: "dBm",
      label: "Radio RSSI",
      description: "Base-station radio RSSI (varies with distance around the track)",
      source: "telemetry",
      rate: 5,
      tags: ["system", "link"],
      read: (c) => round(-62 - 0.04 * Math.hypot(c.st.x - 120, c.st.y - 110) + c.rng.gauss(1.5), 1)
    }),
    def({
      path: "system/status/message",
      type: "string",
      unit: null,
      label: "Status Message",
      description: "Human-readable gateway status/event messages",
      source: "telemetry",
      rate: null,
      tags: ["system", "events"],
      read: (c) => {
        if (c.messages.length > 0) return c.messages.join("; ");
        if (c.tSec - s.lastStatusT >= 5) {
          s.lastStatusT = c.tSec;
          const lap = c.st.lapCount;
          return `Nominal: lap ${lap}, SoC ${(c.st.soc * 100).toFixed(1)} %, ${(c.st.v * 3.6).toFixed(0)} km/h`;
        }
        return undefined;
      }
    }),
    // ------------------------------------------------------------------ autonomy
    def({
      path: "autonomy/pose",
      type: "pose3",
      unit: null,
      label: "Vehicle Pose",
      description: "Estimated vehicle pose (base_link in map)",
      source: "autonomy",
      rate: 20,
      tags: ["autonomy", "localisation", "3d"],
      read: (c) => pose(c.st)
    }),
    def({
      path: "autonomy/planned_trajectory",
      type: "trajectory",
      unit: null,
      label: "Planned Trajectory",
      description: "Planned path for the next ~50 m",
      source: "autonomy",
      rate: 10,
      tags: ["autonomy", "planning", "3d"],
      read: (c) => {
        const poses: Pose3[] = [];
        for (let i = 0; i < 25; i++) {
          const p = c.track.at(c.st.lapS + i * 2);
          // planner converges from the current offset back to the centre line
          const off = c.st.lateralOffset * Math.exp(-i / 6);
          poses.push({
            position: { x: round(p.x - Math.sin(p.yaw) * off, 3), y: round(p.y + Math.cos(p.yaw) * off, 3), z: 0 },
            orientation: { x: 0, y: 0, z: round(Math.sin(p.yaw / 2), 6), w: round(Math.cos(p.yaw / 2), 6) }
          });
        }
        return { poses };
      }
    }),
    def({
      path: "autonomy/cones",
      type: "cone_array",
      unit: null,
      label: "Detected Cones",
      description: "Cones detected near the car (blue = left, yellow = right), in map frame",
      source: "autonomy",
      rate: 10,
      tags: ["autonomy", "perception", "3d"],
      extra: { type_id: "mur.cones.v1" },
      read: (c): ConeArray => {
        const out: ConeArray = { cones: [] };
        const cy = Math.cos(c.st.yaw),
          sy = Math.sin(c.st.yaw);
        for (const cone of c.track.cones) {
          const dx = cone.x - c.st.x,
            dy = cone.y - c.st.y;
          const fwd = dx * cy + dy * sy;
          const dist = Math.hypot(dx, dy);
          if (dist > 22 || fwd < 0.5 || Math.abs(Math.atan2(-dx * sy + dy * cy, fwd)) > 1.4) continue;
          const sigma = 0.02 + 0.008 * dist;
          const conf = Math.min(0.99, Math.max(0.3, 0.99 - 0.022 * dist + c.rng.gauss(0.03)));
          out.cones.push({
            id: cone.id,
            position: { x: round(cone.x + c.rng.gauss(sigma), 3), y: round(cone.y + c.rng.gauss(sigma), 3), z: 0 },
            class: c.rng.next() < 0.03 ? "unknown" : cone.cls,
            confidence: round(conf, 3)
          });
        }
        return out;
      }
    })
  ];

  if (opts.lapCounter) {
    signals.push(
      def({
        path: "timing/lap_count",
        type: "int64",
        unit: null,
        label: "Lap Count",
        description: "Logger lap counter from the start/finish beacon (increments on each crossing)",
        source: "lap-beacon",
        rate: 10,
        tags: ["timing", "laps"],
        read: (c) => c.st.lapCount
      }),
      def({
        path: "timing/last_lap_time",
        type: "float64",
        unit: "s",
        label: "Last Lap Time",
        description: "Duration of the last completed lap from the beacon",
        source: "lap-beacon",
        rate: 10,
        tags: ["timing", "laps"],
        read: (c) => (c.st.lastLapTime === null ? undefined : round(c.st.lastLapTime, 3))
      })
    );
  }
  return signals;
}

/** Signal registered and later removed by --catalogue-churn. */
export function churnSignal(n: number): SignalDef {
  return def({
    path: `system/churn/probe_${n % 3}`,
    type: "float64",
    unit: "1",
    label: `Churn Probe ${n % 3}`,
    description: `Temporary diagnostic signal (catalogue churn cycle ${n})`,
    source: "telemetry",
    rate: 10,
    tags: ["system", "churn"],
    read: (c) => round(Math.sin(c.tSec * 0.7 + n), 4)
  });
}
