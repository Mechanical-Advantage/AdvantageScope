/** Checks whether two arrays are equal. */
export function arraysEqual(a: any[], b: any[]): boolean {
  return (
    a.length == b.length &&
    a.every((value, index) => {
      return value === b[index];
    })
  );
}

/** Returns the HTML encoded version of a string. */
export function htmlEncode(text: string) {
  return text.replace(/[\u00A0-\u9999<>\&]/g, (i) => {
    return "&#" + i.charCodeAt(0) + ";";
  });
}

/** Adjust the brightness of a HEX color.*/
export function shiftColor(color: string, shift: number) {
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

/** Converts a value between two ranges. */
export function scaleValue(value: number, oldRange: [number, number], newRange: [number, number]): number {
  return ((value - oldRange[0]) / (oldRange[1] - oldRange[0])) * (newRange[1] - newRange[0]) + newRange[0];
}
