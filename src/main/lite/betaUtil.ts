// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { BETA_CONFIG } from "../betaConfig";
import { LocalStorageKeys } from "./localStorageKeys";

/** Reads the current beta state. */
function getState(): null | BetaState {
  if (isBeta()) {
    let state = structuredClone(DefaultBetaState);
    let stateRaw = localStorage.getItem(LocalStorageKeys.BETA_STATE);
    if (stateRaw !== null) {
      Object.assign(state, JSON.parse(stateRaw));
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
    localStorage.setItem(LocalStorageKeys.BETA_STATE, JSON.stringify(state));
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
