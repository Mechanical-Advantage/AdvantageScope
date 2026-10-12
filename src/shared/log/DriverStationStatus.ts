// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export const DRIVER_STATION_STATUS_WORD_KEY = "DS:/Dscomm/Status/Robot/StatusWord";
export const DRIVER_STATION_ROBOT_STATE_KEY = "DS:/Dscomm/Status/DriverStation/RobotState";
export const DRIVER_STATION_LOST_PACKETS_KEY = "DS:/Dscomm/Status/Timing/LostPackets";

const ROBOT_MODE_MASK = 0x3; // 0 = unknown, 1 = auto, 2 = teleop, 3 = utility
const ENABLED_MASK = 1 << 2;
const PROGRAM_START_MASK = 1 << 3;
const BROWNOUT_MASK = 1 << 4;
const HIGH_VOLTAGE_BATTERY_MASK = 1 << 5;
const ESTOP_MASK = 1 << 7;
const ONBOT_OVERRIDE_ACTIVE_MASK = 1 << 8;
const ONBOT_OVERRIDE_ENABLED_MASK = 1 << 9;
const KNOWN_MASK =
  ROBOT_MODE_MASK |
  ENABLED_MASK |
  PROGRAM_START_MASK |
  BROWNOUT_MASK |
  HIGH_VOLTAGE_BATTERY_MASK |
  ESTOP_MASK |
  ONBOT_OVERRIDE_ACTIVE_MASK |
  ONBOT_OVERRIDE_ENABLED_MASK;

// Displayed robot states from the FIRST Driver Station, indexed by value
const ROBOT_STATES = [
  "PressSpacebar",
  "RequestingFmsLite",
  "NoRadioConnection",
  "NoRobotConnection",
  "NoRobotCommunication",
  "UdpError",
  "NoRobotCode",
  "OnBotOverrideEnabledDsEnabled",
  "OnBotOverrideEnabledDsDisabled",
  "OnBotOverrideEnabledDsEStopped",
  "OnBotOverrideDisabledDsEnabled",
  "OnBotOverrideDisabledDsDisabled",
  "OnBotOverrideDisabledDsEStopped",
  "OnBotOverrideUtilityEnabledDsEnabled",
  "OnBotOverrideUtilityEnabledDsDisabled",
  "OnBotOverrideUtilityDisabledDsEnabled",
  "OnBotOverrideUtilityDisabledDsDisabled",
  "WaitingForRobotCode",
  "WaitingForOpModes",
  "HeadRefEStopped",
  "EmergencyStopped",
  "RobotShowingEmergencyStopped",
  "BrownedOut",
  "WatchdogNotFed",
  "SelectOpModes",
  "SelectMatchTimes",
  "SelectUtilityOpMode",
  "SelectAutoOpMode",
  "SelectTeleopOpMode",
  "UnknownState",
  "TeleoperatedEnabled",
  "TeleoperatedDisabled",
  "TeleoperatedCountdown",
  "TeleoperatedWaiting",
  "AutonomousEnabled",
  "AutonomousDisabled",
  "AutonomousBypassed",
  "AutonomousCountdown",
  "AutonomousStopped",
  "UtilityEnabled",
  "UtilityDisabled",
  "UtilityCountdown"
];

/** The names of the colors that can be displayed for a value logged by the FIRST Driver Station. */
export type DriverStationColor =
  | "Disabled"
  | "Teleop"
  | "Auto"
  | "Utility"
  | "EStop"
  | "AStop"
  | "Brownout"
  | "NoRadioConnection"
  | "NoRobotConnection"
  | "NoRobotCommunication";

/** The colors that replace the robot mode color for the robot status word, with the highest priority first. */
const STATUS_WORD_COLOR_PRIORITY: DriverStationColor[] = ["EStop", "Brownout"];

