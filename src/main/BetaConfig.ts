import { app, shell } from "electron";
import fs from "fs";
import jsonfile from "jsonfile";
import path from "path";
import { scaleValue } from "../shared/util";
import { APP_VERSION } from "./Constants";

// Constants
const BETA_CONFIG: BetaConfig | null = null as BetaConfig | null;
const BETA_STATE_FILENAME =
  BETA_CONFIG === null ? null : path.join(app.getPath("userData"), "beta-" + BETA_CONFIG.year + ".json");

/** Reads the current beta state. */
function getState(): null | BetaState {
  if (isBeta()) {
    let state = structuredClone(DefaultBetaState);
    if (fs.existsSync(BETA_STATE_FILENAME!)) {
      Object.assign(state, jsonfile.readFileSync(BETA_STATE_FILENAME!));
    }
    return state;
  } else {
    return null;
  }
}

/** Returns whether the current build is a beta. */
export function isBeta(): boolean {
  return BETA_CONFIG !== null;
}

/** Returns whether the beta welcome sequence has been completed. */
export function isBetaWelcomeComplete(): boolean {
  let state = getState();
  if (state === null) return true;
  return state.welcomeComplete;
}

/** Records that the beta welcome was acknowledged by the user. */
export function saveBetaWelcomeComplete(): void {
  let state = getState();
  if (state !== null) {
    state.welcomeComplete = true;
    jsonfile.writeFileSync(BETA_STATE_FILENAME!, state);
  }
}

/** Returns whether the beta is past the expired date. */
export function isBetaExpired(): boolean {
  if (BETA_CONFIG === null) {
    return false;
  } else {
    return new Date() > BETA_CONFIG.expiration;
  }
}

/** Returns whether the user should be prompted to fill out the beta survey. */
export function shouldPromptBetaSurvey(): boolean {
  let state = getState();
  if (state === null) return false;

  if (state.surveyStatus === true) {
    // Survey already complete
    return false;
  } else if (state.surveyStatus === false) {
    // Schedule survey
    let minTime = new Date().getTime() + 14 * 24 * 60 * 60 * 1000; // 2 weeks from now
    let maxTime = BETA_CONFIG!.expiration.getTime();
    if (maxTime > minTime) {
      state.surveyStatus = Math.round(scaleValue(Math.random(), [0, 1], [minTime, maxTime]));
      jsonfile.writeFileSync(BETA_STATE_FILENAME!, state);
    }
    return false;
  } else if (typeof state.surveyStatus === "number") {
    return new Date() > new Date(state.surveyStatus);
  }
  return false;
}

/** The user requested to delay the survey, adjust survey time. */
export function delayBetaSurvey(): void {
  let state = getState();
  if (state === null) return;

  if (state !== null && typeof state.surveyStatus === "number") {
    let minTime = new Date().getTime() + 1 * 24 * 60 * 60 * 1000; // 1 day from now
    let maxTime = new Date().getTime() + 3 * 24 * 60 * 60 * 1000; // 3 days from now
    state.surveyStatus = Math.round(scaleValue(Math.random(), [0, 1], [minTime, maxTime]));
    jsonfile.writeFileSync(BETA_STATE_FILENAME!, state);
  }
}

/** The user requested to open the survey! */
export function openBetaSurvey(): void {
  let state = getState();
  if (state === null) return;
  shell.openExternal(
    BETA_CONFIG!.surveyUrl.replace(
      "__version__",
      encodeURIComponent(APP_VERSION + " (" + process.platform + "-" + process.arch + ")")
    )
  );
  state.surveyStatus = true;
  jsonfile.writeFileSync(BETA_STATE_FILENAME!, state);
}

// Types
type BetaConfig = {
  year: string;
  expiration: Date;
  surveyUrl: string;
};
type BetaState = {
  welcomeComplete: boolean;
  surveyStatus: number | boolean;
};
const DefaultBetaState: BetaState = {
  welcomeComplete: false,
  surveyStatus: false
};
