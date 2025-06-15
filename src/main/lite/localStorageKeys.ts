import { BETA_CONFIG } from "../betaConfig";

export namespace LocalStorageKeys {
  const PREFIX = "AdvantageScopeLite/";
  export const STATE = PREFIX + "state";
  export const PREFS = PREFIX + "prefs";
  export const TYPE_MEMORY = PREFIX + "type-memory";
  export const RECENT_UNITS = PREFIX + "recent-units";
  export const BETA_STATE = PREFIX + "beta-" + (BETA_CONFIG === null ? "NA" : BETA_CONFIG.year);
}
