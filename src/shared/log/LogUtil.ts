// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Fuse from "fuse.js";
import MatchInfo, { MatchType } from "../MatchInfo";
import { Rotation2d, Translation2d } from "../geometry";
import { Units } from "../units";
import { arraysEqual, jsonCopy } from "../util";
import Log from "./Log";
import LogFieldTree from "./LogFieldTree";
import { LogValueSetBoolean } from "./LogValueSets";
import LoggableType from "./LoggableType";

export const ARRAY_TEXT_SIZE_LIMIT = 500;
export const TYPE_KEY = ".type";
export const STRUCT_PREFIX = "struct:";
export const PROTO_PREFIX = "proto:";
export const PHOTON_PREFIX = "photonstruct:";
export const MAX_SEARCH_RESULTS = 128;
export const MERGE_PREFIX = "Log";
export const MERGE_PREFIX_REGEX = new RegExp(/^\/?Log\d+/);
export const SEPARATOR_REGEX = new RegExp(/\/|:/);
export const SEPARATOR_REGEX_PHOENIX = new RegExp(/\/|:|_/);
export const PHOENIX_PREFIX = "Phoenix6";
export const ENABLED_KEYS = [
  "/DriverStation/Enabled", // AdvantageKit
  "NT:/AdvantageKit/DriverStation/Enabled", // AdvantageKit
  "DS:controlWord/enabled", // DataLog, post-2027
  "DS:enabled", // DataLog, pre-2027
  "DS:/Dscomm/Control/ControlData/ControlWord", // FIRST DS
  "/DSLog/Status/DSDisabled", // NI DS
  "RobotEnable", // Phoenix
  "NT:/FMSInfo/ControlWord/enabled", // NT, post-2027
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
  "DS:/Dscomm/Control/ControlData/ControlWord", // FIRST DS
  "/DSLog/Status/DSTeleop", // NI DS
  "RobotMode", // Phoenix
  "NT:/FMSInfo/ControlWord/robotMode", // NT, post-2027
  "NT:/FMSInfo/FMSControlData" // NT, pre-2027
];
export const UTILITY_KEYS = [
  "/DriverStation/RobotMode", // AdvantageKit, post-2027
  "NT:/AdvantageKit/DriverStation/RobotMode", // AdvantageKit, post-2027
  "/DriverStation/Test", // AdvantageKit, pre-2027
  "NT:/AdvantageKit/DriverStation/Test", // AdvantageKit, pre-2027
  "DS:controlWord/robotMode", // DataLog, post-2027
  "DS:test", // DataLog, pre-2027
  "DS:/Dscomm/Control/ControlData/ControlWord", // FIRST DS
  "RobotMode", // Phoenix
  "NT:/FMSInfo/ControlWord/robotMode", // NT, post-2027
  "NT:/FMSInfo/FMSControlData" // NT, pre-2027
];
export const ALLIANCE_KEYS = [
  "/DriverStation/AllianceStation", // AdvantageKit
  "NT:/AdvantageKit/DriverStation/AllianceStation", // AdvantageKit
  "DS:/Dscomm/Control/ControlData/ControlWord", // FIRST DS
  "NT:/FMSInfo/IsRedAlliance", // NT
  "AllianceStation" // Phoenix
];
export const DRIVER_STATION_KEYS = [
  "/DriverStation/AllianceStation", // AdvantageKit
  "NT:/AdvantageKit/DriverStation/AllianceStation", // AdvantageKit
  "DS:/Dscomm/Control/ControlData/ControlWord", // FIRST DS
  "NT:/FMSInfo/StationNumber", // NT
  "AllianceStation" // Phoenix
];
export const JOYSTICK_KEYS = [
  "/DriverStation/Joystick", // AdvantageKit
  "NT:/AdvantageKit/DriverStation/Joystick", // AdvantageKit
  "DS:joystick" // DataLog
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
  "DS:/Dscomm/Control/MatchInfo/EventName", // FIRST DS
  "NT:/FMSInfo/EventName", // NT
  "NT:/Netcomm/Control/MatchInfo/EventName" // Systemcore
];
export const MATCH_TYPE_KEYS = [
  "/DriverStation/MatchType", // AdvantageKit
  "NT:/AdvantageKit/DriverStation/MatchType", // AdvantageKit
  "DS:/Dscomm/Control/MatchInfo/MatchType", // FIRST DS
  "NT:/FMSInfo/MatchType", // NT
  "NT:/Netcomm/Control/MatchInfo/MatchType" // Systemcore
];
export const MATCH_NUMBER_KEYS = [
  "/DriverStation/MatchNumber", // AdvantageKit
  "NT:/AdvantageKit/DriverStation/MatchNumber", // AdvantageKit
  "DS:/Dscomm/Control/MatchInfo/MatchNumber", // FIRST DS
  "NT:/FMSInfo/MatchNumber", // NT
  "NT:/Netcomm/Control/MatchInfo/MatchNumber" // Systemcore
];

