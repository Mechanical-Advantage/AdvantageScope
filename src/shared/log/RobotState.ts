// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Log from "./Log";
import { findKey } from "./LogKeyUtils";
import { LogValueSetBoolean } from "./LogValueSets";

export const ENABLED_KEYS = [
  "/DriverStation/Enabled", // AdvantageKit
  "NT:/AdvantageKit/DriverStation/Enabled", // AdvantageKit
  "DS:controlWord/enabled", // DataLog/Phoenix, post-2027
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
  "DS:controlWord/robotMode", // DataLog/Phoenix, post-2027
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
  "DS:controlWord/robotMode", // DataLog/Phoenix, post-2027
  "DS:test", // DataLog, pre-2027
  "DS:/Dscomm/Control/Robot/ControlData/ControlWord", // FIRST DS
  "RobotMode", // Phoenix
  "NT:/DriverStation/ControlWord/robotMode", // NT, post-2027
  "NT:/FMSInfo/FMSControlData" // NT, pre-2027
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
export const PROGRAM_START_TIME_KEYS = ["NT:/Robot/ProgramStartTime", "/Robot/ProgramStartTime"];

/** Finds the first matching key that indicates enabled state. */
export function getEnabledKey(log: Log): string | undefined {
  return findKey(log, ENABLED_KEYS);
}

/** Finds the first matching key that indicates program start time. */
export function getProgramStartTimeKey(log: Log): string | undefined {
  return findKey(log, PROGRAM_START_TIME_KEYS);
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
