// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import LineGraphFilter from "./LineGraphFilter";
import { charIsCapital } from "./util";

export namespace Units {
  export type UnitConfig = {
    value: number;
    suffix: string;
    pluralizeSuffix: boolean;
    names: string[];
  };

  export type UnitCollection = {
    [id: string]: UnitConfig;
  };

  export const UNIT_GROUPS: { [id: string]: UnitCollection } = {
    length: {
      meters: {
        value: 1,
        suffix: "m",
        pluralizeSuffix: false,
        names: ["m", "meter", "meters"]
      },
      inches: {
        value: 1 / 0.0254,
        suffix: "in",
        pluralizeSuffix: false,
        names: ["in", "inch", "inches"]
      },
      millimeters: {
        value: 1000,
        suffix: "mm",
        pluralizeSuffix: false,
        names: ["mm", "millimeter", "millimeters"]
      },
      centimeters: {
        value: 100,
        suffix: "cm",
        pluralizeSuffix: false,
        names: ["cm", "centimeter", "centimeters"]
      },
      kilometers: {
        value: 0.001,
        suffix: "km",
        pluralizeSuffix: false,
        names: ["km", "kilometer", "kilometers"]
      },
      feet: {
        value: 1 / (0.0254 * 12),
        suffix: "ft",
        pluralizeSuffix: false,
        names: ["ft", "foot", "feet"]
      },
      yards: {
        value: 1 / (0.0254 * 12 * 3),
        suffix: "yd",
        pluralizeSuffix: false,
        names: ["yd", "yard", "yards"]
      },
      miles: {
        value: 1 / (0.0254 * 12 * 3 * 1760),
        suffix: "mi",
        pluralizeSuffix: false,
        names: ["mi", "mile", "miles"]
      }
    },
    angle: {
      radians: {
        value: 1,
        suffix: "rad",
        pluralizeSuffix: true,
        names: ["rad", "rads", "radian", "radians"]
      },
      degrees: {
        value: 180 / Math.PI,
        suffix: "°",
        pluralizeSuffix: false,
        names: ["°", "deg", "degs", "degree", "degrees"]
      },
      rotations: {
        value: 1 / (Math.PI * 2),
        suffix: "rot",
        pluralizeSuffix: true,
        names: ["rot", "rots", "rotation", "rotations"]
      }
    },
    velocity: {
      "meters/second": {
        value: 1,
        suffix: "m/s",
        pluralizeSuffix: false,
        names: [
          "mps",
          "meterpersec",
          "meter per sec",
          "meterspersec",
          "meters per sec",
          "meterpersecond",
          "meter per second",
          "meterspersecond",
          "meters per second"
        ]
      },
      "inches/second": {
        value: 1 / 0.0254,
        suffix: "in/s",
        pluralizeSuffix: false,
        names: ["inch per sec", "inches per sec", "inch per second", "inches per second", "in per sec", "in per second"]
      },
      "feet/second": {
        value: 1 / (0.0254 * 12),
        suffix: "ft/s",
        pluralizeSuffix: false,
        names: [
          "fps",
          "ftps",
          "foot per sec",
          "feet per sec",
          "foot per second",
          "feet per second",
          "ft per sec",
          "ft per second"
        ]
      },
      "miles/hour": {
        value: 3600 / (0.0254 * 12 * 3 * 1760),
        suffix: "mph",
        pluralizeSuffix: false,
        names: ["mph", "mile per hour", "miles per hour", "mi per hour"]
      },
      "kilometers/hour": {
        value: 3600 / 1000,
        suffix: "kph",
        pluralizeSuffix: false,
        names: ["kph", "kilometer per hour", "kilometers per hour", "ki per hour"]
      }
    },
    "angular velocity": {
      "radians/second": {
        value: 1,
        suffix: "rad/s",
        pluralizeSuffix: false,
        names: [
          "radian per sec",
          "radians per sec",
          "radian per second",
          "radians per second",
          "rad per sec",
          "rad per second",
          "rads per sec",
          "rads per second"
        ]
      },
      "degrees/second": {
        value: 180 / Math.PI,
        suffix: "°/s",
        pluralizeSuffix: false,
        names: [
          "dps",
          "degree per sec",
          "degrees per sec",
          "degree per second",
          "degrees per second",
          "deg per sec",
          "deg per second",
          "degs per sec",
          "degs per second"
        ]
      },
      "rotations/second": {
        value: 1 / (Math.PI * 2),
        suffix: "rps",
        pluralizeSuffix: false,
        names: [
          "rps",
          "rotation per sec",
          "rotations per sec",
          "rotation per second",
          "rotations per second",
          "rot per sec",
          "rot per second",
          "rots per sec",
          "rots per second"
        ]
      },
      "rotations/minute": {
        value: 60 / (Math.PI * 2),
        suffix: "rpm",
        pluralizeSuffix: false,
        names: [
          "rpm",
          "rotation per min",
          "rotations per min",
          "rotation per minute",
          "rotations per minute",
          "rot per min",
          "rot per minute",
          "rots per min",
          "rots per minute"
        ]
      }
    },
    acceleration: {
      "meters/second²": {
        value: 1,
        suffix: "m/s²",
        pluralizeSuffix: false,
        names: [
          "mps 2",
          "mps2",
          "mps²",
          "meter per sec 2",
          "meters per sec 2",
          "meter per sec2",
          "meters per sec2",
          "meter per sec²",
          "meters per sec²",
          "meter per sec squared",
          "meters per sec squared",
          "meter per sec per sec",
          "meters per sec per sec",
          "meter per second 2",
          "meters per second 2",
          "meter per second2",
          "meters per second2",
          "meter per second²",
          "meters per second²",
          "meter per second squared",
          "meters per second squared",
          "meter per second per second",
          "meters per second per second"
        ]
      },
      "inches/second²": {
        value: 1 / 0.0254,
        suffix: "in/s²",
        pluralizeSuffix: false,
        names: [
          "ips 2",
          "ips2",
          "ips²",
          "inch per sec 2",
          "inches per sec 2",
          "inch per sec2",
          "inches per sec2",
          "inch per sec²",
          "inches per sec²",
          "inch per sec squared",
          "inches per sec squared",
          "inch per sec per sec",
          "inches per sec per sec",
          "in per sec 2",
          "in per sec2",
          "in per sec²",
          "in per sec squared",
          "in per sec per sec",
          "inch per second 2",
          "inches per second 2",
          "inch per second2",
          "inches per second2",
          "inch per second²",
          "inches per second²",
          "inch per second squared",
          "inches per second squared",
          "inch per second per second",
          "inches per second per second",
          "in per second 2",
          "in per second2",
          "in per second²",
          "in per second squared",
          "in per second per second"
        ]
      },
      "feet/second²": {
        value: 1 / (0.0254 * 12),
        suffix: "ft/s²",
        pluralizeSuffix: false,
        names: [
          "fps 2",
          "fps2",
          "fps²",
          "foot per sec 2",
          "feet per sec 2",
          "foot per sec2",
          "feet per sec2",
          "foot per sec²",
          "feet per sec²",
          "foot per sec squared",
          "feet per sec squared",
          "foot per sec per sec",
          "feet per sec per sec",
          "ft per sec 2",
          "ft per sec2",
          "ft per sec²",
          "ft per sec squared",
          "ft per sec per sec",
          "foot per second 2",
          "feet per second 2",
          "foot per second2",
          "feet per second2",
          "foot per second²",
          "feet per second²",
          "foot per second squared",
          "feet per second squared",
          "foot per second per second",
          "feet per second per second",
          "ft per second 2",
          "ft per second2",
          "ft per second²",
          "ft per second squared",
          "ft per second per second"
        ]
      },
      "standard gravity": {
        value: 1 / 9.80665,
        suffix: "g",
        pluralizeSuffix: false,
        names: ["g", "gravity", "gs"]
      }
    },
    "angular acceleration": {
      "radians/second²": {
        value: 1,
        suffix: "rad/s²",
        pluralizeSuffix: false,
        names: [
          "radian per sec 2",
          "radians per sec 2",
          "radian per sec2",
          "radians per sec2",
          "radian per sec²",
          "radians per sec²",
          "radian per sec squared",
          "radians per sec squared",
          "radian per sec per sec",
          "radians per sec per sec",
          "rad per sec 2",
          "rad per sec2",
          "rad per sec²",
          "rad per sec squared",
          "rad per sec per sec",
          "rads per sec 2",
          "rads per sec2",
          "rads per sec²",
          "rads per sec squared",
          "rads per sec per sec",
          "radian per second 2",
          "radians per second 2",
          "radian per second2",
          "radians per second2",
          "radian per second²",
          "radians per second²",
          "radian per second squared",
          "radians per second squared",
          "radian per second per second",
          "radians per second per second",
          "rad per second 2",
          "rad per second2",
          "rad per second²",
          "rad per second squared",
          "rad per second per second",
          "rads per second 2",
          "rads per second2",
          "rads per second²",
          "rads per second squared",
          "rads per second per second"
        ]
      },
      "degrees/second²": {
        value: 180 / Math.PI,
        suffix: "°/s²",
        pluralizeSuffix: false,
        names: [
          "dps 2",
          "dps2",
          "dps²",
          "degree per sec 2",
          "degrees per sec 2",
          "degree per sec2",
          "degrees per sec2",
          "degree per sec²",
          "degrees per sec²",
          "degree per sec squared",
          "degrees per sec squared",
          "degree per sec per sec",
          "degrees per sec per sec",
          "deg per sec 2",
          "deg per sec2",
          "deg per sec²",
          "deg per sec squared",
          "deg per sec per sec",
          "degs per sec 2",
          "degs per sec2",
          "degs per sec²",
          "degs per sec squared",
          "degs per sec per sec",
          "degree per second 2",
          "degrees per second 2",
          "degree per second2",
          "degrees per second2",
          "degree per second²",
          "degrees per second²",
          "degree per second squared",
          "degrees per second squared",
          "degree per second per second",
          "degrees per second per second",
          "deg per second 2",
          "deg per second2",
          "deg per second²",
          "deg per second squared",
          "deg per second per second",
          "degs per second 2",
          "degs per second2",
          "degs per second²",
          "degs per second squared",
          "degs per second per second"
        ]
      },
      "rotations/second²": {
        value: 1 / (Math.PI * 2),
        suffix: "rot/s²",
        pluralizeSuffix: false,
        names: [
          "rps 2",
          "rps2",
          "rps²",
          "rotation per sec 2",
          "rotations per sec 2",
          "rotation per sec2",
          "rotations per sec2",
          "rotation per sec²",
          "rotations per sec²",
          "rotation per sec squared",
          "rotations per sec squared",
          "rotation per sec per sec",
          "rotations per sec per sec",
          "rot per sec 2",
          "rot per sec2",
          "rot per sec²",
          "rot per sec squared",
          "rot per sec per sec",
          "rots per sec 2",
          "rots per sec2",
          "rots per sec²",
          "rots per sec squared",
          "rots per sec per sec",
          "rotation per second 2",
          "rotations per second 2",
          "rotation per second2",
          "rotations per second2",
          "rotation per second²",
          "rotations per second²",
          "rotation per second squared",
          "rotations per second squared",
          "rotation per second per second",
          "rotations per second per second",
          "rot per second 2",
          "rot per second2",
          "rot per second²",
          "rot per second squared",
          "rot per second per second",
          "rots per second 2",
          "rots per second2",
          "rots per second²",
          "rots per second squared",
          "rots per second per second"
        ]
      }
    },
    time: {
      seconds: {
        value: 1,
        suffix: "s",
        pluralizeSuffix: false,
        names: ["s", "sec", "secs", "second", "seconds"]
      },
      milliseconds: {
        value: 1000,
        suffix: "ms",
        pluralizeSuffix: false,
        names: ["ms", "msec", "msecs", "milli", "millis", "millisecond", "milliseconds"]
      },
      microseconds: {
        value: 1000000,
        suffix: "μs",
        pluralizeSuffix: false,
        names: ["us", "usec", "usecs", "micro", "micros", "microsecond", "microseconds"]
      },
      nanoseconds: {
        value: 1000000000,
        suffix: "ns",
        pluralizeSuffix: false,
        names: ["ns", "nsec", "nsecs", "nano", "nanos", "nanosecond", "nanoseconds"]
      },
      minutes: {
        value: 1 / 60,
        suffix: "min",
        pluralizeSuffix: true,
        names: ["min", "mins", "minute", "minutes"]
      },
      hours: {
        value: 1 / 3600,
        suffix: "hr",
        pluralizeSuffix: true,
        names: ["hr", "hrs", "hour", "hours"]
      },
      days: {
        value: 1 / 86400,
        suffix: "day",
        pluralizeSuffix: true,
        names: ["day", "days"]
      }
    },
    bytes: {
      bytes: {
        value: 1,
        suffix: "B",
        pluralizeSuffix: false,
        names: ["byte", "bytes"]
      },
      kilobytes: {
        value: 1 / 1024,
        suffix: "KB",
        pluralizeSuffix: false,
        names: ["kb", "kilobyte", "kilobytes"]
      },
      megabytes: {
        value: 1 / (1024 * 1024),
        suffix: "MB",
        pluralizeSuffix: false,
        names: ["mb", "megabyte", "megabytes"]
      },
      gigabytes: {
        value: 1 / (1024 * 1024 * 1024),
        suffix: "GB",
        pluralizeSuffix: false,
        names: ["gb", "gigabyte", "gigabytes"]
      },
      terabytes: {
        value: 1 / (1024 * 1024 * 1024 * 1024),
        suffix: "TB",
        pluralizeSuffix: false,
        names: ["tb", "terabyte", "terabytes"]
      }
    },
    bandwidth: {
      "bits/second": {
        value: 1,
        suffix: "b/s",
        pluralizeSuffix: false,
        names: ["bps", "bit per second", "bits per second"]
      },
      "bytes/second": {
        value: 1 / 8,
        suffix: "B/s",
        pluralizeSuffix: false,
        names: ["Bps", "byte per second", "bytes per second"]
      },
      "kilobits/second": {
        value: 1 / 1024,
        suffix: "kb/s",
        pluralizeSuffix: false,
        names: ["Kbps", "kilobit per second", "kilobits per second"]
      },
      "kilobytes/second": {
        value: 1 / (1024 * 8),
        suffix: "KB/s",
        pluralizeSuffix: false,
        names: ["KBps", "kilobyte per second", "kilobytes per second"]
      },
      "megabits/second": {
        value: 1 / (1024 * 1024),
        suffix: "Mb/s",
        pluralizeSuffix: false,
        names: ["Mbps", "megabit per second", "megabits per second"]
      },
      "megabytes/second": {
        value: 1 / (1024 * 1024 * 8),
        suffix: "MB/s",
        pluralizeSuffix: false,
        names: ["MBps", "megabyte per second", "megabytes per second"]
      },
      "gigabits/second": {
        value: 1 / (1024 * 1024 * 1024),
        suffix: "Gb/s",
        pluralizeSuffix: false,
        names: ["Gbps", "gigabit per second", "gigabits per second"]
      },
      "gigabytes/second": {
        value: 1 / (1024 * 1024 * 1024 * 8),
        suffix: "GB/s",
        pluralizeSuffix: false,
        names: ["GBps", "gigabyte per second", "gigabytes per second"]
      },
      "terabits/second": {
        value: 1 / (1024 * 1024 * 1024 * 1024),
        suffix: "Tb/s",
        pluralizeSuffix: false,
        names: ["Tbps", "terabit per second", "terabits per second"]
      },
      "terabytes/second": {
        value: 1 / (1024 * 1024 * 1024 * 1024 * 8),
        suffix: "TB/s",
        pluralizeSuffix: false,
        names: ["TBps", "terabyte per second", "terabytes per second"]
      }
    },
    frequency: {
      hertz: {
        value: 1,
        suffix: "Hz",
        pluralizeSuffix: false,
        names: ["hz", "hertz", "frequency"]
      },
      kilohertz: {
        value: 1e-3,
        suffix: "kHz",
        pluralizeSuffix: false,
        names: ["khz", "kilohertz"]
      },
      megahertz: {
        value: 1e-6,
        suffix: "MHz",
        pluralizeSuffix: false,
        names: ["mhz", "megahertz"]
      }
    },
    temperature: {
      celsius: {
        value: 1,
        suffix: "°C",
        pluralizeSuffix: false,
        names: ["c", "°c", "\u2103", "celsius", "celcius"] // Includes common misspelling
      },
      fahrenheit: {
        value: 1, // Requires custom conversion
        suffix: "°F",
        pluralizeSuffix: false,
        names: ["f", "°f", "\u2109", "fahrenheit"]
      }
    },
    voltage: {
      volts: {
        value: 1,
        suffix: "V",
        pluralizeSuffix: false,
        names: ["v", "volt", "volts", "voltage"]
      },
      millivolts: {
        value: 1000,
        suffix: "mV",
        pluralizeSuffix: false,
        names: ["mv", "millivolt", "millivolts"]
      }
    },
    current: {
      amps: {
        value: 1,
        suffix: "A",
        pluralizeSuffix: false,
        names: ["amp", "amps", "amperage", "current"]
      },
      milliamps: {
        value: 1000,
        suffix: "mA",
        pluralizeSuffix: false,
        names: ["ma", "milliamp", "milliamps"]
      }
    },
    energy: {
      joule: {
        value: 1,
        suffix: "J",
        pluralizeSuffix: false,
        names: ["j", "joule", "joules"]
      },
      "watt hour": {
        value: 1 / 3600,
        suffix: "Wh",
        pluralizeSuffix: false,
        names: ["wh", "watt hour", "watt hours"]
      },
      calorie: {
        value: 1 / 4.184,
        suffix: "cal",
        pluralizeSuffix: true,
        names: ["cal", "calorie", "calories"]
      }
    }
  };

