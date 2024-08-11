export default interface TabRenderer {
  /** Returns the current state. */
  saveState(): unknown;

  /** Restores to the provided state. */
  restoreState(state: unknown): void;

  /** Sets a new command to use for rendering. */
  setCommand(command: any): void;

  /** Called once per frame. */
  render(): void;
}
