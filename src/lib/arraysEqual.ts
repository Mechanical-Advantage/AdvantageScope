/** Checks whether two arrays are equal. */
export default function arraysEqual(a: any[], b: any[]): boolean {
  return (
    a.length == b.length &&
    a.every((value, index) => {
      return value === b[index];
    })
  );
}