/** Returns the version of the key without the merge prefix. */
export function removeMergePrefix(key: string): string {
  let match = key.match(MERGE_PREFIX_REGEX);
  if (match === null) {
    return key;
  } else {
    return key.slice(match[0].length);
  }
}

export function findKey(log: Log, search: string[]): string | undefined {
  let fieldKeys = log.getFieldKeys();
  let bestKey: string | undefined = undefined;
  let bestKeySearchIndex = Infinity;
  for (let i = 0; i < fieldKeys.length; i++) {
    let unmerged = removeMergePrefix(fieldKeys[i]);
    let searchIndex: number;
    if ((searchIndex = search.indexOf(unmerged)) !== -1) {
      if (searchIndex < bestKeySearchIndex) bestKey = fieldKeys[i];
    } else if (unmerged.startsWith("/") && (searchIndex = search.indexOf(unmerged.slice(1))) !== -1) {
      if (searchIndex < bestKeySearchIndex) bestKey = fieldKeys[i];
    }
  }
  return bestKey;
}

/** Adds a prefix to a log key. */
export function applyKeyPrefix(prefix: string, key: string): string {
  if (prefix.length === 0) {
    return key;
  } else if (key.startsWith("/")) {
    return prefix + key;
  } else {
    return prefix + "/" + key;
  }
}

export function getLogValueText(value: any, type: LoggableType, localized: boolean = false): string {
  if (value === null) {
    return "null";
  } else if (type === LoggableType.Raw) {
    let array: Uint8Array = value;
    if (array.length === 0) return "(empty)";
    let textArray: string[] = [];
    array.slice(0, ARRAY_TEXT_SIZE_LIMIT).forEach((byte: number) => {
      textArray.push((byte & 0xff).toString(16).padStart(2, "0"));
    });
    if (array.length > ARRAY_TEXT_SIZE_LIMIT) textArray.push("...");
    return textArray.join("-");
  } else if (Array.isArray(value)) {
    let limitedArray = value.slice(0, ARRAY_TEXT_SIZE_LIMIT);
    if (limitedArray.length < value.length) {
      limitedArray.push("...");
    }
    return (
      "[" +
      limitedArray
        .map((x) => {
          if (localized && typeof x === "number") {
            return x.toLocaleString(undefined, { useGrouping: false });
          }
          return JSON.stringify(x);
        })
        .join(", ") +
      "]"
    );
  } else if (localized && typeof value === "number") {
    return value.toLocaleString(undefined, { useGrouping: false });
  } else {
    return JSON.stringify(value);
  }
}

export function getOrDefault(
  log: Log,
  key: string,
  type: LoggableType,
  timestamp: number,
  defaultValue: any,
  uuid?: string
): any {
  if (log.getType(key) === type) {
    let logData = log.getRange(key, timestamp, timestamp, uuid);
    if (logData !== undefined && logData.values.length > 0 && logData.timestamps[0] <= timestamp) {
      return logData.values[0];
    }
  }
  return defaultValue;
}

