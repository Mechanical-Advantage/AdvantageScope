import BigNumber from "bignumber.js";
import Log from "../../../shared/log/Log";
import { getOrDefault } from "../../../shared/log/LogUtil";
import LoggableType from "../../../shared/log/LoggableType";
import { parseCanFrame } from "./spark/can-spec-util";
import { sparkFramesSpec } from "./spark/spark-frames-public";

type FirmwareVersion = {
  major: number;
  minor: number;
  build: number;
};

const PERSISTENT_SIZE = 8;
const PERIODIC_SIZE = 14;
const PERIODIC_API_CLASS = sparkFramesSpec.periodicFrames.STATUS_0.apiClass;
const PERIODIC_FRAME_SPECS = Object.entries(sparkFramesSpec.periodicFrames)
  .filter(([name, _]) => name.startsWith("STATUS_"))
  .sort(([nameA, _A], [nameB, _B]) => nameA.localeCompare(nameB))
  .map(([_, spec]) => spec);
const FIRMWARE_FRAME_SPEC = sparkFramesSpec.nonPeriodicFrames.GET_FIRMWARE_VERSION;
const FIRMWARE_API = (FIRMWARE_FRAME_SPEC.apiClass << 4) | FIRMWARE_FRAME_SPEC.apiIndex;

const DEFAULT_ALIASES = Uint8Array.of(0x7b, 0x7d);
const TEXT_DECODER = new TextDecoder("UTF-8");

export default class URCLSchema {
  private constructor() {}

  /**
   * Parses a set of frames recorded by URCL using revision 2.
   */
  static parseURCLr3(log: Log, key: string, timestamp: number, value: Uint8Array) {
    let devices: { [key: string]: { alias?: string; firmware?: FirmwareVersion } } = {};
    if (!key.endsWith("Raw/Periodic")) return;
    const rootKey = key.slice(0, key.length - "Raw/Periodic".length);
    const aliasKey = rootKey + "Raw/Aliases";
    const persistentKey = rootKey + "Raw/Persistent";
    let getName = (deviceId: string): string => {
      if (devices[deviceId].alias === undefined) {
        return "Spark-" + deviceId;
      } else {
        return devices[deviceId].alias!;
      }
    };

    // Read aliases
    let aliasesRaw = getOrDefault(log, aliasKey, LoggableType.Raw, timestamp, null);
    if (aliasesRaw === null) aliasesRaw = DEFAULT_ALIASES;
    let aliases = JSON.parse(TEXT_DECODER.decode(aliasesRaw));
    Object.keys(aliases).forEach((idString) => {
      devices[idString] = { alias: aliases[idString] };
    });

    // Read persistent
    let persistentRaw: Uint8Array | null = getOrDefault(log, persistentKey, LoggableType.Raw, timestamp, null);
    if (persistentRaw === null) return;
    const persistentDataView = new DataView(persistentRaw.buffer, persistentRaw.byteOffset, persistentRaw.byteLength);
    for (let position = 0; position < persistentRaw.length; position += PERSISTENT_SIZE) {
      let messageId = persistentDataView.getUint16(position, true);
      let messageValue = persistentRaw.slice(position + 2, position + 8);
      let deviceId = messageId & 0x3f;
      if (!(deviceId in devices)) {
        devices[deviceId] = {};
      }
      if (((messageId >> 6) & 0x3ff) === FIRMWARE_API) {
        // Firmware frame
        let firmwareValues = parseCanFrame(FIRMWARE_FRAME_SPEC, { data: messageValue });
        devices[deviceId].firmware = {
          major: Number(firmwareValues.MAJOR),
          minor: Number(firmwareValues.MINOR),
          build: Number(firmwareValues.FIX)
        };
      }
    }

    // Write firmware versions to log
    Object.keys(devices).forEach((deviceId) => {
      if (devices[deviceId].firmware === undefined) {
        return;
      }
      let firmwareString =
        devices[deviceId].firmware?.major.toString() +
        "." +
        devices[deviceId].firmware?.minor.toString() +
        "." +
        devices[deviceId].firmware?.build.toString();
      let firmwareKey = rootKey + getName(deviceId) + "/Firmware";
      log.putString(firmwareKey, timestamp, firmwareString);
      log.createBlankField(rootKey + getName(deviceId), LoggableType.Empty);
      log.setGeneratedParent(rootKey + getName(deviceId));
    });

    // Read periodic frames
    const periodicDataView = new DataView(value.buffer, value.byteOffset, value.byteLength);
    for (let position = 0; position < value.length; position += PERIODIC_SIZE) {
      let messageTimestamp = Number(periodicDataView.getUint32(position, true)) / 1e3;
      let messageId = periodicDataView.getUint16(position + 4, true);
      let messageValue = value.slice(position + 6, position + 14);
      let deviceId = messageId & 0x3f;
      if (!(deviceId in devices) || devices[deviceId].firmware === undefined || devices[deviceId].firmware.major < 25) {
        continue;
      }

      if (((messageId >> 10) & 0x3f) === PERIODIC_API_CLASS) {
        // Periodic frame
        let frameIndex = (messageId >> 6) & 0xf;
        let deviceKey = rootKey + getName(deviceId.toString());
        let frameKey = deviceKey + "/PeriodicFrame/" + frameIndex.toFixed();
        log.putRaw(frameKey, messageTimestamp, messageValue);
        if (frameIndex >= 0 && frameIndex < PERIODIC_FRAME_SPECS.length) {
          let frameSpec = PERIODIC_FRAME_SPECS[frameIndex];
          let frameValues = parseCanFrame(frameSpec, { data: messageValue }) as { [key: string]: BigNumber | boolean };
          Object.entries(frameValues).forEach(([signalKey, signalValue]) => {
            if (!(signalKey in frameSpec.signals)) return;
            let signalSpec = (frameSpec.signals as { [key: string]: any })[signalKey];
            let signalLogKey = (deviceKey = "/" + (signalSpec.name as string).replaceAll(" ", ""));
            switch (signalSpec.type as string) {
              case "int":
              case "uint":
              case "float":
                log.putNumber(signalLogKey, messageTimestamp, Number(signalValue));
                break;
              case "boolean":
                log.putBoolean(signalLogKey, messageTimestamp, signalValue as boolean);
                break;
            }
            if ("description" in signalSpec) {
              log.setMetadataString(key, JSON.stringify({ description: signalSpec.description }));
            }
          });
        }
      }
    }
  }
}
