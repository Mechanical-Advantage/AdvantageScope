import Log from "../../../shared/log/Log";
import { getOrDefault } from "../../../shared/log/LogUtil";
import LoggableType from "../../../shared/log/LoggableType";

enum DeviceModel {
  SparkMax = "SparkMax",
  SparkFlex = "SparkFlex"
}

type FirmwareVersion = {
  major: number;
  minor: number;
  build: number;
};

const DEVICE_MODEL_IDS: Map<number, DeviceModel> = new Map();
DEVICE_MODEL_IDS.set(0x2158, DeviceModel.SparkMax);
DEVICE_MODEL_IDS.set(0x2159, DeviceModel.SparkFlex);

const PERSISTENT_SIZE = 8;
const PERIODIC_SIZE = 14;
const FIRMWARE_API = 0x98;
const MODEL_API = 0x300 | 155; // Parameter Access | Parameter Number (Device Model)
const PERIODIC_API_CLASS = 6;

const FAULTS = [
  "Brownout",
  "OverCurrent",
  "WatchdogReset",
  "MotorTypeFault",
  "SensorFault",
  "Stall",
  "EEPROMFault",
  "CANTXFault",
  "CANRXFault",
  "HasReset",
  "GateDriverFault",
  "OtherFault",
  "SoftLimitForward",
  "SoftLimitReverse",
  "HardLimitForward",
  "HardLimitReverse"
];

const TEXT_DECODER = new TextDecoder("UTF-8");

export default class REVSchema {
  private constructor() {}

