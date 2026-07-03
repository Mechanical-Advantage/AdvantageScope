// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { CoordinateSystem } from "./AdvantageScopeAssets";

/** A set of application preferences. */
export default interface Preferences {
  language: string;
  theme: "light" | "dark" | "system";
  robotAddress: string;
  remotePath: string;
  liveMode: LiveMode;
  liveSubscribeMode: "low-bandwidth" | "logging";
  liveDiscard: number;
  publishFilter: string;
  rlogPort: number;
  coordinateSystem: "automatic" | CoordinateSystem;
  field3dModeAc: "cinematic" | "standard" | "low-power";
  field3dModeBattery: "" | "cinematic" | "standard" | "low-power";
  field3dAntialiasing: boolean;
  tbaApiKey: string;
  userAssetsFolder: string | null;
  skipHootNonProWarning: boolean;
  skipLanguageWarning: boolean;
  ctreLicenseAccepted: boolean;
  systemcoreStaticAddress: "" | "usb" | "wifi";
  hasScrolledLineGraph: boolean;
  hasScrolledTimeline: boolean;
}

export const SUPPORTED_LANGS = ["en-US", "es-419", "fr", "pt-BR", "tr", "ro", "he", "kk", "ru", "ar", "zh-CN", "zh-TW"];

export const DEFAULT_PREFS: Preferences = {
  language: "",
  theme: "system",
  robotAddress: "10.00.00.2",
  remotePath: "/U/logs",
  liveMode: "nt4",
  liveSubscribeMode: "low-bandwidth",
  liveDiscard: 1200,
  publishFilter: "",
  rlogPort: 5800,
  coordinateSystem: "automatic",
  field3dModeAc: "standard",
  field3dModeBattery: "",
  field3dAntialiasing: true,
  tbaApiKey: "",
  userAssetsFolder: null,
  skipHootNonProWarning: false,
  skipLanguageWarning: false,
  ctreLicenseAccepted: false,
  systemcoreStaticAddress: "",
  hasScrolledLineGraph: false,
  hasScrolledTimeline: false
};

export const DEFAULT_PREFS_LITEDS: Preferences = Object.assign({}, DEFAULT_PREFS, {
  remotePath: "",
  liveSubscribeMode: "logging"
});

export type LiveMode = "nt4" | "nt4-akit" | "nt4-systemcore" | "phoenix" | "rlog" | "ftcdashboard";

export function getLiveModeName(mode: LiveMode): string {
  switch (mode) {
    case "nt4":
      return t("liveModeName.nt4");
    case "nt4-akit":
      return t("liveModeName.nt4Akit");
    case "nt4-systemcore":
      return t("liveModeName.nt4Systemcore");
    case "phoenix":
      return t("liveModeName.phoenix");
    case "rlog":
      return t("liveModeName.rlog");
    case "ftcdashboard":
      return t("liveModeName.ftcdashboard");
  }
}

// Phoenix not possible due to cross origin restrictions
// RLOG not possible because it uses raw TCP
export const LITE_ALLOWED_LIVE_MODES: LiveMode[] = ["nt4", "nt4-akit", "nt4-systemcore", "ftcdashboard"];

export function mergePreferences(basePrefs: Preferences, newPrefs: object) {
  if ("language" in newPrefs && typeof newPrefs.language === "string" && SUPPORTED_LANGS.includes(newPrefs.language)) {
    basePrefs.language = newPrefs.language;
  }
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
  if (
    "liveMode" in newPrefs &&
    (newPrefs.liveMode === "nt4" ||
      newPrefs.liveMode === "nt4-akit" ||
      newPrefs.liveMode === "nt4-systemcore" ||
      newPrefs.liveMode === "phoenix" ||
      newPrefs.liveMode === "rlog" ||
      newPrefs.liveMode === "ftcdashboard")
  ) {
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
  if ("publishFilter" in newPrefs && typeof newPrefs.publishFilter === "string") {
    basePrefs.publishFilter = newPrefs.publishFilter;
  }
  if ("rlogPort" in newPrefs && typeof newPrefs.rlogPort === "number") {
    basePrefs.rlogPort = newPrefs.rlogPort;
  }
  if (
    "coordinateSystem" in newPrefs &&
    (newPrefs.coordinateSystem === "automatic" ||
      newPrefs.coordinateSystem === "wall-alliance" ||
      newPrefs.coordinateSystem === "wall-blue" ||
      newPrefs.coordinateSystem === "center-rotated" ||
      newPrefs.coordinateSystem === "center-red")
  ) {
    basePrefs.coordinateSystem = newPrefs.coordinateSystem;
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
  if ("tbaApiKey" in newPrefs && typeof newPrefs.tbaApiKey === "string") {
    basePrefs.tbaApiKey = newPrefs.tbaApiKey;
  }
  if ("userAssetsFolder" in newPrefs && typeof newPrefs.userAssetsFolder === "string") {
    basePrefs.userAssetsFolder = newPrefs.userAssetsFolder;
  }
  if ("skipHootNonProWarning" in newPrefs && typeof newPrefs.skipHootNonProWarning === "boolean") {
    basePrefs.skipHootNonProWarning = newPrefs.skipHootNonProWarning;
  }
  if ("skipLanguageWarning" in newPrefs && typeof newPrefs.skipLanguageWarning === "boolean") {
    basePrefs.skipLanguageWarning = newPrefs.skipLanguageWarning;
  }
  if ("ctreLicenseAccepted" in newPrefs && typeof newPrefs.ctreLicenseAccepted === "boolean") {
    basePrefs.ctreLicenseAccepted = newPrefs.ctreLicenseAccepted;
  }
  if (
    "systemcoreStaticAddress" in newPrefs &&
    (newPrefs.systemcoreStaticAddress === "" ||
      newPrefs.systemcoreStaticAddress === "usb" ||
      newPrefs.systemcoreStaticAddress === "wifi")
  ) {
    basePrefs.systemcoreStaticAddress = newPrefs.systemcoreStaticAddress;
  }
  if ("hasScrolledLineGraph" in newPrefs && typeof newPrefs.hasScrolledLineGraph === "boolean") {
    basePrefs.hasScrolledLineGraph = newPrefs.hasScrolledLineGraph;
  }
  if ("hasScrolledTimeline" in newPrefs && typeof newPrefs.hasScrolledTimeline === "boolean") {
    basePrefs.hasScrolledTimeline = newPrefs.hasScrolledTimeline;
  }
}

export function getRobotAddress(preferences: Preferences, platform: string): string {
  if (preferences.systemcoreStaticAddress === "usb") {
    return platform === "win32" ? "172.26.0.1" : "172.27.0.1";
  }
  if (preferences.systemcoreStaticAddress === "wifi") {
    return "172.30.0.1";
  }
  return preferences.robotAddress;
}
