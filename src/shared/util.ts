/** Checks whether two arrays are equal. */
export function arraysEqual(a: any[], b: any[]): boolean {
  return (
    a.length === b.length &&
    a.every((value, index) => {
      return value === b[index];
    })
  );
}

/** Checks whether two sets are equal. */
export function setsEqual(a: Set<any>, b: Set<any>): boolean {
  return (
    a.size === b.size &&
    Array.from(a).every((value) => {
      return b.has(value);
    })
  );
}

/** Checks whether all values in an array match the given type. */
export function checkArrayType(value: unknown, type: string): boolean {
  if (!Array.isArray(value)) return false;
  return value.every((item) => typeof item === type);
}

/** Creates a deep copy of an object by converting to and from JSON. */
export function jsonCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/** Returns the HTML encoded version of a string. */
export function htmlEncode(text: string): string {
  return text.replace(/[\u00A0-\u9999<>\&]/g, (i) => {
    return "&#" + i.charCodeAt(0) + ";";
  });
}

/** Returns an array of ascending integers with the specified length. */
export function indexArray(length: number): number[] {
  return Array.from({ length: length }, (_, i) => i);
}

/** Calculates a mock progress value. */
export function calcMockProgress(time: number, maxPercent = 0.6): number {
  // https://www.desmos.com/calculator/86u4rnu8ob
  return maxPercent - maxPercent / (0.1 * time + 1);
}

/** Adjust the brightness of a HEX color.*/
export function shiftColor(color: string, shift: number): string {
  let colorHexArray = color.slice(1).match(/.{1,2}/g);
  let colorArray = [0, 0, 0];
  if (colorHexArray !== null)
    colorArray = [parseInt(colorHexArray[0], 16), parseInt(colorHexArray[1], 16), parseInt(colorHexArray[2], 16)];
  let shiftedColorArray = colorArray.map((x) => {
    x += shift;
    if (x < 0) x = 0;
    if (x > 255) x = 255;
    return x;
  });
  return "rgb(" + shiftedColorArray.toString() + ")";
}

/** Pad a number with zeroes up to the specified length. */
export function zfill(number: string, length: number): string {
  while (number.length < length) {
    number = "0" + number;
  }
  return number;
}

/** Cleans up floating point errors. */
export function cleanFloat(float: number) {
  let output = Math.round(float * 1e6) / 1e6;
  if (output === -0) output = 0;
  return output;
}

/** Formats a time with milliseconds using three decimal places. */
export function formatTimeWithMS(time: number): string {
  let seconds = Math.floor(time);
  let milliseconds = Math.floor((time - seconds) * 1000);
  return seconds.toString() + "." + milliseconds.toString().padStart(3, "0");
}

/** Converts a value between two ranges. */
export function scaleValue(value: number, oldRange: [number, number], newRange: [number, number]): number {
  return ((value - oldRange[0]) / (oldRange[1] - oldRange[0])) * (newRange[1] - newRange[0]) + newRange[0];
}

/** Converts a value between two ranges, with caching for better performance. */
export class ValueScaler {
  private a: number;
  private b: number;

  constructor(oldRange: [number, number], newRange: [number, number]) {
    this.a = (newRange[1] - newRange[0]) / (oldRange[1] - oldRange[0]);
    this.b = newRange[0] - this.a * oldRange[0];
  }

  calculate(value: number): number {
    return value * this.a + this.b;
  }
}

/** Clamps a value to a range. */
export function clampValue(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Applys a transform to a pixel value.
 * @param originPx The origin pixel in image coordinates.
 * @param rotationRadians The rotation around the origin pixel (CCW positive).
 * @param relativePx The relative pixel coordinate in standard coordinates.
 * @returns The transformed pixel in image coordinates.
 */
export function transformPx(
  originPx: [number, number],
  rotationRadians: number,
  relativePx: [number, number]
): [number, number] {
  let hypot = Math.hypot(relativePx[0], relativePx[1]);
  let newAngle = Math.atan2(relativePx[1], relativePx[0]) + rotationRadians;
  return [originPx[0] + Math.cos(newAngle) * hypot, originPx[1] - Math.sin(newAngle) * hypot];
}

/** Wraps a radian value to a range of negative pi to pi. */
export function wrapRadians(radians: number): number {
  let wrapped = (radians + Math.PI) % (2 * Math.PI);
  if (wrapped > 0) {
    return wrapped - Math.PI;
  } else {
    return wrapped + Math.PI;
  }
}

/** Generates a random string of characters. */
export function createUUID(): string {
  let outString: string = "";
  let inOptions: string = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 32; i++) {
    outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
  }

  return outString;
}

/** Combines arrays of raw data. */
export function concatBuffers(arrays: Uint8Array[]): Uint8Array {
  let size = 0;
  arrays.forEach((array) => {
    size += array.byteLength;
  });
  let result = new Uint8Array(size);
  let position = 0;
  arrays.forEach((array) => {
    result.set(array, position);
    position += array.byteLength;
  });
  return result;
}

export function calcAxisStepSize(dataRange: [number, number], pixelRange: number, stepSizeTarget: number): number {
  let stepCount = pixelRange / stepSizeTarget;
  let stepValueApprox = (dataRange[1] - dataRange[0]) / stepCount;
  let roundBase = 10 ** Math.floor(Math.log10(stepValueApprox));
  let multiplierLookup = [0, 1, 2, 2, 5, 5, 5, 5, 5, 10, 10]; // Use friendly numbers if possible
  return roundBase * multiplierLookup[Math.round(stepValueApprox / roundBase)];
}
