/** A set of application preferences. */
export default interface Preferences {
  port: Number;
  address: String;
  rioPath: String;
  theme: "light" | "dark" | "system";
  usb?: boolean;
}