  export const STRUCT_UNITS: { [key: string]: { [key: string]: string } } = {
    Rotation2d: {
      value: "radians"
    },
    Translation2d: {
      x: "meters",
      y: "meters"
    },
    Translation3d: {
      x: "meters",
      y: "meters",
      z: "meters"
    },
    Twist2d: {
      dx: "meters",
      dy: "meters",
      dtheta: "radians"
    },
    Twist3d: {
      dx: "meters",
      dy: "meters",
      dz: "meters",
      rx: "radians",
      ry: "radians",
      rz: "radians"
    },
    ChassisSpeeds: {
      vx: "meters/second",
      vy: "meters/second",
      omega: "radians/second"
    },
    DifferentialDriveKinematics: {
      track_width: "meters"
    },
    DifferentialDriveWheelPositions: {
      left: "meters",
      right: "meters"
    },
    DifferentialDriveWheelSpeeds: {
      left: "meters/second",
      right: "meters/second"
    },
    DifferentialDriveWheelVoltages: {
      left: "volts",
      right: "volts"
    },
    MecanumDriveWheelPositions: {
      front_left: "meters",
      front_right: "meters",
      rear_left: "meters",
      rear_right: "meters"
    },
    MecanumDriveWheelSpeeds: {
      front_left: "meters/second",
      front_right: "meters/second",
      rear_left: "meters/second",
      rear_right: "meters/second"
    },
    SwerveModulePositionStruct: {
      distance: "meters"
    },
    SwerveModuleState: {
      speed: "meters/second"
    },
    ArmFeedforward: {
      dt: "seconds"
    },
    ElevatorFeedforward: {
      dt: "seconds"
    },
    SimpleMotorFeedforward: {
      dt: "seconds"
    },
    DCMotor: {
      nominal_voltage: "volts",
      stall_current: "amps",
      free_current: "amps",
      free_speed: "radians/second"
    }
  };

