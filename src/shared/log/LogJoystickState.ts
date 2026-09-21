// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { jsonCopy } from "../util";
import Log from "./Log";
import { removeMergePrefix } from "./LogKeyUtils";

/** Common log keys used to find joystick data. */
export const JOYSTICK_KEYS = [
  "/DriverStation/Joystick", // AdvantageKit
  "NT:/AdvantageKit/DriverStation/Joystick", // AdvantageKit
  "DS:joystick", // DataLog
  "DS:/Dscomm/Control/Robot/ControlData/Joysticks/" // FIRST DS
];

/** Represents the state of a joystick at a point in time. */
export type JoystickState = {
  mapping: "ni" | "sdl";
  buttons: { id: number; state: boolean }[];
  axes: { id: number; value: number }[];
  povs: { id: number; angle: number }[];
  touchpads: { x: number; y: number; down: boolean }[][];
};

/** A blank joystick state used as a fallback. */
export const BlankJoystickState: JoystickState = {
  mapping: "sdl",
  buttons: [],
  axes: [],
  povs: [],
  touchpads: []
};

/** Extracts the state of a specific joystick at a given time. */
export function getJoystickState(log: Log, joystickId: number, time: number): JoystickState {
  let state = jsonCopy(BlankJoystickState);
  if (joystickId < 0 || joystickId > 5 || joystickId % 1 !== 0) return state;

  // Find joystick table
  let tablePrefix = "";
  let sourceType: "akit" | "datalog" | "ds" | null = null;
  let mapping: "ni" | "sdl" | null = null;
  log.getFieldKeys().forEach((key) => {
    if (tablePrefix !== "") return;
    JOYSTICK_KEYS.forEach((joystickKey) => {
      if (tablePrefix !== "") return;
      if (removeMergePrefix(key).startsWith(joystickKey + joystickId.toString())) {
        tablePrefix = key.slice(0, key.indexOf(joystickKey)) + joystickKey + joystickId.toString() + "/";
        if (joystickKey.endsWith("/DriverStation/Joystick")) {
          sourceType = "akit";
          if (log.getField(tablePrefix + "ButtonsAvailable") === null) {
            mapping = "ni";
          } else {
            mapping = "sdl";
          }
        } else if (joystickKey.endsWith("DS:joystick")) {
          sourceType = "datalog";
          if (log.getField(tablePrefix.slice(0, -"joystick0/".length) + "opMode") === null) {
            mapping = "ni";
          } else {
            mapping = "sdl";
          }
        } else if (joystickKey.endsWith("DS:/Dscomm/Control/Robot/ControlData/Joysticks/")) {
          sourceType = "ds";
          mapping = "sdl";
        }
      }
    });
  });
  if (tablePrefix === "" || sourceType === null || mapping === null) {
    // No joystick data found
    return state;
  }

  // Read values
  state.mapping = mapping;
  switch (sourceType) {
    case "akit":
      switch (mapping) {
        case "sdl":
          {
            let buttonsAvailable: bigint = 0n;
            let buttonValues: bigint = 0n;
            let buttonsAvailableData = log.getNumber(tablePrefix + "ButtonsAvailable", time, time);
            if (buttonsAvailableData && buttonsAvailableData.timestamps[0] <= time) {
              buttonsAvailable = BigInt(buttonsAvailableData.values[0]);
            }
            let buttonValuesData = log.getNumber(tablePrefix + "ButtonValues", time, time);
            if (buttonValuesData && buttonValuesData.timestamps[0] <= time) {
              buttonValues = BigInt(buttonValuesData.values[0]);
            }
            for (let i = 0; i < 64; i++) {
              if (((buttonsAvailable >> BigInt(i)) & 1n) > 0n) {
                state.buttons.push({ id: i, state: ((buttonValues >> BigInt(i)) & 1n) > 0n });
              }
            }

            let axesAvailable = 0;
            let axisValues: number[] = [];
            let axesAvailableData = log.getNumber(tablePrefix + "AxesAvailable", time, time);
            if (axesAvailableData && axesAvailableData.timestamps[0] <= time) {
              axesAvailable = axesAvailableData.values[0];
            }
            let axisValuesData = log.getNumberArray(tablePrefix + "AxisValues", time, time);
            if (axisValuesData && axisValuesData.timestamps[0] <= time) {
              axisValues = axisValuesData.values[0];
            }
            for (let i = 0; i < Math.min(axisValues.length, 16); i++) {
              if (((axesAvailable >> i) & 1) > 0) {
                state.axes.push({ id: i, value: axisValues[i] });
              }
            }

            let povsAvailable = 0;
            let povValues: number[] = [];
            let povsAvailableData = log.getNumber(tablePrefix + "POVsAvailable", time, time);
            if (povsAvailableData && povsAvailableData.timestamps[0] <= time) {
              povsAvailable = povsAvailableData.values[0];
            }
            let povValuesData = log.getNumberArray(tablePrefix + "POVValues", time, time);
            if (povValuesData && povValuesData.timestamps[0] <= time) {
              povValues = povValuesData.values[0];
            }
            for (let i = 0; i < Math.min(povValues.length, 8); i++) {
              if (((povsAvailable >> i) & 1) > 0) {
                state.povs.push({ id: i, angle: decodePovBitfield(povValues[i]) });
              }
            }

            let touchpadCount = 0;
            let touchpadCountData = log.getNumber(tablePrefix + "TouchpadCount", time, time);
            if (touchpadCountData && touchpadCountData.timestamps[0] <= time) {
              touchpadCount = touchpadCountData.values[0];
            }
            for (let t = 0; t < Math.min(touchpadCount, 2); t++) {
              let fingerCount = 0;
              let fingerCountData = log.getNumber(tablePrefix + `Touchpad/${t}/FingerCount`, time, time);
              if (fingerCountData && fingerCountData.timestamps[0] <= time) {
                fingerCount = fingerCountData.values[0];
              }
              let touchpad: { x: number; y: number; down: boolean }[] = [];
              for (let f = 0; f < Math.min(fingerCount, 2); f++) {
                let down = false;
                let x = 0;
                let y = 0;

                let downData = log.getBoolean(tablePrefix + `Touchpad/${t}/Finger/${f}/Down`, time, time);
                if (downData && downData.timestamps[0] <= time) {
                  down = downData.values[0];
                }
                let xData = log.getNumber(tablePrefix + `Touchpad/${t}/Finger/${f}/X`, time, time);
                if (xData && xData.timestamps[0] <= time) {
                  x = xData.values[0];
                }
                let yData = log.getNumber(tablePrefix + `Touchpad/${t}/Finger/${f}/Y`, time, time);
                if (yData && yData.timestamps[0] <= time) {
                  y = yData.values[0];
                }
                touchpad.push({ x: x, y: y, down: down });
              }
              state.touchpads.push(touchpad);
            }
          }
          break;

        case "ni":
          {
            let buttonCount = 0;
            let buttonCountData = log.getNumber(tablePrefix + "ButtonCount", time, time);
            if (buttonCountData && buttonCountData.timestamps[0] <= time) {
              buttonCount = buttonCountData.values[0];
            }
            let buttonValueData = log.getNumber(tablePrefix + "ButtonValues", time, time);
            state.buttons = [];
            if (buttonValueData && buttonValueData.timestamps[0] <= time) {
              for (let i = 0; i < buttonCount; i++) {
                state.buttons.push({ id: i + 1, state: ((1 << i) & buttonValueData.values[0]) !== 0 });
              }
            }
            let axisData = log.getNumberArray(tablePrefix + "AxisValues", time, time);
            if (axisData && axisData.timestamps[0] <= time) {
              state.axes = axisData.values[0].map((value, index) => {
                return { id: index, value: value };
              });
            }
            let povData = log.getNumberArray(tablePrefix + "POVs", time, time);
            if (povData && povData.timestamps[0] <= time) {
              state.povs = povData.values[0].map((angle, index) => {
                return { id: index, angle: angle };
              });
            }
          }
          break;
      }
      break;

    case "datalog":
      {
        let buttonData = log.getBooleanArray(tablePrefix + "buttons", time, time);
        if (buttonData && buttonData.timestamps[0] <= time) {
          state.buttons = buttonData.values[0].map((state, index) => {
            return { id: index + (mapping === "ni" ? 1 : 0), state: state };
          });
        }
        let axisData = log.getNumberArray(tablePrefix + "axes", time, time);
        if (axisData && axisData.timestamps[0] <= time) {
          state.axes = axisData.values[0].map((value, index) => {
            return { id: index, value: value };
          });
        }
        let povData = log.getNumberArray(tablePrefix + "povs", time, time);
        if (povData && povData.timestamps[0] <= time) {
          state.povs = povData.values[0].map((value, index) => {
            return { id: index, angle: mapping === "sdl" ? decodePovBitfield(value) : value };
          });
        }
      }
      break;

    case "ds":
      {
        let buttonsAvailable: bigint = 0n;
        let buttonValues: bigint = 0n;
        let buttonsAvailableHighData = log.getNumber(tablePrefix + "AvailableButtons/high", time, time);
        let buttonsAvailableLowData = log.getNumber(tablePrefix + "AvailableButtons/low", time, time);
        if (
          buttonsAvailableHighData &&
          buttonsAvailableHighData.timestamps[0] <= time &&
          buttonsAvailableLowData &&
          buttonsAvailableLowData.timestamps[0] <= time
        ) {
          let high = BigInt(buttonsAvailableHighData.values[0]) & 0xffffffffn;
          let low = BigInt(buttonsAvailableLowData.values[0]) & 0xffffffffn;
          buttonsAvailable = (high << 32n) | low;
        }
        let buttonValuesHighData = log.getNumber(tablePrefix + "Buttons/high", time, time);
        let buttonValuesLowData = log.getNumber(tablePrefix + "Buttons/low", time, time);
        if (
          buttonValuesHighData &&
          buttonValuesHighData.timestamps[0] <= time &&
          buttonValuesLowData &&
          buttonValuesLowData.timestamps[0] <= time
        ) {
          let high = BigInt(buttonValuesHighData.values[0]) & 0xffffffffn;
          let low = BigInt(buttonValuesLowData.values[0]) & 0xffffffffn;
          buttonValues = (high << 32n) | low;
        }
        for (let i = 0; i < 64; i++) {
          if (((buttonsAvailable >> BigInt(i)) & 1n) > 0n) {
            state.buttons.push({ id: i, state: ((buttonValues >> BigInt(i)) & 1n) > 0n });
          }
        }

        let axesAvailable = 0;
        let axisValues: number[] = [];
        let axesAvailableData = log.getNumber(tablePrefix + "AvailableAxes", time, time);
        if (axesAvailableData && axesAvailableData.timestamps[0] <= time) {
          axesAvailable = axesAvailableData.values[0];
        }
        let axisValuesData = log.getNumberArray(tablePrefix + "Axes", time, time);
        if (axisValuesData && axisValuesData.timestamps[0] <= time) {
          axisValues = axisValuesData.values[0];
        }
        for (let i = 0; i < Math.min(axisValues.length, 16); i++) {
          if (((axesAvailable >> i) & 1) > 0) {
            state.axes.push({ id: i, value: axisValues[i] / 32768 });
          }
        }

        let povCount = 0;
        let povCountData = log.getNumber(tablePrefix + "POVCount", time, time);
        if (povCountData && povCountData.timestamps[0] <= time) {
          povCount = povCountData.values[0];
        }
        let povs = 0;
        let povData = log.getNumber(tablePrefix + "POVs", time, time);
        if (povData && povData.timestamps[0] <= time) {
          povs = povData.values[0];
        }
        for (let i = 0; i < Math.min(povCount, 8); i++) {
          let value = (povs >> (4 * i)) & 15;
          state.povs.push({ id: i, angle: decodePovBitfield(value) });
        }

        let touchpadCount = 0;
        let touchpadCountData = log.getNumber(tablePrefix + "Touchpads/length", time, time);
        if (touchpadCountData && touchpadCountData.timestamps[0] <= time) {
          touchpadCount = touchpadCountData.values[0];
        }
        for (let t = 0; t < Math.min(touchpadCount, 2); t++) {
          let fingerCount = 0;
          let fingerCountData = log.getNumber(tablePrefix + `Touchpads/${t}/Fingers/length`, time, time);
          if (fingerCountData && fingerCountData.timestamps[0] <= time) {
            fingerCount = fingerCountData.values[0];
          }
          let touchpad: { x: number; y: number; down: boolean }[] = [];
          for (let f = 0; f < Math.min(fingerCount, 2); f++) {
            let down = false;
            let x = 0;
            let y = 0;

            let downData = log.getBoolean(tablePrefix + `Touchpads/${t}/Fingers/${f}/Down`, time, time);
            if (downData && downData.timestamps[0] <= time) {
              down = downData.values[0];
            }
            let xData = log.getNumber(tablePrefix + `Touchpads/${t}/Fingers/${f}/X`, time, time);
            if (xData && xData.timestamps[0] <= time) {
              x = xData.values[0];
            }
            let yData = log.getNumber(tablePrefix + `Touchpads/${t}/Fingers/${f}/Y`, time, time);
            if (yData && yData.timestamps[0] <= time) {
              y = yData.values[0];
            }

            touchpad.push({ x: x / 65535, y: y / 65535, down: down });
          }
          state.touchpads.push(touchpad);
        }
      }
      break;
  }
  return state;
}

/** Decodes a bitfield into a POV angle. */
export function decodePovBitfield(value: number): number {
  let upValue = (value & 1) !== 0;
  let rightValue = (value & 2) !== 0;
  let downValue = (value & 4) !== 0;
  let leftValue = (value & 8) !== 0;
  if (upValue && rightValue) {
    return 45;
  } else if (rightValue && downValue) {
    return 135;
  } else if (downValue && leftValue) {
    return 225;
  } else if (leftValue && upValue) {
    return 315;
  } else if (upValue) {
    return 0;
  } else if (rightValue) {
    return 90;
  } else if (downValue) {
    return 180;
  } else if (leftValue) {
    return 270;
  }
  return -1;
}
