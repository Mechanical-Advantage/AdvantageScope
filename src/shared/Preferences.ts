// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/** A set of application preferences. */
export default interface Preferences {
  theme: "light" | "dark" | "system";
  robotAddress: string;
  remotePath: string;
  liveMode: string; // Live source ID (see LiveSourceRegistry), empty for the default source
  liveSubscribeMode: "low-bandwidth" | "logging";
  liveDiscard: number;
  field3dModeAc: "cinematic" | "standard" | "low-power";
  field3dModeBattery: "" | "cinematic" | "standard" | "low-power";
  field3dAntialiasing: boolean;
  userAssetsFolder: string | null;
  hasScrolledLineGraph: boolean;
  hasScrolledTimeline: boolean;
  prefersFTC: boolean;
  timestamps: "start-zero" | "original";
}

export const DEFAULT_PREFS: Preferences = {
  theme: "system",
  robotAddress: "",
  remotePath: "/U/logs",
  liveMode: "",
  liveSubscribeMode: "low-bandwidth",
  liveDiscard: 1200,
  field3dModeAc: "standard",
  field3dModeBattery: "",
  field3dAntialiasing: true,
  userAssetsFolder: null,
  hasScrolledLineGraph: false,
  hasScrolledTimeline: false,
  prefersFTC: false,
  timestamps: "start-zero"
};

export function mergePreferences(basePrefs: Preferences, newPrefs: object) {
  if ("theme" in newPrefs && (newPrefs.theme === "light" || newPrefs.theme === "dark" || newPrefs.theme === "system")) {
    basePrefs.theme = newPrefs.theme;
  }
  if ("address" in newPrefs && typeof newPrefs.address === "string") {
    // Migrate from v1
    basePrefs.robotAddress = newPrefs.address;
  }
  if ("rioAddress" in newPrefs && typeof newPrefs.rioAddress === "string") {
    // Migrate from v4
    basePrefs.robotAddress = newPrefs.rioAddress;
  }
  if ("robotAddress" in newPrefs && typeof newPrefs.robotAddress === "string") {
    basePrefs.robotAddress = newPrefs.robotAddress;
  }
  if ("rioPath" in newPrefs && typeof newPrefs.rioPath === "string") {
    // Migrate from v4
    basePrefs.remotePath = newPrefs.rioPath;
  }
  if ("remotePath" in newPrefs && typeof newPrefs.remotePath === "string") {
    basePrefs.remotePath = newPrefs.remotePath;
  }
  if ("liveMode" in newPrefs && typeof newPrefs.liveMode === "string") {
    // Unknown IDs fall back to the default source (see LiveSourceRegistry)
    basePrefs.liveMode = newPrefs.liveMode;
  }
  if (
    "liveSubscribeMode" in newPrefs &&
    (newPrefs.liveSubscribeMode === "low-bandwidth" || newPrefs.liveSubscribeMode === "logging")
  ) {
    basePrefs.liveSubscribeMode = newPrefs.liveSubscribeMode;
  }
  if ("liveDiscard" in newPrefs && typeof newPrefs.liveDiscard === "number") {
    basePrefs.liveDiscard = newPrefs.liveDiscard;
  }
  if (
    "threeDimensionModeAc" in newPrefs &&
    (newPrefs.threeDimensionModeAc === "cinematic" ||
      newPrefs.threeDimensionModeAc === "standard" ||
      newPrefs.threeDimensionModeAc === "low-power")
  ) {
    // Migrate from v4
    basePrefs.field3dModeAc = newPrefs.threeDimensionModeAc;
  }
  if (
    "threeDimensionModeBattery" in newPrefs &&
    (newPrefs.threeDimensionModeBattery === "" ||
      newPrefs.threeDimensionModeBattery === "cinematic" ||
      newPrefs.threeDimensionModeBattery === "standard" ||
      newPrefs.threeDimensionModeBattery === "low-power")
  ) {
    // Migrate from v4
    basePrefs.field3dModeBattery = newPrefs.threeDimensionModeBattery;
  }
  if (
    "field3dModeAc" in newPrefs &&
    (newPrefs.field3dModeAc === "cinematic" ||
      newPrefs.field3dModeAc === "standard" ||
      newPrefs.field3dModeAc === "low-power")
  ) {
    basePrefs.field3dModeAc = newPrefs.field3dModeAc;
  }
  if (
    "field3dModeBattery" in newPrefs &&
    (newPrefs.field3dModeBattery === "" ||
      newPrefs.field3dModeBattery === "cinematic" ||
      newPrefs.field3dModeBattery === "standard" ||
      newPrefs.field3dModeBattery === "low-power")
  ) {
    basePrefs.field3dModeBattery = newPrefs.field3dModeBattery;
  }
  if ("field3dAntialiasing" in newPrefs && typeof newPrefs.field3dAntialiasing === "boolean") {
    basePrefs.field3dAntialiasing = newPrefs.field3dAntialiasing;
  }
  if ("userAssetsFolder" in newPrefs && typeof newPrefs.userAssetsFolder === "string") {
    basePrefs.userAssetsFolder = newPrefs.userAssetsFolder;
  }
  if ("hasScrolledLineGraph" in newPrefs && typeof newPrefs.hasScrolledLineGraph === "boolean") {
    basePrefs.hasScrolledLineGraph = newPrefs.hasScrolledLineGraph;
  }
  if ("hasScrolledTimeline" in newPrefs && typeof newPrefs.hasScrolledTimeline === "boolean") {
    basePrefs.hasScrolledTimeline = newPrefs.hasScrolledTimeline;
  }
  if ("prefersFTC" in newPrefs && typeof newPrefs.prefersFTC === "boolean") {
    basePrefs.prefersFTC = newPrefs.prefersFTC;
  }
  if ("timestamps" in newPrefs && (newPrefs.timestamps === "start-zero" || newPrefs.timestamps === "original")) {
    basePrefs.timestamps = newPrefs.timestamps;
  }
}
