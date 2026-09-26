// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import MatchInfo, { MatchType } from "../MatchInfo";
import Log from "./Log";
import { findKey } from "./LogKeyUtils";
import { getOrDefault } from "./LogUtil";
import { LogValueSetBoolean } from "./LogValueSets";
import LoggableType from "./LoggableType";

export const ENABLED_KEYS = [
  "/DriverStation/Enabled", // AdvantageKit
  "NT:/AdvantageKit/DriverStation/Enabled", // AdvantageKit
  "DS:controlWord/enabled", // DataLog, post-2027
  "DS:enabled", // DataLog, pre-2027
  "DS:/Dscomm/Control/Robot/ControlData/ControlWord", // FIRST DS
  "/DSLog/Status/DSDisabled", // NI DS
  "RobotEnable", // Phoenix
  "NT:/DriverStation/ControlWord/enabled", // NT, post-2027
  "NT:/FMSInfo/FMSControlData", // NT, pre-2027
  "RUNNING" // Roadrunner
];
export const AUTONOMOUS_KEYS = [
  "/DriverStation/RobotMode", // AdvantageKit, post-2027
  "NT:/AdvantageKit/DriverStation/RobotMode", // AdvantageKit, post-2027
  "/DriverStation/Autonomous", // AdvantageKit, pre-2027
  "NT:/AdvantageKit/DriverStation/Autonomous", // AdvantageKit, pre-2027
  "DS:controlWord/robotMode", // DataLog, post-2027
  "DS:autonomous", // DataLog, pre-2027
  "DS:/Dscomm/Control/Robot/ControlData/ControlWord", // FIRST DS
  "/DSLog/Status/DSTeleop", // NI DS
  "RobotMode", // Phoenix
  "NT:/DriverStation/ControlWord/robotMode", // NT, post-2027
  "NT:/FMSInfo/FMSControlData" // NT, pre-2027
];
export const UTILITY_KEYS = [
  "/DriverStation/RobotMode", // AdvantageKit, post-2027
  "NT:/AdvantageKit/DriverStation/RobotMode", // AdvantageKit, post-2027
  "/DriverStation/Test", // AdvantageKit, pre-2027
  "NT:/AdvantageKit/DriverStation/Test", // AdvantageKit, pre-2027
  "DS:controlWord/robotMode", // DataLog, post-2027
  "DS:test", // DataLog, pre-2027
  "DS:/Dscomm/Control/Robot/ControlData/ControlWord", // FIRST DS
  "RobotMode", // Phoenix
  "NT:/DriverStation/ControlWord/robotMode", // NT, post-2027
  "NT:/FMSInfo/FMSControlData" // NT, pre-2027
];
export const ALLIANCE_KEYS = [
  "/DriverStation/AllianceStation", // AdvantageKit
  "NT:/AdvantageKit/DriverStation/AllianceStation", // AdvantageKit
  "DS:/Dscomm/Control/Robot/ControlData/ControlWord", // FIRST DS
  "NT:/DriverStation/IsRedAlliance", // NT, post-2027
  "NT:/FMSInfo/IsRedAlliance", // NT, pre-2027
  "AllianceStation" // Phoenix
];
export const DRIVER_STATION_KEYS = [
  "/DriverStation/AllianceStation", // AdvantageKit
  "NT:/AdvantageKit/DriverStation/AllianceStation", // AdvantageKit
  "DS:/Dscomm/Control/Robot/ControlData/ControlWord", // FIRST DS
  "NT:/DriverStation/StationNumber", // NT, post-2027
  "NT:/FMSInfo/StationNumber", // NT, pre-2027
  "AllianceStation" // Phoenix
];
export const SYSTEM_TIME_KEYS = [
  "/SystemStats/EpochTimeMicros", // AdvantageKit
  "NT:/AdvantageKit/SystemStats/EpochTimeMicros", // AdvantageKit
  "systemTime" // DataLog
];
export const AKIT_TIMESTAMP_KEYS = ["/Timestamp", "NT:/AdvantageKit/Timestamp"];
export const METADATA_KEYS = [
  "/Metadata",
  "/RealMetadata",
  "/ReplayMetadata",
  "NT:/Metadata",
  "NT:/AdvantageKit/RealMetadata",
  "NT:/AdvantageKit/ReplayMetadata"
];
export const EVENT_KEYS = [
  "/DriverStation/EventName", // AdvantageKit
  "NT:/AdvantageKit/DriverStation/EventName", // AdvantageKit
  "DS:/Dscomm/Control/Robot/MatchInfo/EventName", // FIRST DS
  "NT:/DriverStation/EventName", // NT, post-2027
  "NT:/FMSInfo/EventName", // NT, pre-2027
  "NT:/Netcomm/Control/MatchInfo/EventName" // Systemcore
];
export const MATCH_TYPE_KEYS = [
  "/DriverStation/MatchType", // AdvantageKit
  "NT:/AdvantageKit/DriverStation/MatchType", // AdvantageKit
  "DS:/Dscomm/Control/Robot/MatchInfo/MatchType", // FIRST DS
  "NT:/DriverStation/MatchType", // NT, post-2027
  "NT:/FMSInfo/MatchType", // NT, pre-2027
  "NT:/Netcomm/Control/MatchInfo/MatchType" // Systemcore
];
export const MATCH_NUMBER_KEYS = [
  "/DriverStation/MatchNumber", // AdvantageKit
  "NT:/AdvantageKit/DriverStation/MatchNumber", // AdvantageKit
  "DS:/Dscomm/Control/Robot/MatchInfo/MatchNumber", // FIRST DS
  "NT:/DriverStation/MatchNumber", // NT, post-2027
  "NT:/FMSInfo/MatchNumber", // NT, pre-2027
  "NT:/Netcomm/Control/MatchInfo/MatchNumber" // Systemcore
];

