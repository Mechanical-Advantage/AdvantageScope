import { TabState } from "../shared/HubState";

/** A controller for a single tab. */
export default interface TabController {
  /** Returns the current state. */
  saveState(): TabState;

  /** Restores to the provided state. */
  restoreState(state: TabState): void;

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

  /** Called every animation frame if the tab is visible. */
  periodic(): void;
}
