import { TabState } from "./HubState";

/** A controller for a single tab. */
export default interface TabController {
  /** Returns the current state. */
  saveState(): TabState;

  /** Restores to the provided state. */
  restoreState(state: TabState): void;

  /** Refresh based on new log data. */
  refresh(): void;

  /** Called every animation frame if the tab is visible. */
  periodic(): void;
}
