const METERS_PER_INCH = 0.0254;
const RADIANS_PER_DEGREE = Math.PI / 180;

/** Converts from meters to inches. */
export function metersToInches(meters: number): number {
  return meters / METERS_PER_INCH;
}

/** Converts from inches to meters. */
export function inchesToMeters(inches: number): number {
  return inches * METERS_PER_INCH;
}

/** Converts from radians to degrees. */
export function radiansToDegrees(radians: number): number {
  return radians / RADIANS_PER_DEGREE;
}

/** Converts from degrees to radians. */
export function degreesToRadians(degrees: number): number {
  return degrees * RADIANS_PER_DEGREE;
}

/** Checks whether two arrays are equal. */
export function arraysEqual(a: any[], b: any[]): boolean {
  return (
    a.length == b.length &&
    a.every((value, index) => {
      return value === b[index];
    })
  );
}

/** Checks whether two sets are equal. */
export function setsEqual(a: Set<any>, b: Set<any>): boolean {
  return (
    a.size == b.size &&
    Array.from(a).every((value) => {
      return b.has(value);
    })
  );
}

/** Checks whether all values in an array match the given type. */
export function checkArrayType(value: unknown, type: string): boolean {
  if (!Array.isArray(value)) return false;
  value.forEach((item) => {
    if (typeof item !== type) return false;
  });
  return true;
}

/** Returns the HTML encoded version of a string. */
export function htmlEncode(text: string): string {
  return text.replace(/[\u00A0-\u9999<>\&]/g, (i) => {
    return "&#" + i.charCodeAt(0) + ";";
  });
}

/** Adjust the brightness of a HEX color.*/
export function shiftColor(color: string, shift: number): string {
  let colorHexArray = color.slice(1).match(/.{1,2}/g);
  let colorArray = [0, 0, 0];
  if (colorHexArray != null)
    colorArray = [parseInt(colorHexArray[0], 16), parseInt(colorHexArray[1], 16), parseInt(colorHexArray[2], 16)];
  let shiftedColorArray = colorArray.map((x) => {
    x += shift;
    if (x < 0) x = 0;
    if (x > 255) x = 255;
    return x;
  });
  return "rgb(" + shiftedColorArray.toString() + ")";
}

/** Cleans up floating point errors. */
export function cleanFloat(float: number) {
  let output = Math.round(float * 10000) / 10000;
  if (output == -0) output = 0;
  return output;
}

/** Formats a number using a letter (K/M/B) for large numbers. */
export function formatWithLetter(value: number): string {
  value = cleanFloat(value);
  if (Math.abs(value) >= 1e12) {
    return Math.round(value / 1e12).toString() + "T";
  } else if (Math.abs(value) >= 1e9) {
    return Math.round(value / 1e9).toString() + "B";
  } else if (Math.abs(value) >= 1e6) {
    return Math.round(value / 1e6).toString() + "M";
  } else if (Math.abs(value) >= 1e5) {
    return Math.round(value / 1e3).toString() + "K";
  } else {
    return value.toString();
  }
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
  while (radians < -Math.PI) {
    radians += Math.PI * 2;
  }
  while (radians > Math.PI) {
    radians -= Math.PI * 2;
  }
  return radians;
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

/** Sorting function that finds numbers at the start and end of strings. */
export function smartSort(a: string, b: string): number {
  function getNum(text: string): number | null {
    for (let i = 0; i < text.length; i += 1) {
      let num = Number(text.slice(i));
      if (!isNaN(num)) {
        return num;
      }
    }
    for (let i = text.length; i > 0; i -= 1) {
      let num = Number(text.slice(0, i));
      if (!isNaN(num)) {
        return num;
      }
    }
    return null;
  }
  let aNum = getNum(a);
  let bNum = getNum(b);
  if (aNum != null && bNum != null) {
    return aNum - bNum;
  } else if (a > b) {
    return 1;
  } else if (a < b) {
    return -1;
  }
  return 0;
}
