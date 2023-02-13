/** A set of application preferences. */
export default interface Preferences {
  theme: "light" | "dark" | "system";
  rioAddress: string;
  rioPath: string;
  liveMode: "nt4" | "nt4-akit" | "nt4-configurable" | "rlog";
  rlogPort: number;
  threeDimensionMode: "quality" | "efficiency" | "auto";
  usb?: boolean;
  keys: any[];
}