/** Finds the first matching key that indicates enabled state. */
export function getEnabledKey(log: Log): string | undefined {
  return findKey(log, ENABLED_KEYS);
}

/** Retrieves the boolean values representing the robot's enabled state over time. */
export function getEnabledData(log: Log): LogValueSetBoolean | null {
  let enabledKey = getEnabledKey(log);
  if (!enabledKey) return null;
  let enabledData: LogValueSetBoolean | null = null;
  if (enabledKey.endsWith("FMSControlData") || enabledKey.endsWith("ControlWord")) {
    let tempEnabledData = log.getNumber(enabledKey, -Infinity, Infinity);
    if (tempEnabledData && tempEnabledData.timestamps.length > 0) {
      enabledData = {
        timestamps: tempEnabledData.timestamps,
        values: tempEnabledData.values.map((controlWord) => controlWord % 2 === 1)
      };
    }
  } else {
    let tempEnabledData = log.getBoolean(enabledKey, -Infinity, Infinity);
    if (!tempEnabledData || tempEnabledData.timestamps.length === 0) return null;
    enabledData = tempEnabledData;
    if (enabledKey.endsWith("DSDisabled")) {
      enabledData = {
        timestamps: enabledData.timestamps,
        values: enabledData.values.map((value) => !value)
      };
    }
  }
  return enabledData;
}

/** Finds the first matching key that indicates autonomous state. */
export function getAutonomousKey(log: Log): string | undefined {
  return findKey(log, AUTONOMOUS_KEYS);
}

