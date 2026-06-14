// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import MatchInfo, { MatchType, PlayoffType, getElimMatchString } from "./MatchInfo";
import Preferences from "./Preferences";

export async function getTBAMatchKey(matchInfo: MatchInfo, preferences: Preferences): Promise<string> {
  // Get TBA API key
  if (!preferences.tbaApiKey) {
    throw new Error();
  }

  // Get TBA event key (the robot only has the FIRST event key)
  let tbaEventKey, tbaMatchKey: string;
  {
    let response = await fetch("https://www.thebluealliance.com/api/v3/events/" + matchInfo.year.toString(), {
      method: "GET",
      signal: AbortSignal.timeout(3000),
      headers: [["X-TBA-Auth-Key", preferences.tbaApiKey]]
    });
    if (!response.ok) {
      throw new Error();
    }
    let allEvents = (await response.json()) as any[];
    let event = allEvents.find(
      (event) => event["first_event_code"] && event["first_event_code"].toLowerCase() === matchInfo.event.toLowerCase()
    );
    if (!event) throw new Error();
    tbaEventKey = event["key"];
  }

  // Get match key
  if (matchInfo.matchType === MatchType.Elimination) {
    // Get playoff type for event
    let response = await fetch("https://www.thebluealliance.com/api/v3/event/" + tbaEventKey, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
      headers: [["X-TBA-Auth-Key", preferences.tbaApiKey]]
    });
    if (!response.ok) {
      throw new Error();
    }
    let eventData = await response.json();
    let playoffType = eventData["playoff_type"] as PlayoffType;
    tbaMatchKey = tbaEventKey + "_" + getElimMatchString(playoffType, matchInfo.matchNumber);
  } else {
    tbaMatchKey = tbaEventKey + "_qm" + matchInfo.matchNumber.toString();
  }
  return tbaMatchKey;
}

export async function getTBAMatchInfo(matchKey: string, preferences: Preferences): Promise<any> {
  let response = await fetch("https://www.thebluealliance.com/api/v3/match/" + matchKey, {
    method: "GET",
    signal: AbortSignal.timeout(3000),
    headers: [["X-TBA-Auth-Key", preferences.tbaApiKey]]
  });
  if (!response.ok) {
    throw new Error();
  }
  return response.json();
}
