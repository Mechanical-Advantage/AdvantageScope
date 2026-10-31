// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export const MQTT_MODES = ["json-per-signal", "json-object", "raw-can", "ascii"] as const;
export type MQTTMode = (typeof MQTT_MODES)[number];
export interface MQTTSettings {
  topic: string;
  mode: MQTTMode;
  timestampPrefix: boolean;
}
export const DEFAULT_MQTT_SETTINGS: MQTTSettings = { topic: "mur/#", mode: "json-per-signal", timestampPrefix: false };
export function normaliseMQTTSettings(value: Partial<MQTTSettings> = {}): MQTTSettings {
  return {
    topic: typeof value.topic === "string" ? value.topic : "mur/#",
    mode: MQTT_MODES.includes(value.mode!) ? value.mode! : "json-per-signal",
    timestampPrefix: value.timestampPrefix === true
  };
}
export function validateTopicFilter(topic: string): boolean {
  return (
    topic.length > 0 &&
    !topic.includes("\0") &&
    topic
      .split("/")
      .every(
        (part, i, parts) =>
          (!part.includes("#") || (part === "#" && i === parts.length - 1)) && (!part.includes("+") || part === "+")
      )
  );
}
// Credentials are deliberately session-only and never part of preferences or a layout.
export const mqttCredentials = new Map<string, { username: string; password: string }>();
