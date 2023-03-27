import { Rotation2d, Translation2d } from "../geometry";
import { convert } from "../units";
import Log from "./Log";
import LogFieldTree from "./LogFieldTree";
import LoggableType from "./LoggableType";
import { LogValueSetBoolean } from "./LogValueSets";

export const ENABLED_KEYS = [
  "/DriverStation/Enabled",
  "/AdvantageKit/DriverStation/Enabled",
  "DS:enabled",
  "/FMSInfo/FMSControlData",
  "NT:/FMSInfo/FMSControlData",
  "/DSLog/Status/DSDisabled"
];
export const ALLIANCE_KEYS = [
  "/DriverStation/AllianceStation",
  "/AdvantageKit/DriverStation/AllianceStation",
  "/FMSInfo/IsRedAlliance",
  "NT:/FMSInfo/IsRedAlliance"
];
export const JOYSTICK_KEYS = ["/DriverStation/Joystick", "/AdvantageKit/DriverStation/Joystick", "DS:joystick"];
export const TYPE_KEY = ".type";
export const MECHANISM_KEY = "Mechanism2d";

export function getLogValueText(value: any, type: LoggableType): string {
  if (value === null) {
    return "null";
  } else if (type == LoggableType.Raw) {
    let array: Uint8Array = value;
    let textArray: string[] = [];
    array.forEach((byte: number) => {
      textArray.push("0x" + (byte & 0xff).toString(16).padStart(2, "0"));
    });
    return "[" + textArray.toString() + "]";
  } else {
    return JSON.stringify(value);
  }
}

export function getOrDefault(log: Log, key: string, type: LoggableType, timestamp: number, defaultValue: any): any {
  if (log.getType(key) === type) {
    let logData = log.getRange(key, timestamp, timestamp);
    if (logData !== undefined && logData.values.length > 0) {
      return logData.values[0];
    }
  }
  return defaultValue;
}

export function getEnabledData(log: Log): LogValueSetBoolean | null {
  let enabledKey = ENABLED_KEYS.find((key) => log.getFieldKeys().includes(key));
  if (!enabledKey) return null;
  let enabledData: LogValueSetBoolean | null = null;
  if (enabledKey.endsWith("FMSControlData")) {
    let tempEnabledData = log.getNumber(enabledKey, -Infinity, Infinity);
    if (tempEnabledData) {
      enabledData = {
        timestamps: tempEnabledData.timestamps,
        values: tempEnabledData.values.map((controlWord) => controlWord % 2 == 1)
      };
    }
  } else {
    let tempEnabledData = log.getBoolean(enabledKey, -Infinity, Infinity);
    if (!tempEnabledData) return null;
    enabledData = tempEnabledData;
    if (enabledKey == "/DSLog/Status/DSDisabled") {
      enabledData = {
        timestamps: enabledData.timestamps,
        values: enabledData.values.map((value) => !value)
      };
    }
  }
  return enabledData;
}

export function getIsRedAlliance(log: Log): boolean {
  let allianceKey = ALLIANCE_KEYS.find((key) => log.getFieldKeys().includes(key));
  if (!allianceKey) return false;

  if (allianceKey.endsWith("AllianceStation")) {
    // Integer value (station) from AdvantageKit
    let tempAllianceData = log.getNumber(allianceKey, Infinity, Infinity);
    if (tempAllianceData && tempAllianceData.values.length > 0) {
      return tempAllianceData.values[tempAllianceData.values.length - 1] <= 2;
    }
  } else {
    // Boolean value from NT
    let tempAllianceData = log.getBoolean(allianceKey, Infinity, Infinity);
    if (tempAllianceData && tempAllianceData.values.length > 0) {
      return tempAllianceData.values[tempAllianceData.values.length - 1];
    }
  }

  return false;
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
  if (joystickId < 0 || joystickId > 5 || joystickId % 1 != 0) return state;

  // Find joystick table
  let tablePrefix = "";
  let isAkit = false;
  if (log.getFieldKeys().find((key) => key.startsWith(JOYSTICK_KEYS[0] + joystickId.toString())) != undefined) {
    tablePrefix = JOYSTICK_KEYS[0] + joystickId.toString() + "/";
    isAkit = true;
  } else if (log.getFieldKeys().find((key) => key.startsWith(JOYSTICK_KEYS[1] + joystickId.toString())) != undefined) {
    tablePrefix = JOYSTICK_KEYS[1] + joystickId.toString() + "/";
    isAkit = true;
  } else if (log.getFieldKeys().find((key) => key.startsWith(JOYSTICK_KEYS[2] + joystickId.toString())) != undefined) {
    tablePrefix = JOYSTICK_KEYS[2] + joystickId.toString() + "/";
    isAkit = false;
  } else {
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
        state.buttons.push(((1 << i) & buttonValueData.values[0]) != 0);
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

export function getFullKeyIfMechanism(field: LogFieldTree): string | null {
  if (
    TYPE_KEY in field.children &&
    field.children[TYPE_KEY].fullKey !== null &&
    getOrDefault(window.log, field.children[TYPE_KEY].fullKey, LoggableType.String, Infinity, "") === MECHANISM_KEY
  ) {
    let key = field.children[TYPE_KEY].fullKey;
    return key.substring(0, key.length - TYPE_KEY.length - 1);
  } else {
    return null;
  }
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
    for (let [mechanismChildKey, mechanismChildTree] of Object.entries(log.getFieldTree(false, key + "/"))) {
      if (mechanismChildKey.startsWith(".") || mechanismChildKey == "backgroundColor" || mechanismChildKey == "dims") {
        continue;
      }
      let translation: Translation2d = [
        getOrDefault(log, key + "/" + mechanismChildTree.children["x"].fullKey!, LoggableType.Number, time, 0),
        getOrDefault(log, key + "/" + mechanismChildTree.children["y"].fullKey!, LoggableType.Number, time, 0)
      ];
      for (let [rootChildKey, rootChildTree] of Object.entries(mechanismChildTree.children)) {
        if (rootChildKey == "x" || rootChildKey == "y") continue;
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
