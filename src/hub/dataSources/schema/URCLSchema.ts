// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import BigNumber from "bignumber.js";
import Log from "../../../shared/log/Log";
import { getOrDefault } from "../../../shared/log/LogUtil";
import LoggableType from "../../../shared/log/LoggableType";
import { parseCanFrame } from "./spark/can-spec-util";
import { sparkFramesSpec as sparkFramesSpec2025 } from "./spark/spark-frames-2025";
import { sparkFramesSpec as sparkFramesSpec2026 } from "./spark/spark-frames-2026";

const PERSISTENT_SIZE = 8;
const PERIODIC_SIZE = 14;
const PERIODIC_API_CLASS = sparkFramesSpec2026.periodicFrames.STATUS_0.apiClass;
const PERIODIC_FRAME_SPECS_2025 = [
  sparkFramesSpec2025.periodicFrames.STATUS_0,
  sparkFramesSpec2025.periodicFrames.STATUS_1,
  sparkFramesSpec2025.periodicFrames.STATUS_2,
  sparkFramesSpec2025.periodicFrames.STATUS_3,
  sparkFramesSpec2025.periodicFrames.STATUS_4,
  sparkFramesSpec2025.periodicFrames.STATUS_5,
  sparkFramesSpec2025.periodicFrames.STATUS_6,
  sparkFramesSpec2025.periodicFrames.STATUS_7
];
const PERIODIC_FRAME_SPECS_2026 = [
  sparkFramesSpec2026.periodicFrames.STATUS_0,
  sparkFramesSpec2026.periodicFrames.STATUS_1,
  sparkFramesSpec2026.periodicFrames.STATUS_2,
  sparkFramesSpec2026.periodicFrames.STATUS_3,
  sparkFramesSpec2026.periodicFrames.STATUS_4,
  sparkFramesSpec2026.periodicFrames.STATUS_5,
  sparkFramesSpec2026.periodicFrames.STATUS_6,
  sparkFramesSpec2026.periodicFrames.STATUS_7
];
const FIRMWARE_FRAME_SPEC = sparkFramesSpec2026.nonPeriodicFrames.GET_FIRMWARE_VERSION;
const FIRMWARE_API = (FIRMWARE_FRAME_SPEC.apiClass << 4) | FIRMWARE_FRAME_SPEC.apiIndex;

const DEFAULT_ALIASES = Uint8Array.of(0x7b, 0x7d);
const TEXT_DECODER = new TextDecoder("UTF-8");

export default class URCLSchema {
  private constructor() {}

  /**
   * Parses a set of frames recorded by URCL using revision 3.
   */
  static parseURCLr3(log: Log, key: string, timestamp: number, value: Uint8Array) {
    let devices: { [key: string]: { alias?: string; majorFirmware?: number } } = {};
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
        let fullMessageValue = new Uint8Array(8);
        fullMessageValue.set(messageValue, 0);
        let firmwareValues = parseCanFrame(FIRMWARE_FRAME_SPEC, { data: fullMessageValue });
        devices[deviceId].majorFirmware = Number(firmwareValues.MAJOR);
      }
    }

    // Write firmware versions to log
    Object.keys(devices).forEach((deviceId) => {
      if (devices[deviceId].majorFirmware === undefined) {
        return;
      }
      let firmwareKey = rootKey + getName(deviceId) + "/Firmware";
      log.putString(firmwareKey, timestamp, devices[deviceId].majorFirmware.toString());
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
      if (
        !(deviceId in devices) ||
        devices[deviceId].majorFirmware === undefined ||
        devices[deviceId].majorFirmware < 25
      ) {
        continue;
      }

      if (((messageId >> 10) & 0x3f) === PERIODIC_API_CLASS) {
        // Periodic frame
        let frameIndex = (messageId >> 6) & 0xf;
        let deviceKey = rootKey + getName(deviceId.toString());
        let frameKey = deviceKey + "/PeriodicFrame/" + frameIndex.toFixed();
        let periodicFrameSpecs =
          devices[deviceId].majorFirmware >= 26 ? PERIODIC_FRAME_SPECS_2026 : PERIODIC_FRAME_SPECS_2025;
        log.putRaw(frameKey, messageTimestamp, messageValue);
        if (frameIndex >= 0 && frameIndex < periodicFrameSpecs.length) {
          let frameSpec = periodicFrameSpecs[frameIndex];
          let frameValues = parseCanFrame(frameSpec, { data: messageValue }) as { [key: string]: BigNumber | boolean };

          // Variables for calculating derived values
          let appliedOutput: number | null = null;
          let voltage: number | null = null;
          let outputCurrent: number | null = null;

          // Iterate over signals
          Object.entries(frameValues).forEach(([signalKey, signalValue]) => {
            if (!(signalKey in frameSpec.signals)) return;
            let signalSpec = (frameSpec.signals as { [key: string]: any })[signalKey];

            // Get signal log key
            if (signalSpec.name.includes("Reserved")) return;
            let signalGroup = "";
            if (signalSpec.name.includes("Fault")) {
              signalGroup = "Fault";
            } else if (signalSpec.name.includes("Warning")) {
              signalGroup = "Warning";
            }
            let signalName = signalSpec.name.replaceAll(" ", "");
            if (signalName === "Current") {
              signalName = "CurrentOutput";
            } else if (signalName === "Voltage") {
              signalName = "InputVoltage";
            }
            let signalLogKey = deviceKey + "/" + (signalGroup.length === 0 ? "" : signalGroup + "/") + signalName;

            // Add signal to log
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
              log.setMetadataString(signalLogKey, JSON.stringify({ description: signalSpec.description }));
            }

            // Save for derived fields
            if (signalName === "AppliedOutput") {
              appliedOutput = Number(signalValue);
            } else if (signalName === "InputVoltage") {
              voltage = Number(signalValue);
            } else if (signalName === "CurrentOutput") {
              outputCurrent = Number(signalValue);
            }
          });

          // Add derived fields
          if (appliedOutput !== null && voltage !== null && voltage > 0) {
            log.putNumber(deviceKey + "/AppliedOutputVoltage", timestamp, appliedOutput * voltage);
            log.setMetadataString(
              deviceKey + "/AppliedOutputVoltage",
              JSON.stringify({
                description:
                  "Calculated by AdvantageScope. The estimated voltage output based on the applied output (duty cycle) and input voltage of the Spark."
              })
            );
          }
          if (outputCurrent !== null && appliedOutput !== null) {
            log.putNumber(deviceKey + "/CurrentInput", timestamp, Math.abs(outputCurrent * appliedOutput));
            log.setMetadataString(
              deviceKey + "/CurrentInput",
              JSON.stringify({
                description:
                  "Calculated by AdvantageScope. The input (supply) current based on the applied output (duty cycle) and output (stator) current of the Spark."
              })
            );
          }
        }
      }
    }
  }
}