/** Retrieves the boolean values representing the robot's autonomous state over time. */
export function getAutonomousData(log: Log): LogValueSetBoolean | null {
  let autonomousKey = getAutonomousKey(log);
  if (!autonomousKey) return null;
  let autonomousData: LogValueSetBoolean | null = null;
  if (autonomousKey.endsWith("FMSControlData")) {
    let tempAutoData = log.getNumber(autonomousKey, -Infinity, Infinity);
    if (tempAutoData && tempAutoData.timestamps.length > 0) {
      autonomousData = {
        timestamps: tempAutoData.timestamps,
        values: tempAutoData.values.map((controlWord) => ((controlWord >> 1) & 1) !== 0)
      };
    }
  } else if (autonomousKey.endsWith("ControlWord")) {
    let tempAutoData = log.getNumber(autonomousKey, -Infinity, Infinity);
    if (tempAutoData && tempAutoData.timestamps.length > 0) {
      autonomousData = {
        timestamps: tempAutoData.timestamps,
        values: tempAutoData.values.map((controlWord) => ((controlWord >> 1) & 3) === 1)
      };
    }
  } else if (autonomousKey.toLowerCase().endsWith("robotmode")) {
    let tempAutoData = log.getString(autonomousKey, -Infinity, Infinity);
    if (tempAutoData && tempAutoData.timestamps.length > 0) {
      autonomousData = {
        timestamps: tempAutoData.timestamps,
        values: tempAutoData.values.map((text) => text.toLowerCase() === "autonomous")
      };
    }
  } else {
    let tempAutoData = log.getBoolean(autonomousKey, -Infinity, Infinity);
    if (!tempAutoData || tempAutoData.timestamps.length === 0) return null;
    autonomousData = tempAutoData;
    if (autonomousKey.endsWith("DSTeleop")) {
      autonomousData = {
        timestamps: autonomousData.timestamps,
        values: autonomousData.values.map((value) => !value)
      };
    }
  }
  return autonomousData;
}

/** Finds the first matching key that indicates utility state. */
export function getUtilityKey(log: Log): string | undefined {
  return findKey(log, UTILITY_KEYS);
}

/** Retrieves the boolean values representing the robot's utility state over time. */
export function getUtilityData(log: Log): LogValueSetBoolean | null {
  let utilityKey = getUtilityKey(log);
  if (!utilityKey) return null;
  let utilityData: LogValueSetBoolean | null = null;
  if (utilityKey.endsWith("FMSControlData")) {
    let tempUtilityData = log.getNumber(utilityKey, -Infinity, Infinity);
    if (tempUtilityData && tempUtilityData.timestamps.length > 0) {
      utilityData = {
        timestamps: tempUtilityData.timestamps,
        values: tempUtilityData.values.map((controlWord) => ((controlWord >> 2) & 1) !== 0)
      };
    }
  } else if (utilityKey.endsWith("ControlWord")) {
    let tempUtilityData = log.getNumber(utilityKey, -Infinity, Infinity);
    if (tempUtilityData && tempUtilityData.timestamps.length > 0) {
      utilityData = {
        timestamps: tempUtilityData.timestamps,
        values: tempUtilityData.values.map((controlWord) => ((controlWord >> 1) & 3) === 3)
      };
    }
  } else if (utilityKey.toLowerCase().endsWith("robotmode")) {
    let tempUtilityData = log.getString(utilityKey, -Infinity, Infinity);
    if (tempUtilityData && tempUtilityData.timestamps.length > 0) {
      utilityData = {
        timestamps: tempUtilityData.timestamps,
        values: tempUtilityData.values.map((text) => text.toLowerCase() === "utility" || text.toLowerCase() === "test")
      };
    }
  } else {
    let tempUtilityData = log.getBoolean(utilityKey, -Infinity, Infinity);
    if (!tempUtilityData || tempUtilityData.timestamps.length === 0) return null;
    utilityData = tempUtilityData;
  }
  return utilityData;
}

