import { MatchType } from "../../shared/MatchInfo";
import { ZebraMatchData, getTBAMatchKey, getTBAZebraData } from "../../shared/TBAUtil";
import { getEnabledData, getMatchInfo } from "../../shared/log/LogUtil";

export const ZEBRA_LOG_KEY = "Zebra";

/** Loads Zebra data for the current match from TBA. */
export default async function loadZebra(): Promise<void> {
  // Check for API key
  if (!window.preferences?.tbaApiKey) {
    window.sendMainMessage("error", {
      title: "No API key",
      content:
        "Please enter an API key for The Blue Alliance in the AdvantageScope preferences. An API key can be obtained from the Account page on The Blue Alliance website."
    });
    return;
  }

  // Get and verify match info
  let matchInfo = getMatchInfo(window.log);
  if (matchInfo === null) {
    window.sendMainMessage("error", {
      title: "No match info",
      content: "Failed to read event and match info from the log. Zebra MotionWorks data cannot be downloaded."
    });
    return;
  }
  if (matchInfo.matchType === MatchType.Practice) {
    window.sendMainMessage("error", {
      title: "No data for practice match",
      content:
        "This is a practice match. Zebra MotionWorks data is not available for practice matches, please choose a qualification or playoff match instead."
    });
    return;
  }

  // Get match key
  let tbaMatchKey: string;
  try {
    tbaMatchKey = await getTBAMatchKey(matchInfo, window.preferences);
  } catch {
    window.sendMainMessage("error", {
      title: "Zebra download failed",
      content:
        "There was a problem finding the match on The Blue Alliance. Check your internet connection and try again."
    });
    return;
  }

  // Get Zebra data
  let zebraMatchData: ZebraMatchData | null;
  try {
    zebraMatchData = await getTBAZebraData(tbaMatchKey, window.preferences);
  } catch {
    window.sendMainMessage("error", {
      title: "Zebra download failed",
      content:
        "There was a problem downloading Zebra MotionWorks data from The Blue Alliance. Check your internet connection and try again."
    });
    return;
  }
  if (zebraMatchData === null) {
    window.sendMainMessage("error", {
      title: "Zebra download failed",
      content: "Zebra MotionWorks data is not available for this match."
    });
    return;
  }

  // Get match start time
  let matchStart = 0;
  let enabledData = getEnabledData(window.log);
  if (enabledData) {
    for (let i = 0; i < enabledData.timestamps.length; i++) {
      if (enabledData.values[i]) {
        matchStart = enabledData.timestamps[i];
        break;
      }
    }
  }

  // Add to log
  window.log.putString("/" + ZEBRA_LOG_KEY + "/MatchKey", 0, zebraMatchData.key);
  let teamCount = 0;
  Object.entries(zebraMatchData.alliances).forEach(([allianceColor, allianceData]) => {
    allianceData.forEach((teamData) => {
      teamCount += 1;
      const teamLogKey = "/" + ZEBRA_LOG_KEY + "/" + teamData.team_key.toUpperCase();
      for (let i = 0; i < zebraMatchData!.times.length; i++) {
        const timestamp = zebraMatchData!.times[i] + matchStart + 1;
        window.log.putZebraTranslation(teamLogKey, timestamp, teamData.xs[i], teamData.ys[i], allianceColor);
      }
    });
  });
  window.sidebar.refresh();
  window.tabs.refresh();
}
