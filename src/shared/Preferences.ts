/** A set of application preferences. */
export default interface Preferences {
  theme: "light" | "dark" | "system";
  rioAddress: string;
  rioPath: string;
  liveMode: "nt4" | "nt4-akit" | "rlog";
  liveSubscribeMode: "low-bandwidth" | "logging";
  liveDiscard: number;
  publishFilter: string;
  rlogPort: number;
  threeDimensionMode: "quality" | "efficiency" | "auto";
  tbaApiKey: string;
  usb?: boolean;
}
