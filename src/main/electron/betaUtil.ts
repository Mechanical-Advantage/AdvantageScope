// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { app } from "electron";
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

// Types
type BetaState = {
  welcomeComplete: boolean;
};
const DefaultBetaState: BetaState = {
  welcomeComplete: false
};
