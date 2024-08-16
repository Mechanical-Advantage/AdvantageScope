export default interface TabRenderer {
  /** Returns the current state. */
  saveState(): unknown;

  /** Restores to the provided state. */
  restoreState(state: unknown): void;

  /** Called once per frame. */
  render(command: unknown): void;
}
