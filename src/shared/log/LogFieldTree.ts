/** A layer of a recursive log tree. */
export default interface LogFieldTree {
  fullKey: string | null;
  children: { [id: string]: LogFieldTree };
}