  /**
   * Parses a set of frames recorded by URCL using revision 2.
   */
  static parseURCLr2(log: Log, key: string, timestamp: number, value: Uint8Array) {
    let devices: { [key: string]: { alias?: string; model?: DeviceModel; firmware?: FirmwareVersion } } = {};
    if (!key.endsWith("Raw/Periodic")) return;
    const rootKey = key.slice(0, key.length - "Raw/Periodic".length);
    const aliasKey = rootKey + "Raw/Aliases";
    const persistentKey = rootKey + "Raw/Persistent";
    let getName = (deviceId: string): string => {
      if (devices[deviceId].alias === undefined) {
        return devices[deviceId].model + "-" + deviceId;
      } else {
        return devices[deviceId].alias!;
      }
    };

    // Read aliases
    let aliasesRaw = getOrDefault(log, aliasKey, LoggableType.Raw, timestamp, null);
    if (aliasesRaw === null) return;
    let aliases = JSON.parse(TEXT_DECODER.decode(aliasesRaw));
    Object.keys(aliases).forEach((idString) => {
      devices[idString] = { alias: aliases[idString] };
    });

    // Read persistent
    let persistentRaw = getOrDefault(log, persistentKey, LoggableType.Raw, timestamp, null);
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
        devices[deviceId].firmware = REVSchema.parseFirmware(messageValue);
      } else if (((messageId >> 6) & 0x3ff) === MODEL_API) {
        // Device model frame
        devices[deviceId].model = REVSchema.parseDeviceModel(messageValue);
      }
    }

    // Write firmware versions to log
    Object.keys(devices).forEach((deviceId) => {
      if (devices[deviceId].model === undefined || devices[deviceId].firmware === undefined) {
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
      if (!(deviceId in devices) || devices[deviceId].model === undefined || devices[deviceId].firmware === undefined) {
        continue;
      }

      if (((messageId >> 10) & 0x3f) === PERIODIC_API_CLASS) {
        // Periodic frame
        let frameIndex = (messageId >> 6) & 0xf;
        let deviceKey = rootKey + getName(deviceId.toString());
        let frameKey = deviceKey + "/PeriodicFrame/" + frameIndex.toFixed();
        log.putRaw(frameKey, messageTimestamp, messageValue);
        if (frameIndex >= 0 && frameIndex < REVSchema.PARSE_PERIODIC.length) {
          REVSchema.PARSE_PERIODIC[frameIndex](
            log,
            deviceKey,
            messageTimestamp,
            messageValue,
            devices[deviceId].model!,
            devices[deviceId].firmware!
          );
        }
      }
    }
  }

  /**
   * Parses a set of frames recorded by URCL using revision 1.
   */
  static parseURCLr1(log: Log, key: string, timestamp: number, value: Uint8Array) {
    const dataView = new DataView(value.buffer, value.byteOffset, value.byteLength);
    const persistentCount = dataView.getUint32(0, true);
    const periodicCount = dataView.getUint32(4, true);

    // Read persistent frames
    let devices: { [key: string]: { model?: DeviceModel; firmware?: FirmwareVersion } } = {};
    for (let position = 8; position < 8 + persistentCount * PERSISTENT_SIZE; position += PERSISTENT_SIZE) {
      let messageId = dataView.getUint16(position, true);
      let messageValue = value.slice(position + 2, position + 8);
      let deviceId = messageId & 0x3f;
      if (!(deviceId in devices)) {
        devices[deviceId] = {};
      }
      if (((messageId >> 6) & 0x3ff) === FIRMWARE_API) {
        // Firmware frame
        devices[deviceId].firmware = REVSchema.parseFirmware(messageValue);
      } else if (((messageId >> 6) & 0x3ff) === MODEL_API) {
        // Device model frame
        devices[deviceId].model = REVSchema.parseDeviceModel(messageValue);
      }
    }

    // Write firmware versions to log
    Object.keys(devices).forEach((deviceId) => {
      if (devices[deviceId].model === undefined || devices[deviceId].firmware === undefined) {
        return;
      }
      let firmwareString =
        devices[deviceId].firmware?.major.toString() +
        "." +
        devices[deviceId].firmware?.minor.toString() +
        "." +
        devices[deviceId].firmware?.build.toString();
      let firmwareKey = key + "/" + devices[deviceId].model + "-" + deviceId + "/Firmware";
      log.putString(firmwareKey, timestamp, firmwareString);
    });

    // Read periodic frames
    for (
      let position = 8 + persistentCount * PERSISTENT_SIZE;
      position < 8 + persistentCount * PERSISTENT_SIZE + periodicCount * PERIODIC_SIZE;
      position += PERIODIC_SIZE
    ) {
      let messageTimestamp = Number(dataView.getUint32(position, true)) / 1e3;
      let messageId = dataView.getUint16(position + 4, true);
      let messageValue = value.slice(position + 6, position + 14);
      let deviceId = messageId & 0x3f;
      if (!(deviceId in devices) || devices[deviceId].model === undefined || devices[deviceId].firmware === undefined) {
        continue;
      }

      if (((messageId >> 10) & 0x3f) === PERIODIC_API_CLASS) {
        // Periodic frame
        let frameIndex = (messageId >> 6) & 0xf;
        let deviceKey = key + "/" + devices[deviceId].model + "-" + deviceId.toString();
        let frameKey = deviceKey + "/PeriodicFrame/" + frameIndex.toFixed();
        log.putRaw(frameKey, messageTimestamp, messageValue);
        if (frameIndex >= 0 && frameIndex < REVSchema.PARSE_PERIODIC.length) {
          REVSchema.PARSE_PERIODIC[frameIndex](
            log,
            deviceKey,
            messageTimestamp,
            messageValue,
            devices[deviceId].model!,
            devices[deviceId].firmware!
          );
        }
      }
    }
  }

  /**
   * Parses frame containing firmware version.
   */
  private static parseFirmware(value: Uint8Array): FirmwareVersion {
    const dataView = new DataView(value.buffer, value.byteOffset, value.byteLength);
    return {
      major: dataView.getUint8(0),
      minor: dataView.getUint8(1),
      build: dataView.getUint16(2)
    };
  }

  /**
   * Parses frame containing device model parameter.
   */
  private static parseDeviceModel(value: Uint8Array): DeviceModel {
    const dataView = new DataView(value.buffer, value.byteOffset, value.byteLength);
    const parameterValue = dataView.getUint32(0, true);
    const success = dataView.getUint8(5) === 0;
    if (success && DEVICE_MODEL_IDS.has(parameterValue)) {
      return DEVICE_MODEL_IDS.get(parameterValue) as DeviceModel;
    }
    return DeviceModel.SparkMax; // Not supported, old firmware
  }

  private static PARSE_PERIODIC = [
    REVSchema.parsePeriodic0,
    REVSchema.parsePeriodic1,
    REVSchema.parsePeriodic2,
    REVSchema.parsePeriodic3,
    REVSchema.parsePeriodic4,
    REVSchema.parsePeriodic5,
    REVSchema.parsePeriodic6,
    REVSchema.parsePeriodic7
  ];

  /**
   * Parses periodic status frame 0
   * - Applied Output
   * - Faults
   * - Sticky Faults
   * - Misc Boolean States
   */
  private static parsePeriodic0(
    log: Log,
    key: string,
    timestamp: number,
    value: Uint8Array,
    model: DeviceModel,
    firmware: FirmwareVersion
  ) {
    const dataView = new DataView(value.buffer, value.byteOffset, value.byteLength);

    const appliedOutput = dataView.getInt16(0, true) / 32767.0;
    const faults = dataView.getUint16(2, true);
    const stickyFaults = dataView.getUint16(4, true);
    const bits = dataView.getUint8(6);
    const sensorInvert = (bits & 0x01) !== 0;
    const motorInvert = (bits & 0x02) !== 0;
    const isBrushless = (bits & 0x10) !== 0;
    const isFollower = (bits & 0x20) !== 0;

    log.putNumber(key + "/AppliedOutput", timestamp, appliedOutput);
    const busVoltage = getOrDefault(log, key + "/BusVoltage", LoggableType.Number, timestamp, 0);
    if (busVoltage > 0) {
      log.putNumber(key + "/AppliedOutputVoltage", timestamp, appliedOutput * busVoltage);
    }
    FAULTS.forEach((faultName, index) => {
      log.putBoolean(key + "/Fault/" + faultName, timestamp, (faults & (1 << index)) !== 0);
      log.putBoolean(key + "/StickyFault/" + faultName, timestamp, (stickyFaults & (1 << index)) !== 0);
    });
    log.putBoolean(key + "/SensorInvert", timestamp, sensorInvert);
    log.putBoolean(key + "/MotorInvert", timestamp, motorInvert);
    log.putBoolean(key + "/IsBrushless", timestamp, isBrushless);
    log.putBoolean(key + "/IsFollower", timestamp, isFollower);
  }

  /**
   * Parses periodic status frame 1
   * - Motor Velocity (RPM)
   * - Motor Temperature (°C)
   * - Bus Voltage
   * - Motor Current (amps)
   */
  private static parsePeriodic1(
    log: Log,
    key: string,
    timestamp: number,
    value: Uint8Array,
    model: DeviceModel,
    firmware: FirmwareVersion
  ) {
    const dataView = new DataView(value.buffer, value.byteOffset, value.byteLength);

    const motorVelocity = dataView.getFloat32(0, true);
    const motorTemperature = dataView.getUint8(4);
    const motorVoltageRaw = (dataView.getUint8(5) & 0xff) | ((dataView.getUint8(6) & 0x0f) << 8);
    const motorVoltage = motorVoltageRaw / 128.0;
    const motorCurrentRaw = (dataView.getUint16(6, true) >> 4) & 0x0fff;
    const motorCurrent = motorCurrentRaw / 32.0;

    log.putNumber(key + "/MotorVelocityRPM", timestamp, motorVelocity);
    if (motorTemperature > 0) {
      log.putNumber(key + "/MotorTemperatureC", timestamp, motorTemperature);
    }
    log.putNumber(key + "/BusVoltage", timestamp, motorVoltage);
    log.putNumber(key + "/MotorCurrentAmps", timestamp, motorCurrent);
  }

  /**
   * Parses periodic status frame 2
   * - Motor Position (rotations)
   * - IAccum (before firmware 24.0.0)
   */
  private static parsePeriodic2(
    log: Log,
    key: string,
    timestamp: number,
    value: Uint8Array,
    model: DeviceModel,
    firmware: FirmwareVersion
  ) {
    const dataView = new DataView(value.buffer, value.byteOffset, value.byteLength);

    let motorPosition = dataView.getFloat32(0, true);
    let iAccum: number | undefined;
    if (firmware.major < 24) {
      iAccum = dataView.getFloat32(4, true);
    } else if (model === DeviceModel.SparkFlex) {
      motorPosition = Math.trunc(motorPosition);
      motorPosition += Math.sign(motorPosition) * (dataView.getUint16(4, true) / (1 << 16));
    }
    log.putNumber(key + "/MotorPositionRotations", timestamp, motorPosition);
    if (iAccum !== undefined) log.putNumber(key + "/IAccum", timestamp, iAccum);
  }

  /**
   * Parses periodic status frame 3
   * - Analog Sensor Voltage
   * - Analog Sensor Velocity
   * - Analog Sensor Position
   */
  private static parsePeriodic3(
    log: Log,
    key: string,
    timestamp: number,
    value: Uint8Array,
    model: DeviceModel,
    firmware: FirmwareVersion
  ) {
    const dataView = new DataView(value.buffer, value.byteOffset, value.byteLength);

    const sensorVoltageRaw = dataView.getUint8(0) | ((dataView.getUint8(1) & 0x03) << 8);
    const sensorVoltage = (sensorVoltageRaw / (1 << 8)) * (model === DeviceModel.SparkFlex ? 5 / 3.3 : 1);
    let sensorVelocityRaw = (dataView.getUint32(1, true) >> 2) & 0x3fffff;
    if (((sensorVelocityRaw >> 21) & 0x01) !== 0) {
      // Negative value
      sensorVelocityRaw -= 1 << 22;
    }
    const sensorVelocity = sensorVelocityRaw / 128.0;
    const sensorPosition = dataView.getFloat32(4, true);

    log.putNumber(key + "/AnalogSensor/Voltage", timestamp, sensorVoltage);
    log.putNumber(key + "/AnalogSensor/Velocity", timestamp, sensorVelocity);
    log.putNumber(key + "/AnalogSensor/Position", timestamp, sensorPosition);
  }

  /**
   * Parses periodic status frame 4
   * - Alternate/External Encoder Velocity (RPM)
   * - Alternate/External Encoder Position (rotations)
   */
  private static parsePeriodic4(
    log: Log,
    key: string,
    timestamp: number,
    value: Uint8Array,
    model: DeviceModel,
    firmware: FirmwareVersion
  ) {
    const dataView = new DataView(value.buffer, value.byteOffset, value.byteLength);

    const encoderVelocity = dataView.getFloat32(0, true);
    const encoderPosition = dataView.getFloat32(4, true);

    const name = model === DeviceModel.SparkFlex ? "ExternalEncoder" : "AlternateEncoder";
    log.putNumber(key + "/" + name + "/VelocityRPM", timestamp, encoderVelocity);
    log.putNumber(key + "/" + name + "/PositionRotations", timestamp, encoderPosition);
  }

  /**
   * Parses periodic status frame 5
   * - Duty Cycle Absolute Encoder Position (rotations)
   * - Duty Cycle Absolute Encoder Absolute Angle (rotations)
   */
  private static parsePeriodic5(
    log: Log,
    key: string,
    timestamp: number,
    value: Uint8Array,
    model: DeviceModel,
    firmware: FirmwareVersion
  ) {
    const dataView = new DataView(value.buffer, value.byteOffset, value.byteLength);

    const encoderPosition = dataView.getFloat32(0, true);
    const encoderAbsoluteAngle = dataView.getUint16(4, true) / (1 << 16);

    log.putNumber(key + "/AbsoluteEncoder/PositionRotations", timestamp, encoderPosition);
    log.putNumber(key + "/AbsoluteEncoder/PositionRotationsNoOffset", timestamp, encoderAbsoluteAngle);
  }

  /**
   * Parses periodic status frame 6
   * - Duty Cycle Absolute Encoder Velocity (RPM)
   * - Duty Cycle Absolute Encoder Frequency
   */
  private static parsePeriodic6(
    log: Log,
    key: string,
    timestamp: number,
    value: Uint8Array,
    model: DeviceModel,
    firmware: FirmwareVersion
  ) {
    const dataView = new DataView(value.buffer, value.byteOffset, value.byteLength);

    const encoderVelocity = dataView.getFloat32(0, true);
    const encoderFrequency = dataView.getUint16(4, true);

    log.putNumber(key + "/AbsoluteEncoder/VelocityRPM", timestamp, encoderVelocity);
    log.putNumber(key + "/AbsoluteEncoder/Frequency", timestamp, encoderFrequency);
  }

  /**
   * Parses periodic status frame 7
   * - IAccum
   */
  private static parsePeriodic7(
    log: Log,
    key: string,
    timestamp: number,
    value: Uint8Array,
    model: DeviceModel,
    firmware: FirmwareVersion
  ) {
    const dataView = new DataView(value.buffer, value.byteOffset, value.byteLength);

    const iAccum = dataView.getFloat32(0, true);

    log.putNumber(key + "/IAccum", timestamp, iAccum);
  }
}
