import Fuse from "fuse.js";
import { Rotation2d, Translation2d } from "../geometry";
import MatchInfo, { MatchType } from "../MatchInfo";
import { convert } from "../units";
import { arraysEqual } from "../util";
import Log from "./Log";
import LogFieldTree from "./LogFieldTree";
import LoggableType from "./LoggableType";
import { LogValueSetBoolean } from "./LogValueSets";

export const TYPE_KEY = ".type";
export const STRUCT_PREFIX = "struct:";
export const PROTO_PREFIX = "proto:";
export const MAX_SEARCH_RESULTS = 128;
export const MERGE_PREFIX = "Log";
export const MERGE_MAX_FILES = 10;
export const SEPARATOR_REGEX = new RegExp(/\/|:/);
export const SEPARATOR_REGEX_PHOENIX = new RegExp(/\/|:|_/);
export const PHOENIX_PREFIX = "Phoenix6";
export const ENABLED_KEYS = withMergedKeys([
  "/DriverStation/Enabled",
  "NT:/AdvantageKit/DriverStation/Enabled",
  "DS:enabled",
  "NT:/FMSInfo/FMSControlData",
  "/DSLog/Status/DSDisabled",
  "RobotEnable" // Phoenix
]);
export const ALLIANCE_KEYS = withMergedKeys([
  "/DriverStation/AllianceStation",
  "NT:/AdvantageKit/DriverStation/AllianceStation",
  "NT:/FMSInfo/IsRedAlliance"
]);
export const DRIVER_STATION_KEYS = withMergedKeys([
  "/DriverStation/AllianceStation",
  "NT:/AdvantageKit/DriverStation/AllianceStation",
  "NT:/FMSInfo/StationNumber"
]);
export const JOYSTICK_KEYS = withMergedKeys([
  "/DriverStation/Joystick",
  "NT:/AdvantageKit/DriverStation/Joystick",
  "DS:joystick"
]);
export const SYSTEM_TIME_KEYS = withMergedKeys([
  "/SystemStats/EpochTimeMicros",
  "NT:/AdvantageKit/SystemStats/EpochTimeMicros",
  "systemTime"
]);
export const AKIT_TIMESTAMP_KEYS = withMergedKeys(["/Timestamp", "NT:/AdvantageKit/Timestamp"]);
export const METADATA_KEYS = withMergedKeys([
  "/Metadata",
  "/RealMetadata",
  "/ReplayMetadata",
  "NT:/Metadata",
  "NT:/AdvantageKit/RealMetadata",
  "NT:/AdvantageKit/ReplayMetadata"
]);
export const EVENT_KEYS = withMergedKeys([
  "/DriverStation/EventName",
  "NT:/AdvantageKit/DriverStation/EventName",
  "NT:/FMSInfo/EventName"
]);
export const MATCH_TYPE_KEYS = withMergedKeys([
  "/DriverStation/MatchType",
  "NT:/AdvantageKit/DriverStation/MatchType",
  "NT:/FMSInfo/MatchType"
]);
export const MATCH_NUMBER_KEYS = withMergedKeys([
  "/DriverStation/MatchNumber",
  "NT:/AdvantageKit/DriverStation/MatchNumber",
  "NT:/FMSInfo/MatchNumber"
]);

/** Returns a set of keys starting with the merged log prefixes. */
function withMergedKeys(keys: string[]): string[] {
  let output: string[] = [];
  keys.forEach((key) => {
    output.push(key);
    for (let i = 0; i < MERGE_MAX_FILES; i++) {
      output.push("/" + MERGE_PREFIX + i.toString() + (key.startsWith("/") ? "" : "/") + key);
    }
  });
  return output;
}

export function getLogValueText(value: any, type: LoggableType): string {
  if (value === null) {
    return "null";
  } else if (type === LoggableType.Raw) {
    let array: Uint8Array = value;
    let textArray: string[] = [];
    array.forEach((byte: number) => {
      textArray.push((byte & 0xff).toString(16).padStart(2, "0"));
    });
    return textArray.join("-");
  } else {
    return JSON.stringify(value);
  }
}

