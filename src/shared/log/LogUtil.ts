import Log from "./Log";
import { LogValueSetBoolean } from "./LogValueSets";

const ENABLED_KEYS = [
  "/DriverStation/Enabled",
  "/AdvantageKit/DriverStation/Enabled",
  "DS:enabled",
  "/FMSInfo/FMSControlData"
];

const JOYSTICK_KEYS = ["/DriverStation/Joystick", "/AdvantageKit/DriverStation/Joystick", "DS:joystick"];

export function getEnabledData(log: Log): LogValueSetBoolean | null {
  let enabledKey = ENABLED_KEYS.find((key) => log.getFieldKeys().includes(key));
  if (!enabledKey) return null;
  let enabledData: LogValueSetBoolean | null = null;
  if (enabledKey == "/FMSInfo/FMSControlData") {
    let tempEnabledData = window.log.getNumber("/FMSInfo/FMSControlData", -Infinity, Infinity);
    if (tempEnabledData) {
      enabledData = {
        timestamps: tempEnabledData.timestamps,
        values: tempEnabledData.values.map((controlWord) => controlWord % 2 == 1)
      };
    }
  } else {
    let tempEnabledData = window.log.getBoolean(enabledKey, -Infinity, Infinity);
    if (tempEnabledData) enabledData = tempEnabledData;
  }
  return enabledData;
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
    let buttonCountData = window.log.getNumber(tablePrefix + "ButtonCount", time, time);
    if (buttonCountData && buttonCountData.timestamps[0] <= time) {
      buttonCount = buttonCountData.values[0];
    }
    let buttonValueData = window.log.getNumber(tablePrefix + "ButtonValues", time, time);
    state.buttons = [];
    if (buttonValueData && buttonValueData.timestamps[0] <= time) {
      for (let i = 0; i < buttonCount; i++) {
        state.buttons.push(((1 << i) & buttonValueData.values[0]) != 0);
      }
    }
    let axisData = window.log.getNumberArray(tablePrefix + "AxisValues", time, time);
    if (axisData && axisData.timestamps[0] <= time) {
      state.axes = axisData.values[0];
    }
    let povData = window.log.getNumberArray(tablePrefix + "POVs", time, time);
    if (povData && povData.timestamps[0] <= time) {
      state.povs = povData.values[0];
    }
  } else {
    let buttonData = window.log.getBooleanArray(tablePrefix + "buttons", time, time);
    if (buttonData && buttonData.timestamps[0] <= time) {
      state.buttons = buttonData.values[0];
    }
    let axisData = window.log.getNumberArray(tablePrefix + "axes", time, time);
    if (axisData && axisData.timestamps[0] <= time) {
      state.axes = axisData.values[0];
    }
    let povData = window.log.getNumberArray(tablePrefix + "axes", time, time);
    if (povData && povData.timestamps[0] <= time) {
      state.povs = povData.values[0];
    }
  }

  return state;
}
