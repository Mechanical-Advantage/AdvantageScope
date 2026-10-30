// Plausible point-mass + bicycle-ish model of an FSAE EV lapping the Track.
// All state is SI (m, s, rad, K, Pa, V, A, Nm). Deterministic for a given Rng seed.

import { Rng } from "./prng.ts";
import { Track } from "./track.ts";

export const CAR = {
  mass: 290, // kg incl. driver
  wheelRadius: 0.2, // m (10" wheels)
  gearRatio: 39 / 9, // chain 9:39
  wheelbase: 1.53,
  trackWidth: 1.2,
  steerRatio: 4.5,
  understeer: 0.0025, // rad per m/s^2 lateral
  cdA: 1.1,
  crr: 0.015,
  maxMotorTorque: 230, // Nm (Emrax-class)
  maxRegenTorque: 40,
  maxPower: 80_000, // W at DC side (FSAE limit)
  driveEff: 0.93,
  cells: 140,
  cellCapacityAh: 14,
  cellR: 0.0022, // ohm per cell
  ambientK: 295.15
};

const RHO = 1.2;
const G = 9.81;

export const ECU_STATE = { Init: 0, Standby: 1, ReadyToDrive: 2, Driving: 3, Fault: 4, Shutdown: 5 } as const;
export const VSM_STATE = {
  Start: 0,
  PrechargeInit: 1,
  PrechargeActive: 2,
  PrechargeComplete: 3,
  Wait: 4,
  Ready: 5,
  MotorRunning: 6
} as const;

export interface LapParams {
  ayMax: number;
  aBrake: number;
  aGrip: number;
  powerScale: number;
  vTop: number;
}

export interface VehicleState {
  t: number; // sim seconds since (re)start
  // track position
  dist: number; // total distance
  lapS: number;
  x: number;
  y: number;
  yaw: number;
  kappa: number;
  lateralOffset: number;
  // longitudinal
  v: number;
  ax: number;
  ay: number;
  yawRate: number;
  // driver
  throttle: number; // 0..1
  brakeFront: number; // Pa
  brakeRear: number; // Pa
  steeringWheel: number; // rad
  // powertrain
  motorRpm: number;
  torqueCmd: number;
  torqueFb: number;
  mechPower: number;
  dcPower: number;
  busV: number;
  busI: number;
  motorTempK: number;
  inverterTempK: number;
  coolantTempK: number;
  // accumulator
  soc: number; // 0..1
  packV: number;
  cellMin: number;
  cellMax: number;
  accTempMaxK: number;
  accTempMinK: number;
  cellSpread: number;
  // states
  ecuState: number;
  vsmState: number;
  tsActive: boolean;
  readyToDrive: boolean;
  driving: boolean;
  // laps
  lapCount: number;
  lapStartT: number | null;
  lastLapTime: number | null;
  events: string[]; // human-readable events since last step (drained by caller)
}

export class Vehicle {
  readonly track: Track;
  readonly state: VehicleState;
  private profile: Float64Array;
  private lapRng: Rng;
  params: LapParams;

  constructor(track: Track, seed: number) {
    this.track = track;
    this.lapRng = new Rng(seed ^ 0x5eed1a9);
    this.params = this.drawParams();
    this.profile = this.buildProfile(this.params);
    const s0 = track.startLineS - 8; // grid slot behind the line
    const p = track.at(s0);
    this.state = {
      t: 0,
      dist: s0,
      lapS: s0,
      x: p.x,
      y: p.y,
      yaw: p.yaw,
      kappa: p.kappa,
      lateralOffset: 0,
      v: 0,
      ax: 0,
      ay: 0,
      yawRate: 0,
      throttle: 0,
      brakeFront: 0,
      brakeRear: 0,
      steeringWheel: 0,
      motorRpm: 0,
      torqueCmd: 0,
      torqueFb: 0,
      mechPower: 0,
      dcPower: 0,
      busV: 0,
      busI: 0,
      motorTempK: CAR.ambientK + 3,
      inverterTempK: CAR.ambientK + 2,
      coolantTempK: CAR.ambientK + 1,
      soc: 0.92,
      packV: 0,
      cellMin: 0,
      cellMax: 0,
      accTempMaxK: CAR.ambientK + 4,
      accTempMinK: CAR.ambientK + 1,
      cellSpread: 0.008,
      ecuState: ECU_STATE.Init,
      vsmState: VSM_STATE.Start,
      tsActive: false,
      readyToDrive: false,
      driving: false,
      lapCount: 0,
      lapStartT: null,
      lastLapTime: null,
      events: []
    };
    this.updatePack(0);
  }