  export const ALL_UNITS: UnitCollection = Object.assign({}, ...Object.values(UNIT_GROUPS));

  export function convert(value: number, from: string, to: string): number {
    if (!(from in ALL_UNITS && to in ALL_UNITS)) throw "Invalid unit provided";

    let standardValue;
    if (from === "fahrenheit") {
      standardValue = (value - 32) / 1.8;
    } else {
      standardValue = value / ALL_UNITS[from].value;
    }
    if (to === "fahrenheit") {
      return standardValue * 1.8 + 32;
    } else {
      return standardValue * ALL_UNITS[to].value;
    }
  }

  export function convertWithPreset(value: number, preset: UnitConversionPreset) {
    if (preset.type === null && preset.factor === 1) {
      return value;
    } else if (preset.from === undefined || preset.to === undefined) {
      return value * preset.factor;
    } else {
      return convert(value, preset.from, preset.to) * preset.factor;
    }
  }

  /** Returns a modified suffix for a differentiated or integrated unit type. */
  export function getSuffixForFilter(suffix: string, filter: LineGraphFilter): string {
    switch (filter) {
      case LineGraphFilter.Differentiate:
        if (suffix.endsWith("²")) {
          return suffix.slice(0, -1) + "³";
        } else if (suffix.endsWith("ps") || suffix.endsWith("/s")) {
          return suffix + "²";
        } else {
          return suffix + "/s";
        }
      case LineGraphFilter.Integrate:
        if (suffix.endsWith("²")) {
          return suffix.slice(0, -1);
        } else if (suffix.endsWith("/s")) {
          return suffix.slice(0, -2);
        } else {
          return suffix + "·s";
        }
      default:
        return suffix;
    }
  }

