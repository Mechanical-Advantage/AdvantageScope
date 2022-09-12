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

/** Converts a value between two ranges. */
export function scaleValue(value: number, oldRange: [number, number], newRange: [number, number]): number {
  return ((value - oldRange[0]) / (oldRange[1] - oldRange[0])) * (newRange[1] - newRange[0]) + newRange[0];
}

/** Generates a random string of characters. */
export function createUUID(): string {
  let outString: string = "";
  let inOptions: string = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 64; i++) {
    outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
  }

  return outString;
}
