/** A set of application preferences. */
export default interface Preferences {
  theme: "light" | "dark" | "system";
  rioAddress: string;
  rioPath: string;
  liveMode: "nt4" | "nt4-akit" | "rlog";
  rlogPort: number;
  threeDimensionMode: "quality" | "efficiency";
  usb?: boolean;
}