  private drawParams(): LapParams {
    const r = this.lapRng;
    return {
      ayMax: 15 * (1 + r.gauss(0.025)),
      aBrake: 12.5 * (1 + r.gauss(0.03)),
      aGrip: 11 * (1 + r.gauss(0.02)),
      powerScale: 1 + r.gauss(0.015),
      vTop: 31
    };
  }

  /** Max-speed profile on the track grid: curvature limit, then braking and power passes. */
  private buildProfile(p: LapParams): Float64Array {
    const pts = this.track.points;
    const N = pts.length;
    const ds = this.track.ds;
    const v = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      const k = Math.abs(pts[i].kappa);
      v[i] = k < 1e-6 ? p.vTop : Math.min(p.vTop, Math.sqrt(p.ayMax / k));
    }
    // braking (backward), twice round for wrap-around
    for (let k = 2 * N - 1; k >= 0; k--) {
      const i = k % N,
        j = (i + 1) % N;
      v[i] = Math.min(v[i], Math.sqrt(v[j] * v[j] + 2 * p.aBrake * ds));
    }
    // traction/power (forward)
    for (let k = 0; k < 2 * N; k++) {
      const i = k % N,
        h = (i - 1 + N) % N;
      const a = this.accelAvail(v[h], p);
      v[i] = Math.min(v[i], Math.sqrt(v[h] * v[h] + 2 * Math.max(0.1, a) * ds));
    }
    return v;
  }

  private accelAvail(v: number, p: LapParams): number {
    const pw = (CAR.maxPower * CAR.driveEff * p.powerScale) / Math.max(v, 1);
    const drag = 0.5 * RHO * CAR.cdA * v * v + CAR.crr * CAR.mass * G;
    const torqueForce = (CAR.maxMotorTorque * CAR.gearRatio) / CAR.wheelRadius;
    return Math.min(p.aGrip, (Math.min(pw, torqueForce) - drag) / CAR.mass);
  }

  private profileAt(s: number): number {
    const L = this.track.length;
    const sw = ((s % L) + L) % L;
    const f = sw / this.track.ds;
    const i = Math.floor(f) % this.profile.length;
    const j = (i + 1) % this.profile.length;
    const a = f - Math.floor(f);
    return this.profile[i] * (1 - a) + this.profile[j] * a;
  }

  /** Advance by dt seconds. */
  step(dt: number): void {
    const st = this.state;
    st.t += dt;
    this.updateStartup();

    const vPrev = st.v;
    if (st.driving) {
      const target = this.profileAt(st.dist + st.v * 0.05);
      const aUp = this.accelAvail(st.v, this.params);
      const dv = Math.max(-this.params.aBrake * 1.05 * dt, Math.min(aUp * dt, target - st.v));
      st.v = Math.max(0, st.v + dv);
    }
    st.ax = (st.v - vPrev) / dt;

    const prevDist = st.dist;
    st.dist += st.v * dt;
    const L = this.track.length;
    st.lapS = st.dist % L;
    const sl = this.track.startLineS;
    if (Math.floor((st.dist - sl) / L) > Math.floor((prevDist - sl) / L)) this.onLapLine(dt, prevDist);

    const p = this.track.at(st.lapS);
    st.lateralOffset = 0.35 * Math.sin(st.dist / 41) + 0.15 * Math.sin(st.dist / 13.7);
    st.x = p.x - Math.sin(p.yaw) * st.lateralOffset;
    st.y = p.y + Math.cos(p.yaw) * st.lateralOffset;
    st.yaw = p.yaw;
    // smooth curvature a little (driver doesn't step the wheel instantly)
    st.kappa += (p.kappa - st.kappa) * Math.min(1, dt / 0.08);
    st.yawRate = st.v * st.kappa;
    st.ay = st.v * st.v * st.kappa;
    st.steeringWheel = CAR.steerRatio * (Math.atan(CAR.wheelbase * st.kappa) + CAR.understeer * st.ay);

    this.updatePowertrain(dt);
    this.updateThermal(dt);
  }

  private onLapLine(dt: number, prevDist: number): void {
    const st = this.state;
    const L = this.track.length;
    const sl = this.track.startLineS;
    // sub-step interpolation of the crossing time
    const lineDist = (Math.floor((prevDist - sl) / L) + 1) * L + sl;
    const frac = st.dist > prevDist ? (lineDist - prevDist) / (st.dist - prevDist) : 1;
    const tCross = st.t - dt + frac * dt;
    if (st.lapStartT !== null) {
      st.lastLapTime = tCross - st.lapStartT;
      st.events.push(`Lap ${st.lapCount} complete: ${st.lastLapTime.toFixed(3)} s`);
    } else {
      st.events.push("Out lap complete, timing started");
    }
    st.lapCount += 1;
    st.lapStartT = tCross;
    this.params = this.drawParams();
    this.profile = this.buildProfile(this.params);
  }

  private updateStartup(): void {
    const st = this.state;
    const t = st.t;
    const prevEcu = st.ecuState;
    if (t < 1) {
      st.ecuState = ECU_STATE.Init;
      st.vsmState = VSM_STATE.Start;
    } else if (t < 2) {
      st.ecuState = ECU_STATE.Standby;
    } else if (t < 4.5) {
      st.tsActive = true;
      st.vsmState = t < 2.3 ? VSM_STATE.PrechargeInit : VSM_STATE.PrechargeActive;
    } else if (t < 6) {
      st.vsmState = t < 4.8 ? VSM_STATE.PrechargeComplete : VSM_STATE.Wait;
    } else if (t < 7) {
      st.readyToDrive = true;
      st.ecuState = ECU_STATE.ReadyToDrive;
      st.vsmState = VSM_STATE.Ready;
    } else if (!st.driving) {
      st.ecuState = ECU_STATE.Driving;
      st.vsmState = VSM_STATE.MotorRunning;
      st.driving = true;
    }
    if (st.ecuState !== prevEcu) {
      const names = ["Init", "Standby", "Ready To Drive", "Driving", "Fault", "Shutdown"];
      st.events.push(`ECU state -> ${names[st.ecuState]}`);
    }
  }

  private updatePowertrain(dt: number): void {
    const st = this.state;
    const v = st.v;
    const drag = v > 0.05 ? 0.5 * RHO * CAR.cdA * v * v + CAR.crr * CAR.mass * G : 0;
    const F = CAR.mass * st.ax + drag; // required tractive force at the wheels
    const wheelOmega = v / CAR.wheelRadius;
    const motorOmega = wheelOmega * CAR.gearRatio;
    st.motorRpm = (motorOmega * 60) / (2 * Math.PI);

    let motorTorque = 0;
    let brakeForce = 0;
    if (!st.driving) {
      motorTorque = 0;
    } else if (F >= 0) {
      motorTorque = (F * CAR.wheelRadius) / CAR.gearRatio / CAR.driveEff;
    } else {
      const regenForce = Math.min(-F, (CAR.maxRegenTorque * CAR.gearRatio) / CAR.wheelRadius, v * 120);
      motorTorque = -(regenForce * CAR.wheelRadius) / CAR.gearRatio;
      brakeForce = -F - regenForce;
      if (brakeForce < 120) brakeForce = 0; // coasting / lift-off
    }
    st.torqueCmd = motorTorque;
    // inverter torque loop: ~15 ms first-order lag
    st.torqueFb += (motorTorque - st.torqueFb) * Math.min(1, dt / 0.015);
    st.throttle = Math.max(0, Math.min(1, st.torqueCmd / CAR.maxMotorTorque));
    // ~40 bar front at ~1.3 g of friction braking; 60 % rear bias of front pressure
    const pf = (brakeForce / (CAR.mass * 13)) * 40e5;
    st.brakeFront = st.driving ? Math.max(0, pf) : 2.5e5; // holding the brake while stationary
    st.brakeRear = st.brakeFront * 0.62;

    st.mechPower = st.torqueFb * motorOmega;
    const aux = st.tsActive ? 350 : 0;
    st.dcPower = (st.mechPower >= 0 ? st.mechPower / CAR.driveEff : st.mechPower * CAR.driveEff) + aux;
    this.updatePack(dt);
  }

  private ocv(soc: number): number {
    // simple Li-ion OCV curve, per cell
    return 3.42 + 0.72 * soc + 0.06 * Math.tanh((soc - 0.1) * 12) - 0.04 * Math.exp(-soc * 25);
  }

  private updatePack(dt: number): void {
    const st = this.state;
    const ocvCell = this.ocv(st.soc);
    const rPack = CAR.cellR * CAR.cells;
    const ocvPack = ocvCell * CAR.cells;
    // I from P = V*I with V = OCV - I R  (take the physical root)
    const P = st.tsActive ? st.dcPower : 0;
    const disc = ocvPack * ocvPack - 4 * rPack * P;
    const I = (ocvPack - Math.sqrt(Math.max(0, disc))) / (2 * rPack);
    st.packV = ocvPack - I * rPack;
    st.soc -= (I * dt) / (CAR.cellCapacityAh * 3600);
    if (st.soc < 0.08) {
      st.soc = 0.95;
      st.events.push("Accumulator swapped (mock): SoC reset to 95 %");
    }
    st.cellSpread = Math.min(0.045, st.cellSpread + Math.abs(I) * dt * 2e-7);
    const cellV = st.packV / CAR.cells;
    st.cellMin = cellV - st.cellSpread * 0.6 - Math.abs(I) * 0.0004;
    st.cellMax = cellV + st.cellSpread * 0.4;
    st.busI = I;
    if (!st.tsActive) {
      st.busV = 0;
    } else if (st.vsmState === VSM_STATE.PrechargeInit || st.vsmState === VSM_STATE.PrechargeActive) {
      const tp = Math.max(0, st.t - 2.3);
      st.busV = st.packV * (1 - Math.exp(-tp / 0.45));
    } else {
      st.busV = st.packV - I * 0.02;
    }
  }

  private updateThermal(dt: number): void {
    const st = this.state;
    const amb = CAR.ambientK;
    const pm = Math.abs(st.mechPower);
    const motorLoss = 0.06 * pm + 0.0008 * st.torqueFb * st.torqueFb * 10 + 40;
    st.motorTempK += ((motorLoss - (st.motorTempK - st.coolantTempK) * 28) / 9000) * dt;
    const invLoss = 0.025 * Math.abs(st.dcPower) + 30;
    st.inverterTempK += ((invLoss - (st.inverterTempK - st.coolantTempK) * 45) / 3500) * dt;
    const toCoolant = (st.motorTempK - st.coolantTempK) * 28 + (st.inverterTempK - st.coolantTempK) * 45;
    const radiator = (st.coolantTempK - amb) * (60 + 6 * st.v);
    st.coolantTempK += ((toCoolant - radiator) / 12000) * dt;
    const packHeat = st.busI * st.busI * CAR.cellR * CAR.cells;
    st.accTempMaxK += ((packHeat * 1.15 - (st.accTempMaxK - amb) * 22) / 40000) * dt;
    st.accTempMinK += ((packHeat * 0.85 - (st.accTempMinK - amb) * 26) / 40000) * dt;
  }
}
