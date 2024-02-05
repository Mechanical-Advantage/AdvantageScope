/** A visualizer contained in a satellite window or timeline visualizer. */
export default interface Visualizer {
  /**
   * Renders a single frame.
   * @returns The target aspect ratio (if it exists)
   */
  render(command: any): number | null;

  /** Returns the current state. */
  saveState(): any;

  /** Restores to the provided state. */
  restoreState(state: any): void;
}
