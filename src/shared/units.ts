export const GROUPED_UNITS: { [id: string]: { [id: string]: number } } = {
  length: {
    meters: 1,
    inches: 1 / 0.0254,
    millimeters: 1000,
    centimeters: 100,
    kilometers: 0.001,
    feet: 1 / (0.0254 * 12),
    yards: 1 / (0.0254 * 12 * 3),
    miles: 1 / (0.0254 * 12 * 3 * 1760)
  },
  angle: {
    radians: 1,
    degrees: 180 / Math.PI,
    rotations: 1 / (Math.PI * 2)
  },
  velocity: {
    "meters/second": 1,
    "inches/second": 1 / 0.0254,
    "feet/second": 1 / (0.0254 * 12),
    "miles/hour": 3600 / (0.0254 * 12 * 3 * 1760)
  },
  "angular velocity": {
    "radians/second": 1,
    "degrees/second": 180 / Math.PI,
    "rotations/second": 1 / (Math.PI * 2),
    "rotations/minute": 60 / (Math.PI * 2)
  },
  acceleration: {
    "meters/second^2": 1,
    "inches/second^2": 1 / 0.0254,
    "feet/second^2": 1 / (0.0254 * 12),
    "standard gravity": 1 / 9.80665
  },
  time: {
    seconds: 1,
    milliseconds: 1000,
    microseconds: 1000000,
    minutes: 1 / 60,
    hours: 1 / 3600,
    days: 1 / 86400
  },
  temperature: {
    celsius: 1,
    fahrenheit: 1 // Requires custom conversion
  },
  energy: {
    joule: 1,
    "watt hour": 1 / 3600,
    calorie: 1 / 4.184
  }
};

export const ALL_UNITS = Object.assign({}, ...Object.values(GROUPED_UNITS));

export function convert(value: number, from: string, to: string): number {
  if (!(from in ALL_UNITS && to in ALL_UNITS)) throw "Invalid unit provided";

  let standardValue;
  if (from === "fahrenheit") {
    standardValue = (value - 32) / 1.8;
  } else {
    standardValue = value / ALL_UNITS[from];
  }
  if (to === "fahrenheit") {
    return standardValue * 1.8 + 32;
  } else {
    return standardValue * ALL_UNITS[to];
  }
}

export function convertWithPreset(value: number, preset: UnitConversionPreset) {
  if (preset.type === null || preset.from === undefined || preset.to === undefined) {
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
