/** A target for live tuning values, connected to a live data source. */
export default interface LiveDataTuner {
  /** Returns whether a particular key support tuning. */
  isTunable(key: string): boolean;

  /** Sets the tuned value of a key. */
  publish(key: string, value: number | boolean): void;

  /** Unpublished a tuned key. */
  unpublish(key: string): void;
}
