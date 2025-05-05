import { CoordinateSystem } from "./AdvantageScopeAssets";

/** A set of application preferences. */
export default interface Preferences {
  theme: "light" | "dark" | "system";
  rioAddress: string;
  rioPath: string;
  liveMode: "nt4" | "nt4-akit" | "phoenix" | "pathplanner" | "rlog";
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
  skipNumericArrayDeprecationWarning: boolean;
  skipFrcLogFolderDefault: boolean;
  skipXRExperimentalWarning: boolean;
  ctreLicenseAccepted: boolean;
  usb?: boolean;
}

export const DEFAULT_PREFS: Preferences = {
  theme: "system",
  rioAddress: "10.00.00.2",
  rioPath: "/U/logs",
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
  skipFrcLogFolderDefault: false,
  skipNumericArrayDeprecationWarning: false,
  skipXRExperimentalWarning: false,
  ctreLicenseAccepted: false
};
