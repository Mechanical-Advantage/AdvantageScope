export default interface TabRenderer {
  /** Returns the current state. */
  saveState(): unknown;

  /** Restores to the provided state. */
  restoreState(state: unknown): void;

  /** Get the desired window aspect ratio for satellites. */
  getAspectRatio(): number | null;

  /** Called once per frame. */
  render(command: unknown): void;
}

export class NoopRenderer implements TabRenderer {
  saveState(): unknown {
    return null;
  }

  restoreState(): void {}

  getAspectRatio(): number | null {
    return null;
  }

  render(): void {}
}
