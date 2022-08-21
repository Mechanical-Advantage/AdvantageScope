/** A set of application preferences. */
export default interface Preferences {
  port: number;
  address: string;
  rioPath: string;
  theme: "light" | "dark" | "system";
  usb?: boolean;
}