export function getOrDefault(log: Log, key: string, type: LoggableType, timestamp: number, defaultValue: any): any {
  if (log.getType(key) === type) {
    let logData = log.getRange(key, timestamp, timestamp);
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
  if (key.startsWith(PHOENIX_PREFIX)) {
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

export function getEnabledKey(log: Log): string | undefined {
  return ENABLED_KEYS.find((key) => log.getFieldKeys().includes(key));
}

export function getEnabledData(log: Log): LogValueSetBoolean | null {
  let enabledKey = getEnabledKey(log);
  if (!enabledKey) return null;
  let enabledData: LogValueSetBoolean | null = null;
  if (enabledKey.endsWith("FMSControlData")) {
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

export function getIsRedAlliance(log: Log, time: number): boolean {
  let allianceKey = ALLIANCE_KEYS.find((key) => log.getFieldKeys().includes(key));
  if (!allianceKey) return false;

  if (allianceKey.endsWith("AllianceStation")) {
    // Integer value (station) from AdvantageKit
    let tempAllianceData = log.getNumber(allianceKey, time, time);
    if (tempAllianceData && tempAllianceData.values.length > 0) {
      return tempAllianceData.values[tempAllianceData.values.length - 1] <= 3;
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
  let dsKey = DRIVER_STATION_KEYS.find((key) => log.getFieldKeys().includes(key));
  if (!dsKey) return -1;
  let tempDSData = log.getNumber(dsKey, time, time);
  if (tempDSData && tempDSData.values.length > 0) {
    let value = tempDSData.values[tempDSData.values.length - 1];
    if (dsKey.endsWith("StationNumber")) {
      // WPILib, station number
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
    } else {
      // AdvantageKit, alliance station ID
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
  }
  return -1;
}

export interface JoystickState {
  buttons: boolean[];
  axes: number[];
  povs: number[];
}

export function getJoystickState(log: Log, joystickId: number, time: number): JoystickState {
  let state: JoystickState = {
    buttons: [],
    axes: [],
    povs: []
  };
  if (joystickId < 0 || joystickId > 5 || joystickId % 1 !== 0) return state;

  // Find joystick table
  let tablePrefix = "";
  let isAkit = false;
  log.getFieldKeys().forEach((key) => {
    if (tablePrefix !== "") return;
    JOYSTICK_KEYS.forEach((joystickKey) => {
      if (tablePrefix !== "") return;
      if (key.startsWith(joystickKey + joystickId.toString())) {
        tablePrefix = joystickKey + joystickId.toString() + "/";
        isAkit = joystickKey.endsWith("/DriverStation/Joystick");
      }
    });
  });
  if (tablePrefix === "") {
    // No joystick data found
    return state;
  }

  // Read values
  if (isAkit) {
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

      let endRotation = startRotation + convert(angle, "degrees", "radians");
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
  let lines: MechanismLine[] = [];
  states.forEach((state) => {
    lines = lines.concat(state.lines);
  });

  return {
    backgroundColor: states[0].backgroundColor,
    dimensions: [
      Math.max(...states.map((state) => state.dimensions[0])),
      Math.max(...states.map((state) => state.dimensions[1]))
    ],
    lines: lines
  };
}

const SEARCH_FUSE = new Fuse([] as string[], { findAllMatches: true, ignoreLocation: true });

export function searchFields(log: Log, query: string): string[] {
  if (query.length == 0) return [];
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
  let systemTimeKey = SYSTEM_TIME_KEYS.find((key) => log.getFieldKeys().includes(key));
  let eventKey = EVENT_KEYS.find((key) => log.getFieldKeys().includes(key));
  let matchTypeKeys = MATCH_TYPE_KEYS.find((key) => log.getFieldKeys().includes(key));
  let matchNumberKeys = MATCH_NUMBER_KEYS.find((key) => log.getFieldKeys().includes(key));
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
