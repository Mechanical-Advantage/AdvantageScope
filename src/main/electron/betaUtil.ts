// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { app, shell } from "electron";
import fs from "fs";
import jsonfile from "jsonfile";
import path from "path";
import { BETA_CONFIG } from "../betaConfig";

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

/** Returns whether the release is an alpha. */
export function isAlpha(): boolean {
  return isBeta() && BETA_CONFIG!.isAlpha;
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
    if (BETA_CONFIG!.surveyUrl === null) {
      // No survey to schedule
      return false;
    }
    let surveyTime = Math.round(new Date().getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks from now
    if (surveyTime < BETA_CONFIG!.expiration.getTime()) {
      state.surveyStatus = surveyTime;
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
    state.surveyStatus = Math.round(new Date().getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
    jsonfile.writeFileSync(BETA_STATE_FILENAME!, state);
  }
}

/** The user requested to open the survey! */
export function openBetaSurvey(): void {
  let state = getState();
  if (state === null) return;
  if (BETA_CONFIG!.surveyUrl === null) return;
  shell.openExternal(BETA_CONFIG!.surveyUrl);
  state.surveyStatus = true;
  jsonfile.writeFileSync(BETA_STATE_FILENAME!, state);
}

// Types
type BetaState = {
  welcomeComplete: boolean;
  surveyStatus: number | boolean;
};
const DefaultBetaState: BetaState = {
  welcomeComplete: false,
  surveyStatus: false
};
