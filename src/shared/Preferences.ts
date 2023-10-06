/** A set of application preferences. */
export default interface Preferences {
  theme: "light" | "dark" | "system";
  rioAddress: string;
  rioPath: string;
  liveMode: "nt4" | "nt4-akit" | "pathplanner" | "rlog";
  liveSubscribeMode: "low-bandwidth" | "logging";
  liveDiscard: number;
  publishFilter: string;
  rlogPort: number;
  threeDimensionModeAc: "cinematic" | "standard" | "low-power";
  threeDimensionModeBattery: "" | "cinematic" | "standard" | "low-power";
  tbaApiKey: string;
  usb?: boolean;
}
