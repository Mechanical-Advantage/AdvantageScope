import { BigNumber } from "bignumber.js";

/*
 * This file was auto-generated at https://github.com/REVrobotics/can-specs
 */

/**
 * Specification version 2.0.5 of public CAN frames for REV MotorController devices
 */
export const sparkFramesSpec = {
  frcJsonSpecVersion: "1.0.0",
  framesVersion: "2.0.5",
  deviceInfo: {
    deviceType: "MotorController",
    deviceTypeNumber: 2,
    manufacturer: "REV",
    manufacturerNumber: 5
  },
  periodicFrames: {
    LEGACY_STATUS_0: {
      name: "Legacy Status 0",
      description:
        "This frame exists to inform old software that is not aware of firmware version 25+ that the SPARK is present.",
      apiClass: 6,
      apiIndex: 0,
      arbId: 33888256,
      lengthBytes: 8,
      signals: {
        APPLIED_OUTPUT: {
          type: "uint" as const,
          name: "Applied Output",
          description: "Always 0 so that SPARKs running old firmware trying to follow this SPARK don't move.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          decodedMin: BigNumber("0"),
          decodedMax: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("0")
        },
        FAULTS_AND_STICKY_FAULTS: {
          type: "uint" as const,
          name: "Faults and Sticky Faults",
          description: "Always has all faults set so that old software knows that something is wrong.",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          decodedMin: BigNumber("4294967295"),
          decodedMax: BigNumber("4294967295"),
          encodedMin: BigNumber("4294967295"),
          encodedMax: BigNumber("4294967295")
        },
        OTHER_SIGNALS: {
          type: "uint" as const,
          name: "Other Signals",
          description: "The other signals don't matter very much, and all get set to 0.",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          decodedMin: BigNumber("0"),
          decodedMax: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("0")
        }
      },
      versionImplemented: "0.0.1",
      versionDeprecated: "25.0.0",
      broadcast: false,
      defaultPeriodMs: 1000,
      enabledByDefault: true
    },
    STATUS_0: {
      name: "Status 0",
      description: "Includes general data that is likely to need frequent refreshing.",
      apiClass: 46,
      apiIndex: 0,
      arbId: 33929216,
      lengthBytes: 8,
      signals: {
        APPLIED_OUTPUT: {
          type: "int" as const,
          name: "Applied Output",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("0.00003082369457075716"),
          offset: BigNumber("0"),
          decodedMin: BigNumber("-1"),
          decodedMax: BigNumber("1"),
          encodedMin: BigNumber("-32442"),
          encodedMax: BigNumber("32442")
        },
        VOLTAGE: {
          type: "uint" as const,
          name: "Voltage",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 12,
          decodeScaleFactor: BigNumber("0.0073260073260073"),
          offset: BigNumber("0"),
          unit: "V",
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4095")
        },
        CURRENT: {
          type: "uint" as const,
          name: "Current",
          bitPosition: 28,
          isBigEndian: false,
          lengthBits: 12,
          decodeScaleFactor: BigNumber("0.0366300366300366"),
          offset: BigNumber("0"),
          unit: "A",
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4095")
        },
        MOTOR_TEMPERATURE: {
          type: "uint" as const,
          name: "Motor Temperature",
          bitPosition: 40,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          unit: "degC",
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        },
        HARD_FORWARD_LIMIT_REACHED: {
          type: "boolean" as const,
          name: "Hard Forward Limit Reached",
          description: "Whether the forward physical limit switch has been reached.",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        HARD_REVERSE_LIMIT_REACHED: {
          type: "boolean" as const,
          name: "Hard Reverse Limit Reached",
          description: "Whether the reverse physical limit switch has been reached.",
          bitPosition: 49,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        SOFT_FORWARD_LIMIT_REACHED: {
          type: "boolean" as const,
          name: "Soft Forward Limit Reached",
          description: "Whether the forward software-defined position limit has been reached.",
          bitPosition: 50,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        SOFT_REVERSE_LIMIT_REACHED: {
          type: "boolean" as const,
          name: "Soft Reverse Limit Reached",
          description: "Whether the reverse software-defined position limit has been reached.",
          bitPosition: 51,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        INVERTED: {
          type: "boolean" as const,
          name: "Inverted",
          bitPosition: 52,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        PRIMARY_HEARTBEAT_LOCK: {
          type: "boolean" as const,
          name: "Primary Heartbeat Lock",
          description:
            "Indicates that the SPARK is in competition mode and will ignore the Secondary Heartbeat until it is power cycled.",
          bitPosition: 53,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        RESERVED: {
          type: "uint" as const,
          name: "Reserved",
          bitPosition: 54,
          isBigEndian: false,
          lengthBits: 10,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1023")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      defaultPeriodMs: 10,
      enabledByDefault: true
    },
    STATUS_1: {
      name: "Status 1",
      description: "Includes general data that can likely tolerate infrequent refreshing.",
      apiClass: 46,
      apiIndex: 1,
      arbId: 33929280,
      lengthBytes: 8,
      signals: {
        OTHER_FAULT: {
          type: "boolean" as const,
          name: "Other Fault",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        MOTOR_TYPE_FAULT: {
          type: "boolean" as const,
          name: "Motor Type Fault",
          bitPosition: 1,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        SENSOR_FAULT: {
          type: "boolean" as const,
          name: "Sensor Fault",
          bitPosition: 2,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        CAN_FAULT: {
          type: "boolean" as const,
          name: "CAN Fault",
          bitPosition: 3,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        TEMPERATURE_FAULT: {
          type: "boolean" as const,
          name: "Temperature Fault",
          bitPosition: 4,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        GATE_DRIVER_FAULT: {
          type: "boolean" as const,
          name: "Gate Driver Fault",
          bitPosition: 5,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        SPARK_EEPROM_FAULT: {
          type: "boolean" as const,
          name: "SPARK EEPROM Fault",
          bitPosition: 6,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        FIRMWARE_FAULT: {
          type: "boolean" as const,
          name: "Firmware Fault",
          bitPosition: 7,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        RESERVED_ACTIVES: {
          type: "uint" as const,
          name: "Reserved Actives",
          description: "Reserved space for future active (non-sticky) faults and warnings.",
          bitPosition: 8,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        },
        BROWNOUT_WARNING: {
          type: "boolean" as const,
          name: "Brownout Warning",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        OVERCURRENT_WARNING: {
          type: "boolean" as const,
          name: "Overcurrent Warning",
          bitPosition: 17,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        SPARK_EEPROM_WARNING: {
          type: "boolean" as const,
          name: "SPARK EEPROM Warning",
          bitPosition: 18,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        EXT_EEPROM_WARNING: {
          type: "boolean" as const,
          name: "Ext EEPROM Warning",
          bitPosition: 19,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        SENSOR_WARNING: {
          type: "boolean" as const,
          name: "Sensor Warning",
          bitPosition: 20,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        STALL_WARNING: {
          type: "boolean" as const,
          name: "Stall Warning",
          bitPosition: 21,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        HAS_RESET_WARNING: {
          type: "boolean" as const,
          name: "Has Reset Warning",
          bitPosition: 22,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        OTHER_WARNING: {
          type: "boolean" as const,
          name: "Other Warning",
          bitPosition: 23,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        OTHER_STICKY_FAULT: {
          type: "boolean" as const,
          name: "Other Sticky Fault",
          bitPosition: 24,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        MOTOR_TYPE_STICKY_FAULT: {
          type: "boolean" as const,
          name: "Motor Type Sticky Fault",
          bitPosition: 25,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        SENSOR_STICKY_FAULT: {
          type: "boolean" as const,
          name: "Sensor Sticky Fault",
          bitPosition: 26,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        CAN_STICKY_FAULT: {
          type: "boolean" as const,
          name: "CAN Sticky Fault",
          bitPosition: 27,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        TEMPERATURE_STICKY_FAULT: {
          type: "boolean" as const,
          name: "Temperature Sticky Fault",
          bitPosition: 28,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        GATE_DRIVER_STICKY_FAULT: {
          type: "boolean" as const,
          name: "Gate Driver Sticky Fault",
          bitPosition: 29,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        SPARK_EEPROM_STICKY_FAULT: {
          type: "boolean" as const,
          name: "SPARK EEPROM Sticky Fault",
          bitPosition: 30,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        FIRMWARE_STICKY_FAULT: {
          type: "boolean" as const,
          name: "Firmware Sticky Fault",
          bitPosition: 31,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        RESERVED_STICKIES: {
          type: "uint" as const,
          name: "Reserved Stickies",
          description: "Reserved space for future sticky faults and warnings.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        },
        BROWNOUT_STICKY_WARNING: {
          type: "boolean" as const,
          name: "Brownout Sticky Warning",
          bitPosition: 40,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        OVERCURRENT_STICKY_WARNING: {
          type: "boolean" as const,
          name: "Overcurrent Sticky Warning",
          bitPosition: 41,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        SPARK_EEPROM_STICKY_WARNING: {
          type: "boolean" as const,
          name: "SPARK EEPROM Sticky Warning",
          bitPosition: 42,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        EXT_EEPROM_STICKY_WARNING: {
          type: "boolean" as const,
          name: "Ext EEPROM Sticky Warning",
          bitPosition: 43,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        SENSOR_STICKY_WARNING: {
          type: "boolean" as const,
          name: "Sensor Sticky Warning",
          bitPosition: 44,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        STALL_STICKY_WARNING: {
          type: "boolean" as const,
          name: "Stall Sticky Warning",
          bitPosition: 45,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        HAS_RESET_STICKY_WARNING: {
          type: "boolean" as const,
          name: "Has Reset Sticky Warning",
          bitPosition: 46,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        OTHER_STICKY_WARNING: {
          type: "boolean" as const,
          name: "Other Sticky Warning",
          bitPosition: 47,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        IS_FOLLOWER: {
          type: "boolean" as const,
          name: "Is Follower",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        RESERVED: {
          type: "uint" as const,
          name: "Reserved",
          bitPosition: 49,
          isBigEndian: false,
          lengthBits: 15,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("32767")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      defaultPeriodMs: 250,
      enabledByDefault: true
    },
    STATUS_2: {
      name: "Status 2",
      description:
        "Includes data from the primary encoder (either a brushless motor's internal encoder, or the primary encoder associated with a brushed motor).",
      apiClass: 46,
      apiIndex: 2,
      arbId: 33929344,
      lengthBytes: 8,
      signals: {
        PRIMARY_ENCODER_VELOCITY: {
          type: "float" as const,
          name: "Primary Encoder Velocity",
          description:
            "By default, the unit is RPM, but it can be changed implicitly using the Velocity Conversion Factor parameter.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0")
        },
        PRIMARY_ENCODER_POSITION: {
          type: "float" as const,
          name: "Primary Encoder Position",
          description:
            "By default, the unit is rotations, but it can be changed implicitly using the Position Conversion Factor parameter.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      defaultPeriodMs: 20,
      enabledByDefault: false
    },
    STATUS_3: {
      name: "Status 3",
      description: "Includes data from an analog sensor.",
      apiClass: 46,
      apiIndex: 3,
      arbId: 33929408,
      lengthBytes: 8,
      signals: {
        ANALOG_VOLTAGE: {
          type: "uint" as const,
          name: "Analog Voltage",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 10,
          decodeScaleFactor: BigNumber("0.0048973607038123"),
          offset: BigNumber("0"),
          unit: "V",
          decodedMin: BigNumber("0"),
          decodedMax: BigNumber("5"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1020")
        },
        ANALOG_VELOCITY: {
          type: "int" as const,
          name: "Analog Velocity",
          description:
            "By default, the unit is RPM, but it can be changed implicitly using the Analog Velocity Conversion Factor parameter.",
          bitPosition: 10,
          isBigEndian: false,
          lengthBits: 22,
          decodeScaleFactor: BigNumber("0.007812026887906498"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("-2097152"),
          encodedMax: BigNumber("2097151")
        },
        ANALOG_POSITION: {
          type: "float" as const,
          name: "Analog Position",
          description:
            "By default, the unit is rotations, but it can be changed implicitly using the Analog Position Conversion Factor parameter.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      defaultPeriodMs: 20,
      enabledByDefault: false
    },
    STATUS_4: {
      name: "Status 4",
      description: "Includes data from the External Encoder (on SPARK MAX, this is the Alternate Encoder).",
      apiClass: 46,
      apiIndex: 4,
      arbId: 33929472,
      lengthBytes: 8,
      signals: {
        EXTERNAL_OR_ALT_ENCODER_VELOCITY: {
          type: "float" as const,
          name: "External or Alt Encoder Velocity",
          description:
            "By default, the unit is RPM, but it can be changed implicitly using the External/Alternate Encoder Velocity Conversion Factor parameter.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0")
        },
        EXTERNAL_OR_ALT_ENCODER_POSITION: {
          type: "float" as const,
          name: "External or Alt Encoder Position",
          description:
            "By default, the unit is rotations, but it can be changed implicitly using the External/Alternate Encoder Position Conversion Factor parameter.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      defaultPeriodMs: 20,
      enabledByDefault: false
    },
    STATUS_5: {
      name: "Status 5",
      description: "Includes velocity and position data from a duty-cycle absolute encoder.",
      apiClass: 46,
      apiIndex: 5,
      arbId: 33929536,
      lengthBytes: 8,
      signals: {
        DUTY_CYCLE_ENCODER_VELOCITY: {
          type: "float" as const,
          name: "Duty Cycle Encoder Velocity",
          description:
            "By default, the unit is RPM, but it can be changed implicitly using the Duty Cycle Velocity Conversion Factor parameter.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0")
        },
        DUTY_CYCLE_ENCODER_POSITION: {
          type: "float" as const,
          name: "Duty Cycle Encoder Position",
          description:
            "By default, the unit is rotations, but it can be changed implicitly using the Duty Cycle Position Conversion Factor parameter.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      defaultPeriodMs: 20,
      enabledByDefault: false
    },
    STATUS_6: {
      name: "Status 6",
      description: "Includes other data from a duty-cycle absolute encoder.",
      apiClass: 46,
      apiIndex: 6,
      arbId: 33929600,
      lengthBytes: 8,
      signals: {
        UNADJUSTED_DUTY_CYCLE: {
          type: "uint" as const,
          name: "Unadjusted Duty Cycle",
          description: "The duty cycle from 0 to 1, with no inversion or conversion factor applied.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("0.00001541161211566339"),
          offset: BigNumber("0"),
          decodedMin: BigNumber("0"),
          decodedMax: BigNumber("1"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("64886")
        },
        DUTY_CYCLE_PERIOD: {
          type: "uint" as const,
          name: "Duty Cycle Period",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          unit: "us",
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("65535")
        },
        DUTY_CYCLE_NO_SIGNAL: {
          type: "boolean" as const,
          name: "Duty Cycle No Signal",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        DUTY_CYCLE_RESERVED: {
          type: "int" as const,
          name: "Duty Cycle Reserved",
          bitPosition: 33,
          isBigEndian: false,
          lengthBits: 31,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("-1073741824"),
          encodedMax: BigNumber("1073741823")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      defaultPeriodMs: 20,
      enabledByDefault: false
    },
    STATUS_7: {
      name: "Status 7",
      description: "Includes diagnostic data for closed-loop control.",
      apiClass: 46,
      apiIndex: 7,
      arbId: 33929664,
      lengthBytes: 8,
      signals: {
        I_ACCUMULATION: {
          type: "float" as const,
          name: "I Accumulation",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0")
        },
        RESERVED: {
          type: "int" as const,
          name: "Reserved",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("-2147483648"),
          encodedMax: BigNumber("2147483647")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      defaultPeriodMs: 20,
      enabledByDefault: false
    },
    UNIQUE_ID_BROADCAST: {
      name: "Unique ID Broadcast",
      description:
        "Contains the unique ID of the device, to allow detecting duplicate CAN IDs. To avoid collisions, the SPARK Flex firmware will send this at an irregular period between 1000ms and 2000ms. SPARK MAX may use a constant period of 1000ms.",
      apiClass: 47,
      apiIndex: 0,
      arbId: 33930240,
      lengthBytes: 4,
      signals: {
        UNIQUE_ID: {
          type: "uint" as const,
          name: "Unique ID",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      defaultPeriodMs: 2000,
      enabledByDefault: true
    }
  },
  nonPeriodicFrames: {
    VELOCITY_SETPOINT: {
      name: "Velocity Setpoint",
      description: "Sets the Control Type to Velocity and sets the target velocity.",
      apiClass: 0,
      apiIndex: 0,
      arbId: 33882112,
      lengthBytes: 8,
      signals: {
        SETPOINT: {
          type: "float" as const,
          name: "Setpoint",
          description:
            "By default, the unit is RPM, but it can be changed implicitly using the Velocity Conversion Factor parameter.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0")
        },
        ARBITRARY_FEEDFORWARD: {
          type: "int" as const,
          name: "Arbitrary Feedforward",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("0.0009765923"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("-32768"),
          encodedMax: BigNumber("32767")
        },
        PID_SLOT: {
          type: "uint" as const,
          name: "PID Slot",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 2,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("3")
        },
        ARBITRARY_FEEDFORWARD_UNITS: {
          type: "uint" as const,
          name: "Arbitrary Feedforward Units",
          description: "0: Voltage, 1: Duty Cycle (-1 to 1)",
          bitPosition: 50,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        RESERVED: {
          type: "uint" as const,
          name: "Reserved",
          bitPosition: 51,
          isBigEndian: false,
          lengthBits: 13,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("8191")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: false as const
    },
    DUTY_CYCLE_SETPOINT: {
      name: "Duty Cycle Setpoint",
      description: "Sets the Control Type to Duty Cycle and sets the target duty cycle (from -1 to 1).",
      apiClass: 0,
      apiIndex: 2,
      arbId: 33882240,
      lengthBytes: 8,
      signals: {
        SETPOINT: {
          type: "float" as const,
          name: "Setpoint",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          decodedMin: BigNumber("-1"),
          decodedMax: BigNumber("1")
        },
        ARBITRARY_FEEDFORWARD: {
          type: "int" as const,
          name: "Arbitrary Feedforward",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("0.0009765923"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("-32768"),
          encodedMax: BigNumber("32767")
        },
        PID_SLOT: {
          type: "uint" as const,
          name: "PID Slot",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 2,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("3")
        },
        ARBITRARY_FEEDFORWARD_UNITS: {
          type: "uint" as const,
          name: "Arbitrary Feedforward Units",
          description: "0: Voltage, 1: Duty Cycle (-1 to 1)",
          bitPosition: 50,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        RESERVED: {
          type: "uint" as const,
          name: "Reserved",
          bitPosition: 51,
          isBigEndian: false,
          lengthBits: 13,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("8191")
        }
      },
      versionImplemented: "0.0.1",
      broadcast: false,
      rtr: false as const
    },
    SMART_VELOCITY_SETPOINT: {
      name: "Smart Velocity Setpoint",
      description: "Sets the Control Type to Smart Velocity and sets the target velocity.",
      apiClass: 0,
      apiIndex: 3,
      arbId: 33882304,
      lengthBytes: 8,
      signals: {
        SETPOINT: {
          type: "float" as const,
          name: "Setpoint",
          description:
            "By default, the unit is RPM, but it can be changed implicitly using the Velocity Conversion Factor parameter.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0")
        },
        ARBITRARY_FEEDFORWARD: {
          type: "int" as const,
          name: "Arbitrary Feedforward",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("0.0009765923"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("-32768"),
          encodedMax: BigNumber("32767")
        },
        PID_SLOT: {
          type: "uint" as const,
          name: "PID Slot",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 2,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("3")
        },
        ARBITRARY_FEEDFORWARD_UNITS: {
          type: "uint" as const,
          name: "Arbitrary Feedforward Units",
          description: "0: Voltage, 1: Duty Cycle (-1 to 1)",
          bitPosition: 50,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        RESERVED: {
          type: "uint" as const,
          name: "Reserved",
          bitPosition: 51,
          isBigEndian: false,
          lengthBits: 13,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("8191")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: false as const
    },
    POSITION_SETPOINT: {
      name: "Position Setpoint",
      description: "Sets the Control Type to Position and sets the target position.",
      apiClass: 0,
      apiIndex: 4,
      arbId: 33882368,
      lengthBytes: 8,
      signals: {
        SETPOINT: {
          type: "float" as const,
          name: "Setpoint",
          description:
            "By default, the unit is rotations, but it can be changed implicitly using the Position Conversion Factor parameter.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0")
        },
        ARBITRARY_FEEDFORWARD: {
          type: "int" as const,
          name: "Arbitrary Feedforward",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("0.0009765923"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("-32768"),
          encodedMax: BigNumber("32767")
        },
        PID_SLOT: {
          type: "uint" as const,
          name: "PID Slot",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 2,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("3")
        },
        ARBITRARY_FEEDFORWARD_UNITS: {
          type: "uint" as const,
          name: "Arbitrary Feedforward Units",
          description: "0: Voltage, 1: Duty Cycle (-1 to 1)",
          bitPosition: 50,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        RESERVED: {
          type: "uint" as const,
          name: "Reserved",
          bitPosition: 51,
          isBigEndian: false,
          lengthBits: 13,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("8191")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: false as const
    },
    VOLTAGE_SETPOINT: {
      name: "Voltage Setpoint",
      description: "Sets the Control Type to Voltage and sets the target voltage.",
      apiClass: 0,
      apiIndex: 5,
      arbId: 33882432,
      lengthBytes: 8,
      signals: {
        SETPOINT: {
          type: "float" as const,
          name: "Setpoint",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          unit: "V"
        },
        ARBITRARY_FEEDFORWARD: {
          type: "int" as const,
          name: "Arbitrary Feedforward",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("0.0009765923"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("-32768"),
          encodedMax: BigNumber("32767")
        },
        PID_SLOT: {
          type: "uint" as const,
          name: "PID Slot",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 2,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("3")
        },
        ARBITRARY_FEEDFORWARD_UNITS: {
          type: "uint" as const,
          name: "Arbitrary Feedforward Units",
          description: "0: Voltage, 1: Duty Cycle (-1 to 1)",
          bitPosition: 50,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        RESERVED: {
          type: "uint" as const,
          name: "Reserved",
          bitPosition: 51,
          isBigEndian: false,
          lengthBits: 13,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("8191")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: false as const
    },
    CURRENT_SETPOINT: {
      name: "Current Setpoint",
      description: "Sets the Control Type to Current and sets the target current.",
      apiClass: 0,
      apiIndex: 6,
      arbId: 33882496,
      lengthBytes: 8,
      signals: {
        SETPOINT: {
          type: "float" as const,
          name: "Setpoint",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          unit: "A"
        },
        ARBITRARY_FEEDFORWARD: {
          type: "int" as const,
          name: "Arbitrary Feedforward",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("0.0009765923"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("-32768"),
          encodedMax: BigNumber("32767")
        },
        PID_SLOT: {
          type: "uint" as const,
          name: "PID Slot",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 2,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("3")
        },
        ARBITRARY_FEEDFORWARD_UNITS: {
          type: "uint" as const,
          name: "Arbitrary Feedforward Units",
          description: "0: Voltage, 1: Duty Cycle (-1 to 1)",
          bitPosition: 50,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        RESERVED: {
          type: "uint" as const,
          name: "Reserved",
          bitPosition: 51,
          isBigEndian: false,
          lengthBits: 13,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("8191")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: false as const
    },
    SMART_MOTION_SETPOINT: {
      name: "Smart Motion Setpoint",
      description: "Sets the Control Type to Smart Motion and sets the target position.",
      apiClass: 0,
      apiIndex: 7,
      arbId: 33882560,
      lengthBytes: 8,
      signals: {
        SETPOINT: {
          type: "float" as const,
          name: "Setpoint",
          description:
            "By default, the unit is rotations, but it can be changed implicitly using the Position Conversion Factor parameter.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0")
        },
        ARBITRARY_FEEDFORWARD: {
          type: "int" as const,
          name: "Arbitrary Feedforward",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("0.0009765923"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("-32768"),
          encodedMax: BigNumber("32767")
        },
        PID_SLOT: {
          type: "uint" as const,
          name: "PID Slot",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 2,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("3")
        },
        ARBITRARY_FEEDFORWARD_UNITS: {
          type: "uint" as const,
          name: "Arbitrary Feedforward Units",
          description: "0: Voltage, 1: Duty Cycle (-1 to 1)",
          bitPosition: 50,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        RESERVED: {
          type: "uint" as const,
          name: "Reserved",
          bitPosition: 51,
          isBigEndian: false,
          lengthBits: 13,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("8191")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: false as const
    },
    MAXMOTION_POSITION_SETPOINT: {
      name: "MAXMotion Position Setpoint",
      description: "Sets the Control Type to MAXMotion Position Control and sets the target position.",
      apiClass: 0,
      apiIndex: 8,
      arbId: 33882624,
      lengthBytes: 8,
      signals: {
        SETPOINT: {
          type: "float" as const,
          name: "Setpoint",
          description:
            "By default, the unit is rotations, but it can be changed implicitly using the Position Conversion Factor parameter.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0")
        },
        ARBITRARY_FEEDFORWARD: {
          type: "int" as const,
          name: "Arbitrary Feedforward",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("0.0009765923"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("-32768"),
          encodedMax: BigNumber("32767")
        },
        PID_SLOT: {
          type: "uint" as const,
          name: "PID Slot",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 2,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("3")
        },
        ARBITRARY_FEEDFORWARD_UNITS: {
          type: "uint" as const,
          name: "Arbitrary Feedforward Units",
          description: "0: Voltage, 1: Duty Cycle (-1 to 1)",
          bitPosition: 50,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        RESERVED: {
          type: "uint" as const,
          name: "Reserved",
          bitPosition: 51,
          isBigEndian: false,
          lengthBits: 13,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("8191")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: false as const
    },
    MAXMOTION_VELOCITY_SETPOINT: {
      name: "MAXMotion Velocity Setpoint",
      description: "Sets the Control Type to MAXMotion Velocity Control and sets the target velocity.",
      apiClass: 0,
      apiIndex: 9,
      arbId: 33882688,
      lengthBytes: 8,
      signals: {
        SETPOINT: {
          type: "float" as const,
          name: "Setpoint",
          description:
            "By default, the unit is RPM, but it can be changed implicitly using the Velocity Conversion Factor parameter.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0")
        },
        ARBITRARY_FEEDFORWARD: {
          type: "int" as const,
          name: "Arbitrary Feedforward",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("0.0009765923"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("-32768"),
          encodedMax: BigNumber("32767")
        },
        PID_SLOT: {
          type: "uint" as const,
          name: "PID Slot",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 2,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("3")
        },
        ARBITRARY_FEEDFORWARD_UNITS: {
          type: "uint" as const,
          name: "Arbitrary Feedforward Units",
          description: "0: Voltage, 1: Duty Cycle (-1 to 1)",
          bitPosition: 50,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        },
        RESERVED: {
          type: "uint" as const,
          name: "Reserved",
          bitPosition: 51,
          isBigEndian: false,
          lengthBits: 13,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("8191")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: false as const
    },
    SET_STATUSES_ENABLED: {
      name: "Set Statuses Enabled",
      description: "Enable or disable status frames. In response, a Set Statuses Enabled Response frame will be sent.",
      apiClass: 1,
      apiIndex: 0,
      arbId: 33883136,
      lengthBytes: 4,
      signals: {
        MASK: {
          type: "uint" as const,
          name: "Mask",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("65535")
        },
        ENABLED_BITFIELD: {
          type: "uint" as const,
          name: "Enabled Bitfield",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("65535")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: false as const
    },
    SET_STATUSES_ENABLED_RESPONSE: {
      name: "Set Statuses Enabled Response",
      description: "Response for a Set Statuses Enabled command.",
      apiClass: 1,
      apiIndex: 1,
      arbId: 33883200,
      lengthBytes: 5,
      signals: {
        RESULT_CODE: {
          type: "uint" as const,
          name: "Result Code",
          description: "0 on success, 1 if any non-existent or unavailable frames were specified to be enabled",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        },
        SPECIFIED_MASK: {
          type: "uint" as const,
          name: "Specified Mask",
          description: "Contains the mask specified in the Set Statuses Enabled command that triggered this response.",
          bitPosition: 8,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("65535")
        },
        ENABLED_BITFIELD: {
          type: "uint" as const,
          name: "Enabled Bitfield",
          description:
            "Contains the full bitfield specifying which status frames are currently enabled, without any masking.",
          bitPosition: 24,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("65535")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: false as const
    },
    PERSIST_PARAMETERS_RESPONSE: {
      name: "Persist Parameters Response",
      apiClass: 1,
      apiIndex: 4,
      arbId: 33883392,
      lengthBytes: 1,
      signals: {
        RESULT_CODE: {
          type: "uint" as const,
          name: "Result Code",
          description: "0 on success",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: false as const
    },
    RESET_SAFE_PARAMETERS: {
      name: "Reset Safe Parameters",
      description:
        "Resets most writable parameters to their default values, except CAN ID, Motor Type, Idle Mode, PWM Input Deadband, and Duty Cycle Offset. In response, a Reset Safe Parameters Response frame is sent.",
      apiClass: 1,
      apiIndex: 5,
      arbId: 33883456,
      lengthBytes: 2,
      signals: {
        MAGIC_NUMBER: {
          type: "uint" as const,
          name: "Magic Number",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          decodedMin: BigNumber("36292"),
          decodedMax: BigNumber("36292"),
          encodedMin: BigNumber("36292"),
          encodedMax: BigNumber("36292")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: false as const
    },
    RESET_SAFE_PARAMETERS_RESPONSE: {
      name: "Reset Safe Parameters Response",
      description: "Response for a Reset Safe Parameters command.",
      apiClass: 1,
      apiIndex: 6,
      arbId: 33883520,
      lengthBytes: 1,
      signals: {
        RESULT_CODE: {
          type: "uint" as const,
          name: "Result Code",
          description: "0 on success",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: false as const
    },
    COMPLETE_FACTORY_RESET: {
      name: "Complete Factory Reset",
      description:
        "Resets all writable parameters to default values, even CAN ID, Motor Type, Idle Mode, PWM Input Deadband, and Duty Cycle Offset. In response, a Complete Factory Reset Response frame is sent.",
      apiClass: 1,
      apiIndex: 7,
      arbId: 33883584,
      lengthBytes: 2,
      signals: {
        MAGIC_NUMBER: {
          type: "uint" as const,
          name: "Magic Number",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          decodedMin: BigNumber("29741"),
          decodedMax: BigNumber("29741"),
          encodedMin: BigNumber("29741"),
          encodedMax: BigNumber("29741")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: false as const
    },
    COMPLETE_FACTORY_RESET_RESPONSE: {
      name: "Complete Factory Reset Response",
      description: "Response for a Complete Factory Reset command.",
      apiClass: 1,
      apiIndex: 8,
      arbId: 33883648,
      lengthBytes: 1,
      signals: {
        RESULT_CODE: {
          type: "uint" as const,
          name: "Result Code",
          description: "0 on success",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: false as const
    },
    CLEAR_FAULTS: {
      name: "Clear Faults",
      apiClass: 6,
      apiIndex: 14,
      arbId: 33889152,
      lengthBytes: 0,
      signals: {},
      versionImplemented: "1.0.0",
      broadcast: false,
      rtr: false as const
    },
    IDENTIFY_UNIQUE_SPARK: {
      name: "Identify Unique SPARK",
      description:
        "Makes the specified, single SPARK (even if there are multiple SPARKs that have the same CAN ID) temporarily perform a special blink pattern that will make it stand out.",
      apiClass: 7,
      apiIndex: 6,
      arbId: 33889664,
      lengthBytes: 4,
      signals: {
        UNIQUE_ID: {
          type: "uint" as const,
          name: "Unique ID",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "1.5.0",
      broadcast: false,
      rtr: false as const
    },
    IDENTIFY: {
      name: "Identify",
      description:
        "Makes the SPARK temporarily perform a special blink pattern that will make it stand out. Use Identify Unique Device if there may be multiple SPARKs with the same CAN ID.",
      apiClass: 7,
      apiIndex: 7,
      arbId: 33889728,
      lengthBytes: 0,
      signals: {},
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: false as const
    },
    NACK: {
      name: "Nack",
      description: "As of SPARK MAX firmware 1.6.3, this is only used as a potential response to setting the CAN ID.",
      apiClass: 8,
      apiIndex: 0,
      arbId: 33890304,
      lengthBytes: 0,
      signals: {},
      versionImplemented: "1.5.0",
      broadcast: false,
      rtr: false as const
    },
    ACK: {
      name: "Ack",
      description: "As of SPARK MAX firmware 1.6.3, this is only used as a potential response to setting the CAN ID.",
      apiClass: 8,
      apiIndex: 1,
      arbId: 33890368,
      lengthBytes: 0,
      signals: {},
      versionImplemented: "1.0.0",
      broadcast: false,
      rtr: false as const
    },
    LED_SYNC: {
      name: "LED Sync",
      description: "Causes all SPARKs on the bus to synchronize their LED patterns.",
      apiClass: 9,
      apiIndex: 3,
      arbId: 33891520,
      lengthBytes: 0,
      signals: {},
      versionImplemented: "1.0.0",
      broadcast: true,
      rtr: false as const
    },
    SET_CAN_ID: {
      name: "Set CAN ID",
      description:
        "Allows changing the CAN ID when multiple devices on the bus currently have the same CAN ID. Under normal circumstances, the CAN ID parameter can be used.",
      apiClass: 9,
      apiIndex: 5,
      arbId: 33891648,
      lengthBytes: 5,
      signals: {
        UNIQUE_ID: {
          type: "uint" as const,
          name: "Unique ID",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        CAN_ID: {
          type: "uint" as const,
          name: "CAN ID",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          decodedMin: BigNumber("0"),
          decodedMax: BigNumber("63"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("63")
        }
      },
      versionImplemented: "1.5.0",
      broadcast: false,
      rtr: false as const
    },
    GET_FIRMWARE_VERSION: {
      name: "Get Firmware Version",
      description:
        "The layout of this frame cannot change, and this frame sadly ended up evolving in a funky way, so the layout here is also funky.",
      apiClass: 9,
      apiIndex: 8,
      arbId: 33891840,
      lengthBytes: 8,
      signals: {
        MAJOR: {
          type: "uint" as const,
          name: "Major",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        },
        MINOR: {
          type: "uint" as const,
          name: "Minor",
          bitPosition: 8,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        },
        PRERELEASE_HIGH: {
          type: "uint" as const,
          name: "Prerelease High",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        },
        FIX: {
          type: "uint" as const,
          name: "Fix",
          bitPosition: 24,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        },
        PRERELEASE_LOW: {
          type: "uint" as const,
          name: "Prerelease Low",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        },
        HW_REV: {
          type: "uint" as const,
          name: "HW Rev",
          bitPosition: 40,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        },
        RESERVED: {
          type: "uint" as const,
          name: "Reserved",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("65535")
        }
      },
      versionImplemented: "0.0.1",
      broadcast: false,
      rtr: true as const
    },
    SWDL_DATA: {
      name: "SWDL Data",
      description: "Broadcast from the host to all SPARKs in SWDL mode, containing a slice of firmware data.",
      apiClass: 9,
      apiIndex: 12,
      arbId: 33892096,
      lengthBytes: 8,
      signals: {
        DATA: {
          type: "uint" as const,
          name: "Data",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 64,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("18446744073709551615")
        }
      },
      versionImplemented: "1.2.0",
      broadcast: true,
      rtr: false as const
    },
    SWDL_CHECKSUM: {
      name: "SWDL Checksum",
      description:
        "Broadcast from the host to all SPARKs in SWDL mode, containing the checksum of the full firmware image that was just sent.",
      apiClass: 9,
      apiIndex: 13,
      arbId: 33892160,
      lengthBytes: 8,
      signals: {
        CHECKSUM: {
          type: "uint" as const,
          name: "Checksum",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 64,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("18446744073709551615")
        }
      },
      versionImplemented: "1.2.0",
      broadcast: true,
      rtr: false as const
    },
    SWDL_RETRANSMIT: {
      name: "SWDL Retransmit",
      description:
        "Sent by SPARK devices in response to receiving an SWDL Checksum frame that does not match the firmware data they received.",
      apiClass: 9,
      apiIndex: 14,
      arbId: 33892224,
      lengthBytes: 0,
      signals: {},
      versionImplemented: "1.5.0",
      broadcast: false,
      rtr: false as const
    },
    SET_PRIMARY_ENCODER_POSITION: {
      name: "Set Primary Encoder Position",
      apiClass: 10,
      apiIndex: 0,
      arbId: 33892352,
      lengthBytes: 5,
      signals: {
        POSITION: {
          type: "float" as const,
          name: "Position",
          description:
            "By default, the unit is rotations, but it can be changed implicitly using the Position Conversion Factor parameter.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0")
        },
        DATA_TYPE: {
          type: "uint" as const,
          name: "Data Type",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          decodedMin: BigNumber("3"),
          decodedMax: BigNumber("3"),
          encodedMin: BigNumber("3"),
          encodedMax: BigNumber("3")
        }
      },
      versionImplemented: "1.0.0",
      broadcast: false,
      rtr: false as const
    },
    SET_I_ACCUMULATION: {
      name: "Set I Accumulation",
      apiClass: 10,
      apiIndex: 2,
      arbId: 33892480,
      lengthBytes: 5,
      signals: {
        I_ACCUMULATION: {
          type: "float" as const,
          name: "I Accumulation",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0")
        },
        DATA_TYPE: {
          type: "uint" as const,
          name: "Data Type",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          decodedMin: BigNumber("3"),
          decodedMax: BigNumber("3"),
          encodedMin: BigNumber("3"),
          encodedMax: BigNumber("3")
        }
      },
      versionImplemented: "1.0.0",
      broadcast: false,
      rtr: false as const
    },
    SET_ANALOG_POSITION: {
      name: "Set Analog Position",
      apiClass: 10,
      apiIndex: 3,
      arbId: 33892544,
      lengthBytes: 5,
      signals: {
        POSITION: {
          type: "float" as const,
          name: "Position",
          description:
            "By default, the unit is rotations, but it can be changed implicitly using the Analog Position Conversion Factor parameter.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0")
        },
        DATA_TYPE: {
          type: "uint" as const,
          name: "Data Type",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          decodedMin: BigNumber("3"),
          decodedMax: BigNumber("3"),
          encodedMin: BigNumber("3"),
          encodedMax: BigNumber("3")
        }
      },
      versionImplemented: "1.4.0",
      broadcast: false,
      rtr: false as const
    },
    SET_EXT_OR_ALT_ENCODER_POSITION: {
      name: "Set Ext or Alt Encoder Position",
      apiClass: 10,
      apiIndex: 4,
      arbId: 33892608,
      lengthBytes: 5,
      signals: {
        POSITION: {
          type: "float" as const,
          name: "Position",
          description:
            "By default, the unit is rotations, but it can be changed implicitly using the External/Alternate Encoder Position Conversion Factor parameter.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0")
        },
        DATA_TYPE: {
          type: "uint" as const,
          name: "Data Type",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          decodedMin: BigNumber("3"),
          decodedMax: BigNumber("3"),
          encodedMin: BigNumber("3"),
          encodedMax: BigNumber("3")
        }
      },
      versionImplemented: "1.4.0",
      broadcast: false,
      rtr: false as const
    },
    SET_DUTY_CYCLE_POSITION: {
      name: "Set Duty Cycle Position",
      apiClass: 10,
      apiIndex: 5,
      arbId: 33892672,
      lengthBytes: 5,
      signals: {
        POSITION: {
          type: "float" as const,
          name: "Position",
          description:
            "By default, the unit is rotations, but it can be changed implicitly using the Duty Cycle Position Conversion Factor parameter.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0")
        },
        DATA_TYPE: {
          type: "uint" as const,
          name: "Data Type",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          decodedMin: BigNumber("3"),
          decodedMax: BigNumber("3"),
          encodedMin: BigNumber("3"),
          encodedMax: BigNumber("3")
        }
      },
      versionImplemented: "1.6.3",
      broadcast: false,
      rtr: false as const
    },
    SECONDARY_HEARTBEAT: {
      name: "Secondary Heartbeat",
      description:
        "Heartbeat that allows enabling only specific SPARKs, but only gets respected when the SPARK is not locked to the Universal Heartbeat or Primary Heartbeat.",
      apiClass: 11,
      apiIndex: 2,
      arbId: 33893504,
      lengthBytes: 8,
      signals: {
        ENABLED_SPARKS_BITFIELD: {
          type: "uint" as const,
          name: "Enabled SPARKs Bitfield",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 64,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("18446744073709551615")
        }
      },
      versionImplemented: "1.3.0",
      broadcast: false,
      rtr: false as const
    },
    USB_ONLY_IDENTIFY: {
      name: "USB Only Identify",
      description:
        "The response will only be sent if this command is received directly via USB. This has no relation to the normal Identify command, which displays an LED pattern.",
      apiClass: 11,
      apiIndex: 3,
      arbId: 33893568,
      lengthBytes: 0,
      signals: {},
      versionImplemented: "1.5.0",
      broadcast: false,
      rtr: true as const
    },
    USB_ONLY_ENTER_DFU_BOOTLOADER: {
      name: "USB Only Enter DFU Bootloader",
      description: "Causes the device to reboot into the DFU bootloader if this command is received directly via USB.",
      apiClass: 11,
      apiIndex: 4,
      arbId: 33893632,
      lengthBytes: 2,
      signals: {
        MAGIC_NUMBER: {
          type: "uint" as const,
          name: "Magic Number",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          decodedMin: BigNumber("64069"),
          decodedMax: BigNumber("64069"),
          encodedMin: BigNumber("64069"),
          encodedMax: BigNumber("64069")
        }
      },
      versionImplemented: "1.5.0",
      broadcast: false,
      rtr: false as const
    },
    GET_TEMPERATURES: {
      name: "Get Temperatures",
      apiClass: 12,
      apiIndex: 0,
      arbId: 33894400,
      lengthBytes: 8,
      signals: {
        MOTOR_TEMPERATURE: {
          type: "uint" as const,
          name: "Motor Temperature",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          unit: "degC",
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        },
        MICROCONTROLLER_TEMPERATURE: {
          type: "uint" as const,
          name: "Microcontroller Temperature",
          bitPosition: 8,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          unit: "degC",
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        },
        FET_TEMPERATURE: {
          type: "uint" as const,
          name: "FET Temperature",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          unit: "degC",
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        },
        MOTOR_TEMPERATURE_2: {
          type: "uint" as const,
          name: "Motor Temperature 2",
          bitPosition: 24,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          unit: "degC",
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        },
        DOCK_TEMPERATURE: {
          type: "uint" as const,
          name: "Dock Temperature",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          unit: "degC",
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        },
        RESERVED_1: {
          type: "uint" as const,
          name: "Reserved 1",
          bitPosition: 40,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          unit: "degC",
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        },
        RESERVED_2: {
          type: "uint" as const,
          name: "Reserved 2",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          unit: "degC",
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        },
        VALID_TEMPERATURES_BITMASK: {
          type: "uint" as const,
          name: "Valid Temperatures Bitmask",
          description: "Each bit corresponds to one of the 7 temperature fields.",
          bitPosition: 56,
          isBigEndian: false,
          lengthBits: 7,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("127")
        },
        UNUSED: {
          type: "uint" as const,
          name: "Unused",
          bitPosition: 63,
          isBigEndian: false,
          lengthBits: 1,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("1")
        }
      },
      versionImplemented: "23.0.0",
      broadcast: false,
      rtr: true as const
    },
    GET_MOTOR_INTERFACE: {
      name: "Get Motor Interface",
      apiClass: 12,
      apiIndex: 5,
      arbId: 33894720,
      lengthBytes: 3,
      signals: {
        MOTOR_INTERFACE: {
          type: "uint" as const,
          name: "Motor Interface",
          description: "0: None, 1: SPARK Flex Dock / SPARK MAX, 2: SPARK Flex standard motor interface",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("65535")
        },
        PRIMARY_SENSOR_TYPE: {
          type: "uint" as const,
          name: "Primary Sensor Type",
          description: "0: UVW, 1: Quadrature, 2: Quadrature (integrated)",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: true as const
    },
    GET_PARAMETER_0_TO_15_TYPES: {
      name: "Get Parameter 0 to 15 Types",
      description: "Get types of parameters 0 to 15.",
      apiClass: 13,
      apiIndex: 0,
      arbId: 33895424,
      lengthBytes: 8,
      signals: {
        TYPE_0: {
          type: "uint" as const,
          name: "Type 0",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_1: {
          type: "uint" as const,
          name: "Type 1",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 4,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_2: {
          type: "uint" as const,
          name: "Type 2",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 8,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_3: {
          type: "uint" as const,
          name: "Type 3",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 12,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_4: {
          type: "uint" as const,
          name: "Type 4",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_5: {
          type: "uint" as const,
          name: "Type 5",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 20,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_6: {
          type: "uint" as const,
          name: "Type 6",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 24,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_7: {
          type: "uint" as const,
          name: "Type 7",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 28,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_8: {
          type: "uint" as const,
          name: "Type 8",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_9: {
          type: "uint" as const,
          name: "Type 9",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 36,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_10: {
          type: "uint" as const,
          name: "Type 10",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 40,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_11: {
          type: "uint" as const,
          name: "Type 11",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 44,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_12: {
          type: "uint" as const,
          name: "Type 12",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_13: {
          type: "uint" as const,
          name: "Type 13",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 52,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_14: {
          type: "uint" as const,
          name: "Type 14",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 56,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_15: {
          type: "uint" as const,
          name: "Type 15",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 60,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Get Parameter Types",
      rtr: true as const
    },
    GET_PARAMETER_16_TO_31_TYPES: {
      name: "Get Parameter 16 to 31 Types",
      description: "Get types of parameters 16 to 31.",
      apiClass: 13,
      apiIndex: 1,
      arbId: 33895488,
      lengthBytes: 8,
      signals: {
        TYPE_0: {
          type: "uint" as const,
          name: "Type 0",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_1: {
          type: "uint" as const,
          name: "Type 1",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 4,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_2: {
          type: "uint" as const,
          name: "Type 2",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 8,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_3: {
          type: "uint" as const,
          name: "Type 3",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 12,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_4: {
          type: "uint" as const,
          name: "Type 4",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_5: {
          type: "uint" as const,
          name: "Type 5",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 20,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_6: {
          type: "uint" as const,
          name: "Type 6",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 24,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_7: {
          type: "uint" as const,
          name: "Type 7",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 28,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_8: {
          type: "uint" as const,
          name: "Type 8",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_9: {
          type: "uint" as const,
          name: "Type 9",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 36,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_10: {
          type: "uint" as const,
          name: "Type 10",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 40,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_11: {
          type: "uint" as const,
          name: "Type 11",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 44,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_12: {
          type: "uint" as const,
          name: "Type 12",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_13: {
          type: "uint" as const,
          name: "Type 13",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 52,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_14: {
          type: "uint" as const,
          name: "Type 14",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 56,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_15: {
          type: "uint" as const,
          name: "Type 15",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 60,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Get Parameter Types",
      rtr: true as const
    },
    GET_PARAMETER_32_TO_47_TYPES: {
      name: "Get Parameter 32 to 47 Types",
      description: "Get types of parameters 32 to 47.",
      apiClass: 13,
      apiIndex: 2,
      arbId: 33895552,
      lengthBytes: 8,
      signals: {
        TYPE_0: {
          type: "uint" as const,
          name: "Type 0",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_1: {
          type: "uint" as const,
          name: "Type 1",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 4,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_2: {
          type: "uint" as const,
          name: "Type 2",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 8,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_3: {
          type: "uint" as const,
          name: "Type 3",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 12,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_4: {
          type: "uint" as const,
          name: "Type 4",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_5: {
          type: "uint" as const,
          name: "Type 5",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 20,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_6: {
          type: "uint" as const,
          name: "Type 6",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 24,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_7: {
          type: "uint" as const,
          name: "Type 7",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 28,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_8: {
          type: "uint" as const,
          name: "Type 8",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_9: {
          type: "uint" as const,
          name: "Type 9",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 36,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_10: {
          type: "uint" as const,
          name: "Type 10",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 40,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_11: {
          type: "uint" as const,
          name: "Type 11",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 44,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_12: {
          type: "uint" as const,
          name: "Type 12",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_13: {
          type: "uint" as const,
          name: "Type 13",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 52,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_14: {
          type: "uint" as const,
          name: "Type 14",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 56,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_15: {
          type: "uint" as const,
          name: "Type 15",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 60,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Get Parameter Types",
      rtr: true as const
    },
    GET_PARAMETER_48_TO_63_TYPES: {
      name: "Get Parameter 48 to 63 Types",
      description: "Get types of parameters 48 to 63.",
      apiClass: 13,
      apiIndex: 3,
      arbId: 33895616,
      lengthBytes: 8,
      signals: {
        TYPE_0: {
          type: "uint" as const,
          name: "Type 0",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_1: {
          type: "uint" as const,
          name: "Type 1",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 4,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_2: {
          type: "uint" as const,
          name: "Type 2",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 8,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_3: {
          type: "uint" as const,
          name: "Type 3",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 12,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_4: {
          type: "uint" as const,
          name: "Type 4",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_5: {
          type: "uint" as const,
          name: "Type 5",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 20,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_6: {
          type: "uint" as const,
          name: "Type 6",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 24,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_7: {
          type: "uint" as const,
          name: "Type 7",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 28,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_8: {
          type: "uint" as const,
          name: "Type 8",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_9: {
          type: "uint" as const,
          name: "Type 9",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 36,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_10: {
          type: "uint" as const,
          name: "Type 10",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 40,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_11: {
          type: "uint" as const,
          name: "Type 11",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 44,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_12: {
          type: "uint" as const,
          name: "Type 12",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_13: {
          type: "uint" as const,
          name: "Type 13",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 52,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_14: {
          type: "uint" as const,
          name: "Type 14",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 56,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_15: {
          type: "uint" as const,
          name: "Type 15",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 60,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Get Parameter Types",
      rtr: true as const
    },
    GET_PARAMETER_64_TO_79_TYPES: {
      name: "Get Parameter 64 to 79 Types",
      description: "Get types of parameters 64 to 79.",
      apiClass: 13,
      apiIndex: 4,
      arbId: 33895680,
      lengthBytes: 8,
      signals: {
        TYPE_0: {
          type: "uint" as const,
          name: "Type 0",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_1: {
          type: "uint" as const,
          name: "Type 1",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 4,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_2: {
          type: "uint" as const,
          name: "Type 2",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 8,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_3: {
          type: "uint" as const,
          name: "Type 3",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 12,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_4: {
          type: "uint" as const,
          name: "Type 4",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_5: {
          type: "uint" as const,
          name: "Type 5",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 20,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_6: {
          type: "uint" as const,
          name: "Type 6",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 24,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_7: {
          type: "uint" as const,
          name: "Type 7",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 28,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_8: {
          type: "uint" as const,
          name: "Type 8",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_9: {
          type: "uint" as const,
          name: "Type 9",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 36,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_10: {
          type: "uint" as const,
          name: "Type 10",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 40,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_11: {
          type: "uint" as const,
          name: "Type 11",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 44,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_12: {
          type: "uint" as const,
          name: "Type 12",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_13: {
          type: "uint" as const,
          name: "Type 13",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 52,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_14: {
          type: "uint" as const,
          name: "Type 14",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 56,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_15: {
          type: "uint" as const,
          name: "Type 15",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 60,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Get Parameter Types",
      rtr: true as const
    },
    GET_PARAMETER_80_TO_95_TYPES: {
      name: "Get Parameter 80 to 95 Types",
      description: "Get types of parameters 80 to 95.",
      apiClass: 13,
      apiIndex: 5,
      arbId: 33895744,
      lengthBytes: 8,
      signals: {
        TYPE_0: {
          type: "uint" as const,
          name: "Type 0",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_1: {
          type: "uint" as const,
          name: "Type 1",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 4,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_2: {
          type: "uint" as const,
          name: "Type 2",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 8,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_3: {
          type: "uint" as const,
          name: "Type 3",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 12,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_4: {
          type: "uint" as const,
          name: "Type 4",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_5: {
          type: "uint" as const,
          name: "Type 5",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 20,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_6: {
          type: "uint" as const,
          name: "Type 6",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 24,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_7: {
          type: "uint" as const,
          name: "Type 7",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 28,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_8: {
          type: "uint" as const,
          name: "Type 8",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_9: {
          type: "uint" as const,
          name: "Type 9",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 36,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_10: {
          type: "uint" as const,
          name: "Type 10",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 40,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_11: {
          type: "uint" as const,
          name: "Type 11",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 44,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_12: {
          type: "uint" as const,
          name: "Type 12",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_13: {
          type: "uint" as const,
          name: "Type 13",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 52,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_14: {
          type: "uint" as const,
          name: "Type 14",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 56,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_15: {
          type: "uint" as const,
          name: "Type 15",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 60,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Get Parameter Types",
      rtr: true as const
    },
    GET_PARAMETER_96_TO_111_TYPES: {
      name: "Get Parameter 96 to 111 Types",
      description: "Get types of parameters 96 to 111.",
      apiClass: 13,
      apiIndex: 6,
      arbId: 33895808,
      lengthBytes: 8,
      signals: {
        TYPE_0: {
          type: "uint" as const,
          name: "Type 0",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_1: {
          type: "uint" as const,
          name: "Type 1",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 4,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_2: {
          type: "uint" as const,
          name: "Type 2",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 8,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_3: {
          type: "uint" as const,
          name: "Type 3",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 12,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_4: {
          type: "uint" as const,
          name: "Type 4",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_5: {
          type: "uint" as const,
          name: "Type 5",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 20,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_6: {
          type: "uint" as const,
          name: "Type 6",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 24,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_7: {
          type: "uint" as const,
          name: "Type 7",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 28,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_8: {
          type: "uint" as const,
          name: "Type 8",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_9: {
          type: "uint" as const,
          name: "Type 9",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 36,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_10: {
          type: "uint" as const,
          name: "Type 10",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 40,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_11: {
          type: "uint" as const,
          name: "Type 11",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 44,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_12: {
          type: "uint" as const,
          name: "Type 12",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_13: {
          type: "uint" as const,
          name: "Type 13",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 52,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_14: {
          type: "uint" as const,
          name: "Type 14",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 56,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_15: {
          type: "uint" as const,
          name: "Type 15",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 60,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Get Parameter Types",
      rtr: true as const
    },
    GET_PARAMETER_112_TO_127_TYPES: {
      name: "Get Parameter 112 to 127 Types",
      description: "Get types of parameters 112 to 127.",
      apiClass: 13,
      apiIndex: 7,
      arbId: 33895872,
      lengthBytes: 8,
      signals: {
        TYPE_0: {
          type: "uint" as const,
          name: "Type 0",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_1: {
          type: "uint" as const,
          name: "Type 1",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 4,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_2: {
          type: "uint" as const,
          name: "Type 2",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 8,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_3: {
          type: "uint" as const,
          name: "Type 3",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 12,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_4: {
          type: "uint" as const,
          name: "Type 4",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_5: {
          type: "uint" as const,
          name: "Type 5",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 20,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_6: {
          type: "uint" as const,
          name: "Type 6",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 24,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_7: {
          type: "uint" as const,
          name: "Type 7",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 28,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_8: {
          type: "uint" as const,
          name: "Type 8",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_9: {
          type: "uint" as const,
          name: "Type 9",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 36,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_10: {
          type: "uint" as const,
          name: "Type 10",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 40,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_11: {
          type: "uint" as const,
          name: "Type 11",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 44,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_12: {
          type: "uint" as const,
          name: "Type 12",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_13: {
          type: "uint" as const,
          name: "Type 13",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 52,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_14: {
          type: "uint" as const,
          name: "Type 14",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 56,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_15: {
          type: "uint" as const,
          name: "Type 15",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 60,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Get Parameter Types",
      rtr: true as const
    },
    GET_PARAMETER_128_TO_143_TYPES: {
      name: "Get Parameter 128 to 143 Types",
      description: "Get types of parameters 128 to 143.",
      apiClass: 13,
      apiIndex: 8,
      arbId: 33895936,
      lengthBytes: 8,
      signals: {
        TYPE_0: {
          type: "uint" as const,
          name: "Type 0",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_1: {
          type: "uint" as const,
          name: "Type 1",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 4,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_2: {
          type: "uint" as const,
          name: "Type 2",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 8,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_3: {
          type: "uint" as const,
          name: "Type 3",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 12,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_4: {
          type: "uint" as const,
          name: "Type 4",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_5: {
          type: "uint" as const,
          name: "Type 5",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 20,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_6: {
          type: "uint" as const,
          name: "Type 6",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 24,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_7: {
          type: "uint" as const,
          name: "Type 7",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 28,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_8: {
          type: "uint" as const,
          name: "Type 8",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_9: {
          type: "uint" as const,
          name: "Type 9",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 36,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_10: {
          type: "uint" as const,
          name: "Type 10",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 40,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_11: {
          type: "uint" as const,
          name: "Type 11",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 44,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_12: {
          type: "uint" as const,
          name: "Type 12",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_13: {
          type: "uint" as const,
          name: "Type 13",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 52,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_14: {
          type: "uint" as const,
          name: "Type 14",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 56,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_15: {
          type: "uint" as const,
          name: "Type 15",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 60,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Get Parameter Types",
      rtr: true as const
    },
    GET_PARAMETER_144_TO_159_TYPES: {
      name: "Get Parameter 144 to 159 Types",
      description: "Get types of parameters 144 to 159.",
      apiClass: 13,
      apiIndex: 9,
      arbId: 33896000,
      lengthBytes: 8,
      signals: {
        TYPE_0: {
          type: "uint" as const,
          name: "Type 0",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_1: {
          type: "uint" as const,
          name: "Type 1",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 4,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_2: {
          type: "uint" as const,
          name: "Type 2",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 8,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_3: {
          type: "uint" as const,
          name: "Type 3",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 12,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_4: {
          type: "uint" as const,
          name: "Type 4",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_5: {
          type: "uint" as const,
          name: "Type 5",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 20,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_6: {
          type: "uint" as const,
          name: "Type 6",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 24,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_7: {
          type: "uint" as const,
          name: "Type 7",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 28,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_8: {
          type: "uint" as const,
          name: "Type 8",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_9: {
          type: "uint" as const,
          name: "Type 9",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 36,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_10: {
          type: "uint" as const,
          name: "Type 10",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 40,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_11: {
          type: "uint" as const,
          name: "Type 11",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 44,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_12: {
          type: "uint" as const,
          name: "Type 12",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_13: {
          type: "uint" as const,
          name: "Type 13",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 52,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_14: {
          type: "uint" as const,
          name: "Type 14",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 56,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_15: {
          type: "uint" as const,
          name: "Type 15",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 60,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Get Parameter Types",
      rtr: true as const
    },
    GET_PARAMETER_160_TO_175_TYPES: {
      name: "Get Parameter 160 to 175 Types",
      description: "Get types of parameters 160 to 175.",
      apiClass: 13,
      apiIndex: 10,
      arbId: 33896064,
      lengthBytes: 8,
      signals: {
        TYPE_0: {
          type: "uint" as const,
          name: "Type 0",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_1: {
          type: "uint" as const,
          name: "Type 1",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 4,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_2: {
          type: "uint" as const,
          name: "Type 2",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 8,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_3: {
          type: "uint" as const,
          name: "Type 3",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 12,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_4: {
          type: "uint" as const,
          name: "Type 4",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_5: {
          type: "uint" as const,
          name: "Type 5",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 20,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_6: {
          type: "uint" as const,
          name: "Type 6",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 24,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_7: {
          type: "uint" as const,
          name: "Type 7",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 28,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_8: {
          type: "uint" as const,
          name: "Type 8",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_9: {
          type: "uint" as const,
          name: "Type 9",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 36,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_10: {
          type: "uint" as const,
          name: "Type 10",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 40,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_11: {
          type: "uint" as const,
          name: "Type 11",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 44,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_12: {
          type: "uint" as const,
          name: "Type 12",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_13: {
          type: "uint" as const,
          name: "Type 13",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 52,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_14: {
          type: "uint" as const,
          name: "Type 14",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 56,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_15: {
          type: "uint" as const,
          name: "Type 15",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 60,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Get Parameter Types",
      rtr: true as const
    },
    GET_PARAMETER_176_TO_191_TYPES: {
      name: "Get Parameter 176 to 191 Types",
      description: "Get types of parameters 176 to 191.",
      apiClass: 13,
      apiIndex: 11,
      arbId: 33896128,
      lengthBytes: 8,
      signals: {
        TYPE_0: {
          type: "uint" as const,
          name: "Type 0",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_1: {
          type: "uint" as const,
          name: "Type 1",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 4,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_2: {
          type: "uint" as const,
          name: "Type 2",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 8,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_3: {
          type: "uint" as const,
          name: "Type 3",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 12,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_4: {
          type: "uint" as const,
          name: "Type 4",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_5: {
          type: "uint" as const,
          name: "Type 5",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 20,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_6: {
          type: "uint" as const,
          name: "Type 6",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 24,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_7: {
          type: "uint" as const,
          name: "Type 7",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 28,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_8: {
          type: "uint" as const,
          name: "Type 8",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_9: {
          type: "uint" as const,
          name: "Type 9",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 36,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_10: {
          type: "uint" as const,
          name: "Type 10",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 40,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_11: {
          type: "uint" as const,
          name: "Type 11",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 44,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_12: {
          type: "uint" as const,
          name: "Type 12",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_13: {
          type: "uint" as const,
          name: "Type 13",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 52,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_14: {
          type: "uint" as const,
          name: "Type 14",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 56,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_15: {
          type: "uint" as const,
          name: "Type 15",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 60,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Get Parameter Types",
      rtr: true as const
    },
    GET_PARAMETER_192_TO_207_TYPES: {
      name: "Get Parameter 192 to 207 Types",
      description: "Get types of parameters 192 to 207.",
      apiClass: 13,
      apiIndex: 12,
      arbId: 33896192,
      lengthBytes: 8,
      signals: {
        TYPE_0: {
          type: "uint" as const,
          name: "Type 0",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_1: {
          type: "uint" as const,
          name: "Type 1",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 4,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_2: {
          type: "uint" as const,
          name: "Type 2",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 8,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_3: {
          type: "uint" as const,
          name: "Type 3",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 12,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_4: {
          type: "uint" as const,
          name: "Type 4",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_5: {
          type: "uint" as const,
          name: "Type 5",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 20,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_6: {
          type: "uint" as const,
          name: "Type 6",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 24,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_7: {
          type: "uint" as const,
          name: "Type 7",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 28,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_8: {
          type: "uint" as const,
          name: "Type 8",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_9: {
          type: "uint" as const,
          name: "Type 9",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 36,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_10: {
          type: "uint" as const,
          name: "Type 10",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 40,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_11: {
          type: "uint" as const,
          name: "Type 11",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 44,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_12: {
          type: "uint" as const,
          name: "Type 12",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_13: {
          type: "uint" as const,
          name: "Type 13",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 52,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_14: {
          type: "uint" as const,
          name: "Type 14",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 56,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_15: {
          type: "uint" as const,
          name: "Type 15",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 60,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Get Parameter Types",
      rtr: true as const
    },
    GET_PARAMETER_208_TO_223_TYPES: {
      name: "Get Parameter 208 to 223 Types",
      description: "Get types of parameters 208 to 223.",
      apiClass: 13,
      apiIndex: 13,
      arbId: 33896256,
      lengthBytes: 8,
      signals: {
        TYPE_0: {
          type: "uint" as const,
          name: "Type 0",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_1: {
          type: "uint" as const,
          name: "Type 1",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 4,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_2: {
          type: "uint" as const,
          name: "Type 2",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 8,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_3: {
          type: "uint" as const,
          name: "Type 3",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 12,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_4: {
          type: "uint" as const,
          name: "Type 4",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_5: {
          type: "uint" as const,
          name: "Type 5",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 20,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_6: {
          type: "uint" as const,
          name: "Type 6",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 24,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_7: {
          type: "uint" as const,
          name: "Type 7",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 28,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_8: {
          type: "uint" as const,
          name: "Type 8",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_9: {
          type: "uint" as const,
          name: "Type 9",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 36,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_10: {
          type: "uint" as const,
          name: "Type 10",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 40,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_11: {
          type: "uint" as const,
          name: "Type 11",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 44,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_12: {
          type: "uint" as const,
          name: "Type 12",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_13: {
          type: "uint" as const,
          name: "Type 13",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 52,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_14: {
          type: "uint" as const,
          name: "Type 14",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 56,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_15: {
          type: "uint" as const,
          name: "Type 15",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 60,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Get Parameter Types",
      rtr: true as const
    },
    GET_PARAMETER_224_TO_239_TYPES: {
      name: "Get Parameter 224 to 239 Types",
      description: "Get types of parameters 224 to 239.",
      apiClass: 13,
      apiIndex: 14,
      arbId: 33896320,
      lengthBytes: 8,
      signals: {
        TYPE_0: {
          type: "uint" as const,
          name: "Type 0",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_1: {
          type: "uint" as const,
          name: "Type 1",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 4,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_2: {
          type: "uint" as const,
          name: "Type 2",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 8,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_3: {
          type: "uint" as const,
          name: "Type 3",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 12,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_4: {
          type: "uint" as const,
          name: "Type 4",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_5: {
          type: "uint" as const,
          name: "Type 5",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 20,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_6: {
          type: "uint" as const,
          name: "Type 6",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 24,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_7: {
          type: "uint" as const,
          name: "Type 7",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 28,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_8: {
          type: "uint" as const,
          name: "Type 8",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_9: {
          type: "uint" as const,
          name: "Type 9",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 36,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_10: {
          type: "uint" as const,
          name: "Type 10",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 40,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_11: {
          type: "uint" as const,
          name: "Type 11",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 44,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_12: {
          type: "uint" as const,
          name: "Type 12",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_13: {
          type: "uint" as const,
          name: "Type 13",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 52,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_14: {
          type: "uint" as const,
          name: "Type 14",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 56,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_15: {
          type: "uint" as const,
          name: "Type 15",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 60,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Get Parameter Types",
      rtr: true as const
    },
    GET_PARAMETER_240_TO_255_TYPES: {
      name: "Get Parameter 240 to 255 Types",
      description: "Get types of parameters 240 to 255.",
      apiClass: 13,
      apiIndex: 15,
      arbId: 33896384,
      lengthBytes: 8,
      signals: {
        TYPE_0: {
          type: "uint" as const,
          name: "Type 0",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_1: {
          type: "uint" as const,
          name: "Type 1",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 4,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_2: {
          type: "uint" as const,
          name: "Type 2",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 8,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_3: {
          type: "uint" as const,
          name: "Type 3",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 12,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_4: {
          type: "uint" as const,
          name: "Type 4",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_5: {
          type: "uint" as const,
          name: "Type 5",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 20,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_6: {
          type: "uint" as const,
          name: "Type 6",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 24,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_7: {
          type: "uint" as const,
          name: "Type 7",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 28,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_8: {
          type: "uint" as const,
          name: "Type 8",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_9: {
          type: "uint" as const,
          name: "Type 9",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 36,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_10: {
          type: "uint" as const,
          name: "Type 10",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 40,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_11: {
          type: "uint" as const,
          name: "Type 11",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 44,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_12: {
          type: "uint" as const,
          name: "Type 12",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_13: {
          type: "uint" as const,
          name: "Type 13",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 52,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_14: {
          type: "uint" as const,
          name: "Type 14",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 56,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        },
        TYPE_15: {
          type: "uint" as const,
          name: "Type 15",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 60,
          isBigEndian: false,
          lengthBits: 4,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("15")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Get Parameter Types",
      rtr: true as const
    },
    WRITE_PARAMETER: {
      name: "Write Parameter",
      description: "Write a single parameter value. In response, a Parameter Write Response frame will be sent.",
      apiClass: 14,
      apiIndex: 0,
      arbId: 33896448,
      lengthBytes: 5,
      signals: {
        PARAMETER_ID: {
          type: "uint" as const,
          name: "Parameter ID",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        },
        VALUE: {
          type: "uint" as const,
          name: "Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 8,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: false as const
    },
    PARAMETER_WRITE_RESPONSE: {
      name: "Parameter Write Response",
      description: "Response for a parameter write (including a write done as part of a dual-write).",
      apiClass: 14,
      apiIndex: 1,
      arbId: 33896512,
      lengthBytes: 7,
      signals: {
        PARAMETER_ID: {
          type: "uint" as const,
          name: "Parameter ID",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        },
        PARAMETER_TYPE: {
          type: "uint" as const,
          name: "Parameter Type",
          description: "0: Unused, 1: Int, 2: Uint, 3: Float, 4: Boolean",
          bitPosition: 8,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        },
        VALUE: {
          type: "uint" as const,
          name: "Value",
          description:
            "The actual type of this field is specified by the Parameter Type field. Contains the current value of the parameter, which will not match what was specified in the write command if the write failed.",
          bitPosition: 16,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        RESULT_CODE: {
          type: "uint" as const,
          name: "Result Code",
          description: "0: Success, 1: Invalid ID, 2: Mismatched Type, 3: Access Mode, 4: Invalid, 5: Not Implemented",
          bitPosition: 48,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: false as const
    },
    READ_PARAMETER_0_AND_1: {
      name: "Read Parameter 0 and 1",
      description:
        "Read parameter 0 and 1 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 15,
      apiIndex: 0,
      arbId: 33897472,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_2_AND_3: {
      name: "Read Parameter 2 and 3",
      description:
        "Read parameter 2 and 3 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 15,
      apiIndex: 1,
      arbId: 33897536,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_4_AND_5: {
      name: "Read Parameter 4 and 5",
      description:
        "Read parameter 4 and 5 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 15,
      apiIndex: 2,
      arbId: 33897600,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_6_AND_7: {
      name: "Read Parameter 6 and 7",
      description:
        "Read parameter 6 and 7 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 15,
      apiIndex: 3,
      arbId: 33897664,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_8_AND_9: {
      name: "Read Parameter 8 and 9",
      description:
        "Read parameter 8 and 9 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 15,
      apiIndex: 4,
      arbId: 33897728,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_10_AND_11: {
      name: "Read Parameter 10 and 11",
      description:
        "Read parameter 10 and 11 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 15,
      apiIndex: 5,
      arbId: 33897792,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_12_AND_13: {
      name: "Read Parameter 12 and 13",
      description:
        "Read parameter 12 and 13 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 15,
      apiIndex: 6,
      arbId: 33897856,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_14_AND_15: {
      name: "Read Parameter 14 and 15",
      description:
        "Read parameter 14 and 15 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 15,
      apiIndex: 7,
      arbId: 33897920,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_16_AND_17: {
      name: "Read Parameter 16 and 17",
      description:
        "Read parameter 16 and 17 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 15,
      apiIndex: 8,
      arbId: 33897984,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_18_AND_19: {
      name: "Read Parameter 18 and 19",
      description:
        "Read parameter 18 and 19 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 15,
      apiIndex: 9,
      arbId: 33898048,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_20_AND_21: {
      name: "Read Parameter 20 and 21",
      description:
        "Read parameter 20 and 21 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 15,
      apiIndex: 10,
      arbId: 33898112,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_22_AND_23: {
      name: "Read Parameter 22 and 23",
      description:
        "Read parameter 22 and 23 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 15,
      apiIndex: 11,
      arbId: 33898176,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_24_AND_25: {
      name: "Read Parameter 24 and 25",
      description:
        "Read parameter 24 and 25 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 15,
      apiIndex: 12,
      arbId: 33898240,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_26_AND_27: {
      name: "Read Parameter 26 and 27",
      description:
        "Read parameter 26 and 27 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 15,
      apiIndex: 13,
      arbId: 33898304,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_28_AND_29: {
      name: "Read Parameter 28 and 29",
      description:
        "Read parameter 28 and 29 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 15,
      apiIndex: 14,
      arbId: 33898368,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_30_AND_31: {
      name: "Read Parameter 30 and 31",
      description:
        "Read parameter 30 and 31 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 15,
      apiIndex: 15,
      arbId: 33898432,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_32_AND_33: {
      name: "Read Parameter 32 and 33",
      description:
        "Read parameter 32 and 33 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 16,
      apiIndex: 0,
      arbId: 33898496,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_34_AND_35: {
      name: "Read Parameter 34 and 35",
      description:
        "Read parameter 34 and 35 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 16,
      apiIndex: 1,
      arbId: 33898560,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_36_AND_37: {
      name: "Read Parameter 36 and 37",
      description:
        "Read parameter 36 and 37 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 16,
      apiIndex: 2,
      arbId: 33898624,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_38_AND_39: {
      name: "Read Parameter 38 and 39",
      description:
        "Read parameter 38 and 39 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 16,
      apiIndex: 3,
      arbId: 33898688,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_40_AND_41: {
      name: "Read Parameter 40 and 41",
      description:
        "Read parameter 40 and 41 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 16,
      apiIndex: 4,
      arbId: 33898752,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_42_AND_43: {
      name: "Read Parameter 42 and 43",
      description:
        "Read parameter 42 and 43 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 16,
      apiIndex: 5,
      arbId: 33898816,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_44_AND_45: {
      name: "Read Parameter 44 and 45",
      description:
        "Read parameter 44 and 45 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 16,
      apiIndex: 6,
      arbId: 33898880,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_46_AND_47: {
      name: "Read Parameter 46 and 47",
      description:
        "Read parameter 46 and 47 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 16,
      apiIndex: 7,
      arbId: 33898944,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_48_AND_49: {
      name: "Read Parameter 48 and 49",
      description:
        "Read parameter 48 and 49 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 16,
      apiIndex: 8,
      arbId: 33899008,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_50_AND_51: {
      name: "Read Parameter 50 and 51",
      description:
        "Read parameter 50 and 51 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 16,
      apiIndex: 9,
      arbId: 33899072,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_52_AND_53: {
      name: "Read Parameter 52 and 53",
      description:
        "Read parameter 52 and 53 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 16,
      apiIndex: 10,
      arbId: 33899136,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_54_AND_55: {
      name: "Read Parameter 54 and 55",
      description:
        "Read parameter 54 and 55 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 16,
      apiIndex: 11,
      arbId: 33899200,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_56_AND_57: {
      name: "Read Parameter 56 and 57",
      description:
        "Read parameter 56 and 57 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 16,
      apiIndex: 12,
      arbId: 33899264,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_58_AND_59: {
      name: "Read Parameter 58 and 59",
      description:
        "Read parameter 58 and 59 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 16,
      apiIndex: 13,
      arbId: 33899328,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_60_AND_61: {
      name: "Read Parameter 60 and 61",
      description:
        "Read parameter 60 and 61 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 16,
      apiIndex: 14,
      arbId: 33899392,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_62_AND_63: {
      name: "Read Parameter 62 and 63",
      description:
        "Read parameter 62 and 63 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 16,
      apiIndex: 15,
      arbId: 33899456,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_64_AND_65: {
      name: "Read Parameter 64 and 65",
      description:
        "Read parameter 64 and 65 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 17,
      apiIndex: 0,
      arbId: 33899520,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_66_AND_67: {
      name: "Read Parameter 66 and 67",
      description:
        "Read parameter 66 and 67 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 17,
      apiIndex: 1,
      arbId: 33899584,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_68_AND_69: {
      name: "Read Parameter 68 and 69",
      description:
        "Read parameter 68 and 69 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 17,
      apiIndex: 2,
      arbId: 33899648,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_70_AND_71: {
      name: "Read Parameter 70 and 71",
      description:
        "Read parameter 70 and 71 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 17,
      apiIndex: 3,
      arbId: 33899712,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_72_AND_73: {
      name: "Read Parameter 72 and 73",
      description:
        "Read parameter 72 and 73 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 17,
      apiIndex: 4,
      arbId: 33899776,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_74_AND_75: {
      name: "Read Parameter 74 and 75",
      description:
        "Read parameter 74 and 75 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 17,
      apiIndex: 5,
      arbId: 33899840,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_76_AND_77: {
      name: "Read Parameter 76 and 77",
      description:
        "Read parameter 76 and 77 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 17,
      apiIndex: 6,
      arbId: 33899904,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_78_AND_79: {
      name: "Read Parameter 78 and 79",
      description:
        "Read parameter 78 and 79 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 17,
      apiIndex: 7,
      arbId: 33899968,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_80_AND_81: {
      name: "Read Parameter 80 and 81",
      description:
        "Read parameter 80 and 81 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 17,
      apiIndex: 8,
      arbId: 33900032,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_82_AND_83: {
      name: "Read Parameter 82 and 83",
      description:
        "Read parameter 82 and 83 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 17,
      apiIndex: 9,
      arbId: 33900096,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_84_AND_85: {
      name: "Read Parameter 84 and 85",
      description:
        "Read parameter 84 and 85 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 17,
      apiIndex: 10,
      arbId: 33900160,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_86_AND_87: {
      name: "Read Parameter 86 and 87",
      description:
        "Read parameter 86 and 87 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 17,
      apiIndex: 11,
      arbId: 33900224,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_88_AND_89: {
      name: "Read Parameter 88 and 89",
      description:
        "Read parameter 88 and 89 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 17,
      apiIndex: 12,
      arbId: 33900288,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_90_AND_91: {
      name: "Read Parameter 90 and 91",
      description:
        "Read parameter 90 and 91 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 17,
      apiIndex: 13,
      arbId: 33900352,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_92_AND_93: {
      name: "Read Parameter 92 and 93",
      description:
        "Read parameter 92 and 93 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 17,
      apiIndex: 14,
      arbId: 33900416,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_94_AND_95: {
      name: "Read Parameter 94 and 95",
      description:
        "Read parameter 94 and 95 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 17,
      apiIndex: 15,
      arbId: 33900480,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_96_AND_97: {
      name: "Read Parameter 96 and 97",
      description:
        "Read parameter 96 and 97 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 18,
      apiIndex: 0,
      arbId: 33900544,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_98_AND_99: {
      name: "Read Parameter 98 and 99",
      description:
        "Read parameter 98 and 99 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 18,
      apiIndex: 1,
      arbId: 33900608,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_100_AND_101: {
      name: "Read Parameter 100 and 101",
      description:
        "Read parameter 100 and 101 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 18,
      apiIndex: 2,
      arbId: 33900672,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_102_AND_103: {
      name: "Read Parameter 102 and 103",
      description:
        "Read parameter 102 and 103 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 18,
      apiIndex: 3,
      arbId: 33900736,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_104_AND_105: {
      name: "Read Parameter 104 and 105",
      description:
        "Read parameter 104 and 105 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 18,
      apiIndex: 4,
      arbId: 33900800,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_106_AND_107: {
      name: "Read Parameter 106 and 107",
      description:
        "Read parameter 106 and 107 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 18,
      apiIndex: 5,
      arbId: 33900864,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_108_AND_109: {
      name: "Read Parameter 108 and 109",
      description:
        "Read parameter 108 and 109 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 18,
      apiIndex: 6,
      arbId: 33900928,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_110_AND_111: {
      name: "Read Parameter 110 and 111",
      description:
        "Read parameter 110 and 111 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 18,
      apiIndex: 7,
      arbId: 33900992,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_112_AND_113: {
      name: "Read Parameter 112 and 113",
      description:
        "Read parameter 112 and 113 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 18,
      apiIndex: 8,
      arbId: 33901056,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_114_AND_115: {
      name: "Read Parameter 114 and 115",
      description:
        "Read parameter 114 and 115 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 18,
      apiIndex: 9,
      arbId: 33901120,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_116_AND_117: {
      name: "Read Parameter 116 and 117",
      description:
        "Read parameter 116 and 117 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 18,
      apiIndex: 10,
      arbId: 33901184,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_118_AND_119: {
      name: "Read Parameter 118 and 119",
      description:
        "Read parameter 118 and 119 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 18,
      apiIndex: 11,
      arbId: 33901248,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_120_AND_121: {
      name: "Read Parameter 120 and 121",
      description:
        "Read parameter 120 and 121 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 18,
      apiIndex: 12,
      arbId: 33901312,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_122_AND_123: {
      name: "Read Parameter 122 and 123",
      description:
        "Read parameter 122 and 123 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 18,
      apiIndex: 13,
      arbId: 33901376,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_124_AND_125: {
      name: "Read Parameter 124 and 125",
      description:
        "Read parameter 124 and 125 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 18,
      apiIndex: 14,
      arbId: 33901440,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_126_AND_127: {
      name: "Read Parameter 126 and 127",
      description:
        "Read parameter 126 and 127 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 18,
      apiIndex: 15,
      arbId: 33901504,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_128_AND_129: {
      name: "Read Parameter 128 and 129",
      description:
        "Read parameter 128 and 129 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 19,
      apiIndex: 0,
      arbId: 33901568,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_130_AND_131: {
      name: "Read Parameter 130 and 131",
      description:
        "Read parameter 130 and 131 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 19,
      apiIndex: 1,
      arbId: 33901632,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_132_AND_133: {
      name: "Read Parameter 132 and 133",
      description:
        "Read parameter 132 and 133 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 19,
      apiIndex: 2,
      arbId: 33901696,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_134_AND_135: {
      name: "Read Parameter 134 and 135",
      description:
        "Read parameter 134 and 135 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 19,
      apiIndex: 3,
      arbId: 33901760,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_136_AND_137: {
      name: "Read Parameter 136 and 137",
      description:
        "Read parameter 136 and 137 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 19,
      apiIndex: 4,
      arbId: 33901824,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_138_AND_139: {
      name: "Read Parameter 138 and 139",
      description:
        "Read parameter 138 and 139 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 19,
      apiIndex: 5,
      arbId: 33901888,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_140_AND_141: {
      name: "Read Parameter 140 and 141",
      description:
        "Read parameter 140 and 141 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 19,
      apiIndex: 6,
      arbId: 33901952,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_142_AND_143: {
      name: "Read Parameter 142 and 143",
      description:
        "Read parameter 142 and 143 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 19,
      apiIndex: 7,
      arbId: 33902016,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_144_AND_145: {
      name: "Read Parameter 144 and 145",
      description:
        "Read parameter 144 and 145 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 19,
      apiIndex: 8,
      arbId: 33902080,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_146_AND_147: {
      name: "Read Parameter 146 and 147",
      description:
        "Read parameter 146 and 147 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 19,
      apiIndex: 9,
      arbId: 33902144,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_148_AND_149: {
      name: "Read Parameter 148 and 149",
      description:
        "Read parameter 148 and 149 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 19,
      apiIndex: 10,
      arbId: 33902208,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_150_AND_151: {
      name: "Read Parameter 150 and 151",
      description:
        "Read parameter 150 and 151 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 19,
      apiIndex: 11,
      arbId: 33902272,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_152_AND_153: {
      name: "Read Parameter 152 and 153",
      description:
        "Read parameter 152 and 153 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 19,
      apiIndex: 12,
      arbId: 33902336,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_154_AND_155: {
      name: "Read Parameter 154 and 155",
      description:
        "Read parameter 154 and 155 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 19,
      apiIndex: 13,
      arbId: 33902400,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_156_AND_157: {
      name: "Read Parameter 156 and 157",
      description:
        "Read parameter 156 and 157 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 19,
      apiIndex: 14,
      arbId: 33902464,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_158_AND_159: {
      name: "Read Parameter 158 and 159",
      description:
        "Read parameter 158 and 159 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 19,
      apiIndex: 15,
      arbId: 33902528,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_160_AND_161: {
      name: "Read Parameter 160 and 161",
      description:
        "Read parameter 160 and 161 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 20,
      apiIndex: 0,
      arbId: 33902592,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_162_AND_163: {
      name: "Read Parameter 162 and 163",
      description:
        "Read parameter 162 and 163 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 20,
      apiIndex: 1,
      arbId: 33902656,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_164_AND_165: {
      name: "Read Parameter 164 and 165",
      description:
        "Read parameter 164 and 165 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 20,
      apiIndex: 2,
      arbId: 33902720,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_166_AND_167: {
      name: "Read Parameter 166 and 167",
      description:
        "Read parameter 166 and 167 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 20,
      apiIndex: 3,
      arbId: 33902784,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_168_AND_169: {
      name: "Read Parameter 168 and 169",
      description:
        "Read parameter 168 and 169 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 20,
      apiIndex: 4,
      arbId: 33902848,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_170_AND_171: {
      name: "Read Parameter 170 and 171",
      description:
        "Read parameter 170 and 171 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 20,
      apiIndex: 5,
      arbId: 33902912,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_172_AND_173: {
      name: "Read Parameter 172 and 173",
      description:
        "Read parameter 172 and 173 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 20,
      apiIndex: 6,
      arbId: 33902976,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_174_AND_175: {
      name: "Read Parameter 174 and 175",
      description:
        "Read parameter 174 and 175 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 20,
      apiIndex: 7,
      arbId: 33903040,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_176_AND_177: {
      name: "Read Parameter 176 and 177",
      description:
        "Read parameter 176 and 177 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 20,
      apiIndex: 8,
      arbId: 33903104,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_178_AND_179: {
      name: "Read Parameter 178 and 179",
      description:
        "Read parameter 178 and 179 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 20,
      apiIndex: 9,
      arbId: 33903168,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_180_AND_181: {
      name: "Read Parameter 180 and 181",
      description:
        "Read parameter 180 and 181 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 20,
      apiIndex: 10,
      arbId: 33903232,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_182_AND_183: {
      name: "Read Parameter 182 and 183",
      description:
        "Read parameter 182 and 183 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 20,
      apiIndex: 11,
      arbId: 33903296,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_184_AND_185: {
      name: "Read Parameter 184 and 185",
      description:
        "Read parameter 184 and 185 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 20,
      apiIndex: 12,
      arbId: 33903360,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_186_AND_187: {
      name: "Read Parameter 186 and 187",
      description:
        "Read parameter 186 and 187 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 20,
      apiIndex: 13,
      arbId: 33903424,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_188_AND_189: {
      name: "Read Parameter 188 and 189",
      description:
        "Read parameter 188 and 189 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 20,
      apiIndex: 14,
      arbId: 33903488,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_190_AND_191: {
      name: "Read Parameter 190 and 191",
      description:
        "Read parameter 190 and 191 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 20,
      apiIndex: 15,
      arbId: 33903552,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_192_AND_193: {
      name: "Read Parameter 192 and 193",
      description:
        "Read parameter 192 and 193 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 21,
      apiIndex: 0,
      arbId: 33903616,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_194_AND_195: {
      name: "Read Parameter 194 and 195",
      description:
        "Read parameter 194 and 195 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 21,
      apiIndex: 1,
      arbId: 33903680,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_196_AND_197: {
      name: "Read Parameter 196 and 197",
      description:
        "Read parameter 196 and 197 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 21,
      apiIndex: 2,
      arbId: 33903744,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_198_AND_199: {
      name: "Read Parameter 198 and 199",
      description:
        "Read parameter 198 and 199 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 21,
      apiIndex: 3,
      arbId: 33903808,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_200_AND_201: {
      name: "Read Parameter 200 and 201",
      description:
        "Read parameter 200 and 201 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 21,
      apiIndex: 4,
      arbId: 33903872,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_202_AND_203: {
      name: "Read Parameter 202 and 203",
      description:
        "Read parameter 202 and 203 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 21,
      apiIndex: 5,
      arbId: 33903936,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_204_AND_205: {
      name: "Read Parameter 204 and 205",
      description:
        "Read parameter 204 and 205 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 21,
      apiIndex: 6,
      arbId: 33904000,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_206_AND_207: {
      name: "Read Parameter 206 and 207",
      description:
        "Read parameter 206 and 207 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 21,
      apiIndex: 7,
      arbId: 33904064,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_208_AND_209: {
      name: "Read Parameter 208 and 209",
      description:
        "Read parameter 208 and 209 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 21,
      apiIndex: 8,
      arbId: 33904128,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_210_AND_211: {
      name: "Read Parameter 210 and 211",
      description:
        "Read parameter 210 and 211 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 21,
      apiIndex: 9,
      arbId: 33904192,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_212_AND_213: {
      name: "Read Parameter 212 and 213",
      description:
        "Read parameter 212 and 213 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 21,
      apiIndex: 10,
      arbId: 33904256,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_214_AND_215: {
      name: "Read Parameter 214 and 215",
      description:
        "Read parameter 214 and 215 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 21,
      apiIndex: 11,
      arbId: 33904320,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_216_AND_217: {
      name: "Read Parameter 216 and 217",
      description:
        "Read parameter 216 and 217 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 21,
      apiIndex: 12,
      arbId: 33904384,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_218_AND_219: {
      name: "Read Parameter 218 and 219",
      description:
        "Read parameter 218 and 219 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 21,
      apiIndex: 13,
      arbId: 33904448,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_220_AND_221: {
      name: "Read Parameter 220 and 221",
      description:
        "Read parameter 220 and 221 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 21,
      apiIndex: 14,
      arbId: 33904512,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_222_AND_223: {
      name: "Read Parameter 222 and 223",
      description:
        "Read parameter 222 and 223 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 21,
      apiIndex: 15,
      arbId: 33904576,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_224_AND_225: {
      name: "Read Parameter 224 and 225",
      description:
        "Read parameter 224 and 225 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 22,
      apiIndex: 0,
      arbId: 33904640,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_226_AND_227: {
      name: "Read Parameter 226 and 227",
      description:
        "Read parameter 226 and 227 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 22,
      apiIndex: 1,
      arbId: 33904704,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_228_AND_229: {
      name: "Read Parameter 228 and 229",
      description:
        "Read parameter 228 and 229 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 22,
      apiIndex: 2,
      arbId: 33904768,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_230_AND_231: {
      name: "Read Parameter 230 and 231",
      description:
        "Read parameter 230 and 231 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 22,
      apiIndex: 3,
      arbId: 33904832,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_232_AND_233: {
      name: "Read Parameter 232 and 233",
      description:
        "Read parameter 232 and 233 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 22,
      apiIndex: 4,
      arbId: 33904896,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_234_AND_235: {
      name: "Read Parameter 234 and 235",
      description:
        "Read parameter 234 and 235 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 22,
      apiIndex: 5,
      arbId: 33904960,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_236_AND_237: {
      name: "Read Parameter 236 and 237",
      description:
        "Read parameter 236 and 237 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 22,
      apiIndex: 6,
      arbId: 33905024,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_238_AND_239: {
      name: "Read Parameter 238 and 239",
      description:
        "Read parameter 238 and 239 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 22,
      apiIndex: 7,
      arbId: 33905088,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_240_AND_241: {
      name: "Read Parameter 240 and 241",
      description:
        "Read parameter 240 and 241 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 22,
      apiIndex: 8,
      arbId: 33905152,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_242_AND_243: {
      name: "Read Parameter 242 and 243",
      description:
        "Read parameter 242 and 243 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 22,
      apiIndex: 9,
      arbId: 33905216,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_244_AND_245: {
      name: "Read Parameter 244 and 245",
      description:
        "Read parameter 244 and 245 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 22,
      apiIndex: 10,
      arbId: 33905280,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_246_AND_247: {
      name: "Read Parameter 246 and 247",
      description:
        "Read parameter 246 and 247 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 22,
      apiIndex: 11,
      arbId: 33905344,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_248_AND_249: {
      name: "Read Parameter 248 and 249",
      description:
        "Read parameter 248 and 249 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 22,
      apiIndex: 12,
      arbId: 33905408,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_250_AND_251: {
      name: "Read Parameter 250 and 251",
      description:
        "Read parameter 250 and 251 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 22,
      apiIndex: 13,
      arbId: 33905472,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_252_AND_253: {
      name: "Read Parameter 252 and 253",
      description:
        "Read parameter 252 and 253 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 22,
      apiIndex: 14,
      arbId: 33905536,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    READ_PARAMETER_254_AND_255: {
      name: "Read Parameter 254 and 255",
      description:
        "Read parameter 254 and 255 at the same time. SPARK MAX does not currently support this in v25.0.0-prerelease.4.",
      apiClass: 22,
      apiIndex: 15,
      arbId: 33905600,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter reads",
      rtr: true as const
    },
    WRITE_PARAMETER_0_AND_1: {
      name: "Write Parameter 0 and 1",
      description:
        "Write Parameter 0 and 1 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 23,
      apiIndex: 0,
      arbId: 33905664,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_2_AND_3: {
      name: "Write Parameter 2 and 3",
      description:
        "Write Parameter 2 and 3 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 23,
      apiIndex: 1,
      arbId: 33905728,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_4_AND_5: {
      name: "Write Parameter 4 and 5",
      description:
        "Write Parameter 4 and 5 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 23,
      apiIndex: 2,
      arbId: 33905792,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_6_AND_7: {
      name: "Write Parameter 6 and 7",
      description:
        "Write Parameter 6 and 7 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 23,
      apiIndex: 3,
      arbId: 33905856,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_8_AND_9: {
      name: "Write Parameter 8 and 9",
      description:
        "Write Parameter 8 and 9 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 23,
      apiIndex: 4,
      arbId: 33905920,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_10_AND_11: {
      name: "Write Parameter 10 and 11",
      description:
        "Write Parameter 10 and 11 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 23,
      apiIndex: 5,
      arbId: 33905984,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_12_AND_13: {
      name: "Write Parameter 12 and 13",
      description:
        "Write Parameter 12 and 13 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 23,
      apiIndex: 6,
      arbId: 33906048,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_14_AND_15: {
      name: "Write Parameter 14 and 15",
      description:
        "Write Parameter 14 and 15 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 23,
      apiIndex: 7,
      arbId: 33906112,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_16_AND_17: {
      name: "Write Parameter 16 and 17",
      description:
        "Write Parameter 16 and 17 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 23,
      apiIndex: 8,
      arbId: 33906176,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_18_AND_19: {
      name: "Write Parameter 18 and 19",
      description:
        "Write Parameter 18 and 19 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 23,
      apiIndex: 9,
      arbId: 33906240,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_20_AND_21: {
      name: "Write Parameter 20 and 21",
      description:
        "Write Parameter 20 and 21 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 23,
      apiIndex: 10,
      arbId: 33906304,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_22_AND_23: {
      name: "Write Parameter 22 and 23",
      description:
        "Write Parameter 22 and 23 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 23,
      apiIndex: 11,
      arbId: 33906368,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_24_AND_25: {
      name: "Write Parameter 24 and 25",
      description:
        "Write Parameter 24 and 25 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 23,
      apiIndex: 12,
      arbId: 33906432,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_26_AND_27: {
      name: "Write Parameter 26 and 27",
      description:
        "Write Parameter 26 and 27 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 23,
      apiIndex: 13,
      arbId: 33906496,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_28_AND_29: {
      name: "Write Parameter 28 and 29",
      description:
        "Write Parameter 28 and 29 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 23,
      apiIndex: 14,
      arbId: 33906560,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_30_AND_31: {
      name: "Write Parameter 30 and 31",
      description:
        "Write Parameter 30 and 31 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 23,
      apiIndex: 15,
      arbId: 33906624,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_32_AND_33: {
      name: "Write Parameter 32 and 33",
      description:
        "Write Parameter 32 and 33 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 24,
      apiIndex: 0,
      arbId: 33906688,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_34_AND_35: {
      name: "Write Parameter 34 and 35",
      description:
        "Write Parameter 34 and 35 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 24,
      apiIndex: 1,
      arbId: 33906752,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_36_AND_37: {
      name: "Write Parameter 36 and 37",
      description:
        "Write Parameter 36 and 37 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 24,
      apiIndex: 2,
      arbId: 33906816,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_38_AND_39: {
      name: "Write Parameter 38 and 39",
      description:
        "Write Parameter 38 and 39 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 24,
      apiIndex: 3,
      arbId: 33906880,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_40_AND_41: {
      name: "Write Parameter 40 and 41",
      description:
        "Write Parameter 40 and 41 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 24,
      apiIndex: 4,
      arbId: 33906944,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_42_AND_43: {
      name: "Write Parameter 42 and 43",
      description:
        "Write Parameter 42 and 43 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 24,
      apiIndex: 5,
      arbId: 33907008,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_44_AND_45: {
      name: "Write Parameter 44 and 45",
      description:
        "Write Parameter 44 and 45 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 24,
      apiIndex: 6,
      arbId: 33907072,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_46_AND_47: {
      name: "Write Parameter 46 and 47",
      description:
        "Write Parameter 46 and 47 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 24,
      apiIndex: 7,
      arbId: 33907136,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_48_AND_49: {
      name: "Write Parameter 48 and 49",
      description:
        "Write Parameter 48 and 49 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 24,
      apiIndex: 8,
      arbId: 33907200,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_50_AND_51: {
      name: "Write Parameter 50 and 51",
      description:
        "Write Parameter 50 and 51 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 24,
      apiIndex: 9,
      arbId: 33907264,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_52_AND_53: {
      name: "Write Parameter 52 and 53",
      description:
        "Write Parameter 52 and 53 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 24,
      apiIndex: 10,
      arbId: 33907328,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_54_AND_55: {
      name: "Write Parameter 54 and 55",
      description:
        "Write Parameter 54 and 55 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 24,
      apiIndex: 11,
      arbId: 33907392,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_56_AND_57: {
      name: "Write Parameter 56 and 57",
      description:
        "Write Parameter 56 and 57 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 24,
      apiIndex: 12,
      arbId: 33907456,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_58_AND_59: {
      name: "Write Parameter 58 and 59",
      description:
        "Write Parameter 58 and 59 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 24,
      apiIndex: 13,
      arbId: 33907520,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_60_AND_61: {
      name: "Write Parameter 60 and 61",
      description:
        "Write Parameter 60 and 61 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 24,
      apiIndex: 14,
      arbId: 33907584,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_62_AND_63: {
      name: "Write Parameter 62 and 63",
      description:
        "Write Parameter 62 and 63 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 24,
      apiIndex: 15,
      arbId: 33907648,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_64_AND_65: {
      name: "Write Parameter 64 and 65",
      description:
        "Write Parameter 64 and 65 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 25,
      apiIndex: 0,
      arbId: 33907712,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_66_AND_67: {
      name: "Write Parameter 66 and 67",
      description:
        "Write Parameter 66 and 67 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 25,
      apiIndex: 1,
      arbId: 33907776,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_68_AND_69: {
      name: "Write Parameter 68 and 69",
      description:
        "Write Parameter 68 and 69 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 25,
      apiIndex: 2,
      arbId: 33907840,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_70_AND_71: {
      name: "Write Parameter 70 and 71",
      description:
        "Write Parameter 70 and 71 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 25,
      apiIndex: 3,
      arbId: 33907904,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_72_AND_73: {
      name: "Write Parameter 72 and 73",
      description:
        "Write Parameter 72 and 73 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 25,
      apiIndex: 4,
      arbId: 33907968,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_74_AND_75: {
      name: "Write Parameter 74 and 75",
      description:
        "Write Parameter 74 and 75 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 25,
      apiIndex: 5,
      arbId: 33908032,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_76_AND_77: {
      name: "Write Parameter 76 and 77",
      description:
        "Write Parameter 76 and 77 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 25,
      apiIndex: 6,
      arbId: 33908096,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_78_AND_79: {
      name: "Write Parameter 78 and 79",
      description:
        "Write Parameter 78 and 79 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 25,
      apiIndex: 7,
      arbId: 33908160,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_80_AND_81: {
      name: "Write Parameter 80 and 81",
      description:
        "Write Parameter 80 and 81 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 25,
      apiIndex: 8,
      arbId: 33908224,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_82_AND_83: {
      name: "Write Parameter 82 and 83",
      description:
        "Write Parameter 82 and 83 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 25,
      apiIndex: 9,
      arbId: 33908288,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_84_AND_85: {
      name: "Write Parameter 84 and 85",
      description:
        "Write Parameter 84 and 85 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 25,
      apiIndex: 10,
      arbId: 33908352,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_86_AND_87: {
      name: "Write Parameter 86 and 87",
      description:
        "Write Parameter 86 and 87 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 25,
      apiIndex: 11,
      arbId: 33908416,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_88_AND_89: {
      name: "Write Parameter 88 and 89",
      description:
        "Write Parameter 88 and 89 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 25,
      apiIndex: 12,
      arbId: 33908480,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_90_AND_91: {
      name: "Write Parameter 90 and 91",
      description:
        "Write Parameter 90 and 91 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 25,
      apiIndex: 13,
      arbId: 33908544,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_92_AND_93: {
      name: "Write Parameter 92 and 93",
      description:
        "Write Parameter 92 and 93 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 25,
      apiIndex: 14,
      arbId: 33908608,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_94_AND_95: {
      name: "Write Parameter 94 and 95",
      description:
        "Write Parameter 94 and 95 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 25,
      apiIndex: 15,
      arbId: 33908672,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_96_AND_97: {
      name: "Write Parameter 96 and 97",
      description:
        "Write Parameter 96 and 97 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 26,
      apiIndex: 0,
      arbId: 33908736,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_98_AND_99: {
      name: "Write Parameter 98 and 99",
      description:
        "Write Parameter 98 and 99 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 26,
      apiIndex: 1,
      arbId: 33908800,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_100_AND_101: {
      name: "Write Parameter 100 and 101",
      description:
        "Write Parameter 100 and 101 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 26,
      apiIndex: 2,
      arbId: 33908864,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_102_AND_103: {
      name: "Write Parameter 102 and 103",
      description:
        "Write Parameter 102 and 103 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 26,
      apiIndex: 3,
      arbId: 33908928,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_104_AND_105: {
      name: "Write Parameter 104 and 105",
      description:
        "Write Parameter 104 and 105 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 26,
      apiIndex: 4,
      arbId: 33908992,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_106_AND_107: {
      name: "Write Parameter 106 and 107",
      description:
        "Write Parameter 106 and 107 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 26,
      apiIndex: 5,
      arbId: 33909056,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_108_AND_109: {
      name: "Write Parameter 108 and 109",
      description:
        "Write Parameter 108 and 109 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 26,
      apiIndex: 6,
      arbId: 33909120,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_110_AND_111: {
      name: "Write Parameter 110 and 111",
      description:
        "Write Parameter 110 and 111 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 26,
      apiIndex: 7,
      arbId: 33909184,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_112_AND_113: {
      name: "Write Parameter 112 and 113",
      description:
        "Write Parameter 112 and 113 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 26,
      apiIndex: 8,
      arbId: 33909248,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_114_AND_115: {
      name: "Write Parameter 114 and 115",
      description:
        "Write Parameter 114 and 115 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 26,
      apiIndex: 9,
      arbId: 33909312,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_116_AND_117: {
      name: "Write Parameter 116 and 117",
      description:
        "Write Parameter 116 and 117 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 26,
      apiIndex: 10,
      arbId: 33909376,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_118_AND_119: {
      name: "Write Parameter 118 and 119",
      description:
        "Write Parameter 118 and 119 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 26,
      apiIndex: 11,
      arbId: 33909440,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_120_AND_121: {
      name: "Write Parameter 120 and 121",
      description:
        "Write Parameter 120 and 121 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 26,
      apiIndex: 12,
      arbId: 33909504,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_122_AND_123: {
      name: "Write Parameter 122 and 123",
      description:
        "Write Parameter 122 and 123 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 26,
      apiIndex: 13,
      arbId: 33909568,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_124_AND_125: {
      name: "Write Parameter 124 and 125",
      description:
        "Write Parameter 124 and 125 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 26,
      apiIndex: 14,
      arbId: 33909632,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_126_AND_127: {
      name: "Write Parameter 126 and 127",
      description:
        "Write Parameter 126 and 127 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 26,
      apiIndex: 15,
      arbId: 33909696,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_128_AND_129: {
      name: "Write Parameter 128 and 129",
      description:
        "Write Parameter 128 and 129 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 27,
      apiIndex: 0,
      arbId: 33909760,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_130_AND_131: {
      name: "Write Parameter 130 and 131",
      description:
        "Write Parameter 130 and 131 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 27,
      apiIndex: 1,
      arbId: 33909824,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_132_AND_133: {
      name: "Write Parameter 132 and 133",
      description:
        "Write Parameter 132 and 133 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 27,
      apiIndex: 2,
      arbId: 33909888,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_134_AND_135: {
      name: "Write Parameter 134 and 135",
      description:
        "Write Parameter 134 and 135 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 27,
      apiIndex: 3,
      arbId: 33909952,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_136_AND_137: {
      name: "Write Parameter 136 and 137",
      description:
        "Write Parameter 136 and 137 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 27,
      apiIndex: 4,
      arbId: 33910016,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_138_AND_139: {
      name: "Write Parameter 138 and 139",
      description:
        "Write Parameter 138 and 139 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 27,
      apiIndex: 5,
      arbId: 33910080,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_140_AND_141: {
      name: "Write Parameter 140 and 141",
      description:
        "Write Parameter 140 and 141 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 27,
      apiIndex: 6,
      arbId: 33910144,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_142_AND_143: {
      name: "Write Parameter 142 and 143",
      description:
        "Write Parameter 142 and 143 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 27,
      apiIndex: 7,
      arbId: 33910208,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_144_AND_145: {
      name: "Write Parameter 144 and 145",
      description:
        "Write Parameter 144 and 145 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 27,
      apiIndex: 8,
      arbId: 33910272,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_146_AND_147: {
      name: "Write Parameter 146 and 147",
      description:
        "Write Parameter 146 and 147 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 27,
      apiIndex: 9,
      arbId: 33910336,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_148_AND_149: {
      name: "Write Parameter 148 and 149",
      description:
        "Write Parameter 148 and 149 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 27,
      apiIndex: 10,
      arbId: 33910400,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_150_AND_151: {
      name: "Write Parameter 150 and 151",
      description:
        "Write Parameter 150 and 151 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 27,
      apiIndex: 11,
      arbId: 33910464,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_152_AND_153: {
      name: "Write Parameter 152 and 153",
      description:
        "Write Parameter 152 and 153 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 27,
      apiIndex: 12,
      arbId: 33910528,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_154_AND_155: {
      name: "Write Parameter 154 and 155",
      description:
        "Write Parameter 154 and 155 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 27,
      apiIndex: 13,
      arbId: 33910592,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_156_AND_157: {
      name: "Write Parameter 156 and 157",
      description:
        "Write Parameter 156 and 157 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 27,
      apiIndex: 14,
      arbId: 33910656,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_158_AND_159: {
      name: "Write Parameter 158 and 159",
      description:
        "Write Parameter 158 and 159 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 27,
      apiIndex: 15,
      arbId: 33910720,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_160_AND_161: {
      name: "Write Parameter 160 and 161",
      description:
        "Write Parameter 160 and 161 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 28,
      apiIndex: 0,
      arbId: 33910784,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_162_AND_163: {
      name: "Write Parameter 162 and 163",
      description:
        "Write Parameter 162 and 163 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 28,
      apiIndex: 1,
      arbId: 33910848,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_164_AND_165: {
      name: "Write Parameter 164 and 165",
      description:
        "Write Parameter 164 and 165 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 28,
      apiIndex: 2,
      arbId: 33910912,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_166_AND_167: {
      name: "Write Parameter 166 and 167",
      description:
        "Write Parameter 166 and 167 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 28,
      apiIndex: 3,
      arbId: 33910976,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_168_AND_169: {
      name: "Write Parameter 168 and 169",
      description:
        "Write Parameter 168 and 169 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 28,
      apiIndex: 4,
      arbId: 33911040,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_170_AND_171: {
      name: "Write Parameter 170 and 171",
      description:
        "Write Parameter 170 and 171 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 28,
      apiIndex: 5,
      arbId: 33911104,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_172_AND_173: {
      name: "Write Parameter 172 and 173",
      description:
        "Write Parameter 172 and 173 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 28,
      apiIndex: 6,
      arbId: 33911168,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_174_AND_175: {
      name: "Write Parameter 174 and 175",
      description:
        "Write Parameter 174 and 175 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 28,
      apiIndex: 7,
      arbId: 33911232,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_176_AND_177: {
      name: "Write Parameter 176 and 177",
      description:
        "Write Parameter 176 and 177 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 28,
      apiIndex: 8,
      arbId: 33911296,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_178_AND_179: {
      name: "Write Parameter 178 and 179",
      description:
        "Write Parameter 178 and 179 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 28,
      apiIndex: 9,
      arbId: 33911360,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_180_AND_181: {
      name: "Write Parameter 180 and 181",
      description:
        "Write Parameter 180 and 181 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 28,
      apiIndex: 10,
      arbId: 33911424,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_182_AND_183: {
      name: "Write Parameter 182 and 183",
      description:
        "Write Parameter 182 and 183 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 28,
      apiIndex: 11,
      arbId: 33911488,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_184_AND_185: {
      name: "Write Parameter 184 and 185",
      description:
        "Write Parameter 184 and 185 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 28,
      apiIndex: 12,
      arbId: 33911552,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_186_AND_187: {
      name: "Write Parameter 186 and 187",
      description:
        "Write Parameter 186 and 187 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 28,
      apiIndex: 13,
      arbId: 33911616,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_188_AND_189: {
      name: "Write Parameter 188 and 189",
      description:
        "Write Parameter 188 and 189 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 28,
      apiIndex: 14,
      arbId: 33911680,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_190_AND_191: {
      name: "Write Parameter 190 and 191",
      description:
        "Write Parameter 190 and 191 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 28,
      apiIndex: 15,
      arbId: 33911744,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_192_AND_193: {
      name: "Write Parameter 192 and 193",
      description:
        "Write Parameter 192 and 193 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 29,
      apiIndex: 0,
      arbId: 33911808,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_194_AND_195: {
      name: "Write Parameter 194 and 195",
      description:
        "Write Parameter 194 and 195 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 29,
      apiIndex: 1,
      arbId: 33911872,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_196_AND_197: {
      name: "Write Parameter 196 and 197",
      description:
        "Write Parameter 196 and 197 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 29,
      apiIndex: 2,
      arbId: 33911936,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_198_AND_199: {
      name: "Write Parameter 198 and 199",
      description:
        "Write Parameter 198 and 199 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 29,
      apiIndex: 3,
      arbId: 33912000,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_200_AND_201: {
      name: "Write Parameter 200 and 201",
      description:
        "Write Parameter 200 and 201 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 29,
      apiIndex: 4,
      arbId: 33912064,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_202_AND_203: {
      name: "Write Parameter 202 and 203",
      description:
        "Write Parameter 202 and 203 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 29,
      apiIndex: 5,
      arbId: 33912128,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_204_AND_205: {
      name: "Write Parameter 204 and 205",
      description:
        "Write Parameter 204 and 205 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 29,
      apiIndex: 6,
      arbId: 33912192,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_206_AND_207: {
      name: "Write Parameter 206 and 207",
      description:
        "Write Parameter 206 and 207 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 29,
      apiIndex: 7,
      arbId: 33912256,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_208_AND_209: {
      name: "Write Parameter 208 and 209",
      description:
        "Write Parameter 208 and 209 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 29,
      apiIndex: 8,
      arbId: 33912320,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_210_AND_211: {
      name: "Write Parameter 210 and 211",
      description:
        "Write Parameter 210 and 211 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 29,
      apiIndex: 9,
      arbId: 33912384,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_212_AND_213: {
      name: "Write Parameter 212 and 213",
      description:
        "Write Parameter 212 and 213 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 29,
      apiIndex: 10,
      arbId: 33912448,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_214_AND_215: {
      name: "Write Parameter 214 and 215",
      description:
        "Write Parameter 214 and 215 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 29,
      apiIndex: 11,
      arbId: 33912512,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_216_AND_217: {
      name: "Write Parameter 216 and 217",
      description:
        "Write Parameter 216 and 217 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 29,
      apiIndex: 12,
      arbId: 33912576,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_218_AND_219: {
      name: "Write Parameter 218 and 219",
      description:
        "Write Parameter 218 and 219 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 29,
      apiIndex: 13,
      arbId: 33912640,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_220_AND_221: {
      name: "Write Parameter 220 and 221",
      description:
        "Write Parameter 220 and 221 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 29,
      apiIndex: 14,
      arbId: 33912704,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_222_AND_223: {
      name: "Write Parameter 222 and 223",
      description:
        "Write Parameter 222 and 223 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 29,
      apiIndex: 15,
      arbId: 33912768,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_224_AND_225: {
      name: "Write Parameter 224 and 225",
      description:
        "Write Parameter 224 and 225 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 30,
      apiIndex: 0,
      arbId: 33912832,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_226_AND_227: {
      name: "Write Parameter 226 and 227",
      description:
        "Write Parameter 226 and 227 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 30,
      apiIndex: 1,
      arbId: 33912896,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_228_AND_229: {
      name: "Write Parameter 228 and 229",
      description:
        "Write Parameter 228 and 229 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 30,
      apiIndex: 2,
      arbId: 33912960,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_230_AND_231: {
      name: "Write Parameter 230 and 231",
      description:
        "Write Parameter 230 and 231 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 30,
      apiIndex: 3,
      arbId: 33913024,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_232_AND_233: {
      name: "Write Parameter 232 and 233",
      description:
        "Write Parameter 232 and 233 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 30,
      apiIndex: 4,
      arbId: 33913088,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_234_AND_235: {
      name: "Write Parameter 234 and 235",
      description:
        "Write Parameter 234 and 235 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 30,
      apiIndex: 5,
      arbId: 33913152,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_236_AND_237: {
      name: "Write Parameter 236 and 237",
      description:
        "Write Parameter 236 and 237 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 30,
      apiIndex: 6,
      arbId: 33913216,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_238_AND_239: {
      name: "Write Parameter 238 and 239",
      description:
        "Write Parameter 238 and 239 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 30,
      apiIndex: 7,
      arbId: 33913280,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_240_AND_241: {
      name: "Write Parameter 240 and 241",
      description:
        "Write Parameter 240 and 241 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 30,
      apiIndex: 8,
      arbId: 33913344,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_242_AND_243: {
      name: "Write Parameter 242 and 243",
      description:
        "Write Parameter 242 and 243 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 30,
      apiIndex: 9,
      arbId: 33913408,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_244_AND_245: {
      name: "Write Parameter 244 and 245",
      description:
        "Write Parameter 244 and 245 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 30,
      apiIndex: 10,
      arbId: 33913472,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_246_AND_247: {
      name: "Write Parameter 246 and 247",
      description:
        "Write Parameter 246 and 247 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 30,
      apiIndex: 11,
      arbId: 33913536,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_248_AND_249: {
      name: "Write Parameter 248 and 249",
      description:
        "Write Parameter 248 and 249 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 30,
      apiIndex: 12,
      arbId: 33913600,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_250_AND_251: {
      name: "Write Parameter 250 and 251",
      description:
        "Write Parameter 250 and 251 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 30,
      apiIndex: 13,
      arbId: 33913664,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_252_AND_253: {
      name: "Write Parameter 252 and 253",
      description:
        "Write Parameter 252 and 253 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 30,
      apiIndex: 14,
      arbId: 33913728,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    WRITE_PARAMETER_254_AND_255: {
      name: "Write Parameter 254 and 255",
      description:
        "Write Parameter 254 and 255 at the same time. Two Write Parameter Response frames will be sent in response.",
      apiClass: 30,
      apiIndex: 15,
      arbId: 33913792,
      lengthBytes: 8,
      signals: {
        FIRST_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "First Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        },
        SECOND_PARAMETER_VALUE: {
          type: "uint" as const,
          name: "Second Parameter Value",
          description: "The actual type of this data depends on the Parameter Type of the parameter in question.",
          bitPosition: 32,
          isBigEndian: false,
          lengthBits: 32,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("4294967295")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      frameRangeName: "Dual-parameter writes",
      rtr: false as const
    },
    START_FOLLOWER_MODE: {
      name: "Start Follower Mode",
      description:
        "Starts follower mode. The relevant parameters must already be configured. In response, a Start Follower Mode Response frame will be sent. Follower mode will be auto-started on boot if the Follower Mode Leader ID parameter is set to a non-zero value.",
      apiClass: 31,
      apiIndex: 0,
      arbId: 33913856,
      lengthBytes: 0,
      signals: {},
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: false as const
    },
    START_FOLLOWER_MODE_RESPONSE: {
      name: "Start Follower Mode Response",
      description: "Response for a Start Follower Mode command.",
      apiClass: 31,
      apiIndex: 1,
      arbId: 33913920,
      lengthBytes: 1,
      signals: {
        RESULT_CODE: {
          type: "uint" as const,
          name: "Result Code",
          description: "0 for success. 1 for invalid parameters",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 8,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          encodedMin: BigNumber("0"),
          encodedMax: BigNumber("255")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: false as const
    },
    STOP_FOLLOWER_MODE: {
      name: "Stop Follower Mode",
      description:
        "Exits follower mode and causes the device to resume listening for setpoints addressed directly to it. In response, a Stop Follower Mode Response frame will be sent.",
      apiClass: 31,
      apiIndex: 2,
      arbId: 33913984,
      lengthBytes: 0,
      signals: {},
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: false as const
    },
    STOP_FOLLOWER_MODE_RESPONSE: {
      name: "Stop Follower Mode Response",
      description: "Response for a Stop Follower Mode Command.",
      apiClass: 31,
      apiIndex: 3,
      arbId: 33914048,
      lengthBytes: 0,
      signals: {},
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: false as const
    },
    ENTER_SWDL_CAN_BOOTLOADER: {
      name: "Enter SWDL CAN Bootloader",
      apiClass: 31,
      apiIndex: 15,
      arbId: 33914816,
      lengthBytes: 0,
      signals: {},
      versionImplemented: "1.2.0",
      broadcast: false,
      rtr: false as const
    },
    PERSIST_PARAMETERS: {
      name: "Persist Parameters",
      description:
        "Causes all parameters to be written to non-volatile storage. After the operation (which may take up to a second) completes, a Persist Parameters Response frame will be sent.",
      apiClass: 63,
      apiIndex: 15,
      arbId: 33947584,
      lengthBytes: 2,
      signals: {
        MAGIC_NUMBER: {
          type: "uint" as const,
          name: "Magic Number",
          bitPosition: 0,
          isBigEndian: false,
          lengthBits: 16,
          decodeScaleFactor: BigNumber("1"),
          offset: BigNumber("0"),
          decodedMin: BigNumber("15011"),
          decodedMax: BigNumber("15011"),
          encodedMin: BigNumber("15011"),
          encodedMax: BigNumber("15011")
        }
      },
      versionImplemented: "25.0.0",
      broadcast: false,
      rtr: false as const
    }
  }
};