export function logValuesEqual(type: LoggableType, a: any, b: any): boolean {
  switch (type) {
    case LoggableType.Boolean:
    case LoggableType.Number:
    case LoggableType.String:
      return a === b;
    case LoggableType.BooleanArray:
    case LoggableType.NumberArray:
    case LoggableType.StringArray:
      return arraysEqual(a, b);
    case LoggableType.Raw:
      return arraysEqual(Array.from(a as Uint8Array), Array.from(b as Uint8Array));
    default:
      return false;
  }
}

export function splitLogKey(key: string): string[] {
  let unmergedKey = removeMergePrefix(key);
  if (unmergedKey.startsWith(PHOENIX_PREFIX) || unmergedKey.startsWith("/" + PHOENIX_PREFIX)) {
    return key.split(SEPARATOR_REGEX_PHOENIX);
  } else {
    return key.split(SEPARATOR_REGEX);
  }
}

export function filterFieldByPrefixes(
  fields: string[],
  prefixes: string,
  alwaysIncludeSchemas = false,
  ntOnly = false
) {
  let filteredFields: Set<string> = new Set();
  prefixes.split(",").forEach((prefix) => {
    let prefixSeries = splitLogKey(prefix).filter((item) => item.length > 0);
    if (ntOnly) prefixSeries.splice(0, 0, "NT");
    fields.forEach((field) => {
      let fieldSeries = splitLogKey(field).filter((item) => item.length > 0);
      if (fieldSeries.length < prefixSeries.length) return;
      if (
        prefixSeries.every((prefix, index) => fieldSeries[index].toLowerCase() === prefix.toLowerCase()) ||
        (alwaysIncludeSchemas && field.includes("/.schema/"))
      ) {
        filteredFields.add(field);
      }
    });
  });
  return [...filteredFields];
}

export function getURCLKeys(log: Log): string[] {
  return log.getFieldKeys().filter((key) => {
    let wpilibType = log.getWpilibType(key);
    return wpilibType !== null && wpilibType.startsWith("URCL");
  });
}

export function getEnabledKey(log: Log): string | undefined {
  return findKey(log, ENABLED_KEYS);
}