/** Computes contiguous time ranges of robot state (e.g. auto, teleop). */
export function getRobotStateRanges(
  log: Log
): { start: number; end?: number; mode: "disabled" | "auto" | "teleop" | "utility" }[] {
  let enabledData = getEnabledData(log);
  let autoData = getAutonomousData(log);
  let utilityData = getUtilityData(log);
  if (enabledData === null) return [];
  if (getAutonomousKey(log) !== undefined && autoData === null) return [];
  if (getUtilityKey(log) !== undefined && utilityData === null) return [];
  if (autoData === null) {
    autoData = {
      timestamps: [],
      values: []
    };
  }
  if (utilityData === null) {
    utilityData = {
      timestamps: [],
      values: []
    };
  }

  // Combine enabled, auto, and utility data
  let allTimestamps = [...enabledData.timestamps, ...autoData.timestamps, ...utilityData.timestamps];
  allTimestamps = [...new Set(allTimestamps)];
  allTimestamps.sort((a, b) => Number(a) - Number(b));
  let combined: { timestamp: number; enabled: boolean; auto: boolean; utility: boolean }[] = [];
  allTimestamps.forEach((timestamp) => {
    let enabled = enabledData!.values.findLast((_, index) => enabledData!.timestamps[index] <= timestamp);
    let auto = autoData!.values.findLast((_, index) => autoData!.timestamps[index] <= timestamp);
    let utility = utilityData!.values.findLast((_, index) => utilityData!.timestamps[index] <= timestamp);
    if (enabled === undefined) enabled = false;
    if (auto === undefined) auto = false;
    if (utility === undefined) utility = false;
    combined.push({
      timestamp: timestamp,
      enabled: enabled,
      auto: auto,
      utility: utility
    });
  });

  // Get ranges
  let ranges: { start: number; end?: number; mode: "disabled" | "auto" | "teleop" | "utility" }[] = [];
  combined.forEach((sample, index) => {
    let mode: "disabled" | "auto" | "teleop" | "utility" = "disabled";
    if (sample.enabled) {
      if (sample.auto) {
        mode = "auto";
      } else if (sample.utility) {
        mode = "utility";
      } else {
        mode = "teleop";
      }
    }

    let end: number | undefined = undefined;
    if (index < combined.length - 1) {
      end = combined[index + 1].timestamp;
    }

    if (ranges.length > 0 && ranges[ranges.length - 1].mode === mode) {
      ranges[ranges.length - 1].end = end;
    } else {
      ranges.push({
        start: sample.timestamp,
        end: end,
        mode: mode
      });
    }
  });
  return ranges;
}

/** Determines if the robot is on the red alliance at a given time. */
export function getIsRedAlliance(log: Log, time: number): boolean {
  let allianceKey = findKey(log, ALLIANCE_KEYS);
  if (!allianceKey) return false;

  if (allianceKey.endsWith("ControlWord")) {
    // Integer value (station) from control word
    let tempAllianceData = log.getNumber(allianceKey, time, time);
    if (tempAllianceData && tempAllianceData.values.length > 0) {
      let value = tempAllianceData.values[tempAllianceData.values.length - 1];
      return ((value >> 8) & 15) <= 2;
    }
  } else if (allianceKey.endsWith("DriverStation/AllianceStation")) {
    // Integer value (station) from AdvantageKit
    let tempAllianceData = log.getNumber(allianceKey, time, time);
    if (tempAllianceData && tempAllianceData.values.length > 0) {
      return (
        tempAllianceData.values[tempAllianceData.values.length - 1] <= 3 &&
        tempAllianceData.values[tempAllianceData.values.length - 1] > 0
      );
    }
  } else if (allianceKey.endsWith("AllianceStation")) {
    // String value (station) from Phoenix
    let tempAllianceData = log.getString(allianceKey, time, time);
    if (tempAllianceData && tempAllianceData.values.length > 0) {
      return tempAllianceData.values[tempAllianceData.values.length - 1].startsWith("Red");
    }
  } else {
    // Boolean value from NT
    let tempAllianceData = log.getBoolean(allianceKey, time, time);
    if (tempAllianceData && tempAllianceData.values.length > 0) {
      return tempAllianceData.values[tempAllianceData.values.length - 1];
    }
  }

  return false;
}

