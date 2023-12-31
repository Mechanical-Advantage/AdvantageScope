import Log from "../../../shared/log/Log";

export default class REVSchemas {
  private constructor() {}

  private static FAULTS = [
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

  private static PARSE_FUNCTIONS = [
    this.parsePeriodic0,
    this.parsePeriodic1,
    this.parsePeriodic2,
    this.parsePeriodic3,
    this.parsePeriodic4,
    this.parsePeriodic5,
    this.parsePeriodic6
  ];

  /**
   * Parses a set of frames recorded by the unofficial logger.
   */
  static parseUnofficialLog(log: Log, key: string, timestamp: number, value: Uint8Array) {
    const dataView = new DataView(value.buffer, value.byteOffset, value.byteLength);

    for (let position = 0; position < value.length; position += 20) {
      let messageTimestamp = Number(dataView.getBigUint64(position, true)) / 1e6;
      let messageId = dataView.getUint32(position + 8, true);
      let deviceId = messageId & 0x3f;
      let frameIndex = (messageId >> 6) & 0xf;
      let messageValue = value.slice(position + 12, position + 20);

      let deviceKey = key + "/Device-" + deviceId.toString();
      let frameKey = deviceKey + "/PeriodicFrame_" + frameIndex.toFixed();
      log.putRaw(frameKey, messageTimestamp, messageValue);
      if (frameIndex >= 0 && frameIndex < REVSchemas.PARSE_FUNCTIONS.length) {
        REVSchemas.PARSE_FUNCTIONS[frameIndex](log, deviceKey, messageTimestamp, messageValue);
      }
    }
  }

  /**
   * Parses periodic status frame 0
   * - Applied Output
   * - Faults
   * - Sticky Faults
   * - Misc Boolean States
   */
  static parsePeriodic0(log: Log, key: string, timestamp: number, value: Uint8Array) {
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
    REVSchemas.FAULTS.forEach((faultName, index) => {
      log.putBoolean(key + "/Fault_" + faultName, timestamp, (faults & (1 << index)) !== 0);
      log.putBoolean(key + "/StickyFault_" + faultName, timestamp, (stickyFaults & (1 << index)) !== 0);
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
  static parsePeriodic1(log: Log, key: string, timestamp: number, value: Uint8Array) {
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
   * - IAccum
   */
  static parsePeriodic2(log: Log, key: string, timestamp: number, value: Uint8Array) {
    const dataView = new DataView(value.buffer, value.byteOffset, value.byteLength);

    const motorPosition = dataView.getFloat32(0, true);
    const iAccum = dataView.getFloat32(4, true);

    log.putNumber(key + "/MotorPositionRotations", timestamp, motorPosition);
    log.putNumber(key + "/IAccum", timestamp, iAccum);
  }

  /**
   * Parses periodic status frame 3
   * - Analog Sensor Voltage
   * - Analog Sensor Velocity
   * - Analog Sensor Position
   */
  static parsePeriodic3(log: Log, key: string, timestamp: number, value: Uint8Array) {
    const dataView = new DataView(value.buffer, value.byteOffset, value.byteLength);

    const sensorVoltageRaw = dataView.getUint8(0) | ((dataView.getUint8(1) & 0x03) << 8);
    const sensorVoltage = sensorVoltageRaw / 256.0;
    let sensorVelocityRaw = (dataView.getUint32(1, true) >> 2) & 0x3fffff;
    if (((sensorVelocityRaw >> 21) & 0x01) !== 0) {
      // Negative value
      sensorVelocityRaw -= 1 << 22;
    }
    const sensorVelocity = sensorVelocityRaw / 128.0;
    const sensorPosition = dataView.getFloat32(4, true);

    log.putNumber(key + "/AnalogSensor_Voltage", timestamp, sensorVoltage);
    log.putNumber(key + "/AnalogSensor_Velocity", timestamp, sensorVelocity);
    log.putNumber(key + "/AnalogSensor_Position", timestamp, sensorPosition);
  }

  /**
   * Parses periodic status frame 4
   * - Alternate Encoder Velocity (RPM)
   * - Alternate Encoder Position (rotations)
   */
  static parsePeriodic4(log: Log, key: string, timestamp: number, value: Uint8Array) {
    const dataView = new DataView(value.buffer, value.byteOffset, value.byteLength);

    const encoderVelocity = dataView.getFloat32(0, true);
    const encoderPosition = dataView.getFloat32(4, true);

    log.putNumber(key + "/AlternateEncoder_VelocityRPM", timestamp, encoderVelocity);
    log.putNumber(key + "/AlternateEncoder_PositionRotations", timestamp, encoderPosition);
  }

  /**
   * Parses periodic status frame 5
   * - Duty Cycle Absolute Encoder Position (rotations)
   * - Duty Cycle Absolute Encoder Absolute Angle (rotations)
   */
  static parsePeriodic5(log: Log, key: string, timestamp: number, value: Uint8Array) {
    const dataView = new DataView(value.buffer, value.byteOffset, value.byteLength);

    const encoderPosition = dataView.getFloat32(0, true);
    const encoderAbsoluteAngle = dataView.getUint16(4, true) / 65535.0;

    log.putNumber(key + "/AbsoluteEncoder_PositionRotations", timestamp, encoderPosition);
    log.putNumber(key + "/AbsoluteEncoder_PositionRotationsNoOffset", timestamp, encoderAbsoluteAngle);
  }

  /**
   * Parses periodic status frame 6
   * - Duty Cycle Absolute Encoder Velocity (RPM)
   * - Duty Cycle Absolute Encoder Frequency
   */
  static parsePeriodic6(log: Log, key: string, timestamp: number, value: Uint8Array) {
    const dataView = new DataView(value.buffer, value.byteOffset, value.byteLength);

    const encoderVelocity = dataView.getFloat32(0, true);
    const encoderFrequency = dataView.getUint16(4, true);

    log.putNumber(key + "/AbsoluteEncoder_VelocityRPM", timestamp, encoderVelocity);
    log.putNumber(key + "/AbsoluteEncoder_Frequency", timestamp, encoderFrequency);
  }
}