export function getEnabledData(log: Log): LogValueSetBoolean | null {
  let enabledKey = getEnabledKey(log);
  if (!enabledKey) return null;
  let enabledData: LogValueSetBoolean | null = null;
  if (enabledKey.endsWith("FMSControlData") || enabledKey.endsWith("ControlWord")) {
    let tempEnabledData = log.getNumber(enabledKey, -Infinity, Infinity);
    if (tempEnabledData) {
      enabledData = {
        timestamps: tempEnabledData.timestamps,
        values: tempEnabledData.values.map((controlWord) => controlWord % 2 === 1)
      };
    }
  } else {
    let tempEnabledData = log.getBoolean(enabledKey, -Infinity, Infinity);
    if (!tempEnabledData) return null;
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

export function getAutonomousKey(log: Log): string | undefined {
  return findKey(log, AUTONOMOUS_KEYS);
}

export function getAutonomousData(log: Log): LogValueSetBoolean | null {
  let autonomousKey = getAutonomousKey(log);
  if (!autonomousKey) return null;
  let autonomousData: LogValueSetBoolean | null = null;
  if (autonomousKey.endsWith("FMSControlData")) {
    let tempAutoData = log.getNumber(autonomousKey, -Infinity, Infinity);
    if (tempAutoData) {
      autonomousData = {
        timestamps: tempAutoData.timestamps,
        values: tempAutoData.values.map((controlWord) => ((controlWord >> 1) & 1) !== 0)
      };
    }
  } else if (autonomousKey.endsWith("ControlWord")) {
    let tempAutoData = log.getNumber(autonomousKey, -Infinity, Infinity);
    if (tempAutoData) {
      autonomousData = {
        timestamps: tempAutoData.timestamps,
        values: tempAutoData.values.map((controlWord) => ((controlWord >> 1) & 3) === 1)
      };
    }
  } else if (autonomousKey.toLowerCase().endsWith("robotmode")) {
    let tempAutoData = log.getString(autonomousKey, -Infinity, Infinity);
    if (tempAutoData) {
      autonomousData = {
        timestamps: tempAutoData.timestamps,
        values: tempAutoData.values.map((text) => text.toLowerCase() === "autonomous")
      };
    }
  } else {
    let tempAutoData = log.getBoolean(autonomousKey, -Infinity, Infinity);
    if (!tempAutoData) return null;
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

export function getUtilityKey(log: Log): string | undefined {
  return findKey(log, UTILITY_KEYS);
}

export function getUtilityData(log: Log): LogValueSetBoolean | null {
  let utilityKey = getUtilityKey(log);
  if (!utilityKey) return null;
  let utilityData: LogValueSetBoolean | null = null;
  if (utilityKey.endsWith("FMSControlData")) {
    let tempUtilityData = log.getNumber(utilityKey, -Infinity, Infinity);
    if (tempUtilityData) {
      utilityData = {
        timestamps: tempUtilityData.timestamps,
        values: tempUtilityData.values.map((controlWord) => ((controlWord >> 2) & 1) !== 0)
      };
    }
  } else if (utilityKey.endsWith("ControlWord")) {
    let tempUtilityData = log.getNumber(utilityKey, -Infinity, Infinity);
    if (tempUtilityData) {
      utilityData = {
        timestamps: tempUtilityData.timestamps,
        values: tempUtilityData.values.map((controlWord) => ((controlWord >> 1) & 3) === 3)
      };
    }
  } else if (utilityKey.toLowerCase().endsWith("robotmode")) {
    let tempUtilityData = log.getString(utilityKey, -Infinity, Infinity);
    if (tempUtilityData) {
      utilityData = {
        timestamps: tempUtilityData.timestamps,
        values: tempUtilityData.values.map((text) => text.toLowerCase() === "utility" || text.toLowerCase() === "test")
      };
    }
  } else {
    let tempUtilityData = log.getBoolean(utilityKey, -Infinity, Infinity);
    if (!tempUtilityData) return null;
    utilityData = tempUtilityData;
  }
  return utilityData;
}

export function getRobotStateRanges(
  log: Log
): { start: number; end?: number; mode: "disabled" | "auto" | "teleop" | "utility" }[] {
  let enabledData = getEnabledData(log);
  let autoData = getAutonomousData(log);
  let utilityData = getUtilityData(log);
  if (enabledData === null) return [];
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

export interface JoystickState {
  buttons: boolean[];
  axes: number[];
  povs: number[];
}

export const BlankJoystickState: JoystickState = {
  buttons: [],
  axes: [],
  povs: []
};

export function getJoystickState(log: Log, joystickId: number, time: number): JoystickState {
  let state = jsonCopy(BlankJoystickState);
  if (joystickId < 0 || joystickId > 5 || joystickId % 1 !== 0) return state;

  // Find joystick table
  let tablePrefix = "";
  let isSystemcore = false;
  let isAkit = false;
  log.getFieldKeys().forEach((key) => {
    if (tablePrefix !== "") return;
    JOYSTICK_KEYS.forEach((joystickKey) => {
      if (tablePrefix !== "") return;
      if (removeMergePrefix(key).startsWith(joystickKey + joystickId.toString())) {
        isSystemcore = joystickKey.endsWith("/Netcomm/Control/ControlData/Joysticks/");
        isAkit = joystickKey.endsWith("/DriverStation/Joystick");
        if (isSystemcore) {
          let joystickCount = getOrDefault(log, joystickKey + "length", LoggableType.Number, time, 0);
          if (joystickId >= joystickCount) return;
        }
        tablePrefix = key.slice(0, key.indexOf(joystickKey)) + joystickKey + joystickId.toString() + "/";
      }
    });
  });
  if (tablePrefix === "") {
    // No joystick data found
    return state;
  }

  // Read values
  if (isSystemcore) {
    let buttonCount = 0;
    let buttonCountData = log.getNumber(tablePrefix + "AvailableButtons", time, time);
    if (buttonCountData && buttonCountData.timestamps[0] <= time) {
      buttonCount = Math.floor(Math.log2(buttonCountData.values[0] + 1));
    }
    let buttonValueData = log.getNumber(tablePrefix + "Buttons", time, time);
    state.buttons = [];
    if (buttonValueData && buttonValueData.timestamps[0] <= time) {
      for (let i = 0; i < buttonCount; i++) {
        state.buttons.push(((1 << i) & buttonValueData.values[0]) !== 0);
      }
    }
    let axisData = log.getNumberArray(tablePrefix + "Axes", time, time);
    if (axisData && axisData.timestamps[0] <= time) {
      state.axes = axisData.values[0].map((x) => x / (1 << 15));
    }
    let povCount = 0;
    let povCountData = log.getNumber(tablePrefix + "POVCount", time, time);
    if (povCountData && povCountData.timestamps[0] <= time) {
      povCount = povCountData.values[0];
    }
    let povData = log.getNumber(tablePrefix + "POVs", time, time);
    state.povs = [];
    if (povData && povData.timestamps[0] <= time) {
      for (let i = 0; i < povCount; i++) {
        let value = (povData.values[0] >> (4 * i)) & 15;
        let upValue = (value & 1) !== 0;
        let rightValue = (value & 2) !== 0;
        let downValue = (value & 4) !== 0;
        let leftValue = (value & 8) !== 0;
        if (upValue && rightValue) {
          state.povs.push(45);
        } else if (rightValue && downValue) {
          state.povs.push(135);
        } else if (downValue && leftValue) {
          state.povs.push(225);
        } else if (leftValue && upValue) {
          state.povs.push(315);
        } else if (upValue) {
          state.povs.push(0);
        } else if (rightValue) {
          state.povs.push(90);
        } else if (downValue) {
          state.povs.push(180);
        } else if (leftValue) {
          state.povs.push(270);
        } else {
          state.povs.push(-1);
        }
      }
    }
  } else if (isAkit) {
    let buttonCount = 0;
    let buttonCountData = log.getNumber(tablePrefix + "ButtonCount", time, time);
    if (buttonCountData && buttonCountData.timestamps[0] <= time) {
      buttonCount = buttonCountData.values[0];
    }
    let buttonValueData = log.getNumber(tablePrefix + "ButtonValues", time, time);
    state.buttons = [];
    if (buttonValueData && buttonValueData.timestamps[0] <= time) {
      for (let i = 0; i < buttonCount; i++) {
        state.buttons.push(((1 << i) & buttonValueData.values[0]) !== 0);
      }
    }
    let axisData = log.getNumberArray(tablePrefix + "AxisValues", time, time);
    if (axisData && axisData.timestamps[0] <= time) {
      state.axes = axisData.values[0];
    }
    let povData = log.getNumberArray(tablePrefix + "POVs", time, time);
    if (povData && povData.timestamps[0] <= time) {
      state.povs = povData.values[0];
    }
  } else {
    let buttonData = log.getBooleanArray(tablePrefix + "buttons", time, time);
    if (buttonData && buttonData.timestamps[0] <= time) {
      state.buttons = buttonData.values[0];
    }
    let axisData = log.getNumberArray(tablePrefix + "axes", time, time);
    if (axisData && axisData.timestamps[0] <= time) {
      state.axes = axisData.values[0];
    }
    let povData = log.getNumberArray(tablePrefix + "povs", time, time);
    if (povData && povData.timestamps[0] <= time) {
      state.povs = povData.values[0];
    }
  }

  return state;
}

export type MechanismState = {
  backgroundColor: string;
  dimensions: [number, number];
  lines: MechanismLine[];
};

export type MechanismLine = {
  start: Translation2d;
  end: Translation2d;
  color: string;
  weight: number;
};

export function getMechanismState(log: Log, key: string, time: number): MechanismState | null {
  // Get general config
  let backgroundColor = getOrDefault(log, key + "/backgroundColor", LoggableType.String, time, null);
  let dimensions = getOrDefault(log, key + "/dims", LoggableType.NumberArray, time, null);
  if (backgroundColor === null || dimensions === null) {
    return null;
  }

  // Get all lines
  let lines: MechanismLine[] = [];
  try {
    // Add a line and children recursively
    let addLine = (lineTree: LogFieldTree, startTranslation: Translation2d, startRotation: Rotation2d) => {
      let angle = getOrDefault(
        log,
        key! + "/" + lineTree.children["angle"].fullKey,
        LoggableType.Number,
        time,
        0
      ) as number;
      let length = getOrDefault(
        log,
        key! + "/" + lineTree.children["length"].fullKey,
        LoggableType.Number,
        time,
        0
      ) as number;
      let color = getOrDefault(
        log,
        key! + "/" + lineTree.children["color"].fullKey,
        LoggableType.String,
        time,
        0
      ) as string;
      let weight = getOrDefault(
        log,
        key! + "/" + lineTree.children["weight"].fullKey,
        LoggableType.Number,
        time,
        0
      ) as number;

      let endRotation = startRotation + Units.convert(angle, "degrees", "radians");
      let endTranslation: Translation2d = [
        startTranslation[0] + Math.cos(endRotation) * length,
        startTranslation[1] + Math.sin(endRotation) * length
      ];
      lines.push({
        start: startTranslation,
        end: endTranslation,
        color: color,
        weight: weight
      });
      for (let [childKey, childTree] of Object.entries(lineTree.children)) {
        if ([".type", "angle", "color", "length", "weight"].includes(childKey)) continue;
        addLine(childTree, endTranslation, endRotation);
      }
    };

    // Find all roots and add children
    for (let [mechanismChildKey, mechanismChildTree] of Object.entries(log.getFieldTree(true, key + "/"))) {
      if (
        mechanismChildKey.startsWith(".") ||
        mechanismChildKey === "backgroundColor" ||
        mechanismChildKey === "dims"
      ) {
        continue;
      }
      let translation: Translation2d = [
        getOrDefault(log, key + "/" + mechanismChildTree.children["x"].fullKey!, LoggableType.Number, time, 0),
        getOrDefault(log, key + "/" + mechanismChildTree.children["y"].fullKey!, LoggableType.Number, time, 0)
      ];
      for (let [rootChildKey, rootChildTree] of Object.entries(mechanismChildTree.children)) {
        if (rootChildKey === "x" || rootChildKey === "y") continue;
        addLine(rootChildTree, translation, 0.0);
      }
    }
  } catch {
    console.error("Failed to parse mechanism data");
  }

  // Return result
  return {
    backgroundColor: backgroundColor,
    dimensions: dimensions,
    lines: lines
  };
}

export function mergeMechanismStates(states: MechanismState[]): MechanismState {
  let newWidth = Math.max(...states.map((state) => state.dimensions[0]));
  let newHeight = Math.max(...states.map((state) => state.dimensions[1]));

  let lines: MechanismLine[] = [];
  states.forEach((state) => {
    let xOffset = (newWidth - state.dimensions[0]) / 2;
    state.lines.forEach((line) => {
      let newLine = jsonCopy(line);
      newLine.start[0] += xOffset;
      newLine.end[0] += xOffset;
      lines.push(newLine);
    });
  });

  return {
    backgroundColor: states[0].backgroundColor,
    dimensions: [newWidth, newHeight],
    lines: lines
  };
}

const SEARCH_FUSE = new Fuse([] as string[], { findAllMatches: true, ignoreLocation: true });

export function searchFields(log: Log, query: string): string[] {
  if (query.length === 0) return [];
  SEARCH_FUSE.setCollection(log.getFieldKeys());
  return SEARCH_FUSE.search(query)
    .slice(0, MAX_SEARCH_RESULTS)
    .map((field) => field.item);
}

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

/**
 * Iterates over the values of a log field efficiently for monotonic time lookups.
 * Useful when sampling multiple subfields synchronously using a parent timeline.
 */
export class LogFieldIterator<T> {
  private idx = 0;
  constructor(private data: { timestamps: number[]; values: T[] } | undefined) {}

  getAtTime(time: number): T | undefined {
    if (!this.data) return undefined;
    while (this.idx + 1 < this.data.timestamps.length && this.data.timestamps[this.idx + 1] <= time) {
      this.idx++;
    }
    if (this.idx < this.data.timestamps.length && this.data.timestamps[this.idx] <= time) {
      return this.data.values[this.idx];
    }
    return undefined;
  }
}