/** Determines the driver station number at a given time. */
export function getDriverStation(log: Log, time: number): number {
  let dsKey = findKey(log, DRIVER_STATION_KEYS);
  if (!dsKey) return -1;
  if (dsKey.endsWith("ControlWord")) {
    // Integer value (station) from control word
    let tempDSData = log.getNumber(dsKey, time, time);
    if (tempDSData && tempDSData.values.length > 0) {
      let value = tempDSData.values[tempDSData.values.length - 1];
      value = (value >> 8) & 15;
      switch (value) {
        case 0:
          return 3; // Red 1
        case 1:
          return 4; // Red 2
        case 2:
          return 5; // Red 3
        case 3:
          return 0; // Blue 1
        case 4:
          return 1; // Blue 2
        case 5:
          return 2; // Blue 3
      }
    }
  } else if (dsKey.endsWith("DriverStation/AllianceStation")) {
    // AdvantageKit, alliance station ID
    let tempDSData = log.getNumber(dsKey, time, time);
    if (tempDSData && tempDSData.values.length > 0) {
      let value = tempDSData.values[tempDSData.values.length - 1];
      switch (value) {
        case 1:
          return 3; // Red 1
        case 2:
          return 4; // Red 2
        case 3:
          return 5; // Red 3
        case 4:
          return 0; // Blue 1
        case 5:
          return 1; // Blue 2
        case 6:
          return 2; // Blue 3
      }
    }
  } else if (dsKey.endsWith("StationNumber")) {
    // WPILib, station number
    let tempDSData = log.getNumber(dsKey, time, time);
    if (tempDSData && tempDSData.values.length > 0) {
      let value = tempDSData.values[tempDSData.values.length - 1];
      if (getIsRedAlliance(log, time)) {
        switch (value) {
          case 1:
            return 3;
          case 2:
            return 4;
          case 3:
            return 5;
        }
      } else {
        switch (value) {
          case 1:
            return 0;
          case 2:
            return 1;
          case 3:
            return 2;
        }
      }
    }
  } else if (dsKey.endsWith("AllianceStation")) {
    // Phoenix, string value
    let tempDSData = log.getString(dsKey, time, time);
    if (tempDSData && tempDSData.values.length > 0) {
      let value = tempDSData.values[tempDSData.values.length - 1];
      switch (value) {
        case "Blue 1":
          return 0;
        case "Blue 2":
          return 1;
        case "Blue 3":
          return 2;
        case "Red 1":
          return 3;
        case "Red 2":
          return 4;
        case "Red 3":
          return 5;
      }
    }
  }
  return -1;
}

/** Extracts metadata information about the match (e.g. year, event, match number). */
export function getMatchInfo(log: Log): MatchInfo | null {
  // Get first enable time
  let enabledData = getEnabledData(log);
  let enabledTime: null | number = null;
  enabledData?.values.forEach((enabled, index) => {
    if (enabledTime === null && enabled) {
      enabledTime = enabledData!.timestamps[index];
    }
  });
  if (enabledTime === null) {
    return null;
  }

  // Get match info keys
  let systemTimeKey = findKey(log, SYSTEM_TIME_KEYS);
  let eventKey = findKey(log, EVENT_KEYS);
  let matchTypeKeys = findKey(log, MATCH_TYPE_KEYS);
  let matchNumberKeys = findKey(log, MATCH_NUMBER_KEYS);
  if (!eventKey || !matchTypeKeys || !matchNumberKeys) return null;

  // Read match info
  let info: MatchInfo = {
    year: 2022, // Default to 2022 for AdvantageKit logs that didn't include system time
    event: "",
    matchType: MatchType.Qualification,
    matchNumber: 1
  };
  if (systemTimeKey) {
    let epochMicros = getOrDefault(log, systemTimeKey, LoggableType.Number, enabledTime, info.year);
    info.year = new Date(epochMicros / 1000).getUTCFullYear();
    // Reset to current year if the logged year is clearly wrong
    if (info.year < 2022) info.year = new Date().getUTCFullYear();
  }
  info.event = getOrDefault(log, eventKey, LoggableType.String, enabledTime, info.event);
  let matchType = getOrDefault(log, matchTypeKeys, LoggableType.Number, enabledTime, 0);
  if ([1, 2, 3].includes(matchType)) {
    info.matchType = matchType;
  } else {
    // Not a match
    return null;
  }
  info.matchNumber = getOrDefault(log, matchNumberKeys, LoggableType.Number, enabledTime, info.matchNumber);
  return info;
}
