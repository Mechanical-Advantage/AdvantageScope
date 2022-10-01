import Log from "./Log";
import { LogValueSetBoolean } from "./LogValueSets";

const ENABLED_KEYS = [
  "/DriverStation/Enabled",
  "/AdvantageKit/DriverStation/Enabled",
  "DS:enabled",
  "/FMSInfo/FMSControlData"
];

export function getEnabledData(log: Log): LogValueSetBoolean | null {
  let enabledKey = ENABLED_KEYS.find((key) => log.getFieldKeys().includes(key));
  if (!enabledKey) return null;
  let enabledData: LogValueSetBoolean | null = null;
  if (enabledKey == "/FMSInfo/FMSControlData") {
    let tempEnabledData = window.log.getNumber("/FMSInfo/FMSControlData", -Infinity, Infinity);
    if (tempEnabledData) {
      enabledData = {
        timestamps: tempEnabledData.timestamps,
        values: tempEnabledData.values.map((controlWord) => controlWord % 2 == 1)
      };
    }
  } else {
    let tempEnabledData = window.log.getBoolean(enabledKey, -Infinity, Infinity);
    if (tempEnabledData) enabledData = tempEnabledData;
  }
  return enabledData;
}
