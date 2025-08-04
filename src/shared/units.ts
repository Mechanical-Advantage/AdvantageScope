// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

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
        names: ["m", "meters"]
      },
      inches: {
        value: 1 / 0.0254,
        suffix: "in",
        pluralizeSuffix: false,
        names: ["in", "inches"]
      },
      millimeters: {
        value: 1000,
        suffix: "mm",
        pluralizeSuffix: false,
        names: ["mm", "millimeters"]
      },
      centimeters: {
        value: 100,
        suffix: "cm",
        pluralizeSuffix: false,
        names: ["cm", "centimeters"]
      },
      kilometers: {
        value: 0.001,
        suffix: "km",
        pluralizeSuffix: false,
        names: ["km", "kilometers"]
      },
      feet: {
        value: 1 / (0.0254 * 12),
        suffix: "ft",
        pluralizeSuffix: false,
        names: ["ft", "feet"]
      },
      yards: {
        value: 1 / (0.0254 * 12 * 3),
        suffix: "yd",
        pluralizeSuffix: false,
        names: ["yd", "yards"]
      },
      miles: {
        value: 1 / (0.0254 * 12 * 3 * 1760),
        suffix: "mi",
        pluralizeSuffix: false,
        names: ["mi", "miles"]
      }
    },
    angle: {
      radians: {
        value: 1,
        suffix: "rad",
        pluralizeSuffix: true,
        names: ["rads", "radians"]
      },
      degrees: {
        value: 180 / Math.PI,
        suffix: "°",
        pluralizeSuffix: false,
        names: ["°", "degs", "degrees"]
      },
      rotations: {
        value: 1 / (Math.PI * 2),
        suffix: "rot",
        pluralizeSuffix: true,
        names: ["rots", "rotations"]
      }
    },
    velocity: {
      "meters/second": {
        value: 1,
        suffix: "m/s",
        pluralizeSuffix: false,
        names: ["mps", "meterspersec", "meters per sec", "meterspersecond", "meters per second"]
      },
      "inches/second": {
        value: 1 / 0.0254,
        suffix: "in/s",
        pluralizeSuffix: false,
        names: ["ips", "inches per sec", "inches per second", "in per sec", "in per second"]
      },
      "feet/second": {
        value: 1 / (0.0254 * 12),
        suffix: "ft/s",
        pluralizeSuffix: false,
        names: ["fps", "feet per sec", "feet per second", "ft per sec", "ft per second"]
      },
      "miles/hour": {
        value: 3600 / (0.0254 * 12 * 3 * 1760),
        suffix: "mph",
        pluralizeSuffix: false,
        names: ["mph", "miles per hour", "mi per hour"]
      }
    },
    "angular velocity": {
      "radians/second": {
        value: 1,
        suffix: "rad/s",
        pluralizeSuffix: false,
        names: ["radians per sec", "radians per second", "rad per sec", "rad per second"]
      },
      "degrees/second": {
        value: 180 / Math.PI,
        suffix: "°/s",
        pluralizeSuffix: false,
        names: ["dps", "degrees per sec", "degrees per second", "deg per sec", "deg per second"]
      },
      "rotations/second": {
        value: 1 / (Math.PI * 2),
        suffix: "rps",
        pluralizeSuffix: false,
        names: ["rps", "rotations per sec", "rotations per second", "rot per sec", "rot per second"]
      },
      "rotations/minute": {
        value: 60 / (Math.PI * 2),
        suffix: "rpm",
        pluralizeSuffix: false,
        names: ["rpm", "rotations per min", "rotations per minute", "rot per min", "rot per minute"]
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
          "meters per sec 2",
          "meters per sec2",
          "meters per sec²",
          "meters per sec squared",
          "meters per second 2",
          "meters per second2",
          "meters per second²",
          "meters per second squared"
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
          "inches per sec 2",
          "inches per sec2",
          "inches per sec²",
          "inches per sec squared",
          "in per sec 2",
          "in per sec2",
          "in per sec²",
          "in per sec squared",
          "inches per second 2",
          "inches per second2",
          "inches per second²",
          "inches per second squared",
          "in per second 2",
          "in per second2",
          "in per second²",
          "in per second squared"
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
          "feet per sec 2",
          "feet per sec2",
          "feet per sec²",
          "feet per sec squared",
          "ft per sec 2",
          "ft per sec2",
          "ft per sec²",
          "ft per sec squared",
          "feet per second 2",
          "feet per second2",
          "feet per second²",
          "feet per second squared",
          "ft per second 2",
          "ft per second2",
          "ft per second²",
          "ft per second squared"
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
          "radians per sec 2",
          "radians per sec2",
          "radians per sec²",
          "radians per sec squared",
          "rads per sec 2",
          "rads per sec2",
          "rads per sec²",
          "rads per sec squared",
          "radians per second 2",
          "radians per second2",
          "radians per second²",
          "radians per second squared",
          "rads per second 2",
          "rads per second2",
          "rads per second²",
          "rads per second squared"
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
          "degrees per sec 2",
          "degrees per sec2",
          "degrees per sec²",
          "degrees per sec squared",
          "deg per sec 2",
          "deg per sec2",
          "deg per sec²",
          "deg per sec squared",
          "degrees per second 2",
          "degrees per second2",
          "degrees per second²",
          "degrees per second squared",
          "deg per second 2",
          "deg per second2",
          "deg per second²",
          "deg per second squared"
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
          "rotations per sec 2",
          "rotations per sec2",
          "rotations per sec²",
          "rotations per sec squared",
          "rots per sec 2",
          "rots per sec2",
          "rots per sec²",
          "rots per sec squared",
          "rotations per second 2",
          "rotations per second2",
          "rotations per second²",
          "rotations per second squared",
          "rots per second 2",
          "rots per second2",
          "rots per second²",
          "rots per second squared"
        ]
      }
    },
    time: {
      seconds: {
        value: 1,
        suffix: "s",
        pluralizeSuffix: false,
        names: ["s", "secs", "seconds"]
      },
      milliseconds: {
        value: 1000,
        suffix: "ms",
        pluralizeSuffix: false,
        names: ["ms", "msecs", "millis", "milliseconds"]
      },
      microseconds: {
        value: 1000000,
        suffix: "μs",
        pluralizeSuffix: false,
        names: ["us", "usecs", "micros", "microseconds"]
      },
      minutes: {
        value: 1 / 60,
        suffix: "min",
        pluralizeSuffix: true,
        names: ["mins", "minutes"]
      },
      hours: {
        value: 1 / 3600,
        suffix: "hr",
        pluralizeSuffix: true,
        names: ["hrs", "hours"]
      },
      days: {
        value: 1 / 86400,
        suffix: "day",
        pluralizeSuffix: true,
        names: ["days"]
      }
    },
    bytes: {
      bytes: {
        value: 1,
        suffix: "B",
        pluralizeSuffix: false,
        names: ["bytes"]
      },
      kilobytes: {
        value: 1 / 1024,
        suffix: "KB",
        pluralizeSuffix: false,
        names: ["kb", "kilobytes"]
      },
      megabytes: {
        value: 1 / (1024 * 1024),
        suffix: "MB",
        pluralizeSuffix: false,
        names: ["mb", "megabytes"]
      },
      gigabytes: {
        value: 1 / (1024 * 1024 * 1024),
        suffix: "GB",
        pluralizeSuffix: false,
        names: ["gb", "gigabytes"]
      },
      terabytes: {
        value: 1 / (1024 * 1024 * 1024 * 1024),
        suffix: "TB",
        pluralizeSuffix: false,
        names: ["tb", "terabytes"]
      }
    },
    bandwidth: {
      "bits/second": {
        value: 1,
        suffix: "b/s",
        pluralizeSuffix: false,
        names: ["bps", "bits per second"]
      },
      "bytes/second": {
        value: 1 / 8,
        suffix: "B/s",
        pluralizeSuffix: false,
        names: ["Bps", "bytes per second"]
      },
      "kilobits/second": {
        value: 1 / 1024,
        suffix: "kb/s",
        pluralizeSuffix: false,
        names: ["Kbps", "kilobits per second"]
      },
      "kilobytes/second": {
        value: 1 / (1024 * 8),
        suffix: "KB/s",
        pluralizeSuffix: false,
        names: ["KBps", "kilobytes per second"]
      },
      "megabits/second": {
        value: 1 / (1024 * 1024),
        suffix: "Mb/s",
        pluralizeSuffix: false,
        names: ["Mbps", "megabits per second"]
      },
      "megabytes/second": {
        value: 1 / (1024 * 1024 * 8),
        suffix: "MB/s",
        pluralizeSuffix: false,
        names: ["MBps", "megabytes per second"]
      },
      "gigabits/second": {
        value: 1 / (1024 * 1024 * 1024),
        suffix: "Gb/s",
        pluralizeSuffix: false,
        names: ["Gbps", "gigabits per second"]
      },
      "gigabytes/second": {
        value: 1 / (1024 * 1024 * 1024 * 8),
        suffix: "GB/s",
        pluralizeSuffix: false,
        names: ["GBps", "gigabytes per second"]
      },
      "terabits/second": {
        value: 1 / (1024 * 1024 * 1024 * 1024),
        suffix: "Tb/s",
        pluralizeSuffix: false,
        names: ["Tbps", "terabits per second"]
      },
      "terabytes/second": {
        value: 1 / (1024 * 1024 * 1024 * 1024 * 8),
        suffix: "TB/s",
        pluralizeSuffix: false,
        names: ["TBps", "terabytes per second"]
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
        names: ["v", "volts", "voltage"]
      },
      millivolts: {
        value: 1,
        suffix: "mV",
        pluralizeSuffix: false,
        names: ["mv", "millivolts"]
      }
    },
    current: {
      amps: {
        value: 1,
        suffix: "A",
        pluralizeSuffix: false,
        names: ["amps", "amperage", "current"]
      },
      milliamps: {
        value: 1,
        suffix: "mA",
        pluralizeSuffix: false,
        names: ["ma", "milliamps"]
      }
    },
    energy: {
      joule: {
        value: 1,
        suffix: "J",
        pluralizeSuffix: false,
        names: ["j", "joules"]
      },
      "watt hour": {
        value: 1 / 3600,
        suffix: "Wh",
        pluralizeSuffix: false,
        names: ["wh", "watt hours"]
      },
      calorie: {
        value: 1 / 4.184,
        suffix: "cal",
        pluralizeSuffix: true,
        names: ["cal", "calories"]
      }
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

  export interface UnitConversionPreset {
    type: string | null;
    from?: string;
    to?: string;
    factor: number;
  }

  export const NoopUnitConversion: UnitConversionPreset = {
    type: null,
    factor: 1
  };

  export const MAX_RECENT_UNITS = 5;

  export const UNIT_SUFFIXES: { [key: string]: string } = (() => {
    let suffixes: { [key: string]: string } = {};
    Object.entries(ALL_UNITS).forEach(([key, config]) => {
      [...config.names, ...config.names.filter((name) => name.endsWith("s")).map((name) => name.slice(0, -1))].forEach(
        (name) => {
          suffixes[name] = key;
          suffixes[" " + name] = key;
          suffixes["_" + name] = key;
          if (name.includes(" ")) {
            suffixes[name.replaceAll(" ", "")] = key;
            suffixes[name.replaceAll(" ", "_")] = key;
          }
        }
      );
    });
    return suffixes;
  })();

  export function getUnitForField(fieldKey: string): string | null {
    let fieldKeyLowercase = fieldKey.toLowerCase();
    let matchedSuffixes = Object.keys(UNIT_SUFFIXES).filter(
      (suffix) =>
        suffix.length <= 2
          ? fieldKey.endsWith(suffix.substring(0, 1).toUpperCase() + suffix.substring(1).toUpperCase()) ||
            fieldKey.endsWith(suffix.substring(0, 1).toUpperCase() + suffix.substring(1).toLowerCase()) // Short suffixes must start with uppercase to avoid false positives
          : fieldKeyLowercase.endsWith(suffix.toLowerCase()) // Multiple characters can be any case
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