/** Splits the robot status word into its parts, each with the color to display (if any). */
function getStatusWordParts(statusWord: number): { text: string; color: DriverStationColor | null }[] {
  let parts: { text: string; color: DriverStationColor | null }[] = [];
  if ((statusWord & ESTOP_MASK) !== 0) parts.push({ text: "E-Stop", color: "EStop" });
  if ((statusWord & BROWNOUT_MASK) !== 0) parts.push({ text: "Brownout", color: "Brownout" });
  if ((statusWord & HIGH_VOLTAGE_BATTERY_MASK) !== 0) parts.push({ text: "High-Voltage Battery", color: null });

  let mode = statusWord & ROBOT_MODE_MASK;
  let enabled = (statusWord & ENABLED_MASK) !== 0;
  parts.push({
    text: ["", "Auto ", "Teleop ", "Utility "][mode] + (enabled ? "Enabled" : "Disabled"),
    color: enabled ? ([null, "Auto", "Teleop", "Utility"] as const)[mode] : "Disabled"
  });

  if ((statusWord & PROGRAM_START_MASK) !== 0) parts.push({ text: "Program Start", color: null });
  if ((statusWord & ONBOT_OVERRIDE_ACTIVE_MASK) !== 0) parts.push({ text: "OnBot Override Active", color: null });
  if ((statusWord & ONBOT_OVERRIDE_ENABLED_MASK) !== 0) parts.push({ text: "OnBot Override Enabled", color: null });

  // Bitwise operators are limited to 32 bits, which covers all of the bits in the status word
  let unknownBits = (statusWord & ~KNOWN_MASK) >>> 0;
  if (unknownBits !== 0) parts.push({ text: "0x" + unknownBits.toString(16), color: null });
  return parts;
}

/**
 * Converts the robot status word from the FIRST Driver Station to text. Bits that are unassigned by the
 * protocol are included as a hex value.
 */
export function getDriverStationStatusText(statusWord: number): string {
  return getStatusWordParts(statusWord)
    .map((part) => part.text)
    .join(", ");
}

/** Converts the displayed robot state from the FIRST Driver Station to text. */
export function getDriverStationRobotStateText(robotState: number): string {
  return robotState in ROBOT_STATES ? ROBOT_STATES[robotState] : "Unknown";
}

/**
 * Returns the text for a value logged by the FIRST Driver Station, or null if the key does not have
 * a text representation.
 */
export function getDriverStationValueText(logKey: string, value: unknown): string | null {
  if (typeof value !== "number") return null;
  if (logKey.endsWith(DRIVER_STATION_STATUS_WORD_KEY)) return getDriverStationStatusText(value);
  if (logKey.endsWith(DRIVER_STATION_ROBOT_STATE_KEY)) return getDriverStationRobotStateText(value);
  return null;
}

/**
 * Returns the color to display for a value logged by the FIRST Driver Station, or null if the key or
 * value does not have a color representation.
 */
export function getDriverStationValueColor(logKey: string, value: unknown): DriverStationColor | null {
  if (typeof value !== "number") return null;
  if (logKey.endsWith(DRIVER_STATION_STATUS_WORD_KEY)) {
    // Faults take priority over the robot mode
    let colors = getStatusWordParts(value).map((part) => part.color);
    return (
      STATUS_WORD_COLOR_PRIORITY.find((color) => colors.includes(color)) ??
      colors.find((color) => color !== null) ??
      null
    );
  }
  if (logKey.endsWith(DRIVER_STATION_ROBOT_STATE_KEY)) {
    let state = getDriverStationRobotStateText(value);
    if (state.endsWith("EStopped") || state.endsWith("EmergencyStopped")) return "EStop";
    switch (state) {
      case "NoRadioConnection":
      case "NoRobotConnection":
      case "NoRobotCommunication":
        return state;
      case "AutonomousStopped":
        return "AStop";
      case "BrownedOut":
        return "Brownout";
      case "TeleoperatedEnabled":
        return "Teleop";
      case "AutonomousEnabled":
        return "Auto";
      case "UtilityEnabled":
        return "Utility";
      default:
        return "Disabled";
    }
  }
  return null;
}

/**
 * Returns the value to display on a graph for a number logged by the FIRST Driver Station. Negative
 * lost packet counts have no meaning, so they are displayed as zero.
 */
export function getDriverStationNumericValue(logKey: string, value: number): number {
  if (logKey.endsWith(DRIVER_STATION_LOST_PACKETS_KEY)) return Math.max(value, 0);
  return value;
}