  export type UIUnitOptions = {
    autoTarget: string | null;
    preset: Units.UnitConversionPreset | null;
  };

  export type UnitConversionPreset = {
    type: string | null;
    from?: string;
    to?: string;
    factor: number;
  };

  export const NoopUnitConversion: UnitConversionPreset = {
    type: null,
    factor: 1
  };

  export const MAX_RECENT_UNITS = 5;

  export const GROUP_BY_UNIT: { [id: string]: string } = (() => {
    let output: { [id: string]: string } = {};
    Object.entries(UNIT_GROUPS).forEach(([group, units]) => {
      Object.keys(units).forEach((unit) => {
        output[unit] = group;
      });
    });
    return output;
  })();

  export const UNIT_SUFFIXES: { [key: string]: string } = (() => {
    let suffixes: { [key: string]: string } = {};
    Object.entries(ALL_UNITS).forEach(([key, config]) => {
      config.names.forEach((name) => {
        if (name.length === 0) return;
        suffixes[name] = key;
        suffixes[" " + name] = key;
        suffixes["_" + name] = key;
        if (name.includes(" ")) {
          suffixes[name.replaceAll(" ", "")] = key;
          suffixes[name.replaceAll(" ", "_")] = key;
        }
        if (name.includes(" per ")) {
          suffixes[name.replaceAll(" per ", "/")] = key;
          suffixes[name.replaceAll(" per ", "/").replaceAll(" ", "")] = key;
          suffixes[name.replaceAll(" per ", "/").replaceAll(" ", "_")] = key;
        }
      });
    });
    return suffixes;
  })();

