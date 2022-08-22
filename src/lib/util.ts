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
