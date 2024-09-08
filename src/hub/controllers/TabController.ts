import { createUUID } from "../../shared/util";

/** A controller for a single tab. Updates user controls and produces commands to be used by renderers. */
export default interface TabController {
  UUID: string;

  /** Returns the current state. */
  saveState(): unknown;

  /** Restores to the provided state. */
  restoreState(state: unknown): void;

  /** Refresh based on new log data. */
  refresh(): void;

  /** Notify that the set of assets was updated. */
  newAssets(): void;

  /**
   * Returns the list of fields currently being displayed. This is
   * used to selectively request fields from live sources, and all
   * keys matching the provided prefixes will be made available.
   **/
  getActiveFields(): string[];

  /** Returns whether to display the timeline. */
  showTimeline(): boolean;

  /** Returns data required by renderers. */
  getCommand(): unknown;
}

export class NoopController implements TabController {
  UUID = createUUID();

  saveState(): unknown {
    return null;
  }

  restoreState(): void {}

  refresh(): void {}

  newAssets(): void {}

  getActiveFields(): string[] {
    return [];
  }

  showTimeline(): boolean {
    return false;
  }

  getCommand(): unknown {
    return null;
  }
}