  export function getUnitForField(fieldKey: string): string | null {
    let fieldKeyLowercase = fieldKey.toLowerCase();
    let matchedSuffixes = Object.keys(UNIT_SUFFIXES).filter(
      (suffix) =>
        !suffix.includes("/") &&
        fieldKey.length > suffix.length &&
        fieldKeyLowercase.endsWith(suffix.toLowerCase()) &&
        !fieldKeyLowercase.endsWith("/" + suffix.toLowerCase()) &&
        (suffix.startsWith("_") || suffix.startsWith(" ") || charIsCapital(fieldKey, fieldKey.length - suffix.length))
    );
    if (matchedSuffixes.length === 0) return null;

    let maxSuffixLength = matchedSuffixes.reduce((max, suffix) => Math.max(max, suffix.length), 0);
    let longestSuffixes = matchedSuffixes.filter((suffix) => suffix.length === maxSuffixLength);
    if (longestSuffixes.length === 1) return UNIT_SUFFIXES[longestSuffixes[0]];

    let bestSuffix = longestSuffixes[0];
    let bestMatchedChars = 0;
    for (let i = 0; i < longestSuffixes.length; i++) {
      let matchedChars = 0;
      for (let j = 0; j < longestSuffixes[i].length; j++) {
        if (fieldKey[fieldKey.length - longestSuffixes[i].length + j] === longestSuffixes[i][j]) {
          matchedChars++;
        }
      }
      if (matchedChars > bestMatchedChars) {
        bestSuffix = longestSuffixes[i];
        bestMatchedChars = matchedChars;
      }
    }
    return UNIT_SUFFIXES[bestSuffix];
  }
}
