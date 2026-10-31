// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { DBCMessage, DBCSignal } from "./DBC";

/**
 * Field paths for decoded CAN signals. Keep these stable: layouts refer to them.
 *
 *   <NODE>/<Signal>          e.g. INVERTER/INV_MotorSpeedRPM, PEDALBOX/PEDAL_Position1
 *   <NODE>/<Signal>/raw      the numeric value of an enum (value-table) signal; the
 *                            signal's own field holds the label as a string
 *   CAN/Unknown/0x<ID>       raw bytes of frames with no DBC definition (3 hex digits for
 *                            11-bit IDs, 8 for 29-bit)
 *   CAN/<iface>/ErrorFrame   error frames (value = error class bits of the ID)
 *   Markers                  text from the <stem>.markers.csv sidecar
 *   Metadata/Run, Metadata/Import   the <stem>.json sidecar and an import summary
 *
 * NODE is the transmitting node from the DBC `BO_` line ("CAN" if it is Vector__XXX). Signal
 * names are unique across the MUR buses, so the path does not depend on which interface
 * (can0/can1) a frame arrived on: bench and radio logs, which name the buses the other way
 * round, produce the same paths.
 */

export const CANDUMP_ENUM_RAW_SUFFIX = "/raw";

export function getNodeName(message: DBCMessage): string {
  const node = message.transmitter.trim();
  if (node.length === 0 || node === "Vector__XXX") return "CAN";
  return node;
}

/**
 * Returns the key for a signal. If the same signal name is defined in two different messages
 * (which the MUR DBCs forbid but vendor DBCs might do), the later one gets
 * `<NODE>/<Message>/<Signal>` instead.
 */
export function getSignalKey(message: DBCMessage, signal: DBCSignal, isTaken: (key: string) => boolean): string {
  const key = getNodeName(message) + "/" + signal.name;
  if (!isTaken(key)) return key;
  return getNodeName(message) + "/" + message.name + "/" + signal.name;
}

export function getUnknownFrameKey(id: number, extended: boolean): string {
  return "CAN/Unknown/0x" + id.toString(16).toUpperCase().padStart(extended ? 8 : 3, "0");
}
